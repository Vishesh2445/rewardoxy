import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdminApi } from "@/lib/admin-auth";

// Get all password reset tokens
export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const adminCheck = await requireAdminApi();
    
    if ("error" in adminCheck) {
      return adminCheck.error;
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const status = searchParams.get("status"); // 'pending', 'used', 'all'

    // Create admin client
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

    let query = supabaseAdmin
      .from("password_reset_tokens")
      .select(`
        id,
        user_id,
        token,
        expires_at,
        used_at,
        created_at,
        users:user_id (
          email,
          display_name
        )
      `)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status === "pending") {
      query = query.is("used_at", null).gt("expires_at", new Date().toISOString());
    } else if (status === "used") {
      query = query.not("used_at", "is", null);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching password resets:", error);
      return NextResponse.json(
        { error: "Failed to fetch password resets" },
        { status: 500 }
      );
    }

    // Get total count
    let countQuery = supabaseAdmin
      .from("password_reset_tokens")
      .select("*", { count: "exact", head: true });

    if (status === "pending") {
      countQuery = countQuery.is("used_at", null).gt("expires_at", new Date().toISOString());
    } else if (status === "used") {
      countQuery = countQuery.not("used_at", "is", null);
    }

    const { count } = await countQuery;

    return NextResponse.json({
      password_resets: data,
      total: count || 0,
      limit,
      offset
    });
  } catch (error) {
    console.error("Admin password resets error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Invalidate a password reset token (admin action)
export async function DELETE(request: NextRequest) {
  try {
    // Check if user is admin
    const adminCheck = await requireAdminApi();
    
    if ("error" in adminCheck) {
      return adminCheck.error;
    }

    const body = await request.json();
    const { token_id } = body as { token_id: string };

    if (!token_id) {
      return NextResponse.json(
        { error: "Token ID is required" },
        { status: 400 }
      );
    }

    // Create admin client
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

    // Delete the token
    const { error } = await supabaseAdmin
      .from("password_reset_tokens")
      .delete()
      .eq("id", token_id);

    if (error) {
      console.error("Error deleting password reset token:", error);
      return NextResponse.json(
        { error: "Failed to delete token" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin password reset delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
