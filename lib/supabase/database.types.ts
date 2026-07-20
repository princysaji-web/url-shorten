export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type OrgRole = "admin" | "member";

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      organization_members: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          role: OrgRole;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id: string;
          role?: OrgRole;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          user_id?: string;
          role?: OrgRole;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
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
          organization_id: string;
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
          organization_id: string;
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
          organization_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "links_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
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
          p_organization_id: string;
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
      is_org_member: {
        Args: {
          p_org_id: string;
        };
        Returns: boolean;
      };
      is_org_admin: {
        Args: {
          p_org_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      org_role: OrgRole;
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Link = Database["public"]["Tables"]["links"]["Row"];
export type LinkInsert = Database["public"]["Tables"]["links"]["Insert"];
export type LinkUpdate = Database["public"]["Tables"]["links"]["Update"];
export type LinkClick = Database["public"]["Tables"]["link_clicks"]["Row"];
export type Organization = Database["public"]["Tables"]["organizations"]["Row"];
export type OrganizationMember =
  Database["public"]["Tables"]["organization_members"]["Row"];
