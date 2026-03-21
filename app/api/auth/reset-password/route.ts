import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body as { token: string; password: string };

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and new password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Create a dedicated admin client with service role
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Find the reset token
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from("password_reset_tokens")
      .select("id, user_id, expires_at, used_at")
      .eq("token", token)
      .single();

    if (tokenError || !tokenData) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Check if token is already used
    if (tokenData.used_at) {
      return NextResponse.json(
        { error: "This reset link has already been used" },
        { status: 400 }
      );
    }

    // Check if token is expired
    const expiresAt = new Date(tokenData.expires_at);
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { error: "This reset link has expired" },
        { status: 400 }
      );
    }

    // Update the user's password using admin API
    // Using type assertion as the TypeScript definitions may be incomplete
    const { error: updateError } = await (supabaseAdmin.auth.admin as any).updateUser(
      tokenData.user_id,
      { password }
    );

    if (updateError) {
      console.error("Error updating password:", updateError);
      return NextResponse.json(
        { error: "Failed to update password" },
        { status: 500 }
      );
    }

    // Mark token as used
    await supabaseAdmin
      .from("password_reset_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("id", tokenData.id);

    // Log the password change for admin panel
    await supabaseAdmin.from("notifications").insert({
      user_id: tokenData.user_id,
      title: "Password Changed",
      message: "Your password has been successfully changed.",
      read: false,
    });

    return NextResponse.json({ 
      success: true, 
      message: "Password has been reset successfully" 
    });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}

// Verify token is valid
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    // Create a dedicated admin client with service role
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Find the reset token
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from("password_reset_tokens")
      .select("id, user_id, expires_at, used_at")
      .eq("token", token)
      .single();

    if (tokenError || !tokenData) {
      return NextResponse.json(
        { valid: false, error: "Invalid reset token" },
        { status: 400 }
      );
    }

    // Check if token is already used
    if (tokenData.used_at) {
      return NextResponse.json(
        { valid: false, error: "This reset link has already been used" },
        { status: 400 }
      );
    }

    // Check if token is expired
    const expiresAt = new Date(tokenData.expires_at);
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { valid: false, error: "This reset link has expired" },
        { status: 400 }
      );
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json(
      { valid: false, error: "Failed to verify token" },
      { status: 500 }
    );
  }
}
