"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, TextField, CircularProgress } from "@mui/material";
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
        setTimeout(() => router.refresh(), 1500);
      } else {
        alert(data.error || "Failed to claim earnings");
      }
    } catch {
      alert("Failed to claim earnings");
    }
    setClaiming(false);
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, sm: 3, md: 4 }, py: 4, pb: { xs: 12, lg: 4 } }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" isBold sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Users size={24} color={colors.primary} />
          Referrals
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5, fontSize: "0.8rem" }}>
          Invite friends and earn 5% of their earnings
        </Typography>
      </Box>

      {/* Hero card */}
      <Box
        sx={{
          mb: 3,
          borderRadius: "20px",
          background: "linear-gradient(135deg, #232645 0%, #1E2148 100%)",
          p: { xs: 2.5, sm: 3 },
          boxShadow: "0 10px 30px rgba(16, 185, 129, 0.08)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Box sx={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 48, height: 48, borderRadius: "12px",
            background: "rgba(16, 185, 129, 0.12)",
          }}>
            <Gift size={24} color={colors.primary} />
          </Box>
          <Box>
            <Typography variant="body1" isBold>
              Earn{" "}
              <Box component="span" sx={{ color: colors.primary }}>5%</Box>
              {" "}of Referral Earnings
            </Typography>
            <Typography variant="body2" sx={{ color: colors.text.secondary, fontSize: "0.8rem" }}>
              Share your unique link with friends. No limits!
            </Typography>
          </Box>
        </Box>

        {/* How it works steps */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3,1fr)" }, gap: 1.25 }}>
          {[
            { step: "1", title: "Share your link", desc: "Copy and share your referral link anywhere" },
            { step: "2", title: "Friend signs up", desc: "Your friend creates a free Rewardoxy account" },
            { step: "3", title: "Earn 5% commission", desc: "You earn 5% of all coins your referrals earn" },
          ].map((s) => (
            <Box
              key={s.step}
              sx={{
                display: "flex", gap: 1.5, p: 1.5, borderRadius: "12px",
                bgcolor: "#1A1B2E",
              }}
            >
              <Box sx={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 26, height: 26, borderRadius: "50%",
                background: "linear-gradient(135deg, #10B981, #059669)",
                fontWeight: 800, fontSize: "0.75rem", color: "#fff", flexShrink: 0,
              }}>
                {s.step}
              </Box>
              <Box>
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 700 }}>{s.title}</Typography>
                <Typography sx={{ fontSize: "0.68rem", color: colors.text.secondary }}>{s.desc}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Referral link */}
      <Box
        sx={{
          mb: 3,
          borderRadius: "14px",
          bgcolor: "#232645",
          p: { xs: 2.5, sm: 3 },
        }}
      >
        <Box sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
          <Link2 size={16} color={colors.primary} />
          <Typography variant="subtitle1" isBold sx={{ fontSize: "0.9rem" }}>Your Referral Link</Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1, flexWrap: { xs: "wrap", sm: "nowrap" } }}>
          <TextField
            fullWidth
            value={referralLink}
            slotProps={{ input: { readOnly: true } }}
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "#252539", borderRadius: "12px", fontSize: "0.8rem",
                color: colors.text.secondary,
                "& fieldset": { borderColor: "rgba(255,255,255,0.06)", borderWidth: "1px" },
                "&:hover fieldset": { borderColor: "rgba(16,185,129,0.3)" },
              },
            }}
          />
          <Button
            variant="contained"
            onClick={handleCopy}
            startIcon={copied ? <Check size={14} /> : <Copy size={14} />}
            sx={{
              flexShrink: 0, borderRadius: "12px", px: 2.5,
              fontWeight: 700, fontSize: "0.8rem", textTransform: "none", whiteSpace: "nowrap",
              ...(copied
                ? { bgcolor: "#1A1B2E", color: colors.primary, border: "1px solid rgba(16,185,129,0.3)", "&:hover": { bgcolor: "#1A1B2E" } }
                : { background: "linear-gradient(180deg, #10B981, #059669)", boxShadow: "0 4px 16px rgba(16,185,129,0.3)", "&:hover": { filter: "brightness(1.1)" } }),
            }}
          >
            {copied ? "Copied!" : "Copy Link"}
          </Button>
        </Box>

        <Box sx={{ mt: 1.5, display: "flex", alignItems: "center", gap: 1, fontSize: "0.75rem", color: colors.text.secondary }}>
          <Box sx={{ fontWeight: 600 }}>Your code:</Box>
          <Box sx={{
            borderRadius: "8px", bgcolor: "#252539", border: "1px solid rgba(16,185,129,0.2)",
            px: 1.25, py: 0.25, fontFamily: "monospace", fontWeight: 700, color: "#10B981",
            letterSpacing: "0.05em",
          }}>
            {referralCode}
          </Box>
        </Box>
      </Box>

      {/* Pending Earnings Claim */}
      {pendingEarnings > 0 && (
        <Box
          sx={{
            mb: 3,
            borderRadius: "14px",
            border: "1.5px solid rgba(16, 185, 129, 0.5)",
            bgcolor: "#232645",
            p: 2.5,
            boxShadow: "0 4px 20px rgba(16, 185, 129, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 44, height: 44, borderRadius: "50%",
              bgcolor: "rgba(16, 185, 129, 0.12)",
            }}>
              <GiftIcon size={22} color={colors.primary} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: "1rem" }}>
                {pendingEarnings.toLocaleString()} coins to claim!
              </Typography>
              <Typography sx={{ fontSize: "0.75rem", color: colors.text.secondary }}>
                Click to add these coins to your balance
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            onClick={handleClaim}
            disabled={claiming || claimSuccess}
            startIcon={claiming ? <CircularProgress size={16} /> : claimSuccess ? <Check size={16} /> : <GiftIcon size={16} />}
            sx={{
              background: claimSuccess ? colors.primary : "linear-gradient(180deg, #10B981, #059669)",
              fontWeight: 700, px: 2.5, py: 1, borderRadius: "14px",
              textTransform: "none", boxShadow: "0 4px 16px rgba(16,185,129,0.3)",
              "&:hover": { filter: "brightness(1.1)" },
            }}
          >
            {claimSuccess ? "Claimed!" : claiming ? "Claiming..." : "Claim Now"}
          </Button>
        </Box>
      )}

      {/* Stats */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 1.25, mb: 3 }}>
        {[
          { icon: <Users size={16} color={colors.primary} />, label: "Total Referrals", value: totalReferrals.toString(), desc: "friends joined", color: colors.primary },
          { icon: <Coins size={16} color={colors.status.warning} />, label: "Total Earned", value: totalCoins.toLocaleString(), desc: "5% commission", color: colors.status.warning },
          { icon: <Gift size={16} color={colors.secondary} />, label: "Pending", value: pendingEarnings.toLocaleString(), desc: "ready to claim", color: colors.secondary },
          { icon: <TrendingUp size={16} color={colors.primary} />, label: "Commission", value: "5%", desc: "of all earnings", color: colors.primary },
        ].map((s, idx) => (
          <Box
            key={idx}
            sx={{ borderRadius: "14px", bgcolor: "#232645", p: 2 }}
          >
            <Box sx={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 30, height: 30, borderRadius: "8px",
              background: `${s.color}1a`, mb: 1.5,
            }}>
              {s.icon}
            </Box>
            <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: colors.text.secondary }}>
              {s.label}
            </Typography>
            <Typography sx={{ fontSize: "1.25rem", fontWeight: 800, color: s.color, lineHeight: 1.1, mt: 0.25 }}>
              {s.value}
            </Typography>
            <Typography sx={{ fontSize: "0.68rem", color: colors.text.secondary, mt: 0.25 }}>
              {s.desc}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Referral list */}
      <Box>
        <Typography variant="subtitle1" isBold sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
          <Users size={16} color={colors.primary} />
          Your Referrals
        </Typography>
        {referrals.length === 0 ? (
          <Box sx={{ borderRadius: "14px", bgcolor: "#1A1B2E", p: 5, textAlign: "center" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 56, height: 56, borderRadius: "14px", bgcolor: "#232645", mx: "auto", mb: 2 }}>
              <UserPlus size={26} color="rgba(169,169,202,0.35)" />
            </Box>
            <Typography variant="body1" isBold sx={{ mb: 0.5, fontSize: "0.95rem" }}>No referrals yet</Typography>
            <Typography variant="body2" sx={{ color: colors.text.secondary, mb: 2.5, fontSize: "0.8rem" }}>
              Share your referral link and start earning 5% commission!
            </Typography>
            <Button
              onClick={handleCopy}
              variant="contained"
              endIcon={<ArrowRight size={14} />}
              sx={{
                background: "linear-gradient(180deg, #10B981, #059669)",
                borderRadius: "14px", px: 2.5, py: 1, fontWeight: 700,
                fontSize: "0.85rem", textTransform: "none",
                boxShadow: "0 4px 16px rgba(16,185,129,0.3)",
                "&:hover": { filter: "brightness(1.1)" },
              }}
            >
              Copy Your Link
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {referrals.slice(0, visibleCount).map((r) => (
              <Box
                key={r.id}
                sx={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  borderRadius: "12px", bgcolor: "#1A1B2E", px: 2, py: 1.5,
                  transition: "all 0.2s",
                  "&:hover": { bgcolor: "#232645" },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box sx={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: 36, height: 36, borderRadius: "10px",
                    background: "rgba(16, 185, 129, 0.1)",
                  }}>
                    <Users size={16} color={colors.primary} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.85rem" }}>{r.masked_email}</Typography>
                    <Box sx={{
                      display: "inline-flex", alignItems: "center", gap: 0.5,
                      borderRadius: "6px", bgcolor: "rgba(16,185,129,0.1)",
                      px: 0.75, py: 0.15, fontSize: "9px", fontWeight: 700,
                      color: "#10B981", textTransform: "uppercase", mt: 0.25,
                    }}>
                      5% earnings
                    </Box>
                  </Box>
                </Box>
                <Typography sx={{ fontSize: "0.7rem", color: colors.text.secondary }}>
                  {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </Typography>
              </Box>
            ))}
            {visibleCount < referrals.length && (
              <Box sx={{ textAlign: "center", mt: 1.5 }}>
                <Button
                  onClick={() => setVisibleCount((prev) => prev + 5)}
                  sx={{
                    textTransform: "none", color: colors.text.secondary,
                    border: "1px solid rgba(255,255,255,0.05)", borderRadius: "10px",
                    px: 3, bgcolor: "#1A1B2E",
                    "&:hover": { bgcolor: "#232645", color: "#fff" },
                  }}
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
