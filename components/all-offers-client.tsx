"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Box, CircularProgress, Dialog, IconButton } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { Monitor, Smartphone, Gamepad2 } from "lucide-react";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Typography from "@/components/ui/Typography";
import colors from "@/theme/colors";
import { QRCodeSVG } from "qrcode.react";

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
  provider?: string; // Add provider field
  device?: string[]; // Add device field (e.g., ["android", "ios", "web"])
  events?: {
    id: string;
    name: string;
    payout: number;
  }[];
}

// Offer Details Modal Component - Exact Freecash.com Style
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
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  if (!offer) return null;

  const hasEvents = offer.events && offer.events.length > 0;

  const handlePlayClick = () => {
    if (isMobile) {
      // On mobile, open the link directly
      window.open(offer.click_url, "_blank");
    } else {
      // On desktop, show QR code dialog
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
        {/* Powered by Badge and Platform Info */}
        <Box 
          sx={{ 
            display: "flex", 
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            mb: 2,
            pb: 2,
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            flexWrap: "wrap",
          }}
        >
          {/* Powered by Badge */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <Typography 
              sx={{ 
                fontSize: "0.75rem",
                color: colors.text.secondary,
                fontWeight: 500,
              }}
            >
              Powered by
            </Typography>
            <Box
              sx={{
                bgcolor: "rgba(1, 214, 118, 0.1)",
                color: "#01D676",
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.02em",
              }}
            >
              {offer.provider || 'Notik'}
            </Box>
          </Box>

          {/* Platform Icons */}
          {offer.device && offer.device.length > 0 && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography 
                sx={{ 
                  fontSize: "0.75rem",
                  color: colors.text.secondary,
                  fontWeight: 500,
                }}
              >
                Available on:
              </Typography>
              <Box sx={{ display: "flex", gap: 0.75 }}>
                {offer.device.map((platform, platformIndex) => {
                  const platformLower = platform.toLowerCase();
                  let icon = null;
                  let label = platform;

                  if (platformLower === 'android') {
                    icon = (
                      <svg viewBox="0 0 24 24" style={{ width: 16, height: 16 }} fill="currentColor">
                        <path d="M17.6,9.48l1.84-3.18c0.16-0.31,0.04-0.69-0.26-0.85c-0.29-0.15-0.65-0.06-0.83,0.22l-1.88,3.24 c-2.86-1.21-6.08-1.21-8.94,0L5.65,5.67c-0.19-0.29-0.58-0.38-0.87-0.2C4.5,5.65,4.41,6.01,4.56,6.3L6.4,9.48 C3.3,11.25,1.28,14.44,1,18h22C22.72,14.44,20.7,11.25,17.6,9.48z M7,15.25c-0.69,0-1.25-0.56-1.25-1.25 c0-0.69,0.56-1.25,1.25-1.25S8.25,13.31,8.25,14C8.25,14.69,7.69,15.25,7,15.25z M17,15.25c-0.69,0-1.25-0.56-1.25-1.25 c0-0.69,0.56-1.25,1.25-1.25s1.25,0.56,1.25,1.25C18.25,14.69,17.69,15.25,17,15.25z"/>
                      </svg>
                    );
                    label = 'Android';
                  } else if (platformLower === 'ios' || platformLower === 'iphone' || platformLower === 'ipad') {
                    icon = (
                      <svg viewBox="0 0 24 24" style={{ width: 16, height: 16 }} fill="currentColor">
                        <path d="M17.05,20.28c-0.98,0.95-2.05,0.8-3.08,0.35c-1.09-0.46-2.09-0.48-3.24,0c-1.44,0.62-2.2,0.44-3.06-0.35 C2.79,15.25,3.51,7.59,9.05,7.31c1.35,0.07,2.29,0.74,3.08,0.8c1.18-0.24,2.31-0.93,3.57-0.84c1.51,0.12,2.65,0.72,3.4,1.8 c-3.12,1.87-2.38,5.98,0.48,7.13c-0.57,1.5-1.31,2.99-2.54,4.09L17.05,20.28z M12.03,7.25c-0.15-2.23,1.66-4.07,3.74-4.25 c0.29,2.58-2.34,4.5-3.74,4.25z"/>
                      </svg>
                    );
                    label = 'iOS';
                  } else if (platformLower === 'web' || platformLower === 'desktop' || platformLower === 'windows' || platformLower === 'pc') {
                    icon = <Monitor size={16} />;
                    label = 'Desktop';
                  }

                  return icon ? (
                    <Box
                      key={`${platform}-${platformIndex}`}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        px: 1,
                        py: 0.5,
                        bgcolor: "#222339",
                        borderRadius: 1,
                        border: "1px solid rgba(255,255,255,0.05)",
                        color: colors.text.secondary,
                      }}
                      title={label}
                    >
                      {icon}
                      <Typography sx={{ fontSize: "0.7rem", fontWeight: 500 }}>
                        {label}
                      </Typography>
                    </Box>
                  ) : null;
                })}
              </Box>
            </Box>
          )}
        </Box>

        {/* Title */}
        <Typography 
          sx={{ 
            fontSize: { xs: "1.25rem", sm: "1.5rem" },
            fontWeight: 700,
            mb: 2,
            color: "#fff",
          }}
        >
          {offer.name}
        </Typography>

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
            }}
          >
            <Box
              component="img"
              src={offer.image_url}
              alt={offer.name}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
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

            {/* Popularity Score */}
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: "0.75rem", color: "#a9a9ca", mb: 0.5 }}>
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
              Play and Earn ${offer.payout}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Description Section */}
      {(offer.description1 || offer.description2 || offer.description3) && (
        <Box sx={{ px: { xs: 2, sm: 2.5 }, pb: 2, flexShrink: 0 }}>
          <Box 
            sx={{ 
              bgcolor: "#222339",
              p: 2,
              borderRadius: 2,
              border: "1px solid rgba(255,255,255,0.05)",
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
                  color: "#a9a9ca",
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
                  color: "#a9a9ca",
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
            <svg viewBox="0 0 18 15" style={{ width: 16, height: 14, color: "#01D676" }}>
              <path d="M15.8546 0.664551H2.10464C1.77312 0.664551 1.45518 0.796247 1.22076 1.03067C0.986341 1.26509 0.854645 1.58303 0.854645 1.91455V13.1646C0.854645 13.4961 0.986341 13.814 1.22076 14.0484C1.45518 14.2829 1.77312 14.4146 2.10464 14.4146H15.8546C16.1862 14.4146 16.5041 14.2829 16.7385 14.0484C16.9729 13.814 17.1046 13.4961 17.1046 13.1646V1.91455C17.1046 1.58303 16.9729 1.26509 16.7385 1.03067C16.5041 0.796247 16.1862 0.664551 15.8546 0.664551ZM14.6046 12.5396H3.35464C3.18888 12.5396 3.02991 12.4737 2.9127 12.3565C2.79549 12.2393 2.72964 12.0803 2.72964 11.9146V3.16455C2.72964 2.99879 2.79549 2.83982 2.9127 2.72261C3.02991 2.6054 3.18888 2.53955 3.35464 2.53955C3.52041 2.53955 3.67938 2.6054 3.79659 2.72261C3.9138 2.83982 3.97964 2.99879 3.97964 3.16455V9.15596L6.66246 6.47236C6.7205 6.41425 6.78943 6.36815 6.86531 6.3367C6.94118 6.30525 7.02251 6.28906 7.10464 6.28906C7.18678 6.28906 7.26811 6.30525 7.34398 6.3367C7.41986 6.36815 7.48879 6.41425 7.54683 6.47236L8.97964 7.90596L12.4711 4.41455H10.2296C10.0639 4.41455 9.90491 4.3487 9.7877 4.23149C9.67049 4.11428 9.60464 3.95531 9.60464 3.78955C9.60464 3.62379 9.67049 3.46482 9.7877 3.34761C9.90491 3.2304 10.0639 3.16455 10.2296 3.16455H13.9796C14.1454 3.16455 14.3044 3.2304 14.4216 3.34761C14.5388 3.46482 14.6046 3.62379 14.6046 3.78955V7.53955C14.6046 7.70531 14.5388 7.86428 14.4216 7.98149C14.3044 8.0987 14.1454 8.16455 13.9796 8.16455C13.8139 8.16455 13.6549 8.0987 13.5377 7.98149C13.4205 7.86428 13.3546 7.70531 13.3546 7.53955V5.29814L9.42183 9.23174C9.36379 9.28985 9.29486 9.33595 9.21898 9.3674C9.14311 9.39885 9.06178 9.41504 8.97964 9.41504C8.89751 9.41504 8.81618 9.39885 8.74031 9.3674C8.66443 9.33595 8.5955 9.28985 8.53746 9.23174L7.10464 7.79814L3.97964 10.9231V11.2896H14.6046C14.7704 11.2896 14.9294 11.3554 15.0466 11.4726C15.1638 11.5898 15.2296 11.7488 15.2296 11.9146C15.2296 12.0803 15.1638 12.2393 15.0466 12.3565C14.9294 12.4737 14.7704 12.5396 14.6046 12.5396Z" fill="currentColor"/>
            </svg>
            <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color: "#fff" }}>
              Main Rewards
            </Typography>
          </Box>

          {/* Milestones List */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {offer.events?.map((event, index) => (
              <Box
                key={event.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 1.5,
                  bgcolor: "#222339",
                  borderRadius: 2,
                  border: "1px solid rgba(255,255,255,0.05)",
                  transition: "all 0.2s",
                  "&:hover": {
                    borderColor: "rgba(1, 214, 118, 0.3)",
                    bgcolor: "#252640",
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1 }}>
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: "#3d3f54",
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
                      border: "1.5px solid #3d3f54",
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
                <ContentCopyIcon sx={{ fontSize: 16 }} />
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

// Platform Selector Component
function PlatformSelector({ 
  selectedPlatforms, 
  onToggle 
}: { 
  selectedPlatforms: DeviceOS[], 
  onToggle: (platform: DeviceOS) => void 
}) {
  // Real Android and iOS SVG icons
  const AndroidIcon = () => (
    <svg viewBox="0 0 24 24" style={{ width: 16, height: 16 }} fill="currentColor">
      <path d="M17.6,9.48l1.84-3.18c0.16-0.31,0.04-0.69-0.26-0.85c-0.29-0.15-0.65-0.06-0.83,0.22l-1.88,3.24 c-2.86-1.21-6.08-1.21-8.94,0L5.65,5.67c-0.19-0.29-0.58-0.38-0.87-0.2C4.5,5.65,4.41,6.01,4.56,6.3L6.4,9.48 C3.3,11.25,1.28,14.44,1,18h22C22.72,14.44,20.7,11.25,17.6,9.48z M7,15.25c-0.69,0-1.25-0.56-1.25-1.25 c0-0.69,0.56-1.25,1.25-1.25S8.25,13.31,8.25,14C8.25,14.69,7.69,15.25,7,15.25z M17,15.25c-0.69,0-1.25-0.56-1.25-1.25 c0-0.69,0.56-1.25,1.25-1.25s1.25,0.56,1.25,1.25C18.25,14.69,17.69,15.25,17,15.25z"/>
    </svg>
  );

  const AppleIcon = () => (
    <svg viewBox="0 0 24 24" style={{ width: 16, height: 16 }} fill="currentColor">
      <path d="M17.05,20.28c-0.98,0.95-2.05,0.8-3.08,0.35c-1.09-0.46-2.09-0.48-3.24,0c-1.44,0.62-2.2,0.44-3.06-0.35 C2.79,15.25,3.51,7.59,9.05,7.31c1.35,0.07,2.29,0.74,3.08,0.8c1.18-0.24,2.31-0.93,3.57-0.84c1.51,0.12,2.65,0.72,3.4,1.8 c-3.12,1.87-2.38,5.98,0.48,7.13c-0.57,1.5-1.31,2.99-2.54,4.09L17.05,20.28z M12.03,7.25c-0.15-2.23,1.66-4.07,3.74-4.25 c0.29,2.58-2.34,4.5-3.74,4.25z"/>
    </svg>
  );

  const platforms: { id: DeviceOS; label: string; icon: any }[] = [
    { id: "android", label: "Android", icon: AndroidIcon },
    { id: "ios", label: "iOS", icon: AppleIcon },
    { id: "windows", label: "Desktop", icon: Monitor },
  ];

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 1.5 }, mb: { xs: 2, sm: 3 }, flexWrap: "wrap" }}>
        <Typography variant="h5" isBold sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}>
          All Offers
        </Typography>
        <Typography sx={{ fontSize: { xs: "0.875rem", sm: "1rem" }, color: colors.text.secondary, mr: { xs: 0, sm: 0.5 } }}>
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
                gap: { xs: 0.5, sm: 0.75 },
                px: { xs: 1.25, sm: 1.5 },
                py: { xs: 0.625, sm: 0.75 },
                borderRadius: { xs: 1.5, sm: 2 },
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
              <Box sx={{ display: "flex", alignItems: "center", color: isSelected ? "#01D676" : colors.text.secondary }}>
                <Icon />
              </Box>
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
      
      // Fetch from Gemiad, Notik, Vortex, and Revtoo APIs in parallel (Priority order)
      const [gemiadResponse, notikResponse, vortexResponse, revtooResponse] = await Promise.all([
        fetch(`/api/gemiad-offers?user_id=${userId}`),
        fetch(`/api/notik-offers?user_id=${userId}&device_type=mobile&device_os=${primaryOS}`),
        fetch(`/api/vortex-offers?user_id=${userId}`),
        fetch(`/api/revtoo-offers?user_id=${userId}`)
      ]);
      
      let gemiadOffers: any[] = [];
      let notikOffers: any[] = [];
      let vortexOffers: any[] = [];
      let revtooOffers: any[] = [];
      
      // Process Gemiad offers (Priority 1)
      if (gemiadResponse.ok) {
        const gemiadData = await gemiadResponse.json();
        if (gemiadData.success && gemiadData.offers && Array.isArray(gemiadData.offers)) {
          gemiadOffers = gemiadData.offers;
          console.log(`All Offers - Gemiad: ${gemiadOffers.length}`);
        }
      }
      
      // Process Notik offers (Priority 2)
      if (notikResponse.ok) {
        const notikData = await notikResponse.json();
        if (notikData.success && notikData.offers && Array.isArray(notikData.offers)) {
          notikOffers = notikData.offers;
          console.log(`All Offers - Notik: ${notikOffers.length}`);
        }
      }
      
      // Process Vortex offers (Priority 3)
      if (vortexResponse.ok) {
        const vortexData = await vortexResponse.json();
        if (vortexData.success && vortexData.offers && Array.isArray(vortexData.offers)) {
          vortexOffers = vortexData.offers;
          console.log(`All Offers - Vortex: ${vortexOffers.length}`);
        }
      }
      
      // Process Revtoo offers (Priority 4)
      if (revtooResponse.ok) {
        const revtooData = await revtooResponse.json();
        if (revtooData.success && revtooData.offers && Array.isArray(revtooData.offers)) {
          revtooOffers = revtooData.offers;
          console.log(`All Offers - Revtoo: ${revtooOffers.length}`);
        }
      }
      
      // Combine offers with priority: Gemiad > Notik > Vortex > Revtoo
      // Mix them in a round-robin fashion for better distribution
      const allOffersData: any[] = [];
      const maxLength = Math.max(gemiadOffers.length, notikOffers.length, vortexOffers.length, revtooOffers.length);
      
      for (let i = 0; i < maxLength; i++) {
        if (i < gemiadOffers.length) allOffersData.push(gemiadOffers[i]);
        if (i < notikOffers.length) allOffersData.push(notikOffers[i]);
        if (i < vortexOffers.length) allOffersData.push(vortexOffers[i]);
        if (i < revtooOffers.length) allOffersData.push(revtooOffers[i]);
      }
      
      console.log(`All Offers - Total combined: ${allOffersData.length}`);
      
      if (allOffersData.length > 0) {
        // Store all offers
        setAllOffers(allOffersData);
        
        // Display first 20 offers immediately
        const initialBatch = allOffersData.slice(0, 20);
        setDisplayedOffers(initialBatch);
        currentIndex.current = initialBatch.length;
        setLoading(false);
        
        // Check if there are more offers
        if (initialBatch.length >= allOffersData.length) {
          setHasMore(false);
        }
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching offers:", error);
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
            <Typography sx={{ color: colors.text.secondary, fontSize: { xs: "0.9375rem", sm: "1rem" } }}>
              No offers available at the moment
            </Typography>
          </Box>
        ) : (
          <>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(3, 1fr)",
                  sm: "repeat(4, 1fr)",
                  md: "repeat(6, 1fr)",
                  lg: "repeat(7, 1fr)",
                  xl: "repeat(8, 1fr)",
                },
                gap: { xs: 0.75, sm: 1, md: 1 },
                columnGap: { xs: 0.5, sm: 0.75, md: 0.75 },
              }}
            >
              {displayedOffers.map((offer, index) => (
                <Box
                  key={`${offer.offer_id}-${index}`}
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
                      {offer.provider || 'Game'}
                    </Typography>

                    <Typography sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" }, fontWeight: 600 }}>
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
                <Typography sx={{ color: colors.text.secondary, fontSize: { xs: "0.9375rem", sm: "1rem" } }}>
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
