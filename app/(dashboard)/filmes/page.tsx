import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ShelfView } from "@/components/shelf/shelf-view";
import { StreakBanner } from "@/components/streak/streak-banner";
import { getCategoryStreak, getCategoryHeatmapDates } from "@/lib/actions/streak";
import { MediaItem } from "@/types/media";

export const metadata = {
  title: "Filmes — Minha Estante",
  description: "Gerencie os filmes que você quer assistir e já assistiu com streaks diários.",
};

export default async function FilmesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/filmes");
  }

  // Busca os filmes do usuário
  const { data: rawItems, error } = await supabase
    .from("media_items")
    .select("*")
    .eq("category", "movie")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao carregar filmes:", error);
  }

  const items = (rawItems || []) as MediaItem[];

  // Busca dados de sequência e heatmap da categoria
  const [streakStats, heatmapDates] = await Promise.all([
    getCategoryStreak("movie"),
    getCategoryHeatmapDates("movie", 90),
  ]);

  return (
    <ShelfView
      initialItems={items}
      category="movie"
      streakHeader={
        <StreakBanner
          category="movie"
          initialStats={streakStats}
          initialHeatmapDates={heatmapDates}
        />
      }
    />
  );
}
