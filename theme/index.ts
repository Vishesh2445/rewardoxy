"use client";

import { createTheme } from "@mui/material/styles";
import { darkScrollbar } from "@mui/material";
import colors from "./colors";
import fonts from "./fonts";

const { primary, secondary, tertiary, text, background, divider, action, scrollBar, glass } =
  colors;

const theme = createTheme({
  palette: {
    primary: {
      main: primary,
    },
    secondary: {
      main: secondary,
    },
    text: {
      primary: text.primary,
      secondary: text.secondary,
    },
    background: {
      default: background.default,
    },
    action: {
      active: action.active,
    },
    divider: divider,
  },
  typography: {
    fontFamily: fonts.style.fontFamily,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          ...darkScrollbar({
            active: scrollBar.active,
            thumb: scrollBar.thumb,
            track: scrollBar.track,
          }),
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
          borderRadius: 8,
          background: background.primary,
          backdropFilter: glass.backdrop,
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
            boxShadow: `0 0 20px rgba(99, 102, 241, 0.2)`,
          },
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          padding: "12px 24px",
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 700,
          fontSize: "0.95rem",
          transition: "all 0.2s ease",
          backdropFilter: glass.backdrop,
        },
        containedPrimary: {
          background: colors.background.gradient,
          color: "#ffffff",
          border: "none",
          "&:hover": {
            background: `linear-gradient(135deg, #4f46e5 0%, #db2777 100%)`,
            transform: "translateY(-2px)",
            boxShadow: `0 8px 24px rgba(99, 102, 241, 0.3)`,
          },
        },
        outlined: {
          borderColor: glass.border,
          color: text.primary,
          background: background.glass,
          border: `1px solid ${glass.border}`,
          "&:hover": {
            backgroundColor: background.glassHover,
            borderColor: glass.borderHover,
          },
        },
      },
    },
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          backgroundColor: "transparent",
          color: text.secondary,
          transition: "all 0.2s ease",
          "&:hover": {
            color: primary,
            backgroundColor: background.glass,
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          padding: 8,
          borderRadius: 6,
          color: text.secondary,
          transition: "all 0.2s ease",
          "&:hover": {
            color: primary,
            backgroundColor: background.glass,
            "& svg": {
              color: primary,
            },
          },
          "&.Mui-selected": {
            backgroundColor: background.glass,
            color: primary,
            "& svg": {
              color: primary,
            },
          },
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          fontSize: "0.9rem",
          fontWeight: 600,
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: "auto",
          marginRight: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: background.default,
          backgroundImage: "none",
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          height: 75,
          color: text.secondary,
          backgroundColor: background.default,
          borderTop: `1px solid ${glass.border}`,
          backdropFilter: glass.backdrop,
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          transition: "all 0.2s ease",
          "&.Mui-selected": {
            color: primary,
          },
        },
        label: {
          fontSize: "0.685rem",
          marginTop: 6,
          "&.Mui-selected": {
            fontSize: "0.635rem",
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        flexContainer: {
          gap: 16,
        },
        indicator: {
          height: "100%",
          color: primary,
          backgroundColor: "transparent",
          borderRadius: 100,
          background: colors.background.gradient,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          zIndex: 1,
          textTransform: "none",
          fontWeight: 700,
          color: text.secondary,
          backgroundColor: "transparent",
          transition: "all 0.2s ease",
          "&:hover": {
            color: primary,
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: background.primary,
          borderRight: `1px solid ${glass.border}`,
          backdropFilter: glass.backdrop,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: background.primary,
          borderBottom: `1px solid ${glass.border}`,
          backdropFilter: glass.backdrop,
        },
      },
    },
  },
});

export default theme;
