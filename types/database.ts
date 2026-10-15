export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
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
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
