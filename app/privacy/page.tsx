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
  title: "Privacy Policy - Rewardoxy",
};

export default function PrivacyPage() {
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
          Privacy Policy
        </Typography>
        <Typography sx={{ color: colors.textSecondary, mb: 5, fontSize: "0.875rem" }}>
          Last updated: March 6, 2026
        </Typography>

        <Section title="1. Information We Collect">
          When you create an account, we collect your email address and authentication
          credentials. During your use of the Platform, we also collect: your IP address,
          browser type and device information, offer completion data (which offers you
          complete, coins earned, timestamps), withdrawal history, and referral activity.
        </Section>

        <Section title="2. How We Use Your Information">
          We use your information to: operate and maintain your account; credit coins for
          completed offers; process withdrawal requests; detect and prevent fraud, abuse,
          and multiple accounts; improve the Platform experience; send important account
          notifications (such as withdrawal confirmations or policy changes); and comply
          with legal obligations.
        </Section>

        <Section title="3. Third-Party Offerwalls & Partners">
          When you complete offers, you interact with third-party offerwall providers (such
          as CPX Research, Lootably, BitLabs, AdGate Media, and others). These providers may
          collect additional data about you according to their own privacy policies. We share
          your user ID with these providers so they can attribute offer completions to your
          account. We recommend reviewing the privacy policies of any offerwall you interact
          with.
        </Section>

        <Section title="4. Cookies & Local Storage">
          We use cookies and local storage to maintain your authentication session and
          remember your preferences. These are essential for the Platform to function. We do
          not use tracking cookies for advertising purposes.
        </Section>

        <Section title="5. Data Security">
          We use industry-standard security measures to protect your data, including
          encrypted connections (HTTPS/TLS), secure password hashing, and role-based access
          controls. However, no system is 100% secure, and we cannot guarantee absolute
          security of your data.
        </Section>

        <Section title="6. Data Retention">
          We retain your account data for as long as your account is active. If you request
          account deletion, we will delete your personal data within 30 days, except where
          retention is required by law or for fraud prevention purposes. Anonymized
          transaction records may be retained indefinitely for accounting purposes.
        </Section>

        <Section title="7. Your Rights">
          You have the right to: access the personal data we hold about you; request
          correction of inaccurate data; request deletion of your account and data; withdraw
          consent for non-essential data processing; and receive a copy of your data in a
          portable format. To exercise these rights, contact us at{" "}
          <Box
            component="a"
            href="mailto:support@rewardoxy.com"
            sx={{ color: colors.green, textDecoration: "none" }}
          >
            support@rewardoxy.com
          </Box>
          .
        </Section>

        <Section title="8. Children&apos;s Privacy">
          Rewardoxy is not intended for use by anyone under 18 years of age. We do not
          knowingly collect personal information from children. If we become aware that we
          have collected data from a child, we will delete it promptly.
        </Section>

        <Section title="9. International Users">
          Rewardoxy is accessible worldwide. By using the Platform, you consent to the
          transfer and processing of your data in the country where our servers are located.
          We comply with applicable data protection laws including GDPR for users in the
          European Economic Area.
        </Section>

        <Section title="10. Changes to This Policy">
          We may update this Privacy Policy from time to time. We will notify you of
          significant changes via the Platform notification system. Continued use of the
          Platform after changes constitutes acceptance of the updated policy.
        </Section>

        <Section title="11. Contact">
          For privacy-related questions or data requests, contact us at{" "}
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
