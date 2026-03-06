import { Box, Container, Divider } from "@mui/material";
import Icons from "@/components/icons";
import Typography from "@/components/ui/Typography";

const colors = {
  bgPage: "#141523",
  bgCard: "#1d1e30",
  green: "#01D676",
  textPrimary: "#ffffff",
  textSecondary: "#a9a9ca",
  divider: "#2a2b43",
};

export const metadata = {
  title: "Terms of Service - Rewardoxy",
};

export default function TermsPage() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: colors.bgPage, color: colors.textPrimary }}>
      {/* Nav */}
      <Box
        component="nav"
        sx={{
          borderBottom: `1px solid ${colors.divider}`,
          bgcolor: "rgba(20,21,35,0.8)",
          backdropFilter: "blur(24px)",
        }}
      >
        <Container
          maxWidth="md"
          sx={{ display: "flex", alignItems: "center", height: 64 }}
        >
          <Icons.Logo href="/" />
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: { xs: 6, sm: 10 } }}>
        <Typography
          variant="h3"
          isBold
          sx={{ mb: 1, fontSize: { xs: "1.75rem", sm: "2.25rem" } }}
        >
          Terms of Service
        </Typography>
        <Typography sx={{ color: colors.textSecondary, mb: 5, fontSize: "0.875rem" }}>
          Last updated: March 6, 2026
        </Typography>

        <Section title="1. Acceptance of Terms">
          By accessing or using Rewardoxy (&quot;the Platform&quot;), you agree to be bound by
          these Terms of Service. If you do not agree, you must not use the Platform.
        </Section>

        <Section title="2. Eligibility">
          You must be at least 18 years old (or the age of majority in your jurisdiction) to
          use Rewardoxy. You are allowed only one account per person. Creating multiple
          accounts will result in permanent suspension and forfeiture of all earned coins.
        </Section>

        <Section title="3. How It Works">
          Rewardoxy allows you to earn virtual coins by completing tasks provided by
          third-party offerwall partners (surveys, app installs, games, etc.). Coins
          accumulate in your account balance and can be withdrawn as cryptocurrency once you
          meet the minimum withdrawal threshold of 2,000 coins ($2.00 USD equivalent).
        </Section>

        <Section title="4. Coins & Withdrawals">
          Coins have no monetary value until a withdrawal is successfully processed. The
          exchange rate is 1,000 coins = $1.00 USD. Withdrawals are available in USDT
          (TRC-20, BEP-20) and SOL. Rewardoxy reserves the right to adjust the minimum
          withdrawal amount, processing times, and supported networks at any time.
          Withdrawal requests are reviewed and typically processed within 24-72 hours.
        </Section>

        <Section title="5. Prohibited Conduct">
          You agree not to: use bots, scripts, or automated tools to complete offers; create
          multiple accounts; use VPNs or proxies to manipulate your location for offers;
          provide false information on surveys or offers; attempt to exploit, hack, or
          reverse-engineer the Platform; engage in any form of fraud or abuse. Violations
          will result in account suspension, forfeiture of all coins, and a permanent ban.
        </Section>

        <Section title="6. Account Suspension & Termination">
          Rewardoxy reserves the right to suspend or terminate any account at our sole
          discretion, particularly in cases of suspected fraud, abuse, or violation of these
          Terms. Suspended or banned users cannot withdraw coins. Rewardoxy is not obligated
          to provide reasons for suspension.
        </Section>

        <Section title="7. Third-Party Offerwalls">
          Offers are provided by third-party partners. Rewardoxy is not responsible for the
          content, accuracy, or availability of third-party offers. If an offer does not
          credit properly, you may contact support, but Rewardoxy cannot guarantee
          resolution for issues originating from third-party providers.
        </Section>

        <Section title="8. Limitation of Liability">
          Rewardoxy is provided &quot;as is&quot; without warranties of any kind. We are not
          liable for any loss of coins, account data, or earnings due to technical issues,
          third-party failures, or circumstances beyond our control. Our total liability
          shall not exceed the amount of your most recent successful withdrawal.
        </Section>

        <Section title="9. Changes to Terms">
          We may update these Terms at any time. Continued use of the Platform after changes
          constitutes acceptance of the new Terms. We will notify users of significant
          changes via the Platform notification system.
        </Section>

        <Section title="10. Contact">
          For questions about these Terms, contact us at{" "}
          <Box
            component="a"
            href="mailto:support@rewardoxy.com"
            sx={{ color: colors.green, textDecoration: "none" }}
          >
            support@rewardoxy.com
          </Box>
          .
        </Section>
      </Container>

      {/* Footer */}
      <Divider sx={{ borderColor: colors.divider }} />
      <Box sx={{ bgcolor: colors.bgCard, py: 4 }}>
        <Container maxWidth="md">
          <Box sx={{ display: "flex", justifyContent: "center", gap: 3, fontSize: "0.875rem" }}>
            {[
              { label: "Terms", href: "/terms" },
              { label: "Privacy", href: "/privacy" },
              { label: "Contact", href: "/contact" },
            ].map((item) => (
              <Box
                key={item.href}
                component="a"
                href={item.href}
                sx={{ color: colors.textSecondary, textDecoration: "none", "&:hover": { color: colors.textPrimary } }}
              >
                {item.label}
              </Box>
            ))}
          </Box>
          <Typography alignCenter sx={{ mt: 2, fontSize: "0.75rem", color: "rgba(169,169,202,0.5)" }}>
            &copy; {new Date().getFullYear()} Rewardoxy. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" isBold sx={{ mb: 1, fontSize: "1.1rem" }}>
        {title}
      </Typography>
      <Typography sx={{ fontSize: "0.9rem", lineHeight: 1.8, color: "#a9a9ca" }}>
        {children}
      </Typography>
    </Box>
  );
}
