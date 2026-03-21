"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowRight, Check, AlertCircle } from "lucide-react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Typography from "@/components/ui/Typography";
import Icons from "@/components/icons";
import colors from "@/theme/colors";

export default function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [success, setSuccess] = useState(false);

  // Validate token on mount
  useEffect(() => {
    async function validateToken() {
      if (!token) {
        setTokenValid(false);
        setValidating(false);
        return;
      }

      try {
        const res = await fetch(`/api/auth/reset-password?token=${token}`);
        const data = await res.json();
        setTokenValid(data.valid);
      } catch (err) {
        setTokenValid(false);
      }

      setValidating(false);
    }

    validateToken();
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to reset password");
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

  if (validating) {
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
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress sx={{ color: colors.secondary }} />
          <Typography variant="body2" sx={{ mt: 2, color: colors.text.secondary }}>
            Validating reset link...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!tokenValid) {
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
          </Box>

          {/* Error Card */}
          <Box
            sx={{
              borderRadius: "16px",
              border: `1px solid rgba(239,68,68,0.3)`,
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
                bgcolor: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                mb: 2,
              }}
            >
              <AlertCircle size={32} color="#ef4444" />
            </Box>
            <Typography variant="h6" isBold sx={{ mb: 1, color: colors.text.primary }}>
              Invalid or Expired Link
            </Typography>
            <Typography variant="body2" sx={{ color: colors.text.secondary, mb: 3 }}>
              This password reset link is invalid or has expired. Please request a new password reset.
            </Typography>
            <Button
              component={Link}
              href="/auth/forgot-password"
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
              Request New Reset Link
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }

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
              Password reset!
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
              Password Changed!
            </Typography>
            <Typography variant="body2" sx={{ color: colors.text.secondary, mb: 3 }}>
              Your password has been reset successfully. You can now log in with your new password.
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
              Log In
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
            Create new password
          </Typography>
          <Typography
            variant="body2"
            sx={{ mt: 1, color: colors.text.secondary }}
          >
            Your new password must be different from previous passwords
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
            {/* Password */}
            <Box>
              <Typography
                variant="body2"
                isBold
                sx={{ mb: 0.75, color: colors.text.secondary }}
              >
                New Password
              </Typography>
              <TextField
                id="password"
                type="password"
                required
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                autoComplete="off"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock size={16} />
                      </InputAdornment>
                    ),
                    inputProps: { minLength: 6 },
                  },
                }}
                sx={textFieldSx}
              />
            </Box>

            {/* Confirm Password */}
            <Box>
              <Typography
                variant="body2"
                isBold
                sx={{ mb: 0.75, color: colors.text.secondary }}
              >
                Confirm Password
              </Typography>
              <TextField
                id="confirmPassword"
                type="password"
                required
                fullWidth
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                autoComplete="off"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock size={16} />
                      </InputAdornment>
                    ),
                    inputProps: { minLength: 6 },
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
                "Reset Password"
              )}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
