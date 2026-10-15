"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { MediaCategory, MediaStatus, ExternalSource } from "@/types/media";

export interface CreateMediaInput {
  category: MediaCategory;
  external_id?: string | null;
  external_source?: ExternalSource | string | null;
  title: string;
  cover_url?: string | null;
  synopsis?: string | null;
  year?: number | null;
  creator?: string | null;
  status?: MediaStatus;
  rating?: number | null;
}

export async function addMediaItem(input: CreateMediaInput) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Usuário não autenticado.");
  }

  const { data, error } = await supabase
    .from("media_items")
    .insert({
      user_id: user.id,
      category: input.category,
      external_id: input.external_id || null,
      external_source: input.external_source || "manual",
      title: input.title.trim(),
      cover_url: input.cover_url || null,
      synopsis: input.synopsis || null,
      year: input.year || null,
      creator: input.creator || null,
      status: input.status || "wishlist",
      rating: input.rating ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("Erro ao adicionar item na estante:", error);
    throw new Error(`Falha ao adicionar: ${error.message}`);
  }

  // Cria registro de resenha vazia vinculada ao item para facilitar edição futura
  if (data) {
    await supabase.from("reviews").insert({
      item_id: data.id,
      user_id: user.id,
      content: "",
      is_public: false,
    });
  }

  revalidatePath(`/${input.category === "book" ? "livros" : input.category === "game" ? "jogos" : input.category === "movie" ? "filmes" : "series"}`);
  return data;
}

export async function updateMediaStatus(id: string, status: MediaStatus, category: MediaCategory) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuário não autenticado.");

  const updates: {
    status?: string;
    started_at?: string;
    finished_at?: string;
  } = { status };

  if (status === "in_progress") {
    updates.started_at = new Date().toISOString();
  } else if (status === "completed") {
    updates.finished_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("media_items")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  const path = category === "book" ? "livros" : category === "game" ? "jogos" : category === "movie" ? "filmes" : "series";
  revalidatePath(`/${path}`);
  revalidatePath(`/${path}/${id}`);
}

export async function updateMediaRating(id: string, rating: number | null, category: MediaCategory) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuário não autenticado.");

  const { error } = await supabase
    .from("media_items")
    .update({ rating })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  const path = category === "book" ? "livros" : category === "game" ? "jogos" : category === "movie" ? "filmes" : "series";
  revalidatePath(`/${path}`);
  revalidatePath(`/${path}/${id}`);
}

export async function updateMediaDates(
  id: string,
  dates: { started_at?: string | null; finished_at?: string | null },
  category: MediaCategory
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuário não autenticado.");

  const { error } = await supabase
    .from("media_items")
    .update(dates)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  const path = category === "book" ? "livros" : category === "game" ? "jogos" : category === "movie" ? "filmes" : "series";
  revalidatePath(`/${path}`);
  revalidatePath(`/${path}/${id}`);
}

export async function deleteMediaItem(id: string, category: MediaCategory) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuário não autenticado.");

  const { error } = await supabase
    .from("media_items")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  const path = category === "book" ? "livros" : category === "game" ? "jogos" : category === "movie" ? "filmes" : "series";
  revalidatePath(`/${path}`);
}
