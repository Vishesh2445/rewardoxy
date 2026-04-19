"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Box, Dialog, DialogTitle, DialogContent, IconButton, Paper, CircularProgress } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import { Gamepad2, ChevronRight, ChevronLeft, Monitor, Smartphone } from "lucide-react";
import Typography from "@/components/ui/Typography";
import colors from "@/theme/colors";
import CheckIcon from "@mui/icons-material/Check";

type EarnContentProps = {
  userId: string;
  userName: string;
  userEmail: string;
  cpxHash: string;
};

type WallType = "MyLead" | "CPX Research" | "Vortex" | "Notik";
type DeviceOS = "android" | "ios" | "windows";

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
}

// Offer Details Modal Component
function OfferDetailsModal({ 
  offer, 
  open, 
  onClose 
}: { 
  offer: NotikOffer | null; 
  open: boolean; 
  onClose: () => void;
}) {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

  if (!offer) return null;

  const hasEvents = offer.events && offer.events.length > 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      fullScreen={isMobile}
      slotProps={{
        paper: {
          sx: {
            bgcolor: "#171828",
            border: `1px solid ${colors.glass.border}`,
            borderRadius: 2,
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          },
        },
        backdrop: { sx: { bgcolor: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" } },
      }}
    >
      {/* Header with Image */}
      <Box
        sx={{
          position: "relative",
          height: 200,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            bgcolor: "rgba(0,0,0,0.5)",
            color: "#fff",
            "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
          }}
        >
          <CloseIcon />
        </IconButton>
        <Box
          component="img"
          src={offer.image_url}
          alt={offer.name}
          sx={{
            width: 120,
            height: 120,
            borderRadius: 3,
            border: "4px solid rgba(255,255,255,0.2)",
            objectFit: "cover",
          }}
        />
      </Box>

      {/* Title and Payout */}
      <Box sx={{ p: 3, borderBottom: `1px solid ${colors.glass.border}` }}>
        <Typography variant="h5" isBold sx={{ mb: 1 }}>
          {offer.name}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              bgcolor: "#01D676",
              color: "#000",
              px: 2,
              py: 1,
              borderRadius: 2,
              fontWeight: 700,
              fontSize: "1.25rem",
            }}
          >
            ${offer.payout}
          </Box>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Box key={star} sx={{ color: "#FFD700", fontSize: "1.25rem" }}>★</Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Content - Merged Details and Rewards */}
      <DialogContent sx={{ p: 3, flex: 1, overflow: "auto" }}>
        {/* Details Section */}
        {(offer.description1 || offer.description2 || offer.description3) && (
          <Box sx={{ mb: 3 }}>
            {offer.description1 && (
              <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontSize: "0.875rem", lineHeight: 1.6 }}>
                  {offer.description1}
                </Typography>
              </Box>
            )}
            {offer.description2 && (
              <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontSize: "0.875rem", lineHeight: 1.6, color: colors.text.secondary }}>
                  {offer.description2}
                </Typography>
              </Box>
            )}
            {offer.description3 && (
              <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontSize: "0.875rem", lineHeight: 1.6, color: colors.text.secondary }}>
                  {offer.description3}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Rewards Section */}
        {hasEvents && offer.events && (
          <Box>
            <Typography variant="h6" isBold sx={{ mb: 2, fontSize: "1rem", display: "flex", alignItems: "center", gap: 1 }}>
              🎁 Rewards
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {offer.events.map((event, index) => (
                <Box
                  key={event.id}
                  sx={{
                    bgcolor: "#222339",
                    p: 2,
                    borderRadius: 2,
                    border: `1px solid ${colors.glass.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, mb: 0.5 }}>
                      {event.name}
                    </Typography>
                    <Typography sx={{ fontSize: "0.75rem", color: colors.text.secondary }}>
                      Milestone {index + 1}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      bgcolor: "rgba(1, 214, 118, 0.1)",
                      color: "#01D676",
                      px: 2,
                      py: 1,
                      borderRadius: 1.5,
                      fontWeight: 700,
                      fontSize: "0.875rem",
                    }}
                  >
                    ${event.payout}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </DialogContent>

      {/* Action Button */}
      <Box sx={{ p: 3, borderTop: `1px solid ${colors.glass.border}` }}>
        <Box
          component="button"
          onClick={() => window.open(offer.click_url, "_blank")}
          sx={{
            width: "100%",
            bgcolor: "#01D676",
            color: "#000",
            py: 2,
            borderRadius: 2,
            border: "none",
            fontWeight: 700,
            fontSize: "1rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            transition: "all 0.2s",
            "&:hover": {
              bgcolor: "#00c068",
              transform: "translateY(-2px)",
            },
          }}
        >
          ▶ Play and Earn ${offer.payout}
        </Box>
      </Box>
    </Dialog>
  );
}

// Platform Selector Component
function PlatformSelector({ 
  selectedPlatforms, 
  onToggle 
}: { 
  selectedPlatforms: DeviceOS[], 
  onToggle: (platform: DeviceOS) => void 
}) {
  const platforms: { id: DeviceOS; label: string; icon: any }[] = [
    { id: "android", label: "Android", icon: Smartphone },
    { id: "ios", label: "iOS", icon: Smartphone },
    { id: "windows", label: "Desktop", icon: Monitor },
  ];

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 2 }, mb: { xs: 2, sm: 3 }, flexWrap: "wrap" }}>
        <Typography variant="h5" isBold sx={{ fontSize: { xs: "1.5rem", sm: "1.75rem" } }}>
          Earn
        </Typography>
        <Typography sx={{ fontSize: { xs: "0.875rem", sm: "0.9375rem" }, color: colors.text.secondary, mr: { xs: 0, sm: 1 } }}>
          on
        </Typography>
        {platforms.map((platform) => {
          const Icon = platform.icon;
          const isSelected = selectedPlatforms.includes(platform.id);
          
          return (
            <Box
              key={platform.id}
              onClick={() => onToggle(platform.id)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 0.75, sm: 1 },
                px: { xs: 1.5, sm: 2 },
                py: { xs: 0.75, sm: 1 },
                borderRadius: 2,
                bgcolor: isSelected ? "rgba(1, 214, 118, 0.1)" : "#12131c",
                border: `1px solid ${isSelected ? "rgba(1, 214, 118, 0.3)" : "rgba(255, 255, 255, 0.05)"}`,
                cursor: "pointer",
                transition: "all 0.2s",
                "&:hover": {
                  borderColor: isSelected ? "rgba(1, 214, 118, 0.5)" : "rgba(255, 255, 255, 0.1)",
                  bgcolor: isSelected ? "rgba(1, 214, 118, 0.15)" : "#1a1b2e",
                },
              }}
            >
              <Icon size={16} color={isSelected ? "#01D676" : colors.text.secondary} />
              <Typography sx={{ fontSize: { xs: "0.8125rem", sm: "0.875rem" }, fontWeight: 500, color: isSelected ? "#01D676" : colors.text.primary }}>
                {platform.label}
              </Typography>
              {isSelected && (
                <CheckIcon sx={{ fontSize: { xs: 14, sm: 16 }, color: "#01D676" }} />
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

function GamingOffersSection({ userId, deviceOS }: { userId: string; deviceOS: DeviceOS[] }) {
  const [offers, setOffers] = useState<NotikOffer[]>([]);
  const [loading, setLoading] = useState(false); // Start as false to show skeleton
  const [selectedOffer, setSelectedOffer] = useState<NotikOffer | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchOffers();
  }, [userId, deviceOS]);

  async function fetchOffers() {
    try {
      setLoading(true);
      const primaryOS = deviceOS.length > 0 ? deviceOS[0] : 'android';
      const response = await fetch(`/api/notik-offers?user_id=${userId}&device_type=mobile&device_os=${primaryOS}`);
      
      if (!response.ok) {
        console.error("Failed to fetch offers:", response.status, response.statusText);
        setLoading(false);
        return;
      }

      const text = await response.text();
      if (!text) {
        console.error("Empty response from API");
        setLoading(false);
        return;
      }

      const data = JSON.parse(text);
      
      if (data.success && data.offers && Array.isArray(data.offers)) {
        // Filter for non-gaming offers
        const gamingOffers = data.offers
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
          })
          .slice(0, 10);
        
        setOffers(gamingOffers);
      } else {
        console.error('[Gaming Offers] Invalid data structure:', data);
      }
    } catch (error) {
      console.error("Failed to fetch gaming offers:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleScroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('gaming-offers-scroll');
    if (container) {
      const scrollAmount = 300;
      const newPosition = direction === 'left' 
        ? container.scrollLeft - scrollAmount 
        : container.scrollLeft + scrollAmount;
      container.scrollTo({ left: newPosition, behavior: 'smooth' });
    }
  };

  // Skeleton loader with shimmer animation
  const SkeletonOffer = () => (
    <Box sx={{ minWidth: 140, maxWidth: 140, flexShrink: 0 }}>
      <Box sx={{ bgcolor: "#222339", p: 1.5, borderRadius: 2.5 }}>
        <Box sx={{ 
          width: "100%", 
          aspectRatio: "1", 
          borderRadius: 1.5, 
          bgcolor: "#1a1b2e",
          mb: 1.5,
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
        <Box sx={{ height: 40, mb: 0.5 }}>
          <Box sx={{ 
            height: 14, 
            bgcolor: "#1a1b2e", 
            borderRadius: 1, 
            mb: 0.5,
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
          }} />
          <Box sx={{ 
            height: 14, 
            bgcolor: "#1a1b2e", 
            borderRadius: 1, 
            width: "70%",
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
              animation: "shimmer 1.5s infinite 0.2s",
            },
          }} />
        </Box>
        <Box sx={{ 
          height: 10, 
          bgcolor: "#1a1b2e", 
          borderRadius: 1, 
          width: "40%", 
          mb: 1,
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
            animation: "shimmer 1.5s infinite 0.4s",
          },
        }} />
        <Box sx={{ 
          height: 14, 
          bgcolor: "#1a1b2e", 
          borderRadius: 1, 
          width: "50%",
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
            animation: "shimmer 1.5s infinite 0.6s",
          },
        }} />
      </Box>
    </Box>
  );

  return (
    <Box 
      sx={{ 
        bgcolor: "#12131c", 
        borderRadius: 3, 
        overflow: "hidden",
        border: "1px solid rgba(255, 255, 255, 0.05)"
      }}
    >
      <Box sx={{ p: { xs: 1.5, sm: 2 }, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ 
            width: 20, 
            height: 24, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center" 
          }}>
            <svg viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', color: '#01D676' }}>
              <path d="M8 0C8 0 8 5.45455 3.63636 9.09091C-0.727273 12.7273 -0.727273 20 8 20C16.7273 20 16.7273 12.7273 12.3636 9.09091C8 5.45455 8 0 8 0Z" fill="currentColor"/>
            </svg>
          </Box>
          <Typography variant="h6" isBold sx={{ fontSize: { xs: "1.125rem", sm: "1.25rem" } }}>
            Gaming Offers
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1.5, sm: 2.5 } }}>
          <Typography 
            sx={{ 
              fontSize: { xs: "0.8125rem", sm: "0.875rem" }, 
              fontWeight: 500, 
              color: colors.text.secondary,
              cursor: "pointer",
              "&:hover": { color: "#01D676" }
            }}
          >
            View All
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton
              onClick={() => handleScroll('left')}
              sx={{
                width: 32,
                height: 32,
                bgcolor: "#242537",
                borderRadius: 1.5,
                color: "#01D676",
                opacity: 0.4,
                "&:hover": { bgcolor: "#2a2b45", opacity: 1 },
              }}
            >
              <ChevronLeft size={16} />
            </IconButton>
            <IconButton
              onClick={() => handleScroll('right')}
              sx={{
                width: 32,
                height: 32,
                bgcolor: "#242537",
                borderRadius: 1.5,
                color: "#01D676",
                "&:hover": { bgcolor: "#2a2b45" },
              }}
            >
              <ChevronRight size={16} />
            </IconButton>
          </Box>
        </Box>
      </Box>

      <Box
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
        {loading || offers.length === 0 ? (
          // Show skeleton loaders while loading
          <>
            {[1, 2, 3, 4, 5].map((i) => (
              <SkeletonOffer key={i} />
            ))}
          </>
        ) : (
          // Show actual offers
          offers.map((offer) => (
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
                {offer.categories && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: { xs: 4, sm: 8 },
                      right: { xs: 4, sm: 8 },
                      bgcolor: "rgba(30, 30, 46, 0.6)",
                      px: { xs: 0.5, sm: 1 },
                      py: { xs: 0.25, sm: 0.5 },
                      borderRadius: 10,
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    <Gamepad2 size={8} color="#fff" />
                  </Box>
                )}
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
                  {offer.name}
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
                Game
              </Typography>

              <Typography sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" }, fontWeight: 600 }}>
                ${offer.payout}
              </Typography>
            </Box>
          </Box>
        ))
        )}
      </Box>

      {/* Offer Details Modal */}
      <OfferDetailsModal offer={selectedOffer} open={modalOpen} onClose={() => setModalOpen(false)} />
    </Box>
  );
}

// Other Offers Section
function OtherOffersSection({ userId, deviceOS }: { userId: string; deviceOS: DeviceOS[] }) {
  const [offers, setOffers] = useState<NotikOffer[]>([]);
  const [loading, setLoading] = useState(false); // Start as false to show skeleton
  const [selectedOffer, setSelectedOffer] = useState<NotikOffer | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchOffers();
  }, [userId, deviceOS]);

  async function fetchOffers() {
    try {
      setLoading(true);
      const primaryOS = deviceOS.length > 0 ? deviceOS[0] : 'android';
      const response = await fetch(`/api/notik-offers?user_id=${userId}&device_type=mobile&device_os=${primaryOS}`);
      
      if (!response.ok) {
        console.error("Failed to fetch offers:", response.status, response.statusText);
        return;
      }

      const text = await response.text();
      if (!text) {
        console.error("Empty response from API");
        return;
      }

      const data = JSON.parse(text);
      
      if (data.success && data.offers && Array.isArray(data.offers)) {
        // Filter for gaming offers
        const otherOffers = data.offers
          .filter((offer: NotikOffer) => {
            const name = offer.name?.toLowerCase() || '';
            const desc1 = offer.description1?.toLowerCase() || '';
            const desc2 = offer.description2?.toLowerCase() || '';
            const categoriesStr = typeof offer.categories === 'string' 
              ? offer.categories.toLowerCase() 
              : JSON.stringify(offer.categories).toLowerCase();
            
            return name.includes('game') || 
                   desc1.includes('game') || 
                   desc2.includes('game') ||
                   categoriesStr.includes('game') ||
                   name.includes('play') ||
                   desc1.includes('play');
          })
          .slice(0, 10);
        
        setOffers(otherOffers);
      } else {
        console.error('[Other Offers] Invalid data structure:', data);
      }
    } catch (error) {
      console.error("Failed to fetch other offers:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleScroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('other-offers-scroll');
    if (container) {
      const scrollAmount = 300;
      const newPosition = direction === 'left' 
        ? container.scrollLeft - scrollAmount 
        : container.scrollLeft + scrollAmount;
      container.scrollTo({ left: newPosition, behavior: 'smooth' });
    }
  };

  // Skeleton loader with shimmer animation
  const SkeletonOffer = () => (
    <Box sx={{ minWidth: { xs: 100, sm: 140 }, maxWidth: { xs: 100, sm: 140 }, flexShrink: 0 }}>
      <Box sx={{ bgcolor: "#222339", p: { xs: 0.75, sm: 1.5 }, borderRadius: { xs: 1.5, sm: 2.5 } }}>
        <Box sx={{ 
          width: "100%", 
          aspectRatio: "1", 
          borderRadius: 1.5, 
          bgcolor: "#1a1b2e",
          mb: 1.5,
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
        <Box sx={{ height: 40, mb: 0.5 }}>
          <Box sx={{ 
            height: 14, 
            bgcolor: "#1a1b2e", 
            borderRadius: 1, 
            mb: 0.5,
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
          }} />
          <Box sx={{ 
            height: 14, 
            bgcolor: "#1a1b2e", 
            borderRadius: 1, 
            width: "70%",
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
              animation: "shimmer 1.5s infinite 0.2s",
            },
          }} />
        </Box>
        <Box sx={{ 
          height: 10, 
          bgcolor: "#1a1b2e", 
          borderRadius: 1, 
          width: "40%", 
          mb: 1,
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
            animation: "shimmer 1.5s infinite 0.4s",
          },
        }} />
        <Box sx={{ 
          height: 14, 
          bgcolor: "#1a1b2e", 
          borderRadius: 1, 
          width: "50%",
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
            animation: "shimmer 1.5s infinite 0.6s",
          },
        }} />
      </Box>
    </Box>
  );

  return (
    <Box 
      sx={{ 
        bgcolor: "#12131c", 
        borderRadius: 3, 
        overflow: "hidden",
        border: "1px solid rgba(255, 255, 255, 0.05)"
      }}
    >
      <Box sx={{ p: { xs: 1.5, sm: 2 }, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ 
            width: 20, 
            height: 20, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center" 
          }}>
            <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', color: '#01D676' }}>
              <rect x="0" y="0" width="8" height="8" rx="2" fill="currentColor"/>
              <rect x="12" y="0" width="8" height="8" rx="2" fill="currentColor"/>
              <rect x="0" y="12" width="8" height="8" rx="2" fill="currentColor"/>
              <rect x="12" y="12" width="8" height="8" rx="2" fill="currentColor"/>
            </svg>
          </Box>
          <Typography variant="h6" isBold sx={{ fontSize: { xs: "1.125rem", sm: "1.25rem" } }}>
            Other Offers
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1.5, sm: 2.5 } }}>
          <Link href="/offers/all" style={{ textDecoration: "none" }}>
            <Typography 
              sx={{ 
                fontSize: { xs: "0.8125rem", sm: "0.875rem" }, 
                fontWeight: 500, 
                color: colors.text.secondary,
                cursor: "pointer",
                textDecoration: "none",
                "&:hover": { color: "#01D676" }
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
                bgcolor: "#242537",
                borderRadius: 1.5,
                color: "#01D676",
                opacity: 0.4,
                "&:hover": { bgcolor: "#2a2b45", opacity: 1 },
              }}
            >
              <ChevronLeft size={16} />
            </IconButton>
            <IconButton
              onClick={() => handleScroll('right')}
              sx={{
                width: 32,
                height: 32,
                bgcolor: "#242537",
                borderRadius: 1.5,
                color: "#01D676",
                "&:hover": { bgcolor: "#2a2b45" },
              }}
            >
              <ChevronRight size={16} />
            </IconButton>
          </Box>
        </Box>
      </Box>

      <Box
        id="other-offers-scroll"
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
        {loading || offers.length === 0 ? (
          // Show skeleton loaders while loading
          <>
            {[1, 2, 3, 4, 5].map((i) => (
              <SkeletonOffer key={i} />
            ))}
          </>
        ) : (
          // Show actual offers
          offers.map((offer) => (
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
                  {offer.name}
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
                Other
              </Typography>

              <Typography sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" }, fontWeight: 600 }}>
                ${offer.payout}
              </Typography>
            </Box>
          </Box>
        ))
        )}
      </Box>

      {/* Offer Details Modal */}
      <OfferDetailsModal offer={selectedOffer} open={modalOpen} onClose={() => setModalOpen(false)} />
    </Box>
  );
}


export default function EarnContent({ userId, userName, userEmail, cpxHash }: EarnContentProps) {
  const [open, setOpen] = useState(false);
  const [activeWall, setActiveWall] = useState<WallType | null>(null);
  const [iframeLoading, setIframeLoading] = useState(true);
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
      const apiKey = process.env.NEXT_PUBLIC_NOTIK_API_KEY || "PYMTzu6owFJ8roFouth5bEYxoJRmg7q9";
      const pubId = process.env.NEXT_PUBLIC_NOTIK_PUBLISHER_ID || "mIJkTN";
      const appId = process.env.NEXT_PUBLIC_NOTIK_APP_ID || "dOTR7kmvMw";
      return `https://notik.me/coins?api_key=${apiKey}&pub_id=${pubId}&app_id=${appId}&user_id=${userId}`;
    }
    return "";
  };

  const iframeSrc = getIframeSrc();

  return (
    <Box sx={{ bgcolor: "#0a0b0f", minHeight: "100vh", width: "100%", pb: 4 }}>
      {/* Platform Selector */}
      <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, pt: { xs: 2, sm: 3 }, pb: 2 }}>
        <PlatformSelector selectedPlatforms={selectedPlatforms} onToggle={handlePlatformToggle} />
      </Box>

      {/* Two Column Grid - Gaming Offers first, then Other Offers */}
      <Box sx={{ 
        px: { xs: 2, sm: 3, md: 4 },
        display: "grid", 
        gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, 
        gap: { xs: 2, sm: 3 },
        mb: { xs: 2, sm: 3 }
      }}>
        <GamingOffersSection userId={userId} deviceOS={selectedPlatforms} />
        <OtherOffersSection userId={userId} deviceOS={selectedPlatforms} />
      </Box>

      {/* Offer Walls section */}
      <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: { xs: 2, sm: 3 } }}>
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
      <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: { xs: 2, sm: 3 } }}>
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

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(auto-fill, 180px)" }, gap: { xs: 2, sm: 2 } }}>
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
      <Box sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        <Paper sx={{ 
          borderRadius: 2, 
          background: colors.background.glass,
          backdropFilter: colors.glass.backdrop,
          border: `1px solid ${colors.glass.border}`, 
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



