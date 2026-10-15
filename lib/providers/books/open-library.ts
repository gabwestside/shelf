import { NormalizedMedia } from "../types";

export async function searchOpenLibrary(query: string): Promise<NormalizedMedia[]> {
  try {
    const url = new URL("https://openlibrary.org/search.json");
    url.searchParams.set("q", query);
    url.searchParams.set("limit", "15");

    const res = await fetch(url.toString(), {
      next: { revalidate: 3600 },
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      console.warn("Open Library retornou status:", res.status);
      return [];
    }

    const data = await res.json();
    if (!data.docs || !Array.isArray(data.docs)) {
      return [];
    }

    return data.docs.map((doc: any): NormalizedMedia => {
      let coverUrl: string | null = null;
      if (doc.cover_i) {
        coverUrl = `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
      }

      return {
        externalId: doc.key?.replace("/works/", "") || String(doc.cover_i || Math.random()),
        source: "open_library",
        category: "book",
        title: doc.title || "Sem título",
        coverUrl,
        synopsis: null,
        year: doc.first_publish_year || null,
        creator: Array.isArray(doc.author_name) ? doc.author_name.join(", ") : null,
      };
    });
  } catch (err) {
    console.error("Erro na busca do Open Library:", err);
    return [];
  }
}

export async function getOpenLibraryById(id: string): Promise<NormalizedMedia | null> {
  try {
    const res = await fetch(`https://openlibrary.org/works/${id}.json`, {
      next: { revalidate: 86400 },
    });

    if (!res.ok) return null;

    const data = await res.json();
    let coverUrl: string | null = null;
    if (data.covers && data.covers.length > 0) {
      coverUrl = `https://covers.openlibrary.org/b/id/${data.covers[0]}-L.jpg`;
    }

    let synopsis: string | null = null;
    if (typeof data.description === "string") {
      synopsis = data.description;
    } else if (data.description && typeof data.description.value === "string") {
      synopsis = data.description.value;
    }

    return {
      externalId: id,
      source: "open_library",
      category: "book",
      title: data.title || "Sem título",
      coverUrl,
      synopsis,
      year: null,
      creator: null,
    };
  } catch (err) {
    console.error("Erro ao buscar detalhes no Open Library:", err);
    return null;
  }
}
