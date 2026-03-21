"use client";

import { Box, Typography, Button } from "@mui/material";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import colors from "@/theme/colors";

export default function BannedPage() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        bgcolor: colors.background.default,
        p: 3,
        textAlign: "center",
      }}
    >
      <Box
        sx={{
          bgcolor: "rgba(239, 68, 68, 0.1)",
          p: 3,
          borderRadius: "50%",
          mb: 3,
          border: "1px solid rgba(239, 68, 68, 0.2)"
        }}
      >
        <ShieldAlert size={64} color="#EF4444" />
      </Box>
      <Typography variant="h3" sx={{ color: "#fff", fontWeight: 700, mb: 2 }}>
        Account Suspended
      </Typography>
      <Typography variant="body1" sx={{ color: colors.text.secondary, maxWidth: 500, mb: 4 }}>
        Your account has been permanently banned for violating our Terms of Service. 
        All earnings and pending withdrawals have been forfeited. If you believe this is a mistake, 
        please contact our support team.
      </Typography>
      <Button
        component={Link}
        href="/contact"
        variant="contained"
        sx={{
          bgcolor: "#EF4444",
          color: "#fff",
          "&:hover": { bgcolor: "#DC2626" },
          borderRadius: 2,
          px: 4,
          py: 1,
          textTransform: "none",
          fontWeight: 600,
        }}
      >
        Contact Support
      </Button>
      <Button
        component={Link}
        href="/"
        sx={{
          mt: 2,
          color: colors.text.secondary,
          textTransform: "none",
          fontWeight: 600,
          "&:hover": { color: "#fff", bgcolor: "transparent" },
        }}
      >
        Return to Home
      </Button>
    </Box>
  );
}
