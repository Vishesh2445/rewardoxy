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
  Dialog,
  DialogContent,
  IconButton,
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
  X,
} from "lucide-react";
import Icons from "@/components/icons";
import Typography from "@/components/ui/Typography";
import OfferwallModal from "@/components/offerwall-modal";
import ProviderCarousel from "@/components/provider-carousel";
import { createClient } from "@/lib/supabase/client";
import Turnstile from "@/components/turnstile";

const colors = {
  bgPage: "#0D0E12",
  bgCard: "#232645",
  bgInput: "#252539",
  bgButton: "#2F3043",
  green: "#10B981",
  greenDark: "#059669",
  textPrimary: "#ffffff",
  textSecondary: "#a9a9ca",
  divider: "#2a2b43",
  greenTint: "rgba(16,185,129,0.1)",
  gradient: "linear-gradient(180deg, #10B981 0, #059669 100%)",
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
  border: "none",
  borderRadius: "16px",
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
  border: `1px solid rgba(16,185,129,0.2)`,
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
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "signup" | "forgotPassword">("signup");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });
    if (error) {
      setLoginError(error.message);
      setLoginLoading(false);
    } else {
      router.push("/earn");
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setForgotError(null);
    setForgotLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: "https://www.rewardoxy.app/auth/callback",
    });
    if (error) {
      setForgotError(error.message);
      setForgotLoading(false);
    } else {
      setForgotSent(true);
      setForgotLoading(false);
    }
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        router.push("/earn");
      }
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

    if (!turnstileToken) {
      setSignupError("Please complete the verification");
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
          turnstile_token: turnstileToken,
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        setSignupError(body.error || "Failed to create profile");
        setSignupLoading(false);
        return;
      }

      router.push("/earn");
    }

    setSignupLoading(false);
  }

  async function handleGoogleSignup() {
    setSignupError(null);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://www.rewardoxy.app/auth/callback'
      }
    });
    if (oauthError) {
      setSignupError(oauthError.message);
    }
  }

  return (
    isAuthenticated === null ? null : (
    <Box className="glow-bg" sx={{ minHeight: "100vh", bgcolor: colors.bgPage, color: colors.textPrimary }}>
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
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 64,
            maxWidth: "1200px",
            mx: "auto",
            px: { xs: 2, sm: 3, lg: 4 },
          }}
        >
          <Icons.Logo />

          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 4 }}>
            {[
              { label: "About", href: "/about" },
              { label: "Surveys", href: "/surveys" },
              { label: "Rewards", href: "/rewards" },
              { label: "FAQ", href: "/faq" },
              { label: "Contact", href: "/contact" },
            ].map((item) => (
              <Box
                key={item.href}
                component={Link}
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
                href="/earn"
                variant="contained"
                sx={{
                  ...sxGradientBtn,
                  height: 40,
                  px: 2.5,
                  fontSize: "0.875rem",
                  borderRadius: "8px",
                }}
              >
                Earn
              </Button>
            ) : (
              <>
                <Button
                  variant="text"
                  onClick={() => { setAuthModalMode("login"); setAuthModalOpen(true); }}
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
                  variant="contained"
                  onClick={() => { setAuthModalMode("signup"); setAuthModalOpen(true); }}
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
        </Box>
      </Box>

      {/* ===================== HERO ===================== */}
      <Box
        component="section"
        sx={{
          position: "relative",
          overflow: "hidden",
          pt: { xs: 6, sm: 8 },
          pb: { xs: 6, sm: 8 },
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
              background: "rgba(16,185,129,0.05)",
              filter: "blur(150px)",
            }}
          />
        </Box>

        <Box
          sx={{
            position: "relative",
            maxWidth: "1200px",
            mx: "auto",
            px: { xs: 2, sm: 3, lg: 4 },
          }}
        >
          {/* Main Heading - Full Width at Top Center */}
          <Box sx={{ textAlign: "center", mb: { xs: 4, sm: 6 } }}>
            <Typography
              variant="h1"
              isBold
              sx={{
                fontSize: { xs: "1.75rem", sm: "2.5rem", lg: "3rem" },
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
                fontWeight: 800,
              }}
            >
              <Typography
                component="span"
                isGradient
                isBold
                sx={{ fontSize: "inherit", lineHeight: "inherit", fontWeight: 800 }}
              >
                Get paid
              </Typography>{" "}
              for testing apps,
              <br />
              games & surveys
            </Typography>

            <Box
              sx={{
                mt: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                flexWrap: "wrap",
                fontSize: { xs: "0.85rem", sm: "0.95rem" },
              }}
            >
              <Typography sx={{ color: colors.textSecondary }}>
                Earn up to{" "}
                <Typography component="span" isBold sx={{ color: colors.green }}>
                  $391
                </Typography>{" "}
                per offer
              </Typography>
              <Box
                sx={{
                  width: 3,
                  height: 3,
                  borderRadius: "50%",
                  bgcolor: colors.green,
                }}
              />
              <Typography sx={{ color: colors.textSecondary }}>
                <Typography component="span" isBold sx={{ color: colors.green }}>
                  500+
                </Typography>{" "}
                Offers available now
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={4} alignItems="flex-start">
            {/* Left side — Game cards only */}
            <Grid size={{ xs: 12, md: 6 }}>
              {/* Game Cards */}
              <Grid container columnSpacing={{ xs: 1.5, sm: 3 }} rowSpacing={{ xs: 1.5, sm: 3 }} sx={{ mt: { xs: 4, sm: 6 } }}>
                  {[
                    {
                      image: "/sunshine_island.webp",
                      title: "Sunshine Island",
                      subtitle: "Match & earn",
                      reward: "$391.00",
                      rating: "5.0",
                    },
                    {
                      image: "/match_masters.webp",
                      title: "Match Masters",
                      subtitle: "Play duels",
                      reward: "$280.00",
                      rating: "5.0",
                    },
                    {
                      image: "/animals.jpeg",
                      title: "Animals & Coins",
                      subtitle: "Complete islands",
                      reward: "$78.00",
                      rating: "5.0",
                    },
                  ].map((game, index) => (
                    <Grid key={game.title} size={{ xs: 4, sm: 4 }} sx={{ display: "flex", minWidth: 0 }}>
                      <Paper
                        elevation={0}
                        onClick={() => { setAuthModalMode("signup"); setAuthModalOpen(true); }}
                        sx={{
                          bgcolor: colors.bgCard,
                          border: "none",
                          borderRadius: { xs: "10px", sm: "16px" },
                          p: { xs: 1, sm: 2 },
                          textAlign: "left",
                          cursor: "pointer",
                          transition: "all 0.3s",
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          // Middle card (index 1) always has hover effect
                          transform: index === 1 ? "translateY(-4px)" : "none",
                          boxShadow: index === 1 ? `0 12px 24px rgba(16,185,129,0.15)` : "none",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: `0 12px 24px rgba(16,185,129,0.15)`,
                          },
                        }}
                      >
                        <Box
                          component="img"
                          src={game.image}
                          alt={game.title}
                          sx={{
                            width: "100%",
                            aspectRatio: "1",
                            borderRadius: { xs: "7px", sm: "10px" },
                            mb: { xs: 0.75, sm: 1.5 },
                            objectFit: "cover",
                          }}
                        />
                        <Typography variant="h6" isBold sx={{ fontSize: { xs: "0.75rem", sm: "0.95rem" }, mb: { xs: 0.2, sm: 0.5 }, lineHeight: 1.25 }}>
                          {game.title}
                        </Typography>
                        <Typography sx={{ fontSize: { xs: "0.6rem", sm: "0.75rem" }, color: colors.textSecondary, mb: { xs: 0.75, sm: 1.5 }, lineHeight: 1.25 }}>
                          {game.subtitle}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", mt: "auto" }}>
                          <Box>
                            <Typography sx={{ fontSize: { xs: "0.5rem", sm: "0.65rem" }, color: colors.textSecondary, mb: 0.2 }}>
                              UP TO
                            </Typography>
                            <Typography isBold sx={{ fontSize: { xs: "0.85rem", sm: "1.05rem" }, color: colors.textPrimary }}>
                              {game.reward}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>

                {/* Survey Cards - matching earn page design */}
                <Grid container columnSpacing={{ xs: 1.5, sm: 3 }} rowSpacing={{ xs: 1.5, sm: 3 }} sx={{ mt: { xs: 2, sm: 3 }, justifyContent: "center" }}>
                  {[
                    { loi: "6", payout: "3.00" },
                    { loi: "9", payout: "6.00" },
                    ].map((survey) => (
                    <Grid key={survey.loi} size={{ xs: 4, sm: 4 }} sx={{ display: "flex", minWidth: 0 }}>
                      <Box
                        onClick={() => { setAuthModalMode("signup"); setAuthModalOpen(true); }}
                        sx={{
                          bgcolor: colors.bgCard,
                          p: { xs: 0.75, sm: 1.5 },
                          borderRadius: { xs: 1.5, sm: 2.5 },
                          cursor: "pointer",
                          transition: "all 0.3s",
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          "&:hover": {
                            bgcolor: "#2a2b4a",
                            transform: "translateY(-4px)",
                            boxShadow: "0 12px 24px rgba(37, 100, 79, 0.15)",
                          },
                        }}
                      >
                        <Box sx={{ position: "relative", mb: { xs: 1, sm: 1.5 } }}>
                          <Box
                            sx={{
                              width: "100%",
                              aspectRatio: "1",
                              borderRadius: { xs: 1, sm: 1.5 },
                              overflow: "hidden",
                              background: "linear-gradient(135deg, rgba(20, 184, 166, 0.15) 0%, rgba(13, 148, 136, 0.25) 100%)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexDirection: "column",
                              gap: 0.5,
                            }}
                          >
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '40%', height: '40%', color: '#14b8a6' }}>
                              <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM7 10H9V17H7V10ZM11 7H13V17H11V7ZM15 13H17V17H15V13Z" fill="currentColor"/>
                            </svg>
                            <Typography sx={{ fontSize: { xs: "0.625rem", sm: "0.75rem" }, color: "#14b8a6", fontWeight: 700 }}>
                              {survey.loi} min
                            </Typography>
                          </Box>
                        </Box>
                        <Typography
                          sx={{
                            fontSize: { xs: "0.6rem", sm: "0.6875rem" },
                            color: "rgba(255,255,255,0.5)",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            fontWeight: 600,
                            mb: { xs: 0.5, sm: 1 },
                          }}
                        >
                          CPX Survey
                        </Typography>
                        <Typography sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" }, fontWeight: 700, color: "#10B981", mt: "auto" }}>
                          ${survey.payout}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
            </Grid>

            {/* Right side — signup card */}
            <Grid size={{ xs: 12, md: 6 }}>
              {isAuthenticated ? (
                <Paper
                  elevation={0}
                  sx={{
                    bgcolor: colors.bgCard,
                    border: "none",
                    borderRadius: "16px",
                    p: { xs: 3, sm: 3 },
                    textAlign: "center",
                  }}
                >
                  <Box
                    component="img"
                    src="/rewardoxy_logocontinue.png"
                    alt=""
                    sx={{
                      width: 56,
                      height: 56,
                      mx: "auto",
                      mb: 1.5,
                      display: "block",
                      borderRadius: "12px",
                    }}
                  />
                  <Typography variant="h5" isBold sx={{ mb: 0.5, fontSize: "1.2rem" }}>
                    Welcome Back!
                  </Typography>
                  <Typography sx={{ fontSize: "0.85rem", color: colors.textSecondary, mb: 2 }}>
                    Continue earning coins and cash out anytime.
                  </Typography>
                  <Button
                    component={Link}
                    href="/earn"
                    variant="contained"
                    fullWidth
                    sx={{
                      ...sxGradientBtn,
                      height: 44,
                      fontSize: "0.9rem",
                      gap: 0.75,
                    }}
                  >
                    Start Earning
                    <ArrowRight size={16} />
                  </Button>
                </Paper>
              ) : (
                <Paper
                  elevation={0}
                  sx={{
                    bgcolor: colors.bgCard,
                    border: "none",
                    borderRadius: "16px",
                    p: { xs: 3, sm: 3 },
                  }}
                >
                  <Typography variant="h5" isBold sx={{ mb: 0.75, textAlign: "center", fontSize: "1.4rem" }}>
                    Sign Up for Free
                  </Typography>

                  {/* Signup form */}
                  <Box
                    component="form"
                    onSubmit={handleSignup}
                    sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 2 }}
                  >
                    <TextField
                      type="email"
                      required
                      placeholder="Email address"
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
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          height: 44,
                          fontSize: "0.875rem",
                          bgcolor: colors.bgInput,
                          borderRadius: "8px",
                        },
                      }}
                    />

                    <TextField
                      type="password"
                      required
                      placeholder="Password (min 6 characters)"
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
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          height: 44,
                          fontSize: "0.875rem",
                          bgcolor: colors.bgInput,
                          borderRadius: "8px",
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
                          height: 44,
                          fontSize: "0.85rem",
                          bgcolor: colors.bgInput,
                          borderRadius: "8px",
                        },
                      }}
                    />

                    {signupError && (
                      <Alert severity="error" sx={{ fontSize: "0.8rem", py: 0.5 }}>
                        {signupError}
                      </Alert>
                    )}

                    {/* Terms Checkbox */}
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={acceptedTerms}
                          onChange={(e) => setAcceptedTerms(e.target.checked)}
                          sx={{ color: colors.textSecondary, py: 0.25 }}
                          size="small"
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
                      sx={{ alignItems: "flex-start", my: 0 }}
                    />

                    {/* Turnstile Verification */}
                    <Turnstile
                      onVerify={(token) => setTurnstileToken(token)}
                      onError={() => {
                        setSignupError("Verification failed. Please try again.");
                        setTurnstileToken(null);
                      }}
                      onExpire={() => {
                        setSignupError("Verification expired. Please verify again.");
                        setTurnstileToken(null);
                      }}
                    />

                    <Button
                      type="submit"
                      fullWidth
                      disabled={signupLoading}
                      sx={{
                        ...sxGradientBtn,
                        height: 46,
                        fontSize: "0.95rem",
                        fontWeight: 700,
                        gap: 0.75,
                        mt: 0.5,
                      }}
                    >
                      {signupLoading ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : (
                        <>
                          Start earning now
                          <ArrowRight size={16} />
                        </>
                      )}
                    </Button>
                  </Box>

                  <Divider sx={{ borderColor: colors.divider, my: 2, fontSize: "0.75rem", color: colors.textSecondary }}>
                    OR
                  </Divider>

                  {/* Social buttons */}
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                    <Button
                      onClick={handleGoogleSignup}
                      fullWidth
                      sx={{
                        height: 44,
                        textTransform: "none",
                        fontWeight: 600,
                        borderRadius: "8px",
                        bgcolor: "#fff",
                        color: "#333",
                        fontSize: "0.875rem",
                        gap: 1.25,
                        border: `1px solid ${colors.divider}`,
                        "&:hover": { bgcolor: "#f5f5f5" },
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 18 18">
                        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                        <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                        <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 2.58 9 2.58z" fill="#EA4335"/>
                      </svg>
                      Sign Up with Google
                    </Button>
                  </Box>

                  <Typography sx={{ mt: 2, fontSize: "0.8rem", color: colors.textSecondary, textAlign: "center" }}>
                    Already have an account?{" "}
                    <Box
                      component="span"
                      onClick={() => { setAuthModalMode("login"); setAuthModalOpen(true); }}
                      sx={{ color: colors.green, cursor: "pointer", fontWeight: 600 }}
                    >
                      Sign In
                    </Box>
                  </Typography>
                </Paper>
              )}
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* ===================== TRUSTED OFFER PROVIDERS ===================== */}
      <Divider sx={{ borderColor: colors.divider }} />
      <Box
        component="section"
        sx={{
          px: { xs: 2, sm: 3, lg: 4 },
          py: { xs: 10, sm: 14 },
          bgcolor: colors.bgPage,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <Typography
              variant="h2"
              isBold
              sx={{
                fontSize: { xs: "1.875rem", sm: "2.25rem", lg: "3rem" },
                color: colors.green,
                mb: 2,
              }}
            >
              Offer providers
            </Typography>
            <Typography sx={{ fontSize: "1rem", color: colors.textSecondary, maxWidth: 600, mx: "auto" }}>
              We partner with established offerwalls so you always have something new to complete.
            </Typography>
          </Box>

          <ProviderCarousel />
        </Container>
      </Box>

      {/* ===================== HOW IT WORKS ===================== */}
      <Divider sx={{ borderColor: colors.divider }} />
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
              { value: "$2", label: "Minimum Cashout" },
            ].map((stat) => (
              <Grid key={stat.label} size={{ xs: 6, sm: 4 }}>
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
                description: "Withdraw crypto via LTC",
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
              component="img"
              src="/rewardoxy_logocontinue.png"
              alt="Rewardoxy"
              sx={{
                width: 80,
                height: 80,
                mx: "auto",
                mb: 3,
                display: "block",
                borderRadius: "16px",
              }}
            />
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
              variant="contained"
              onClick={isAuthenticated ? () => router.push("/earn") : () => { setAuthModalMode("signup"); setAuthModalOpen(true); }}
              sx={{
                ...sxGradientBtn,
                mt: 4,
                height: 56,
                px: 5,
                fontSize: "1rem",
                boxShadow: "0 8px 32px rgba(16,185,129,0.25)",
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
                    { text: "Profile", url: "/profile" },
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
                  {title === "Contact" && (
                    <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                      <Box
                        component="a"
                        href="https://t.me/rewardoxy"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Telegram"
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.2s",
                          "&:hover": {
                            transform: "translateY(-2px)",
                          },
                        }}
                      >
                        <Icons.Telegram size={28} />
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Auth Modal */}
      <Dialog
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { bgcolor: colors.bgPage, borderRadius: "16px", border: "none" } }}
      >
        <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 1, pr: 1 }}>
          <IconButton onClick={() => setAuthModalOpen(false)} sx={{ color: colors.textSecondary }}>
            <X size={18} />
          </IconButton>
        </Box>
        <DialogContent sx={{ px: { xs: 2, sm: 3 }, pb: 3 }}>
          {authModalMode === "signup" ? (
            <>
              <Typography variant="h5" isBold sx={{ mb: 0.5, textAlign: "center", fontSize: "1.3rem" }}>
                Sign Up for Free
              </Typography>
              <Box component="form" onSubmit={handleSignup} sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 2 }}>
                <TextField
                  type="email" required placeholder="Email address"
                  value={email} onChange={(e) => setEmail(e.target.value)} size="small"
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><Mail size={16} color={colors.textSecondary} /></InputAdornment> } }}
                  sx={{ "& .MuiOutlinedInput-root": { height: 44, fontSize: "0.875rem", bgcolor: colors.bgInput, borderRadius: "8px" } }}
                />
                <TextField
                  type="password" required placeholder="Password (min 6 characters)"
                  value={password} onChange={(e) => setPassword(e.target.value)} size="small" inputProps={{ minLength: 6 }}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><Lock size={16} color={colors.textSecondary} /></InputAdornment> } }}
                  sx={{ "& .MuiOutlinedInput-root": { height: 44, fontSize: "0.875rem", bgcolor: colors.bgInput, borderRadius: "8px" } }}
                />
                <TextField
                  placeholder="Referral code (optional)" value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)} size="small"
                  sx={{ "& .MuiOutlinedInput-root": { height: 44, fontSize: "0.85rem", bgcolor: colors.bgInput, borderRadius: "8px" } }}
                />
                {signupError && <Alert severity="error" sx={{ fontSize: "0.8rem", py: 0.5 }}>{signupError}</Alert>}
                <FormControlLabel
                  control={<Checkbox checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} sx={{ color: colors.textSecondary, py: 0.25 }} size="small" />}
                  label={<Typography sx={{ fontSize: "0.75rem", color: colors.textSecondary }}>
                    I agree to the{" "}
                    <Link href="/terms" target="_blank" style={{ color: colors.green, textDecoration: "none" }}>Terms</Link>{" and "}
                    <Link href="/privacy" target="_blank" style={{ color: colors.green, textDecoration: "none" }}>Privacy</Link>
                  </Typography>}
                  sx={{ alignItems: "flex-start", my: 0 }}
                />
                <Turnstile onVerify={(token) => setTurnstileToken(token)} onError={() => setSignupError("Verification failed. Please try again.")} onExpire={() => setSignupError("Verification expired. Please verify again.")} />
                <Button type="submit" fullWidth disabled={signupLoading} sx={{ ...sxGradientBtn, height: 46, fontSize: "0.95rem", fontWeight: 700, gap: 0.75, mt: 0.5 }}>
                  {signupLoading ? <CircularProgress size={18} color="inherit" /> : <>Start earning now <ArrowRight size={16} /></>}
                </Button>
              </Box>
              <Divider sx={{ borderColor: colors.divider, my: 2, fontSize: "0.75rem", color: colors.textSecondary }}>OR</Divider>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                <Button onClick={handleGoogleSignup} fullWidth sx={{ height: 44, textTransform: "none", fontWeight: 600, borderRadius: "8px", bgcolor: "#fff", color: "#333", fontSize: "0.875rem", gap: 1.25, border: `1px solid ${colors.divider}`, "&:hover": { bgcolor: "#f5f5f5" } }}>
                  <svg width="18" height="18" viewBox="0 0 18 18">
                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 2.58 9 2.58z" fill="#EA4335"/>
                  </svg>
                  Sign Up with Google
                </Button>
              </Box>
              <Typography sx={{ mt: 2, fontSize: "0.8rem", color: colors.textSecondary, textAlign: "center" }}>
                Already have an account?{" "}
                <Box component="span" onClick={() => setAuthModalMode("login")} sx={{ color: colors.green, cursor: "pointer", fontWeight: 600 }}>Sign In</Box>
              </Typography>
            </>
          ) : authModalMode === "forgotPassword" ? (
            <>
              <Typography variant="h5" isBold sx={{ mb: 0.5, textAlign: "center", fontSize: "1.3rem" }}>
                Reset Password
              </Typography>
              {forgotSent ? (
                <Box sx={{ textAlign: "center", py: 2 }}>
                  <Typography sx={{ color: colors.green, fontWeight: 600, mb: 1 }}>Reset email sent successfully!</Typography>
                  <Typography sx={{ fontSize: "0.85rem", color: colors.textSecondary }}>Check your inbox for the password reset link.</Typography>
                  <Button onClick={() => { setAuthModalMode("login"); setForgotSent(false); }} fullWidth sx={{ mt: 3, ...sxGradientBtn, height: 44, fontSize: "0.9rem", fontWeight: 600 }}>Back to Sign In</Button>
                </Box>
              ) : (
                <>
                  <Typography sx={{ fontSize: "0.85rem", color: colors.textSecondary, textAlign: "center", mb: 2 }}>Enter your email and we'll send you a reset link.</Typography>
                  <Box component="form" onSubmit={handleForgotPassword} sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    <TextField
                      type="email" required placeholder="Email address"
                      value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} size="small"
                      slotProps={{ input: { startAdornment: <InputAdornment position="start"><Mail size={16} color={colors.textSecondary} /></InputAdornment> } }}
                      sx={{ "& .MuiOutlinedInput-root": { height: 44, fontSize: "0.875rem", bgcolor: colors.bgInput, borderRadius: "8px" } }}
                    />
                    {forgotError && <Alert severity="error" sx={{ fontSize: "0.8rem", py: 0.5 }}>{forgotError}</Alert>}
                    <Button type="submit" fullWidth disabled={forgotLoading} sx={{ ...sxGradientBtn, height: 46, fontSize: "0.95rem", fontWeight: 700, gap: 0.75 }}>
                      {forgotLoading ? <CircularProgress size={18} color="inherit" /> : <>Send Reset Link <ArrowRight size={16} /></>}
                    </Button>
                  </Box>
                  <Box sx={{ textAlign: "center", mt: 2 }}>
                    <Box component="span" onClick={() => { setAuthModalMode("login"); setForgotSent(false); }} sx={{ color: colors.green, cursor: "pointer", fontSize: "0.85rem", fontWeight: 600 }}>Back to Sign In</Box>
                  </Box>
                </>
              )}
            </>
          ) : (
            <>
              <Typography variant="h5" isBold sx={{ mb: 0.5, textAlign: "center", fontSize: "1.3rem" }}>
                Sign In
              </Typography>
              <Box component="form" onSubmit={handleLogin} sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 2 }}>
                <TextField
                  type="email" required placeholder="Email address"
                  value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} size="small"
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><Mail size={16} color={colors.textSecondary} /></InputAdornment> } }}
                  sx={{ "& .MuiOutlinedInput-root": { height: 44, fontSize: "0.875rem", bgcolor: colors.bgInput, borderRadius: "8px" } }}
                />
                <TextField
                  type="password" required placeholder="Password"
                  value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} size="small"
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><Lock size={16} color={colors.textSecondary} /></InputAdornment> } }}
                  sx={{ "& .MuiOutlinedInput-root": { height: 44, fontSize: "0.875rem", bgcolor: colors.bgInput, borderRadius: "8px" } }}
                />
                {loginError && <Alert severity="error" sx={{ fontSize: "0.8rem", py: 0.5 }}>{loginError}</Alert>}
                <Button type="submit" fullWidth disabled={loginLoading} sx={{ ...sxGradientBtn, height: 46, fontSize: "0.95rem", fontWeight: 700, gap: 0.75 }}>
                  {loginLoading ? <CircularProgress size={18} color="inherit" /> : <>Sign In <ArrowRight size={16} /></>}
                </Button>
              </Box>
              <Box sx={{ textAlign: "center", mt: 1.5 }}>
                <Box component="span" onClick={() => { setAuthModalMode("forgotPassword"); setForgotEmail(loginEmail); }} sx={{ color: colors.green, cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>Forgot password?</Box>
              </Box>
              <Divider sx={{ borderColor: colors.divider, my: 2, fontSize: "0.75rem", color: colors.textSecondary }}>OR</Divider>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                <Button onClick={handleGoogleSignup} fullWidth sx={{ height: 44, textTransform: "none", fontWeight: 600, borderRadius: "8px", bgcolor: "#fff", color: "#333", fontSize: "0.875rem", gap: 1.25, border: `1px solid ${colors.divider}`, "&:hover": { bgcolor: "#f5f5f5" } }}>
                  <svg width="18" height="18" viewBox="0 0 18 18">
                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 2.58 9 2.58z" fill="#EA4335"/>
                  </svg>
                  Sign In with Google
                </Button>
              </Box>
              <Typography sx={{ mt: 2, fontSize: "0.8rem", color: colors.textSecondary, textAlign: "center" }}>
                Don't have an account?{" "}
                <Box component="span" onClick={() => setAuthModalMode("signup")} sx={{ color: colors.green, cursor: "pointer", fontWeight: 600 }}>Sign Up</Box>
              </Typography>
            </>
          )}
        </DialogContent>
      </Dialog>

    </Box>)
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
            boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
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
          border: `1px solid rgba(16,185,129,0.2)`,
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
          border: `1px solid rgba(16,185,129,0.2)`,
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
          border: `1px solid rgba(16,185,129,0.2)`,
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
          borderColor: "rgba(16,185,129,0.3)",
          boxShadow: "0 8px 32px rgba(16,185,129,0.05)",
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
