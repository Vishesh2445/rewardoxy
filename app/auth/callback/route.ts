import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { randomBytes } from "crypto";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const ref = searchParams.get("ref");

  // Check for terms accepted cookie from Google OAuth signup
  const cookies = request.headers.get("cookie") || "";
  const termsAccepted = cookies.includes("oauth_terms_accepted=true");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // If this is a new OAuth user, insert into public.users
      if (user) {
        const admin = createAdminClient();
        const { data: existing } = await admin
          .from("users")
          .select("id")
          .eq("id", user.id)
          .single();

        if (!existing) {
          let referred_by_id: string | null = null;
          if (ref) {
            const { data: referrer } = await admin
              .from("users")
              .select("id")
              .eq("referral_code", ref)
              .single();
            if (referrer) {
              referred_by_id = referrer.id;
            }
          }

          await admin.from("users").insert({
            id: user.id,
            email: user.email,
            referral_code: randomBytes(4).toString("hex"),
            referred_by: referred_by_id,
            email_verified: true, // Google OAuth users are already verified
            accepted_terms: termsAccepted,
            accepted_at: termsAccepted ? new Date().toISOString() : null,
          });
        }

        // Update login streak for returning OAuth users
        await supabase.rpc("update_streak");
      }

      // Create response and clear cookie if terms were accepted
      const response = NextResponse.redirect(`${origin}/dashboard`);
      if (termsAccepted) {
        response.headers.append("Set-Cookie", "oauth_terms_accepted=; path=/; max-age=0");
      }
      return response;
    }
  }

  return NextResponse.redirect(`${origin}/auth/login`);
}
