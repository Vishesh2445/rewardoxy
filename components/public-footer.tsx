"use client";

import Link from "next/link";
import { Box, Container } from "@mui/material";
import { Mail } from "lucide-react";
import Icons from "@/components/icons";
import {
  PUBLIC_FOOTER_LINKS,
  PUBLIC_FOOTER_TAGLINE,
  type FooterSection,
} from "@/lib/content/public-footer-links";

const colors = {
  bgCard: "#232645",
  green: "#10B981",
  textSecondary: "#a9a9ca",
  divider: "#2a2b43",
};

type PublicFooterProps = {
  links?: FooterSection[];
  tagline?: string;
};

export default function PublicFooter({
  links = PUBLIC_FOOTER_LINKS,
  tagline = PUBLIC_FOOTER_TAGLINE,
}: PublicFooterProps) {
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
            {tagline}
          </Box>
          <Box sx={{ color: "rgba(169,169,202,0.5)", fontSize: "0.75rem", mt: { xs: 2, md: "auto" } }}>
            &copy; {new Date().getFullYear()} Rewardoxy. All rights reserved.
          </Box>
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" }, gap: { xs: 4, sm: 6 }, flexGrow: 1 }}>
          {links.map(({ title, links: sectionLinks }) => (
            <Box key={title}>
              <Box sx={{ color: "#fff", fontWeight: 700, fontSize: "0.875rem", mb: 2.5 }}>{title}</Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {sectionLinks.map(({ text, url, isEmail }) => (
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
