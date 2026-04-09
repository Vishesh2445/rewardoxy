import { Suspense } from "react";
import SignupClient from "@/components/signup-client";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://rewardoxy.app/auth/signup",
  },
};

export default function SignupPage() {
  return (
    <Suspense>
      <SignupClient />
    </Suspense>
  );
}
