import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * For server pages: verifies the current user is an admin.
 * Redirects to /auth/login if not authenticated, /earn if not admin.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const adminSupabase = createAdminClient();
  const { data: userData } = await adminSupabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!userData || userData.role !== "admin") {
    redirect("/earn");
  }

  return { user, adminSupabase };
}

/**
 * For API routes: returns { user, adminSupabase } or { error: Response }.
 */
export async function requireAdminApi(): Promise<
  | { user: { id: string; email?: string }; adminSupabase: ReturnType<typeof createAdminClient>; error?: never }
  | { error: Response; user?: never; adminSupabase?: never }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }

  const adminSupabase = createAdminClient();
  const { data: userData } = await adminSupabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!userData || userData.role !== "admin") {
    return {
      error: new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }

  return { user, adminSupabase };
}
