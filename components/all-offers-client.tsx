"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Box, CircularProgress, Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import { Monitor, Smartphone, Gamepad2 } from "lucide-react";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import Typography from "@/components/ui/Typography";
import colors from "@/theme/colors";

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
  if (!offer) return null;

  const hasEvents = offer.events && offer.events.length > 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
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
        {hasEvents && (
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
          All Offers
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

export default function AllOffersClient({ userId }: { userId: string }) {
  const [displayedOffers, setDisplayedOffers] = useState<NotikOffer[]>([]);
  const [allOffers, setAllOffers] = useState<NotikOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<DeviceOS[]>(["android", "windows"]);
  const [selectedOffer, setSelectedOffer] = useState<NotikOffer | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  const observerTarget = useRef<HTMLDivElement>(null);
  const currentIndex = useRef(0);

  const handlePlatformToggle = (platform: DeviceOS) => {
    setSelectedPlatforms(prev => {
      if (prev.includes(platform)) {
        if (prev.length === 1) return prev;
        return prev.filter(p => p !== platform);
      } else {
        return [...prev, platform];
      }
    });
  };

  // Load more offers (20 at a time)
  const loadMoreOffers = useCallback(() => {
    if (loadingMore || !hasMore || allOffers.length === 0) return;
    
    const nextBatch = allOffers.slice(currentIndex.current, currentIndex.current + 20);
    
    if (nextBatch.length === 0) {
      setHasMore(false);
      return;
    }
    
    setLoadingMore(true);
    
    // Add next 20 offers
    setDisplayedOffers(prev => [...prev, ...nextBatch]);
    currentIndex.current += nextBatch.length;
    setLoadingMore(false);
    
    // Check if there are more offers to load
    if (currentIndex.current >= allOffers.length) {
      setHasMore(false);
    }
  }, [allOffers, loadingMore, hasMore]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMoreOffers();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loadingMore, loadMoreOffers]);

  // Fetch all offers from API
  useEffect(() => {
    fetchAllOffers();
  }, [userId, selectedPlatforms]);

  async function fetchAllOffers() {
    try {
      setLoading(true);
      setDisplayedOffers([]);
      setAllOffers([]);
      currentIndex.current = 0;
      setHasMore(true);
      
      const primaryOS = selectedPlatforms.length > 0 ? selectedPlatforms[0] : 'android';
      
      const response = await fetch(`/api/notik-offers?user_id=${userId}&device_type=mobile&device_os=${primaryOS}`);
      
      if (!response.ok) {
        console.error("Failed to fetch offers:", response.status, response.statusText);
        setLoading(false);
        return;
      }

      const data = await response.json();
      
      if (data.success && data.offers && Array.isArray(data.offers)) {
        console.log('[All Offers] Loaded', data.offers.length, 'offers');
        
        // Store all offers
        setAllOffers(data.offers);
        
        // Display first 20 offers immediately
        const initialBatch = data.offers.slice(0, 20);
        setDisplayedOffers(initialBatch);
        currentIndex.current = initialBatch.length;
        setLoading(false);
        
        // Check if there are more offers
        if (initialBatch.length >= data.offers.length) {
          setHasMore(false);
        }
      } else {
        console.error('[All Offers] Invalid data structure:', data);
        setLoading(false);
      }
    } catch (error) {
      console.error("Failed to fetch offers:", error);
      setLoading(false);
    }
  }

  return (
    <Box sx={{ bgcolor: "#0a0b0f", minHeight: "100vh", width: "100%", pb: 4 }}>
      {/* Platform Selector */}
      <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, pt: { xs: 2, sm: 3 }, pb: 2 }}>
        <PlatformSelector selectedPlatforms={selectedPlatforms} onToggle={handlePlatformToggle} />
      </Box>

      {/* All Offers Grid */}
      <Box sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        {loading && displayedOffers.length === 0 ? (
          <Box sx={{ py: 8, display: "flex", justifyContent: "center" }}>
            <CircularProgress size={48} sx={{ color: "#01D676" }} />
          </Box>
        ) : displayedOffers.length === 0 ? (
          <Box sx={{ py: 8, textAlign: "center" }}>
            <Typography sx={{ color: colors.text.secondary }}>
              No offers available at the moment
            </Typography>
          </Box>
        ) : (
          <>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(2, 1fr)",
                  sm: "repeat(3, 1fr)",
                  md: "repeat(4, 1fr)",
                  lg: "repeat(5, 1fr)",
                  xl: "repeat(6, 1fr)",
                },
                gap: { xs: 2, sm: 2.5, md: 3 },
              }}
            >
              {displayedOffers.map((offer, index) => (
                <Box
                  key={`${offer.offer_id}-${index}`}
                  sx={{
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setSelectedOffer(offer);
                    setModalOpen(true);
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: "#12131c",
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                      p: 1.5,
                      borderRadius: 2.5,
                      transition: "all 0.2s",
                      "&:hover": {
                        bgcolor: "#1a1b2e",
                        transform: "translateY(-4px)",
                        borderColor: "rgba(1, 214, 118, 0.3)",
                      },
                    }}
                  >
                    <Box sx={{ position: "relative", mb: 1.5 }}>
                      {offer.image_url ? (
                        <Box
                          component="img"
                          src={offer.image_url}
                          alt={offer.name}
                          sx={{
                            width: "100%",
                            aspectRatio: "1",
                            borderRadius: 1.5,
                            overflow: "hidden",
                            bgcolor: "#1a1b2e",
                            objectFit: "cover",
                          }}
                          onError={(e: any) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: "100%",
                            aspectRatio: "1",
                            borderRadius: 1.5,
                            overflow: "hidden",
                            bgcolor: "#1a1b2e",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Gamepad2 size={32} color="#444" />
                        </Box>
                      )}
                      {offer.categories && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            bgcolor: "rgba(30, 30, 46, 0.6)",
                            px: 1,
                            py: 0.5,
                            borderRadius: 10,
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <Gamepad2 size={10} color="#fff" />
                        </Box>
                      )}
                    </Box>

                    <Box sx={{ height: 40, overflow: "hidden", mb: 0.5 }}>
                      <Typography
                        sx={{
                          fontSize: "0.875rem",
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

                    <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#01D676" }}>
                      ${offer.payout}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Infinite Scroll Trigger */}
            {hasMore && (
              <Box 
                ref={observerTarget}
                sx={{ 
                  py: 4, 
                  display: "flex", 
                  justifyContent: "center",
                  minHeight: 100
                }}
              >
                {loadingMore && (
                  <CircularProgress size={32} sx={{ color: "#01D676" }} />
                )}
              </Box>
            )}

            {/* End of offers message */}
            {!hasMore && displayedOffers.length > 0 && (
              <Box sx={{ py: 4, textAlign: "center" }}>
                <Typography sx={{ color: colors.text.secondary, fontSize: "0.875rem" }}>
                  You've reached the end • {displayedOffers.length} offers loaded
                </Typography>
              </Box>
            )}
          </>
        )}
      </Box>

      {/* Offer Details Modal */}
      <OfferDetailsModal offer={selectedOffer} open={modalOpen} onClose={() => setModalOpen(false)} />
    </Box>
  );
}
