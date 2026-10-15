"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MediaItem, Review, CATEGORY_CONFIGS, MediaStatus } from "@/types/media";
import { updateMediaStatus, updateMediaRating, updateMediaDates, deleteMediaItem } from "@/lib/actions/media";
import { AutoSaveReviewEditor } from "@/components/review/auto-save-editor";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Calendar,
  Star,
  Trash2,
  ExternalLink,
  BookOpen,
  Check,
  Loader2,
} from "lucide-react";

interface ItemDetailViewProps {
  item: MediaItem;
  review?: Review | null;
}

export function ItemDetailView({ item, review }: ItemDetailViewProps) {
  const router = useRouter();
  const config = CATEGORY_CONFIGS[item.category];

  const [status, setStatus] = useState<MediaStatus>(item.status);
  const [rating, setRating] = useState<number | null>(item.rating ?? null);
  const [startedAt, setStartedAt] = useState<string>(
    item.started_at ? item.started_at.slice(0, 10) : ""
  );
  const [finishedAt, setFinishedAt] = useState<string>(
    item.finished_at ? item.finished_at.slice(0, 10) : ""
  );
  const [savingDates, setSavingDates] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleStatusChange = async (newStatus: MediaStatus) => {
    setStatus(newStatus);
    try {
      await updateMediaStatus(item.id, newStatus, item.category);
    } catch (err) {
      console.error("Erro ao alterar status:", err);
    }
  };

  const handleRatingChange = async (newRating: number) => {
    const val = rating === newRating ? null : newRating;
    setRating(val);
    try {
      await updateMediaRating(item.id, val, item.category);
    } catch (err) {
      console.error("Erro ao alterar nota:", err);
    }
  };

  const handleSaveDates = async (start: string, finish: string) => {
    try {
      setSavingDates(true);
      await updateMediaDates(
        item.id,
        {
          started_at: start ? new Date(start).toISOString() : null,
          finished_at: finish ? new Date(finish).toISOString() : null,
        },
        item.category
      );
    } catch (err) {
      console.error("Erro ao salvar datas:", err);
    } finally {
      setSavingDates(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Tem certeza que deseja remover "${item.title}" da sua estante?`)) return;

    try {
      setDeleting(true);
      await deleteMediaItem(item.id, item.category);
      router.push(config.path);
    } catch (err) {
      console.error("Erro ao deletar:", err);
      setDeleting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* Navegação de Volta */}
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm" className="gap-2 text-slate-400 hover:text-white">
          <Link href={config.path}>
            <ArrowLeft className="h-4 w-4" />
            Voltar para {config.label}
          </Link>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={deleting}
          className="gap-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
        >
          {deleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          Remover
        </Button>
      </div>

      {/* Cartão de Detalhes Principal */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 rounded-3xl border border-sky-500/20 bg-slate-950/80 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
        {/* Coluna da Capa */}
        <div className="md:col-span-4 flex flex-col items-center">
          <div className="relative w-full max-w-[260px] aspect-[2/3] rounded-2xl overflow-hidden bg-slate-900 border border-sky-400/40 shadow-2xl shadow-sky-500/30">
            {item.cover_url ? (
              <img
                src={item.cover_url}
                alt={item.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center p-4 text-center text-slate-500 font-medium">
                Sem capa
              </div>
            )}
          </div>
        </div>

        {/* Coluna de Metadados e Controles */}
        <div className="md:col-span-8 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="default" className="text-xs">
                {config.singular}
              </Badge>
              {item.year && (
                <Badge variant="secondary" className="text-xs">
                  {item.year}
                </Badge>
              )}
              {item.external_source && (
                <Badge variant="outline" className="text-xs text-slate-400">
                  {item.external_source}
                </Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {item.title}
            </h1>

            {item.creator && (
              <p className="text-sm sm:text-base font-medium text-sky-300">
                por {item.creator}
              </p>
            )}

            {item.synopsis && (
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-2 line-clamp-6">
                {item.synopsis}
              </p>
            )}
          </div>

          {/* Seletor de Status */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="text-xs font-semibold text-slate-300">
              Status Atual
            </label>
            <div className="flex flex-wrap gap-2">
              {config.statuses.map((st) => (
                <button
                  key={st.status}
                  type="button"
                  onClick={() => handleStatusChange(st.status)}
                  className={`rounded-xl px-4 py-2 text-xs font-semibold border transition-all cursor-pointer ${
                    status === st.status
                      ? "bg-sky-500 text-white border-sky-400 shadow-lg shadow-sky-500/30 scale-105"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Avaliação (Nota 0 a 10) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Sua Nota
              </label>
              <span className="text-xs font-bold text-amber-400">
                {rating !== null ? `${rating} / 10` : "Não avaliado"}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingChange(star)}
                  className={`h-8 w-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                    rating !== null && star <= rating
                      ? "bg-amber-500/25 text-amber-300 border border-amber-500/50 shadow-sm"
                      : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  {star}
                </button>
              ))}
            </div>
          </div>

          {/* Datas de Acompanhamento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-sky-400" />
                Data de Início
              </label>
              <Input
                type="date"
                value={startedAt}
                onChange={(e) => {
                  setStartedAt(e.target.value);
                  handleSaveDates(e.target.value, finishedAt);
                }}
                className="bg-slate-900/70 border-slate-800 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-emerald-400" />
                Data de Conclusão
              </label>
              <Input
                type="date"
                value={finishedAt}
                onChange={(e) => {
                  setFinishedAt(e.target.value);
                  handleSaveDates(startedAt, e.target.value);
                }}
                className="bg-slate-900/70 border-slate-800 text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Resenha & Anotações com Auto-save */}
      <AutoSaveReviewEditor
        itemId={item.id}
        initialContent={review?.content || ""}
        initialIsPublic={review?.is_public || false}
      />
    </div>
  );
}
