import { requireAdmin } from "@/lib/admin-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { adminSupabase } = await requireAdmin();

    const { data, error } = await adminSupabase
      .from("app_settings")
      .select("*")
      .order("setting_key");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, settings: data });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unauthorized" },
      { status: 401 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { adminSupabase } = await requireAdmin();
    const { setting_key, setting_value } = await request.json();

    if (!setting_key) {
      return NextResponse.json(
        { error: "setting_key is required" },
        { status: 400 }
      );
    }

    const { data, error } = await adminSupabase
      .from("app_settings")
      .update({
        setting_value: String(setting_value),
        updated_at: new Date().toISOString(),
      })
      .eq("setting_key", setting_key)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, setting: data[0] });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unauthorized" },
      { status: 401 }
    );
  }
}
