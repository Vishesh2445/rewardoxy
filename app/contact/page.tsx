"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Box,
  Container,
  Divider,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Mail, MessageSquare, Send, HelpCircle } from "lucide-react";
import Icons from "@/components/icons";
import Typography from "@/components/ui/Typography";

const colors = {
  bgPage: "#141523",
  bgCard: "#1d1e30",
  green: "#01D676",
  greenDark: "#007e45",
  textPrimary: "#ffffff",
  textSecondary: "#a9a9ca",
  divider: "#2a2b43",
  greenTint: "#00e9411a",
  gradient: "linear-gradient(180deg, #01d676 0, #007e45 100%)",
};

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setSending(true);
    setFeedback(null);

    // Send via mailto fallback — open email client
    const mailtoSubject = encodeURIComponent(subject || "Contact from Rewardoxy");
    const mailtoBody = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\n${message}`
    );
    window.open(
      `mailto:support@rewardoxy.com?subject=${mailtoSubject}&body=${mailtoBody}`,
      "_self"
    );

    setFeedback({ type: "success", text: "Your email client should open shortly. If not, email us directly at support@rewardoxy.com" });
    setSending(false);
  }

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

      <Container maxWidth="sm" sx={{ py: { xs: 6, sm: 10 } }}>
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <Typography
            variant="h3"
            isBold
            sx={{ mb: 1, fontSize: { xs: "1.75rem", sm: "2.25rem" } }}
          >
            Contact Us
          </Typography>
          <Typography sx={{ color: colors.textSecondary, fontSize: "1rem" }}>
            Have a question or need help? We&apos;re here for you.
          </Typography>
        </Box>

        {/* Quick info cards */}
        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, mb: 5 }}>
          <Paper
            elevation={0}
            sx={{
              flex: 1,
              bgcolor: colors.bgCard,
              border: `1px solid ${colors.divider}`,
              borderRadius: 3,
              p: 3,
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                mx: "auto",
                mb: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 48,
                height: 48,
                borderRadius: 3,
                bgcolor: colors.greenTint,
                border: "1px solid rgba(1,214,118,0.2)",
              }}
            >
              <Mail size={22} color={colors.green} />
            </Box>
            <Typography sx={{ fontWeight: 600, fontSize: "0.95rem" }}>Email</Typography>
            <Box
              component="a"
              href="mailto:support@rewardoxy.com"
              sx={{ fontSize: "0.85rem", color: colors.green, textDecoration: "none" }}
            >
              support@rewardoxy.com
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              flex: 1,
              bgcolor: colors.bgCard,
              border: `1px solid ${colors.divider}`,
              borderRadius: 3,
              p: 3,
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                mx: "auto",
                mb: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 48,
                height: 48,
                borderRadius: 3,
                bgcolor: colors.greenTint,
                border: "1px solid rgba(1,214,118,0.2)",
              }}
            >
              <HelpCircle size={22} color={colors.green} />
            </Box>
            <Typography sx={{ fontWeight: 600, fontSize: "0.95rem" }}>FAQ</Typography>
            <Box
              component={Link}
              href="/#faq"
              sx={{ fontSize: "0.85rem", color: colors.green, textDecoration: "none" }}
            >
              View common questions
            </Box>
          </Paper>
        </Box>

        {/* Contact form */}
        <Paper
          elevation={0}
          sx={{
            bgcolor: colors.bgCard,
            border: `1px solid ${colors.divider}`,
            borderRadius: 3,
            p: { xs: 3, sm: 4 },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
            <MessageSquare size={20} color={colors.green} />
            <Typography sx={{ fontWeight: 600, fontSize: "1.1rem" }}>
              Send a Message
            </Typography>
          </Box>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
              <TextField
                fullWidth
                required
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                size="small"
              />
              <TextField
                fullWidth
                required
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                size="small"
              />
            </Box>

            <TextField
              fullWidth
              placeholder="Subject (optional)"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              size="small"
            />

            <TextField
              fullWidth
              required
              placeholder="How can we help you?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              size="small"
              multiline
              rows={4}
            />

            {feedback && (
              <Alert severity={feedback.type}>{feedback.text}</Alert>
            )}

            <Button
              type="submit"
              disabled={sending || !name.trim() || !email.trim() || !message.trim()}
              startIcon={
                sending ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <Send size={16} />
                )
              }
              sx={{
                alignSelf: "flex-start",
                textTransform: "none",
                fontWeight: 700,
                background: colors.gradient,
                color: "#fff",
                borderRadius: 2,
                px: 4,
                py: 1.25,
                "&:hover": {
                  background: "linear-gradient(180deg, #00c46a 0, #006b3b 100%)",
                },
              }}
            >
              {sending ? "Sending..." : "Send Message"}
            </Button>
          </Box>
        </Paper>

        <Typography
          alignCenter
          sx={{ mt: 4, fontSize: "0.8rem", color: colors.textSecondary, lineHeight: 1.7 }}
        >
          We typically respond within 24 hours. For urgent issues related to
          withdrawals or account access, include your account email in the message.
        </Typography>
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
                component={Link}
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
