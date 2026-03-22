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
  Checkbox,
  FormControlLabel,
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

export default function Home() {
  const router = useRouter();
  const supabase = createClient();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [referralCode, setReferralCode] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAuthenticated(!!user);
    });
  }, []);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setSignupError(null);

    if (!acceptedTerms) {
      setSignupError("You must accept the Terms of Service and Privacy Policy to continue");
      setSignupLoading(false);
      return;
    }

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
          accepted_terms: true,
          is_google_oauth: false,
          referred_by: referralCode || undefined,
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
      provider: 'google',
      options: {
        redirectTo: 'https://rewardoxy.app/auth/callback'
      }
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
          px: { xs: 2, sm: 3, lg: 4 },
          pt: { xs: 8, sm: 12 },
          pb: { xs: 8, sm: 12 },
        }}
      >
        {/* Glow */}
        <Box
          sx={{
            pointerEvents: "none",
            position: "absolute",
            left: "50%",
            top: 0,
            transform: "translateX(-50%)",
          }}
        >
          <Box
            sx={{
              height: 600,
              width: 900,
              borderRadius: "50%",
              background: "rgba(1,214,118,0.05)",
              filter: "blur(150px)",
            }}
          />
        </Box>

        <Container maxWidth="lg" sx={{ position: "relative" }}>
          <Grid container spacing={6} alignItems="center">
            {/* Left side — headline */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography
                variant="h1"
                isBold
                sx={{
                  fontSize: { xs: "2.25rem", sm: "2.75rem", lg: "3.5rem" },
                  lineHeight: 1.15,
                  letterSpacing: "-0.02em",
                }}
              >
                Earn Money by
                <br />
                <Typography
                  component="span"
                  isGradient
                  isBold
                  sx={{ fontSize: "inherit", lineHeight: "inherit" }}
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
                      }}
                    >
                      {badge.icon}
                    </Box>
                    {badge.label}
                  </Box>
                ))}
              </Box>
            </Grid>

            {/* Right side — signup card or start earning */}
            <Grid size={{ xs: 12, md: 6 }}>
              {isAuthenticated ? (
                <Paper
                  elevation={0}
                  sx={{
                    ...sxCard,
                    p: { xs: 4, sm: 5 },
                    textAlign: "center",
                  }}
                >
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
                      boxShadow: "0 8px 32px rgba(1,214,118,0.25)",
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
                    }}
                  >
                    Start Earning
                    <ArrowRight size={20} />
                  </Button>
                </Paper>
              ) : (
                <Paper
                  elevation={0}
                  sx={{
                    ...sxCard,
                    p: { xs: 3, sm: 4 },
                  }}
                >
                  <Typography variant="h5" isBold sx={{ mb: 0.5, textAlign: "center" }}>
                    Create Free Account
                  </Typography>
                  <Typography sx={{ fontSize: "0.85rem", color: colors.textSecondary, textAlign: "center", mb: 3 }}>
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
                      "&:hover": { bgcolor: "#f5f5f5" },
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

                  <Divider sx={{ borderColor: colors.divider, mb: 2.5, fontSize: "0.75rem", color: colors.textSecondary }}>
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

                    {/* Referral Code - Optional */}
                    <TextField
                      placeholder="Referral code (optional)"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      size="small"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          fontSize: "0.85rem",
                        },
                      }}
                    />

                    {signupError && (
                      <Alert severity="error" sx={{ fontSize: "0.8rem" }}>
                        {signupError}
                      </Alert>
                    )}

                    {/* Terms Checkbox */}
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={acceptedTerms}
                          onChange={(e) => setAcceptedTerms(e.target.checked)}
                          sx={{ color: colors.textSecondary }}
                        />
                      }
                      label={
                        <Typography sx={{ fontSize: "0.75rem", color: colors.textSecondary }}>
                          I agree to the{" "}
                          <Link href="/terms" target="_blank" style={{ color: colors.green, textDecoration: "none" }}>
                            Terms
                          </Link>{" and "}
                          <Link href="/privacy" target="_blank" style={{ color: colors.green, textDecoration: "none" }}>
                            Privacy
                          </Link>
                        </Typography>
                      }
                      sx={{ alignItems: "flex-start", mt: 1 }}
                    />

                    <Button
                      type="submit"
                      fullWidth
                      disabled={signupLoading}
                      sx={{
                        ...sxGradientBtn,
                        height: 48,
                        fontSize: "0.95rem",
                        gap: 1,
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

                  <Typography sx={{ mt: 2, fontSize: "0.8rem", color: colors.textSecondary, textAlign: "center" }}>
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
                description="Cash out instantly to your LTC wallet."
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
              a="The minimum withdrawal is 2,000 coins ($2.00 USD). You can withdraw via your LTC wallet."
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
      <Box
        component="footer"
        sx={{
          bgcolor: colors.bgCard,
          borderTop: `1px solid ${colors.divider}`,
          mt: 4,
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            py: { xs: 6, md: 8 },
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            gap: { xs: 6, md: 10 },
          }}
        >
          {/* Branding & Copyright */}
          <Box sx={{ flexShrink: 0, display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Icons.Logo />
            <Typography sx={{ color: colors.textSecondary, fontSize: "0.875rem", maxWidth: 320 }}>
              Complete tasks. Earn rewards. Withdraw crypto. Join thousands earning USDT by completing offers, surveys and games.
            </Typography>
            <Typography sx={{ color: "rgba(169,169,202,0.5)", fontSize: "0.75rem", mt: { xs: 2, md: "auto" } }}>
              &copy; {new Date().getFullYear()} Rewardoxy. All rights reserved.
            </Typography>
          </Box>

          {/* Links Grid */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" },
              gap: { xs: 4, sm: 6 },
              flexGrow: 1,
            }}
          >
            {(
              [
                {
                  title: "Quick Links",
                  links: [
                    { text: "Earn", url: "/earn" },
                    { text: "Dashboard", url: "/dashboard" },
                    { text: "Leaderboard", url: "/leaderboard" },
                  ],
                },
                {
                  title: "About",
                  links: [
                    { text: "Terms of Service", url: "/terms" },
                    { text: "Privacy Policy", url: "/privacy" },
                  ],
                },
                {
                  title: "Support",
                  links: [
                    { text: "How It Works", url: "#how-it-works" },
                    { text: "FAQ", url: "#faq" },
                    { text: "Contact", url: "/contact" },
                  ],
                },
                {
                  title: "Contact",
                  links: [
                    { text: "support@rewardoxy.app", url: "mailto:support@rewardoxy.app", isEmail: true },
                  ],
                },
              ] as {
                title: string;
                links: { text: string; url: string; isEmail?: boolean }[];
              }[]
            ).map(({ title, links }) => (
              <Box key={title}>
                <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "0.875rem", mb: 2.5 }}>{title}</Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {links.map(({ text, url, isEmail }) => {
                    const LinkComponent = isEmail ? "a" : Link;
                    return (
                      <Box
                        key={text}
                        component={LinkComponent}
                        href={url}
                        target={isEmail ? "_blank" : undefined}
                        rel={isEmail ? "noopener noreferrer" : undefined}
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 1,
                          color: colors.textSecondary,
                          textDecoration: "none",
                          fontSize: "0.8125rem",
                          transition: "color 0.2s",
                          "&:hover": { color: colors.green },
                        }}
                      >
                        {isEmail && <Mail size={14} />}
                        {text}
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            ))}
          </Box>
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
