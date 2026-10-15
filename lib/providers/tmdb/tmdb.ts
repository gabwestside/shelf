import { MediaProvider, NormalizedMedia } from "../types";
import { MediaCategory } from "@/types/media";

export class TmdbProvider implements MediaProvider {
  private category: "movie" | "series";
  private apiKey = process.env.TMDB_API_KEY;
  private bearerToken = process.env.TMDB_ACCESS_TOKEN;

  constructor(category: "movie" | "series") {
    this.category = category;
  }

  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (this.bearerToken) {
      headers["Authorization"] = `Bearer ${this.bearerToken}`;
    }
    return headers;
  }

  private buildUrl(endpoint: string, params: Record<string, string> = {}): string {
    const url = new URL(`https://api.themoviedb.org/3/${endpoint}`);
    url.searchParams.set("language", "pt-BR");
    if (this.apiKey && !this.bearerToken) {
      url.searchParams.set("api_key", this.apiKey);
    }
    Object.entries(params).forEach(([key, val]) => url.searchParams.set(key, val));
    return url.toString();
  }

  async search(query: string): Promise<NormalizedMedia[]> {
    if (!this.apiKey && !this.bearerToken) {
      console.warn("TMDB_API_KEY ou TMDB_ACCESS_TOKEN não configurada no ambiente.");
      return [];
    }

    try {
      const endpoint = this.category === "movie" ? "search/movie" : "search/tv";
      const url = this.buildUrl(endpoint, { query, page: "1" });

      const res = await fetch(url, {
        headers: this.getHeaders(),
        next: { revalidate: 3600 },
      });

      if (!res.ok) {
        console.warn("TMDB API retornou status:", res.status);
        return [];
      }

      const data = await res.json();
      if (!data.results || !Array.isArray(data.results)) {
        return [];
      }

      return data.results.map((item: any): NormalizedMedia => {
        const title = this.category === "movie" ? item.title : item.name;
        const dateStr = this.category === "movie" ? item.release_date : item.first_air_date;
        let year: number | null = null;
        if (dateStr) {
          const y = parseInt(dateStr.slice(0, 4), 10);
          if (!isNaN(y)) year = y;
        }

        const coverUrl = item.poster_path
          ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
          : null;

        return {
          externalId: String(item.id),
          source: "tmdb",
          category: this.category,
          title: title || "Sem título",
          coverUrl,
          synopsis: item.overview || null,
          year,
          creator: null,
        };
      });
    } catch (err) {
      console.error(`Erro na busca do TMDB (${this.category}):`, err);
      return [];
    }
  }

  async getById(id: string): Promise<NormalizedMedia | null> {
    if (!this.apiKey && !this.bearerToken) return null;

    try {
      const endpoint = this.category === "movie" ? `movie/${id}` : `tv/${id}`;
      const url = this.buildUrl(endpoint, { append_to_response: "credits" });

      const res = await fetch(url, {
        headers: this.getHeaders(),
        next: { revalidate: 86400 },
      });

      if (!res.ok) return null;

      const item = await res.json();
      const title = this.category === "movie" ? item.title : item.name;
      const dateStr = this.category === "movie" ? item.release_date : item.first_air_date;
      let year: number | null = null;
      if (dateStr) {
        const y = parseInt(dateStr.slice(0, 4), 10);
        if (!isNaN(y)) year = y;
      }

      const coverUrl = item.poster_path
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
        : null;

      // Diretor para filmes ou Criadores para séries
      let creator: string | null = null;
      if (this.category === "movie" && item.credits?.crew) {
        const director = item.credits.crew.find((c: any) => c.job === "Director");
        if (director) creator = director.name;
      } else if (item.created_by && Array.isArray(item.created_by)) {
        creator = item.created_by.map((c: any) => c.name).join(", ");
      }

      return {
        externalId: String(item.id),
        source: "tmdb",
        category: this.category,
        title: title || "Sem título",
        coverUrl,
        synopsis: item.overview || null,
        year,
        creator,
      };
    } catch (err) {
      console.error(`Erro ao buscar detalhes no TMDB (${this.category}):`, err);
      return null;
    }
  }
}
