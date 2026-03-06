import { Suspense } from "react";
import SignupClient from "@/components/signup-client";

export const dynamic = "force-dynamic";

export default function SignupPage() {
  return (
    <Suspense>
      <SignupClient />
    </Suspense>
  );
}
