"use client";

import { useState, useEffect } from "react";
import { Box, Dialog, DialogTitle, DialogContent, IconButton, Paper, CircularProgress } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@/components/ui/Typography";
import colors from "@/theme/colors";

type EarnContentProps = {
  userId: string;
  userName: string;
  userEmail: string;
  cpxHash: string;
};

type WallType = "MyLead" | "CPX Research";

export default function EarnContent({ userId, userName, userEmail, cpxHash }: EarnContentProps) {
  const [open, setOpen] = useState(false);
  const [activeWall, setActiveWall] = useState<WallType | null>(null);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [adBlockDetected, setAdBlockDetected] = useState(false);
  
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

  useEffect(() => {
    // Basic Adblock detection by attempting to fetch a known tracker URL
    const checkAdBlock = async () => {
      try {
        await fetch("https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js", {
          method: "HEAD",
          mode: "no-cors",
          cache: "no-store",
        });
        setAdBlockDetected(false);
      } catch (e) {
        setAdBlockDetected(true);
      }
    };
    
    if (open && activeWall === "CPX Research") {
      checkAdBlock();
    }
  }, [open, activeWall]);

  const myLeadBaseUrl = process.env.NEXT_PUBLIC_MYLEAD_WALL_URL ?? "";

  const handleOpenWall = (wall: WallType) => {
    setActiveWall(wall);
    setIframeLoading(true);
    setOpen(true);
  };

  const getIframeSrc = () => {
    if (activeWall === "MyLead") {
      return `${myLeadBaseUrl}${myLeadBaseUrl.includes("?") ? "&" : "?"}uid=${userId}`;
    }
    if (activeWall === "CPX Research") {
      const appId = "32037"; 
      const encodedName = encodeURIComponent(userName || "");
      const encodedEmail = encodeURIComponent(userEmail || "");
      
      return `https://offers.cpx-research.com/index.php?app_id=${appId}&ext_user_id=${userId}&secure_hash=${cpxHash}&username=${encodedName}&email=${encodedEmail}&subid_1=&subid_2`;
    }
    return "";
  };

  const iframeSrc = getIframeSrc();

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 10, lg: 2 } }}>
      {/* Offer Walls section */}
      <Box sx={{ py: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Box
            sx={{
              width: 28, height: 28, borderRadius: 1.5,
              bgcolor: colors.background.secondary,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <Box
              sx={{
                width: 0, height: 0, borderStyle: "solid",
                borderWidth: "5px 0 5px 9px",
                borderColor: `transparent transparent transparent ${colors.secondary}`,
                ml: "1px",
              }}
            />
          </Box>
          <Typography variant="h6" isBold>Offer Wall</Typography>
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(auto-fill, 180px)" }, gap: 2 }}>
          {/* MyLead card */}
          <Paper
            onClick={() => handleOpenWall("MyLead")}
            elevation={0}
            sx={{
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              borderRadius: 4, p: { xs: 2.5, sm: 4 }, cursor: "pointer",
              bgcolor: colors.primary, border: `1px solid ${colors.divider}`,
              transition: "all 0.2s ease-in-out",
              "&:hover": { transform: "scale(1.04)", borderColor: "rgba(1,214,118,0.4)" },
            }}
          >
            <Box
              component="img"
              src="/mylead_logo.jpg"
              alt="MyLead"
              sx={{ width: 64, height: 64, borderRadius: 3, objectFit: "cover" }}
            />
            <Typography variant="subtitle2" isBold sx={{ mt: 1.5, color: "#fff" }}>MyLead</Typography>
          </Paper>

          {/* Torox card - coming soon */}
          <Paper
            elevation={0}
            sx={{
              position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              borderRadius: 4, p: { xs: 2.5, sm: 4 }, opacity: 0.6,
              bgcolor: colors.primary, border: `1px solid ${colors.divider}`,
              cursor: "default",
            }}
          >
            <Box
              sx={{
                position: "absolute", top: 8, right: 8,
                bgcolor: colors.background.ternary, border: `1px solid ${colors.divider}`,
                borderRadius: 2, px: 1, py: 0.25, fontSize: "0.6rem", fontWeight: 700,
                color: colors.text.secondary, textTransform: "uppercase", letterSpacing: "0.05em",
              }}
            >
              Coming Soon
            </Box>
            <Box
              component="img"
              src="/torox.svg"
              alt="Torox"
              sx={{ width: 64, height: 64, objectFit: "contain" }}
            />
            <Typography variant="subtitle2" isBold sx={{ mt: 1.5, color: "#fff" }}>Torox</Typography>
          </Paper>
        </Box>
      </Box>

      {/* Survey Partners section */}
      <Box sx={{ py: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Box
            sx={{
              width: 28, height: 28, borderRadius: 1.5,
              bgcolor: colors.background.secondary,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <Box
              sx={{
                width: 0, height: 0, borderStyle: "solid",
                borderWidth: "5px 0 5px 9px",
                borderColor: `transparent transparent transparent ${colors.secondary}`,
                ml: "1px",
              }}
            />
          </Box>
          <Typography variant="h6" isBold>Survey Partners</Typography>
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(auto-fill, 180px)" }, gap: 2 }}>
          {/* CPX Research card */}
          <Paper
            onClick={() => handleOpenWall("CPX Research")}
            elevation={0}
            sx={{
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              borderRadius: 4, p: { xs: 2.5, sm: 4 }, cursor: "pointer",
              bgcolor: colors.primary, border: `1px solid ${colors.divider}`,
              transition: "all 0.2s ease-in-out",
              "&:hover": { transform: "scale(1.04)", borderColor: "rgba(1,214,118,0.4)" },
            }}
          >
            <Box
              component="img"
              src="/cpx.png"
              alt="CPX Research"
              sx={{ width: 120, height: "auto", maxHeight: 80, objectFit: "contain" }}
            />
            <Typography variant="subtitle2" isBold sx={{ mt: 1.5, color: "#fff" }}>CPX Research</Typography>
          </Paper>
        </Box>
      </Box>

      {/* info banner */}
      <Paper sx={{ borderRadius: 3, border: `1px solid ${colors.divider}`, bgcolor: colors.primary, p: 2.5, mt: 1 }}>
        <Typography sx={{ fontSize: "0.8rem", color: colors.text.secondary }}>
          Complete offers and surveys to earn coins. Coins are credited automatically after verification.
        </Typography>
      </Paper>

      {/* offerwall dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="lg"
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            bgcolor: "#000",
            border: `1px solid ${colors.divider}`,
            borderRadius: 6,
            height: "90vh", maxHeight: "90vh",
            display: "flex", flexDirection: "column", overflow: "hidden",
          },
        }}
        slotProps={{
          backdrop: { sx: { bgcolor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" } },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            borderBottom: `1px solid ${colors.divider}`, px: 2.5, py: 1.5,
            bgcolor: colors.background.default
          }}
        >
          <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#fff" }}>
            {activeWall} {activeWall === "CPX Research" ? "" : "Offer Wall"}
          </Typography>
          <IconButton
            onClick={() => setOpen(false)}
            size="small"
            sx={{
              bgcolor: colors.primary, border: `1px solid ${colors.divider}`,
              borderRadius: 2, color: colors.text.secondary, width: 32, height: 32,
              "&:hover": { borderColor: "rgba(239,68,68,0.4)", color: "#f87171" },
            }}
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, flex: 1, overflow: "hidden", position: "relative", bgcolor: "#000" }}>
          
          {/* Loading Animation */}
          {iframeLoading && !adBlockDetected && (
            <Box
              sx={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 2, bgcolor: "#000"
              }}
            >
              <CircularProgress size={40} sx={{ color: colors.secondary }} />
            </Box>
          )}

          {/* Adblock Error Message for CPX */}
          {activeWall === "CPX Research" && adBlockDetected && (
            <Box
              sx={{
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                textAlign: "center", p: 3, zIndex: 3, bgcolor: "#000",
                border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4, m: 2
              }}
            >
              <Typography sx={{ color: colors.text.secondary, mb: 1.5, fontSize: "1rem" }}>
                Unfortunately we cant connect to our Server.
              </Typography>
              <Typography sx={{ color: colors.text.secondary, opacity: 0.8, fontSize: "0.875rem" }}>
                If you have the problem permanently, please deactivate your adblocker.
              </Typography>
            </Box>
          )}

          {activeWall && (
            <Box
              component="iframe"
              src={iframeSrc}
              onLoad={() => setIframeLoading(false)}
              title={`${activeWall}`}
              sx={{ 
                width: "100%", height: "100%", border: "none", 
                bgcolor: "#000",
                display: adBlockDetected ? "none" : "block" 
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}



