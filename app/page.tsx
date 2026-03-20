"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Grid,
  Button,
  Paper,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Shield,
  Zap,
  Globe,
  ClipboardList,
  CheckCircle,
  Wallet,
  Gamepad2,
  FileText,
  Smartphone,
  ArrowRight,
  Trophy,
  Users,
  DollarSign,
  Star,
  CalendarCheck,
  ChevronDown,
  Gift,
  CreditCard,
  Bitcoin,
  Sparkles,
  Mail,
  Lock,
} from "lucide-react";
import Icons from "@/components/icons";
import Typography from "@/components/ui/Typography";
import OfferwallModal from "@/components/offerwall-modal";
import { createClient } from "@/lib/supabase/client";

const colors = {
  bgPage: "#141523",
  bgCard: "#1d1e30",
  bgInput: "#252539",
  bgButton: "#2F3043",
  green: "#01D676",
  greenDark: "#007e45",
  textPrimary: "#ffffff",
  textSecondary: "#a9a9ca",
  divider: "#2a2b43",
  greenTint: "#00e9411a",
  gradient: "linear-gradient(180deg, #01d676 0, #007e45 100%)",
};

const sxGradientBtn = {
  background: colors.gradient,
  color: colors.textPrimary,
  fontWeight: 700,
  textTransform: "none",
  borderRadius: "12px",
  "&:hover": {
    background: "linear-gradient(180deg, #00c46a 0, #006b3b 100%)",
  },
} as const;

const sxCard = {
  bgcolor: colors.bgCard,
  border: `1px solid ${colors.divider}`,
  borderRadius: "16px",
  transition: "border-color 0.2s, box-shadow 0.2s",
  "&:hover": {
    borderColor: "rgba(1,214,118,0.3)",
  },
} as const;

const sxBadge = {
  display: "inline-flex",
  alignItems: "center",
  bgcolor: colors.greenTint,
  color: colors.green,
  fontSize: "0.75rem",
  fontWeight: 700,
  px: 1.5,
  py: 0.5,
  borderRadius: "100px",
  border: `1px solid rgba(1,214,118,0.2)`,
  letterSpacing: "0.05em",
} as const;

const heroHeadingTextShadow =
  "0 1px 0 rgba(255,255,255,0.05), 0 4px 24px rgba(0,0,0,0.6), 0 0 80px rgba(1,214,118,0.08)";

const HERO_PARTICLES = [
  { top: "12%", left: "8%",  size: 3, delay: "0s",   dur: "4.5s" },
  { top: "22%", left: "78%", size: 2, delay: "1.2s", dur: "6s"   },
  { top: "58%", left: "12%", size: 2, delay: "2.1s", dur: "5.2s" },
  { top: "72%", left: "68%", size: 3, delay: "0.6s", dur: "7s"   },
  { top: "42%", left: "88%", size: 2, delay: "3s",   dur: "4s"   },
  { top: "82%", left: "28%", size: 2, delay: "1.7s", dur: "8s"   },
  { top: "8%",  left: "52%", size: 3, delay: "2.8s", dur: "5s"   },
  { top: "33%", left: "3%",  size: 2, delay: "0.9s", dur: "6.5s" },
  { top: "88%", left: "58%", size: 2, delay: "3.6s", dur: "4.8s" },
  { top: "50%", left: "43%", size: 2, delay: "1.4s", dur: "7.2s" },
] as const;

export default function Home() {
  const router = useRouter();
  const supabase = createClient();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAuthenticated(!!user);
    });
  }, []);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setSignupError(null);
    setSignupLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setSignupError(signUpError.message);
      setSignupLoading(false);
      return;
    }

    if (data.user) {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: data.user.id,
          email: data.user.email,
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        setSignupError(body.error || "Failed to create profile");
        setSignupLoading(false);
        return;
      }

      router.push("/dashboard");
    }

    setSignupLoading(false);
  }

  async function handleGoogleSignup() {
    setSignupError(null);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (oauthError) {
      setSignupError(oauthError.message);
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: colors.bgPage, color: colors.textPrimary }}>
      {/* ===================== NAVBAR ===================== */}
      <Box
        component="nav"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          borderBottom: `1px solid ${colors.divider}`,
          bgcolor: "rgba(20,21,35,0.8)",
          backdropFilter: "blur(24px)",
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 64,
          }}
        >
          <Icons.Logo />

          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 4 }}>
            {[
              { label: "How It Works", href: "#how-it-works" },
              { label: "Earn", href: "#earn" },
              { label: "Features", href: "#features" },
              { label: "FAQ", href: "#faq" },
              { label: "Contact", href: "/contact" },
            ].map((item) => (
              <Box
                key={item.href}
                component="a"
                href={item.href}
                sx={{
                  fontSize: "0.875rem",
                  color: colors.textSecondary,
                  textDecoration: "none",
                  transition: "color 0.2s",
                  "&:hover": { color: colors.textPrimary },
                }}
              >
                {item.label}
              </Box>
            ))}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {isAuthenticated ? (
              <Button
                component={Link}
                href="/dashboard"
                variant="contained"
                sx={{
                  ...sxGradientBtn,
                  height: 40,
                  px: 2.5,
                  fontSize: "0.875rem",
                  borderRadius: "8px",
                }}
              >
                Dashboard
              </Button>
            ) : (
              <>
                <Button
                  component={Link}
                  href="/auth/login"
                  variant="text"
                  sx={{
                    display: { xs: "none", sm: "inline-flex" },
                    color: colors.textSecondary,
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    textTransform: "none",
                    "&:hover": { color: colors.textPrimary, bgcolor: "transparent" },
                  }}
                >
                  Sign In
                </Button>
                <Button
                  component={Link}
                  href="/auth/signup"
                  variant="contained"
                  sx={{
                    ...sxGradientBtn,
                    height: 40,
                    px: 2.5,
                    fontSize: "0.875rem",
                    borderRadius: "8px",
                  }}
                >
                  Sign Up Free
                </Button>
              </>
            )}
          </Box>
        </Container>
      </Box>

      {/* ===================== HERO ===================== */}
      <Box
        component="section"
        sx={{
          position: "relative",
          overflow: "hidden",
          minHeight: { xs: "auto", md: "88vh" },
          display: "flex",
          alignItems: "center",
          px: { xs: 2, sm: 3, lg: 4 },
          pt: { xs: 8, sm: 10 },
          pb: { xs: 8, sm: 10 },
        }}
      >
        {/* === LAYER 0: Animated mesh grid === */}
        <Box
          sx={{
            pointerEvents: "none",
            position: "absolute",
            inset: 0,
            backgroundImage: [
              "linear-gradient(rgba(1,214,118,0.04) 1px, transparent 1px)",
              "linear-gradient(90deg, rgba(1,214,118,0.04) 1px, transparent 1px)",
            ].join(", "),
            backgroundSize: "64px 64px",
            WebkitMaskImage:
              "radial-gradient(ellipse 85% 85% at 50% 50%, #000 30%, transparent 100%)",
            maskImage:
              "radial-gradient(ellipse 85% 85% at 50% 50%, #000 30%, transparent 100%)",
          }}
        />

        {/* === LAYER 1: Deep green glow — top-left === */}
        <Box
          sx={{
            pointerEvents: "none",
            position: "absolute",
            top: "-15%",
            left: "-8%",
            width: { xs: 380, md: 620 },
            height: { xs: 380, md: 620 },
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(1,214,118,0.13) 0%, transparent 70%)",
            filter: "blur(60px)",
            animation: "orbPulse 8s ease-in-out infinite",
            willChange: "transform, opacity",
          }}
        />

        {/* === LAYER 1: Purple glow — bottom-right === */}
        <Box
          sx={{
            pointerEvents: "none",
            position: "absolute",
            bottom: "-20%",
            right: "-8%",
            width: { xs: 320, md: 540 },
            height: { xs: 320, md: 540 },
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(100,80,255,0.1) 0%, transparent 70%)",
            filter: "blur(80px)",
            animation: "orbPulse 11s ease-in-out infinite 2s",
            willChange: "transform, opacity",
          }}
        />

        {/* === LAYER 1: Soft green center glow === */}
        <Box
          sx={{
            pointerEvents: "none",
            position: "absolute",
            top: "35%",
            left: "50%",
            transform: "translateX(-50%)",
            width: { xs: 280, md: 680 },
            height: { xs: 180, md: 380 },
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(1,214,118,0.05) 0%, transparent 70%)",
            filter: "blur(90px)",
          }}
        />

        {/* === LAYER 2: Particle stars === */}
        {HERO_PARTICLES.map((s, i) => (
          <Box
            key={i}
            sx={{
              pointerEvents: "none",
              position: "absolute",
              top: s.top,
              left: s.left,
              width: s.size,
              height: s.size,
              borderRadius: "50%",
              bgcolor: colors.green,
              opacity: 0.55,
              boxShadow: `0 0 ${s.size * 3}px ${colors.green}`,
              animation: `particleDrift ${s.dur} ease-in-out infinite ${s.delay}`,
              willChange: "transform, opacity",
              display: { xs: "none", sm: "block" },
            }}
          />
        ))}

        {/* === LAYER 3: Floating 3D decorative icons === */}

        {/* Dollar coin — far left */}
        <Box
          sx={{
            pointerEvents: "none",
            position: "absolute",
            left: { md: "3%", lg: "4%" },
            top: "22%",
            display: { xs: "none", lg: "flex" },
            alignItems: "center",
            justifyContent: "center",
            width: 56,
            height: 56,
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, rgba(1,214,118,0.22) 0%, rgba(0,126,69,0.12) 100%)",
            border: "1px solid rgba(1,214,118,0.28)",
            backdropFilter: "blur(8px)",
            color: colors.green,
            boxShadow:
              "0 0 24px rgba(1,214,118,0.15), inset 0 1px 0 rgba(255,255,255,0.08)",
            animation: "floatY 5s ease-in-out infinite",
            willChange: "transform",
          }}
        >
          <DollarSign size={24} />
        </Box>

        {/* Bitcoin icon — far right, upper */}
        <Box
          sx={{
            pointerEvents: "none",
            position: "absolute",
            right: { md: "2%", lg: "3%" },
            top: "18%",
            display: { xs: "none", lg: "flex" },
            alignItems: "center",
            justifyContent: "center",
            width: 52,
            height: 52,
            borderRadius: "14px",
            background:
              "linear-gradient(135deg, rgba(100,80,255,0.2) 0%, rgba(60,40,180,0.12) 100%)",
            border: "1px solid rgba(100,80,255,0.28)",
            backdropFilter: "blur(8px)",
            color: "#9f8fff",
            boxShadow: "0 0 20px rgba(100,80,255,0.15)",
            animation: "floatY 6.2s ease-in-out infinite 1.1s",
            willChange: "transform",
          }}
        >
          <Bitcoin size={22} />
        </Box>

        {/* Trophy — lower left */}
        <Box
          sx={{
            pointerEvents: "none",
            position: "absolute",
            left: { md: "5%", lg: "7%" },
            bottom: "26%",
            display: { xs: "none", lg: "flex" },
            alignItems: "center",
            justifyContent: "center",
            width: 48,
            height: 48,
            borderRadius: "12px",
            background:
              "linear-gradient(135deg, rgba(255,195,0,0.18) 0%, rgba(200,130,0,0.1) 100%)",
            border: "1px solid rgba(255,195,0,0.22)",
            backdropFilter: "blur(8px)",
            color: "#ffc83d",
            boxShadow: "0 0 18px rgba(255,195,0,0.12)",
            animation: "floatY 7s ease-in-out infinite 2.2s",
            willChange: "transform",
          }}
        >
          <Trophy size={20} />
        </Box>

        {/* Star — far right, lower */}
        <Box
          sx={{
            pointerEvents: "none",
            position: "absolute",
            right: { md: "3%", lg: "5%" },
            bottom: "28%",
            display: { xs: "none", lg: "flex" },
            alignItems: "center",
            justifyContent: "center",
            width: 44,
            height: 44,
            borderRadius: "12px",
            background:
              "linear-gradient(135deg, rgba(1,214,118,0.18) 0%, rgba(0,126,69,0.1) 100%)",
            border: "1px solid rgba(1,214,118,0.22)",
            backdropFilter: "blur(8px)",
            color: colors.green,
            boxShadow: "0 0 16px rgba(1,214,118,0.12)",
            animation: "floatY 4.8s ease-in-out infinite 0.6s",
            willChange: "transform",
          }}
        >
          <Star size={18} />
        </Box>

        {/* === CONTENT === */}
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Grid container spacing={6} alignItems="center">

            {/* Left side — headline with 3D depth treatment */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  animation: "fadeInLeft 0.75s ease-out forwards",
                  opacity: 0,
                  willChange: "opacity, transform",
                }}
              >
                {/* Top pill badge */}
                <Box sx={{ ...sxBadge, mb: 3 }}>
                  <Sparkles size={12} style={{ marginRight: 6 }} />
                  Trusted by 50,000+ members worldwide
                </Box>

                <Typography
                  variant="h1"
                  isBold
                  sx={{
                    fontSize: { xs: "2.25rem", sm: "2.75rem", lg: "3.5rem" },
                    lineHeight: 1.15,
                    letterSpacing: "-0.02em",
                    textShadow: heroHeadingTextShadow,
                  }}
                >
                  Earn Money by
                  <br />
                  <Typography
                    component="span"
                    isGradient
                    isBold
                    sx={{
                      fontSize: "inherit",
                      lineHeight: "inherit",
                      filter: "drop-shadow(0 0 22px rgba(1,214,118,0.35))",
                    }}
                  >
                    Completing Tasks
                  </Typography>
                </Typography>

                <Typography
                  sx={{
                    mt: 3,
                    maxWidth: 480,
                    fontSize: { xs: "1rem", sm: "1.125rem" },
                    lineHeight: 1.7,
                    color: colors.textSecondary,
                  }}
                >
                  Complete offers, play games, fill surveys and earn coins. Cash out
                  instantly as USDT crypto. Free to join, worldwide.
                </Typography>

                {/* Trust badges */}
                <Box
                  sx={{
                    mt: 4,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: { xs: 2, sm: 3 },
                    color: colors.textSecondary,
                    fontSize: "0.875rem",
                  }}
                >
                  {[
                    { icon: <Shield size={16} />, label: "Secure & Safe" },
                    { icon: <Zap size={16} />, label: "Instant Payouts" },
                    { icon: <Globe size={16} />, label: "100+ Countries" },
                  ].map((badge) => (
                    <Box key={badge.label} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 32,
                          height: 32,
                          borderRadius: "8px",
                          bgcolor: colors.greenTint,
                          color: colors.green,
                          boxShadow: "0 0 10px rgba(1,214,118,0.1)",
                        }}
                      >
                        {badge.icon}
                      </Box>
                      {badge.label}
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>

            {/* Right side — signup / welcome card with glass-morphism */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  animation: "fadeInRight 0.75s ease-out 0.2s forwards",
                  opacity: 0,
                  willChange: "opacity, transform",
                }}
              >
                {isAuthenticated ? (
                  /* ── Welcome Back card ── */
                  <Paper
                    elevation={0}
                    sx={{
                      background: "rgba(29,30,48,0.82)",
                      backdropFilter: "blur(20px)",
                      WebkitBackdropFilter: "blur(20px)",
                      border: "1px solid rgba(1,214,118,0.18)",
                      borderRadius: "24px",
                      p: { xs: 4, sm: 5 },
                      textAlign: "center",
                      boxShadow:
                        "0 8px 40px rgba(0,0,0,0.45), 0 0 0 1px rgba(1,214,118,0.04), inset 0 1px 0 rgba(255,255,255,0.05)",
                      position: "relative",
                      overflow: "hidden",
                      transition: "box-shadow 0.3s ease, border-color 0.3s ease",
                      "&:hover": {
                        borderColor: "rgba(1,214,118,0.32)",
                        boxShadow:
                          "0 8px 40px rgba(0,0,0,0.5), 0 0 60px rgba(1,214,118,0.07), 0 0 0 1px rgba(1,214,118,0.08)",
                      },
                      /* Top edge highlight */
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "1px",
                        background:
                          "linear-gradient(90deg, transparent, rgba(1,214,118,0.45), transparent)",
                      },
                    }}
                  >
                    {/* Inner top glow */}
                    <Box
                      sx={{
                        pointerEvents: "none",
                        position: "absolute",
                        top: "-50%",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "75%",
                        height: "180px",
                        borderRadius: "50%",
                        background:
                          "radial-gradient(circle, rgba(1,214,118,0.07) 0%, transparent 70%)",
                      }}
                    />

                    <Box
                      sx={{
                        mx: "auto",
                        mb: 2.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 64,
                        height: 64,
                        borderRadius: "16px",
                        background: "linear-gradient(135deg, #01D676 0%, #007e45 100%)",
                        boxShadow: "0 8px 32px rgba(1,214,118,0.35), 0 0 60px rgba(1,214,118,0.12)",
                      }}
                    >
                      <Sparkles size={32} color="#fff" />
                    </Box>
                    <Typography variant="h5" isBold sx={{ mb: 1 }}>
                      Welcome Back!
                    </Typography>
                    <Typography sx={{ fontSize: "0.95rem", color: colors.textSecondary, mb: 3 }}>
                      Continue earning coins and cash out anytime.
                    </Typography>
                    <Button
                      component={Link}
                      href="/earn"
                      variant="contained"
                      fullWidth
                      sx={{
                        ...sxGradientBtn,
                        height: 52,
                        fontSize: "1rem",
                        gap: 1,
                        boxShadow: "0 4px 24px rgba(1,214,118,0.3)",
                        "&:hover": { boxShadow: "0 6px 32px rgba(1,214,118,0.45)" },
                      }}
                    >
                      Start Earning
                      <ArrowRight size={20} />
                    </Button>
                  </Paper>
                ) : (
                  /* ── Signup card ── */
                  <Paper
                    elevation={0}
                    sx={{
                      background: "rgba(29,30,48,0.78)",
                      backdropFilter: "blur(20px)",
                      WebkitBackdropFilter: "blur(20px)",
                      border: "1px solid rgba(1,214,118,0.14)",
                      borderRadius: "24px",
                      p: { xs: 3, sm: 4 },
                      boxShadow:
                        "0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(1,214,118,0.04), inset 0 1px 0 rgba(255,255,255,0.05)",
                      position: "relative",
                      overflow: "hidden",
                      transition: "box-shadow 0.3s ease, border-color 0.3s ease",
                      "&:hover": {
                        borderColor: "rgba(1,214,118,0.28)",
                        boxShadow:
                          "0 24px 80px rgba(0,0,0,0.55), 0 0 60px rgba(1,214,118,0.07), 0 0 0 1px rgba(1,214,118,0.08)",
                      },
                      /* Top edge highlight */
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "1px",
                        background:
                          "linear-gradient(90deg, transparent, rgba(1,214,118,0.5), transparent)",
                      },
                      /* Bottom subtle line */
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        bottom: 0,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "55%",
                        height: "1px",
                        background:
                          "linear-gradient(90deg, transparent, rgba(1,214,118,0.15), transparent)",
                      },
                    }}
                  >
                    {/* Inner top glow */}
                    <Box
                      sx={{
                        pointerEvents: "none",
                        position: "absolute",
                        top: "-45%",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "80%",
                        height: "200px",
                        borderRadius: "50%",
                        background:
                          "radial-gradient(circle, rgba(1,214,118,0.06) 0%, transparent 70%)",
                      }}
                    />

                    <Typography variant="h5" isBold sx={{ mb: 0.5, textAlign: "center" }}>
                      Create Free Account
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.85rem",
                        color: colors.textSecondary,
                        textAlign: "center",
                        mb: 3,
                      }}
                    >
                      Start earning in under 2 minutes
                    </Typography>

                    {/* Google button */}
                    <Button
                      onClick={handleGoogleSignup}
                      fullWidth
                      sx={{
                        height: 48,
                        textTransform: "none",
                        fontWeight: 600,
                        borderRadius: "12px",
                        bgcolor: "#fff",
                        color: "#333",
                        fontSize: "0.9rem",
                        gap: 1.5,
                        mb: 2.5,
                        boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
                        "&:hover": {
                          bgcolor: "#f5f5f5",
                          boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
                        },
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 18 18">
                        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                        <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                        <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 2.58 9 2.58z" fill="#EA4335"/>
                      </svg>
                      Continue with Google
                    </Button>

                    <Divider
                      sx={{
                        borderColor: colors.divider,
                        mb: 2.5,
                        fontSize: "0.75rem",
                        color: colors.textSecondary,
                      }}
                    >
                      or sign up with email
                    </Divider>

                    {/* Signup form */}
                    <Box
                      component="form"
                      onSubmit={handleSignup}
                      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                    >
                      <TextField
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        size="small"
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <Mail size={16} color={colors.textSecondary} />
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                      <TextField
                        type="password"
                        required
                        placeholder="Min 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        size="small"
                        inputProps={{ minLength: 6 }}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <Lock size={16} color={colors.textSecondary} />
                              </InputAdornment>
                            ),
                          },
                        }}
                      />

                      {signupError && (
                        <Alert severity="error" sx={{ fontSize: "0.8rem" }}>
                          {signupError}
                        </Alert>
                      )}

                      <Button
                        type="submit"
                        fullWidth
                        disabled={signupLoading}
                        sx={{
                          ...sxGradientBtn,
                          height: 48,
                          fontSize: "0.95rem",
                          gap: 1,
                          boxShadow: "0 4px 20px rgba(1,214,118,0.25)",
                          "&:hover": {
                            boxShadow: "0 6px 28px rgba(1,214,118,0.4)",
                          },
                        }}
                      >
                        {signupLoading ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <>
                            Sign Up Free
                            <ArrowRight size={18} />
                          </>
                        )}
                      </Button>
                    </Box>

                    <Typography
                      sx={{
                        mt: 2,
                        fontSize: "0.8rem",
                        color: colors.textSecondary,
                        textAlign: "center",
                      }}
                    >
                      Already have an account?{" "}
                      <Box
                        component={Link}
                        href="/auth/login"
                        sx={{ color: colors.green, textDecoration: "none", fontWeight: 600 }}
                      >
                        Sign In
                      </Box>
                    </Typography>
                  </Paper>
                )}
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ===================== HOW IT WORKS ===================== */}
      <Box
        component="section"
        id="how-it-works"
        sx={{ px: { xs: 2, sm: 3, lg: 4 }, py: { xs: 10, sm: 14 } }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: "center" }}>
            <Box component="span" sx={sxBadge}>
              <ClipboardList size={12} style={{ marginRight: 6 }} />
              SIMPLE PROCESS
            </Box>
            <Typography
              variant="h2"
              isBold
              sx={{ mt: 2, fontSize: { xs: "1.875rem", sm: "2.25rem", lg: "3rem" } }}
            >
              How It{" "}
              <Typography component="span" isGradient isBold sx={{ fontSize: "inherit" }}>
                Works
              </Typography>
            </Typography>
            <Typography sx={{ mt: 1.5, color: colors.textSecondary }}>
              Start earning in under 2 minutes
            </Typography>
          </Box>

          <Grid container spacing={3} sx={{ mt: 7 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <StepCard
                step={1}
                icon={<ClipboardList size={28} color={colors.green} />}
                title="Create Free Account"
                description="Sign up in seconds with email or Google. Completely free to join."
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <StepCard
                step={2}
                icon={<CheckCircle size={28} color={colors.green} />}
                title="Complete Tasks"
                description="Play games, fill surveys, try apps and earn coins for every task."
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <StepCard
                step={3}
                icon={<Wallet size={28} color={colors.green} />}
                title="Withdraw Crypto"
                description="Cash out instantly in USDT via TRC-20, BEP-20 or SOL network."
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ===================== BEST WAYS TO EARN ===================== */}
      <Divider sx={{ borderColor: colors.divider }} />
      <Box
        component="section"
        id="earn"
        sx={{ px: { xs: 2, sm: 3, lg: 4 }, py: { xs: 10, sm: 14 } }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: "center" }}>
            <Box component="span" sx={sxBadge}>
              <Gift size={12} style={{ marginRight: 6 }} />
              EARN MORE
            </Box>
            <Typography
              variant="h2"
              isBold
              sx={{ mt: 2, fontSize: { xs: "1.875rem", sm: "2.25rem", lg: "3rem" } }}
            >
              Best Ways to{" "}
              <Typography component="span" isGradient isBold sx={{ fontSize: "inherit" }}>
                Earn
              </Typography>
            </Typography>
            <Typography sx={{ mt: 1.5, color: colors.textSecondary }}>
              Choose from hundreds of offers
            </Typography>
          </Box>

          <Grid container spacing={3} sx={{ mt: 7 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <EarnCard
                icon={<Gamepad2 size={32} />}
                title="Play Games"
                description="Gaming companies pay you to play their games. Let's play!"
                earn="$1 - $120"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <EarnCard
                icon={<FileText size={32} />}
                title="Complete Surveys"
                description="Share your opinion and get paid for your valuable feedback."
                earn="$0.50 - $5"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <EarnCard
                icon={<Smartphone size={32} />}
                title="Try Apps"
                description="Download and try new apps while earning money. Simple!"
                earn="$1 - $75"
              />
            </Grid>
          </Grid>


        </Container>
      </Box>

      {/* ===================== STATS / TRUST ===================== */}
      <Divider sx={{ borderColor: colors.divider }} />
      <Box
        component="section"
        sx={{ px: { xs: 2, sm: 3, lg: 4 }, py: { xs: 8, sm: 10 } }}
      >
        <Container maxWidth="md">
          <Grid container spacing={3}>
            {[
              { value: "100+", label: "Countries Supported" },
              { value: "500+", label: "Available Offers" },
              { value: "Instant", label: "Crypto Payouts" },
              { value: "$2", label: "Minimum Cashout" },
            ].map((stat) => (
              <Grid key={stat.label} size={{ xs: 6, sm: 3 }}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    isBold
                    isGradient
                    sx={{ fontSize: { xs: "1.75rem", sm: "2.25rem" } }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography sx={{ fontSize: "0.85rem", color: colors.textSecondary, mt: 0.5 }}>
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ===================== FEATURES ===================== */}
      <Divider sx={{ borderColor: colors.divider }} />
      <Box
        component="section"
        id="features"
        sx={{ px: { xs: 2, sm: 3, lg: 4 }, py: { xs: 10, sm: 14 } }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: "center" }}>
            <Box component="span" sx={sxBadge}>
              <Star size={12} style={{ marginRight: 6 }} />
              WHY US
            </Box>
            <Typography
              variant="h2"
              isBold
              sx={{ mt: 2, fontSize: { xs: "1.875rem", sm: "2.25rem", lg: "3rem" } }}
            >
              Why Choose{" "}
              <Typography component="span" isGradient isBold sx={{ fontSize: "inherit" }}>
                Rewardoxy
              </Typography>
              ?
            </Typography>
          </Box>

          <Grid container spacing={2.5} sx={{ mt: 7 }}>
            {[
              {
                icon: <DollarSign size={24} color={colors.green} />,
                title: "Crypto Payouts",
                description: "Withdraw USDT via TRC-20, BEP-20, or SOL",
              },
              {
                icon: <CalendarCheck size={24} color={colors.green} />,
                title: "Daily Bonus",
                description: "Free coins every day with streak rewards",
              },
              {
                icon: <Trophy size={24} color={colors.green} />,
                title: "Leaderboard",
                description: "Compete with others and win extra rewards",
              },
              {
                icon: <Users size={24} color={colors.green} />,
                title: "Referral Program",
                description: "Invite friends and earn bonus coins",
              },
            ].map((feature) => (
              <Grid key={feature.title} size={{ xs: 12, sm: 6, lg: 3 }}>
                <FeatureCard
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ===================== PAYMENT METHODS ===================== */}
      <Divider sx={{ borderColor: colors.divider }} />
      <Box
        component="section"
        sx={{ px: { xs: 2, sm: 3, lg: 4 }, py: { xs: 10, sm: 14 } }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: "center" }}>
            <Box component="span" sx={sxBadge}>
              <CreditCard size={12} style={{ marginRight: 6 }} />
              CASHOUT
            </Box>
            <Typography
              variant="h2"
              isBold
              sx={{ mt: 2, fontSize: { xs: "1.875rem", sm: "2.25rem" } }}
            >
              Choose Your{" "}
              <Typography component="span" isGradient isBold sx={{ fontSize: "inherit" }}>
                Reward
              </Typography>
            </Typography>
            <Typography sx={{ mt: 1.5, color: colors.textSecondary }}>
              Multiple withdrawal options available
            </Typography>
          </Box>

          <Grid container spacing={2} sx={{ mt: 6 }} columns={{ xs: 3, sm: 3 }}>
            {[
              { name: "USDT", sub: "TRC-20" },
              { name: "USDT", sub: "BEP-20" },
              { name: "SOL", sub: "Solana" },
            ].map((p) => (
              <Grid key={p.sub} size={{ xs: 1, sm: 1 }}>
                <Paper
                  elevation={0}
                  sx={{
                    ...sxCard,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                    p: 3,
                    textAlign: "center",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 48,
                      height: 48,
                      borderRadius: "12px",
                      bgcolor: colors.greenTint,
                      border: `1px solid rgba(1,214,118,0.2)`,
                    }}
                  >
                    <Bitcoin size={20} color={colors.green} />
                  </Box>
                  <Typography sx={{ fontSize: "0.875rem", fontWeight: 600 }}>
                    {p.name}
                  </Typography>
                  <Typography sx={{ fontSize: "0.75rem", color: colors.textSecondary }}>
                    {p.sub}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ===================== FAQ ===================== */}
      <Divider sx={{ borderColor: colors.divider }} />
      <Box
        component="section"
        id="faq"
        sx={{ px: { xs: 2, sm: 3, lg: 4 }, py: { xs: 10, sm: 14 } }}
      >
        <Container maxWidth="sm">
          <Box sx={{ textAlign: "center" }}>
            <Box component="span" sx={sxBadge}>
              FAQ
            </Box>
            <Typography
              variant="h2"
              isBold
              sx={{ mt: 2, fontSize: { xs: "1.875rem", sm: "2.25rem" } }}
            >
              Frequently Asked{" "}
              <Typography component="span" isGradient isBold sx={{ fontSize: "inherit" }}>
                Questions
              </Typography>
            </Typography>
          </Box>

          <Box sx={{ mt: 6, display: "flex", flexDirection: "column", gap: 1.5 }}>
            <FaqItem
              q="How much can I earn?"
              a="Earnings vary based on the offers you complete. Active users typically earn $5-$50 per month, with top earners making much more."
            />
            <FaqItem
              q="What is the minimum withdrawal?"
              a="The minimum withdrawal is 2,000 coins ($2.00 USD). You can withdraw via USDT on TRC-20, BEP-20, or SOL networks."
            />
            <FaqItem
              q="How quickly will I get paid?"
              a="Most withdrawals are processed within minutes. USDT transfers are near-instant once approved."
            />
            <FaqItem
              q="Is Rewardoxy free to use?"
              a="Yes! Rewardoxy is completely free to join and use. You never have to pay anything to earn rewards."
            />
            <FaqItem
              q="How does Rewardoxy make money?"
              a="We partner with companies who want to advertise their apps, surveys, and products. When you complete their offers, they pay us and we share the earnings with you."
            />
          </Box>
        </Container>
      </Box>

      {/* ===================== FINAL CTA ===================== */}
      <Divider sx={{ borderColor: colors.divider }} />
      <Box
        component="section"
        sx={{ px: { xs: 2, sm: 3, lg: 4 }, py: { xs: 10, sm: 14 } }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={0}
            sx={{
              ...sxCard,
              p: { xs: 5, sm: 8 },
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                mx: "auto",
                mb: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 64,
                height: 64,
                borderRadius: "16px",
                background: "linear-gradient(135deg, #01D676 0%, #007e45 100%)",
                boxShadow: "0 8px 32px rgba(1,214,118,0.25)",
              }}
            >
              <Sparkles size={32} color="#fff" />
            </Box>
            <Typography
              variant="h2"
              isBold
              sx={{ fontSize: { xs: "1.875rem", sm: "2.25rem" } }}
            >
              Start Earning{" "}
              <Typography component="span" isGradient isBold sx={{ fontSize: "inherit" }}>
                Today
              </Typography>
            </Typography>
            <Typography
              sx={{ mt: 2, fontSize: "1.125rem", color: colors.textSecondary }}
            >
              Join thousands of people earning money online with Rewardoxy. Sign up now
              and claim your first bonus!
            </Typography>
            <Button
              component={Link}
              href={isAuthenticated ? "/earn" : "/auth/signup"}
              variant="contained"
              sx={{
                ...sxGradientBtn,
                mt: 4,
                height: 56,
                px: 5,
                fontSize: "1rem",
                boxShadow: "0 8px 32px rgba(1,214,118,0.25)",
                gap: 1,
              }}
            >
              {isAuthenticated ? "Start Earning" : "Create Free Account"}
              <ArrowRight size={20} />
            </Button>
          </Paper>
        </Container>
      </Box>

      {/* ===================== FOOTER ===================== */}
      <Divider sx={{ borderColor: colors.divider }} />
      <Box
        component="footer"
        sx={{
          bgcolor: colors.bgCard,
          px: { xs: 2, sm: 3, lg: 4 },
          py: 6,
        }}
      >
        <Container maxWidth="md">
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "center",
              justifyContent: { sm: "space-between" },
              gap: 4,
            }}
          >
            <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
              <Icons.Logo />
              <Typography
                sx={{ mt: 1, fontSize: "0.875rem", color: colors.textSecondary }}
              >
                Complete tasks. Earn rewards. Withdraw crypto.
              </Typography>
            </Box>
            <Box
              component="nav"
              sx={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: 3,
                fontSize: "0.875rem",
              }}
            >
              {[
                { label: "Terms", href: "/terms" },
                { label: "Privacy", href: "/privacy" },
                { label: "Contact", href: "/contact" },
              ].map((item) => (
                <Box
                  key={item.href}
                  component={Link}
                  href={item.href}
                  sx={{
                    color: colors.textSecondary,
                    textDecoration: "none",
                    transition: "color 0.2s",
                    "&:hover": { color: colors.textPrimary },
                  }}
                >
                  {item.label}
                </Box>
              ))}
            </Box>
          </Box>

          <Divider sx={{ borderColor: colors.divider, my: 4 }} />

          <Typography
            alignCenter
            sx={{ fontSize: "0.75rem", color: "rgba(169,169,202,0.5)" }}
          >
            &copy; {new Date().getFullYear()} Rewardoxy. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}

/* ================================================================
   SUB-COMPONENTS
   ================================================================ */

function StepCard({
  step,
  icon,
  title,
  description,
}: {
  step: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        ...sxCard,
        position: "relative",
        p: 4,
        textAlign: "center",
      }}
    >
      {/* Step number badge */}
      <Box
        sx={{
          position: "absolute",
          top: -12,
          left: "50%",
          transform: "translateX(-50%)",
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
            background: colors.gradient,
            fontSize: "0.75rem",
            fontWeight: 700,
            color: colors.textPrimary,
            boxShadow: "0 4px 12px rgba(1,214,118,0.3)",
          }}
        >
          {step}
        </Box>
      </Box>

      <Box
        sx={{
          mx: "auto",
          mt: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 56,
          height: 56,
          borderRadius: "16px",
          bgcolor: colors.greenTint,
          border: `1px solid rgba(1,214,118,0.2)`,
        }}
      >
        {icon}
      </Box>
      <Typography variant="h6" isBold sx={{ mt: 2.5, fontSize: "1.125rem" }}>
        {title}
      </Typography>
      <Typography
        sx={{ mt: 1, fontSize: "0.875rem", lineHeight: 1.7, color: colors.textSecondary }}
      >
        {description}
      </Typography>
    </Paper>
  );
}

function EarnCard({
  icon,
  title,
  description,
  earn,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  earn: string;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        ...sxCard,
        p: 4,
        textAlign: "center",
      }}
    >
      <Box
        sx={{
          mx: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 64,
          height: 64,
          borderRadius: "16px",
          bgcolor: colors.greenTint,
          border: `1px solid rgba(1,214,118,0.2)`,
          color: colors.green,
        }}
      >
        {icon}
      </Box>
      <Typography variant="h6" isBold sx={{ mt: 2.5, fontSize: "1.25rem" }}>
        {title}
      </Typography>
      <Typography sx={{ mt: 1, fontSize: "0.875rem", color: colors.textSecondary }}>
        {description}
      </Typography>
      <Box
        sx={{
          mt: 2,
          display: "inline-flex",
          alignItems: "center",
          gap: 0.75,
          borderRadius: "100px",
          bgcolor: colors.greenTint,
          border: `1px solid rgba(1,214,118,0.2)`,
          px: 1.5,
          py: 0.75,
          fontSize: "0.875rem",
          fontWeight: 700,
          color: colors.green,
        }}
      >
        Earn {earn}
      </Box>
    </Paper>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        ...sxCard,
        p: 3,
        textAlign: "center",
      }}
    >
      <Box
        sx={{
          mx: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 48,
          height: 48,
          borderRadius: "12px",
          bgcolor: colors.bgButton,
          border: `1px solid ${colors.divider}`,
        }}
      >
        {icon}
      </Box>
      <Typography sx={{ mt: 2, fontWeight: 600 }}>{title}</Typography>
      <Typography sx={{ mt: 0.75, fontSize: "0.875rem", color: colors.textSecondary }}>
        {description}
      </Typography>
    </Paper>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <Accordion
      disableGutters
      elevation={0}
      sx={{
        bgcolor: colors.bgCard,
        border: `1px solid ${colors.divider}`,
        borderRadius: "16px !important",
        overflow: "hidden",
        transition: "border-color 0.3s, box-shadow 0.3s",
        "&:before": { display: "none" },
        "&.Mui-expanded": {
          borderColor: "rgba(1,214,118,0.3)",
          boxShadow: "0 8px 32px rgba(1,214,118,0.05)",
        },
      }}
    >
      <AccordionSummary
        expandIcon={<ChevronDown size={20} color={colors.textSecondary} />}
        sx={{
          px: 3,
          py: 0.5,
          fontWeight: 600,
          color: colors.textPrimary,
          "&:hover": { color: colors.green },
          "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
            "& svg": { color: colors.green },
          },
        }}
      >
        <Typography sx={{ fontWeight: 600 }}>{q}</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 3, pb: 2.5, pt: 0 }}>
        <Typography
          sx={{ fontSize: "0.875rem", lineHeight: 1.7, color: colors.textSecondary }}
        >
          {a}
        </Typography>
      </AccordionDetails>
    </Accordion>
  );
}
