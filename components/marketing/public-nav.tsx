"use client";

import Link from "next/link";
import { Box, Container, Button } from "@mui/material";
import colors from "@/theme/colors";

const NAV_LINKS = [
  { text: "Offers", href: "/offers" },
  { text: "Surveys", href: "/surveys" },
  { text: "How It Works", href: "/how-it-works" },
  { text: "Blog", href: "/blog" },
  { text: "FAQ", href: "/faq" },
];

export default function PublicNav() {
  return (
    <Box
      component="nav"
      sx={{
        borderBottom: `1px solid ${colors.divider}`,
        bgcolor: "rgba(20,21,35,0.8)",
        backdropFilter: "blur(24px)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 64,
          gap: 2,
        }}
      >
        <Link
          href="/"
          style={{
            textDecoration: "none",
            color: colors.green,
            fontWeight: 800,
            fontSize: "1.25rem",
            flexShrink: 0,
          }}
        >
          Rewardoxy
        </Link>
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            gap: 3,
            fontSize: "0.875rem",
            alignItems: "center",
          }}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{ color: colors.textSecondary, textDecoration: "none" }}
            >
              {link.text}
            </Link>
          ))}
        </Box>
        <Button
          component={Link}
          href="/auth/signup"
          size="small"
          sx={{
            background: "linear-gradient(180deg, #10B981 0%, #059669 100%)",
            color: "#fff",
            fontWeight: 700,
            px: 2.5,
            borderRadius: 2,
            textTransform: "none",
            flexShrink: 0,
            "&:hover": { background: "linear-gradient(180deg, #34D399 0%, #10B981 100%)" },
          }}
        >
          Sign Up
        </Button>
      </Container>
    </Box>
  );
}
