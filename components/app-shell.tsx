"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AppBar,
  Box,
  Drawer,
  Toolbar,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Divider,
  Grid,
  BottomNavigation as MuiBottomNavigation,
  BottomNavigationAction as MuiBottomNavigationAction,
  styled,
} from "@mui/material";
import Image from "next/image";
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
  Coins,
  Menu,
  X,
  Mail,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Icons from "@/components/icons";
import Typography from "@/components/ui/Typography";
import NotificationBell from "@/components/notification-bell";
import colors from "@/theme/colors";

const drawerWidth = 200;

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", Icon: LayoutDashboard },
  { label: "Earn", href: "/earn", Icon: Gift },
  { label: "Daily Bonus", href: "/daily-bonus", Icon: CalendarCheck },
  { label: "Leaderboard", href: "/leaderboard", Icon: Trophy },
  { label: "Referrals", href: "/referrals", Icon: Users },
  { label: "History", href: "/history", Icon: History },
  { label: "Cash Out", href: "/cashout", Icon: Wallet },
  { label: "Profile", href: "/profile", Icon: User },
];

const BOTTOM_NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", Icon: LayoutDashboard },
  { label: "Earn", href: "/earn", Icon: Gift },
  { label: "Daily Bonus", href: "/daily-bonus", Icon: CalendarCheck },
  { label: "Cash Out", href: "/cashout", Icon: Wallet },
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

type StyledBottomNavActionProps = {
  isActive?: boolean;
};

const StyledBottomNavAction = styled(MuiBottomNavigationAction, {
  shouldForwardProp: (prop) => prop !== "isActive",
})<StyledBottomNavActionProps>(({ isActive }) => ({
  minWidth: 0,
  maxWidth: "none",
  flex: 1,
  padding: "6px 0 8px",
  color: isActive ? "#01D676" : colors.text.secondary,
  transition: "color 0.2s",
  "& .MuiBottomNavigationAction-label": {
    fontSize: "0.625rem",
    fontWeight: isActive ? 700 : 500,
    marginTop: 2,
    opacity: 1,
    transition: "color 0.2s",
    "&.Mui-selected": {
      fontSize: "0.625rem",
    },
  },
  "& .MuiSvgIcon-root, & svg": {
    transition: "color 0.2s",
  },
}));

interface AppShellProps {
  children: React.ReactNode;
  coins?: number;
}

export default function AppShell({ children, coins }: AppShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  const balanceCard = (
    <Box
      sx={{
        borderRadius: 3,
        bgcolor: colors.background.secondary,
        border: "1px solid rgba(1, 214, 118, 0.2)",
        p: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
        <Image src="/logo.png" alt="Coins" width={16} height={16} style={{ objectFit: "contain" }} />
        <Typography
          variant="caption"
          sx={{
            fontSize: "10px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "rgba(1, 214, 118, 0.6)",
          }}
        >
          Balance
        </Typography>
      </Box>
      <Typography sx={{ fontSize: "1.5rem", fontWeight: 700, color: "#01D676" }}>
        {(coins ?? 0).toLocaleString()}
      </Typography>
      <Typography sx={{ fontSize: "10px", color: "rgba(1, 214, 118, 0.4)", mt: 0.25 }}>
        &#8776; ${((coins ?? 0) / 1000).toFixed(2)} USD
      </Typography>
    </Box>
  );

  const navList = (onClickItem?: () => void) => (
    <List sx={{ mt: 1 }}>
      {NAV_ITEMS.map(({ label, href, Icon }) => (
        <ListItem key={href} sx={{ px: 1.5, py: 0.25 }}>
          <ListItemButton
            LinkComponent={Link}
            href={href}
            selected={pathname === href}
            onClick={onClickItem}
          >
            <ListItemIcon>
              <Icon size={18} />
            </ListItemIcon>
            <ListItemText primary={label} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );

  const logoutButton = (
    <Box sx={{ p: 1.5 }}>
      <ListItemButton
        onClick={handleLogout}
        sx={{
          "&:hover": {
            bgcolor: "rgba(239, 68, 68, 0.1) !important",
            color: "#f87171 !important",
            "& svg": { color: "#f87171" },
          },
        }}
      >
        <ListItemIcon>
          <LogOut size={18} />
        </ListItemIcon>
        <ListItemText primary="Log Out" />
      </ListItemButton>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Top AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          borderBottom: `1px solid ${colors.divider}`,
        }}
      >
        <Toolbar>
          <IconButton
            aria-label="open menu"
            onClick={() => setMobileOpen(true)}
            sx={{
              display: { xs: "inline-flex", lg: "none" },
              mr: 1,
              bgcolor: "transparent",
            }}
          >
            <Menu size={20} color={colors.text.secondary} />
          </IconButton>

          <Box sx={{ flexGrow: 1 }}>
            <Icons.Logo href="/dashboard" />
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <NotificationBell />
            {coins !== undefined && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  borderRadius: 50,
                  bgcolor: colors.background.secondary,
                  border: "1px solid rgba(1, 214, 118, 0.2)",
                  px: 1.5,
                  py: 0.5,
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#01D676",
                }}
              >
                ${((coins ?? 0) / 1000).toFixed(2)}
              </Box>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Desktop permanent drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            borderRight: `1px solid ${colors.divider}`,
          },
          display: { xs: "none", lg: "block" },
        }}
      >
        <Toolbar />
        {coins !== undefined && <Box sx={{ mx: 1.5, mt: 2 }}>{balanceCard}</Box>}
        <Box sx={{ overflow: "auto", flex: 1 }}>{navList()}</Box>
        <Divider sx={{ borderColor: colors.divider }} />
        {logoutButton}
      </Drawer>

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", lg: "none" },
          "& .MuiDrawer-paper": { width: 260 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1.5,
            borderBottom: `1px solid ${colors.divider}`,
          }}
        >
          <Icons.Logo href="/dashboard" />
          <IconButton onClick={() => setMobileOpen(false)} sx={{ bgcolor: "transparent" }}>
            <X size={20} color={colors.text.secondary} />
          </IconButton>
        </Box>
        {coins !== undefined && <Box sx={{ mx: 1.5, mt: 2 }}>{balanceCard}</Box>}
        <Box sx={{ overflow: "auto", flex: 1 }}>{navList(() => setMobileOpen(false))}</Box>
        <Divider sx={{ borderColor: colors.divider }} />
        {logoutButton}
      </Drawer>

      {/* Main content area */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          width: "100%",
          overflow: "hidden",
        }}
      >
        <Toolbar />
        <Box component="main" sx={{ flex: 1, overflow: "auto", maxWidth: 960, width: "100%", mx: "auto", pb: { xs: "calc(80px + env(safe-area-inset-bottom))", lg: 0 } }}>
          {children}
        </Box>

        {/* Footer (mobile and desktop) */}
        <Box
          component="footer"
          sx={{
            bgcolor: colors.background.secondary,
            borderTop: `1px solid ${colors.divider}`,
            pb: { xs: "calc(80px + env(safe-area-inset-bottom))", lg: 0 },
            mt: 4,
          }}
        >
          <Box
            sx={{
              maxWidth: 960,
              width: "100%",
              mx: "auto",
              px: { xs: 3, sm: 4 },
              py: { xs: 5, sm: 6 },
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              justifyContent: "space-between",
              gap: { xs: 4, md: 8 },
            }}
          >
            {/* Branding & Copyright */}
            <Box sx={{ flexShrink: 0, display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Icons.Logo href="/dashboard" />
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
                          href={isEmail ? url : url}
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
                            "&:hover": { color: "#01D676" },
                          }}
                        >
                          {isEmail && <Mail size={14} />}
                          {text}
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Mobile bottom navigation */}
      <Box sx={{ display: { xs: "flex", lg: "none" } }}>
        <Paper
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1200,
            pb: "env(safe-area-inset-bottom)",
            borderTop: `1px solid ${colors.divider}`,
            bgcolor: colors.primary,
            backgroundImage: "none",
          }}
          elevation={0}
        >
          <MuiBottomNavigation
            showLabels
            sx={{
              bgcolor: "transparent",
              height: 56,
              "& .Mui-selected": { color: "#01D676 !important" },
            }}
          >
            {BOTTOM_NAV_ITEMS.map(({ label, href, Icon }) => {
              const active = pathname === href;
              return (
                <StyledBottomNavAction
                  key={href}
                  isActive={active}
                  label={label}
                  icon={
                    <Box sx={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
                      {active && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: -6,
                            width: 20,
                            height: 3,
                            borderRadius: 2,
                            bgcolor: "#01D676",
                          }}
                        />
                      )}
                      <Icon size={20} color={active ? "#01D676" : colors.text.secondary} />
                    </Box>
                  }
                  {...{ component: Link, href } as any}
                />
              );
            })}
          </MuiBottomNavigation>
        </Paper>
      </Box>
    </Box>
  );
}
