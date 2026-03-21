import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/dashboard?verified=false&error=no_token", request.url));
  }

  const supabase = await createClient();

  // Find the token in the database
  const { data: tokenData, error: tokenError } = await supabase
    .from("email_verification_tokens")
    .select("id, user_id, expires_at")
    .eq("token", token)
    .single();

  if (tokenError || !tokenData) {
    return NextResponse.redirect(new URL("/dashboard?verified=false&error=invalid_token", request.url));
  }

  // Check if token has expired
  if (new Date(tokenData.expires_at) < new Date()) {
    // Delete expired token
    await supabase
      .from("email_verification_tokens")
      .delete()
      .eq("id", tokenData.id);

    return NextResponse.redirect(new URL("/dashboard?verified=false&error=expired_token", request.url));
  }

  // Update user's email_verified to true
  const { error: updateError } = await supabase
    .from("users")
    .update({ email_verified: true })
    .eq("id", tokenData.user_id);

  if (updateError) {
    console.error("Error updating email_verified:", updateError);
    return NextResponse.redirect(new URL("/dashboard?verified=false&error=update_failed", request.url));
  }

  // Delete the used token
  await supabase
    .from("email_verification_tokens")
    .delete()
    .eq("id", tokenData.id);

  // Redirect to dashboard with success
  return NextResponse.redirect(new URL("/dashboard?verified=true", request.url));
}