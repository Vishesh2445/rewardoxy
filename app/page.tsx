"use client";

import Link from "next/link";
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
} from "lucide-react";
import Icons from "@/components/icons";
import Typography from "@/components/ui/Typography";
import OfferwallModal from "@/components/offerwall-modal";

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
          pt: { xs: 10, sm: 14 },
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

        <Container maxWidth="md" sx={{ position: "relative", textAlign: "center" }}>
          <Typography
            variant="h1"
            isBold
            sx={{
              fontSize: { xs: "2.25rem", sm: "3rem", lg: "4.25rem" },
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
              mx: "auto",
              maxWidth: 600,
              fontSize: { xs: "1.125rem", sm: "1.25rem" },
              lineHeight: 1.7,
              color: colors.textSecondary,
            }}
          >
            Complete offers, play games, fill surveys and earn coins. Cash out instantly as
            USDT crypto. Free to join, worldwide.
          </Typography>

          <Box
            sx={{
              mt: 5,
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
            }}
          >
            <Button
              component={Link}
              href="/auth/signup"
              variant="contained"
              sx={{
                ...sxGradientBtn,
                height: 56,
                px: 5,
                fontSize: "1rem",
                boxShadow: "0 8px 32px rgba(1,214,118,0.2)",
                gap: 1,
              }}
            >
              Start Earning Now
              <ArrowRight size={20} />
            </Button>
            <Button
              component={Link}
              href="/auth/login"
              variant="contained"
              color="primary"
              sx={{
                height: 56,
                px: 5,
                fontSize: "1rem",
                fontWeight: 600,
                textTransform: "none",
                borderRadius: "12px",
                color: colors.textPrimary,
              }}
            >
              Sign In
            </Button>
          </Box>

          {/* Trust badges */}
          <Box
            sx={{
              mt: 6,
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
              gap: { xs: 3, sm: 4 },
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
                  }}
                >
                  {badge.icon}
                </Box>
                {badge.label}
              </Box>
            ))}
          </Box>
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

          <Box sx={{ mt: 10 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <DollarSign size={20} color={colors.green} />
              <Typography variant="h6" isBold>
                Offer Walls
              </Typography>
            </Box>
            <Box sx={{ mt: 3 }}>
              <OfferwallModal />
            </Box>
          </Box>
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

          <Grid container spacing={2} sx={{ mt: 6 }} columns={{ xs: 6, sm: 6 }}>
            {[
              { name: "USDT", sub: "TRC-20" },
              { name: "USDT", sub: "BEP-20" },
              { name: "SOL", sub: "Solana" },
              { name: "BTC", sub: "Bitcoin" },
              { name: "ETH", sub: "Ethereum" },
              { name: "LTC", sub: "Litecoin" },
            ].map((p) => (
              <Grid key={p.sub} size={{ xs: 2, sm: 1 }}>
                <Paper
                  elevation={0}
                  sx={{
                    ...sxCard,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                    p: 2,
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
                  <Typography sx={{ fontSize: "0.625rem", color: colors.textSecondary }}>
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
              href="/auth/signup"
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
              Create Free Account
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
