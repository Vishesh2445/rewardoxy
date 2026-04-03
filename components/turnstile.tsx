"use client";

import { useEffect, useRef, useId } from "react";
import Box from "@mui/material/Box";

interface TurnstileProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
}

export default function Turnstile({
  onVerify,
  onError,
  onExpire,
}: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const uniqueId = useId();
  const containerId = `turnstile-container-${uniqueId.replace(/:/g, "")}`;

  // Store callbacks in refs to avoid re-renders triggering effect
  const onVerifyRef = useRef(onVerify);
  const onErrorRef = useRef(onError);
  const onExpireRef = useRef(onExpire);

  // Update refs when callbacks change
  useEffect(() => {
    onVerifyRef.current = onVerify;
    onErrorRef.current = onError;
    onExpireRef.current = onExpire;
  }, [onVerify, onError, onExpire]);

  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    let checkInterval: NodeJS.Timeout | null = null;
    let mounted = true;

    const renderWidget = () => {
      if (
        !mounted ||
        typeof window === "undefined" ||
        !window.turnstile ||
        !containerRef.current ||
        widgetIdRef.current ||
        !siteKey
      ) {
        return;
      }

      try {
        const id = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: "dark",
          callback: (token: string) => onVerifyRef.current(token),
          "error-callback": () => onErrorRef.current?.(),
          "expired-callback": () => onExpireRef.current?.(),
        });
        widgetIdRef.current = id;
      } catch {
        // Widget might already exist, ignore error
      }
    };

    // Try to render immediately if turnstile is available
    if (window.turnstile) {
      renderWidget();
    } else {
      // Wait for turnstile script to load
      checkInterval = setInterval(() => {
        if (window.turnstile && mounted) {
          if (checkInterval) clearInterval(checkInterval);
          renderWidget();
        }
      }, 100);

      // Stop checking after 10 seconds
      setTimeout(() => {
        if (checkInterval) clearInterval(checkInterval);
      }, 10000);
    }

    // Cleanup on unmount only
    return () => {
      mounted = false;
      if (checkInterval) clearInterval(checkInterval);
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // Widget might already be removed
        }
        widgetIdRef.current = null;
      }
    };
  }, []); // Empty dependency array - only run once on mount

  return (
    <Box
      ref={containerRef}
      id={containerId}
      sx={{
        display: "flex",
        justifyContent: "center",
        mb: 2,
        "& > div": {
          margin: "0 auto",
        },
      }}
    />
  );
}

// Type definitions for Turnstile
declare global {
  interface Window {
    turnstile: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          theme: "light" | "dark";
          callback?: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
      getResponse: (widgetId?: string) => string | undefined;
    };
  }
}
