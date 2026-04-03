"use client";

import { useEffect, useRef } from "react";
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
  const widgetId = useRef<string | null>(null);

  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

    // Check if Turnstile is available
    if (
      typeof window !== "undefined" &&
      window.turnstile &&
      containerRef.current &&
      !widgetId.current &&
      siteKey
    ) {
      window.turnstile.render("#turnstile-container", {
        sitekey: siteKey,
        theme: "dark",
        callback: (token: string) => onVerify(token),
        "error-callback": onError,
        "expired-callback": onExpire,
      });
    }
  }, [onVerify, onError, onExpire]);

  return (
    <Box
      ref={containerRef}
      id="turnstile-container"
      sx={{
        display: "flex",
        justifyContent: "center",
        mb: 2,
      }}
    />
  );
}

// Type definitions for Turnstile
declare global {
  interface Window {
    turnstile: {
      render: (
        selector: string,
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
