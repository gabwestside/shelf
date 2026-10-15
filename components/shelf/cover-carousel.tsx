"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { MediaItem } from "@/types/media";
import { CoverCard } from "./cover-card";
import { ShelfActionsModal } from "./shelf-actions-modal";
import { ChevronLeft, ChevronRight, SlidersHorizontal, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CoverCarouselProps {
  items: MediaItem[];
  onItemUpdated?: () => void;
}

export function CoverCarousel({ items, onItemUpdated }: CoverCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [modalItem, setModalItem] = useState<MediaItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Garante que o selectedIndex permaneça dentro dos limites
  useEffect(() => {
    if (items.length === 0) {
      setSelectedIndex(0);
    } else if (selectedIndex >= items.length) {
      setSelectedIndex(items.length - 1);
    }
  }, [items.length, selectedIndex]);

  const handlePrev = useCallback(() => {
    setSelectedIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) => Math.min(items.length - 1, prev + 1));
  }, [items.length]);

  // Navegação por teclado (Setas Esquerda e Direita)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignora se estiver digitando em input ou textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "Enter" || e.key === " ") {
        if (items[selectedIndex]) {
          e.preventDefault();
          setModalItem(items[selectedIndex]);
          setModalOpen(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePrev, handleNext, items, selectedIndex]);

  // Manipulador de Swipe (Framer Motion drag)
  const handleDragEnd = (_: any, info: PanInfo) => {
    const swipeThreshold = 40;
    if (info.offset.x > swipeThreshold) {
      handlePrev();
    } else if (info.offset.x < -swipeThreshold) {
      handleNext();
    }
  };

  if (items.length === 0) return null;

  const currentItem = items[selectedIndex];

  return (
    <div className="relative w-full py-8 flex flex-col items-center select-none overflow-hidden">
      {/* Botões laterais de navegação no desktop */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-40 hidden md:block">
        <button
          onClick={handlePrev}
          disabled={selectedIndex === 0}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900/80 border border-sky-500/20 text-slate-300 shadow-xl backdrop-blur-md transition-all hover:bg-slate-800 hover:text-white hover:scale-110 disabled:opacity-30 disabled:pointer-events-none"
          aria-label="Item anterior"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      </div>

      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-40 hidden md:block">
        <button
          onClick={handleNext}
          disabled={selectedIndex === items.length - 1}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900/80 border border-sky-500/20 text-slate-300 shadow-xl backdrop-blur-md transition-all hover:bg-slate-800 hover:text-white hover:scale-110 disabled:opacity-30 disabled:pointer-events-none"
          aria-label="Próximo item"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Área do Carrossel / Launcher Shelf com Swipe */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        className="relative flex items-center justify-center w-full max-w-5xl h-[420px] sm:h-[460px] cursor-grab active:cursor-grabbing"
      >
        <div className="relative flex items-center justify-center w-full h-full">
          {items.map((item, index) => {
            const offset = index - selectedIndex;
            // Renderiza apenas itens no campo de visão (-3 a +3) para performance excelente
            if (Math.abs(offset) > 3) return null;

            const isCenter = offset === 0;

            // Posição horizontal, escala e rotação no espaço estilo launcher
            const xOffset = offset * (typeof window !== "undefined" && window.innerWidth < 640 ? 160 : 220);
            const scale = isCenter ? 1.18 : Math.max(0.72, 1 - Math.abs(offset) * 0.15);
            const zIndex = 30 - Math.abs(offset) * 5;
            const opacity = isCenter ? 1 : Math.max(0.4, 0.85 - Math.abs(offset) * 0.2);

            return (
              <motion.div
                key={item.id}
                animate={{
                  x: xOffset,
                  scale,
                  zIndex,
                  opacity,
                }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 25,
                }}
                className="absolute w-44 sm:w-56"
                style={{ zIndex }}
              >
                <CoverCard
                  item={item}
                  isActive={isCenter}
                  onClick={() => {
                    if (isCenter) {
                      setModalItem(item);
                      setModalOpen(true);
                    } else {
                      setSelectedIndex(index);
                    }
                  }}
                  onLongPress={() => {
                    setModalItem(item);
                    setModalOpen(true);
                  }}
                />
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Barra de controle inferior do carrossel */}
      <div className="flex items-center gap-4 mt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (currentItem) {
              setModalItem(currentItem);
              setModalOpen(true);
            }
          }}
          className="gap-2 rounded-xl border-sky-500/30 text-sky-300 hover:text-white"
        >
          <SlidersHorizontal className="h-4 w-4 text-sky-400" />
          Opções do item
        </Button>

        {/* Indicador de posição (ex: 3 / 10) */}
        <div className="text-xs font-semibold text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-full border border-slate-800">
          {selectedIndex + 1} de {items.length}
        </div>
      </div>

      {/* Modal de Ações ao Clicar / Segurar */}
      <ShelfActionsModal
        item={modalItem}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onItemUpdated={onItemUpdated}
      />
    </div>
  );
}
