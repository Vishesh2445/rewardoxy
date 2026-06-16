"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Box, Dialog, DialogTitle, DialogContent, IconButton, Paper, CircularProgress, Button, Rating } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNew from "@mui/icons-material/OpenInNew";
import StarIcon from "@mui/icons-material/Star";
import { ChevronRight, ChevronLeft, Smartphone, Gamepad2 } from "lucide-react";
import Typography from "@/components/ui/Typography";
import colors from "@/theme/colors";
import CheckIcon from "@mui/icons-material/Check";
import { QRCodeSVG } from "qrcode.react";

type EarnContentProps = {
  userId: string;
  userName: string;
  userEmail: string;
};

type WallType = "MyLead" | "CPX Research" | "Vortex" | "Notik" | "Taskwall" | "GemiAd" | "TheoremReach" | "Revtoo" | "Klink" | "Revtoo Surveys" | "TimeWall";
type DeviceOS = "android" | "ios" | "windows";

interface NotikOffer {
  id?: string; // Optional id field
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
  provider?: string; // Add provider field (Notik, Gemiad)
  trackingType?: string; // Add tracking type (CPI, CPE, CPA, CPC, CPL)
}

interface CPXSurvey {
  id: string;
  loi: number; // Length of interview in minutes
  payout_usd: number;
  conversion_rate: number;
  link: string;
  score?: number;
  type?: string;
  rating_count?: number; // Number of user ratings
  rating_avg?: number; // Average rating from 1 to 5 stars
}

// Offer Details Modal Component - Exact Freecash.com Style
function OfferDetailsModal({ 
  offer, 
  open, 
  onClose,
  userId
}: { 
  offer: NotikOffer | null; 
  open: boolean; 
  onClose: () => void;
  userId: string;
}) {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  if (!offer) return null;

  const hasEvents = offer.events && offer.events.length > 0;

  const handlePlayClick = () => {
    // Track offer click
    fetch('/api/track-offer-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        offer_id: offer.offer_id,
        offer_name: offer.name,
        provider: offer.provider || 'unknown',
        click_url: offer.click_url,
        image_url: offer.image_url,
        payout: offer.payout,
        tracking_type: offer.trackingType || '',
        events: offer.events || []
      })
    }).catch(() => {});

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
          bgcolor: "#1C213F",
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
      {/* Close Button */}
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

      {/* Scrollable Content Container */}
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
      {/* Header Section */}
      <Box sx={{ p: { xs: 2, sm: 3 }, flexShrink: 0 }}>
        {/* Title */}
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

        {/* Provider Label */}
        {offer.provider && (
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                bgcolor: "rgba(16, 185, 129, 0.1)",
                color: "#10B981",
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

        {/* Image and Payout Section */}
        <Box sx={{ display: "flex", gap: 2, mb: 2, flexDirection: { xs: "column", sm: "row" } }}>
          {/* Image */}
          <Box
            sx={{
              width: { xs: "100%", sm: 140 },
              height: { xs: 140, sm: 140 },
              borderRadius: 2,
              overflow: "hidden",
              flexShrink: 0,
              bgcolor: "#151B26",
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

          {/* Payout Info */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ mb: 1.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
                <Typography 
                  sx={{ 
                    fontSize: { xs: "1.75rem", sm: "2rem" },
                    fontWeight: 700,
                    color: "#10B981",
                  }}
                >
                  {offer.payout === -1 ? "∞" : `$${offer.payout}`}
                </Typography>
                <Box
                  sx={{
                    bgcolor: "rgba(16, 185, 129, 0.1)",
                    color: "#10B981",
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

            {/* Popularity Score */}
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: "0.75rem", color: "#A9ABB4", mb: 0.5 }}>
                Popularity Score
              </Typography>
              <Box sx={{ display: "flex", gap: 0.5 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Box 
                    key={star}
                    component="img"
                    src="https://freecash.com/public/img/star-yellow.svg"
                    alt="star"
                    sx={{ width: 14, height: 14 }}
                  />
                ))}
              </Box>
            </Box>

            {/* Play Button */}
            <Box
              component="button"
              onClick={handlePlayClick}
              sx={{
                width: "100%",
                bgcolor: "#10B981",
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
                  bgcolor: "#059669",
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
              Play and Earn {offer.payout === -1 ? "∞" : `$${offer.payout}`}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Description Section */}
      {(offer.description1 || offer.description2 || offer.description3) && (
        <Box sx={{ px: { xs: 2, sm: 2.5 }, pb: 2, flexShrink: 0 }}>
          <Box 
            sx={{ 
              bgcolor: "#151B26",
              p: 2,
              borderRadius: 2,
            }}
          >
            {offer.description1 && (
              <Typography 
                sx={{ 
                  fontSize: "0.8125rem", 
                  lineHeight: 1.5,
                  color: "#fff",
                  mb: offer.description2 || offer.description3 ? 1 : 0,
                }}
              >
                {offer.description1}
              </Typography>
            )}
            {offer.description2 && (
              <Typography 
                sx={{ 
                  fontSize: "0.75rem", 
                  lineHeight: 1.5,
                  color: "#A9ABB4",
                  mb: offer.description3 ? 1 : 0,
                }}
              >
                {offer.description2}
              </Typography>
            )}
            {offer.description3 && (
              <Typography 
                sx={{ 
                  fontSize: "0.75rem", 
                  lineHeight: 1.5,
                  color: "#A9ABB4",
                }}
              >
                {offer.description3}
              </Typography>
            )}
          </Box>
        </Box>
      )}

      {/* Rewards Section */}
      {hasEvents && offer.events && (
        <Box sx={{ px: { xs: 2, sm: 2.5 }, pb: 2, flexShrink: 0 }}>
          {/* Section Header */}
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
            <svg viewBox="0 0 18 15" style={{ width: 16, height: 14, color: "#10B981" }}>
              <path d="M15.8546 0.664551H2.10464C1.77312 0.664551 1.45518 0.796247 1.22076 1.03067C0.986341 1.26509 0.854645 1.58303 0.854645 1.91455V13.1646C0.854645 13.4961 0.986341 13.814 1.22076 14.0484C1.45518 14.2829 1.77312 14.4146 2.10464 14.4146H15.8546C16.1862 14.4146 16.5041 14.2829 16.7385 14.0484C16.9729 13.814 17.1046 13.4961 17.1046 13.1646V1.91455C17.1046 1.58303 16.9729 1.26509 16.7385 1.03067C16.5041 0.796247 16.1862 0.664551 15.8546 0.664551ZM14.6046 12.5396H3.35464C3.18888 12.5396 3.02991 12.4737 2.9127 12.3565C2.79549 12.2393 2.72964 12.0803 2.72964 11.9146V3.16455C2.72964 2.99879 2.79549 2.83982 2.9127 2.72261C3.02991 2.6054 3.18888 2.53955 3.35464 2.53955C3.52041 2.53955 3.67938 2.6054 3.79659 2.72261C3.9138 2.83982 3.97964 2.99879 3.97964 3.16455V9.15596L6.66246 6.47236C6.7205 6.41425 6.78943 6.36815 6.86531 6.3367C6.94118 6.30525 7.02251 6.28906 7.10464 6.28906C7.18678 6.28906 7.26811 6.30525 7.34398 6.3367C7.41986 6.36815 7.48879 6.41425 7.54683 6.47236L8.97964 7.90596L12.4711 4.41455H10.2296C10.0639 4.41455 9.90491 4.3487 9.7877 4.23149C9.67049 4.11428 9.60464 3.95531 9.60464 3.78955C9.60464 3.62379 9.67049 3.46482 9.7877 3.34761C9.90491 3.2304 10.0639 3.16455 10.2296 3.16455H13.9796C14.1454 3.16455 14.3044 3.2304 14.4216 3.34761C14.5388 3.46482 14.6046 3.62379 14.6046 3.78955V7.53955C14.6046 7.70531 14.5388 7.86428 14.4216 7.98149C14.3044 8.0987 14.1454 8.16455 13.9796 8.16455C13.8139 8.16455 13.6549 8.0987 13.5377 7.98149C13.4205 7.86428 13.3546 7.70531 13.3546 7.53955V5.29814L9.42183 9.23174C9.36379 9.28985 9.29486 9.33595 9.21898 9.3674C9.14311 9.39885 9.06178 9.41504 8.97964 9.41504C8.89751 9.41504 8.81618 9.39885 8.74031 9.3674C8.66443 9.33595 8.5955 9.28985 8.53746 9.23174L7.10464 7.79814L3.97964 10.9231V11.2896H14.6046C14.7704 11.2896 14.9294 11.3554 15.0466 11.4726C15.1638 11.5898 15.2296 11.7488 15.2296 11.9146C15.2296 12.0803 15.1638 12.2393 15.0466 12.3565C14.9294 12.4737 14.7704 12.5396 14.6046 12.5396Z" fill="currentColor"/>
            </svg>
            <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color: "#fff" }}>
              Main Rewards
            </Typography>
          </Box>

          {/* Milestones List */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {offer.events.map((event, index) => (
              <Box
                key={event.id || index}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 1.5,
                  bgcolor: "#151B26",
                  borderRadius: 2,
                  transition: "all 0.2s",
                  "&:hover": {
                    borderColor: "rgba(16, 185, 129, 0.3)",
                  bgcolor: "#141523",
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1 }}>
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: "rgba(16, 185, 129, 0.08)",
                    }}
                  />
                  <Typography sx={{ fontSize: "0.8125rem", color: "#fff", fontWeight: 500 }}>
                    {event.name}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Typography 
                    sx={{ 
                      fontSize: "0.8125rem", 
                      color: "#10B981",
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
                      border: "1.5px solid rgba(16, 185, 129, 0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  />
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}
      </Box>
    </Dialog>

    {/* QR Code Dialog for Desktop Users */}
    <Dialog
      open={qrDialogOpen}
      onClose={() => setQrDialogOpen(false)}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "#0F1219",
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
        <Smartphone size={48} color="#10B981" style={{ marginBottom: 16 }} />
        
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
            bgcolor: "#151B26",
            p: 2,
            borderRadius: 2,
            wordBreak: "break-all",
            fontSize: "0.75rem",
            color: "#10B981",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            cursor: "pointer",
            transition: "all 0.2s",
            "&:hover": {
              bgcolor: "#151B26",
              borderColor: "rgba(16, 185, 129, 0.2)",
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
              color: copySuccess ? "#10B981" : colors.text.secondary,
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


function GamingOffersSection({ userId, deviceOS }: { userId: string; deviceOS: DeviceOS[] }) {
  const [displayedOffers, setDisplayedOffers] = useState<NotikOffer[]>([]);
  const [allOffers, setAllOffers] = useState<NotikOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<NotikOffer | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const currentIndex = useRef(0);

  useEffect(() => {
    fetchOffers();
  }, [userId, deviceOS]);

  async function fetchOffers() {
    try {
      setLoading(true);
      const primaryOS = deviceOS.length > 0 ? deviceOS[0] : 'android';
      
      // Fetch from Gemiad, Notik, Klink, Revtoo, and Taskwall APIs in parallel
      const [gemiadResponse, notikResponse, klinkResponse, revtooResponse, taskwallResponse] = await Promise.all([
        fetch(`/api/gemiad-offers?user_id=${userId}`),
        fetch(`/api/notik-offers?user_id=${userId}&device_type=mobile&device_os=${primaryOS}`),
        fetch(`/api/klink-offers?user_id=${userId}`),
        fetch(`/api/revtoo-offers?user_id=${userId}`),
        fetch(`/api/taskwall-offers?user_id=${userId}&os=${primaryOS}`)
      ]);
      
      let gemiadOffers: NotikOffer[] = [];
      let notikOffers: NotikOffer[] = [];
      let klinkOffers: NotikOffer[] = [];
      let revtooOffers: NotikOffer[] = [];
      let taskwallOffers: NotikOffer[] = [];
      
      // Process Gemiad offers (Priority 1)
      if (gemiadResponse.ok) {
        const gemiadData = await gemiadResponse.json();
        if (gemiadData.success && gemiadData.offers && Array.isArray(gemiadData.offers)) {
          gemiadOffers = gemiadData.offers;
          console.log(`Gemiad offers loaded: ${gemiadOffers.length}`);
        }
      }
      
      // Process Notik offers (Priority 2)
      if (notikResponse.ok) {
        const notikText = await notikResponse.text();
        if (notikText) {
          const notikData = JSON.parse(notikText);
          if (notikData.success && notikData.offers && Array.isArray(notikData.offers)) {
            notikOffers = notikData.offers.map((offer: NotikOffer) => ({
              ...offer,
              provider: "Notik"
            }));
            console.log(`Notik offers loaded: ${notikOffers.length}`);
          }
        }
      }
      
      // Process Klink offers (Priority 3)
      if (klinkResponse.ok) {
        const klinkData = await klinkResponse.json();
        if (klinkData.success && klinkData.offers && Array.isArray(klinkData.offers)) {
          const seenKlink = new Set<string>();
          klinkOffers = klinkData.offers.filter((o: NotikOffer) => {
            const cats = Array.isArray(o.categories) ? o.categories : [];
            const isGaming = cats.some(c => String(c).toLowerCase() === 'gaming');
            if (!isGaming) return false;
            if (seenKlink.has(o.offer_id)) return false;
            seenKlink.add(o.offer_id);
            return true;
          });
          console.log(`Klink offers loaded: ${klinkOffers.length}`);
        }
      }
      
      // Process Revtoo offers (Priority 4)
      if (revtooResponse.ok) {
        const revtooData = await revtooResponse.json();
        if (revtooData.success && revtooData.offers && Array.isArray(revtooData.offers)) {
          revtooOffers = revtooData.offers;
          console.log(`Revtoo offers loaded: ${revtooOffers.length}`);
        }
      }
      
      // Process Taskwall offers (Priority 5)
      if (taskwallResponse.ok) {
        const taskwallData = await taskwallResponse.json();
        if (taskwallData.success && taskwallData.offers && Array.isArray(taskwallData.offers)) {
          taskwallOffers = taskwallData.offers;
          console.log(`Taskwall offers loaded: ${taskwallOffers.length}`);
        }
      }
      
      // Pin Taskwall lootably offer to the top
      const pinnedOffers = taskwallOffers.filter((o: NotikOffer) => o.name?.toLowerCase().includes('lootably'));
      const nonPinnedTaskwall = taskwallOffers.filter((o: NotikOffer) => !o.name?.toLowerCase().includes('lootably'));
      
      // Round-robin merge the rest: Gemiad > Notik > Revtoo > Taskwall
      const mergedRest: NotikOffer[] = [];
      const maxRestLength = Math.max(gemiadOffers.length, notikOffers.length, revtooOffers.length, nonPinnedTaskwall.length);
      
      for (let i = 0; i < maxRestLength; i++) {
        if (i < gemiadOffers.length) mergedRest.push(gemiadOffers[i]);
        if (i < notikOffers.length) mergedRest.push(notikOffers[i]);
        if (i < revtooOffers.length) mergedRest.push(revtooOffers[i]);
        if (i < nonPinnedTaskwall.length) mergedRest.push(nonPinnedTaskwall[i]);
      }
      
      console.log(`Total merged rest offers: ${mergedRest.length}`);
      
      // Filter for non-gaming offers
      const gamingOffers = mergedRest
        .filter((offer: NotikOffer) => {
          const name = offer.name?.toLowerCase() || '';
          const desc1 = offer.description1?.toLowerCase() || '';
          const desc2 = offer.description2?.toLowerCase() || '';
          const categoriesStr = typeof offer.categories === 'string' 
            ? offer.categories.toLowerCase() 
            : JSON.stringify(offer.categories).toLowerCase();
          
          return !(name.includes('game') || 
                 desc1.includes('game') || 
                 desc2.includes('game') ||
                 categoriesStr.includes('game') ||
                 name.includes('play') ||
                 desc1.includes('play'));
        });
      
      console.log(`Filtered gaming offers: ${gamingOffers.length}`);
      
      // Separate offers by tracking type for priority sorting
      const cpeOffers = gamingOffers.filter(o => o.trackingType?.toUpperCase() === 'CPE');
      const cpiOffers = gamingOffers.filter(o => o.trackingType?.toUpperCase() === 'CPI');
      const cpaOffers = gamingOffers.filter(o => o.trackingType?.toUpperCase() === 'CPA');
      const otherOffers = gamingOffers.filter(o => {
        const type = o.trackingType?.toUpperCase();
        return type !== 'CPE' && type !== 'CPI' && type !== 'CPA';
      });
      
      console.log(`Tracking type distribution - CPE: ${cpeOffers.length}, CPI: ${cpiOffers.length}, CPA: ${cpaOffers.length}, Others: ${otherOffers.length}`);
      
      // Mix offers with priority: CPE > CPI > CPA > Others (round-robin within each priority)
      const sortedOffers: NotikOffer[] = [];
      const maxLength = Math.max(cpeOffers.length, cpiOffers.length, cpaOffers.length, otherOffers.length);
      
      for (let i = 0; i < maxLength; i++) {
        if (i < cpeOffers.length) sortedOffers.push(cpeOffers[i]);
        if (i < cpiOffers.length) sortedOffers.push(cpiOffers[i]);
        if (i < cpaOffers.length) sortedOffers.push(cpaOffers[i]);
        if (i < otherOffers.length) sortedOffers.push(otherOffers[i]);
      }
      
      console.log(`Sorted gaming offers: ${sortedOffers.length}`);
      
      // Final order: pinned offers > Klink offers > sorted rest
      const finalOffers = [...pinnedOffers, ...klinkOffers, ...sortedOffers].filter(o => {
        if (o.payout === -1) return true;
        const p = typeof o.payout === 'number' ? o.payout : parseFloat(String(o.payout || '0'));
        if (p > 0) return true;
        if (o.offer_id === '1677') return true;
        if (o.offer_id === '56443') return true;
        return false;
      });
      
      // Store all offers
      setAllOffers(finalOffers);
      
      // Display first 12 offers
      const initialBatch = finalOffers.slice(0, 12);
      setDisplayedOffers(initialBatch);
      currentIndex.current = initialBatch.length;
      
      // Check if there are more offers
      setHasMore(initialBatch.length < finalOffers.length);
    } catch (error) {
      console.error("Error fetching offers:", error);
    } finally {
      setLoading(false);
    }
  }

  // Load more offers when user reaches the end
  const loadMoreOffers = () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    
    // Load next 12 offers
    const nextBatch = allOffers.slice(currentIndex.current, currentIndex.current + 12);
    
    if (nextBatch.length > 0) {
      console.log(`Loading ${nextBatch.length} more offers...`);
      setDisplayedOffers(prev => [...prev, ...nextBatch]);
      currentIndex.current += nextBatch.length;
      
      // Check if there are more offers
      if (currentIndex.current >= allOffers.length) {
        setHasMore(false);
        console.log('No more offers to load');
      }
    } else {
      setHasMore(false);
    }
    
    setLoadingMore(false);
  };

  // Handle scroll event to detect when near the end
  const handleScroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 300;
      const newPosition = direction === 'left' 
        ? container.scrollLeft - scrollAmount 
        : container.scrollLeft + scrollAmount;
      container.scrollTo({ left: newPosition, behavior: 'smooth' });
    }
  };

  // Detect when user reaches the last offer
  const onScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = container;
    
    // Calculate if user has scrolled to the end (within 50px threshold)
    const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 50;
    
    // Load more when user reaches the end
    if (isAtEnd && hasMore && !loadingMore) {
      console.log('User reached the end, loading more offers...');
      loadMoreOffers();
    }
  };

  // Skeleton loader with shimmer animation
  const SkeletonOffer = () => (
    <Box sx={{ minWidth: { xs: 100, sm: 140 }, maxWidth: { xs: 100, sm: 140 }, flexShrink: 0 }}>
      <Box sx={{ bgcolor: "#232645", borderRadius: { xs: "10px", sm: "16px" }, p: { xs: 1, sm: 2 } }}>
        <Box sx={{ 
          width: "100%", aspectRatio: "1", borderRadius: { xs: "7px", sm: "10px" }, bgcolor: "#141523", mb: { xs: 0.75, sm: 1.5 },
          position: "relative", overflow: "hidden",
          animation: "pulse 2s ease-in-out infinite",
          "@keyframes pulse": { "0%,100%": { opacity: 0.6 }, "50%": { opacity: 1 } },
          "&::after": { content: '""', position: "absolute", top: 0, left: "-100%", width: "100%", height: "100%", background: "linear-gradient(90deg, transparent, rgba(16,185,129,0.04), transparent)", animation: "shimmer 1.4s ease-in-out infinite" },
        }} />
        <Box sx={{ height: { xs: 14, sm: 20 }, bgcolor: "#141523", borderRadius: "4px", width: "85%", mb: { xs: 0.2, sm: 0.5 }, animation: "pulse 2s ease-in-out infinite 0.1s" }} />
        <Box sx={{ height: { xs: 8, sm: 10 }, bgcolor: "#141523", borderRadius: "4px", width: "35%", mb: 0.2, animation: "pulse 2s ease-in-out infinite 0.2s" }} />
        <Box sx={{ height: { xs: 12, sm: 16 }, bgcolor: "#141523", borderRadius: "4px", width: "45%", animation: "pulse 2s ease-in-out infinite 0.3s" }} />
      </Box>
    </Box>
  );

  return (
    <Box 
      sx={{ 
        bgcolor: "#141523", 
        borderRadius: 3, 
        overflow: "hidden",
      }}
    >
      <Box sx={{ p: { xs: 1.5, sm: 2 }, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Gamepad2 size={20} color="#10B981" />
          <Typography variant="h6" isBold sx={{ fontSize: { xs: "1rem", sm: "1.125rem" } }}>
            Gaming Offers
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1.5, sm: 2.5 } }}>
          <Link href="/offers/all" style={{ textDecoration: "none" }}>
            <Typography
              sx={{
                fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                fontWeight: 600,
                color: "#10B981",
                cursor: "pointer",
                textDecoration: "none",
                transition: "all 0.2s",
                "&:hover": { 
                  color: "#059669",
                  textDecoration: "underline"
                }
              }}
            >
              View All
            </Typography>
          </Link>
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton
              onClick={() => handleScroll('left')}
              sx={{
                width: 32,
                height: 32,
                bgcolor: "#151B26",
                borderRadius: 1.5,
                color: "#10B981",
                opacity: 0.4,
                "&:hover": { bgcolor: "rgba(16, 185, 129, 0.08)", opacity: 1 },
              }}
            >
              <ChevronLeft size={16} />
            </IconButton>
            <IconButton
              onClick={() => handleScroll('right')}
              sx={{
                width: 32,
                height: 32,
                bgcolor: "#151B26",
                borderRadius: 1.5,
                color: "#10B981",
                "&:hover": { bgcolor: "rgba(16, 185, 129, 0.08)" },
              }}
            >
              <ChevronRight size={16} />
            </IconButton>
          </Box>
        </Box>
      </Box>

      <Box
        ref={scrollContainerRef}
        onScroll={onScroll}
        id="gaming-offers-scroll"
        sx={{
          px: { xs: 1.5, sm: 2 },
          pb: { xs: 2, sm: 2.5 },
          display: "flex",
          gap: { xs: 1, sm: 1.5 },
          overflowX: "auto",
          overflowY: "hidden",
          "&::-webkit-scrollbar": { display: "none" },
          scrollbarWidth: "none",
        }}
      >
        {loading ? (
          // Show skeleton loaders while loading
          <>
            {[1, 2, 3, 4, 5].map((i) => (
              <SkeletonOffer key={i} />
            ))}
          </>
        ) : (
          // Show actual offers
          <>
            {displayedOffers.map((offer, index) => (
          <Box
            key={offer.offer_id}
            sx={{
              minWidth: { xs: 100, sm: 140 },
              maxWidth: { xs: 100, sm: 140 },
              flexShrink: 0,
              cursor: "pointer",
            }}
            onClick={() => {
              setSelectedOffer(offer);
              setModalOpen(true);
            }}
          >
            <Box
              sx={{
                bgcolor: "#232645",
                border: "none",
                borderRadius: { xs: "10px", sm: "16px" },
                p: { xs: 1, sm: 2 },
                display: "flex",
                flexDirection: "column",
                transition: "all 0.3s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 12px 24px rgba(16,185,129,0.15)",
                },
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  aspectRatio: "1",
                  borderRadius: { xs: "7px", sm: "10px" },
                  mb: { xs: 0.75, sm: 1.5 },
                  backgroundImage: offer.image_url ? `url(${offer.image_url})` : "none",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  bgcolor: "#141523",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {!offer.image_url && <Gamepad2 size={32} color="#10B981" opacity={0.5} />}
              </Box>
              <Typography
                variant="h6"
                isBold
                sx={{
                  fontSize: { xs: "0.75rem", sm: "0.95rem" },
                  mb: { xs: 0.2, sm: 0.5 },
                  lineHeight: 1.25,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {offer.name}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mt: "auto" }}>
                <Box>
                  <Typography sx={{ fontSize: { xs: "0.5rem", sm: "0.65rem" }, color: colors.text.secondary, mb: 0.2 }}>
                    UP TO
                  </Typography>
                  <Typography isBold sx={{ fontSize: { xs: "0.85rem", sm: "1.05rem" }, color: colors.text.primary }}>
                    {offer.payout === -1 ? "\u221E" : typeof offer.payout === 'number' ? `$${offer.payout.toFixed(2)}` : offer.payout ? `$${offer.payout}` : "$0.00"}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        ))}
        
        {/* Skeleton loaders when loading more */}
        {loadingMore && Array.from({ length: 12 }).map((_, i) => (
          <SkeletonOffer key={`more-skel-${i}`} />
        ))}
        </>
        )}
      </Box>

      {/* Offer Details Modal */}
      <OfferDetailsModal offer={selectedOffer} open={modalOpen} onClose={() => setModalOpen(false)} userId={userId} />
    </Box>
  );
}

function CPXSurveysSection({ userId }: { userId: string }) {
  const [surveys, setSurveys] = useState<CPXSurvey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSurveys();
  }, [userId]);

  async function fetchSurveys() {
    try {
      setLoading(true);
      const response = await fetch(`/api/cpx-surveys?user_id=${userId}`);
      
      if (!response.ok) {
        console.error("Failed to fetch CPX surveys:", response.status);
        setSurveys([]);
        setLoading(false);
        return;
      }

      const data = await response.json();
      
      if (data.success && data.surveys && Array.isArray(data.surveys)) {
        setSurveys(data.surveys.slice(0, 12));
      } else {
        console.warn("Invalid CPX surveys response:", data);
        setSurveys([]);
      }
    } catch (error) {
      console.error("Error fetching CPX surveys:", error);
      setSurveys([]);
    } finally {
      setLoading(false);
    }
  }

  const handleScroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('cpx-surveys-scroll');
    if (container) {
      const scrollAmount = 300;
      const newPosition = direction === 'left' 
        ? container.scrollLeft - scrollAmount 
        : container.scrollLeft + scrollAmount;
      container.scrollTo({ left: newPosition, behavior: 'smooth' });
    }
  };

  // Skeleton loader
  const SkeletonSurvey = () => (
    <Box sx={{ minWidth: { xs: 100, sm: 140 }, maxWidth: { xs: 100, sm: 140 }, flexShrink: 0 }}>
      <Box sx={{ bgcolor: "#151B26", p: { xs: 0.75, sm: 1.5 }, borderRadius: { xs: 1.5, sm: 2.5 } }}>
        <Box sx={{ 
          width: "100%", 
          aspectRatio: "1", 
          borderRadius: { xs: 1, sm: 1.5 }, 
          bgcolor: "#0F1219",
          mb: { xs: 1, sm: 1.5 },
          position: "relative",
          overflow: "hidden",
          "&::after": {
            content: '""',
            position: "absolute",
            top: 0,
            left: "-100%",
            width: "100%",
            height: "100%",
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)",
            animation: "shimmer 1.5s infinite",
          },
          "@keyframes shimmer": {
            "0%": { left: "-100%" },
            "100%": { left: "100%" },
          },
        }} />
        <Box sx={{ height: { xs: 10, sm: 11 }, bgcolor: "#0F1219", borderRadius: 1, width: "80%", mb: { xs: 0.5, sm: 1 }, animation: "pulse 2s ease-in-out infinite 0.1s" }} />
        <Box sx={{ height: { xs: 12, sm: 14 }, bgcolor: "#0F1219", borderRadius: 1, width: "45%", animation: "pulse 2s ease-in-out infinite 0.2s" }} />
      </Box>
    </Box>
  );

  return (
    <Box 
      sx={{ 
        bgcolor: "#141523", 
        borderRadius: 3, 
        overflow: "hidden",
      }}
    >
      <Box sx={{ p: { xs: 1.5, sm: 2 }, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ width: 20, height: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', color: '#10B981' }}>
              <path d="M9 11H7V13H9V11ZM13 11H11V13H13V11ZM17 11H15V13H17V11ZM19 4H18V2H16V4H8V2H6V4H5C3.89 4 3.01 4.9 3.01 6L3 20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V9H19V20Z" fill="currentColor"/>
            </svg>
          </Box>
          <Typography variant="h6" isBold sx={{ fontSize: { xs: "1.125rem", sm: "1.25rem" } }}>
          Surveys
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            onClick={() => handleScroll('left')}
            sx={{
              width: 32,
              height: 32,
              bgcolor: "#151B26",
              borderRadius: 1.5,
              color: "#10B981",
              opacity: 0.4,
              "&:hover": { bgcolor: "rgba(16, 185, 129, 0.08)", opacity: 1 },
            }}
          >
            <ChevronLeft size={16} />
          </IconButton>
          <IconButton
            onClick={() => handleScroll('right')}
            sx={{
              width: 32,
              height: 32,
              bgcolor: "#151B26",
              borderRadius: 1.5,
              color: "#10B981",
              "&:hover": { bgcolor: "rgba(16, 185, 129, 0.08)" },
            }}
          >
            <ChevronRight size={16} />
          </IconButton>
        </Box>
      </Box>

      <Box
        id="cpx-surveys-scroll"
        sx={{
          px: { xs: 1.5, sm: 2 },
          pb: { xs: 2, sm: 2.5 },
          display: "flex",
          gap: { xs: 1, sm: 1.5 },
          overflowX: "auto",
          overflowY: "hidden",
          "&::-webkit-scrollbar": { display: "none" },
          scrollbarWidth: "none",
        }}
      >
        {loading ? (
          <>
            {[1, 2, 3, 4, 5].map((i) => (
              <SkeletonSurvey key={i} />
            ))}
          </>
        ) : surveys.length === 0 ? (
          <Box sx={{ width: "100%", py: 4, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
            <Typography sx={{ fontSize: "0.875rem", color: colors.text.secondary, textAlign: "center" }}>
              No surveys available at the moment
            </Typography>
            <Typography sx={{ fontSize: "0.75rem", color: colors.text.secondary, opacity: 0.6, textAlign: "center" }}>
              Check back later for new opportunities
            </Typography>
          </Box>
        ) : (
          surveys.map((survey) => (
            <Box
              key={survey.id}
              sx={{
                minWidth: { xs: 100, sm: 140 },
                maxWidth: { xs: 100, sm: 140 },
                flexShrink: 0,
                cursor: "pointer",
              }}
              onClick={() => window.open(survey.link, "_blank")}
            >
              <Box
                sx={{
                  bgcolor: "#1a1b2e",
                  p: { xs: 0.75, sm: 1.5 },
                  borderRadius: { xs: 1.5, sm: 2.5 },
                  transition: "all 0.3s",
                  "&:hover": {
                    bgcolor: "#2a2b4a",
                    transform: "translateY(-4px)",
                    boxShadow: "0 12px 24px rgba(37, 100, 79, 0.15)",
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
                      background: "linear-gradient(135deg, rgba(20, 184, 166, 0.15) 0%, rgba(13, 148, 136, 0.25) 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "column",
                      gap: 0.5,
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '40%', height: '40%', color: '#14b8a6' }}>
                      <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM7 10H9V17H7V10ZM11 7H13V17H11V7ZM15 13H17V17H15V13Z" fill="currentColor"/>
                    </svg>
                    <Typography sx={{ fontSize: { xs: "0.625rem", sm: "0.75rem" }, color: "#14b8a6", fontWeight: 700 }}>
                      {survey.loi} min
                    </Typography>
                  </Box>
                </Box>

                <Typography
                  sx={{
                    fontSize: { xs: "0.6rem", sm: "0.6875rem" },
                    color: "rgba(255,255,255,0.5)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    fontWeight: 600,
                    mb: { xs: 0.5, sm: 1 },
                  }}
                >
                CPX Survey
                </Typography>

                <Typography isBold sx={{ fontSize: { xs: "0.85rem", sm: "1rem" }, color: "#10B981" }}>
                  ${survey.payout_usd.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
}

export default function EarnContent({ userId, userName, userEmail }: EarnContentProps) {
  const [open, setOpen] = useState(false);
  const [activeWall, setActiveWall] = useState<WallType | null>(null);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);
  const [adBlockDetected, setAdBlockDetected] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<DeviceOS[]>(["android", "windows"]);
  
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

  const handlePlatformToggle = (platform: DeviceOS) => {
    setSelectedPlatforms(prev => {
      if (prev.includes(platform)) {
        // Don't allow deselecting all platforms
        if (prev.length === 1) return prev;
        return prev.filter(p => p !== platform);
      } else {
        return [...prev, platform];
      }
    });
  };

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
    // Notik doesn't support iframe embedding, open in new window
    if (wall === "Notik") {
      const apiKey = process.env.NEXT_PUBLIC_NOTIK_API_KEY || "PYMTzu6owFJ8roFouth5bEYxoJRmg7q9";
      const pubId = process.env.NEXT_PUBLIC_NOTIK_PUBLISHER_ID || "mIJkTN";
      const appId = process.env.NEXT_PUBLIC_NOTIK_APP_ID || "dOTR7kmvMw";
      const notikUrl = `https://notik.me/coins?api_key=${apiKey}&pub_id=${pubId}&app_id=${appId}&user_id=${userId}`;
      window.open(notikUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    setActiveWall(wall);
    setIframeLoading(true);
    setIframeError(false);
    setOpen(true);
  };

  const getIframeSrc = () => {
    if (activeWall === "MyLead") {
      return `${myLeadBaseUrl}${myLeadBaseUrl.includes("?") ? "&" : "?"}uid=${userId}`;
    }
    if (activeWall === "CPX Research") {
      const appId = "32037";
      const cpxHash = process.env.NEXT_PUBLIC_CPX_SECURE_HASH || "";
      const encodedName = encodeURIComponent(userName || "");
      const encodedEmail = encodeURIComponent(userEmail || "");

      return `https://offers.cpx-research.com/index.php?app_id=${appId}&ext_user_id=${userId}&secure_hash=${cpxHash}&username=${encodedName}&email=${encodedEmail}&subid_1=&subid_2`;
    }
    if (activeWall === "Vortex") {
      const placementId = "69dfafd0a982f180b5caa54c";
      return `https://vortexwall.com/ow/${placementId}/${userId}`;
    }
    if (activeWall === "Taskwall") {
      const appId = process.env.NEXT_PUBLIC_TASKWALL_APP_ID || "";
      if (!appId) {
        console.error("Taskwall app_id not configured");
        return "";
      }
      return `https://wall.taskwall.io/?app_id=${appId}&userid=${userId}`;
    }
    if (activeWall === "Notik") {
      const apiKey = process.env.NEXT_PUBLIC_NOTIK_API_KEY || "PYMTzu6owFJ8roFouth5bEYxoJRmg7q9";
      const pubId = process.env.NEXT_PUBLIC_NOTIK_PUBLISHER_ID || "mIJkTN";
      const appId = process.env.NEXT_PUBLIC_NOTIK_APP_ID || "dOTR7kmvMw";
      return `https://notik.me/coins?api_key=${apiKey}&pub_id=${pubId}&app_id=${appId}&user_id=${userId}`;
    }
    if (activeWall === "GemiAd") {
      const placementId = process.env.NEXT_PUBLIC_GEMIAD_PLACEMENT_ID || "your_placement_id_here";
      // Using path parameters format (recommended by GemiAd)
      return `https://gemiwall.com/${placementId}/${userId}`;
    }
    if (activeWall === "TheoremReach") {
      const apiKey = process.env.NEXT_PUBLIC_THEOREMREACH_API_KEY || "";
      const placementId = process.env.NEXT_PUBLIC_THEOREMREACH_PLACEMENT_ID || "";
      // TheoremReach direct entry URL format (per official documentation)
      // https://theoremreach.com/respondent_entry/direct?api_key=X&user_id=X&transaction_id=X&placement_id=X
      const transactionId = `${userId}-${Date.now()}`;
      const params = new URLSearchParams({
        api_key: apiKey,
        user_id: userId,
        transaction_id: transactionId,
        ...(placementId && { placement_id: placementId }),
      });
      return `https://theoremreach.com/respondent_entry/direct?${params.toString()}`;
    }
    if (activeWall === "Revtoo") {
      const apiKey = process.env.NEXT_PUBLIC_REVTOO_API_KEY || "";
      if (!apiKey) {
        console.error("Revtoo API key not configured");
        return "";
      }
      // Revtoo offerwall URL format
      return `https://revtoo.com/offerwall/${apiKey}/${userId}`;
    }
    if (activeWall === "Klink") {
      const pubId = "d317e5b6-8977-4e79-9df3-66ff86e77645";
      return `https://offerwall.klinkfinance.com/wall?pub_id=${pubId}&user_id=${userId}`;
    }
    if (activeWall === "Revtoo Surveys") {
      return `https://revtoo.com/redirect/?api_key=4w5tzk5qb17ccumdzy41iadqi1rp6n&offer_id=56443&user_id=${userId}`;
    }
    if (activeWall === "TimeWall") {
      const placementId = process.env.NEXT_PUBLIC_TIMEWALL_PLACEMENT_ID || "";
      return `https://timewall.io/users/login?oid=${placementId}&uid=${userId}`;
    }
    return "";
  };

  const iframeSrc = getIframeSrc();

  return (
    <Box sx={{ bgcolor: "#141523", minHeight: "100vh", width: "100%", pb: 4 }}>
      {/* Gaming Offers */}
      <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, mb: { xs: 2, sm: 3 } }}>
        <GamingOffersSection userId={userId} deviceOS={selectedPlatforms} />
      </Box>

      {/* CPX Surveys */}
      <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, mb: { xs: 2, sm: 3 } }}>
        <CPXSurveysSection userId={userId} />
      </Box>

      {/* Offer Walls section */}
      <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: { xs: 2, sm: 3 } }}>
          <Box
            sx={{
              width: 28, height: 28, borderRadius: 1.5,
              background: colors.background.glass,
              backdropFilter: colors.glass.backdrop,
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

        <Box sx={{ 
          display: { xs: "grid", sm: "flex" }, 
          gridTemplateColumns: { xs: "1fr 1fr" },
          gap: 2, 
          overflowX: { xs: "visible", sm: "auto" },
          pb: 1, 
          "&::-webkit-scrollbar": { display: "none" }, 
          scrollbarWidth: "none" 
        }}>
          {/* TimeWall card */}
          <Paper
            onClick={() => handleOpenWall("TimeWall")}
            elevation={0}
            sx={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              borderRadius: 2,
              p: { xs: 1.5, sm: 2 },
              cursor: "pointer",
              background: "linear-gradient(180deg, rgba(59, 130, 246, 0.5) 0%, transparent 100%)",
              transition: "all 0.2s ease",
              minWidth: { xs: "auto", sm: 160 },
              maxWidth: { xs: "none", sm: 160 },
              width: { xs: "100%", sm: "auto" },
              flexShrink: 0,
              overflow: "hidden",
              "&:hover": {
                background: "linear-gradient(180deg, rgba(59, 130, 246, 0.65) 0%, transparent 100%)",
                "& .wall-logo": {
                  filter: "blur(8px)",
                },
                "& .wall-rating": {
                  filter: "blur(8px)",
                },
                "& .hover-play-button": {
                  opacity: 1,
                },
              },
            }}
          >
            {/* Hover Play Button */}
            <Box
              className="hover-play-button"
              sx={{
                position: "absolute",
                inset: 0,
                opacity: 0,
                zIndex: 1000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "opacity 0.2s ease",
              }}
            >
              <Box
                sx={{
                  backgroundColor: colors.background.secondary,
                  borderRadius: 10,
                  padding: 2,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: 40,
                  height: 40,
                }}
              >
                <Box
                  component="img"
                  src="https://freecash.com/public/img/play-offer.svg"
                  alt="play-button"
                  sx={{ objectFit: "contain", objectPosition: "center" }}
                />
              </Box>
            </Box>

            {/* Logo */}
            <Box
              component="img"
              src="/timewall.webp"
              alt="TimeWall"
              className="wall-logo"
              sx={{
                width: { xs: 70, sm: 100 },
                height: { xs: 70, sm: 100 },
                borderRadius: 1,
                objectFit: "contain",
                mb: { xs: 1, sm: 2 },
                transition: "filter 0.2s ease",
              }}
            />

            {/* Name */}
            <Typography variant="subtitle2" isBold sx={{ color: "#fff", mb: { xs: 0.5, sm: 1 }, textAlign: "center" }}>
              TimeWall
            </Typography>

            {/* Star Rating */}
            <Rating
              className="wall-rating"
              defaultValue={4}
              precision={0.5}
              readOnly
              emptyIcon={<StarIcon style={{ opacity: 0.5 }} fontSize="inherit" />}
              size="small"
              sx={{ "& .MuiRating-iconFilled": { color: "#fbbf24" }, transition: "filter 0.2s ease" }}
            />
          </Paper>

          {/* Klink card - Premium */}
          <Paper
            onClick={() => handleOpenWall("Klink")}
            elevation={0}
            sx={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              borderRadius: 2,
              p: { xs: 1.5, sm: 2 },
              cursor: "pointer",
              background: "linear-gradient(180deg, rgba(245, 158, 11, 0.3) 0%, rgba(16, 185, 129, 0.15) 100%)",
              transition: "all 0.2s ease",
              minWidth: { xs: "auto", sm: 160 },
              maxWidth: { xs: "none", sm: 160 },
              width: { xs: "100%", sm: "auto" },
              flexShrink: 0,
              overflow: "hidden",
              border: "1px solid rgba(245, 158, 11, 0.4)",
              boxShadow: "0 0 20px rgba(245, 158, 11, 0.15), inset 0 0 20px rgba(245, 158, 11, 0.05)",
              "&:hover": {
                background: "linear-gradient(180deg, rgba(245, 158, 11, 0.4) 0%, rgba(16, 185, 129, 0.25) 100%)",
                border: "1px solid rgba(245, 158, 11, 0.6)",
                boxShadow: "0 0 30px rgba(245, 158, 11, 0.25), inset 0 0 20px rgba(245, 158, 11, 0.08)",
                "& .wall-logo": {
                  filter: "blur(8px)",
                },
                "& .wall-rating": {
                  filter: "blur(8px)",
                },
                "& .hover-play-button": {
                  opacity: 1,
                },
              },
            }}
          >
            {/* Premium Badge */}
            <Box
              sx={{
                position: "absolute",
                top: 6,
                right: 6,
                zIndex: 10,
                background: "linear-gradient(135deg, #F59E0B, #D97706)",
                borderRadius: "0 8px 0 8px",
                px: 1,
                py: 0.3,
                display: "flex",
                alignItems: "center",
                gap: 0.3,
              }}
            >
              <Typography sx={{ fontSize: "0.55rem", fontWeight: 700, color: "#000", lineHeight: 1.2, letterSpacing: "0.5px" }}>
                BEST
              </Typography>
            </Box>

            {/* Hover Play Button */}
            <Box
              className="hover-play-button"
              sx={{
                position: "absolute",
                inset: 0,
                opacity: 0,
                zIndex: 1000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "opacity 0.2s ease",
              }}
            >
              <Box
                sx={{
                  backgroundColor: "rgba(0,0,0,0.7)",
                  backdropFilter: "blur(4px)",
                  borderRadius: 10,
                  padding: 2,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: 40,
                  height: 40,
                  border: "1px solid rgba(245, 158, 11, 0.5)",
                }}
              >
                <Box
                  component="img"
                  src="https://freecash.com/public/img/play-offer.svg"
                  alt="play-button"
                  sx={{ objectFit: "contain", objectPosition: "center" }}
                />
              </Box>
            </Box>

            {/* Logo */}
            <Box
              component="img"
              src="/klink-icon.png"
              alt="Klink"
              className="wall-logo"
              sx={{
                width: { xs: 70, sm: 100 },
                height: { xs: 70, sm: 100 },
                borderRadius: 1,
                objectFit: "contain",
                mb: { xs: 1, sm: 2 },
                transition: "filter 0.2s ease",
              }}
            />

            {/* Name */}
            <Typography variant="subtitle2" isBold sx={{
              color: "#FBBF24",
              mb: { xs: 0.5, sm: 1 },
              textAlign: "center",
              textShadow: "0 0 10px rgba(251, 191, 36, 0.3)",
            }}>
              Klink
            </Typography>

            {/* Star Rating */}
            <Rating
              className="wall-rating"
              defaultValue={5}
              precision={0.5}
              readOnly
              emptyIcon={<StarIcon style={{ opacity: 0.5 }} fontSize="inherit" />}
              size="small"
              sx={{ "& .MuiRating-iconFilled": { color: "#FBBF24" }, transition: "filter 0.2s ease" }}
            />
          </Paper>

          {/* Taskwall card */}
          <Paper
            onClick={() => handleOpenWall("Taskwall")}
            elevation={0}
            sx={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              borderRadius: 2,
              p: { xs: 1.5, sm: 2 },
              cursor: "pointer",
              background: "linear-gradient(180deg, rgba(16, 185, 129, 0.5) 0%, transparent 100%)",
              transition: "all 0.2s ease",
              minWidth: { xs: "auto", sm: 160 },
              maxWidth: { xs: "none", sm: 160 },
              width: { xs: "100%", sm: "auto" },
              flexShrink: 0,
              overflow: "hidden",
              "&:hover": {
                background: "linear-gradient(180deg, rgba(16, 185, 129, 0.65) 0%, transparent 100%)",
                "& .wall-logo": {
                  filter: "blur(8px)",
                },
                "& .wall-rating": {
                  filter: "blur(8px)",
                },
                "& .hover-play-button": {
                  opacity: 1,
                },
              },
            }}
          >
            {/* Hover Play Button */}
            <Box
              className="hover-play-button"
              sx={{
                position: "absolute",
                inset: 0,
                opacity: 0,
                zIndex: 1000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "opacity 0.2s ease",
              }}
            >
              <Box
                sx={{
                  backgroundColor: colors.background.secondary,
                  borderRadius: 10,
                  padding: 2,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: 40,
                  height: 40,
                }}
              >
                <Box
                  component="img"
                  src="https://freecash.com/public/img/play-offer.svg"
                  alt="play-button"
                  sx={{ objectFit: "contain", objectPosition: "center" }}
                />
              </Box>
            </Box>

            {/* Logo */}
            <Box
              component="img"
              src="/taskwall.svg"
              alt="Taskwall"
              sx={{
                width: { xs: 70, sm: 100 },
                height: { xs: 70, sm: 100 },
                borderRadius: 1,
                objectFit: "contain",
                mb: { xs: 1, sm: 2 },
                transition: "filter 0.2s ease",
              }}
              className="wall-logo"
            />

            {/* Name */}
            <Typography variant="subtitle2" isBold sx={{ color: "#fff", mb: { xs: 0.5, sm: 1 }, textAlign: "center" }}>
              Taskwall
            </Typography>

            {/* Star Rating */}
            <Rating
              className="wall-rating"
              defaultValue={4}
              precision={0.5}
              readOnly
              emptyIcon={<StarIcon style={{ opacity: 0.5 }} fontSize="inherit" />}
              size="small"
              sx={{ "& .MuiRating-iconFilled": { color: "#fbbf24" }, transition: "filter 0.2s ease" }}
            />
          </Paper>

          {/* Notik card */}
          <Paper
            onClick={() => handleOpenWall("Notik")}
            elevation={0}
            sx={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              borderRadius: 2,
              p: { xs: 1.5, sm: 2 },
              cursor: "pointer",
              background: "linear-gradient(180deg, rgba(16, 185, 129, 0.5) 0%, transparent 100%)",
              transition: "all 0.2s ease",
              minWidth: { xs: "auto", sm: 160 },
              maxWidth: { xs: "none", sm: 160 },
              width: { xs: "100%", sm: "auto" },
              flexShrink: 0,
              overflow: "hidden",
              "&:hover": {
                background: "linear-gradient(180deg, rgba(16, 185, 129, 0.65) 0%, transparent 100%)",
                "& .wall-logo": {
                  filter: "blur(8px)",
                },
                "& .wall-rating": {
                  filter: "blur(8px)",
                },
                "& .hover-play-button": {
                  opacity: 1,
                },
              },
            }}
          >
            {/* Hover Play Button */}
            <Box
              className="hover-play-button"
              sx={{
                position: "absolute",
                inset: 0,
                opacity: 0,
                zIndex: 1000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "opacity 0.2s ease",
              }}
            >
              <Box
                sx={{
                  backgroundColor: colors.background.secondary,
                  borderRadius: 10,
                  padding: 2,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: 40,
                  height: 40,
                }}
              >
                <Box
                  component="img"
                  src="https://freecash.com/public/img/play-offer.svg"
                  alt="play-button"
                  sx={{ objectFit: "contain", objectPosition: "center" }}
                />
              </Box>
            </Box>

            {/* Logo */}
            <Box
              component="img"
              src="/notik.webp"
              alt="Notik"
              className="wall-logo"
              sx={{
                width: { xs: 70, sm: 100 },
                height: { xs: 70, sm: 100 },
                borderRadius: 1,
                objectFit: "contain",
                mb: { xs: 1, sm: 2 },
                transition: "filter 0.2s ease",
              }}
            />

            {/* Name */}
            <Typography variant="subtitle2" isBold sx={{ color: "#fff", mb: { xs: 0.5, sm: 1 }, textAlign: "center" }}>
              Notik
            </Typography>

            {/* Star Rating */}
            <Rating
              className="wall-rating"
              defaultValue={3}
              precision={0.5}
              readOnly
              emptyIcon={<StarIcon style={{ opacity: 0.5 }} fontSize="inherit" />}
              size="small"
              sx={{ "& .MuiRating-iconFilled": { color: "#fbbf24" }, transition: "filter 0.2s ease" }}
            />
          </Paper>

          {/* GemiAd card */}
          <Paper
            onClick={() => handleOpenWall("GemiAd")}
            elevation={0}
            sx={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              borderRadius: 2,
              p: { xs: 1.5, sm: 2 },
              cursor: "pointer",
              background: "linear-gradient(180deg, rgba(16, 185, 129, 0.5) 0%, transparent 100%)",
              border: "none",
              transition: "all 0.2s ease",
              minWidth: { xs: "auto", sm: 160 },
              maxWidth: { xs: "none", sm: 160 },
              width: { xs: "100%", sm: "auto" },
              flexShrink: 0,
              overflow: "hidden",
              "&:hover": {
                background: "linear-gradient(180deg, rgba(16, 185, 129, 0.65) 0%, transparent 100%)",
                "& .wall-logo": {
                  filter: "blur(8px)",
                },
                "& .wall-rating": {
                  filter: "blur(8px)",
                },
                "& .hover-play-button": {
                  opacity: 1,
                },
              },
            }}
          >
            {/* Hover Play Button */}
            <Box
              className="hover-play-button"
              sx={{
                position: "absolute",
                inset: 0,
                opacity: 0,
                zIndex: 1000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "opacity 0.2s ease",
              }}
            >
              <Box
                sx={{
                  backgroundColor: colors.background.secondary,
                  borderRadius: 10,
                  padding: 2,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: 40,
                  height: 40,
                }}
              >
                <Box
                  component="img"
                  src="https://freecash.com/public/img/play-offer.svg"
                  alt="play-button"
                  sx={{ objectFit: "contain", objectPosition: "center" }}
                />
              </Box>
            </Box>

            {/* Logo */}
            <Box
              component="img"
              src="/gemiad-logo.png"
              alt="GemiAd"
              className="wall-logo"
              sx={{
                width: { xs: 70, sm: 100 },
                height: { xs: 70, sm: 100 },
                borderRadius: 1,
                objectFit: "contain",
                mb: { xs: 1, sm: 2 },
                transition: "filter 0.2s ease",
              }}
            />

            {/* Name */}
            <Typography variant="subtitle2" isBold sx={{ color: "#fff", mb: { xs: 0.5, sm: 1 }, textAlign: "center" }}>
              GemiAd
            </Typography>

            {/* Star Rating */}
            <Rating
              className="wall-rating"
              defaultValue={4}
              precision={0.5}
              readOnly
              emptyIcon={<StarIcon style={{ opacity: 0.5 }} fontSize="inherit" />}
              size="small"
              sx={{ "& .MuiRating-iconFilled": { color: "#fbbf24" }, transition: "filter 0.2s ease" }}
            />
          </Paper>

          {/* Revtoo card */}
          <Paper
            onClick={() => handleOpenWall("Revtoo")}
            elevation={0}
            sx={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              borderRadius: 2,
              p: { xs: 1.5, sm: 2 },
              cursor: "pointer",
              background: "linear-gradient(180deg, rgba(16, 185, 129, 0.5) 0%, transparent 100%)",
              transition: "all 0.2s ease",
              minWidth: { xs: "auto", sm: 160 },
              maxWidth: { xs: "none", sm: 160 },
              width: { xs: "100%", sm: "auto" },
              flexShrink: 0,
              overflow: "hidden",
              "&:hover": {
                background: "linear-gradient(180deg, rgba(16, 185, 129, 0.65) 0%, transparent 100%)",
                "& .wall-logo": {
                  filter: "blur(8px)",
                },
                "& .wall-rating": {
                  filter: "blur(8px)",
                },
                "& .hover-play-button": {
                  opacity: 1,
                },
              },
            }}
          >
            {/* Hover Play Button */}
            <Box
              className="hover-play-button"
              sx={{
                position: "absolute",
                inset: 0,
                opacity: 0,
                zIndex: 1000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "opacity 0.2s ease",
              }}
            >
              <Box
                sx={{
                  backgroundColor: colors.background.secondary,
                  borderRadius: 10,
                  padding: 2,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: 40,
                  height: 40,
                }}
              >
                <Box
                  component="img"
                  src="https://freecash.com/public/img/play-offer.svg"
                  alt="play-button"
                  sx={{ objectFit: "contain", objectPosition: "center" }}
                />
              </Box>
            </Box>

            {/* Logo */}
            <Box
              component="img"
              src="/revtoo.svg"
              alt="Revtoo"
              className="wall-logo"
              sx={{
                width: { xs: 70, sm: 100 },
                height: { xs: 70, sm: 100 },
                borderRadius: 1,
                objectFit: "contain",
                mb: { xs: 1, sm: 2 },
                transition: "filter 0.2s ease",
              }}
            />

            {/* Name */}
            <Typography variant="subtitle2" isBold sx={{ color: "#fff", mb: { xs: 0.5, sm: 1 }, textAlign: "center" }}>
              Revtoo
            </Typography>

            {/* Star Rating */}
            <Rating
              className="wall-rating"
              defaultValue={4}
              precision={0.5}
              readOnly
              emptyIcon={<StarIcon style={{ opacity: 0.5 }} fontSize="inherit" />}
              size="small"
              sx={{ "& .MuiRating-iconFilled": { color: "#fbbf24" }, transition: "filter 0.2s ease" }}
            />
          </Paper>

          {/* MyLead card */}
          <Paper
            onClick={() => handleOpenWall("MyLead")}
            elevation={0}
            sx={{
              position: "relative",
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              justifyContent: "space-between",
              borderRadius: 2, 
              p: { xs: 1.5, sm: 2 }, 
              cursor: "pointer",
              background: "linear-gradient(180deg, rgba(16, 185, 129, 0.5) 0%, transparent 100%)",
              transition: "all 0.2s ease",
              minWidth: { xs: "auto", sm: 160 },
              maxWidth: { xs: "none", sm: 160 },
              width: { xs: "100%", sm: "auto" },
              flexShrink: 0,
              overflow: "hidden",
              "&:hover": { 
                background: "linear-gradient(180deg, rgba(16, 185, 129, 0.65) 0%, transparent 100%)",
                "& .wall-logo": {
                  filter: "blur(8px)",
                },
                "& .wall-rating": {
                  filter: "blur(8px)",
                },
                "& .hover-play-button": {
                  opacity: 1,
                },
              },
            }}
          >
            {/* Hover Play Button */}
            <Box
              className="hover-play-button"
              sx={{
                position: "absolute",
                inset: 0,
                opacity: 0,
                zIndex: 1000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "opacity 0.2s ease",
              }}
            >
              <Box
                sx={{
                  backgroundColor: colors.background.secondary,
                  borderRadius: 10,
                  padding: 2,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: 40,
                  height: 40,
                }}
              >
                <Box
                  component="img"
                  src="https://freecash.com/public/img/play-offer.svg"
                  alt="play-button"
                  sx={{ objectFit: "contain", objectPosition: "center" }}
                />
              </Box>
            </Box>

            {/* Logo */}
            <Box
              component="img"
              src="/mylead_logo.svg"
              alt="MyLead"
              className="wall-logo"
              sx={{ 
                width: { xs: 70, sm: 100 }, 
                height: { xs: 70, sm: 100 }, 
                borderRadius: 1, 
                objectFit: "contain",
                mb: { xs: 1, sm: 2 },
                transition: "filter 0.2s ease",
              }}
            />

            {/* Name */}
            <Typography variant="subtitle2" isBold sx={{ color: "#fff", mb: { xs: 0.5, sm: 1 }, textAlign: "center" }}>
              MyLead
            </Typography>

            {/* Star Rating */}
            <Rating
              className="wall-rating"
              defaultValue={3}
              precision={0.5}
              readOnly
              emptyIcon={<StarIcon style={{ opacity: 0.5 }} fontSize="inherit" />}
              size="small"
              sx={{ "& .MuiRating-iconFilled": { color: "#fbbf24" }, transition: "filter 0.2s ease" }}
            />
          </Paper>

          {/* Vortex card */}
          <Paper
            onClick={() => handleOpenWall("Vortex")}
            elevation={0}
            sx={{
              position: "relative",
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              justifyContent: "space-between",
              borderRadius: 2, 
              p: { xs: 1.5, sm: 2 }, 
              cursor: "pointer",
              background: "linear-gradient(180deg, rgba(16, 185, 129, 0.5) 0%, transparent 100%)",
              transition: "all 0.2s ease",
              minWidth: { xs: "auto", sm: 160 },
              maxWidth: { xs: "none", sm: 160 },
              width: { xs: "100%", sm: "auto" },
              flexShrink: 0,
              overflow: "hidden",
              "&:hover": { 
                background: "linear-gradient(180deg, rgba(16, 185, 129, 0.65) 0%, transparent 100%)",
                "& .wall-logo": {
                  filter: "blur(8px)",
                },
                "& .wall-rating": {
                  filter: "blur(8px)",
                },
                "& .hover-play-button": {
                  opacity: 1,
                },
              },
            }}
          >
            {/* Hover Play Button */}
            <Box
              className="hover-play-button"
              sx={{
                position: "absolute",
                inset: 0,
                opacity: 0,
                zIndex: 1000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "opacity 0.2s ease",
              }}
            >
              <Box
                sx={{
                  backgroundColor: colors.background.secondary,
                  borderRadius: 10,
                  padding: 2,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: 40,
                  height: 40,
                }}
              >
                <Box
                  component="img"
                  src="https://freecash.com/public/img/play-offer.svg"
                  alt="play-button"
                  sx={{ objectFit: "contain", objectPosition: "center" }}
                />
              </Box>
            </Box>

            {/* Logo */}
            <Box
              component="img"
              src="/mobivortex-icon.png"
              alt="Vortex"
              className="wall-logo"
              sx={{ 
                width: { xs: 70, sm: 100 }, 
                height: { xs: 70, sm: 100 }, 
                borderRadius: 1, 
                objectFit: "contain",
                mb: { xs: 1, sm: 2 },
                transition: "filter 0.2s ease",
              }}
            />

            {/* Name */}
            <Typography variant="subtitle2" isBold sx={{ color: "#fff", mb: { xs: 0.5, sm: 1 }, textAlign: "center" }}>
              Vortex
            </Typography>

            {/* Star Rating */}
            <Rating
              className="wall-rating"
              defaultValue={3}
              precision={0.5}
              readOnly
              emptyIcon={<StarIcon style={{ opacity: 0.5 }} fontSize="inherit" />}
              size="small"
              sx={{ "& .MuiRating-iconFilled": { color: "#fbbf24" }, transition: "filter 0.2s ease" }}
            />
          </Paper>
        </Box>
      </Box>

      {/* Survey Partners section */}
      <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: { xs: 2, sm: 3 } }}>
          <Box
            sx={{
              width: 28, height: 28, borderRadius: 1.5,
              background: colors.background.glass,
              backdropFilter: colors.glass.backdrop,
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

        <Box sx={{ 
          display: { xs: "grid", sm: "flex" }, 
          gridTemplateColumns: { xs: "1fr 1fr" },
          gap: 2, 
          overflowX: { xs: "visible", sm: "auto" },
          pb: 1, 
          "&::-webkit-scrollbar": { display: "none" }, 
          scrollbarWidth: "none" 
        }}>
          {/* CPX Research card */}
          <Paper
            onClick={() => handleOpenWall("CPX Research")}
            elevation={0}
            sx={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              borderRadius: 2,
              p: { xs: 1.5, sm: 2 },
              cursor: "pointer",
              background: "linear-gradient(180deg, rgba(16, 185, 129, 0.5) 0%, transparent 100%)",
              transition: "all 0.2s ease",
              minWidth: { xs: "auto", sm: 160 },
              maxWidth: { xs: "none", sm: 160 },
              width: { xs: "100%", sm: "auto" },
              flexShrink: 0,
              overflow: "hidden",
              "&:hover": {
                background: "linear-gradient(180deg, rgba(16, 185, 129, 0.65) 0%, transparent 100%)",
                "& .wall-logo": {
                  filter: "blur(8px)",
                },
                "& .wall-rating": {
                  filter: "blur(8px)",
                },
                "& .hover-play-button": {
                  opacity: 1,
                },
              },
            }}
          >
            {/* Hover Play Button */}
            <Box
              className="hover-play-button"
              sx={{
                position: "absolute",
                inset: 0,
                opacity: 0,
                zIndex: 1000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "opacity 0.2s ease",
              }}
            >
              <Box
                sx={{
                  backgroundColor: colors.background.secondary,
                  borderRadius: 10,
                  padding: 2,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: 40,
                  height: 40,
                }}
              >
                <Box
                  component="img"
                  src="https://freecash.com/public/img/play-offer.svg"
                  alt="play-button"
                  sx={{ objectFit: "contain", objectPosition: "center" }}
                />
              </Box>
            </Box>

            {/* Logo */}
            <Box
              component="img"
              src="/cpx.png"
              alt="CPX Research"
              className="wall-logo"
              sx={{
                width: { xs: 70, sm: 100 },
                height: { xs: 70, sm: 100 },
                borderRadius: 1,
                objectFit: "contain",
                mb: { xs: 1, sm: 2 },
                transition: "filter 0.2s ease",
              }}
            />

            {/* Name */}
            <Typography variant="subtitle2" isBold sx={{ color: "#fff", mb: { xs: 0.5, sm: 1 }, textAlign: "center" }}>
              CPX Research
            </Typography>

            {/* Star Rating */}
            <Rating
              className="wall-rating"
              defaultValue={4}
              precision={0.5}
              readOnly
              emptyIcon={<StarIcon style={{ opacity: 0.5 }} fontSize="inherit" />}
              size="small"
              sx={{ "& .MuiRating-iconFilled": { color: "#fbbf24" }, transition: "filter 0.2s ease" }}
            />
          </Paper>

          {/* TheoremReach card */}
          <Paper
            onClick={() => handleOpenWall("TheoremReach")}
            elevation={0}
            sx={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              borderRadius: 2,
              p: { xs: 1.5, sm: 2 },
              cursor: "pointer",
              background: "linear-gradient(180deg, rgba(16, 185, 129, 0.5) 0%, transparent 100%)",
              transition: "all 0.2s ease",
              minWidth: { xs: "auto", sm: 160 },
              maxWidth: { xs: "none", sm: 160 },
              width: { xs: "100%", sm: "auto" },
              flexShrink: 0,
              overflow: "hidden",
              "&:hover": {
                background: "linear-gradient(180deg, rgba(16, 185, 129, 0.65) 0%, transparent 100%)",
                "& .wall-logo": {
                  filter: "blur(8px)",
                },
                "& .wall-rating": {
                  filter: "blur(8px)",
                },
                "& .hover-play-button": {
                  opacity: 1,
                },
              },
            }}
          >
            {/* Hover Play Button */}
            <Box
              className="hover-play-button"
              sx={{
                position: "absolute",
                inset: 0,
                opacity: 0,
                zIndex: 1000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "opacity 0.2s ease",
              }}
            >
              <Box
                sx={{
                  backgroundColor: colors.background.secondary,
                  borderRadius: 10,
                  padding: 2,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: 40,
                  height: 40,
                }}
              >
                <Box
                  component="img"
                  src="https://freecash.com/public/img/play-offer.svg"
                  alt="play-button"
                  sx={{ objectFit: "contain", objectPosition: "center" }}
                />
              </Box>
            </Box>

            {/* Logo */}
            <Box
              component="img"
              src="/theoremreach.svg"
              alt="TheoremReach"
              className="wall-logo"
              sx={{
                width: { xs: 70, sm: 100 },
                height: { xs: 70, sm: 100 },
                borderRadius: 1,
                objectFit: "contain",
                mb: { xs: 1, sm: 2 },
                transition: "filter 0.2s ease",
              }}
            />

            {/* Name */}
            <Typography variant="subtitle2" isBold sx={{ color: "#fff", mb: { xs: 0.5, sm: 1 }, textAlign: "center" }}>
              TheoremReach
            </Typography>

            {/* Star Rating */}
            <Rating
              className="wall-rating"
              defaultValue={4}
              precision={0.5}
              readOnly
              emptyIcon={<StarIcon style={{ opacity: 0.5 }} fontSize="inherit" />}
              size="small"
              sx={{ "& .MuiRating-iconFilled": { color: "#fbbf24" }, transition: "filter 0.2s ease" }}
            />
          </Paper>

          {/* Revtoo Surveys card */}
          <Paper
            onClick={() => handleOpenWall("Revtoo Surveys")}
            elevation={0}
            sx={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              borderRadius: 2,
              p: { xs: 1.5, sm: 2 },
              cursor: "pointer",
              background: "linear-gradient(180deg, rgba(16, 185, 129, 0.5) 0%, transparent 100%)",
              transition: "all 0.2s ease",
              minWidth: { xs: "auto", sm: 160 },
              maxWidth: { xs: "none", sm: 160 },
              width: { xs: "100%", sm: "auto" },
              flexShrink: 0,
              overflow: "hidden",
              "&:hover": {
                background: "linear-gradient(180deg, rgba(16, 185, 129, 0.65) 0%, transparent 100%)",
                "& .wall-logo": {
                  filter: "blur(8px)",
                },
                "& .wall-rating": {
                  filter: "blur(8px)",
                },
                "& .hover-play-button": {
                  opacity: 1,
                },
              },
            }}
          >
            {/* Hover Play Button */}
            <Box
              className="hover-play-button"
              sx={{
                position: "absolute",
                inset: 0,
                opacity: 0,
                zIndex: 1000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "opacity 0.2s ease",
              }}
            >
              <Box
                sx={{
                  backgroundColor: colors.background.secondary,
                  borderRadius: 10,
                  padding: 2,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: 40,
                  height: 40,
                }}
              >
                <Box
                  component="img"
                  src="https://freecash.com/public/img/play-offer.svg"
                  alt="play-button"
                  sx={{ objectFit: "contain", objectPosition: "center" }}
                />
              </Box>
            </Box>

            {/* Logo */}
            <Box
              component="img"
              src="/revtoo.svg"
              alt="Revtoo Surveys"
              className="wall-logo"
              sx={{
                width: { xs: 70, sm: 100 },
                height: { xs: 70, sm: 100 },
                borderRadius: 1,
                objectFit: "contain",
                mb: { xs: 1, sm: 2 },
                transition: "filter 0.2s ease",
              }}
            />

            {/* Name */}
            <Typography variant="subtitle2" isBold sx={{ color: "#fff", mb: { xs: 0.5, sm: 1 }, textAlign: "center" }}>
              Revtoo Surveys
            </Typography>

            {/* Star Rating */}
            <Rating
              className="wall-rating"
              defaultValue={4}
              precision={0.5}
              readOnly
              emptyIcon={<StarIcon style={{ opacity: 0.5 }} fontSize="inherit" />}
              size="small"
              sx={{ "& .MuiRating-iconFilled": { color: "#fbbf24" }, transition: "filter 0.2s ease" }}
            />
          </Paper>
        </Box>
      </Box>

      {/* info banner */}
      <Box sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        <Paper sx={{ 
          borderRadius: 2, 
          background: colors.background.glass,
          backdropFilter: colors.glass.backdrop,
          p: 2.5, 
          mt: { xs: 2, sm: 3 }
        }}>
          <Typography sx={{ fontSize: "0.8rem", color: colors.text.secondary }}>
            Complete offers and surveys to earn coins. Coins are credited automatically after verification.
          </Typography>
        </Paper>
      </Box>

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
            {activeWall === "CPX Research" ? activeWall : `${activeWall} Offer Wall`}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <IconButton
              onClick={() => window.open(iframeSrc, '_blank', 'noopener,noreferrer')}
              size="small"
              title="Open in new tab"
              sx={{
                background: colors.background.glass,
                backdropFilter: colors.glass.backdrop,
                borderRadius: 1, color: colors.text.secondary, width: 32, height: 32,
                "&:hover": { borderColor: colors.glass.borderHover, color: colors.primary },
              }}
            >
              <OpenInNew sx={{ fontSize: 16 }} />
            </IconButton>
            <IconButton
              onClick={() => setOpen(false)}
              size="small"
              sx={{
                background: colors.background.glass,
                backdropFilter: colors.glass.backdrop,
                borderRadius: 1, color: colors.text.secondary, width: 32, height: 32,
                "&:hover": { borderColor: colors.glass.borderHover, color: colors.primary },
              }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0, flex: 1, overflow: "hidden", position: "relative", bgcolor: colors.background.default }}>
          
          {/* Loading Animation */}
          {iframeLoading && !adBlockDetected && !iframeError && (
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
                borderRadius: 2, m: 2
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

          {/* Iframe Error Message */}
          {iframeError && (
            <Box
              sx={{
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                textAlign: "center", p: 3, zIndex: 3, bgcolor: colors.background.default,
                borderRadius: 2, m: 2
              }}
            >
              <Typography sx={{ color: colors.text.secondary, mb: 1.5, fontSize: "1rem" }}>
                Failed to load {activeWall}
              </Typography>
              <Typography sx={{ color: colors.text.secondary, opacity: 0.8, fontSize: "0.875rem", mb: 2 }}>
                The offer wall could not be loaded. This may be due to connection issues or an invalid configuration.
              </Typography>
              <Button 
                onClick={() => {
                  setIframeError(false);
                  setIframeLoading(true);
                }}
                sx={{
                  bgcolor: colors.primary,
                  color: "#000",
                  fontWeight: 600,
                  px: 2,
                  py: 1,
                  borderRadius: 1,
                  "&:hover": {
                    bgcolor: "rgba(16, 185, 129, 0.8)"
                  }
                }}
              >
                Try Again
              </Button>
            </Box>
          )}

          {activeWall && (
            <Box
              component="iframe"
              src={iframeSrc}
              onLoad={() => {
                setIframeLoading(false);
                setIframeError(false);
              }}
              onError={() => {
                setIframeLoading(false);
                setIframeError(true);
              }}
              title={`${activeWall}`}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation allow-top-navigation-by-user-activation"
              allow="clipboard-write"
              sx={{ 
                width: "100%", height: "100%", border: "none", 
                bgcolor: colors.background.default,
                display: (adBlockDetected || iframeError) ? "none" : "block" 
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
