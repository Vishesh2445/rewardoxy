"use client";

import { useState, useEffect } from "react";
import { Box, IconButton, CircularProgress } from "@mui/material";
import { Zap, ChevronLeft, ChevronRight } from "lucide-react";
import Typography from "@/components/ui/Typography";
import colors from "@/theme/colors";

interface CPXSurvey {
  id: string;
  title: string;
  cpi: number;
  loi: number;
  rating: number;
  surveyurl?: string;
}

export default function CPXWidget({ userId, userName, userEmail, cpxHash }: {
  userId: string;
  userName?: string;
  userEmail?: string;
  cpxHash: string;
}) {
  const [surveys, setSurveys] = useState<CPXSurvey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[CPXWidget] Fetching surveys with:', { userId, userName, userEmail, cpxHash: cpxHash ? 'set' : 'missing' });
    fetchSurveys();
  }, [userId, cpxHash, userName, userEmail]);

  async function fetchSurveys() {
    try {
      setLoading(true);
      setError(null);

      // Validate required parameters
      if (!userId) {
        throw new Error('userId is required');
      }
      if (!cpxHash) {
        throw new Error('cpxHash (secure_hash) is required');
      }

      // Get user agent
      const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';

      // Build API URL with all required parameters
      const apiUrl = new URL('https://live-api.cpx-research.com/api/get-surveys.php');
      apiUrl.searchParams.append('app_id', '32037');
      apiUrl.searchParams.append('email', userEmail || '');
      apiUrl.searchParams.append('ext_user_id', userId);
      apiUrl.searchParams.append('subid_1', '');
      apiUrl.searchParams.append('subid_2', '');
      apiUrl.searchParams.append('output_method', 'api');
      apiUrl.searchParams.append('user_agent', userAgent);
      apiUrl.searchParams.append('limit', '12');
      apiUrl.searchParams.append('secure_hash', cpxHash);

      console.log('[CPXWidget] API Request URL:', apiUrl.toString());

      const response = await fetch(apiUrl.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      console.log('[CPXWidget] Response status:', response.status);

      if (!response.ok) {
        const errMsg = `API Error: ${response.status} ${response.statusText}`;
        console.error('[CPXWidget] Response error:', errMsg);
        setError(errMsg);
        return;
      }

      const text = await response.text();
      console.log('[CPXWidget] Raw response:', text);

      if (!text) {
        console.log('[CPXWidget] Empty response');
        setSurveys([]);
        return;
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        const errMsg = `Failed to parse JSON: ${String(e)}`;
        console.error('[CPXWidget] Parse error:', errMsg, 'Response text:', text);
        setError(errMsg);
        return;
      }

      console.log('[CPXWidget] Parsed data:', data);

      // Handle CPX API response - check if response is successful
      if (data && data.success === true && data.surveys && Array.isArray(data.surveys)) {
        if (data.surveys.length === 0) {
          console.log('[CPXWidget] No surveys in response');
          setSurveys([]);
          return;
        }

        const surveyList: CPXSurvey[] = data.surveys
          .filter((survey: any) => survey && survey.id)
          .map((survey: any) => {
            const mappedSurvey: CPXSurvey = {
              id: String(survey.id),
              title: survey.title || survey.surveyname || 'Survey',
              cpi: parseFloat(survey.cpi) || 0,
              loi: parseInt(survey.loi) || parseInt(survey.time_remaining) || 0,
              rating: parseInt(survey.rating_count) || parseInt(survey.rating) || 5,
              surveyurl: survey.surveyurl || '',
            };
            console.log('[CPXWidget] Mapped survey:', mappedSurvey);
            return mappedSurvey;
          })
          .filter((survey: CPXSurvey) => survey.cpi > 0);

        console.log('[CPXWidget] Final surveys:', surveyList.length, 'surveys');
        setSurveys(surveyList);
      } else if (data && data.surveys && Array.isArray(data.surveys)) {
        // Handle response without explicit success field
        const surveyList: CPXSurvey[] = data.surveys
          .filter((survey: any) => survey && survey.id)
          .map((survey: any) => ({
            id: String(survey.id),
            title: survey.title || survey.surveyname || 'Survey',
            cpi: parseFloat(survey.cpi) || 0,
            loi: parseInt(survey.loi) || parseInt(survey.time_remaining) || 0,
            rating: parseInt(survey.rating_count) || parseInt(survey.rating) || 5,
            surveyurl: survey.surveyurl || '',
          }))
          .filter((survey: CPXSurvey) => survey.cpi > 0);

        console.log('[CPXWidget] Final surveys (no success field):', surveyList.length, 'surveys');
        setSurveys(surveyList);
      } else {
        console.warn('[CPXWidget] Invalid response structure:', { success: data?.success, hasSurveys: !!data?.surveys, isArray: Array.isArray(data?.surveys) });
        setSurveys([]);
      }
    } catch (error) {
      const errMsg = `Error fetching surveys: ${String(error)}`;
      console.error('[CPXWidget] Error:', errMsg);
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  }

  const handleScroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('surveys-scroll');
    if (container) {
      const scrollAmount = 300;
      const newPosition = direction === 'left'
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;
      container.scrollTo({ left: newPosition, behavior: 'smooth' });
    }
  };

  const openSurvey = (survey: CPXSurvey) => {
    if (survey.surveyurl) {
      window.open(survey.surveyurl, '_blank', 'noopener,noreferrer');
    }
  };

  // Error state
  if (error) {
    return (
      <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, sm: 3 } }}>
        <Box sx={{
          bgcolor: "rgba(239, 68, 68, 0.1)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          borderRadius: 2,
          p: 2.5,
          textAlign: "center"
        }}>
          <Typography sx={{ fontSize: "0.875rem", color: "#ef4444", mb: 1 }}>
            Error loading surveys
          </Typography>
          <Typography sx={{ fontSize: "0.75rem", color: colors.text.secondary }}>
            {error}
          </Typography>
        </Box>
      </Box>
    );
  }

  // Loading state
  if (loading) {
    return (
      <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, sm: 3 } }}>
        <Box sx={{
          bgcolor: "#12131c",
          borderRadius: 3,
          overflow: "hidden",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          p: { xs: 1.5, sm: 2 }
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: { xs: 2, sm: 3 } }}>
            <Box
              sx={{
                width: 20,
                height: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <svg viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', color: '#ffaf20' }}>
                <path d="M8 0C8 0 8 5.45455 3.63636 9.09091C-0.727273 12.7273 -0.727273 20 8 20C16.7273 20 16.7273 12.7273 12.3636 9.09091C8 5.45455 8 0 8 0Z" fill="currentColor"/>
              </svg>
            </Box>
            <Typography variant="h6" isBold sx={{ fontSize: { xs: "1.125rem", sm: "1.25rem" } }}>
              Surveys
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress size={40} sx={{ color: "#ffaf20" }} />
          </Box>
        </Box>
      </Box>
    );
  }

  // Empty state
  if (surveys.length === 0) {
    return null;
  }

  return (
    <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, sm: 3 } }}>
      {/* Section Container */}
      <Box
        sx={{
          bgcolor: "#12131c",
          borderRadius: 3,
          overflow: "hidden",
          border: "1px solid rgba(255, 255, 255, 0.05)"
        }}
      >
        {/* Header */}
        <Box sx={{ p: { xs: 1.5, sm: 2 }, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{
              width: 20,
              height: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <svg viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', color: '#ffaf20' }}>
                <path d="M8 0C8 0 8 5.45455 3.63636 9.09091C-0.727273 12.7273 -0.727273 20 8 20C16.7273 20 16.7273 12.7273 12.3636 9.09091C8 5.45455 8 0 8 0Z" fill="currentColor"/>
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
                bgcolor: "#242537",
                borderRadius: 1.5,
                color: "#ffaf20",
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
                color: "#ffaf20",
                "&:hover": { bgcolor: "#2a2b45" },
              }}
            >
              <ChevronRight size={16} />
            </IconButton>
          </Box>
        </Box>

        {/* Surveys Horizontal Scroll */}
        <Box
          id="surveys-scroll"
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
          {surveys.map((survey) => (
            <Box
              key={survey.id}
              sx={{
                minWidth: { xs: 100, sm: 140 },
                maxWidth: { xs: 100, sm: 140 },
                flexShrink: 0,
                cursor: "pointer",
              }}
              onClick={() => openSurvey(survey)}
            >
              <Box
                sx={{
                  bgcolor: "#222339",
                  p: { xs: 0.75, sm: 1.5 },
                  borderRadius: { xs: 1.5, sm: 2.5 },
                  transition: "all 0.2s",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  "&:hover": {
                    bgcolor: "#2a2b45",
                  },
                }}
              >
                {/* Icon Container with Rating Badge */}
                <Box sx={{ position: "relative", mb: { xs: 1, sm: 1.5 }, flexShrink: 0 }}>
                  <Box
                    sx={{
                      width: "100%",
                      aspectRatio: "1",
                      borderRadius: { xs: 1, sm: 1.5 },
                      overflow: "hidden",
                      bgcolor: "#1a1b2e",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px solid rgba(255, 175, 32, 0.2)",
                    }}
                  >
                    <Zap size={32} color="#ffaf20" />
                  </Box>

                  {/* Star Rating Badge */}
                  {survey.rating > 0 && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: { xs: 4, sm: 8 },
                        right: { xs: 4, sm: 8 },
                        bgcolor: "#ffaf20",
                        px: { xs: 0.5, sm: 0.75 },
                        py: { xs: 0.25, sm: 0.375 },
                        borderRadius: 0.75,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minWidth: "auto",
                      }}
                    >
                      <Typography sx={{ fontSize: { xs: "0.6rem", sm: "0.7rem" }, fontWeight: 700, color: "#000" }}>
                        ★ {Math.min(survey.rating, 5)}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Title */}
                <Box sx={{ height: 40, overflow: "hidden", mb: 0.5, flexShrink: 0 }}>
                  <Typography
                    sx={{
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      fontWeight: 500,
                      lineHeight: 1.3,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      color: "#fff",
                    }}
                  >
                    {survey.title}
                  </Typography>
                </Box>

                {/* Type Label */}
                <Typography
                  sx={{
                    fontSize: { xs: "0.6rem", sm: "0.6875rem" },
                    color: colors.text.secondary,
                    opacity: 0.6,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    fontWeight: 600,
                    mb: { xs: 0.5, sm: 1 },
                    flexShrink: 0,
                  }}
                >
                  Survey
                </Typography>

                {/* LOI and Reward */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 0.5, sm: 0.75 }, mt: "auto" }}>
                  {/* Time */}
                  {survey.loi > 0 && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Typography sx={{ fontSize: { xs: "0.65rem", sm: "0.75rem" }, color: colors.text.secondary }}>
                        ⏱️
                      </Typography>
                      <Typography sx={{ fontSize: { xs: "0.65rem", sm: "0.75rem" }, color: colors.text.secondary }}>
                        ~{survey.loi}m
                      </Typography>
                    </Box>
                  )}

                  {/* Amount */}
                  {survey.cpi > 0 && (
                    <Typography sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" }, fontWeight: 600, color: "#ffaf20" }}>
                      ${survey.cpi.toFixed(2)}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
