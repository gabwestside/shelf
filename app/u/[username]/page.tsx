import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/layout/top-bar";
import { FooterBar } from "@/components/layout/footer-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, BookOpen, Sparkles, ArrowLeft, Quote } from "lucide-react";
import { CATEGORY_CONFIGS, MediaCategory } from "@/types/media";

interface PublicProfilePageProps {
  params: Promise<{ username: string }>;
}

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { username } = await params;
  const supabase = await createClient();

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  // Busca o perfil público pelo username ou pelo ID
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .or(`username.eq.${username},id.eq.${username}`)
    .maybeSingle();

  if (!profile) {
    notFound();
  }

  // Busca os itens que possuem resenhas públicas para este usuário
  const { data: publicReviews } = await supabase
    .from("reviews")
    .select(`
      id,
      content,
      updated_at,
      item_id,
      media_items (
        id,
        title,
        cover_url,
        category,
        year,
        creator,
        rating
      )
    `)
    .eq("user_id", profile.id)
    .eq("is_public", true)
    .order("updated_at", { ascending: false });

  const reviews = publicReviews || [];

  return (
    <div className="flex min-h-screen flex-col bg-[#050811] text-slate-100">
      <TopBar user={currentUser} />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Cabeçalho do Perfil Público */}
        <div className="flex flex-col sm:flex-row items-center gap-6 rounded-3xl border border-sky-500/20 bg-slate-950/80 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
          <div className="h-24 w-24 rounded-2xl overflow-hidden bg-gradient-to-tr from-sky-500 to-blue-600 p-0.5 shadow-xl shadow-sky-500/20">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name || profile.username || "Usuário"}
                className="h-full w-full object-cover rounded-2xl"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-slate-900 rounded-2xl text-2xl font-black text-sky-400">
                {(profile.full_name || profile.username || "U")[0].toUpperCase()}
              </div>
            )}
          </div>

          <div className="text-center sm:text-left space-y-1.5 flex-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {profile.full_name || profile.username}
            </h1>
            <p className="text-sm text-sky-400 font-medium">@{profile.username}</p>
            <p className="text-xs text-slate-400 max-w-md">
              Estante pública compartilhada. Veja as resenhas e avaliações que este usuário tornou públicas.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-center px-4 py-2 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-xl font-bold text-white">{reviews.length}</span>
              <p className="text-[11px] text-slate-400">Resenhas públicas</p>
            </div>
          </div>
        </div>

        {/* Lista de Resenhas Públicas */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-sky-400" />
            Resenhas em Destaque
          </h2>

          {reviews.length === 0 ? (
            <div className="text-center py-16 rounded-3xl border border-dashed border-slate-800 bg-slate-950/40 p-6">
              <BookOpen className="h-10 w-10 text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-400">
                Este usuário ainda não publicou nenhuma resenha aberta.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((rev: any) => {
                const item = rev.media_items;
                if (!item) return null;
                const catConfig = CATEGORY_CONFIGS[item.category as MediaCategory];

                return (
                  <div
                    key={rev.id}
                    className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950/70 p-5 backdrop-blur-xl hover:border-sky-500/30 transition-all shadow-lg space-y-4"
                  >
                    <div className="flex gap-4">
                      {/* Capa */}
                      <div className="h-28 w-20 shrink-0 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shadow-md">
                        {item.cover_url ? (
                          <img
                            src={item.cover_url}
                            alt={item.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-[10px] text-slate-500 p-1 text-center">
                            Sem capa
                          </div>
                        )}
                      </div>

                      {/* Metadados */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Badge variant="outline" className="text-[10px] py-0">
                            {catConfig?.singular || item.category}
                          </Badge>
                          {item.rating && (
                            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-300">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                              <span>{Number(item.rating).toFixed(1)}</span>
                            </div>
                          )}
                        </div>

                        <h3 className="text-sm font-bold text-white truncate">
                          {item.title}
                        </h3>
                        <p className="text-xs text-slate-400 truncate">
                          {item.creator} {item.year ? `• ${item.year}` : ""}
                        </p>
                      </div>
                    </div>

                    {/* Conteúdo da Resenha */}
                    <div className="rounded-xl bg-slate-900/70 p-3 border border-slate-800/80 text-xs text-slate-300 leading-relaxed italic relative">
                      <Quote className="h-4 w-4 text-sky-500/30 mb-1" />
                      <p className="line-clamp-4">{rev.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <FooterBar />
    </div>
  );
}
