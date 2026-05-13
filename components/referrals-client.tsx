"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Paper, TextField, CircularProgress } from "@mui/material";
import { Users, Coins, Copy, Check, Link2, UserPlus, Gift, ArrowRight, Gift as GiftIcon, TrendingUp } from "lucide-react";
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
  pendingEarnings: number;
}

export default function ReferralsClient({
  referralCode,
  totalReferrals,
  totalCoins,
  referrals,
  pendingEarnings,
}: ReferralsClientProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);
  const referralLink = `https://www.rewardoxy.app/auth/signup?ref=${referralCode}`;

  async function handleCopy() {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleClaim() {
    setClaiming(true);
    try {
      const res = await fetch("/api/referrals/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (res.ok) {
        setClaimSuccess(true);
        setTimeout(() => {
          router.refresh();
        }, 1500);
      } else {
        alert(data.error || "Failed to claim earnings");
      }
    } catch (err) {
      alert("Failed to claim earnings");
    }
    setClaiming(false);
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, sm: 3, md: 4 }, py: 4, pb: { xs: 12, lg: 4 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" isBold sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Users size={26} color={colors.primary} />
          Referrals
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
          Invite friends and earn 5% of their earnings
        </Typography>
      </Box>

      {/* Hero card */}
      <Paper
        elevation={0}
        sx={{
          mb: 4,
          borderRadius: 4,
          border: "1px solid rgba(0, 208, 132, 0.2)",
          background: "linear-gradient(135deg, rgba(0, 208, 132, 0.1) 0%, rgba(0,126,69,0.05) 100%)",
          p: { xs: 3, sm: 4 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box sx={{ pointerEvents: "none", position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(0, 208, 132, 0.07)", filter: "blur(60px)" }} />
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "auto 1fr" }, gap: 3, alignItems: "center" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 60,
              height: 60,
              borderRadius: 4,
              bgcolor: "rgba(0, 208, 132, 0.15)",
              border: "1px solid rgba(0, 208, 132, 0.3)",
              boxShadow: "0 4px 20px rgba(0, 208, 132, 0.2)",
              flexShrink: 0,
            }}
          >
            <Gift size={30} color={colors.primary} />
          </Box>
          <Box>
            <Typography variant="h6" isBold sx={{ mb: 0.5 }}>
              Earn{" "}
              <Box component="span" sx={{ background: "linear-gradient(90deg,#00D084,#00a855)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                5%
              </Box>{" "}
              of Referral Earnings
            </Typography>
            <Typography variant="body2" sx={{ color: colors.text.secondary }}>
              Share your unique link with friends. When they earn coins, you earn 5% commission — no limits!
            </Typography>
          </Box>
        </Box>

        {/* How it works steps */}
        <Box sx={{ mt: 3, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3,1fr)" }, gap: 2 }}>
          {[
            { step: "1", title: "Share your link", desc: "Copy and share your referral link anywhere" },
            { step: "2", title: "Friend signs up", desc: "Your friend creates a free Rewardoxy account" },
            { step: "3", title: "Earn 5% commission", desc: "You earn 5% of all coins your referrals earn" },
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
                  background: "linear-gradient(135deg,#00D084,#059669)",
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
          <Link2 size={18} color={colors.primary} />
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
                "&:hover fieldset": { borderColor: "rgba(0, 208, 132, 0.3)" },
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
                    color: colors.primary,
                    border: "1px solid rgba(0, 208, 132, 0.3)",
                    "&:hover": { bgcolor: colors.background.secondary },
                  }
                : {
                    background: "linear-gradient(180deg,#00D084,#059669)",
                    boxShadow: "0 4px 14px rgba(0, 208, 132, 0.25)",
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
              color: "#10B981",
              letterSpacing: "0.05em",
            }}
          >
            {referralCode}
          </Box>
        </Box>
      </Paper>

      {/* Pending Earnings Claim */}
      {pendingEarnings > 0 && (
        <Paper
          elevation={0}
          sx={{
            mb: 4,
            borderRadius: 4,
            border: "1px solid rgba(0, 208, 132, 0.3)",
            bgcolor: "rgba(0, 208, 132, 0.1)",
            p: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 48,
                height: 48,
                borderRadius: "50%",
                bgcolor: "rgba(0, 208, 132, 0.2)",
              }}
            >
              <GiftIcon size={24} color={colors.primary} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: "1.1rem" }}>
                You have {pendingEarnings.toLocaleString()} coins to claim!
              </Typography>
              <Typography sx={{ fontSize: "0.8rem", color: colors.text.secondary }}>
                Click the button to add these coins to your balance
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            onClick={handleClaim}
            disabled={claiming || claimSuccess}
            startIcon={claiming ? <CircularProgress size={16} /> : claimSuccess ? <Check size={16} /> : <GiftIcon size={16} />}
            sx={{
              background: claimSuccess ? colors.primary : colors.background.gradient,
              fontWeight: 700,
              px: 3,
              py: 1,
              borderRadius: 2,
              textTransform: "none",
              "&:hover": { filter: "brightness(1.1)" },
            }}
          >
            {claimSuccess ? "Claimed!" : claiming ? "Claiming..." : "Claim Now"}
          </Button>
        </Paper>
      )}

      {/* Stats */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 2, mb: 4 }}>
        {[
          {
            icon: <Users size={20} color={colors.primary} />,
            label: "Total Referrals",
            value: totalReferrals.toString(),
            desc: "friends joined",
            color: colors.primary
          },
          {
            icon: <Coins size={20} color={colors.status.warning} />,
            label: "Total Earned",
            value: totalCoins.toLocaleString(),
            desc: "5% commission",
            color: colors.status.warning
          },
          {
            icon: <Gift size={20} color={colors.secondary} />,
            label: "Pending",
            value: pendingEarnings.toLocaleString(),
            desc: "ready to claim",
            color: colors.secondary
          },
          {
            icon: <TrendingUp size={20} color={colors.primary} />,
            label: "Commission Rate",
            value: "5%",
            desc: "of all earnings",
            color: colors.primary
          },
        ].map((s, idx) => (
          <Paper
            key={idx}
            elevation={0}
            sx={{
              borderRadius: 4,
              border: `1px solid ${colors.divider}`,
              bgcolor: colors.background.secondary,
              p: 2.5,
              transition: "all 0.2s",
              "&:hover": { borderColor: "rgba(0, 208, 132, 0.25)" },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                borderRadius: 3,
                bgcolor: colors.background.ternary,
                border: `1px solid ${colors.divider}`,
                mb: 1.5,
              }}
            >
              {s.icon}
            </Box>
            <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: colors.text.secondary }}>
              {s.label}
            </Typography>
            <Typography sx={{ fontSize: "1.5rem", fontWeight: 900, color: s.color, lineHeight: 1.1, mt: 0.25 }}>
              {s.value}
            </Typography>
            <Typography sx={{ fontSize: "0.7rem", color: colors.text.secondary, mt: 0.25 }}>
              {s.desc}
            </Typography>
          </Paper>
        ))}
      </Box>

      {/* Referral list */}
      <Box>
        <Typography variant="subtitle1" isBold sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <Users size={18} color={colors.primary} />
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
              Share your referral link and start earning 5% commission!
            </Typography>
            <Button
              onClick={handleCopy}
              variant="contained"
              endIcon={<ArrowRight size={16} />}
              sx={{
                background: "linear-gradient(180deg,#00D084,#059669)",
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
            {referrals.slice(0, visibleCount).map((r) => (
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
                  "&:hover": { bgcolor: colors.background.ternary, borderColor: "rgba(0, 208, 132, 0.2)" },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 38, height: 38, borderRadius: "50%", bgcolor: colors.background.ternary, border: `1px solid ${colors.divider}` }}>
                    <Users size={16} color={colors.primary} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{r.masked_email}</Typography>
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.5,
                        borderRadius: 50,
                        bgcolor: "rgba(16,185,129,0.08)",
                        border: "1px solid rgba(16,185,129,0.15)",
                        px: 1,
                        py: 0.15,
                        fontSize: "9px",
                        fontWeight: 700,
                        color: "#10B981",
                        textTransform: "uppercase",
                        mt: 0.25,
                      }}
                    >
                      5% earnings
                    </Box>
                  </Box>
                </Box>
                <Typography sx={{ fontSize: "0.75rem", color: colors.text.secondary }}>
                  {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </Typography>
              </Box>
            ))}
            {visibleCount < referrals.length && (
              <Box sx={{ textAlign: "center", mt: 2 }}>
                <Button
                  onClick={() => setVisibleCount((prev) => prev + 5)}
                  sx={{ textTransform: "none", color: colors.text.secondary, border: `1px solid ${colors.divider}`, borderRadius: 2, px: 3, "&:hover": { bgcolor: colors.background.ternary, color: "#fff" } }}
                >
                  Load More
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
