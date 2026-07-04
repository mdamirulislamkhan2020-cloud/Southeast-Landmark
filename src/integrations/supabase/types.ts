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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      blog_posts: {
        Row: {
          author: string
          categories: Json
          content: string
          created_at: string
          excerpt: string
          featured_image: string | null
          id: string
          og: Json
          publish_at: string | null
          published_at: string | null
          reading_time: number
          seo: Json
          slug: string
          status: string
          tags: Json
          title: string
          updated_at: string
        }
        Insert: {
          author?: string
          categories?: Json
          content?: string
          created_at?: string
          excerpt?: string
          featured_image?: string | null
          id?: string
          og?: Json
          publish_at?: string | null
          published_at?: string | null
          reading_time?: number
          seo?: Json
          slug: string
          status?: string
          tags?: Json
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          categories?: Json
          content?: string
          created_at?: string
          excerpt?: string
          featured_image?: string | null
          id?: string
          og?: Json
          publish_at?: string | null
          published_at?: string | null
          reading_time?: number
          seo?: Json
          slug?: string
          status?: string
          tags?: Json
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      crm_assignees: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name: string
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      faqs: {
        Row: {
          active: boolean
          answer: string
          category: string
          created_at: string
          id: string
          question: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          answer?: string
          category?: string
          created_at?: string
          id?: string
          question: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          answer?: string
          category?: string
          created_at?: string
          id?: string
          question?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      forms: {
        Row: {
          created_at: string
          design: Json
          fields: Json
          id: string
          multi_step: boolean
          name: string
          settings: Json
          show_progress: boolean
          slug: string
          status: string
          steps: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          design?: Json
          fields?: Json
          id?: string
          multi_step?: boolean
          name?: string
          settings?: Json
          show_progress?: boolean
          slug: string
          status?: string
          steps?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          design?: Json
          fields?: Json
          id?: string
          multi_step?: boolean
          name?: string
          settings?: Json
          show_progress?: boolean
          slug?: string
          status?: string
          steps?: Json
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          analytics: Json
          answers: Json
          assigned_to: string | null
          attachments: Json
          code: string
          communications: Json
          created_at: string
          email: string
          form_id: string | null
          form_name: string | null
          id: string
          lead_page_id: string | null
          lead_page_slug: string | null
          name: string
          notes: Json
          phone: string
          score: number
          source: string
          status: string
          tasks: Json
          timeline: Json
          updated_at: string
        }
        Insert: {
          analytics?: Json
          answers?: Json
          assigned_to?: string | null
          attachments?: Json
          code: string
          communications?: Json
          created_at?: string
          email?: string
          form_id?: string | null
          form_name?: string | null
          id?: string
          lead_page_id?: string | null
          lead_page_slug?: string | null
          name?: string
          notes?: Json
          phone?: string
          score?: number
          source?: string
          status?: string
          tasks?: Json
          timeline?: Json
          updated_at?: string
        }
        Update: {
          analytics?: Json
          answers?: Json
          assigned_to?: string | null
          attachments?: Json
          code?: string
          communications?: Json
          created_at?: string
          email?: string
          form_id?: string | null
          form_name?: string | null
          id?: string
          lead_page_id?: string | null
          lead_page_slug?: string | null
          name?: string
          notes?: Json
          phone?: string
          score?: number
          source?: string
          status?: string
          tasks?: Json
          timeline?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "crm_assignees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      menus: {
        Row: {
          created_at: string
          description: string
          enabled: boolean
          id: string
          items: Json
          location: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          enabled?: boolean
          id?: string
          items?: Json
          location?: string
          name?: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          enabled?: boolean
          id?: string
          items?: Json
          location?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      nav_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      pages: {
        Row: {
          archived_at: string | null
          blocks: Json
          canonical: string | null
          content: string
          created_at: string
          created_by: string | null
          form_id: string | null
          id: string
          og_image: string | null
          parent_id: string | null
          publish_at: string | null
          published_at: string | null
          seo_description: string
          seo_keywords: string | null
          seo_title: string
          show_in_nav: boolean
          slug: string
          status: Database["public"]["Enums"]["page_status"]
          template: Database["public"]["Enums"]["page_template"]
          title: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          blocks?: Json
          canonical?: string | null
          content?: string
          created_at?: string
          created_by?: string | null
          form_id?: string | null
          id?: string
          og_image?: string | null
          parent_id?: string | null
          publish_at?: string | null
          published_at?: string | null
          seo_description?: string
          seo_keywords?: string | null
          seo_title?: string
          show_in_nav?: boolean
          slug: string
          status?: Database["public"]["Enums"]["page_status"]
          template?: Database["public"]["Enums"]["page_template"]
          title: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          blocks?: Json
          canonical?: string | null
          content?: string
          created_at?: string
          created_by?: string | null
          form_id?: string | null
          id?: string
          og_image?: string | null
          parent_id?: string | null
          publish_at?: string | null
          published_at?: string | null
          seo_description?: string
          seo_keywords?: string | null
          seo_title?: string
          show_in_nav?: boolean
          slug?: string
          status?: Database["public"]["Enums"]["page_status"]
          template?: Database["public"]["Enums"]["page_template"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pages_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active: boolean
          avatar: string | null
          created_at: string
          email: string
          id: string
          last_login: string | null
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          avatar?: string | null
          created_at?: string
          email?: string
          id: string
          last_login?: string | null
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          avatar?: string | null
          created_at?: string
          email?: string
          id?: string
          last_login?: string | null
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          amenities: Json
          brochure_url: string | null
          category: string
          created_at: string
          description: string
          details: Json
          featured: boolean
          featured_image: string | null
          floor_plan: string | null
          gallery: Json
          id: string
          investment: Json
          lead_form_id: string | null
          listing_status: string
          location: Json
          pricing: Json
          published_at: string | null
          seo: Json
          slug: string
          status: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          amenities?: Json
          brochure_url?: string | null
          category?: string
          created_at?: string
          description?: string
          details?: Json
          featured?: boolean
          featured_image?: string | null
          floor_plan?: string | null
          gallery?: Json
          id?: string
          investment?: Json
          lead_form_id?: string | null
          listing_status?: string
          location?: Json
          pricing?: Json
          published_at?: string | null
          seo?: Json
          slug: string
          status?: string
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          amenities?: Json
          brochure_url?: string | null
          category?: string
          created_at?: string
          description?: string
          details?: Json
          featured?: boolean
          featured_image?: string | null
          floor_plan?: string | null
          gallery?: Json
          id?: string
          investment?: Json
          lead_form_id?: string | null
          listing_status?: string
          location?: Json
          pricing?: Json
          published_at?: string | null
          seo?: Json
          slug?: string
          status?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          active: boolean
          company: string
          created_at: string
          id: string
          image: string | null
          name: string
          position: string
          rating: number
          review: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          company?: string
          created_at?: string
          id?: string
          image?: string | null
          name: string
          position?: string
          rating?: number
          review?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          company?: string
          created_at?: string
          id?: string
          image?: string | null
          name?: string
          position?: string
          rating?: number
          review?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bootstrap_first_admin: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "manager" | "editor" | "sales"
      page_status: "draft" | "published" | "scheduled" | "archived"
      page_template:
        | "standard"
        | "builder"
        | "blank"
        | "landing"
        | "contact"
        | "blog"
        | "full_width"
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
    Enums: {
      app_role: ["super_admin", "admin", "manager", "editor", "sales"],
      page_status: ["draft", "published", "scheduled", "archived"],
      page_template: [
        "standard",
        "builder",
        "blank",
        "landing",
        "contact",
        "blog",
        "full_width",
      ],
    },
  },
} as const
