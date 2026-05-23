"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { AppBar, Box, Drawer, Toolbar, IconButton, Button, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Menu, MenuItem, Avatar } from "@mui/material";
import { Gift, Trophy, Users, Wallet, User, History, CalendarCheck, LogOut, Menu as MenuIcon, X, Mail, ChevronDown, ShoppingBag, Target } from "lucide-react";
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
  { label: "Offers", href: "/offers/all", Icon: ShoppingBag },
  { label: "Cashout", href: "/cashout", Icon: Wallet },
  { label: "Rewards", href: "/daily-bonus", Icon: CalendarCheck },
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

const DROPDOWN_ITEMS = [
  { label: "My Offers", href: "/my-offers", Icon: Target },
  { label: "Leaderboard", href: "/leaderboard", Icon: Trophy },
  { label: "Referrals", href: "/referrals", Icon: Users },
  { label: "History", href: "/history", Icon: History },
  { label: "Profile", href: "/profile", Icon: User },
];

const footerInfoList = [
  { title: "Quick Links", links: [{ text: "Earn", url: "/earn" }, { text: "Cash Out", url: "/cashout" }, { text: "Surveys", url: "/surveys" }, { text: "Rewards", url: "/rewards" }] },
  { title: "About", links: [{ text: "About Us", url: "/about" }, { text: "FAQ", url: "/faq" }, { text: "Terms of Service", url: "/terms" }, { text: "Privacy Policy", url: "/privacy" }] },
  { title: "Support", links: [{ text: "How It Works", url: "/about" }, { text: "Contact", url: "/contact" }] },
  { title: "Contact", links: [{ text: "support@rewardoxy.app", url: "mailto:support@rewardoxy.app", isEmail: true }] },
];

const socialLinks = [{ icon: "telegram", url: "https://t.me/rewardoxy", label: "Telegram" }];

interface AppShellProps { children: React.ReactNode; coins?: number; userName?: string; userAvatar?: string; userId?: string; }

export default function AppShell({ children, coins, userName = "User", userAvatar, userId }: AppShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: colors.background.default }}>
      {/* Top Navigation Bar */}
      <AppBar position="fixed" elevation={0} sx={{ bgcolor: "rgba(8,11,18,0.92)", backdropFilter: "blur(20px)", borderBottom: `1px solid ${colors.glass.border}`, zIndex: 1300 }}>
        <Toolbar sx={{ px: { xs: 2, sm: 3, md: 4 }, minHeight: { xs: 56, sm: 64 } }}>
          {/* Mobile */}
          <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", width: "100%" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton onClick={() => setMobileOpen(true)} sx={{ color: colors.text.secondary, p: 1 }}><MenuIcon size={20} /></IconButton>
              <Box sx={{ position: "relative", width: 28, height: 24 }}><Image src="/logo.png" alt="Rewardoxy" width={28} height={24} style={{ objectFit: "contain" }} /></Box>
            </Box>
            <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>{userId && <BalanceDisplay userId={userId} initialBalance={coins} />}</Box>
            {userId ? <NotificationBell /> : <Button component={Link} href="/auth/signup" sx={{ bgcolor: colors.primary, color: "#fff", textTransform: "none", fontWeight: 600, fontSize: "0.75rem", px: 1.5, py: 0.5, borderRadius: "6px", minWidth: "auto", "&:hover": { bgcolor: "rgba(16,185,129,0.85)" } }}>Sign Up</Button>}
          </Box>

          {/* Desktop */}
          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", width: "100%" }}>
            <Box sx={{ mr: 4 }}><Icons.Logo href="/profile" /></Box>
            <Box sx={{ display: "flex", gap: 0.5, flexGrow: 1 }}>
              {NAV_ITEMS.map(({ label, href, Icon }) => {
                const isActive = pathname === href;
                return (
                  <Button key={href} component={Link} href={href} startIcon={<Icon size={17} />}
                    sx={{ color: isActive ? colors.primary : colors.text.secondary, bgcolor: isActive ? "rgba(16,185,129,0.1)" : "transparent", px: 2, py: 0.75, borderRadius: "8px", textTransform: "none", fontWeight: isActive ? 700 : 500, fontSize: "0.875rem", "&:hover": { bgcolor: isActive ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.05)", color: isActive ? colors.primary : colors.text.primary } }}>
                    {label}
                  </Button>
                );
              })}
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {userId && <BalanceDisplay userId={userId} initialBalance={coins} />}
              {userId && <NotificationBell />}
              {userId ? (
                <>
                  <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0.5, bgcolor: open ? "rgba(16,185,129,0.06)" : "transparent", "&:hover": { bgcolor: "rgba(16,185,129,0.06)" } }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar src={userAvatar} sx={{ width: 32, height: 32, bgcolor: colors.primary, fontSize: "0.8rem", fontWeight: 700 }}>{userName?.charAt(0).toUpperCase() || "U"}</Avatar>
                      <ChevronDown size={14} color={colors.text.secondary} />
                    </Box>
                  </IconButton>
                  <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)} slotProps={{ paper: { sx: { bgcolor: colors.background.primary, border: `1px solid ${colors.glass.border}`, borderRadius: "12px", mt: 1, minWidth: 200 } } }} transformOrigin={{ horizontal: "right", vertical: "top" }} anchorOrigin={{ horizontal: "right", vertical: "bottom" }}>
                    {DROPDOWN_ITEMS.map(({ label, href, Icon }) => (
                      <MenuItem key={href} component={Link} href={href} onClick={() => setAnchorEl(null)} sx={{ py: 1.5, px: 2, gap: 1.5, color: colors.text.primary, fontSize: "0.875rem", "&:hover": { bgcolor: "rgba(16,185,129,0.06)" } }}>
                        <Icon size={17} />{label}
                      </MenuItem>
                    ))}
                    <Box sx={{ borderTop: `1px solid ${colors.glass.border}`, mt: 0.5 }} />
                    <MenuItem onClick={() => { setAnchorEl(null); handleLogout(); }} sx={{ py: 1.5, px: 2, gap: 1.5, color: "#f87171", "&:hover": { bgcolor: "rgba(239,68,68,0.08)" } }}>
                      <LogOut size={17} />Log Out
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Button component={Link} href="/auth/signup" sx={{ bgcolor: colors.primary, color: "#fff", textTransform: "none", fontWeight: 600, fontSize: "0.875rem", px: 2.5, py: 0.75, borderRadius: "8px", "&:hover": { bgcolor: "rgba(16,185,129,0.85)" } }}>
                  Sign Up
                </Button>
              )}
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer anchor="left" open={mobileOpen} onClose={() => setMobileOpen(false)} sx={{ display: { xs: "block", md: "none" }, "& .MuiDrawer-paper": { width: 280, bgcolor: colors.background.drawer, borderRight: `1px solid ${colors.glass.border}` } }}>
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2, borderBottom: `1px solid ${colors.glass.border}` }}>
            <Icons.Logo href="/profile" />
            <IconButton onClick={() => setMobileOpen(false)} sx={{ color: colors.text.secondary }}><X size={20} /></IconButton>
          </Box>
          <Box sx={{ p: 2, borderBottom: `1px solid ${colors.glass.border}` }}>
            {userId ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar src={userAvatar} sx={{ width: 44, height: 44, bgcolor: colors.primary, fontWeight: 700 }}>{userName?.charAt(0).toUpperCase() || "U"}</Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: "0.9rem" }}>{userName || "User"}</Typography>
                  {userId && <BalanceDisplay userId={userId} initialBalance={coins} />}
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button component={Link} href="/auth/login" onClick={() => setMobileOpen(false)} sx={{ flex: 1, border: `1px solid ${colors.glass.border}`, color: colors.text.primary, textTransform: "none", fontWeight: 600, fontSize: "0.8rem", borderRadius: "8px" }}>Log In</Button>
                <Button component={Link} href="/auth/signup" onClick={() => setMobileOpen(false)} sx={{ flex: 1, bgcolor: colors.primary, color: "#fff", textTransform: "none", fontWeight: 600, fontSize: "0.8rem", borderRadius: "8px", "&:hover": { bgcolor: "rgba(16,185,129,0.85)" } }}>Sign Up</Button>
              </Box>
            )}
          </Box>
          <List sx={{ flex: 1, py: 1 }}>
            {ALL_NAV_ITEMS.map(({ label, href, Icon }) => {
              const isActive = pathname === href;
              return (
                <ListItem key={href} sx={{ px: 1.5, py: 0.25 }}>
                  <ListItemButton component={Link} href={href} onClick={() => setMobileOpen(false)} selected={isActive}
                    sx={{ borderRadius: "10px", py: 1.25, color: isActive ? colors.primary : colors.text.primary, bgcolor: isActive ? "rgba(16,185,129,0.1)" : "transparent", borderLeft: isActive ? `3px solid ${colors.primary}` : "3px solid transparent", "&:hover": { bgcolor: "rgba(16,185,129,0.06)" }, "&.Mui-selected": { bgcolor: "rgba(16,185,129,0.1)" } }}>
                    <ListItemIcon sx={{ minWidth: 36, color: isActive ? colors.primary : colors.text.secondary }}><Icon size={19} /></ListItemIcon>
                    <ListItemText primary={label} primaryTypographyProps={{ fontWeight: isActive ? 700 : 500, fontSize: "0.875rem" }} />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
          {userId && (
            <Box sx={{ p: 2, borderTop: `1px solid ${colors.glass.border}` }}>
              <ListItemButton onClick={() => { setMobileOpen(false); handleLogout(); }} sx={{ borderRadius: "10px", color: "#f87171", "&:hover": { bgcolor: "rgba(239,68,68,0.08)" } }}>
                <ListItemIcon sx={{ minWidth: 36, color: "#f87171" }}><LogOut size={19} /></ListItemIcon>
                <ListItemText primary="Log Out" primaryTypographyProps={{ fontWeight: 600, fontSize: "0.875rem" }} />
              </ListItemButton>
            </Box>
          )}
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, pt: { xs: 7, sm: 8 }, pb: { xs: 10, md: 0 }, bgcolor: colors.background.default, minHeight: "100vh" }}>
        {children}
      </Box>

      {/* Bottom Navigation - Mobile */}
      <BottomNavbar />

      {/* Footer */}
      <Box component="footer" sx={{ bgcolor: colors.background.drawer, borderTop: `1px solid ${colors.glass.border}`, mt: 4 }}>
        <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 4, sm: 5, md: 6 }, display: "flex", flexDirection: { xs: "column", md: "row" }, justifyContent: "space-between", gap: { xs: 4, md: 8 } }}>
          <Box sx={{ flexShrink: 0, display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Icons.Logo href="/profile" />
            <Typography sx={{ color: colors.text.secondary, fontSize: "0.8rem", maxWidth: 280 }}>Get paid to complete tasks, surveys and offers.</Typography>
            <Typography sx={{ color: "rgba(139,154,181,0.5)", fontSize: "0.7rem", mt: { xs: 2, md: "auto" } }}>&copy; {new Date().getFullYear()} Rewardoxy. All rights reserved.</Typography>
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" }, gap: { xs: 3, sm: 4 }, flexGrow: 1 }}>
            {footerInfoList.map(({ title, links }) => (
              <Box key={title}>
                <Typography sx={{ color: colors.text.primary, fontWeight: 700, fontSize: "0.8rem", mb: 1.5 }}>{title}</Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                  {links.map(({ text, url, isEmail }: { text: string; url: string; isEmail?: boolean }) => (
                    <Box key={text} component={isEmail ? "a" : Link} href={url} target={isEmail ? "_blank" : undefined} rel={isEmail ? "noopener noreferrer" : undefined}
                      sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, color: colors.text.secondary, textDecoration: "none", fontSize: "0.78rem", transition: "color 0.2s", "&:hover": { color: colors.primary } }}>
                      {isEmail && <Mail size={13} />}{text}
                    </Box>
                  ))}
                  {title === "Contact" && (
                    <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                      {socialLinks.map(({ icon, url, label }) => (
                        <Box key={icon} component="a" href={url} target="_blank" rel="noopener noreferrer" aria-label={label} sx={{ transition: "all 0.2s", "&:hover": { transform: "translateY(-2px)" } }}>
                          <Icons.Telegram size={26} />
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
