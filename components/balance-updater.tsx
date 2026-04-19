"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface BalanceUpdaterProps {
  userId: string;
}

/**
 * Balance Updater Component
 * 
 * Listens to real-time changes in the user's balance and refreshes the page
 * when the balance changes. This ensures the balance indicator stays in sync
 * with postback credits from offerwalls.
 */
export default function BalanceUpdater({ userId }: BalanceUpdaterProps) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    // Subscribe to changes in the users table for this specific user
    const channel = supabase
      .channel(`balance-updates-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          console.log('[BalanceUpdater] Balance changed:', payload);
          // Refresh the page to get the new balance
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, router]);

  return null; // This component doesn't render anything
}
