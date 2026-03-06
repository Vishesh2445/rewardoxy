"use client";

import { useState } from "react";
import {
  Box,
  Paper,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Bell, Send, Globe, UserIcon } from "lucide-react";
import Typography from "@/components/ui/Typography";
import colors from "@/theme/colors";

interface Notification {
  id: string;
  user_id: string | null;
  title: string;
  message: string;
  is_broadcast: boolean;
  created_at: string;
}

interface AdminNotificationsClientProps {
  initialNotifications: Notification[];
}

export default function AdminNotificationsClient({
  initialNotifications,
}: AdminNotificationsClientProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [isBroadcast, setIsBroadcast] = useState(true);
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSend() {
    if (!title.trim() || !message.trim()) return;
    if (!isBroadcast && !email.trim()) return;

    setSending(true);
    setFeedback(null);

    const res = await fetch("/api/admin/notifications/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        message: message.trim(),
        isBroadcast,
        email: isBroadcast ? undefined : email.trim(),
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setFeedback({ type: "success", text: isBroadcast ? "Broadcast sent!" : `Notification sent to ${email}` });
      setTitle("");
      setMessage("");
      setEmail("");
      // Add to top of recent list
      setNotifications((prev) => [
        {
          id: crypto.randomUUID(),
          user_id: null,
          title: title.trim(),
          message: message.trim(),
          is_broadcast: isBroadcast,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ].slice(0, 20));
    } else {
      setFeedback({ type: "error", text: data.error || "Failed to send" });
    }

    setSending(false);
  }

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" isBold sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Bell size={24} color="#01D676" />
          Notifications
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Send broadcast or targeted notifications to users
        </Typography>
      </Box>

      {/* Send form */}
      <Paper
        sx={{
          borderRadius: 3,
          border: `1px solid ${colors.divider}`,
          bgcolor: colors.primary,
          p: 3,
          mb: 3,
        }}
      >
        <Typography variant="subtitle1" isBold sx={{ mb: 2 }}>
          New Notification
        </Typography>

        <FormControlLabel
          control={
            <Switch
              checked={isBroadcast}
              onChange={(e) => setIsBroadcast(e.target.checked)}
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": { color: "#01D676" },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                  backgroundColor: "#01D676",
                },
              }}
            />
          }
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              {isBroadcast ? <Globe size={16} /> : <UserIcon size={16} />}
              <Typography variant="body2">
                {isBroadcast ? "Broadcast to all users" : "Send to specific user"}
              </Typography>
            </Box>
          }
          sx={{ mb: 2 }}
        />

        {!isBroadcast && (
          <TextField
            fullWidth
            placeholder="User email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            size="small"
            sx={{ mb: 2 }}
          />
        )}

        <TextField
          fullWidth
          placeholder="Notification title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          size="small"
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          placeholder="Message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          size="small"
          multiline
          rows={3}
          sx={{ mb: 2 }}
        />

        {feedback && (
          <Alert severity={feedback.type} sx={{ mb: 2 }}>
            {feedback.text}
          </Alert>
        )}

        <Button
          onClick={handleSend}
          disabled={sending || !title.trim() || !message.trim() || (!isBroadcast && !email.trim())}
          startIcon={sending ? <CircularProgress size={16} color="inherit" /> : <Send size={16} />}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            background: colors.background.gradient,
            color: "#fff",
            borderRadius: 2,
            px: 3,
            py: 1,
          }}
        >
          {sending ? "Sending..." : "Send Notification"}
        </Button>
      </Paper>

      {/* Recent notifications */}
      <Typography variant="subtitle1" isBold sx={{ mb: 2 }}>
        Recent Notifications
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {notifications.length === 0 && (
          <Typography variant="body2" color="textSecondary">
            No notifications sent yet.
          </Typography>
        )}

        {notifications.map((n) => (
          <Paper
            key={n.id}
            sx={{
              borderRadius: 3,
              border: `1px solid ${colors.divider}`,
              bgcolor: colors.primary,
              p: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    borderRadius: 50,
                    px: 1.25,
                    py: 0.25,
                    fontSize: "10px",
                    fontWeight: 600,
                    bgcolor: n.is_broadcast ? "rgba(96,165,250,0.15)" : "rgba(250,204,21,0.15)",
                    color: n.is_broadcast ? "#60a5fa" : "#facc15",
                    textTransform: "capitalize",
                  }}
                >
                  {n.is_broadcast ? "Broadcast" : "Targeted"}
                </Box>
              </Box>
              <Typography sx={{ fontSize: "0.7rem", color: colors.text.secondary }}>
                {new Date(n.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {n.title}
            </Typography>
            <Typography sx={{ fontSize: "0.8rem", color: colors.text.secondary, mt: 0.5 }}>
              {n.message}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}
