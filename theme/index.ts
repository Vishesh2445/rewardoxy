"use client";

import { createTheme } from "@mui/material/styles";
import { darkScrollbar } from "@mui/material";
import colors from "./colors";
import fonts from "./fonts";

const { primary, text, background, divider, action, scrollBar, glass } = colors;

const theme = createTheme({
  palette: {
    primary: { main: primary },
    secondary: { main: colors.secondary },
    text: { primary: text.primary, secondary: text.secondary },
    background: { default: background.default },
    action: { active: action.active },
    divider,
  },
  typography: {
    fontFamily: fonts.style.fontFamily,
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          ...darkScrollbar({ active: scrollBar.active, thumb: scrollBar.thumb, track: scrollBar.track }),
          scrollbarWidth: "thin",
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          position: "relative",
          transform: "translate(0, 0) scale(1)",
          marginBottom: 8,
          color: text.secondary,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          background: background.ternary,
          border: `1px solid ${glass.border}`,
          color: text.primary,
          transition: "all 0.2s ease",
          "&:hover": {
            borderColor: glass.borderHover,
            background: background.secondary,
          },
          "&.Mui-focused": {
            borderColor: primary,
            background: background.secondary,
            boxShadow: `0 0 0 2px rgba(16, 185, 129, 0.15)`,
          },
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          padding: "12px 24px",
          borderRadius: 10,
          textTransform: "none",
          fontWeight: 700,
          fontSize: "0.875rem",
          transition: "all 0.2s ease",
        },
        containedPrimary: {
          background: colors.gradient,
          color: "#000",
          fontWeight: 700,
          "&:hover": {
            background: "linear-gradient(135deg, #059669 0%, #0891B2 100%)",
            transform: "translateY(-1px)",
            boxShadow: "0 8px 24px rgba(16, 185, 129, 0.25)",
          },
        },
        outlined: {
          borderColor: glass.border,
          color: text.primary,
          background: background.glass,
          "&:hover": {
            backgroundColor: background.glassHover,
            borderColor: glass.borderHover,
          },
        },
      },
    },
    MuiButtonBase: { defaultProps: { disableRipple: true } },
    MuiIconButton: {
      styleOverrides: {
        root: {
          backgroundColor: "transparent",
          color: text.secondary,
          transition: "all 0.2s ease",
          "&:hover": { color: primary, backgroundColor: "rgba(16, 185, 129, 0.08)" },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          padding: 8,
          borderRadius: 8,
          color: text.secondary,
          transition: "all 0.2s ease",
          "&:hover": { color: primary, backgroundColor: "rgba(16, 185, 129, 0.06)" },
          "&.Mui-selected": { backgroundColor: "rgba(16, 185, 129, 0.1)", color: primary },
        },
      },
    },
    MuiListItemText: {
      styleOverrides: { primary: { fontSize: "0.875rem", fontWeight: 600 } },
    },
    MuiListItemIcon: {
      styleOverrides: { root: { minWidth: "auto", marginRight: 8 } },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundColor: background.default, backgroundImage: "none", border: "none" } },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          height: 72,
          color: text.secondary,
          backgroundColor: "rgba(8, 11, 18, 0.95)",
          backdropFilter: "blur(20px)",
          borderTop: `1px solid ${glass.border}`,
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: { transition: "all 0.2s ease", "&.Mui-selected": { color: primary } },
        label: { fontSize: "0.65rem", marginTop: 4, fontWeight: 600, "&.Mui-selected": { fontSize: "0.65rem" } },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { backgroundColor: background.drawer, borderRight: `1px solid ${glass.border}` },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { backgroundColor: "rgba(8, 11, 18, 0.9)", backdropFilter: glass.backdrop, borderBottom: `1px solid ${glass.border}` },
      },
    },
  },
});

export default theme;
