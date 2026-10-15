import { MediaProvider, NormalizedMedia } from "../types";

export class GameProvider implements MediaProvider {
  private apiKey = process.env.RAWG_API_KEY;

  async search(query: string): Promise<NormalizedMedia[]> {
    if (!this.apiKey) {
      console.warn("RAWG_API_KEY não configurada no ambiente.");
      return [];
    }

    try {
      const url = new URL("https://api.rawg.io/api/games");
      url.searchParams.set("key", this.apiKey);
      url.searchParams.set("search", query);
      url.searchParams.set("page_size", "15");

      const res = await fetch(url.toString(), {
        next: { revalidate: 3600 },
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        console.warn("RAWG API retornou status:", res.status);
        return [];
      }

      const data = await res.json();
      if (!data.results || !Array.isArray(data.results)) {
        return [];
      }

      return data.results.map((game: any): NormalizedMedia => {
        let year: number | null = null;
        if (game.released) {
          const y = parseInt(game.released.slice(0, 4), 10);
          if (!isNaN(y)) year = y;
        }

        const genres = Array.isArray(game.genres) ? game.genres.map((g: any) => g.name).join(", ") : null;

        return {
          externalId: String(game.id),
          source: "rawg",
          category: "game",
          title: game.name || "Sem título",
          coverUrl: game.background_image || null,
          synopsis: genres ? `Gêneros: ${genres}` : null,
          year,
          creator: null,
        };
      });
    } catch (err) {
      console.error("Erro na busca de jogos via RAWG:", err);
      return [];
    }
  }

  async getById(id: string): Promise<NormalizedMedia | null> {
    if (!this.apiKey) return null;

    try {
      const url = new URL(`https://api.rawg.io/api/games/${id}`);
      url.searchParams.set("key", this.apiKey);

      const res = await fetch(url.toString(), {
        next: { revalidate: 86400 },
      });

      if (!res.ok) return null;

      const game = await res.json();
      let year: number | null = null;
      if (game.released) {
        const y = parseInt(game.released.slice(0, 4), 10);
        if (!isNaN(y)) year = y;
      }

      const developers = Array.isArray(game.developers)
        ? game.developers.map((d: any) => d.name).join(", ")
        : Array.isArray(game.publishers)
        ? game.publishers.map((p: any) => p.name).join(", ")
        : null;

      return {
        externalId: String(game.id),
        source: "rawg",
        category: "game",
        title: game.name || "Sem título",
        coverUrl: game.background_image || null,
        synopsis: game.description_raw || game.description || null,
        year,
        creator: developers,
      };
    } catch (err) {
      console.error("Erro ao obter detalhes do jogo RAWG:", err);
      return null;
    }
  }
}
