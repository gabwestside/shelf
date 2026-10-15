import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/providers";
import { MediaCategory } from "@/types/media";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ category: string; id: string }> }
) {
  try {
    const { category, id } = await params;

    if (!["book", "game", "movie", "series"].includes(category)) {
      return NextResponse.json({ error: "Categoria inválida" }, { status: 400 });
    }

    const provider = getProvider(category as MediaCategory);
    const item = await provider.getById(id);

    if (!item) {
      return NextResponse.json({ error: "Item não encontrado" }, { status: 404 });
    }

    return NextResponse.json(
      { item },
      {
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=172800",
        },
      }
    );
  } catch (err: unknown) {
    console.error("Erro na rota /api/media/[category]/[id]:", err);
    return NextResponse.json(
      { error: "Erro interno ao buscar detalhes" },
      { status: 500 }
    );
  }
}
