"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Badge,
  Box,
  IconButton,
  Popover,
  CircularProgress,
} from "@mui/material";
import { Bell } from "lucide-react";
import Typography from "@/components/ui/Typography";
import colors from "@/theme/colors";

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  is_broadcast: boolean;
}

export default function NotificationBell() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications ?? []);
        setUnreadCount(data.unreadCount ?? 0);
      }
    } catch {
      // silent
    }
    setLoading(false);
    setFetched(true);
  }, []);

  // Fetch on mount to get unread count
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  async function handleOpen(e: React.MouseEvent<HTMLElement>) {
    setAnchorEl(e.currentTarget);

    // Refresh when opening
    if (fetched) {
      fetchNotifications();
    }

    // Mark all unread as read
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length > 0) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);

      fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds: unreadIds }),
      }).catch(() => {});
    }
  }

  function handleClose() {
    setAnchorEl(null);
  }

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton
        onClick={handleOpen}
        sx={{ bgcolor: "transparent", position: "relative" }}
      >
        <Badge
          badgeContent={unreadCount}
          max={9}
          sx={{
            "& .MuiBadge-badge": {
              bgcolor: "#f87171",
              color: "#fff",
              fontSize: "0.65rem",
              fontWeight: 700,
              minWidth: 16,
              height: 16,
            },
          }}
        >
          <Bell size={20} color={colors.text.secondary} />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              bgcolor: colors.background.default,
              border: `1px solid ${colors.divider}`,
              borderRadius: 3,
              width: 340,
              maxHeight: 400,
              overflow: "auto",
              mt: 1,
            },
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${colors.divider}` }}>
          <Typography variant="subtitle2" isBold>
            Notifications
          </Typography>
        </Box>

        {loading && !fetched ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={24} sx={{ color: "#01D676" }} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ py: 4, textAlign: "center" }}>
            <Typography variant="body2" color="textSecondary">
              No notifications yet
            </Typography>
          </Box>
        ) : (
          <Box>
            {notifications.map((n) => (
              <Box
                key={n.id}
                sx={{
                  px: 2,
                  py: 1.5,
                  borderBottom: `1px solid ${colors.divider}`,
                  bgcolor: n.read ? "transparent" : "rgba(1,214,118,0.05)",
                  "&:last-child": { borderBottom: "none" },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.25 }}>
                  <Typography sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                    {n.title}
                  </Typography>
                  {n.is_broadcast && (
                    <Box
                      sx={{
                        borderRadius: 50,
                        px: 0.75,
                        py: 0.125,
                        fontSize: "9px",
                        fontWeight: 600,
                        bgcolor: "rgba(96,165,250,0.15)",
                        color: "#60a5fa",
                        ml: 1,
                        flexShrink: 0,
                      }}
                    >
                      All
                    </Box>
                  )}
                </Box>
                <Typography sx={{ fontSize: "0.75rem", color: colors.text.secondary, lineHeight: 1.4 }}>
                  {n.message}
                </Typography>
                <Typography sx={{ fontSize: "0.65rem", color: colors.text.secondary, mt: 0.5, opacity: 0.6 }}>
                  {new Date(n.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Popover>
    </>
  );
}
