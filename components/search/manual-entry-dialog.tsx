"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MediaCategory, MediaStatus, CATEGORY_CONFIGS } from "@/types/media";
import { addMediaItem } from "@/lib/actions/media";
import { Loader2, Plus, Sparkles } from "lucide-react";

interface ManualEntryDialogProps {
  category: MediaCategory;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ManualEntryDialog({
  category,
  open,
  onOpenChange,
  onSuccess,
}: ManualEntryDialogProps) {
  const config = CATEGORY_CONFIGS[category];
  const [title, setTitle] = useState("");
  const [creator, setCreator] = useState("");
  const [year, setYear] = useState<string>("");
  const [coverUrl, setCoverUrl] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [status, setStatus] = useState<MediaStatus>("wishlist");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("O título é obrigatório.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await addMediaItem({
        category,
        title: title.trim(),
        creator: creator.trim() || null,
        year: year ? parseInt(year, 10) : null,
        cover_url: coverUrl.trim() || null,
        synopsis: synopsis.trim() || null,
        status,
        external_source: "manual",
      });

      // Limpa campos e fecha
      setTitle("");
      setCreator("");
      setYear("");
      setCoverUrl("");
      setSynopsis("");
      setStatus("wishlist");
      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-sky-400" />
            Cadastrar {config.singular} Manualmente
          </DialogTitle>
          <DialogDescription>
            Preencha as informações do item para adicioná-lo à sua estante.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-xl bg-rose-500/15 border border-rose-500/30 p-3 text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Título *
            </label>
            <Input
              placeholder={`Nome do ${config.singular.toLowerCase()}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                {category === "book"
                  ? "Autor(a)"
                  : category === "game"
                  ? "Estúdio / Dev"
                  : "Diretor(a)"}
              </label>
              <Input
                placeholder="Ex: J.K. Rowling"
                value={creator}
                onChange={(e) => setCreator(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Ano de Lançamento
              </label>
              <Input
                type="number"
                placeholder="Ex: 2024"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              URL da Imagem de Capa
            </label>
            <Input
              type="url"
              placeholder="https://exemplo.com/capa.jpg"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Status Inicial
            </label>
            <div className="flex gap-2">
              {config.statuses.map((st) => (
                <button
                  key={st.status}
                  type="button"
                  onClick={() => setStatus(st.status)}
                  className={`flex-1 rounded-xl py-2 text-xs font-medium border transition-all ${
                    status === st.status
                      ? "bg-sky-500/20 border-sky-400 text-sky-200"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Sinopse / Descrição
            </label>
            <Textarea
              placeholder="Breve resumo da obra..."
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="glow" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Salvando...
                </span>
              ) : (
                "Adicionar à Estante"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
