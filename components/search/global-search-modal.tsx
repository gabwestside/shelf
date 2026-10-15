"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, Loader2, BookOpen, Gamepad2, Film, Tv, Sparkles, ExternalLink } from "lucide-react";
import { MediaCategory, CATEGORY_CONFIGS, ExternalSearchResult } from "@/types/media";

interface GlobalSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearchModal({ open, onOpenChange }: GlobalSearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<MediaCategory>("book");
  const [results, setResults] = useState<ExternalSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Tecla de atalho Ctrl+K / Cmd+K para abrir busca global
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onOpenChange]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const handler = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&category=${category}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error("Erro na busca global:", err);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [query, category]);

  const categories: { cat: MediaCategory; label: string; icon: any }[] = [
    { cat: "book", label: "Livros", icon: BookOpen },
    { cat: "game", label: "Jogos", icon: Gamepad2 },
    { cat: "movie", label: "Filmes", icon: Film },
    { cat: "series", label: "Séries", icon: Tv },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-lg font-bold">
            <span className="flex items-center gap-2">
              <Search className="h-5 w-5 text-sky-400" />
              Busca Global de Conteúdo
            </span>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
              ESC para fechar
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* Abas de Categorias */}
        <div className="flex items-center gap-2 pt-2 border-b border-slate-800 pb-3">
          {categories.map((c) => {
            const Icon = c.icon;
            const isActive = category === c.cat;
            return (
              <button
                key={c.cat}
                type="button"
                onClick={() => setCategory(c.cat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  isActive
                    ? "bg-sky-500 text-white border-sky-400 shadow-md shadow-sky-500/25"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Campo de Busca */}
        <div className="relative my-2">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder={`Buscar ${CATEGORY_CONFIGS[category].label.toLowerCase()} por título, criador ou sinopse...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-11 bg-slate-900 border-slate-700"
            autoFocus
          />
          {loading && (
            <Loader2 className="absolute right-3.5 top-3.5 h-4 w-4 animate-spin text-sky-400" />
          )}
        </div>

        {/* Resultados */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 -mr-1 min-h-[260px]">
          {loading && results.length === 0 && (
            <div className="flex flex-col items-center justify-center h-44 text-slate-400 space-y-2">
              <Loader2 className="h-6 w-6 animate-spin text-sky-400" />
              <p className="text-xs">Consultando catálogos...</p>
            </div>
          )}

          {!loading && results.length === 0 && query.length >= 2 && (
            <div className="flex flex-col items-center justify-center h-44 text-slate-500 text-xs">
              Nenhum resultado encontrado nesta categoria.
            </div>
          )}

          {results.map((item) => (
            <div
              key={`${item.source}-${item.externalId}`}
              onClick={() => {
                onOpenChange(false);
                router.push(CATEGORY_CONFIGS[category].path);
              }}
              className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-sky-500/40 hover:bg-slate-900 transition-all cursor-pointer group"
            >
              <div className="h-14 w-10 shrink-0 rounded-lg overflow-hidden bg-slate-800">
                {item.coverUrl ? (
                  <img
                    src={item.coverUrl}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-[9px] text-slate-500">
                    Capa
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors truncate">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-400 truncate">
                  {item.creator} {item.year ? `• ${item.year}` : ""}
                </p>
              </div>

              <span className="text-xs text-sky-400 font-semibold group-hover:underline flex items-center gap-1">
                Ir à seção <ExternalLink className="h-3 w-3" />
              </span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
