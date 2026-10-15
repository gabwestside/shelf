"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { MediaItem, MediaCategory, MediaStatus } from "@/types/media";
import { ShelfHeader, SortOption } from "./shelf-header";
import { CoverCarousel } from "./cover-carousel";
import { ShelfEmptyState } from "./shelf-empty-state";
import { SearchModal } from "@/components/search/search-modal";

interface ShelfViewProps {
  initialItems: MediaItem[];
  category: MediaCategory;
  streakHeader?: React.ReactNode;
}

export function ShelfView({
  initialItems,
  category,
  streakHeader,
}: ShelfViewProps) {
  const router = useRouter();
  const [items, setItems] = useState<MediaItem[]>(initialItems);
  const [filterStatus, setFilterStatus] = useState<MediaStatus | "all">("all");
  const [searchFilter, setSearchFilter] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // Mantém items sincronizados se initialItems mudar pelo servidor
  React.useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    // Filtro de Status
    if (filterStatus !== "all") {
      result = result.filter((item) => item.status === filterStatus);
    }

    // Filtro de Texto (busca local rápida)
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          (item.creator && item.creator.toLowerCase().includes(q))
      );
    }

    // Ordenação
    result.sort((a, b) => {
      if (sortBy === "title") {
        return a.title.localeCompare(b.title, "pt-BR");
      }
      if (sortBy === "rating") {
        return (b.rating ?? -1) - (a.rating ?? -1);
      }
      if (sortBy === "year") {
        return (b.year ?? 0) - (a.year ?? 0);
      }
      // default: recent (created_at DESC)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return result;
  }, [items, filterStatus, searchFilter, sortBy]);

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 flex-1 flex flex-col justify-between">
      {/* Seção Superior de Streaks e Estatísticas da Categoria */}
      {streakHeader && <div className="w-full">{streakHeader}</div>}

      {/* Cabeçalho da Estante (Título, filtros e ordenação) */}
      <ShelfHeader
        category={category}
        itemCount={filteredAndSortedItems.length}
        filterStatus={filterStatus}
        onFilterChange={setFilterStatus}
        searchFilter={searchFilter}
        onSearchFilterChange={setSearchFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onOpenSearchModal={() => setSearchModalOpen(true)}
      />

      {/* Prateleira / Carrossel Estilo Launcher */}
      <div className="flex-1 flex flex-col justify-center min-h-[460px]">
        {filteredAndSortedItems.length > 0 ? (
          <CoverCarousel
            items={filteredAndSortedItems}
            onItemUpdated={handleRefresh}
          />
        ) : (
          <ShelfEmptyState
            category={category}
            onOpenSearch={() => setSearchModalOpen(true)}
            isFiltered={items.length > 0}
          />
        )}
      </div>

      {/* Modal de Busca Externa */}
      <SearchModal
        category={category}
        open={searchModalOpen}
        onOpenChange={setSearchModalOpen}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
