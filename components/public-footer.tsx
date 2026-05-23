"use client";

import Link from "next/link";
import { Box, Container } from "@mui/material";
import { Mail } from "lucide-react";
import Icons from "@/components/icons";

const colors = {
  bgCard: "#1d1e30",
  green: "#10B981",
  textPrimary: "#ffffff",
  textSecondary: "#a9a9ca",
  divider: "#2a2b43",
};

const FOOTER_LINKS: { title: string; links: { text: string; url: string; isEmail?: boolean }[] }[] = [
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
      { text: "How It Works", url: "/about" },
      { text: "FAQ", url: "/faq" },
      { text: "Contact", url: "/contact" },
    ],
  },
  {
    title: "Contact",
    links: [
      { text: "support@rewardoxy.app", url: "mailto:support@rewardoxy.app", isEmail: true },
    ],
  },
];

export default function PublicFooter() {
  return (
    <Box component="footer" sx={{ bgcolor: colors.bgCard, borderTop: `1px solid ${colors.divider}`, mt: 4 }}>
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
        <Box sx={{ flexShrink: 0, display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Icons.Logo />
          <Box sx={{ color: colors.textSecondary, fontSize: "0.875rem", maxWidth: 320 }}>
            Complete tasks. Earn rewards. Withdraw crypto. Join thousands earning USDT by completing offers, surveys and games.
          </Box>
          <Box sx={{ color: "rgba(169,169,202,0.5)", fontSize: "0.75rem", mt: { xs: 2, md: "auto" } }}>
            &copy; {new Date().getFullYear()} Rewardoxy. All rights reserved.
          </Box>
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" }, gap: { xs: 4, sm: 6 }, flexGrow: 1 }}>
          {FOOTER_LINKS.map(({ title, links }) => (
            <Box key={title}>
              <Box sx={{ color: "#fff", fontWeight: 700, fontSize: "0.875rem", mb: 2.5 }}>{title}</Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {links.map(({ text, url, isEmail }) => (
                  <Box
                    key={text}
                    component={isEmail ? "a" : Link}
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
                ))}
                {title === "Contact" && (
                  <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                    <Box
                      component="a"
                      href="https://t.me/rewardoxy"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Telegram"
                      sx={{ display: "inline-flex", transition: "all 0.2s", "&:hover": { transform: "translateY(-2px)" } }}
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
  );
}
