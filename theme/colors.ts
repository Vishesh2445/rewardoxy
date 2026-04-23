const colors = {
  // Luminous Prism - Glassmorphic Design System
  primary: "#6366F1", // Indigo
  secondary: "#EC4899", // Pink
  tertiary: "#14B8A6", // Teal
  divider: "rgba(148, 163, 184, 0.2)",
  
  // Backward compatibility aliases
  green: "#01D676",
  greenTint: "rgba(1, 214, 118, 0.1)",
  gradient: "linear-gradient(135deg, #01D676 0%, #00B894 100%)",
  bgPage: "#0a0b0f",
  bgCard: "#12131c",
  bgButton: "#1a1b2e",
  textPrimary: "#d9e3f6",
  textSecondary: "#94a3b8",
  
  text: {
    primary: "#d9e3f6",
    secondary: "#94a3b8",
    gradient:
      "linear-gradient(135deg, #d9e3f6 0%, #6366F1 100%) text",
  },
  background: {
    default: "#091421", // Deep dark background
    primary: "#16202e", // Surface container low
    secondary: "#212b39", // Surface container
    ternary: "#2b3544", // Surface container high
    drawer: "#16202e",
    hover: "rgba(99, 102, 241, 0.08)",
    gradient: "linear-gradient(135deg, #6366F1 0%, #EC4899 100%)",
    // Glassmorphic surfaces
    glass: "rgba(43, 53, 68, 0.6)", // surface-container-high at 60% opacity
    glassHover: "rgba(43, 53, 68, 0.75)",
  },
  action: {
    active: "#94a3b8",
  },
  scrollBar: {
    active: "#6366F1",
    thumb: "#2b3544",
    track: "#16202e",
  },
  status: {
    success: "#14B8A6", // Teal for success
    warning: "#f59e0b", // Amber for warnings
    error: "#ef4444", // Red for errors
    info: "#6366F1", // Indigo for info
  },
  // Glassmorphic effect colors
  glass: {
    border: "rgba(148, 163, 184, 0.15)", // Ghost border at 15% opacity
    borderHover: "rgba(99, 102, 241, 0.3)",
    backdrop: "blur(20px)",
  },
};

export default colors;
