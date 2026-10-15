"use client";

import React, { useState } from "react";
import { MediaCategory, StreakStats, CATEGORY_CONFIGS } from "@/types/media";
import { logDailyActivity } from "@/lib/actions/streak";
import { triggerStreakCelebration } from "./streak-celebration";
import { StreakHeatmap } from "./streak-heatmap";
import { Button } from "@/components/ui/button";
import { Flame, Check, Calendar, ChevronDown, ChevronUp, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface StreakBannerProps {
  category: MediaCategory;
  initialStats: StreakStats;
  initialHeatmapDates: string[];
}

export function StreakBanner({
  category,
  initialStats,
  initialHeatmapDates,
}: StreakBannerProps) {
  const config = CATEGORY_CONFIGS[category];
  const [stats, setStats] = useState<StreakStats>(initialStats);
  const [heatmapDates, setHeatmapDates] = useState<string[]>(initialHeatmapDates);
  const [loading, setLoading] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);

  const handleCheckIn = async () => {
    if (stats.logged_today || loading) return;

    try {
      setLoading(true);
      const res = await logDailyActivity(category);
      if (res.success) {
        setStats(res.stats);
        if (res.isNew) {
          triggerStreakCelebration();
          // Adiciona a data atual no heatmap local
          const today = new Date().toISOString().slice(0, 10);
          setHeatmapDates((prev) => Array.from(new Set([...prev, today])));
        }
      }
    } catch (err) {
      console.error("Erro ao registrar atividade:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full rounded-3xl border border-sky-500/20 bg-gradient-to-r from-slate-950/90 via-slate-900/80 to-slate-950/90 p-4 sm:p-6 backdrop-blur-xl shadow-2xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Fogo e Contador de Sequência */}
        <div className="flex items-center gap-4">
          <motion.div
            animate={{
              scale: stats.current_streak > 0 ? [1, 1.08, 1] : 1,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-400 shadow-xl shadow-orange-500/30 text-white"
          >
            <Flame className="h-8 w-8 sm:h-9 sm:w-9 fill-white drop-shadow-md" />
          </motion.div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {stats.current_streak}{" "}
                <span className="text-lg sm:text-xl font-bold text-orange-400">
                  {stats.current_streak === 1 ? "dia" : "dias"}
                </span>
              </span>
              {stats.current_streak > 0 && (
                <span className="text-xs font-bold text-amber-300 bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded-full">
                  Sequência ativa 🔥
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Maior sequência: <strong className="text-slate-200">{stats.max_streak} dias</strong> •
              Total: <strong className="text-slate-200">{stats.total_days} dias</strong>
            </p>
          </div>
        </div>

        {/* Botão de Check-in Diário ("Li hoje" / "Joguei hoje") */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          {stats.logged_today ? (
            <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 px-4 py-2.5 text-xs font-bold text-emerald-300 shadow-sm">
              <Check className="h-4 w-4 text-emerald-400" />
              <span>{config.streakActionLabel} registrado hoje!</span>
            </div>
          ) : (
            <Button
              onClick={handleCheckIn}
              disabled={loading}
              variant="streak"
              className="h-11 px-5 rounded-2xl gap-2 font-bold text-sm"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Flame className="h-4 w-4 fill-white" />
              )}
              {config.streakActionLabel}
            </Button>
          )}

          {/* Botão para alternar exibição do Heatmap */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowHeatmap(!showHeatmap)}
            className="h-11 w-11 rounded-2xl border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white"
            title={showHeatmap ? "Ocultar calendário" : "Ver calendário dos últimos 90 dias"}
          >
            {showHeatmap ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <Calendar className="h-4 w-4 text-sky-400" />
            )}
          </Button>
        </div>
      </div>

      {/* Mini Calendário Heatmap Expansível */}
      {showHeatmap && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="pt-2 border-t border-slate-800/80"
        >
          <StreakHeatmap loggedDates={heatmapDates} daysCount={90} />
        </motion.div>
      )}
    </div>
  );
}
