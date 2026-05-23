-- Create email_otps table for email verification OTP
create table if not exists public.email_otps (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references public.users (id) on delete cascade,
  otp        text        not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index idx_email_otps_user_id on public.email_otps (user_id);
