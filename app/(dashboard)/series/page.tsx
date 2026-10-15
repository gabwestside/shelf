import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ShelfView } from "@/components/shelf/shelf-view";
import { StreakBanner } from "@/components/streak/streak-banner";
import { getCategoryStreak, getCategoryHeatmapDates } from "@/lib/actions/streak";
import { MediaItem } from "@/types/media";

export const metadata = {
  title: "Séries — Minha Estante",
  description: "Gerencie as séries que você quer assistir, está assistindo e já concluiu com streaks diários.",
};

export default async function SeriesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/series");
  }

  // Busca as séries do usuário
  const { data: rawItems, error } = await supabase
    .from("media_items")
    .select("*")
    .eq("category", "series")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao carregar séries:", error);
  }

  const items = (rawItems || []) as MediaItem[];

  // Busca dados de sequência e heatmap da categoria
  const [streakStats, heatmapDates] = await Promise.all([
    getCategoryStreak("series"),
    getCategoryHeatmapDates("series", 90),
  ]);

  return (
    <ShelfView
      initialItems={items}
      category="series"
      streakHeader={
        <StreakBanner
          category="series"
          initialStats={streakStats}
          initialHeatmapDates={heatmapDates}
        />
      }
    />
  );
}
