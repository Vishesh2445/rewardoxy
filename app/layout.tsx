import type { Metadata, Viewport } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "@/theme";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rewardoxy — Get Paid to Complete Surveys & Tasks",
  description:
    "Earn real rewards by completing surveys, tasks, and offers. Join Rewardoxy and start earning today.",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/logo-256.png", sizes: "256x256", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  metadataBase: new URL("https://rewardoxy.app"),
  alternates: {
    canonical: "https://rewardoxy.app",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "Rewardoxy — Get Paid to Complete Surveys & Tasks",
    description:
      "Earn real rewards by completing surveys, tasks, and offers. Join Rewardoxy and start earning today.",
    url: "https://rewardoxy.app",
    siteName: "Rewardoxy",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Rewardoxy Logo" }],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rewardoxy — Get Paid to Complete Surveys & Tasks",
    description:
      "Earn real rewards by completing surveys, tasks, and offers. Join Rewardoxy and start earning today.",
    images: ["/logo.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          async
          defer
        ></script>
      </head>
      <body>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <NextTopLoader color="#01D676" showSpinner={false} />
            {children}
            <ToastContainer
              autoClose={3000}
              position="top-right"
              theme="dark"
              pauseOnHover
              newestOnTop
              hideProgressBar
            />
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
