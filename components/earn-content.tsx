"use client";

import { useState } from "react";
import { Box, Dialog, DialogTitle, DialogContent, IconButton, Paper } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@/components/ui/Typography";
import colors from "@/theme/colors";

type EarnContentProps = {
  userId: string;
};

export default function EarnContent({ userId }: EarnContentProps) {
  const [open, setOpen] = useState(false);
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

  const baseUrl = process.env.NEXT_PUBLIC_MYLEAD_WALL_URL ?? "";
  const iframeSrc = `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}uid=${userId}`;

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 10, lg: 2 } }}>
      {/* section header */}
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

        {/* cards grid - 2 columns on mobile, flexible on desktop */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(auto-fill, 180px)" }, gap: 2 }}>
          {/* MyLead card */}
          <Paper
            onClick={() => setOpen(true)}
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
            <Typography sx={{ fontSize: "0.75rem", color: colors.text.secondary, mt: 0.5 }}></Typography>
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
            <Typography sx={{ fontSize: "0.75rem", color: colors.text.secondary, mt: 0.5 }}></Typography>
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
            bgcolor: colors.background.default,
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
          }}
        >
          <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#fff" }}>MyLead Offer Wall</Typography>
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
        <DialogContent sx={{ p: 0, flex: 1, overflow: "hidden" }}>
          <Box
            component="iframe"
            src={iframeSrc}
            title="MyLead Offer Wall"
            allow="clipboard-write"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-top-navigation"
            sx={{ width: "100%", height: "100%", border: "none" }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
