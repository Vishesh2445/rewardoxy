"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@/components/ui/Typography";

export default function OfferwallModal() {
  const [open, setOpen] = useState(false);
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const baseUrl = process.env.NEXT_PUBLIC_MYLEAD_WALL_URL ?? "";

  return (
    <>
      {/* Card trigger */}
      <Paper
        component="button"
        onClick={() => setOpen(true)}
        elevation={0}
        sx={{
          bgcolor: "#1d1e30",
          border: "1px solid #2a2b43",
          borderRadius: 4,
          p: 5,
          textAlign: "center",
          cursor: "pointer",
          transition: "all 0.2s ease",
          "&:hover": {
            borderColor: "rgba(1, 214, 118, 0.3)",
            "& .card-title": {
              color: "#01D676",
            },
          },
        }}
      >
        <Box
          sx={{
            mx: "auto",
            display: "flex",
            height: 64,
            width: 64,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 4,
            bgcolor: "#00e9411a",
            border: "1px solid rgba(1, 214, 118, 0.2)",
          }}
        >
          <Typography
            sx={{
              fontSize: "1.5rem",
              fontWeight: 800,
              color: "#01D676",
            }}
          >
            M
          </Typography>
        </Box>
        <Typography
          className="card-title"
          sx={{
            mt: 2.5,
            fontSize: "1.25rem",
            fontWeight: 700,
            color: "#ffffff",
            transition: "color 0.2s ease",
          }}
        >
          MyLead
        </Typography>
        <Typography
          sx={{
            mt: 1,
            fontSize: "0.875rem",
            color: "#a9a9ca",
          }}
        >
          Offer Wall
        </Typography>
      </Paper>

      {/* Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="lg"
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            bgcolor: "#141523",
            border: "1px solid #2a2b43",
            borderRadius: 6,
            height: "90vh",
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          },
        }}
        slotProps={{
          backdrop: {
            sx: {
              bgcolor: "rgba(0, 0, 0, 0.7)",
              backdropFilter: "blur(4px)",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #2a2b43",
            px: 2.5,
            py: 1.5,
          }}
        >
          <Typography
            sx={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#ffffff",
            }}
          >
            MyLead Offer Wall
          </Typography>
          <IconButton
            onClick={() => setOpen(false)}
            size="small"
            sx={{
              bgcolor: "#1d1e30",
              border: "1px solid #2a2b43",
              borderRadius: 2,
              color: "#a9a9ca",
              width: 32,
              height: 32,
              transition: "all 0.2s ease",
              "&:hover": {
                borderColor: "rgba(239, 68, 68, 0.4)",
                color: "#f87171",
              },
            }}
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0, flex: 1, overflow: "hidden" }}>
          <Box
            component="iframe"
            src={baseUrl}
            title="MyLead Offer Wall"
            allow="clipboard-write"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-top-navigation"
            sx={{
              width: "100%",
              height: "100%",
              border: "none",
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
