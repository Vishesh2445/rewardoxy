import { Box, Container } from "@mui/material";
import Icons from "@/components/icons";
import Typography from "@/components/ui/Typography";
import PublicFooter from "@/components/public-footer";

const colors = {
  bgPage: "#0D0E12",
  bgCard: "#232645",
  green: "#10B981",
  textPrimary: "#ffffff",
  textSecondary: "#a9a9ca",
  divider: "#2a2b43",
};

export const metadata = {
  title: "Privacy Policy - BallSortCashQuest",
  description: "BallSortCashQuest Privacy Policy. Learn how we collect, use, and protect your data in our ball sort puzzle game.",
  alternates: {
    canonical: "/ballsortcashquest/privacypolicy",
  },
};

export default function BallSortCashQuestPrivacyPage() {
  return (
    <Box className="glow-bg" sx={{ minHeight: "100vh", bgcolor: colors.bgPage, color: colors.textPrimary }}>
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
          Privacy Policy
        </Typography>
        <Typography sx={{ color: colors.textSecondary, mb: 1, fontSize: "0.875rem" }}>
          BallSortCashQuest
        </Typography>
        <Typography sx={{ color: colors.textSecondary, mb: 5, fontSize: "0.8rem" }}>
          Last updated: July 3, 2026
        </Typography>

        <Section title="1. Information We Collect">
          BallSortCashQuest collects minimal data to provide and improve the game:
          game progress (coins, highest level reached, ad statistics) stored locally
          and synced to the cloud using an anonymous account; your device&apos;s country
          code detected from SIM/network settings for withdrawal processing; and your
          Litecoin address submitted only when you request a withdrawal.
        </Section>

        <Section title="2. How We Use Your Information">
          We use your data to: save and restore your game progress across devices;
          process withdrawal requests for earned rewards; serve and measure
          advertisements; and improve the game and fix technical issues.
        </Section>

        <Section title="3. Third-Party Services">
          The game integrates with third-party services, each with their own privacy
          policies: <strong>Firebase</strong> (Google) for cloud storage, anonymous
          authentication, analytics, and crash reporting; <strong>IronSource
          LevelPlay</strong> for ad mediation (banner, interstitial, and rewarded
          ads); and <strong>CPX Research</strong> for optional surveys you can
          choose to complete for in-app rewards. We recommend reviewing the privacy
          policies of these services.
        </Section>

        <Section title="4. Advertising">
          The game may display advertisements served by third-party ad networks. These
          networks may use device identifiers, IP addresses, and interaction data to
          serve personalized or non-personalized ads. You can opt out of personalized
          advertising in your device settings.
        </Section>

        <Section title="5. Data Security">
          We use industry-standard security measures to protect your data. Game
          progress is stored securely in Firebase Firestore. No passwords, financial
          information, or sensitive personal data are collected by the game directly.
        </Section>

        <Section title="6. Children&apos;s Privacy">
          BallSortCashQuest is not directed at children under 13. We do not knowingly
          collect personal information from children. If you believe a child has
          provided us with personal data, please contact us and we will delete it.
        </Section>

        <Section title="7. Your Rights">
          You have the right to: request deletion of your data; stop data collection
          by uninstalling the game; and opt out of personalized ads via your device
          settings. To exercise these rights, contact us at{" "}
          <Box
            component="a"
            href="mailto:support@rewardoxy.app"
            sx={{ color: colors.green, textDecoration: "none" }}
          >
            support@rewardoxy.app
          </Box>
          .
        </Section>

        <Section title="8. Changes to This Policy">
          We may update this Privacy Policy from time to time. Changes will be
          reflected on this page with an updated date. Continued use of the game
          after changes constitutes acceptance of the updated policy.
        </Section>

        <Section title="9. Contact">
          If you have any questions about this Privacy Policy, contact us at{" "}
          <Box
            component="a"
            href="mailto:support@rewardoxy.app"
            sx={{ color: colors.green, textDecoration: "none" }}
          >
            support@rewardoxy.app
          </Box>
          .
        </Section>
      </Container>

      <PublicFooter />
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
