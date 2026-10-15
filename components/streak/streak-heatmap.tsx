"use client";

import React, { useMemo } from "react";
import { getLastNDaysInFortaleza, formatDatePtBR, getTodayInFortaleza } from "@/lib/date";
import { Flame } from "lucide-react";

interface StreakHeatmapProps {
  loggedDates: string[];
  daysCount?: number;
}

export function StreakHeatmap({
  loggedDates,
  daysCount = 90,
}: StreakHeatmapProps) {
  const todayStr = getTodayInFortaleza();
  const dateSet = useMemo(() => new Set(loggedDates), [loggedDates]);

  // Obtém lista ordenada dos últimos N dias
  const days = useMemo(() => getLastNDaysInFortaleza(daysCount), [daysCount]);

  // Agrupa os dias em semanas de 7 dias para formar a grade clássica de contribuições
  const weeks = useMemo(() => {
    const cols: string[][] = [];
    let currentWeek: string[] = [];

    days.forEach((day, idx) => {
      currentWeek.push(day);
      if (currentWeek.length === 7 || idx === days.length - 1) {
        cols.push(currentWeek);
        currentWeek = [];
      }
    });

    return cols;
  }, [days]);

  const activeCount = useMemo(() => {
    return days.filter((d) => dateSet.has(d)).length;
  }, [days, dateSet]);

  return (
    <div className="w-full rounded-2xl border border-sky-500/15 bg-slate-950/60 p-4 backdrop-blur-md space-y-3">
      {/* Topo do Heatmap */}
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-300 flex items-center gap-1.5">
          <Flame className="h-4 w-4 text-orange-400" />
          Atividade nos últimos {daysCount} dias
        </span>
        <span className="text-slate-400">
          <strong className="text-sky-300">{activeCount}</strong> {activeCount === 1 ? "dia ativo" : "dias ativos"}
        </span>
      </div>

      {/* Grade Horizontal de Quadrados (Heatmap) */}
      <div className="overflow-x-auto no-scrollbar py-1">
        <div className="flex gap-1.5 min-w-max">
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1.5">
              {week.map((dateStr) => {
                const isLogged = dateSet.has(dateStr);
                const isToday = dateStr === todayStr;

                return (
                  <div
                    key={dateStr}
                    title={`${formatDatePtBR(dateStr)}${
                      isLogged ? " — Atividade registrada! 🔥" : " — Sem atividade"
                    }`}
                    className={`h-3.5 w-3.5 rounded-[4px] transition-all cursor-pointer ${
                      isLogged
                        ? "bg-gradient-to-tr from-orange-500 to-amber-400 shadow-sm shadow-orange-500/50 hover:scale-125"
                        : "bg-slate-900 border border-slate-800/80 hover:bg-slate-800"
                    } ${isToday ? "ring-2 ring-sky-400 ring-offset-1 ring-offset-slate-950" : ""}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legenda */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800/60">
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-[2px] ring-1 ring-sky-400" />
          <span>Hoje</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>Sem atividade</span>
          <div className="h-2.5 w-2.5 rounded-[3px] bg-slate-900 border border-slate-800" />
          <div className="h-2.5 w-2.5 rounded-[3px] bg-gradient-to-tr from-orange-500 to-amber-400 shadow-xs" />
          <span>Ativo 🔥</span>
        </div>
      </div>
    </div>
  );
}
