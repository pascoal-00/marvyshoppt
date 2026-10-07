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
      ads: {
        Row: {
          active: boolean
          created_at: string
          cta_label: string
          id: string
          image_url: string | null
          link_url: string | null
          placement: string
          sort_order: number
          subtitle: string
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          cta_label?: string
          id?: string
          image_url?: string | null
          link_url?: string | null
          placement?: string
          sort_order?: number
          subtitle?: string
          title?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          cta_label?: string
          id?: string
          image_url?: string | null
          link_url?: string | null
          placement?: string
          sort_order?: number
          subtitle?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          active: boolean
          created_at: string
          id: string
          image_url: string | null
          label: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          image_url?: string | null
          label: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          image_url?: string | null
          label?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          size: string
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          quantity?: number
          size: string
          unit_price?: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          size?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address_line: string
          city: string
          contact: string | null
          country: string
          created_at: string
          currency: string
          customer_email: string
          customer_name: string
          customer_phone: string
          id: string
          note: string | null
          order_number: string
          postal_code: string
          shipping: number
          status: string
          subtotal: number
          updated_at: string
        }
        Insert: {
          address_line?: string
          city?: string
          contact?: string | null
          country?: string
          created_at?: string
          currency?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          id?: string
          note?: string | null
          order_number?: string
          postal_code?: string
          shipping?: number
          status?: string
          subtotal?: number
          updated_at?: string
        }
        Update: {
          address_line?: string
          city?: string
          contact?: string | null
          country?: string
          created_at?: string
          currency?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          id?: string
          note?: string | null
          order_number?: string
          postal_code?: string
          shipping?: number
          status?: string
          subtotal?: number
          updated_at?: string
        }
        Relationships: []
      }
      product_variants: {
        Row: {
          active: boolean
          color_hex: string
          color_name: string
          color_slug: string
          created_at: string
          id: string
          images: string[]
          product_id: string
          sku: string
          sort_order: number
          stock: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          color_hex?: string
          color_name: string
          color_slug: string
          created_at?: string
          id?: string
          images?: string[]
          product_id: string
          sku?: string
          sort_order?: number
          stock?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          color_hex?: string
          color_name?: string
          color_slug?: string
          created_at?: string
          id?: string
          images?: string[]
          product_id?: string
          sku?: string
          sort_order?: number
          stock?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          availability: string
          best_seller: boolean
          category_slug: string
          compare_at_price: number | null
          created_at: string
          currency: string
          description: string
          details: string[]
          featured: boolean
          id: string
          images: string[]
          is_new: boolean
          name: string
          on_sale: boolean
          price: number
          product_type: string
          sizes: string[]
          slug: string
          sort_order: number
          style: string
          subcategory: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          availability?: string
          best_seller?: boolean
          category_slug?: string
          compare_at_price?: number | null
          created_at?: string
          currency?: string
          description?: string
          details?: string[]
          featured?: boolean
          id?: string
          images?: string[]
          is_new?: boolean
          name: string
          on_sale?: boolean
          price?: number
          product_type?: string
          sizes?: string[]
          slug: string
          sort_order?: number
          style?: string
          subcategory?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          availability?: string
          best_seller?: boolean
          category_slug?: string
          compare_at_price?: number | null
          created_at?: string
          currency?: string
          description?: string
          details?: string[]
          featured?: boolean
          id?: string
          images?: string[]
          is_new?: boolean
          name?: string
          on_sale?: boolean
          price?: number
          product_type?: string
          sizes?: string[]
          slug?: string
          sort_order?: number
          style?: string
          subcategory?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      site_images: {
        Row: {
          active: boolean
          alt: string
          created_at: string
          id: string
          image_url: string | null
          slot: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          alt?: string
          created_at?: string
          id?: string
          image_url?: string | null
          slot: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          alt?: string
          created_at?: string
          id?: string
          image_url?: string | null
          slot?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      store_settings: {
        Row: {
          created_at: string
          currency: string
          delivery_time: string
          free_shipping_over: number
          id: boolean
          replica_notice: string
          shipping_base: number
          shipping_extra: number
          shipping_from: string
          shipping_note: string
          store_name: string
          updated_at: string
          whatsapp_number: string
        }
        Insert: {
          created_at?: string
          currency?: string
          delivery_time?: string
          free_shipping_over?: number
          id?: boolean
          replica_notice?: string
          shipping_base?: number
          shipping_extra?: number
          shipping_from?: string
          shipping_note?: string
          store_name?: string
          updated_at?: string
          whatsapp_number?: string
        }
        Update: {
          created_at?: string
          currency?: string
          delivery_time?: string
          free_shipping_over?: number
          id?: boolean
          replica_notice?: string
          shipping_base?: number
          shipping_extra?: number
          shipping_from?: string
          shipping_note?: string
          store_name?: string
          updated_at?: string
          whatsapp_number?: string
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
      calc_shipping: {
        Args: { _subtotal: number; _units: number }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      place_order: { Args: { _customer: Json; _items: Json }; Returns: Json }
    }
    Enums: {
      app_role: "admin" | "staff"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "staff"],
    },
  },
} as const
