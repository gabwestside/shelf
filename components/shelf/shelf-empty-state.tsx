"use client";

import React from "react";
import { MediaCategory, CATEGORY_CONFIGS } from "@/types/media";
import { Button } from "@/components/ui/button";
import { BookOpen, Gamepad2, Film, Tv, Plus, Search } from "lucide-react";

interface ShelfEmptyStateProps {
  category: MediaCategory;
  onOpenSearch: () => void;
  isFiltered?: boolean;
}

export function ShelfEmptyState({
  category,
  onOpenSearch,
  isFiltered = false,
}: ShelfEmptyStateProps) {
  const config = CATEGORY_CONFIGS[category];

  const Icon = {
    book: BookOpen,
    game: Gamepad2,
    movie: Film,
    series: Tv,
  }[category];

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-3xl border border-dashed border-sky-500/20 bg-slate-950/40 backdrop-blur-sm my-6 max-w-xl mx-auto">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 mb-4 shadow-lg shadow-sky-500/10">
        <Icon className="h-8 w-8" />
      </div>

      <h3 className="text-xl font-bold text-white">
        {isFiltered
          ? `Nenhum ${config.singular.toLowerCase()} encontrado com este filtro`
          : `Sua estante de ${config.label.toLowerCase()} está vazia`}
      </h3>

      <p className="text-xs sm:text-sm text-slate-400 max-w-md mt-1.5 mb-6">
        {isFiltered
          ? "Tente ajustar a busca ou o status selecionado para ver outros itens."
          : `Pesquise títulos online ou faça um cadastro manual para começar a organizar o que você consome.`}
      </p>

      {!isFiltered && (
        <Button onClick={onOpenSearch} variant="glow" className="gap-2 h-11 px-6">
          <Plus className="h-4 w-4" />
          Adicionar Primeiro {config.singular}
        </Button>
      )}
    </div>
  );
}
