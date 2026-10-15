"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface SaveReviewInput {
  itemId: string;
  content: string;
  isPublic?: boolean;
}

export async function saveReview({ itemId, content, isPublic = false }: SaveReviewInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuário não autenticado.");

  const { data, error } = await supabase
    .from("reviews")
    .upsert(
      {
        item_id: itemId,
        user_id: user.id,
        content: content.trim(),
        is_public: isPublic,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "item_id" }
    )
    .select()
    .single();

  if (error) {
    console.error("Erro ao salvar resenha:", error);
    throw new Error(`Falha ao salvar resenha: ${error.message}`);
  }

  return data;
}

export async function toggleReviewVisibility(itemId: string, isPublic: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuário não autenticado.");

  const { error } = await supabase
    .from("reviews")
    .update({ is_public: isPublic, updated_at: new Date().toISOString() })
    .eq("item_id", itemId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
}
