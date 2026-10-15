import { NormalizedMedia } from "../types";

export async function searchGoogleBooks(query: string): Promise<NormalizedMedia[]> {
  try {
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
    const url = new URL("https://www.googleapis.com/books/v1/volumes");
    url.searchParams.set("q", query);
    url.searchParams.set("maxResults", "15");
    if (apiKey) {
      url.searchParams.set("key", apiKey);
    }

    const res = await fetch(url.toString(), {
      next: { revalidate: 3600 },
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      console.warn("Google Books API retornou status:", res.status);
      return [];
    }

    const data = await res.json();
    if (!data.items || !Array.isArray(data.items)) {
      return [];
    }

    return data.items.map((item: any): NormalizedMedia => {
      const info = item.volumeInfo || {};
      let coverUrl = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || null;
      if (coverUrl) {
        coverUrl = coverUrl.replace(/^http:\/\//i, "https://").replace(/&edge=curl/g, "");
      }

      let year: number | null = null;
      if (info.publishedDate) {
        const y = parseInt(info.publishedDate.slice(0, 4), 10);
        if (!isNaN(y)) year = y;
      }

      return {
        externalId: item.id,
        source: "google_books",
        category: "book",
        title: info.title || "Sem título",
        coverUrl,
        synopsis: info.description || null,
        year,
        creator: Array.isArray(info.authors) ? info.authors.join(", ") : null,
      };
    });
  } catch (err) {
    console.error("Erro na busca do Google Books:", err);
    return [];
  }
}

export async function getGoogleBookById(id: string): Promise<NormalizedMedia | null> {
  try {
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
    const url = new URL(`https://www.googleapis.com/books/v1/volumes/${id}`);
    if (apiKey) {
      url.searchParams.set("key", apiKey);
    }

    const res = await fetch(url.toString(), {
      next: { revalidate: 86400 },
      headers: { Accept: "application/json" },
    });

    if (!res.ok) return null;

    const item = await res.json();
    const info = item.volumeInfo || {};
    let coverUrl = info.imageLinks?.large || info.imageLinks?.medium || info.imageLinks?.thumbnail || null;
    if (coverUrl) {
      coverUrl = coverUrl.replace(/^http:\/\//i, "https://").replace(/&edge=curl/g, "");
    }

    let year: number | null = null;
    if (info.publishedDate) {
      const y = parseInt(info.publishedDate.slice(0, 4), 10);
      if (!isNaN(y)) year = y;
    }

    return {
      externalId: item.id,
      source: "google_books",
      category: "book",
      title: info.title || "Sem título",
      coverUrl,
      synopsis: info.description || null,
      year,
      creator: Array.isArray(info.authors) ? info.authors.join(", ") : null,
    };
  } catch (err) {
    console.error("Erro ao buscar livro por ID no Google Books:", err);
    return null;
  }
}
