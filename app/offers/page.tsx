import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Info } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OffersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const baseUrl = process.env.NEXT_PUBLIC_MYLEAD_WALL_URL!;
  const iframeSrc = `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}uid=${user.id}`;

  return (
    <div className="flex h-screen flex-col bg-zinc-950 text-zinc-100">
      {/* Info banner */}
      <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/80 px-4 py-3">
        <Info className="h-4 w-4 shrink-0 text-emerald-400" />
        <p className="text-sm text-zinc-400">
          Coins appear within 5 minutes after completing an offer
        </p>
      </div>

      {/* Offerwall iframe */}
      <iframe
        src={iframeSrc}
        title="Offers"
        className="flex-1 border-none"
        allow="clipboard-write"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-top-navigation"
      />
    </div>
  );
}
