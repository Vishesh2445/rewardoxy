import { Suspense } from "react";
import SignupClient from "@/components/signup-client";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign Up — Create Your Free Account",
  robots: { index: false, follow: true },
  alternates: {
    canonical: "https://www.rewardoxy.app/auth/signup",
  },
};

export default function SignupPage() {
  return (
    <Suspense>
      <SignupClient />
    </Suspense>
  );
}
