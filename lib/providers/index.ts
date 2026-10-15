import { MediaCategory } from "@/types/media";
import { MediaProvider } from "./types";
import { BookProvider } from "./books";
import { GameProvider } from "./games/rawg";
import { TmdbProvider } from "./tmdb/tmdb";

const bookProvider = new BookProvider();
const gameProvider = new GameProvider();
const movieProvider = new TmdbProvider("movie");
const seriesProvider = new TmdbProvider("series");

export function getProvider(category: MediaCategory): MediaProvider {
  switch (category) {
    case "book":
      return bookProvider;
    case "game":
      return gameProvider;
    case "movie":
      return movieProvider;
    case "series":
      return seriesProvider;
    default:
      throw new Error(`Categoria de mídia não suportada: ${category}`);
  }
}

export * from "./types";
