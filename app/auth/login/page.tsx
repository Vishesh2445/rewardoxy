import LoginClient from "@/components/login-client";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign In — Access Your Account",
  robots: { index: false, follow: true },
  alternates: {
    canonical: "https://www.rewardoxy.app/auth/login",
  },
};

export default function LoginPage() {
  return <LoginClient />;
}
