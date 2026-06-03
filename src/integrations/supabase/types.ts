export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      admin_templates: {
        Row: {
          album_sizes: string[] | null
          category: string
          created_at: string
          created_by: string
          description: string | null
          description_he: string | null
          id: string
          is_active: boolean | null
          is_multi_page: boolean | null
          is_published: boolean | null
          name: string
          name_he: string | null
          page_count: number | null
          pages_data: Json
          sort_order: number | null
          tags: string[] | null
          template_mode: string
          thumbnail_url: string | null
          updated_at: string
          version: number | null
        }
        Insert: {
          album_sizes?: string[] | null
          category?: string
          created_at?: string
          created_by: string
          description?: string | null
          description_he?: string | null
          id?: string
          is_active?: boolean | null
          is_multi_page?: boolean | null
          is_published?: boolean | null
          name: string
          name_he?: string | null
          page_count?: number | null
          pages_data?: Json
          sort_order?: number | null
          tags?: string[] | null
          template_mode?: string
          thumbnail_url?: string | null
          updated_at?: string
          version?: number | null
        }
        Update: {
          album_sizes?: string[] | null
          category?: string
          created_at?: string
          created_by?: string
          description?: string | null
          description_he?: string | null
          id?: string
          is_active?: boolean | null
          is_multi_page?: boolean | null
          is_published?: boolean | null
          name?: string
          name_he?: string | null
          page_count?: number | null
          pages_data?: Json
          sort_order?: number | null
          tags?: string[] | null
          template_mode?: string
          thumbnail_url?: string | null
          updated_at?: string
          version?: number | null
        }
        Relationships: []
      }
      album_templates: {
        Row: {
          category: string | null
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          page_count: number
          pages_data: Json
          tags: string[] | null
          thumbnail_url: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          page_count?: number
          pages_data?: Json
          tags?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          page_count?: number
          pages_data?: Json
          tags?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      assets: {
        Row: {
          asset_type: string
          category: string
          created_at: string
          data_url: string | null
          file_url: string
          height: number | null
          id: string
          is_active: boolean
          is_visible: boolean | null
          metadata: Json | null
          name: string
          name_he: string | null
          preview_data: string | null
          sort_order: number
          tags: string[] | null
          thumbnail_url: string | null
          uploaded_by: string | null
          width: number | null
        }
        Insert: {
          asset_type: string
          category: string
          created_at?: string
          data_url?: string | null
          file_url: string
          height?: number | null
          id?: string
          is_active?: boolean
          is_visible?: boolean | null
          metadata?: Json | null
          name: string
          name_he?: string | null
          preview_data?: string | null
          sort_order?: number
          tags?: string[] | null
          thumbnail_url?: string | null
          uploaded_by?: string | null
          width?: number | null
        }
        Update: {
          asset_type?: string
          category?: string
          created_at?: string
          data_url?: string | null
          file_url?: string
          height?: number | null
          id?: string
          is_active?: boolean
          is_visible?: boolean | null
          metadata?: Json | null
          name?: string
          name_he?: string | null
          preview_data?: string | null
          sort_order?: number
          tags?: string[] | null
          thumbnail_url?: string | null
          uploaded_by?: string | null
          width?: number | null
        }
        Relationships: []
      }
      client_photos: {
        Row: {
          created_at: string
          file_size: number | null
          file_url: string
          height: number | null
          id: string
          metadata: Json | null
          original_name: string | null
          project_id: string
          thumbnail_url: string | null
          uploaded_by: string
          width: number | null
        }
        Insert: {
          created_at?: string
          file_size?: number | null
          file_url: string
          height?: number | null
          id?: string
          metadata?: Json | null
          original_name?: string | null
          project_id: string
          thumbnail_url?: string | null
          uploaded_by: string
          width?: number | null
        }
        Update: {
          created_at?: string
          file_size?: number | null
          file_url?: string
          height?: number | null
          id?: string
          metadata?: Json | null
          original_name?: string | null
          project_id?: string
          thumbnail_url?: string | null
          uploaded_by?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "client_photos_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          language: string
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          language?: string
          role?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          language?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          admin_notes: string | null
          album_type: string
          approved_at: string | null
          client_id: string
          cover_data: Json | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
          page_count: number
          settings: Json | null
          status: string
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          album_type?: string
          approved_at?: string | null
          client_id: string
          cover_data?: Json | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          name: string
          page_count?: number
          settings?: Json | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          album_type?: string
          approved_at?: string | null
          client_id?: string
          cover_data?: Json | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          page_count?: number
          settings?: Json | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      spreads: {
        Row: {
          canvas_data: Json | null
          created_at: string
          id: string
          project_id: string
          spread_index: number
          spread_type: string
          thumbnail_url: string | null
          updated_at: string
        }
        Insert: {
          canvas_data?: Json | null
          created_at?: string
          id?: string
          project_id: string
          spread_index: number
          spread_type?: string
          thumbnail_url?: string | null
          updated_at?: string
        }
        Update: {
          canvas_data?: Json | null
          created_at?: string
          id?: string
          project_id?: string
          spread_index?: number
          spread_type?: string
          thumbnail_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "spreads_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          admin_notes: string | null
          client_message: string | null
          id: string
          project_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submitted_at: string
          submitted_by: string
        }
        Insert: {
          admin_notes?: string | null
          client_message?: string | null
          id?: string
          project_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string
          submitted_by: string
        }
        Update: {
          admin_notes?: string | null
          client_message?: string | null
          id?: string
          project_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string
          submitted_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
