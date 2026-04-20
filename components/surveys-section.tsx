"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Box, CircularProgress } from "@mui/material";
import { Zap } from "lucide-react";
import Typography from "@/components/ui/Typography";
import colors from "@/theme/colors";
import { SurveySkeleton } from "@/components/survey-skeleton";

interface CPXSurvey {
  id: string;
  title: string;
  description?: string;
  reward: number;
  loi?: number;
  conversion_rate?: string;
  image_url?: string;
  click_url: string;
}

export default function SurveysSection({ userId }: { userId: string }) {
  const [displayedSurveys, setDisplayedSurveys] = useState<CPXSurvey[]>([]);
  const [allSurveys, setAllSurveys] = useState<CPXSurvey[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const observerTarget = useRef<HTMLDivElement>(null);
  const currentIndex = useRef(0);

  const loadMoreSurveys = useCallback(() => {
    if (loadingMore || !hasMore || allSurveys.length === 0) return;

    const nextBatch = allSurveys.slice(currentIndex.current, currentIndex.current + 12);

    if (nextBatch.length === 0) {
      setHasMore(false);
      return;
    }

    setLoadingMore(true);
    setDisplayedSurveys(prev => [...prev, ...nextBatch]);
    currentIndex.current += nextBatch.length;
    setLoadingMore(false);

    if (currentIndex.current >= allSurveys.length) {
      setHasMore(false);
    }
  }, [allSurveys, loadingMore, hasMore]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMoreSurveys();
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
  }, [hasMore, loadingMore, loadMoreSurveys]);

  useEffect(() => {
    fetchSurveys();
  }, [userId]);

  async function fetchSurveys() {
    try {
      setLoading(true);
      setDisplayedSurveys([]);
      setAllSurveys([]);
      currentIndex.current = 0;
      setHasMore(true);

      const params = new URLSearchParams();
      params.append('user_id', userId);

      const response = await fetch(`/api/cpx-surveys?${params.toString()}`);

      if (!response.ok) {
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (data.success && data.surveys && Array.isArray(data.surveys)) {

        setAllSurveys(data.surveys);
        const initialBatch = data.surveys.slice(0, 12);
        setDisplayedSurveys(initialBatch);
        currentIndex.current = initialBatch.length;
        setLoading(false);

        if (initialBatch.length >= data.surveys.length) {
          setHasMore(false);
        }
      } else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  }

  if (loading || displayedSurveys.length === 0) {
    return (
      loading ? (
        <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, sm: 3 } }}>
          {/* Section Header */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: { xs: 2, sm: 3 } }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: 1.5,
                background: colors.background.glass,
                backdropFilter: colors.glass.backdrop,
                border: `1px solid ${colors.glass.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Zap size={16} color={colors.primary} />
            </Box>
            <Typography variant="h6" isBold>
              Surveys
            </Typography>
            <Typography sx={{ fontSize: "0.875rem", color: colors.text.secondary, ml: "auto" }}>
              Loading...
            </Typography>
          </Box>

          {/* Surveys Skeleton Grid */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                sm: "repeat(3, 1fr)",
                md: "repeat(4, 1fr)",
                lg: "repeat(6, 1fr)",
              },
              gap: { xs: 1, sm: 1.5, md: 2 },
            }}
          >
            {[...Array(12)].map((_, index) => (
              <SurveySkeleton key={index} />
            ))}
          </Box>
        </Box>
      ) : null
    );
  }

  return (
    <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, sm: 3 } }}>
      {/* Section Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: { xs: 2, sm: 3 } }}>
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: 1.5,
            background: colors.background.glass,
            backdropFilter: colors.glass.backdrop,
            border: `1px solid ${colors.glass.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Zap size={16} color={colors.primary} />
        </Box>
        <Typography variant="h6" isBold>
          Surveys
        </Typography>
        <Typography sx={{ fontSize: "0.875rem", color: colors.text.secondary, ml: "auto" }}>
          {allSurveys.length} available
        </Typography>
      </Box>

      {/* Surveys Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, 1fr)",
            sm: "repeat(3, 1fr)",
            md: "repeat(4, 1fr)",
            lg: "repeat(6, 1fr)",
          },
          gap: { xs: 1, sm: 1.5, md: 2 },
        }}
      >
        {displayedSurveys.map((survey) => (
          <Box
            key={`${survey.id}`}
            sx={{
              cursor: "pointer",
              minWidth: { xs: 90, sm: 100, md: 140 },
              maxWidth: { xs: 90, sm: 100, md: 140 },
            }}
            onClick={() => window.open(survey.click_url, "_blank")}
          >
            <Box
              sx={{
                bgcolor: "#12131c",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                p: { xs: 1, md: 1.25 },
                borderRadius: { xs: 2, md: 2.5 },
                transition: "all 0.2s",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: { xs: 0.75, md: 1 },
                "&:hover": {
                  bgcolor: "#1a1b2e",
                  transform: "translateY(-2px)",
                  borderColor: "rgba(1, 214, 118, 0.3)",
                },
              }}
            >
              {/* Survey Icon/Placeholder */}
              <Box sx={{ position: "relative", mb: { xs: 0.5, md: 0.75 } }}>
                {survey.image_url ? (
                  <Box
                    component="img"
                    src={survey.image_url}
                    alt={survey.title}
                    sx={{
                      width: "100%",
                      aspectRatio: "1",
                      borderRadius: { xs: 1, md: 1.5 },
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
                      borderRadius: { xs: 1, md: 1.5 },
                      overflow: "hidden",
                      bgcolor: "rgba(255, 175, 32, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "2px solid rgba(255, 175, 32, 0.3)",
                    }}
                  >
                    <Zap size={24} color="#ffaf20" />
                  </Box>
                )}
              </Box>

              {/* Title */}
              <Box sx={{ height: { xs: 32, md: 40 }, overflow: "hidden", mb: { xs: 0.5, md: 0.75 } }}>
                <Typography
                  sx={{
                    fontSize: { xs: "0.75rem", md: "0.8125rem" },
                    fontWeight: 500,
                    lineHeight: 1.2,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {survey.title}
                </Typography>
              </Box>

              {/* LOI Badge */}
              {survey.loi && (
                <Typography sx={{ fontSize: { xs: "0.7rem", md: "0.75rem" }, color: colors.text.secondary }}>
                  ⏱️ ~{survey.loi} mins
                </Typography>
              )}

              {/* Reward */}
              <Typography
                sx={{
                  fontSize: { xs: "0.8rem", md: "0.875rem" },
                  fontWeight: 600,
                  color: "#ffaf20",
                  mt: "auto"
                }}
              >
                ${survey.reward.toFixed(2)}
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

      {/* End of surveys message */}
      {!hasMore && displayedSurveys.length > 0 && (
        <Box sx={{ py: 4, textAlign: "center" }}>
          <Typography sx={{ color: colors.text.secondary, fontSize: { xs: "0.9375rem", sm: "1rem" } }}>
            You've reached the end • {displayedSurveys.length} surveys loaded
          </Typography>
        </Box>
      )}
    </Box>
  );
}
