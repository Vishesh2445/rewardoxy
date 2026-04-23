"use client";

import { useState, useEffect } from "react";
import { Box } from "@mui/material";
import { createClient } from "@/lib/supabase/client";
import Typography from "@/components/ui/Typography";

interface BalanceDisplayProps {
  userId: string;
  initialBalance?: number;
}

/**
 * Balance Display Component
 * 
 * Displays the user's current coin balance with real-time updates.
 * Fetches the balance from the database and subscribes to changes.
 */
export default function BalanceDisplay({ userId, initialBalance = 0 }: BalanceDisplayProps) {
  const [balance, setBalance] = useState(initialBalance);

  useEffect(() => {
    const supabase = createClient();

    // Fetch current balance immediately
    async function fetchBalance() {
      const { data } = await supabase
        .from('users')
        .select('coins_balance')
        .eq('id', userId)
        .single();

      if (data) {
        setBalance(data.coins_balance ?? 0);
      }
    }

    fetchBalance();

    // Subscribe to real-time balance updates
    const channel = supabase
      .channel(`balance-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          const newBalance = (payload.new as any)?.coins_balance;
          if (newBalance !== undefined) {
            setBalance(newBalance);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.25,
        bgcolor: "rgba(1, 214, 118, 0.1)",
        border: "1px solid rgba(1, 214, 118, 0.2)",
        borderRadius: 2,
        px: { xs: 1.5, sm: 2 },
        py: 0.75,
      }}
    >
      <Typography 
        component="span"
        sx={{ 
          fontSize: { xs: "0.875rem", sm: "1rem" }, 
          fontWeight: 700, 
          color: "#01D676" 
        }}
      >
        $
      </Typography>
      <Typography 
        component="span"
        sx={{ 
          fontSize: { xs: "0.875rem", sm: "1rem" }, 
          fontWeight: 700, 
          color: "#ffffff" 
        }}
      >
        {(balance / 1000).toFixed(2)}
      </Typography>
    </Box>
  );
}
