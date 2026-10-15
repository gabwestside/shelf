import { MediaProvider, NormalizedMedia } from "../types";
import { searchGoogleBooks, getGoogleBookById } from "./google-books";
import { searchOpenLibrary, getOpenLibraryById } from "./open-library";

export class BookProvider implements MediaProvider {
  async search(query: string): Promise<NormalizedMedia[]> {
    // 1. Tenta primeiro pelo Google Books
    const googleResults = await searchGoogleBooks(query);
    if (googleResults.length > 0) {
      return googleResults;
    }

    // 2. Fallback resiliente para Open Library
    console.info("Fallback para Open Library ativado para a busca:", query);
    return searchOpenLibrary(query);
  }

  async getById(id: string): Promise<NormalizedMedia | null> {
    const book = await getGoogleBookById(id);
    if (book) return book;
    return getOpenLibraryById(id);
  }
}
