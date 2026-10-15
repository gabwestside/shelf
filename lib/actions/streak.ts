"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { MediaCategory, StreakStats } from "@/types/media";
import { getTodayInFortaleza } from "@/lib/date";

export async function getCategoryStreak(category: MediaCategory): Promise<StreakStats> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { current_streak: 0, max_streak: 0, total_days: 0, logged_today: false };
  }

  const todayStr = getTodayInFortaleza();

  const { data, error } = await supabase.rpc("calculate_streak", {
    p_user_id: user.id,
    p_category: category,
    p_today_date: todayStr,
  });

  if (error || !data || data.length === 0) {
    console.warn("Erro ao calcular streak RPC:", error);
    return { current_streak: 0, max_streak: 0, total_days: 0, logged_today: false };
  }

  const stat = data[0];
  return {
    current_streak: Number(stat.current_streak || 0),
    max_streak: Number(stat.max_streak || 0),
    total_days: Number(stat.total_days || 0),
    logged_today: Boolean(stat.logged_today),
  };
}

export async function logDailyActivity(
  category: MediaCategory,
  itemId?: string | null
): Promise<{ success: boolean; stats: StreakStats; isNew: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuário não autenticado.");

  const todayStr = getTodayInFortaleza();

  // Verifica se já registrou hoje
  const { data: existing } = await supabase
    .from("activity_logs")
    .select("id")
    .eq("user_id", user.id)
    .eq("category", category)
    .eq("activity_date", todayStr)
    .maybeSingle();

  let isNew = false;
  if (!existing) {
    const { error: insertError } = await supabase.from("activity_logs").insert({
      user_id: user.id,
      category,
      item_id: itemId || null,
      activity_date: todayStr,
    });

    if (insertError) {
      console.error("Erro ao registrar log de atividade:", insertError);
      throw new Error(`Falha ao registrar atividade: ${insertError.message}`);
    }
    isNew = true;
  }

  const path = category === "book" ? "livros" : category === "game" ? "jogos" : category === "movie" ? "filmes" : "series";
  revalidatePath(`/${path}`);

  const updatedStats = await getCategoryStreak(category);
  return { success: true, stats: updatedStats, isNew };
}

export async function getCategoryHeatmapDates(
  category: MediaCategory,
  daysCount: number = 90
): Promise<string[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const today = new Date(getTodayInFortaleza() + "T00:00:00Z");
  const pastDate = new Date(today);
  pastDate.setUTCDate(pastDate.getUTCDate() - daysCount);
  const pastDateStr = pastDate.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("activity_logs")
    .select("activity_date")
    .eq("user_id", user.id)
    .eq("category", category)
    .gte("activity_date", pastDateStr)
    .order("activity_date", { ascending: true });

  if (error || !data) return [];

  return data.map((d) => d.activity_date);
}
