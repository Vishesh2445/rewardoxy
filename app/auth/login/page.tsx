import LoginClient from "@/components/login-client";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://rewardoxy.app/auth/login",
  },
};

export default function LoginPage() {
  return <LoginClient />;
}
