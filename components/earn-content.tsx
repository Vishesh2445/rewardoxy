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

type WallType = "MyLead" | "CPX Research" | "Vortex" | "Notik";

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
    if (activeWall === "Vortex") {
      const placementId = "69dfafd0a982f180b5caa54c";
      return `https://vortexwall.com/ow/${placementId}/${userId}`;
    }
    if (activeWall === "Notik") {
      const apiKey = "PYMTzu6owFJ8roFouth5bEYxoJRmg7q9";
      const pubId = "mIJkTN";
      const appId = "dOTR7kmvMw";
      return `https://notik.me/coins?api_key=${apiKey}&pub_id=${pubId}&app_id=${appId}&user_id=${userId}`;
    }
    return "";
  };

  const iframeSrc = getIframeSrc();

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 10, lg: 2 } }}>
      {/* Offer Walls section */}
      <Box sx={{ py: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
          <Box
            sx={{
              width: 28, height: 28, borderRadius: 1.5,
              background: colors.background.glass,
              backdropFilter: colors.glass.backdrop,
              border: `1px solid ${colors.glass.border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <Box
              sx={{
                width: 0, height: 0, borderStyle: "solid",
                borderWidth: "5px 0 5px 9px",
                borderColor: `transparent transparent transparent ${colors.primary}`,
                ml: "1px",
              }}
            />
          </Box>
          <Typography variant="h6" isBold>Offer Walls</Typography>
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(auto-fill, 180px)" }, gap: 2 }}>
          {/* MyLead card */}
          <Paper
            onClick={() => handleOpenWall("MyLead")}
            elevation={0}
            sx={{
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              borderRadius: 2, p: { xs: 2.5, sm: 4 }, cursor: "pointer",
              background: colors.background.glass,
              backdropFilter: colors.glass.backdrop,
              border: `1px solid ${colors.glass.border}`,
              transition: "all 0.3s ease",
              "&:hover": { 
                transform: "translateY(-4px)", 
                borderColor: colors.glass.borderHover,
                background: colors.background.glassHover,
                boxShadow: `0 12px 32px rgba(99, 102, 241, 0.15)`,
              },
            }}
          >
            <Box
              component="img"
              src="/mylead_logo.jpg"
              alt="MyLead"
              sx={{ width: 64, height: 64, borderRadius: 2, objectFit: "cover" }}
            />
            <Typography variant="subtitle2" isBold sx={{ mt: 1.5, color: "#fff" }}>MyLead</Typography>
          </Paper>

          {/* Vortex card */}
          <Paper
            onClick={() => handleOpenWall("Vortex")}
            elevation={0}
            sx={{
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              borderRadius: 2, p: { xs: 2.5, sm: 4 }, cursor: "pointer",
              background: colors.background.glass,
              backdropFilter: colors.glass.backdrop,
              border: `1px solid ${colors.glass.border}`,
              transition: "all 0.3s ease",
              "&:hover": { 
                transform: "translateY(-4px)", 
                borderColor: colors.glass.borderHover,
                background: colors.background.glassHover,
                boxShadow: `0 12px 32px rgba(99, 102, 241, 0.15)`,
              },
            }}
          >
            <Box
              component="img"
              src="/mobivortex-icon.png"
              alt="Vortex"
              sx={{ width: 64, height: 64, borderRadius: 2, objectFit: "cover" }}
            />
            <Typography variant="subtitle2" isBold sx={{ mt: 1.5, color: "#fff" }}>Vortex</Typography>
          </Paper>

          {/* Notik card */}
          <Paper
            onClick={() => handleOpenWall("Notik")}
            elevation={0}
            sx={{
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              borderRadius: 2, p: { xs: 2.5, sm: 4 }, cursor: "pointer",
              background: colors.background.glass,
              backdropFilter: colors.glass.backdrop,
              border: `1px solid ${colors.glass.border}`,
              transition: "all 0.3s ease",
              "&:hover": { 
                transform: "translateY(-4px)", 
                borderColor: colors.glass.borderHover,
                background: colors.background.glassHover,
                boxShadow: `0 12px 32px rgba(99, 102, 241, 0.15)`,
              },
            }}
          >
            <Box
              component="img"
              src="/notik.jpg"
              alt="Notik"
              sx={{ width: 64, height: 64, borderRadius: 2, objectFit: "cover" }}
            />
            <Typography variant="subtitle2" isBold sx={{ mt: 1.5, color: "#fff" }}>Notik</Typography>
          </Paper>
        </Box>
      </Box>

      {/* Survey Partners section */}
      <Box sx={{ py: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
          <Box
            sx={{
              width: 28, height: 28, borderRadius: 1.5,
              background: colors.background.glass,
              backdropFilter: colors.glass.backdrop,
              border: `1px solid ${colors.glass.border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <Box
              sx={{
                width: 0, height: 0, borderStyle: "solid",
                borderWidth: "5px 0 5px 9px",
                borderColor: `transparent transparent transparent ${colors.primary}`,
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
              borderRadius: 2, p: { xs: 2.5, sm: 4 }, cursor: "pointer",
              background: colors.background.glass,
              backdropFilter: colors.glass.backdrop,
              border: `1px solid ${colors.glass.border}`,
              transition: "all 0.3s ease",
              "&:hover": { 
                transform: "translateY(-4px)", 
                borderColor: colors.glass.borderHover,
                background: colors.background.glassHover,
                boxShadow: `0 12px 32px rgba(99, 102, 241, 0.15)`,
              },
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
      <Paper sx={{ 
        borderRadius: 2, 
        background: colors.background.glass,
        backdropFilter: colors.glass.backdrop,
        border: `1px solid ${colors.glass.border}`, 
        p: 2.5, 
        mt: 3 
      }}>
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
        slotProps={{
          paper: {
            sx: {
              bgcolor: colors.background.default,
              border: `1px solid ${colors.glass.border}`,
              borderRadius: 2,
              height: "90vh", maxHeight: "90vh",
              display: "flex", flexDirection: "column", overflow: "hidden",
              background: colors.background.glass,
              backdropFilter: colors.glass.backdrop,
            },
          },
          backdrop: { sx: { bgcolor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" } },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            borderBottom: `1px solid ${colors.glass.border}`, px: 2.5, py: 1.5,
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
              background: colors.background.glass,
              backdropFilter: colors.glass.backdrop,
              border: `1px solid ${colors.glass.border}`,
              borderRadius: 1, color: colors.text.secondary, width: 32, height: 32,
              "&:hover": { borderColor: colors.glass.borderHover, color: colors.primary },
            }}
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, flex: 1, overflow: "hidden", position: "relative", bgcolor: colors.background.default }}>
          
          {/* Loading Animation */}
          {iframeLoading && !adBlockDetected && (
            <Box
              sx={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 2, bgcolor: colors.background.default
              }}
            >
              <CircularProgress size={40} sx={{ color: colors.primary }} />
            </Box>
          )}

          {/* Adblock Error Message for CPX */}
          {activeWall === "CPX Research" && adBlockDetected && (
            <Box
              sx={{
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                textAlign: "center", p: 3, zIndex: 3, bgcolor: colors.background.default,
                border: `1px solid ${colors.glass.border}`, borderRadius: 2, m: 2
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
                bgcolor: colors.background.default,
                display: adBlockDetected ? "none" : "block" 
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}



