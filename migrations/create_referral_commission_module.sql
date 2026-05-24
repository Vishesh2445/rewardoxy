-- 10-Level Referral Commission Module
-- referral_ancestors: pre-computed ancestor tree (max 10 levels)
-- commission_queue: async queue for background commission processing

-- 1. referral_ancestors — stores up to 10 ancestors per user
CREATE TABLE IF NOT EXISTS public.referral_ancestors (
  user_id   uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  ancestor_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  depth     int NOT NULL CHECK (depth BETWEEN 1 AND 10),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, depth)
);

CREATE INDEX idx_referral_ancestors_ancestor ON public.referral_ancestors(ancestor_id);
CREATE INDEX idx_referral_ancestors_user ON public.referral_ancestors(user_id);

-- 2. commission_queue — async queue for commission credits
CREATE TABLE IF NOT EXISTS public.commission_queue (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  earner_id   uuid NOT NULL,
  ancestor_id uuid NOT NULL,
  depth       int NOT NULL,
  source_amount int NOT NULL,
  commission  int NOT NULL,
  source      text NOT NULL DEFAULT 'postback',
  status      text NOT NULL DEFAULT 'pending',
  created_at  timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);

CREATE INDEX idx_commission_queue_status ON public.commission_queue(status) WHERE status = 'pending';
CREATE INDEX idx_commission_queue_ancestor ON public.commission_queue(ancestor_id);

-- 3. RLS policies
ALTER TABLE public.referral_ancestors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_queue ENABLE ROW LEVEL SECURITY;

-- Service role can do everything, users can read their own ancestors
CREATE POLICY "Users can read own ancestors" ON public.referral_ancestors
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = ancestor_id);

CREATE POLICY "Service role full access ancestors" ON public.referral_ancestors
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access commission" ON public.commission_queue
  FOR ALL USING (auth.role() = 'service_role');

-- 4. Function to populate ancestors when a user registers with a referrer
CREATE OR REPLACE FUNCTION public.populate_referral_ancestors(p_user_id uuid, p_referrer_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Level 1: direct referrer
  INSERT INTO public.referral_ancestors (user_id, ancestor_id, depth)
  VALUES (p_user_id, p_referrer_id, 1)
  ON CONFLICT DO NOTHING;

  -- Levels 2-10: copy referrer's ancestors, incrementing depth
  INSERT INTO public.referral_ancestors (user_id, ancestor_id, depth)
  SELECT p_user_id, ra.ancestor_id, ra.depth + 1
  FROM public.referral_ancestors ra
  WHERE ra.user_id = p_referrer_id AND ra.depth <= 9
  ON CONFLICT DO NOTHING;
END;
$$;

-- 5. Function to enqueue commissions for all ancestors of an earner
CREATE OR REPLACE FUNCTION public.enqueue_commissions(p_earner_id uuid, p_amount int, p_source text DEFAULT 'postback')
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  commission_rates int[] := ARRAY[50, 20, 10, 5, 3, 2, 1, 1, 1, 1]; -- per-mille (÷1000)
  r RECORD;
BEGIN
  FOR r IN
    SELECT ancestor_id, depth FROM public.referral_ancestors
    WHERE user_id = p_earner_id
    ORDER BY depth
  LOOP
    INSERT INTO public.commission_queue (earner_id, ancestor_id, depth, source_amount, commission, source)
    VALUES (
      p_earner_id,
      r.ancestor_id,
      r.depth,
      p_amount,
      GREATEST(1, (p_amount * commission_rates[r.depth]) / 1000),
      p_source
    );
  END LOOP;
END;
$$;

-- 6. Function to process pending commissions (called by background job)
CREATE OR REPLACE FUNCTION public.process_commission_queue(p_batch_size int DEFAULT 100)
RETURNS int LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  processed int := 0;
  r RECORD;
BEGIN
  FOR r IN
    SELECT id, ancestor_id, commission
    FROM public.commission_queue
    WHERE status = 'pending'
    ORDER BY created_at
    LIMIT p_batch_size
    FOR UPDATE SKIP LOCKED
  LOOP
    -- Credit to pending_referral_earnings
    UPDATE public.users
    SET pending_referral_earnings = COALESCE(pending_referral_earnings, 0) + r.commission
    WHERE id = r.ancestor_id;

    -- Mark as processed
    UPDATE public.commission_queue
    SET status = 'processed', processed_at = now()
    WHERE id = r.id;

    processed := processed + 1;
  END LOOP;

  RETURN processed;
END;
$$;
