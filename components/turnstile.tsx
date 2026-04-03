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
  const renderAttempted = useRef(false);
  const uniqueId = useId();
  const containerId = `turnstile-container-${uniqueId.replace(/:/g, "")}`;

  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

    const renderWidget = () => {
      if (
        typeof window !== "undefined" &&
        window.turnstile &&
        containerRef.current &&
        !widgetIdRef.current &&
        !renderAttempted.current &&
        siteKey
      ) {
        renderAttempted.current = true;
        // Clear any existing content in the container
        containerRef.current.innerHTML = "";

        try {
          const id = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            theme: "dark",
            callback: (token: string) => onVerify(token),
            "error-callback": onError,
            "expired-callback": onExpire,
          });
          widgetIdRef.current = id;
        } catch {
          // Widget might already exist, ignore error
          renderAttempted.current = false;
        }
      }
    };

    // Try to render immediately
    renderWidget();

    // If turnstile isn't loaded yet, wait for it
    if (!window.turnstile) {
      const checkInterval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(checkInterval);
          renderWidget();
        }
      }, 100);

      // Clean up interval after 10 seconds
      const timeout = setTimeout(() => clearInterval(checkInterval), 10000);

      return () => {
        clearInterval(checkInterval);
        clearTimeout(timeout);
      };
    }

    // Cleanup on unmount
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // Widget might already be removed
        }
        widgetIdRef.current = null;
        renderAttempted.current = false;
      }
    };
  }, [onVerify, onError, onExpire]);

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
