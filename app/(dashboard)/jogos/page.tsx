import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ShelfView } from "@/components/shelf/shelf-view";
import { StreakBanner } from "@/components/streak/streak-banner";
import { getCategoryStreak, getCategoryHeatmapDates } from "@/lib/actions/streak";
import { MediaItem } from "@/types/media";

export const metadata = {
  title: "Jogos — Minha Estante",
  description: "Gerencie os jogos que você quer jogar, está jogando e já zerou com streaks diários.",
};

export default async function JogosPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/jogos");
  }

  // Busca os jogos do usuário
  const { data: rawItems, error } = await supabase
    .from("media_items")
    .select("*")
    .eq("category", "game")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao carregar jogos:", error);
  }

  const items = (rawItems || []) as MediaItem[];

  // Busca dados de sequência e heatmap da categoria
  const [streakStats, heatmapDates] = await Promise.all([
    getCategoryStreak("game"),
    getCategoryHeatmapDates("game", 90),
  ]);

  return (
    <ShelfView
      initialItems={items}
      category="game"
      streakHeader={
        <StreakBanner
          category="game"
          initialStats={streakStats}
          initialHeatmapDates={heatmapDates}
        />
      }
    />
  );
}
