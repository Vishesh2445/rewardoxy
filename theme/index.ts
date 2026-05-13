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
          background: background.primary,
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
            boxShadow: `0 0 20px rgba(1, 214, 118, 0.15)`,
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
          fontSize: "0.95rem",
          transition: "all 0.2s ease",
        },
        containedPrimary: {
          background: colors.gradient,
          color: "#000",
          fontWeight: 700,
          "&:hover": {
            background: "linear-gradient(135deg, #00B864 0%, #059BB8 100%)",
            transform: "translateY(-1px)",
            boxShadow: "0 8px 24px rgba(1, 214, 118, 0.25)",
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
          "&:hover": { color: primary, backgroundColor: "rgba(1, 214, 118, 0.08)" },
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
          "&:hover": { color: primary, backgroundColor: "rgba(1, 214, 118, 0.06)" },
          "&.Mui-selected": { backgroundColor: "rgba(1, 214, 118, 0.1)", color: primary },
        },
      },
    },
    MuiListItemText: {
      styleOverrides: { primary: { fontSize: "0.9rem", fontWeight: 600 } },
    },
    MuiListItemIcon: {
      styleOverrides: { root: { minWidth: "auto", marginRight: 8 } },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundColor: background.default, backgroundImage: "none" } },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          height: 75,
          color: text.secondary,
          backgroundColor: background.default,
          borderTop: `1px solid ${glass.border}`,
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: { transition: "all 0.2s ease", "&.Mui-selected": { color: primary } },
        label: { fontSize: "0.685rem", marginTop: 6, "&.Mui-selected": { fontSize: "0.635rem" } },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { backgroundColor: background.drawer, borderRight: `1px solid ${glass.border}` },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { backgroundColor: "rgba(8, 11, 18, 0.85)", backdropFilter: glass.backdrop, borderBottom: `1px solid ${glass.border}` },
      },
    },
  },
});

export default theme;
