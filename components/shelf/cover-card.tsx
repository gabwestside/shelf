"use client";

import React, { useRef } from "react";
import { MediaItem, CATEGORY_CONFIGS } from "@/types/media";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface CoverCardProps {
  item: MediaItem;
  isActive?: boolean;
  onClick?: () => void;
  onLongPress?: () => void;
  className?: string;
}

export function CoverCard({
  item,
  isActive = false,
  onClick,
  onLongPress,
  className,
}: CoverCardProps) {
  const config = CATEGORY_CONFIGS[item.category];
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);

  const statusLabel =
    config.statuses.find((s) => s.status === item.status)?.label || item.status;

  const handleTouchStart = () => {
    isLongPressRef.current = false;
    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      onLongPress?.();
    }, 500);
  };

  const handleTouchEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isLongPressRef.current) {
      e.preventDefault();
      return;
    }
    onClick?.();
  };

  const aspectRatioClass =
    config.aspectRatio === "3/4" ? "aspect-[3/4]" : "aspect-[2/3]";

  return (
    <div
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      className={cn(
        "group relative flex flex-col items-center cursor-pointer select-none transition-all duration-300",
        className
      )}
    >
      {/* Container da Capa */}
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-2xl bg-slate-900 border transition-all duration-300 shadow-xl",
          aspectRatioClass,
          isActive
            ? "border-sky-400 ring-4 ring-sky-400/25 shadow-2xl shadow-sky-500/40 launcher-cover-active"
            : "border-slate-800/80 group-hover:border-slate-600 launcher-cover-ambient"
        )}
      >
        {item.cover_url ? (
          <img
            src={item.cover_url}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-b from-slate-800 to-slate-950 p-4 text-center">
            <span className="text-xs font-semibold text-slate-300 line-clamp-3">
              {item.title}
            </span>
            <span className="text-[10px] text-slate-500 mt-1">Sem imagem</span>
          </div>
        )}

        {/* Gradiente sutil inferior na capa */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Badge de Nota no canto superior direito */}
        {item.rating !== null && item.rating !== undefined && (
          <div className="absolute top-2 right-2 flex items-center gap-1 rounded-lg bg-black/75 px-1.5 py-0.5 text-[11px] font-bold text-amber-300 backdrop-blur-md border border-amber-500/30 shadow-md">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span>{Number(item.rating).toFixed(1)}</span>
          </div>
        )}

        {/* Badge de Status no canto inferior esquerdo */}
        <div className="absolute bottom-2 left-2">
          <Badge
            variant={
              item.status === "completed"
                ? "status"
                : item.status === "in_progress"
                ? "streak"
                : "secondary"
            }
            className="text-[10px] py-0 px-2 backdrop-blur-md shadow"
          >
            {statusLabel}
          </Badge>
        </div>
      </div>

      {/* Título abaixo da capa */}
      <div className="mt-3 w-full text-center px-1">
        <h3
          className={cn(
            "text-sm font-bold tracking-tight line-clamp-1 transition-colors",
            isActive ? "text-white" : "text-slate-300 group-hover:text-white"
          )}
          title={item.title}
        >
          {item.title}
        </h3>
        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
          {item.creator || "Autor desconhecido"}
          {item.year ? ` • ${item.year}` : ""}
        </p>
      </div>
    </div>
  );
}
