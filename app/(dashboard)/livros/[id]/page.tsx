import React from "react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ItemDetailView } from "@/components/shelf/item-detail-view";
import { MediaItem, Review } from "@/types/media";

interface LivroDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function LivroDetailPage({ params }: LivroDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/livros/${id}`);
  }

  // Busca o item da mídia
  const { data: itemData, error: itemError } = await supabase
    .from("media_items")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (itemError || !itemData) {
    notFound();
  }

  // Busca a resenha vinculada
  const { data: reviewData } = await supabase
    .from("reviews")
    .select("*")
    .eq("item_id", id)
    .maybeSingle();

  return (
    <ItemDetailView
      item={itemData as MediaItem}
      review={reviewData as Review | null}
    />
  );
}
