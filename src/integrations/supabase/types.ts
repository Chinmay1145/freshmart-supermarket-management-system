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
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: string | null
          entity: string | null
          id: string
          module: string
          user_email: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: string | null
          entity?: string | null
          id?: string
          module: string
          user_email?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: string | null
          entity?: string | null
          id?: string
          module?: string
          user_email?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          parent_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          parent_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          parent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          id: string
          is_active: boolean
          last_purchase_at: string | null
          loyalty_points: number
          name: string
          outstanding_balance: number
          phone: string | null
          total_purchases: number
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          last_purchase_at?: string | null
          loyalty_points?: number
          name: string
          outstanding_balance?: number
          phone?: string | null
          total_purchases?: number
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          last_purchase_at?: string | null
          loyalty_points?: number
          name?: string
          outstanding_balance?: number
          phone?: string | null
          total_purchases?: number
          updated_at?: string
        }
        Relationships: []
      }
      discounts: {
        Row: {
          applies_to: string | null
          code: string | null
          created_at: string
          discount_type: Database["public"]["Enums"]["discount_type"]
          end_date: string | null
          id: string
          is_active: boolean
          max_discount: number | null
          min_purchase: number
          name: string
          start_date: string
          usage_limit: number | null
          used_count: number
          value: number
        }
        Insert: {
          applies_to?: string | null
          code?: string | null
          created_at?: string
          discount_type?: Database["public"]["Enums"]["discount_type"]
          end_date?: string | null
          id?: string
          is_active?: boolean
          max_discount?: number | null
          min_purchase?: number
          name: string
          start_date?: string
          usage_limit?: number | null
          used_count?: number
          value?: number
        }
        Update: {
          applies_to?: string | null
          code?: string | null
          created_at?: string
          discount_type?: Database["public"]["Enums"]["discount_type"]
          end_date?: string | null
          id?: string
          is_active?: boolean
          max_discount?: number | null
          min_purchase?: number
          name?: string
          start_date?: string
          usage_limit?: number | null
          used_count?: number
          value?: number
        }
        Relationships: []
      }
      employees: {
        Row: {
          created_at: string
          department: string | null
          email: string | null
          employee_code: string
          id: string
          is_active: boolean
          joining_date: string
          name: string
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          salary: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          department?: string | null
          email?: string | null
          employee_code: string
          id?: string
          is_active?: boolean
          joining_date?: string
          name: string
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          salary?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          department?: string | null
          email?: string | null
          employee_code?: string
          id?: string
          is_active?: boolean
          joining_date?: string
          name?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          salary?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          added_by: string | null
          amount: number
          category: string
          created_at: string
          description: string | null
          expense_date: string
          id: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          title: string
        }
        Insert: {
          added_by?: string | null
          amount?: number
          category?: string
          created_at?: string
          description?: string | null
          expense_date?: string
          id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          title: string
        }
        Update: {
          added_by?: string | null
          amount?: number
          category?: string
          created_at?: string
          description?: string | null
          expense_date?: string
          id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          title?: string
        }
        Relationships: []
      }
      inventory_movements: {
        Row: {
          created_at: string
          difference: number
          id: string
          movement_type: string
          new_qty: number
          performed_by: string | null
          previous_qty: number
          product_id: string | null
          product_name: string | null
          reason: string | null
        }
        Insert: {
          created_at?: string
          difference?: number
          id?: string
          movement_type?: string
          new_qty?: number
          performed_by?: string | null
          previous_qty?: number
          product_id?: string | null
          product_name?: string | null
          reason?: string | null
        }
        Update: {
          created_at?: string
          difference?: number
          id?: string
          movement_type?: string
          new_qty?: number
          performed_by?: string | null
          previous_qty?: number
          product_id?: string | null
          product_name?: string | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string | null
          title: string
          type?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          barcode: string | null
          brand: string | null
          category_id: string | null
          created_at: string
          description: string | null
          discount: number
          expiry_date: string | null
          id: string
          image_url: string | null
          is_active: boolean
          location: string | null
          max_stock: number
          min_stock: number
          mrp: number
          name: string
          purchase_price: number
          selling_price: number
          sku: string
          stock: number
          supplier_id: string | null
          tax_rate: number
          unit: string
          updated_at: string
        }
        Insert: {
          barcode?: string | null
          brand?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          discount?: number
          expiry_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          location?: string | null
          max_stock?: number
          min_stock?: number
          mrp?: number
          name: string
          purchase_price?: number
          selling_price?: number
          sku: string
          stock?: number
          supplier_id?: string | null
          tax_rate?: number
          unit?: string
          updated_at?: string
        }
        Update: {
          barcode?: string | null
          brand?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          discount?: number
          expiry_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          location?: string | null
          max_stock?: number
          min_stock?: number
          mrp?: number
          name?: string
          purchase_price?: number
          selling_price?: number
          sku?: string
          stock?: number
          supplier_id?: string | null
          tax_rate?: number
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      purchase_items: {
        Row: {
          id: string
          product_id: string | null
          product_name: string
          purchase_id: string
          quantity: number
          total: number
          unit_cost: number
        }
        Insert: {
          id?: string
          product_id?: string | null
          product_name: string
          purchase_id: string
          quantity?: number
          total?: number
          unit_cost?: number
        }
        Update: {
          id?: string
          product_id?: string | null
          product_name?: string
          purchase_id?: string
          quantity?: number
          total?: number
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_items_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      purchases: {
        Row: {
          created_at: string
          discount_amount: number
          id: string
          invoice_number: string | null
          notes: string | null
          payment_status: string
          purchase_date: string
          purchase_number: string
          status: Database["public"]["Enums"]["purchase_status"]
          subtotal: number
          supplier_id: string | null
          supplier_name: string | null
          tax_amount: number
          total: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          discount_amount?: number
          id?: string
          invoice_number?: string | null
          notes?: string | null
          payment_status?: string
          purchase_date?: string
          purchase_number: string
          status?: Database["public"]["Enums"]["purchase_status"]
          subtotal?: number
          supplier_id?: string | null
          supplier_name?: string | null
          tax_amount?: number
          total?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          discount_amount?: number
          id?: string
          invoice_number?: string | null
          notes?: string | null
          payment_status?: string
          purchase_date?: string
          purchase_number?: string
          status?: Database["public"]["Enums"]["purchase_status"]
          subtotal?: number
          supplier_id?: string | null
          supplier_name?: string | null
          tax_amount?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      return_items: {
        Row: {
          id: string
          product_id: string | null
          product_name: string
          quantity: number
          return_id: string
          total: number
          unit_price: number
        }
        Insert: {
          id?: string
          product_id?: string | null
          product_name: string
          quantity?: number
          return_id: string
          total?: number
          unit_price?: number
        }
        Update: {
          id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          return_id?: string
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "return_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "return_items_return_id_fkey"
            columns: ["return_id"]
            isOneToOne: false
            referencedRelation: "returns"
            referencedColumns: ["id"]
          },
        ]
      }
      returns: {
        Row: {
          created_at: string
          customer_name: string | null
          id: string
          invoice_number: string | null
          processed_by: string | null
          reason: string | null
          refund_amount: number
          return_number: string
          sale_id: string | null
          status: Database["public"]["Enums"]["return_status"]
        }
        Insert: {
          created_at?: string
          customer_name?: string | null
          id?: string
          invoice_number?: string | null
          processed_by?: string | null
          reason?: string | null
          refund_amount?: number
          return_number: string
          sale_id?: string | null
          status?: Database["public"]["Enums"]["return_status"]
        }
        Update: {
          created_at?: string
          customer_name?: string | null
          id?: string
          invoice_number?: string | null
          processed_by?: string | null
          reason?: string | null
          refund_amount?: number
          return_number?: string
          sale_id?: string | null
          status?: Database["public"]["Enums"]["return_status"]
        }
        Relationships: [
          {
            foreignKeyName: "returns_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_items: {
        Row: {
          discount: number
          id: string
          product_id: string | null
          product_name: string
          quantity: number
          sale_id: string
          sku: string | null
          tax_rate: number
          total: number
          unit_price: number
        }
        Insert: {
          discount?: number
          id?: string
          product_id?: string | null
          product_name: string
          quantity?: number
          sale_id: string
          sku?: string | null
          tax_rate?: number
          total?: number
          unit_price?: number
        }
        Update: {
          discount?: number
          id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          sale_id?: string
          sku?: string | null
          tax_rate?: number
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          amount_paid: number
          cashier_id: string | null
          cashier_name: string | null
          change_due: number
          created_at: string
          customer_id: string | null
          customer_name: string | null
          discount_amount: number
          id: string
          invoice_number: string
          notes: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          status: Database["public"]["Enums"]["sale_status"]
          subtotal: number
          tax_amount: number
          total: number
        }
        Insert: {
          amount_paid?: number
          cashier_id?: string | null
          cashier_name?: string | null
          change_due?: number
          created_at?: string
          customer_id?: string | null
          customer_name?: string | null
          discount_amount?: number
          id?: string
          invoice_number: string
          notes?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"]
          status?: Database["public"]["Enums"]["sale_status"]
          subtotal?: number
          tax_amount?: number
          total?: number
        }
        Update: {
          amount_paid?: number
          cashier_id?: string | null
          cashier_name?: string | null
          change_due?: number
          created_at?: string
          customer_id?: string | null
          customer_name?: string | null
          discount_amount?: number
          id?: string
          invoice_number?: string
          notes?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"]
          status?: Database["public"]["Enums"]["sale_status"]
          subtotal?: number
          tax_amount?: number
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      store_settings: {
        Row: {
          address: string | null
          auto_print: boolean
          currency: string | null
          default_tax: number
          email: string | null
          gst_number: string | null
          id: string
          invoice_prefix: string | null
          logo_url: string | null
          phone: string | null
          store_name: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          auto_print?: boolean
          currency?: string | null
          default_tax?: number
          email?: string | null
          gst_number?: string | null
          id?: string
          invoice_prefix?: string | null
          logo_url?: string | null
          phone?: string | null
          store_name?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          auto_print?: boolean
          currency?: string | null
          default_tax?: number
          email?: string | null
          gst_number?: string | null
          id?: string
          invoice_prefix?: string | null
          logo_url?: string | null
          phone?: string | null
          store_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          address: string | null
          company: string | null
          created_at: string
          email: string | null
          gst_number: string | null
          id: string
          is_active: boolean
          name: string
          outstanding_amount: number
          payment_terms: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          gst_number?: string | null
          id?: string
          is_active?: boolean
          name: string
          outstanding_amount?: number
          payment_terms?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          gst_number?: string | null
          id?: string
          is_active?: boolean
          name?: string
          outstanding_amount?: number
          payment_terms?: string | null
          phone?: string | null
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "super_admin" | "manager" | "cashier" | "inventory_staff"
      discount_type: "percentage" | "fixed" | "bxgy"
      payment_method:
        | "cash"
        | "card"
        | "upi"
        | "wallet"
        | "split"
        | "bank_transfer"
      purchase_status:
        | "draft"
        | "ordered"
        | "received"
        | "partially_received"
        | "cancelled"
      return_status: "requested" | "approved" | "completed" | "rejected"
      sale_status: "completed" | "held" | "refunded" | "cancelled"
      stock_status: "in_stock" | "low_stock" | "out_of_stock" | "overstocked"
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
      app_role: ["super_admin", "manager", "cashier", "inventory_staff"],
      discount_type: ["percentage", "fixed", "bxgy"],
      payment_method: [
        "cash",
        "card",
        "upi",
        "wallet",
        "split",
        "bank_transfer",
      ],
      purchase_status: [
        "draft",
        "ordered",
        "received",
        "partially_received",
        "cancelled",
      ],
      return_status: ["requested", "approved", "completed", "rejected"],
      sale_status: ["completed", "held", "refunded", "cancelled"],
      stock_status: ["in_stock", "low_stock", "out_of_stock", "overstocked"],
    },
  },
} as const
