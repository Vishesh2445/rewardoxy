"use client";

import { useState } from "react";
import { Box, Button, Paper, TextField } from "@mui/material";
import { Users, Coins, Copy, Check, Link2, UserPlus, Gift, ArrowRight } from "lucide-react";
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

export default function ReferralsClient({
  referralCode,
  totalReferrals,
  totalCoins,
  referrals,
}: ReferralsClientProps) {
  const [copied, setCopied] = useState(false);
  const referralLink = `https://rewardoxy.com/auth/signup?ref=${referralCode}`;

  async function handleCopy() {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" isBold sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Users size={26} color="#01D676" />
          Referrals
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
          Invite friends and earn bonus coins for every successful signup
        </Typography>
      </Box>

      {/* Hero card */}
      <Paper
        elevation={0}
        sx={{
          mb: 4,
          borderRadius: 4,
          border: "1px solid rgba(1,214,118,0.2)",
          background: "linear-gradient(135deg, rgba(1,214,118,0.1) 0%, rgba(0,126,69,0.05) 100%)",
          p: { xs: 3, sm: 4 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box sx={{ pointerEvents: "none", position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(1,214,118,0.07)", filter: "blur(60px)" }} />
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 3, flexWrap: "wrap" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 60,
              height: 60,
              borderRadius: 4,
              bgcolor: "rgba(1,214,118,0.15)",
              border: "1px solid rgba(1,214,118,0.3)",
              boxShadow: "0 4px 20px rgba(1,214,118,0.2)",
              flexShrink: 0,
            }}
          >
            <Gift size={30} color="#01D676" />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" isBold sx={{ mb: 0.5 }}>
              Earn{" "}
              <Box component="span" sx={{ background: "linear-gradient(90deg,#01D676,#00a855)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                500 Coins
              </Box>{" "}
              Per Referral
            </Typography>
            <Typography variant="body2" sx={{ color: colors.text.secondary, maxWidth: 480 }}>
              Share your unique link with friends. When they sign up, you both earn bonus coins — no limits!
            </Typography>
          </Box>
        </Box>

        {/* How it works steps */}
        <Box sx={{ mt: 3, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3,1fr)" }, gap: 2 }}>
          {[
            { step: "1", title: "Share your link", desc: "Copy and share your referral link anywhere" },
            { step: "2", title: "Friend signs up", desc: "Your friend creates a free Rewardoxy account" },
            { step: "3", title: "Both earn coins", desc: "You get 500 coins instantly upon their signup" },
          ].map((s) => (
            <Box
              key={s.step}
              sx={{
                display: "flex",
                gap: 1.5,
                p: 2,
                borderRadius: 3,
                bgcolor: "rgba(0,0,0,0.2)",
                border: `1px solid ${colors.divider}`,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#01D676,#007e45)",
                  fontWeight: 800,
                  fontSize: "0.8rem",
                  color: "#fff",
                  flexShrink: 0,
                }}
              >
                {s.step}
              </Box>
              <Box>
                <Typography sx={{ fontSize: "0.8rem", fontWeight: 700 }}>{s.title}</Typography>
                <Typography sx={{ fontSize: "0.72rem", color: colors.text.secondary }}>{s.desc}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Referral link */}
      <Paper
        elevation={0}
        sx={{
          mb: 4,
          borderRadius: 4,
          border: `1px solid ${colors.divider}`,
          bgcolor: colors.background.secondary,
          p: { xs: 3, sm: 4 },
        }}
      >
        <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <Link2 size={18} color="#01D676" />
          <Typography variant="subtitle1" isBold>Your Referral Link</Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: { xs: "wrap", sm: "nowrap" } }}>
          <TextField
            fullWidth
            value={referralLink}
            slotProps={{ input: { readOnly: true } }}
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: colors.background.ternary,
                borderRadius: 2,
                fontSize: "0.85rem",
                color: colors.text.secondary,
                "& fieldset": { borderColor: colors.divider },
                "&:hover fieldset": { borderColor: "rgba(1,214,118,0.3)" },
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
              px: 3,
              fontWeight: 700,
              fontSize: "0.875rem",
              textTransform: "none",
              whiteSpace: "nowrap",
              ...(copied
                ? {
                    bgcolor: colors.background.secondary,
                    color: "#01D676",
                    border: "1px solid rgba(1,214,118,0.3)",
                    "&:hover": { bgcolor: colors.background.secondary },
                  }
                : {
                    background: "linear-gradient(180deg,#01D676,#007e45)",
                    boxShadow: "0 4px 14px rgba(1,214,118,0.25)",
                    "&:hover": { filter: "brightness(1.1)" },
                  }),
            }}
          >
            {copied ? "Copied!" : "Copy Link"}
          </Button>
        </Box>

        <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1, fontSize: "0.75rem", color: colors.text.secondary }}>
          <Box sx={{ fontWeight: 600 }}>Your code:</Box>
          <Box
            sx={{
              borderRadius: 1.5,
              bgcolor: colors.background.ternary,
              border: `1px solid ${colors.divider}`,
              px: 1.25,
              py: 0.25,
              fontFamily: "monospace",
              fontWeight: 700,
              color: "#01D676",
              letterSpacing: "0.05em",
            }}
          >
            {referralCode}
          </Box>
        </Box>
      </Paper>

      {/* Stats */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 4 }}>
        {[
          {
            icon: <Users size={22} color="#01D676" />,
            label: "Total Referrals",
            value: totalReferrals.toString(),
            sub: "friends joined",
            color: "#01D676",
          },
          {
            icon: <Coins size={22} color="#f59e0b" />,
            label: "Coins Earned",
            value: totalCoins.toLocaleString(),
            sub: "from referrals",
            color: "#f59e0b",
          },
        ].map((s) => (
          <Paper
            key={s.label}
            elevation={0}
            sx={{
              borderRadius: 4,
              border: `1px solid ${colors.divider}`,
              bgcolor: colors.background.secondary,
              p: { xs: 2.5, sm: 3 },
              transition: "all 0.2s",
              "&:hover": { borderColor: "rgba(1,214,118,0.25)" },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 46,
                height: 46,
                borderRadius: 3,
                bgcolor: colors.background.ternary,
                border: `1px solid ${colors.divider}`,
                mb: 2,
              }}
            >
              {s.icon}
            </Box>
            <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: colors.text.secondary }}>
              {s.label}
            </Typography>
            <Typography sx={{ fontSize: "2rem", fontWeight: 900, color: s.color, lineHeight: 1.1, mt: 0.25 }}>
              {s.value}
            </Typography>
            <Typography sx={{ fontSize: "0.72rem", color: colors.text.secondary, mt: 0.25 }}>
              {s.sub}
            </Typography>
          </Paper>
        ))}
      </Box>

      {/* Referral list */}
      <Box>
        <Typography variant="subtitle1" isBold sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <Users size={18} color="#01D676" />
          Your Referrals
        </Typography>
        {referrals.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              border: `1px solid ${colors.divider}`,
              bgcolor: colors.background.secondary,
              p: 6,
              textAlign: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 64, height: 64, borderRadius: 4, bgcolor: colors.background.ternary, border: `1px solid ${colors.divider}`, mx: "auto", mb: 2 }}>
              <UserPlus size={30} color="rgba(169,169,202,0.35)" />
            </Box>
            <Typography variant="body1" isBold sx={{ mb: 1 }}>No referrals yet</Typography>
            <Typography variant="body2" sx={{ color: colors.text.secondary, mb: 3 }}>
              Share your referral link and start earning bonus coins!
            </Typography>
            <Button
              onClick={handleCopy}
              variant="contained"
              endIcon={<ArrowRight size={16} />}
              sx={{
                background: "linear-gradient(180deg,#01D676,#007e45)",
                borderRadius: 3,
                px: 3,
                py: 1,
                fontWeight: 700,
                textTransform: "none",
                "&:hover": { filter: "brightness(1.1)" },
              }}
            >
              Copy Your Link
            </Button>
          </Paper>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {referrals.map((r) => (
              <Box
                key={r.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderRadius: 3,
                  border: `1px solid ${colors.divider}`,
                  bgcolor: colors.background.secondary,
                  px: 2.5,
                  py: 2,
                  transition: "all 0.2s",
                  "&:hover": { bgcolor: colors.background.ternary, borderColor: "rgba(1,214,118,0.2)" },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 38, height: 38, borderRadius: "50%", bgcolor: colors.background.ternary, border: `1px solid ${colors.divider}` }}>
                    <Users size={16} color="#01D676" />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{r.masked_email}</Typography>
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.5,
                        borderRadius: 50,
                        bgcolor: "rgba(1,214,118,0.08)",
                        border: "1px solid rgba(1,214,118,0.15)",
                        px: 1,
                        py: 0.15,
                        fontSize: "9px",
                        fontWeight: 700,
                        color: "#01D676",
                        textTransform: "uppercase",
                        mt: 0.25,
                      }}
                    >
                      +500 coins earned
                    </Box>
                  </Box>
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
