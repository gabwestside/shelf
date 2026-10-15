export type MediaCategory = "book" | "game" | "movie" | "series";

export type MediaStatus = "wishlist" | "in_progress" | "completed";

export type ExternalSource =
  | "google_books"
  | "open_library"
  | "rawg"
  | "igdb"
  | "tmdb"
  | "manual";

export interface MediaItem {
  id: string;
  user_id: string;
  category: MediaCategory;
  external_id?: string | null;
  external_source?: ExternalSource | string | null;
  title: string;
  cover_url?: string | null;
  synopsis?: string | null;
  year?: number | null;
  creator?: string | null; // autor, diretor ou estúdio
  status: MediaStatus;
  rating?: number | null; // 0.0 a 10.0
  started_at?: string | null;
  finished_at?: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  item_id: string;
  user_id: string;
  content: string;
  is_public: boolean;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  category: MediaCategory;
  item_id?: string | null;
  activity_date: string; // YYYY-MM-DD
  created_at: string;
}

export interface StreakStats {
  current_streak: number;
  max_streak: number;
  total_days: number;
  logged_today: boolean;
}

export interface ExternalSearchResult {
  externalId: string;
  source: ExternalSource;
  title: string;
  coverUrl?: string | null;
  synopsis?: string | null;
  year?: number | null;
  creator?: string | null;
}

export interface CategoryConfig {
  label: string;
  singular: string;
  path: string;
  icon: string;
  streakActionLabel: string;
  aspectRatio: "2/3" | "3/4";
  statuses: {
    status: MediaStatus;
    label: string;
  }[];
}

export const CATEGORY_CONFIGS: Record<MediaCategory, CategoryConfig> = {
  book: {
    label: "Livros",
    singular: "Livro",
    path: "/livros",
    icon: "BookOpen",
    streakActionLabel: "Li hoje",
    aspectRatio: "2/3",
    statuses: [
      { status: "wishlist", label: "Quero ler" },
      { status: "in_progress", label: "Lendo" },
      { status: "completed", label: "Lido" },
    ],
  },
  game: {
    label: "Jogos",
    singular: "Jogo",
    path: "/jogos",
    icon: "Gamepad2",
    streakActionLabel: "Joguei hoje",
    aspectRatio: "3/4",
    statuses: [
      { status: "wishlist", label: "Quero jogar" },
      { status: "in_progress", label: "Jogando" },
      { status: "completed", label: "Zerado" },
    ],
  },
  movie: {
    label: "Filmes",
    singular: "Filme",
    path: "/filmes",
    icon: "Film",
    streakActionLabel: "Assisti hoje",
    aspectRatio: "2/3",
    statuses: [
      { status: "wishlist", label: "Quero assistir" },
      { status: "completed", label: "Assistido" },
    ],
  },
  series: {
    label: "Séries",
    singular: "Série",
    path: "/series",
    icon: "Tv",
    streakActionLabel: "Assisti hoje",
    aspectRatio: "2/3",
    statuses: [
      { status: "wishlist", label: "Quero assistir" },
      { status: "in_progress", label: "Assistindo" },
      { status: "completed", label: "Concluída" },
    ],
  },
};
