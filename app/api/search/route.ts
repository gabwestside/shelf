import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getProvider } from "@/lib/providers";
import { MediaCategory } from "@/types/media";

const searchSchema = z.object({
  q: z.string().trim().min(1, "Termo de busca muito curto"),
  category: z.enum(["book", "game", "movie", "series"] as const),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") ?? "";
    const category = searchParams.get("category") ?? "book";

    const parsed = searchSchema.safeParse({ q, category });
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Parâmetros inválidos", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const provider = getProvider(parsed.data.category as MediaCategory);
    const results = await provider.search(parsed.data.q);

    return NextResponse.json(
      { results },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        },
      }
    );
  } catch (err: unknown) {
    console.error("Erro na rota /api/search:", err);
    return NextResponse.json(
      { error: "Falha ao buscar itens externos" },
      { status: 500 }
    );
  }
}
