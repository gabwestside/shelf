"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MediaCategory,
  MediaStatus,
  CATEGORY_CONFIGS,
  ExternalSearchResult,
} from "@/types/media";
import { addMediaItem } from "@/lib/actions/media";
import { ManualEntryDialog } from "./manual-entry-dialog";
import {
  Search,
  Loader2,
  BookOpen,
  Plus,
  Check,
  PenSquare,
  Sparkles,
} from "lucide-react";

interface SearchModalProps {
  category: MediaCategory;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function SearchModal({
  category,
  open,
  onOpenChange,
  onSuccess,
}: SearchModalProps) {
  const config = CATEGORY_CONFIGS[category];
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ExternalSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [manualOpen, setManualOpen] = useState(false);

  // Debounce de 400ms na busca
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      setLoading(false);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    const handler = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query.trim())}&category=${category}`
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error("Erro na busca:", err);
        setResults([]);
      } finally {
        setLoading(false);
        setHasSearched(true);
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [query, category]);

  const handleAdd = async (
    item: ExternalSearchResult,
    status: MediaStatus = "wishlist"
  ) => {
    try {
      setAddingId(item.externalId);
      await addMediaItem({
        category,
        external_id: item.externalId,
        external_source: item.source,
        title: item.title,
        cover_url: item.coverUrl,
        synopsis: item.synopsis,
        year: item.year,
        creator: item.creator,
        status,
      });

      setAddedIds((prev) => new Set(prev).add(item.externalId));
      onSuccess?.();
    } catch (err) {
      console.error("Erro ao adicionar:", err);
    } finally {
      setAddingId(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <Search className="h-5 w-5 text-sky-400" />
              Adicionar {config.singular} à Estante
            </DialogTitle>
          </DialogHeader>

          {/* Campo de Busca */}
          <div className="relative my-2">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder={`Digite o título, autor ou palavra-chave para buscar ${config.label.toLowerCase()}...`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 h-11 bg-slate-900 border-slate-700 focus-visible:ring-sky-400"
              autoFocus
            />
            {loading && (
              <Loader2 className="absolute right-3.5 top-3.5 h-4 w-4 animate-spin text-sky-400" />
            )}
          </div>

          {/* Lista de Resultados */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 -mr-1 min-h-[300px]">
            {loading && results.length === 0 && (
              <div className="flex flex-col items-center justify-center h-52 text-slate-400 space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
                <p className="text-sm">Consultando catálogos online...</p>
              </div>
            )}

            {!loading && hasSearched && results.length === 0 && (
              <div className="flex flex-col items-center justify-center h-52 text-center p-6 space-y-3">
                <BookOpen className="h-10 w-10 text-slate-600" />
                <p className="text-sm text-slate-300 font-medium">
                  Nenhum resultado encontrado para &quot;{query}&quot;
                </p>
                <p className="text-xs text-slate-500 max-w-xs">
                  Você pode tentar termos mais simples ou adicionar este item manualmente.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onOpenChange(false);
                    setManualOpen(true);
                  }}
                  className="gap-2 border-sky-500/30 text-sky-300"
                >
                  <PenSquare className="h-4 w-4" /> Cadastrar Manualmente
                </Button>
              </div>
            )}

            {!loading && !hasSearched && query.length < 2 && (
              <div className="flex flex-col items-center justify-center h-52 text-center p-6 space-y-2">
                <Sparkles className="h-10 w-10 text-sky-500/40" />
                <p className="text-sm text-slate-400">
                  Comece a digitar para buscar nos catálogos mundiais.
                </p>
              </div>
            )}

            {results.map((item) => {
              const isAdded = addedIds.has(item.externalId);
              const isAdding = addingId === item.externalId;

              return (
                <div
                  key={`${item.source}-${item.externalId}`}
                  className="flex items-center gap-4 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all"
                >
                  {/* Capa */}
                  <div className="h-20 w-14 shrink-0 rounded-lg overflow-hidden bg-slate-800 shadow-md relative">
                    {item.coverUrl ? (
                      <img
                        src={item.coverUrl}
                        alt={item.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-[10px] text-slate-500 text-center p-1 font-medium">
                        Sem capa
                      </div>
                    )}
                  </div>

                  {/* Informações */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-400 truncate">
                      {item.creator || "Autor desconhecido"}
                      {item.year ? ` • ${item.year}` : ""}
                    </p>
                    {item.synopsis && (
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                        {item.synopsis}
                      </p>
                    )}
                  </div>

                  {/* Ações de Adicionar */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isAdded ? (
                      <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/25">
                        <Check className="h-3.5 w-3.5" /> Adicionado
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="glow"
                          disabled={isAdding}
                          onClick={() => handleAdd(item, "wishlist")}
                          className="text-xs h-8 px-2.5 rounded-lg"
                          title="Adicionar como Quero ler / Quero assistir"
                        >
                          {isAdding ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Plus className="h-3.5 w-3.5 mr-1" />
                          )}
                          {config.statuses[0].label}
                        </Button>
                        {config.statuses.length > 2 && (
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={isAdding}
                            onClick={() => handleAdd(item, "in_progress")}
                            className="text-xs h-8 px-2 rounded-lg"
                            title="Adicionar como Lendo / Jogando"
                          >
                            {config.statuses[1].label}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rodapé do Modal */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Não encontrou o que procurava?</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onOpenChange(false);
                setManualOpen(true);
              }}
              className="gap-1.5 border-slate-700 text-slate-300 hover:text-white"
            >
              <PenSquare className="h-3.5 w-3.5 text-sky-400" /> Cadastrar manualmente
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ManualEntryDialog
        category={category}
        open={manualOpen}
        onOpenChange={setManualOpen}
        onSuccess={onSuccess}
      />
    </>
  );
}
