"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MediaItem, CATEGORY_CONFIGS, MediaStatus } from "@/types/media";
import { updateMediaStatus, updateMediaRating, deleteMediaItem } from "@/lib/actions/media";
import {
  FileText,
  Trash2,
  Star,
  CheckCircle2,
  Calendar,
  ExternalLink,
  Loader2,
  Sparkles,
} from "lucide-react";

interface ShelfActionsModalProps {
  item: MediaItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onItemUpdated?: () => void;
}

export function ShelfActionsModal({
  item,
  open,
  onOpenChange,
  onItemUpdated,
}: ShelfActionsModalProps) {
  if (!item) return null;

  const config = CATEGORY_CONFIGS[item.category];
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(item.rating ?? null);

  const handleStatusChange = async (newStatus: MediaStatus) => {
    try {
      setLoading(true);
      await updateMediaStatus(item.id, newStatus, item.category);
      onItemUpdated?.();
    } catch (err) {
      console.error("Erro ao alterar status:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = async (rating: number) => {
    try {
      const nextRating = selectedRating === rating ? null : rating;
      setSelectedRating(nextRating);
      await updateMediaRating(item.id, nextRating, item.category);
      onItemUpdated?.();
    } catch (err) {
      console.error("Erro ao atualizar nota:", err);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Tem certeza que deseja remover "${item.title}" da sua estante?`)) return;

    try {
      setDeleting(true);
      await deleteMediaItem(item.id, item.category);
      onOpenChange(false);
      onItemUpdated?.();
    } catch (err) {
      console.error("Erro ao deletar:", err);
    } finally {
      setDeleting(false);
    }
  };

  const detailPath = `${config.path}/${item.id}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader className="flex flex-row items-start gap-4 space-y-0">
          {/* Capa */}
          <div className="h-28 w-20 shrink-0 rounded-xl overflow-hidden bg-slate-900 border border-sky-500/20 shadow-lg">
            {item.cover_url ? (
              <img
                src={item.cover_url}
                alt={item.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-xs text-slate-500 p-1 text-center">
                Sem capa
              </div>
            )}
          </div>

          {/* Dados do item */}
          <div className="flex-1 min-w-0">
            <DialogTitle className="text-lg font-bold leading-snug text-white line-clamp-2">
              {item.title}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 mt-1">
              {item.creator || "Autor desconhecido"}
              {item.year ? ` • ${item.year}` : ""}
            </DialogDescription>
            {item.synopsis && (
              <p className="text-[11px] text-slate-400 line-clamp-2 mt-2">
                {item.synopsis}
              </p>
            )}
          </div>
        </DialogHeader>

        {/* Mudar Status */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-semibold text-slate-300">
            Status na Estante
          </label>
          <div className="grid grid-cols-3 gap-2">
            {config.statuses.map((st) => {
              const isActive = item.status === st.status;
              return (
                <button
                  key={st.status}
                  type="button"
                  disabled={loading}
                  onClick={() => handleStatusChange(st.status)}
                  className={`rounded-xl py-2 px-2 text-xs font-semibold border transition-all cursor-pointer ${
                    isActive
                      ? "bg-sky-500 text-white border-sky-400 shadow-lg shadow-sky-500/30"
                      : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                  }`}
                >
                  {st.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Avaliação Rápida (Estrelas / Nota) */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300">
              Sua Nota (0 a 10)
            </label>
            <span className="text-xs font-bold text-amber-400">
              {selectedRating !== null ? `${selectedRating}/10` : "Não avaliado"}
            </span>
          </div>
          <div className="flex items-center justify-between bg-slate-900/70 p-2 rounded-xl border border-slate-800">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingChange(star)}
                className={`h-7 w-7 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                  selectedRating !== null && star <= selectedRating
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"
                }`}
                title={`Nota ${star}`}
              >
                {star}
              </button>
            ))}
          </div>
        </div>

        {/* Ações Primárias */}
        <div className="flex flex-col gap-2 pt-3 border-t border-slate-800/80">
          <Button asChild variant="glow" className="w-full gap-2 h-11">
            <Link href={detailPath}>
              <FileText className="h-4 w-4" />
              Ver Detalhes & Escrever Resenha
            </Link>
          </Button>

          <Button
            variant="ghost"
            onClick={handleDelete}
            disabled={deleting}
            className="w-full gap-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 h-10"
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Remover da Estante
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
