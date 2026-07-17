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
      links: {
        Row: {
          id: string;
          short_code: string;
          destination_url: string;
          utm_source: string | null;
          utm_medium: string | null;
          utm_campaign: string | null;
          utm_term: string | null;
          utm_content: string | null;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          short_code: string;
          destination_url: string;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          utm_term?: string | null;
          utm_content?: string | null;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          short_code?: string;
          destination_url?: string;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          utm_term?: string | null;
          utm_content?: string | null;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      link_clicks: {
        Row: {
          id: string;
          link_id: string;
          clicked_at: string;
          user_agent: string | null;
          referer: string | null;
        };
        Insert: {
          id?: string;
          link_id: string;
          clicked_at?: string;
          user_agent?: string | null;
          referer?: string | null;
        };
        Update: {
          id?: string;
          link_id?: string;
          clicked_at?: string;
          user_agent?: string | null;
          referer?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "link_clicks_link_id_fkey";
            columns: ["link_id"];
            isOneToOne: false;
            referencedRelation: "links";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_link: {
        Args: {
          p_destination_url: string;
          p_utm_source?: string | null;
          p_utm_medium?: string | null;
          p_utm_campaign?: string | null;
          p_utm_term?: string | null;
          p_utm_content?: string | null;
        };
        Returns: Database["public"]["Tables"]["links"]["Row"];
      };
      generate_short_code: {
        Args: {
          p_length?: number;
        };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Link = Database["public"]["Tables"]["links"]["Row"];
export type LinkInsert = Database["public"]["Tables"]["links"]["Insert"];
export type LinkUpdate = Database["public"]["Tables"]["links"]["Update"];
export type LinkClick = Database["public"]["Tables"]["link_clicks"]["Row"];
