export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      media_items: {
        Row: {
          id: string;
          user_id: string;
          category: string;
          external_id: string | null;
          external_source: string | null;
          title: string;
          cover_url: string | null;
          synopsis: string | null;
          year: number | null;
          creator: string | null;
          status: string;
          rating: number | null;
          started_at: string | null;
          finished_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category: string;
          external_id?: string | null;
          external_source?: string | null;
          title: string;
          cover_url?: string | null;
          synopsis?: string | null;
          year?: number | null;
          creator?: string | null;
          status?: string;
          rating?: number | null;
          started_at?: string | null;
          finished_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category?: string;
          external_id?: string | null;
          external_source?: string | null;
          title?: string;
          cover_url?: string | null;
          synopsis?: string | null;
          year?: number | null;
          creator?: string | null;
          status?: string;
          rating?: number | null;
          started_at?: string | null;
          finished_at?: string | null;
          created_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          item_id: string;
          user_id: string;
          content: string;
          is_public: boolean;
          updated_at: string;
        };
        Insert: {
          id?: string;
          item_id: string;
          user_id: string;
          content?: string;
          is_public?: boolean;
          updated_at?: string;
        };
        Update: {
          id?: string;
          item_id?: string;
          user_id?: string;
          content?: string;
          is_public?: boolean;
          updated_at?: string;
        };
      };
      activity_logs: {
        Row: {
          id: string;
          user_id: string;
          category: string;
          item_id: string | null;
          activity_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category: string;
          item_id?: string | null;
          activity_date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category?: string;
          item_id?: string | null;
          activity_date?: string;
          created_at?: string;
        };
      };
    };
    Functions: {
      calculate_streak: {
        Args: {
          p_user_id: string;
          p_category: string;
          p_today_date: string;
        };
        Returns: {
          current_streak: number;
          max_streak: number;
          total_days: number;
          logged_today: boolean;
        }[];
      };
    };
  };
}
