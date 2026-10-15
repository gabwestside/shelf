"use client";

import React from "react";
import { MediaCategory, MediaStatus, CATEGORY_CONFIGS } from "@/types/media";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Plus, ArrowUpDown, Filter } from "lucide-react";

export type SortOption = "recent" | "title" | "rating" | "year";

interface ShelfHeaderProps {
  category: MediaCategory;
  itemCount: number;
  filterStatus: MediaStatus | "all";
  onFilterChange: (status: MediaStatus | "all") => void;
  searchFilter: string;
  onSearchFilterChange: (text: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  onOpenSearchModal: () => void;
}

export function ShelfHeader({
  category,
  itemCount,
  filterStatus,
  onFilterChange,
  searchFilter,
  onSearchFilterChange,
  sortBy,
  onSortChange,
  onOpenSearchModal,
}: ShelfHeaderProps) {
  const config = CATEGORY_CONFIGS[category];

  const sortLabels: Record<SortOption, string> = {
    recent: "Mais recentes",
    title: "Título (A–Z)",
    rating: "Maior nota",
    year: "Ano de lançamento",
  };

  return (
    <div className="w-full space-y-4">
      {/* Linha Principal: Título, Contador e Botão Adicionar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            {config.label}
            <span className="text-xs font-bold text-sky-400 bg-sky-500/15 border border-sky-500/30 px-2.5 py-0.5 rounded-full">
              {itemCount}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Gerencie sua coleção de {config.label.toLowerCase()} e acompanhe seu progresso.
          </p>
        </div>

        <Button
          onClick={onOpenSearchModal}
          variant="glow"
          className="gap-2 h-11 px-5 font-semibold text-sm rounded-xl self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Adicionar {config.singular}
        </Button>
      </div>

      {/* Linha de Filtros: Abas de Status, Busca Rápida e Ordenação */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1">
        {/* Filtros de Status (Pills) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            type="button"
            onClick={() => onFilterChange("all")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all border ${
              filterStatus === "all"
                ? "bg-sky-500 text-white border-sky-400 shadow-md shadow-sky-500/25"
                : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
            }`}
          >
            Todos
          </button>
          {config.statuses.map((st) => (
            <button
              key={st.status}
              type="button"
              onClick={() => onFilterChange(st.status)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all border ${
                filterStatus === st.status
                  ? "bg-sky-500 text-white border-sky-400 shadow-md shadow-sky-500/25"
                  : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Busca Local e Ordenação */}
        <div className="flex items-center gap-2">
          {/* Campo de filtro rápido */}
          <div className="relative flex-1 md:w-60">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <Input
              placeholder={`Filtrar ${config.label.toLowerCase()}...`}
              value={searchFilter}
              onChange={(e) => onSearchFilterChange(e.target.value)}
              className="pl-8 h-9 text-xs bg-slate-900/80 border-slate-800 rounded-xl focus-visible:ring-sky-400"
            />
          </div>

          {/* Menu Dropdown de Ordenação */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 h-9 text-xs rounded-xl border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white"
              >
                <ArrowUpDown className="h-3.5 w-3.5 text-sky-400" />
                <span className="hidden sm:inline">{sortLabels[sortBy]}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuRadioGroup
                value={sortBy}
                onValueChange={(val) => onSortChange(val as SortOption)}
              >
                <DropdownMenuRadioItem value="recent">
                  Mais recentes
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="title">
                  Título (A–Z)
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="rating">
                  Maior nota
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="year">
                  Ano de lançamento
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
