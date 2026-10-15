import { ExternalSource, MediaCategory } from "@/types/media";

export interface NormalizedMedia {
  externalId: string;
  source: ExternalSource;
  category: MediaCategory;
  title: string;
  coverUrl?: string | null;
  synopsis?: string | null;
  year?: number | null;
  creator?: string | null; // Autor, Desenvolvedora ou Diretor
}

export interface MediaProvider {
  search(query: string): Promise<NormalizedMedia[]>;
  getById(id: string): Promise<NormalizedMedia | null>;
}
