"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  LayoutDashboard,
  Gift,
  Trophy,
  Users,
  Wallet,
  User,
  History,
  CalendarCheck,
  LogOut,
  ChevronDown,
  Menu as MenuIcon,
  X,
  Mail,
  Gamepad2,
  Target,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Icons from "@/components/icons";
import Typography from "@/components/ui/Typography";
import NotificationBell from "@/components/notification-bell";
import BalanceDisplay from "@/components/balance-display";
import BottomNavbar from "@/components/bottom-navbar";
import colors from "@/theme/colors";

const NAV_ITEMS = [
  { label: "Earn", href: "/earn", Icon: Gift },
  { label: "My Offers", href: "/my-offers", Icon: Target },
  { label: "Offers", href: "/offers/all", Icon: Gamepad2 },
  { label: "Cashout", href: "/cashout", Icon: Wallet },
  { label: "Rewards", href: "/daily-bonus", Icon: CalendarCheck },
];

const DROPDOWN_ITEMS = [
  { label: "My Offers", href: "/my-offers", Icon: Target },
  { label: "Profile", href: "/profile", Icon: User },
  { label: "Leaderboard", href: "/leaderboard", Icon: Trophy },
  { label: "Referrals", href: "/referrals", Icon: Users },
  { label: "History", href: "/history", Icon: History },
];

const ALL_NAV_ITEMS = [
  { label: "Earn", href: "/earn", Icon: Gift },
  { label: "My Offers", href: "/my-offers", Icon: Target },
  { label: "Profile", href: "/profile", Icon: User },
  { label: "Daily Bonus", href: "/daily-bonus", Icon: CalendarCheck },
  { label: "Cashout", href: "/cashout", Icon: Wallet },
  { label: "Leaderboard", href: "/leaderboard", Icon: Trophy },
  { label: "Referrals", href: "/referrals", Icon: Users },
  { label: "History", href: "/history", Icon: History },
];

const footerInfoList: { title: string; links: { text: string; url: string; isEmail?: boolean }[] }[] = [
  {
    title: "Quick Links",
    links: [
      { text: "Earn", url: "/earn" },
      { text: "Cash Out", url: "/cashout" },
      { text: "Profile", url: "/profile" },
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
      { text: "How It Works", url: "/#how-it-works" },
      { text: "FAQ", url: "/#faq" },
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

const socialLinks = [
  { icon: "telegram", url: "https://t.me/rewardoxy", label: "Telegram" },
];

interface FullscreenShellProps {
  children: React.ReactNode;
  coins?: number;
  userName?: string;
  userAvatar?: string;
  userId?: string;
}

export default function FullscreenShell({ 
  children, 
  coins,
  userName = "User",
  userAvatar,
  userId
}: FullscreenShellProps) {
  const pathname = usePathname();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const open = Boolean(anchorEl);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "#0a0b0f" }}>
      {/* Top Navigation Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: "#12131c",
          borderBottom: `1px solid rgba(255, 255, 255, 0.05)`,
          zIndex: 1300,
        }}
      >
        <Toolbar sx={{ px: { xs: 2, sm: 3, md: 4 }, minHeight: { xs: 56, sm: 64 } }}>
          {/* Mobile/Tablet Layout */}
          <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", width: "100%" }}>
            {/* Left: Menu Icon + Logo */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton
                onClick={() => setMobileOpen(true)}
                sx={{
                  color: colors.text.secondary,
                  p: 1,
                }}
              >
                <MenuIcon size={20} />
              </IconButton>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  width: 28,
                  height: 24,
                }}
              >
                <Image
                  src="/logo.png"
                  alt="Rewardoxy"
                  width={28}
                  height={24}
                  style={{ objectFit: "contain" }}
                />
              </Box>
            </Box>

            {/* Center: Balance Display */}
            <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
              {userId && <BalanceDisplay userId={userId} initialBalance={coins} />}
            </Box>

            {/* Right: Notification Bell */}
            <NotificationBell />
          </Box>

          {/* Desktop Layout */}
          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", width: "100%" }}>
            {/* Logo */}
            <Box sx={{ mr: 4 }}>
              <Icons.Logo href="/earn" />
            </Box>

            {/* Desktop Navigation */}
            <Box sx={{ display: "flex", gap: 1, flexGrow: 1 }}>
              {NAV_ITEMS.map(({ label, href, Icon }) => {
                const isActive = pathname === href;
                return (
                  <Button
                    key={href}
                    component={Link}
                    href={href}
                    startIcon={<Icon size={18} />}
                    sx={{
                      color: isActive ? "#10B981" : colors.text.secondary,
                      bgcolor: isActive ? "rgba(16, 185, 129, 0.1)" : "transparent",
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: isActive ? 600 : 500,
                      fontSize: "0.9375rem",
                      "&:hover": {
                        bgcolor: isActive ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.05)",
                        color: isActive ? "#10B981" : colors.text.primary,
                      },
                    }}
                  >
                    {label}
                  </Button>
                );
              })}
            </Box>

            {/* Right Side - Balance, Notifications, Profile */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {/* Balance Display */}
              {userId && <BalanceDisplay userId={userId} initialBalance={coins} />}

              {/* Notifications */}
              <NotificationBell />

              {/* Profile Dropdown */}
              <IconButton
                onClick={handleMenuOpen}
                sx={{
                  p: 0.5,
                  bgcolor: open ? "rgba(255, 255, 255, 0.05)" : "transparent",
                  "&:hover": { bgcolor: "rgba(255, 255, 255, 0.05)" },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Avatar
                    src={userAvatar}
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: colors.primary,
                      fontSize: "0.875rem",
                    }}
                  >
                    {userName.charAt(0).toUpperCase()}
                  </Avatar>
                  <ChevronDown size={16} color={colors.text.secondary} />
                </Box>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                slotProps={{
                  paper: {
                    sx: {
                      bgcolor: "#1a1b2e",
                      border: `1px solid rgba(255, 255, 255, 0.1)`,
                      borderRadius: 2,
                      mt: 1,
                      minWidth: 200,
                    },
                  },
                }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              >
                {DROPDOWN_ITEMS.map(({ label, href, Icon }) => (
                  <MenuItem
                    key={href}
                    component={Link}
                    href={href}
                    onClick={handleMenuClose}
                    sx={{
                      py: 1.5,
                      px: 2,
                      gap: 1.5,
                      color: colors.text.primary,
                      "&:hover": {
                        bgcolor: "rgba(255, 255, 255, 0.05)",
                      },
                    }}
                  >
                    <Icon size={18} />
                    <Typography sx={{ fontSize: "0.9375rem" }}>{label}</Typography>
                  </MenuItem>
                ))}
                <Box sx={{ borderTop: `1px solid rgba(255, 255, 255, 0.05)`, mt: 1 }} />
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    handleLogout();
                  }}
                  sx={{
                    py: 1.5,
                    px: 2,
                    gap: 1.5,
                    color: "#f87171",
                    "&:hover": {
                      bgcolor: "rgba(239, 68, 68, 0.1)",
                    },
                  }}
                >
                  <LogOut size={18} />
                  <Typography sx={{ fontSize: "0.9375rem" }}>Log Out</Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: 280,
            bgcolor: "#12131c",
            borderRight: `1px solid rgba(255, 255, 255, 0.05)`,
          },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          {/* Drawer Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 2,
              borderBottom: `1px solid rgba(255, 255, 255, 0.05)`,
            }}
          >
            <Icons.Logo href="/earn" />
            <IconButton onClick={() => setMobileOpen(false)} sx={{ color: colors.text.secondary }}>
              <X size={20} />
            </IconButton>
          </Box>

          {/* User Info */}
          <Box sx={{ p: 2, borderBottom: `1px solid rgba(255, 255, 255, 0.05)` }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Avatar
                src={userAvatar}
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: colors.primary,
                }}
              >
                {userName.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography sx={{ fontWeight: 600 }}>{userName}</Typography>
                {userId && <BalanceDisplay userId={userId} initialBalance={coins} />}
              </Box>
            </Box>
          </Box>

          {/* Navigation Items */}
          <List sx={{ flex: 1, py: 1 }}>
            {ALL_NAV_ITEMS.map(({ label, href, Icon }) => {
              const isActive = pathname === href;
              return (
                <ListItem key={href} sx={{ px: 2, py: 0 }}>
                  <ListItemButton
                    component={Link}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    selected={isActive}
                    sx={{
                      borderRadius: 2,
                      color: isActive ? "#10B981" : colors.text.primary,
                      bgcolor: isActive ? "rgba(16, 185, 129, 0.1)" : "transparent",
                      "&:hover": {
                        bgcolor: isActive ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.05)",
                      },
                      "&.Mui-selected": {
                        bgcolor: "rgba(16, 185, 129, 0.1)",
                        "&:hover": {
                          bgcolor: "rgba(16, 185, 129, 0.15)",
                        },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40, color: isActive ? "#10B981" : colors.text.secondary }}>
                      <Icon size={20} />
                    </ListItemIcon>
                    <ListItemText primary={label} />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>

          {/* Logout Button */}
          <Box sx={{ p: 2, borderTop: `1px solid rgba(255, 255, 255, 0.05)` }}>
            <ListItemButton
              onClick={() => {
                setMobileOpen(false);
                handleLogout();
              }}
              sx={{
                borderRadius: 2,
                color: "#f87171",
                "&:hover": {
                  bgcolor: "rgba(239, 68, 68, 0.1)",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: "#f87171" }}>
                <LogOut size={20} />
              </ListItemIcon>
              <ListItemText primary="Log Out" />
            </ListItemButton>
          </Box>
        </Box>
      </Drawer>

      {/* Main Content - Fullscreen */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: { xs: 7, sm: 8 },
          pb: { xs: 10, md: 0 }, // Add padding bottom for mobile bottom navbar
          bgcolor: "#0a0b0f",
          minHeight: "100vh",
        }}
      >
        {children}
      </Box>

      {/* Bottom Navigation Bar - Mobile & Tablet Only */}
      <BottomNavbar />

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          bgcolor: "#12131c",
          borderTop: `1px solid rgba(255, 255, 255, 0.05)`,
          mt: 4,
        }}
      >
        <Box
          sx={{
            px: { xs: 2, sm: 3, md: 4 },
            py: { xs: 4, sm: 5, md: 6 },
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            gap: { xs: 4, md: 8 },
          }}
        >
          {/* Branding & Copyright */}
          <Box sx={{ flexShrink: 0, display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Icons.Logo href="/earn" />
            <Typography sx={{ color: colors.text.secondary, fontSize: "0.875rem", maxWidth: 300 }}>
              Get paid to complete tasks, surveys and offers.
            </Typography>
            <Typography sx={{ color: "rgba(169,169,202,0.5)", fontSize: "0.75rem", mt: { xs: 2, md: "auto" } }}>
              &copy; {new Date().getFullYear()} Rewardoxy. All rights reserved.
            </Typography>
          </Box>

          {/* Links */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" },
              gap: { xs: 3, sm: 4 },
              flexGrow: 1,
            }}
          >
            {footerInfoList.map(({ title, links }) => (
              <Box key={title}>
                <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "0.875rem", mb: 2 }}>{title}</Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {links.map(({ text, url, isEmail }) => {
                    const LinkComponent = isEmail ? "a" : Link;
                    return (
                      <Box
                        key={text}
                        component={LinkComponent}
                        href={url}
                        target={isEmail ? "_blank" : undefined}
                        rel={isEmail ? "noopener noreferrer" : undefined}
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 0.75,
                          color: colors.text.secondary,
                          textDecoration: "none",
                          fontSize: "0.8125rem",
                          transition: "color 0.2s",
                          "&:hover": { color: colors.primary },
                        }}
                      >
                        {isEmail && <Mail size={14} />}
                        {text}
                      </Box>
                    );
                  })}
                  {title === "Contact" && (
                    <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                      {socialLinks.map(({ icon, url, label }) => (
                        <Box
                          key={icon}
                          component="a"
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={label}
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.2s",
                            "&:hover": {
                              transform: "translateY(-2px)",
                            },
                          }}
                        >
                          <Icons.Telegram size={28} />
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
