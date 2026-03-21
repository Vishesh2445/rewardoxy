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
  Divider,
} from "@mui/material";
import {
  LayoutDashboard,
  Users,
  Wallet,
  Bell,
  LogOut,
  Menu,
  X,
  ArrowLeft,
  Key,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Icons from "@/components/icons";
import Typography from "@/components/ui/Typography";
import colors from "@/theme/colors";

const drawerWidth = 220;

const ADMIN_NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", Icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", Icon: Users },
  { label: "Withdrawals", href: "/admin/withdrawals", Icon: Wallet },
  { label: "Password Resets", href: "/admin/password-resets", Icon: Key },
  { label: "Notifications", href: "/admin/notifications", Icon: Bell },
];

interface AdminShellProps {
  children: React.ReactNode;
}

export default function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  const navList = (onClickItem?: () => void) => (
    <List sx={{ mt: 1 }}>
      {ADMIN_NAV_ITEMS.map(({ label, href, Icon }) => (
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

  const backToSite = (
    <Box sx={{ p: 1.5 }}>
      <ListItemButton
        LinkComponent={Link}
        href="/dashboard"
        sx={{
          "&:hover": {
            bgcolor: "rgba(1, 214, 118, 0.1) !important",
            color: "#01D676 !important",
            "& svg": { color: "#01D676" },
          },
        }}
      >
        <ListItemIcon>
          <ArrowLeft size={18} />
        </ListItemIcon>
        <ListItemText primary="Back to Site" />
      </ListItemButton>
    </Box>
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

          <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center", gap: 1.5 }}>
            <Icons.Logo href="/admin" />
            <Box
              sx={{
                borderRadius: 1.5,
                bgcolor: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                px: 1,
                py: 0.25,
                fontSize: "0.625rem",
                fontWeight: 700,
                color: "#f87171",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Admin
            </Box>
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
        <Box sx={{ overflow: "auto", flex: 1 }}>{navList()}</Box>
        <Divider sx={{ borderColor: colors.divider }} />
        {backToSite}
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
          <Icons.Logo href="/admin" />
          <IconButton onClick={() => setMobileOpen(false)} sx={{ bgcolor: "transparent" }}>
            <X size={20} color={colors.text.secondary} />
          </IconButton>
        </Box>
        <Box sx={{ overflow: "auto", flex: 1 }}>{navList(() => setMobileOpen(false))}</Box>
        <Divider sx={{ borderColor: colors.divider }} />
        {backToSite}
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
        <Box
          component="main"
          sx={{ flex: 1, overflow: "auto", maxWidth: 1100, width: "100%", mx: "auto" }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
