"use client";

import React, { useState, useEffect, useRef } from "react";
import { saveReview, toggleReviewVisibility } from "@/lib/actions/reviews";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Cloud, CloudOff, Eye, EyeOff, Loader2 } from "lucide-react";

interface AutoSaveReviewEditorProps {
  itemId: string;
  initialContent?: string;
  initialIsPublic?: boolean;
}

export function AutoSaveReviewEditor({
  itemId,
  initialContent = "",
  initialIsPublic = false,
}: AutoSaveReviewEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const isFirstRender = useRef(true);

  // Auto-save com debounce de 800ms ao editar conteúdo
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setStatus("saving");
    const timeout = setTimeout(async () => {
      try {
        await saveReview({ itemId, content, isPublic });
        setStatus("saved");
      } catch (err) {
        console.error("Erro no auto-save:", err);
        setStatus("error");
      }
    }, 800);

    return () => clearTimeout(timeout);
  }, [content, itemId, isPublic]);

  const handleTogglePublic = async () => {
    const nextVal = !isPublic;
    setIsPublic(nextVal);
    try {
      await toggleReviewVisibility(itemId, nextVal);
    } catch (err) {
      console.error("Erro ao mudar visibilidade:", err);
    }
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div className="rounded-2xl border border-sky-500/20 bg-slate-950/70 p-6 backdrop-blur-xl space-y-4 shadow-xl">
      {/* Barra superior do editor */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            Minha Resenha & Anotações
          </h3>
          <p className="text-xs text-slate-400">
            Escreva suas impressões, citações e reflexões. Salvamento automático ativo.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Status do salvamento automático */}
          <div className="flex items-center gap-1.5 text-xs">
            {status === "saving" && (
              <span className="flex items-center gap-1 text-sky-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Salvando...
              </span>
            )}
            {status === "saved" && (
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> Salvo automaticamente
              </span>
            )}
            {status === "error" && (
              <span className="flex items-center gap-1 text-rose-400">
                <CloudOff className="h-3.5 w-3.5" /> Falha ao salvar
              </span>
            )}
            {status === "idle" && (
              <span className="flex items-center gap-1 text-slate-500">
                <Cloud className="h-3.5 w-3.5" /> Em sincronia
              </span>
            )}
          </div>

          {/* Botão de Visibilidade (Público / Privado) */}
          <button
            type="button"
            onClick={handleTogglePublic}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold border transition-all cursor-pointer ${
              isPublic
                ? "bg-sky-500/15 border-sky-400 text-sky-300 shadow-sm"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
            title={
              isPublic
                ? "Resenha pública: visível na sua estante pública"
                : "Resenha privada: apenas você pode ver"
            }
          >
            {isPublic ? (
              <>
                <Eye className="h-3.5 w-3.5 text-sky-400" />
                <span>Pública</span>
              </>
            ) : (
              <>
                <EyeOff className="h-3.5 w-3.5 text-slate-500" />
                <span>Privada</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Área de texto longo */}
      <Textarea
        placeholder="O que você achou desta obra? Escreva seus pensamentos, pontos fortes, frases marcantes..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[220px] bg-slate-900/60 border-slate-800 leading-relaxed text-sm focus-visible:ring-sky-400"
      />

      {/* Rodapé com contagem de palavras */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
        <span>{wordCount} {wordCount === 1 ? "palavra" : "palavras"}</span>
        <span>As alterações são salvas automaticamente enquanto você digita</span>
      </div>
    </div>
  );
}
