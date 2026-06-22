// Generated — DO NOT hand-edit. Regenerate with:
// npx supabase gen types typescript --project-id iipitqtwhfdpqrluoasp > src/types/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      brands: {
        Row: {
          allowed_denominations: number[] | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          logo_url: string | null
          max_redemption_pence: number
          min_redemption_pence: number
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          allowed_denominations?: number[] | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          max_redemption_pence: number
          min_redemption_pence: number
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          allowed_denominations?: number[] | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          max_redemption_pence?: number
          min_redemption_pence?: number
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      gc_billing_requests: {
        Row: {
          created_at: string
          flow_id: string | null
          ibp_payment_id: string | null
          id: string
          mandate_id: string | null
          purpose: string
          raw: Json
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          flow_id?: string | null
          ibp_payment_id?: string | null
          id: string
          mandate_id?: string | null
          purpose?: string
          raw: Json
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          flow_id?: string | null
          ibp_payment_id?: string | null
          id?: string
          mandate_id?: string | null
          purpose?: string
          raw?: Json
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gc_billing_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gc_customers: {
        Row: {
          created_at: string
          email: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gc_customers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gc_mandates: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          next_possible_charge_date: string | null
          raw: Json
          replaced_by_mandate_id: string | null
          scheme: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id: string
          next_possible_charge_date?: string | null
          raw: Json
          replaced_by_mandate_id?: string | null
          scheme?: string
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          next_possible_charge_date?: string | null
          raw?: Json
          replaced_by_mandate_id?: string | null
          scheme?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gc_mandates_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "gc_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gc_mandates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gc_payments: {
        Row: {
          amount_pence: number
          charge_date: string | null
          created_at: string
          currency: string
          id: string
          mandate_id: string | null
          payout_id: string | null
          raw: Json
          scheme: string
          status: string
          subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_pence: number
          charge_date?: string | null
          created_at?: string
          currency?: string
          id: string
          mandate_id?: string | null
          payout_id?: string | null
          raw: Json
          scheme: string
          status: string
          subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_pence?: number
          charge_date?: string | null
          created_at?: string
          currency?: string
          id?: string
          mandate_id?: string | null
          payout_id?: string | null
          raw?: Json
          scheme?: string
          status?: string
          subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gc_payments_mandate_id_fkey"
            columns: ["mandate_id"]
            isOneToOne: false
            referencedRelation: "gc_mandates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gc_payments_payout_id_fkey"
            columns: ["payout_id"]
            isOneToOne: false
            referencedRelation: "gc_payouts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gc_payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "gc_subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gc_payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gc_payouts: {
        Row: {
          amount_pence: number
          arrival_date: string | null
          created_at: string
          currency: string
          id: string
          raw: Json
          status: string
        }
        Insert: {
          amount_pence: number
          arrival_date?: string | null
          created_at?: string
          currency?: string
          id: string
          raw: Json
          status: string
        }
        Update: {
          amount_pence?: number
          arrival_date?: string | null
          created_at?: string
          currency?: string
          id?: string
          raw?: Json
          status?: string
        }
        Relationships: []
      }
      gc_subscriptions: {
        Row: {
          amendment_count: number
          amount_pence: number
          created_at: string
          currency: string
          day_of_month: number | null
          id: string
          interval_unit: string
          mandate_id: string
          raw: Json
          start_date: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amendment_count?: number
          amount_pence: number
          created_at?: string
          currency?: string
          day_of_month?: number | null
          id: string
          interval_unit?: string
          mandate_id: string
          raw: Json
          start_date?: string | null
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amendment_count?: number
          amount_pence?: number
          created_at?: string
          currency?: string
          day_of_month?: number | null
          id?: string
          interval_unit?: string
          mandate_id?: string
          raw?: Json
          start_date?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gc_subscriptions_mandate_id_fkey"
            columns: ["mandate_id"]
            isOneToOne: false
            referencedRelation: "gc_mandates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gc_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gc_webhook_events: {
        Row: {
          action: string
          cause: string | null
          id: string
          payload: Json
          processed_at: string | null
          processing_error: string | null
          received_at: string
          resource_id: string | null
          resource_type: string
          retry_count: number
        }
        Insert: {
          action: string
          cause?: string | null
          id: string
          payload: Json
          processed_at?: string | null
          processing_error?: string | null
          received_at?: string
          resource_id?: string | null
          resource_type: string
          retry_count?: number
        }
        Update: {
          action?: string
          cause?: string | null
          id?: string
          payload?: Json
          processed_at?: string | null
          processing_error?: string | null
          received_at?: string
          resource_id?: string | null
          resource_type?: string
          retry_count?: number
        }
        Relationships: []
      }
      ledger_entries: {
        Row: {
          amount_pence: number
          created_at: string
          description: string
          entry_type: string
          id: string
          idempotency_key: string
          is_credit: boolean
          source_id: string
          source_type: string
          user_id: string
        }
        Insert: {
          amount_pence: number
          created_at?: string
          description: string
          entry_type: string
          id?: string
          idempotency_key: string
          is_credit?: boolean
          source_id: string
          source_type: string
          user_id: string
        }
        Update: {
          amount_pence?: number
          created_at?: string
          description?: string
          entry_type?: string
          id?: string
          idempotency_key?: string
          is_credit?: boolean
          source_id?: string
          source_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ledger_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          is_admin: boolean
          onboarding_status: string
          pledge_amount_pence: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id: string
          is_admin?: boolean
          onboarding_status?: string
          pledge_amount_pence?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_admin?: boolean
          onboarding_status?: string
          pledge_amount_pence?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      redemption_fulfillments: {
        Row: {
          admin_notes: string | null
          created_at: string
          created_by: string | null
          id: string
          instructions: string | null
          request_id: string
          voucher_code: string
          voucher_pin: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          instructions?: string | null
          request_id: string
          voucher_code: string
          voucher_pin?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          instructions?: string | null
          request_id?: string
          voucher_code?: string
          voucher_pin?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "redemption_fulfillments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "redemption_fulfillments_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: true
            referencedRelation: "redemption_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      redemption_requests: {
        Row: {
          amount_pence: number
          brand_id: string
          claimed_by: string | null
          created_at: string
          expires_at: string
          failed_at: string | null
          failure_reason: string | null
          fulfilled_at: string | null
          fulfilling_at: string | null
          id: string
          requested_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_pence: number
          brand_id: string
          claimed_by?: string | null
          created_at?: string
          expires_at?: string
          failed_at?: string | null
          failure_reason?: string | null
          fulfilled_at?: string | null
          fulfilling_at?: string | null
          id?: string
          requested_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_pence?: number
          brand_id?: string
          claimed_by?: string | null
          created_at?: string
          expires_at?: string
          failed_at?: string | null
          failure_reason?: string | null
          fulfilled_at?: string | null
          fulfilling_at?: string | null
          id?: string
          requested_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "redemption_requests_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "redemption_requests_claimed_by_fkey"
            columns: ["claimed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "redemption_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_balance_cache: {
        Row: {
          balance_pence: number
          last_entry_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          balance_pence?: number
          last_entry_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          balance_pence?: number
          last_entry_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_balance_cache_last_entry_id_fkey"
            columns: ["last_entry_id"]
            isOneToOne: false
            referencedRelation: "ledger_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_balance_cache_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      user_balances: {
        Row: {
          balance_pence: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ledger_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      admin_claim_redemption: {
        Args: { p_request_id: string }
        Returns: undefined
      }
      admin_fail_redemption: {
        Args: { p_failure_reason: string; p_request_id: string }
        Returns: undefined
      }
      expire_pending_redemptions: { Args: never; Returns: number }
      is_admin: { Args: never; Returns: boolean }
      request_redemption: {
        Args: { p_amount_pence: number; p_brand_id: string }
        Returns: string
      }
      transition_redemption: {
        Args: {
          p_actor?: string
          p_failure_reason?: string
          p_new_status: string
          p_request_id: string
        }
        Returns: undefined
      }
      update_my_pledge: { Args: { p_amount_pence: number }; Returns: undefined }
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
