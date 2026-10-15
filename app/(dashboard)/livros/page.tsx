import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ShelfView } from "@/components/shelf/shelf-view";
import { StreakBanner } from "@/components/streak/streak-banner";
import { getCategoryStreak, getCategoryHeatmapDates } from "@/lib/actions/streak";
import { MediaItem } from "@/types/media";

export const metadata = {
  title: "Livros — Minha Estante",
  description: "Gerencie os livros que você quer ler, está lendo e já leu com streaks diários.",
};

export default async function LivrosPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/livros");
  }

  // Busca os livros do usuário
  const { data: rawItems, error } = await supabase
    .from("media_items")
    .select("*")
    .eq("category", "book")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao carregar livros:", error);
  }

  const items = (rawItems || []) as MediaItem[];

  // Busca dados de sequência e heatmap da categoria
  const [streakStats, heatmapDates] = await Promise.all([
    getCategoryStreak("book"),
    getCategoryHeatmapDates("book", 90),
  ]);

  return (
    <ShelfView
      initialItems={items}
      category="book"
      streakHeader={
        <StreakBanner
          category="book"
          initialStats={streakStats}
          initialHeatmapDates={heatmapDates}
        />
      }
    />
  );
}
