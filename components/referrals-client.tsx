"use client";

import { useState } from "react";
import { Box, Button, Paper, TextField, InputAdornment } from "@mui/material";
import { Users, Coins, Copy, Check, Link2, UserPlus } from "lucide-react";
import Typography from "@/components/ui/Typography";
import colors from "@/theme/colors";

interface Referral {
  id: string;
  masked_email: string;
  created_at: string;
}

interface ReferralsClientProps {
  referralCode: string;
  totalReferrals: number;
  totalCoins: number;
  referrals: Referral[];
}

export default function ReferralsClient({ referralCode, totalReferrals, totalCoins, referrals }: ReferralsClientProps) {
  const [copied, setCopied] = useState(false);
  const referralLink = `https://rewardoxy.com/auth/signup?ref=${referralCode}`;

  async function handleCopy() {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" isBold>Referrals</Typography>
        <Typography variant="body2" color="textSecondary">Invite friends and earn bonus coins</Typography>
      </Box>

      {/* Referral link */}
      <Paper sx={{ mb: 4, borderRadius: 4, border: `1px solid ${colors.divider}`, bgcolor: colors.primary, p: 3 }}>
        <Box sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 1, fontSize: "0.875rem", fontWeight: 500, color: colors.text.secondary }}>
          <Link2 size={16} color="#01D676" />
          Your Referral Link
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            fullWidth
            value={referralLink}
            slotProps={{ input: { readOnly: true } }}
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: colors.background.ternary,
                borderRadius: 2,
                fontSize: "0.875rem",
                color: colors.text.secondary,
                "& fieldset": { borderColor: colors.divider },
              },
            }}
          />
          <Button
            variant="contained"
            onClick={handleCopy}
            startIcon={copied ? <Check size={16} /> : <Copy size={16} />}
            sx={{
              flexShrink: 0,
              borderRadius: 2,
              px: 2,
              fontWeight: 600,
              fontSize: "0.875rem",
              textTransform: "none",
              ...(copied
                ? {
                    bgcolor: colors.background.secondary,
                    color: "#01D676",
                    border: "1px solid rgba(1,214,118,0.2)",
                    "&:hover": { bgcolor: colors.background.secondary },
                  }
                : {
                    background: colors.background.gradient,
                    boxShadow: "0 4px 12px rgba(1,214,118,0.2)",
                    "&:hover": { filter: "brightness(1.1)" },
                  }),
            }}
          >
            {copied ? "Copied" : "Copy"}
          </Button>
        </Box>
      </Paper>

      {/* Stats */}
      <Box sx={{ mb: 4, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
        <Paper sx={{ borderRadius: 4, border: `1px solid ${colors.divider}`, bgcolor: colors.primary, p: 3, transition: "all 0.2s", "&:hover": { bgcolor: colors.background.ternary } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: 3, bgcolor: colors.background.secondary, border: "1px solid rgba(1,214,118,0.2)" }}>
              <Users size={20} color="#01D676" />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: colors.text.secondary }}>Referrals</Typography>
              <Typography sx={{ fontSize: "1.5rem", fontWeight: 700 }}>{totalReferrals}</Typography>
            </Box>
          </Box>
        </Paper>
        <Paper sx={{ borderRadius: 4, border: `1px solid ${colors.divider}`, bgcolor: colors.primary, p: 3, transition: "all 0.2s", "&:hover": { bgcolor: colors.background.ternary } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: 3, bgcolor: colors.background.secondary, border: "1px solid rgba(1,214,118,0.2)" }}>
              <Coins size={20} color="#01D676" />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: colors.text.secondary }}>Coins Earned</Typography>
              <Typography sx={{ fontSize: "1.5rem", fontWeight: 700, color: "#01D676" }}>{totalCoins.toLocaleString()}</Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Referral list */}
      <Box>
        <Typography variant="subtitle1" isBold sx={{ mb: 2 }}>Your Referrals</Typography>
        {referrals.length === 0 ? (
          <Paper sx={{ borderRadius: 4, border: `1px solid ${colors.divider}`, bgcolor: colors.primary, p: 6, textAlign: "center" }}>
            <UserPlus size={40} color="rgba(169,169,202,0.4)" style={{ margin: "0 auto" }} />
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1.5 }}>No referrals yet. Share your link to start earning.</Typography>
          </Paper>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {referrals.map((r) => (
              <Box key={r.id} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: 3, border: `1px solid ${colors.divider}`, bgcolor: colors.primary, px: 2.5, py: 2, transition: "all 0.2s", "&:hover": { bgcolor: colors.background.ternary } }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: "50%", bgcolor: colors.background.secondary, border: "1px solid rgba(1,214,118,0.2)" }}>
                    <Users size={16} color="#01D676" />
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{r.masked_email}</Typography>
                </Box>
                <Typography sx={{ fontSize: "0.75rem", color: colors.text.secondary }}>
                  {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
