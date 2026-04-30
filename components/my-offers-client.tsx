"use client";

import { useState, useEffect } from "react";
import { Box, Paper, CircularProgress, Dialog, DialogContent, IconButton } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Target, TrendingUp, Clock, Gamepad2 } from "lucide-react";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import { QRCodeSVG } from "qrcode.react";
import { Smartphone } from "lucide-react";
import Typography from "@/components/ui/Typography";
import colors from "@/theme/colors";

interface NotikOffer {
  offer_id: string;
  name: string;
  description1?: string;
  description2?: string;
  description3?: string;
  image_url: string;
  payout: string | number;
  click_url: string;
  categories: string | string[];
  events?: {
    id: string;
    name: string;
    payout: number;
  }[];
  provider?: string;
  trackingType?: string;
}

interface MilestoneProgress {
  completed_count: number;
  total_count: number;
  completed_milestone_ids: string[];
  completed_milestones: any[];
}

interface OfferInteraction {
  id: string;
  offer_id: string;
  offer_name: string;
  provider: string;
  image_url: string;
  payout: number;
  tracking_type: string;
  status: string;
  events_json: any[];
  clicked_at: string;
  click_url: string;
  milestone_progress: MilestoneProgress;
}

interface MyOffersData {
  started: OfferInteraction[];
  in_progress: OfferInteraction[];
  completed: OfferInteraction[];
  total: number;
}

interface MyOffersClientProps {
  userId: string;
}

export default function MyOffersClient({ userId }: MyOffersClientProps) {
  const [data, setData] = useState<MyOffersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedOffer, setSelectedOffer] = useState<NotikOffer | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [milestoneProgress, setMilestoneProgress] = useState<string[]>([]);

  useEffect(() => {
    fetchMyOffers();
  }, [userId]);

  async function fetchMyOffers() {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/my-offers?user_id=${userId}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to load offers');
      }
    } catch (err) {
      console.error('Error fetching my offers:', err);
      setError('Failed to load offers');
    } finally {
      setLoading(false);
    }
  }

  const getProviderColor = (provider: string) => {
    const providerColors: Record<string, string> = {
      cpx: '#3b82f6',
      'cpx research': '#3b82f6',
      notik: '#a855f7',
      vortex: '#f97316',
      gemiad: '#10b981',
      theoremreach: '#69ec48ff'
    };
    return providerColors[provider.toLowerCase()] || '#6b7280';
  };

  const handleOfferClick = (offer: OfferInteraction) => {
    // Convert OfferInteraction to NotikOffer format
    const notikOffer: NotikOffer = {
      offer_id: offer.offer_id,
      name: offer.offer_name,
      image_url: offer.image_url,
      payout: offer.payout.toString(),
      click_url: offer.click_url || '',
      categories: '',
      events: offer.events_json || [],
      provider: offer.provider,
      trackingType: offer.tracking_type
    };

    setSelectedOffer(notikOffer);
    setMilestoneProgress(offer.milestone_progress.completed_milestone_ids);
    setModalOpen(true);
  };

  const renderOfferCard = (offer: OfferInteraction) => {
    const progressPercent = offer.milestone_progress.total_count > 0
      ? (offer.milestone_progress.completed_count / offer.milestone_progress.total_count) * 100
      : 0;

    return (
      <Box
        key={offer.id}
        sx={{
          minWidth: { xs: 100, sm: 140 },
          maxWidth: { xs: 100, sm: 140 },
          flexShrink: 0,
          cursor: "pointer",
        }}
        onClick={() => handleOfferClick(offer)}
      >
        <Box
          sx={{
            bgcolor: "#222339",
            p: { xs: 0.75, sm: 1.5 },
            borderRadius: { xs: 1.5, sm: 2.5 },
            transition: "all 0.2s",
            "&:hover": {
              bgcolor: "#2a2b45",
            },
          }}
        >
          <Box sx={{ position: "relative", mb: { xs: 1, sm: 1.5 } }}>
            <Box
              sx={{
                width: "100%",
                aspectRatio: "1",
                borderRadius: { xs: 1, sm: 1.5 },
                overflow: "hidden",
                bgcolor: "#1a1b2e",
                backgroundImage: offer.image_url ? `url(${offer.image_url})` : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            {/* Status Badge */}
            <Box
              sx={{
                position: "absolute",
                top: { xs: 4, sm: 8 },
                right: { xs: 4, sm: 8 },
                bgcolor: offer.status === 'completed' ? "rgba(1, 214, 118, 0.9)" : "rgba(30, 30, 46, 0.9)",
                px: { xs: 0.5, sm: 1 },
                py: { xs: 0.25, sm: 0.5 },
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              {offer.status === 'completed' && <CheckIcon sx={{ fontSize: 10, color: "#000" }} />}
              <Typography sx={{ fontSize: { xs: "0.6rem", sm: "0.65rem" }, fontWeight: 600, color: offer.status === 'completed' ? "#000" : "#fff" }}>
                {offer.status === 'started' ? 'Started' : offer.status === 'in_progress' ? 'In Progress' : 'Completed'}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ height: 40, overflow: "hidden", mb: 0.5 }}>
            <Typography
              sx={{
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                fontWeight: 500,
                lineHeight: 1.3,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {offer.offer_name}
            </Typography>
          </Box>

          <Typography
            sx={{
              fontSize: { xs: "0.6rem", sm: "0.6875rem" },
              color: colors.text.secondary,
              opacity: 0.6,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              fontWeight: 600,
              mb: { xs: 0.5, sm: 1 },
            }}
          >
            {offer.provider}
          </Typography>

          <Typography sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" }, fontWeight: 600, mb: 1 }}>
            ${offer.payout}
          </Typography>

          {/* Progress Bar */}
          {offer.milestone_progress.total_count > 0 && (
            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                <Typography sx={{ fontSize: "0.65rem", color: colors.text.secondary }}>
                  Progress
                </Typography>
                <Typography sx={{ fontSize: "0.65rem", fontWeight: 600, color: "#01D676" }}>
                  {offer.milestone_progress.completed_count}/{offer.milestone_progress.total_count}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: "100%",
                  height: 4,
                  bgcolor: "#1a1b2e",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    width: `${progressPercent}%`,
                    height: "100%",
                    bgcolor: "#01D676",
                    transition: "width 0.3s ease",
                  }}
                />
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    );
  };

  const renderEmptyState = (message: string) => (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 4,
        border: `1px solid ${colors.divider}`,
        bgcolor: colors.background.secondary,
        p: 6,
        textAlign: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 64,
          height: 64,
          borderRadius: 4,
          bgcolor: colors.background.ternary,
          border: `1px solid ${colors.divider}`,
          mx: "auto",
          mb: 2,
        }}
      >
        <Target size={30} color="rgba(169,169,202,0.35)" />
      </Box>
      <Typography variant="body1" isBold sx={{ mb: 1 }}>
        {message}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        Start completing offers to see them here.
      </Typography>
    </Paper>
  );

  if (loading) {
    return (
      <Box
        sx={{
          maxWidth: 1400,
          mx: "auto",
          px: { xs: 2, sm: 3, md: 4 },
          py: 4,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress sx={{ color: colors.primary }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, sm: 3, md: 4 }, py: 4 }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            border: `1px solid ${colors.divider}`,
            bgcolor: colors.background.secondary,
            p: 6,
            textAlign: "center",
          }}
        >
          <Typography variant="body1" isBold sx={{ mb: 1, color: colors.status.error }}>
            Error loading offers
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            {error}
          </Typography>
          <Box
            component="button"
            onClick={fetchMyOffers}
            sx={{
              bgcolor: colors.primary,
              color: "#000",
              px: 3,
              py: 1,
              borderRadius: 2,
              border: "none",
              fontWeight: 600,
              cursor: "pointer",
              "&:hover": { opacity: 0.9 },
            }}
          >
            Retry
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, sm: 3, md: 4 }, py: 4, pb: { xs: 12, lg: 4 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography variant="h5" isBold sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Target size={26} color={colors.primary} />
              My Offers
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
              Track your offer progress and earnings
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              borderRadius: 3,
              border: `1px solid ${colors.divider}`,
              bgcolor: colors.background.secondary,
              px: 2,
              py: 1,
            }}
          >
            <TrendingUp size={15} color={colors.primary} />
            <Box>
              <Typography sx={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase", color: colors.text.secondary }}>
                Total Offers
              </Typography>
              <Typography sx={{ fontSize: "1rem", fontWeight: 800, color: "#fff" }}>
                {data?.total || 0}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Box
          onClick={() => setActiveTab(0)}
          sx={{
            px: 3,
            py: 1.5,
            borderRadius: 3,
            background: activeTab === 0 
              ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              : "rgba(255, 255, 255, 0.05)",
            color: activeTab === 0 ? "#fff" : colors.text.secondary,
            fontWeight: 600,
            fontSize: "0.875rem",
            cursor: "pointer",
            transition: "all 0.2s",
            border: activeTab === 0 ? "none" : "1px solid rgba(255, 255, 255, 0.1)",
            "&:hover": {
              background: activeTab === 0 
                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                : "rgba(255, 255, 255, 0.08)",
            },
          }}
        >
          Started ({data?.started.length || 0})
        </Box>
        <Box
          onClick={() => setActiveTab(1)}
          sx={{
            px: 3,
            py: 1.5,
            borderRadius: 3,
            background: activeTab === 1 
              ? "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
              : "rgba(255, 255, 255, 0.05)",
            color: activeTab === 1 ? "#fff" : colors.text.secondary,
            fontWeight: 600,
            fontSize: "0.875rem",
            cursor: "pointer",
            transition: "all 0.2s",
            border: activeTab === 1 ? "none" : "1px solid rgba(255, 255, 255, 0.1)",
            "&:hover": {
              background: activeTab === 1 
                ? "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                : "rgba(255, 255, 255, 0.08)",
            },
          }}
        >
          In Progress ({data?.in_progress.length || 0})
        </Box>
        <Box
          onClick={() => setActiveTab(2)}
          sx={{
            px: 3,
            py: 1.5,
            borderRadius: 3,
            background: activeTab === 2 
              ? "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
              : "rgba(255, 255, 255, 0.05)",
            color: activeTab === 2 ? "#fff" : colors.text.secondary,
            fontWeight: 600,
            fontSize: "0.875rem",
            cursor: "pointer",
            transition: "all 0.2s",
            border: activeTab === 2 ? "none" : "1px solid rgba(255, 255, 255, 0.1)",
            "&:hover": {
              background: activeTab === 2 
                ? "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
                : "rgba(255, 255, 255, 0.08)",
            },
          }}
        >
          Completed ({data?.completed.length || 0})
        </Box>
      </Box>

      {/* Offers Grid */}
      {activeTab === 0 && (
        <Box sx={{ display: "flex", gap: { xs: 1, sm: 1.5 }, overflowX: "auto", pb: 2, "&::-webkit-scrollbar": { display: "none" }, scrollbarWidth: "none" }}>
          {data?.started.length === 0 ? renderEmptyState("No started offers") : data?.started.map(renderOfferCard)}
        </Box>
      )}

      {activeTab === 1 && (
        <Box sx={{ display: "flex", gap: { xs: 1, sm: 1.5 }, overflowX: "auto", pb: 2, "&::-webkit-scrollbar": { display: "none" }, scrollbarWidth: "none" }}>
          {data?.in_progress.length === 0 ? renderEmptyState("No offers in progress") : data?.in_progress.map(renderOfferCard)}
        </Box>
      )}

      {activeTab === 2 && (
        <Box sx={{ display: "flex", gap: { xs: 1, sm: 1.5 }, overflowX: "auto", pb: 2, "&::-webkit-scrollbar": { display: "none" }, scrollbarWidth: "none" }}>
          {data?.completed.length === 0 ? renderEmptyState("No completed offers") : data?.completed.map(renderOfferCard)}
        </Box>
      )}

      {/* Offer Details Modal */}
      <OfferDetailsModal 
        offer={selectedOffer} 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
        userId={userId}
        milestoneProgress={milestoneProgress}
      />
    </Box>
  );
}

// Offer Details Modal Component
function OfferDetailsModal({ 
  offer, 
  open, 
  onClose,
  userId,
  milestoneProgress = []
}: { 
  offer: NotikOffer | null; 
  open: boolean; 
  onClose: () => void;
  userId?: string;
  milestoneProgress?: string[];
}) {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  if (!offer) return null;

  const hasEvents = offer.events && offer.events.length > 0;

  const handlePlayClick = () => {
    if (isMobile) {
      window.open(offer.click_url, "_blank");
    } else {
      setQrDialogOpen(true);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(offer.click_url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <>
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      fullScreen={isMobile}
      scroll="body"
      PaperProps={{
        sx: {
          bgcolor: "#1a1b2e",
          borderRadius: 3,
          maxWidth: "650px",
          maxHeight: "90vh",
          overflow: "visible",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column",
          margin: "auto",
          marginTop: "60px",
        },
      }}
      slotProps={{
        backdrop: { 
          sx: { 
            bgcolor: "rgba(0,0,0,0.85)", 
            backdropFilter: "blur(10px)" 
          } 
        },
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 16,
          top: 16,
          color: "#fff",
          zIndex: 10,
          bgcolor: "rgba(0,0,0,0.3)",
          "&:hover": { 
            bgcolor: "rgba(0,0,0,0.5)",
          },
        }}
      >
        <CloseIcon />
      </IconButton>

      <Box sx={{ 
        overflowY: "auto", 
        overflowX: "hidden",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        "&::-webkit-scrollbar": {
          display: "none",
        },
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}>
      <Box sx={{ p: { xs: 2, sm: 3 }, flexShrink: 0 }}>
        <Typography 
          sx={{ 
            fontSize: { xs: "1.25rem", sm: "1.5rem" },
            fontWeight: 700,
            mb: 1,
            color: "#fff",
          }}
        >
          {offer.name}
        </Typography>

        {offer.provider && (
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                bgcolor: "rgba(1, 214, 118, 0.1)",
                color: "#01D676",
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                fontSize: "0.75rem",
                fontWeight: 600,
              }}
            >
              Powered by {offer.provider}
            </Box>
          </Box>
        )}

        <Box sx={{ display: "flex", gap: 2, mb: 2, flexDirection: { xs: "column", sm: "row" } }}>
          <Box
            sx={{
              width: { xs: "100%", sm: 140 },
              height: { xs: 140, sm: 140 },
              borderRadius: 2,
              overflow: "hidden",
              flexShrink: 0,
              bgcolor: "#222339",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              component="img"
              src={offer.image_url}
              alt={offer.name}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: { xs: "contain", sm: "cover" },
                padding: { xs: 1, sm: 0 },
              }}
            />
          </Box>

          <Box sx={{ flex: 1 }}>
            <Box sx={{ mb: 1.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
                <Typography 
                  sx={{ 
                    fontSize: { xs: "1.75rem", sm: "2rem" },
                    fontWeight: 700,
                    color: "#01D676",
                  }}
                >
                  ${offer.payout}
                </Typography>
                <Box
                  sx={{
                    bgcolor: "rgba(1, 214, 118, 0.1)",
                    color: "#01D676",
                    px: 1.5,
                    py: 0.25,
                    borderRadius: 1,
                    fontSize: "0.75rem",
                    fontWeight: 600,
                  }}
                >
                  +0%
                </Box>
              </Box>
            </Box>

            <Box
              component="button"
              onClick={handlePlayClick}
              sx={{
                width: "100%",
                bgcolor: "#01D676",
                color: "#000",
                py: 1.5,
                px: 2,
                borderRadius: 2,
                border: "none",
                fontWeight: 700,
                fontSize: "0.875rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  bgcolor: "#00c068",
                  transform: "translateY(-2px)",
                },
              }}
            >
              <svg viewBox="0 0 24 24" style={{ width: 16, height: 16 }}>
                <path 
                  d="M6.61699 4.14731C6.45359 4.05109 6.26829 4.00029 6.07961 4C5.89093 3.99971 5.70548 4.04993 5.5418 4.14565C5.37811 4.24137 5.24193 4.37923 5.14685 4.54545C5.05177 4.71167 5.00113 4.90043 5 5.09287V18.9024C5.00032 19.0942 5.04982 19.2825 5.14357 19.4487C5.23732 19.615 5.37207 19.7533 5.53443 19.85C5.6968 19.9467 5.88114 19.9984 6.06915 20C6.25717 20.0015 6.44231 19.9529 6.60621 19.859L18.4426 13.1191C18.6096 13.0252 18.7492 12.8877 18.8471 12.7208C18.945 12.5539 18.9977 12.3635 18.9999 12.169C19.0021 11.9745 18.9537 11.7829 18.8596 11.6137C18.7654 11.4445 18.629 11.3038 18.4641 11.206L6.61699 4.14731Z" 
                  fill="currentColor"
                />
              </svg>
              Continue Offer
            </Box>
          </Box>
        </Box>
      </Box>

      {hasEvents && offer.events && (
        <Box sx={{ px: { xs: 2, sm: 2.5 }, pb: 2, flexShrink: 0 }}>
          <Box 
            sx={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 1,
              mb: 2,
              pb: 1.5,
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <svg viewBox="0 0 18 15" style={{ width: 16, height: 14, color: "#01D676" }}>
              <path d="M15.8546 0.664551H2.10464C1.77312 0.664551 1.45518 0.796247 1.22076 1.03067C0.986341 1.26509 0.854645 1.58303 0.854645 1.91455V13.1646C0.854645 13.4961 0.986341 13.814 1.22076 14.0484C1.45518 14.2829 1.77312 14.4146 2.10464 14.4146H15.8546C16.1862 14.4146 16.5041 14.2829 16.7385 14.0484C16.9729 13.814 17.1046 13.4961 17.1046 13.1646V1.91455C17.1046 1.58303 16.9729 1.26509 16.7385 1.03067C16.5041 0.796247 16.1862 0.664551 15.8546 0.664551ZM14.6046 12.5396H3.35464C3.18888 12.5396 3.02991 12.4737 2.9127 12.3565C2.79549 12.2393 2.72964 12.0803 2.72964 11.9146V3.16455C2.72964 2.99879 2.79549 2.83982 2.9127 2.72261C3.02991 2.6054 3.18888 2.53955 3.35464 2.53955C3.52041 2.53955 3.67938 2.6054 3.79659 2.72261C3.9138 2.83982 3.97964 2.99879 3.97964 3.16455V9.15596L6.66246 6.47236C6.7205 6.41425 6.78943 6.36815 6.86531 6.3367C6.94118 6.30525 7.02251 6.28906 7.10464 6.28906C7.18678 6.28906 7.26811 6.30525 7.34398 6.3367C7.41986 6.36815 7.48879 6.41425 7.54683 6.47236L8.97964 7.90596L12.4711 4.41455H10.2296C10.0639 4.41455 9.90491 4.3487 9.7877 4.23149C9.67049 4.11428 9.60464 3.95531 9.60464 3.78955C9.60464 3.62379 9.67049 3.46482 9.7877 3.34761C9.90491 3.2304 10.0639 3.16455 10.2296 3.16455H13.9796C14.1454 3.16455 14.3044 3.2304 14.4216 3.34761C14.5388 3.46482 14.6046 3.62379 14.6046 3.78955V7.53955C14.6046 7.70531 14.5388 7.86428 14.4216 7.98149C14.3044 8.0987 14.1454 8.16455 13.9796 8.16455C13.8139 8.16455 13.6549 8.0987 13.5377 7.98149C13.4205 7.86428 13.3546 7.70531 13.3546 7.53955V5.29814L9.42183 9.23174C9.36379 9.28985 9.29486 9.33595 9.21898 9.3674C9.14311 9.39885 9.06178 9.41504 8.97964 9.41504C8.89751 9.41504 8.81618 9.39885 8.74031 9.3674C8.66443 9.33595 8.5955 9.28985 8.53746 9.23174L7.10464 7.79814L3.97964 10.9231V11.2896H14.6046C14.7704 11.2896 14.9294 11.3554 15.0466 11.4726C15.1638 11.5898 15.2296 11.7488 15.2296 11.9146C15.2296 12.0803 15.1638 12.2393 15.0466 12.3565C14.9294 12.4737 14.7704 12.5396 14.6046 12.5396Z" fill="currentColor"/>
            </svg>
            <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color: "#fff" }}>
              Main Rewards
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {offer.events.map((event) => {
              const isCompleted = milestoneProgress.includes(event.id);
              
              return (
                <Box
                  key={event.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 1.5,
                    bgcolor: isCompleted ? "rgba(1, 214, 118, 0.05)" : "#222339",
                    borderRadius: 2,
                    border: `1px solid ${isCompleted ? "rgba(1, 214, 118, 0.2)" : "rgba(255,255,255,0.05)"}`,
                    transition: "all 0.2s",
                    "&:hover": {
                      borderColor: isCompleted ? "rgba(1, 214, 118, 0.4)" : "rgba(1, 214, 118, 0.3)",
                      bgcolor: isCompleted ? "rgba(1, 214, 118, 0.08)" : "#252640",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1 }}>
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        bgcolor: isCompleted ? "#01D676" : "#3d3f54",
                      }}
                    />
                    <Typography sx={{ 
                      fontSize: "0.8125rem", 
                      color: isCompleted ? "#01D676" : "#fff", 
                      fontWeight: 500,
                      textDecoration: isCompleted ? "line-through" : "none",
                      opacity: isCompleted ? 0.8 : 1
                    }}>
                      {event.name}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Typography 
                      sx={{ 
                        fontSize: "0.8125rem", 
                        color: "#01D676",
                        fontWeight: 700,
                      }}
                    >
                      ${event.payout}
                    </Typography>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        border: `1.5px solid ${isCompleted ? "#01D676" : "#3d3f54"}`,
                        bgcolor: isCompleted ? "#01D676" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {isCompleted && (
                        <CheckIcon sx={{ fontSize: 14, color: "#000" }} />
                      )}
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}
      </Box>
    </Dialog>

    <Dialog
      open={qrDialogOpen}
      onClose={() => setQrDialogOpen(false)}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "#1a1b2e",
          borderRadius: 3,
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        },
      }}
      slotProps={{
        backdrop: { 
          sx: { 
            bgcolor: "rgba(0,0,0,0.85)", 
            backdropFilter: "blur(10px)" 
          } 
        },
      }}
    >
      <IconButton
        onClick={() => setQrDialogOpen(false)}
        sx={{
          position: "absolute",
          right: 16,
          top: 16,
          color: "#fff",
          zIndex: 10,
          bgcolor: "rgba(0,0,0,0.3)",
          "&:hover": { 
            bgcolor: "rgba(0,0,0,0.5)",
          },
        }}
      >
        <CloseIcon />
      </IconButton>

      <Box sx={{ p: 4, textAlign: "center" }}>
        <Smartphone size={48} color="#01D676" style={{ marginBottom: 16 }} />
        
        <Typography 
          sx={{ 
            fontSize: "1.5rem",
            fontWeight: 700,
            mb: 1,
            color: "#fff",
          }}
        >
          Continue on Your Phone
        </Typography>

        <Typography 
          sx={{ 
            fontSize: "0.875rem",
            color: colors.text.secondary,
            mb: 3,
          }}
        >
          Scan this QR code with your phone to open the offer
        </Typography>

        <Box 
          sx={{ 
            display: "flex", 
            justifyContent: "center", 
            mb: 3,
            bgcolor: "#fff",
            p: 2,
            borderRadius: 2,
            mx: "auto",
            width: "fit-content",
          }}
        >
          <QRCodeSVG 
            value={offer.click_url} 
            size={200}
            level="H"
            includeMargin={true}
          />
        </Box>

        <Typography 
          sx={{ 
            fontSize: "0.75rem",
            color: colors.text.secondary,
            mb: 2,
          }}
        >
          Or copy the link below:
        </Typography>

        <Box
          sx={{
            bgcolor: "#222339",
            p: 2,
            borderRadius: 2,
            border: "1px solid rgba(255,255,255,0.05)",
            wordBreak: "break-all",
            fontSize: "0.75rem",
            color: "#01D676",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            cursor: "pointer",
            transition: "all 0.2s",
            "&:hover": {
              bgcolor: "#252640",
              borderColor: "rgba(1, 214, 118, 0.2)",
            },
          }}
          onClick={handleCopyLink}
        >
          <Box sx={{ flex: 1, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis" }}>
            {offer.click_url}
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              flexShrink: 0,
              color: copySuccess ? "#01D676" : colors.text.secondary,
            }}
          >
            {copySuccess ? (
              <>
                <CheckIcon sx={{ fontSize: 16 }} />
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
                  Copied!
                </Typography>
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" style={{ width: 16, height: 16 }} fill="currentColor">
                  <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                </svg>
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
                  Copy
                </Typography>
              </>
            )}
          </Box>
        </Box>
      </Box>
    </Dialog>
    </>
  );
}
