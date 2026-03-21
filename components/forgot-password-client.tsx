"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, Check } from "lucide-react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Typography from "@/components/ui/Typography";
import Icons from "@/components/icons";
import colors from "@/theme/colors";

export default function ForgotPasswordClient() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send reset email");
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }

    setLoading(false);
  }

  const textFieldSx = {
    "& .MuiOutlinedInput-root": {
      backgroundColor: colors.background.ternary,
      borderRadius: "8px",
      fontSize: "0.875rem",
      color: colors.text.primary,
      "& fieldset": {
        borderColor: colors.divider,
      },
      "&:hover fieldset": {
        borderColor: colors.divider,
      },
      "&.Mui-focused fieldset": {
        borderColor: colors.secondary,
        borderWidth: "1px",
        boxShadow: `0 0 0 1px ${colors.secondary}50`,
      },
      "& input": {
        py: "12px",
        "&::placeholder": {
          color: `${colors.text.secondary}80`,
          opacity: 1,
        },
      },
    },
    "& .MuiInputAdornment-root": {
      color: colors.text.secondary,
    },
  };

  if (success) {
    return (
      <Box
        sx={{
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: colors.background.default,
          px: 2,
        }}
      >
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
          }}
          className="hero-gradient"
        />

        <Box sx={{ position: "relative", width: "100%", maxWidth: 448 }}>
          {/* Header / Logo */}
          <Box sx={{ mb: 4, textAlign: "center" }}>
            <Icons.Logo href="/" />
            <Typography
              variant="h5"
              isBold
              sx={{ mt: 3, color: colors.text.primary }}
            >
              Check your email
            </Typography>
            <Typography
              variant="body2"
              sx={{ mt: 1, color: colors.text.secondary }}
            >
              We've sent a password reset link to {email}
            </Typography>
          </Box>

          {/* Success Card */}
          <Box
            sx={{
              borderRadius: "16px",
              border: `1px solid ${colors.divider}`,
              bgcolor: colors.primary,
              p: { xs: 3, sm: 4 },
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 64,
                height: 64,
                borderRadius: "50%",
                bgcolor: "rgba(1,214,118,0.1)",
                border: "1px solid rgba(1,214,118,0.3)",
                mb: 2,
              }}
            >
              <Check size={32} color="#01D676" />
            </Box>
            <Typography variant="body1" isBold sx={{ mb: 1 }}>
              Email Sent!
            </Typography>
            <Typography variant="body2" sx={{ color: colors.text.secondary, mb: 3 }}>
              Please check your inbox and click the link to reset your password. The link expires in 1 hour.
            </Typography>
            <Button
              component={Link}
              href="/auth/login"
              variant="contained"
              fullWidth
              endIcon={<ArrowRight size={16} />}
              sx={{
                py: 1.25,
                borderRadius: "8px",
                background: colors.background.gradient,
                fontWeight: 700,
                fontSize: "0.875rem",
                textTransform: "none",
                boxShadow: "none",
                "&:hover": {
                  background: colors.background.gradient,
                  opacity: 0.9,
                  boxShadow: "none",
                },
              }}
            >
              Back to Login
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: colors.background.default,
        px: 2,
      }}
    >
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
        }}
        className="hero-gradient"
      />

      <Box sx={{ position: "relative", width: "100%", maxWidth: 448 }}>
        {/* Header / Logo */}
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Icons.Logo href="/" />
          <Typography
            variant="h5"
            isBold
            sx={{ mt: 3, color: colors.text.primary }}
          >
            Forgot password?
          </Typography>
          <Typography
            variant="body2"
            sx={{ mt: 1, color: colors.text.secondary }}
          >
            No worries, we'll send you reset instructions
          </Typography>
        </Box>

        {/* Card */}
        <Box
          sx={{
            borderRadius: "16px",
            border: `1px solid ${colors.divider}`,
            bgcolor: colors.primary,
            p: { xs: 3, sm: 4 },
          }}
        >
          {/* Form */}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            {/* Email */}
            <Box>
              <Typography
                variant="body2"
                isBold
                sx={{ mb: 0.75, color: colors.text.secondary }}
              >
                Email
              </Typography>
              <TextField
                id="email"
                type="email"
                required
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                autoComplete="off"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Mail size={16} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={textFieldSx}
              />
            </Box>

            {/* Error */}
            {error && (
              <Alert
                severity="error"
                sx={{
                  bgcolor: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  borderRadius: "8px",
                  color: "#f87171",
                  "& .MuiAlert-icon": { color: "#f87171" },
                }}
              >
                {error}
              </Alert>
            )}

            {/* Submit */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              endIcon={
                !loading ? (
                  <ArrowRight size={16} />
                ) : undefined
              }
              sx={{
                mt: 2,
                py: 1.25,
                borderRadius: "8px",
                background: colors.background.gradient,
                fontWeight: 700,
                fontSize: "0.875rem",
                textTransform: "none",
                boxShadow: "none",
                "&:hover": {
                  background: colors.background.gradient,
                  opacity: 0.9,
                  boxShadow: "none",
                },
                "&.Mui-disabled": {
                  opacity: 0.5,
                  color: colors.text.primary,
                },
              }}
            >
              {loading ? (
                <CircularProgress size={18} sx={{ color: colors.text.primary }} />
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </Box>
        </Box>

        {/* Footer link */}
        <Typography
          variant="body2"
          alignCenter
          sx={{ mt: 3, color: colors.text.secondary }}
        >
          Remember your password?{" "}
          <Link
            href="/auth/login"
            style={{
              fontWeight: 600,
              color: colors.secondary,
              textDecoration: "none",
            }}
          >
            Log in
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}
