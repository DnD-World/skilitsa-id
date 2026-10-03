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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      dogs: {
        Row: {
          avatar: string
          breed: string
          created_at: string
          fingerprint_id: string
          id: string
          medical_alerts: string | null
          microchip: string | null
          name: string
          owner_id: string
          owner_name: string
          photo_url: string | null
          purebred: boolean
          region: string
          scannable: boolean
          status: string
        }
        Insert: {
          avatar?: string
          breed?: string
          created_at?: string
          fingerprint_id?: string
          id?: string
          medical_alerts?: string | null
          microchip?: string | null
          name: string
          owner_id?: string
          owner_name: string
          photo_url?: string | null
          purebred?: boolean
          region?: string
          scannable?: boolean
          status?: string
        }
        Update: {
          avatar?: string
          breed?: string
          created_at?: string
          fingerprint_id?: string
          id?: string
          medical_alerts?: string | null
          microchip?: string | null
          name?: string
          owner_id?: string
          owner_name?: string
          photo_url?: string | null
          purebred?: boolean
          region?: string
          scannable?: boolean
          status?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          id: string
          label: string
          owner_id: string
          spent_on: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          id?: string
          label: string
          owner_id?: string
          spent_on?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          id?: string
          label?: string
          owner_id?: string
          spent_on?: string
        }
        Relationships: []
      }
      finder_reports: {
        Row: {
          created_at: string
          dog_id: string
          expires_at: string
          finder_email: string
          id: string
          location: string
          location_mode: string
          match_score: number
          message: string | null
          second_photo: string | null
          shelter_name: string | null
          stars: number
        }
        Insert: {
          created_at?: string
          dog_id: string
          expires_at?: string
          finder_email: string
          id?: string
          location: string
          location_mode: string
          match_score: number
          message?: string | null
          second_photo?: string | null
          shelter_name?: string | null
          stars: number
        }
        Update: {
          created_at?: string
          dog_id?: string
          expires_at?: string
          finder_email?: string
          id?: string
          location?: string
          location_mode?: string
          match_score?: number
          message?: string | null
          second_photo?: string | null
          shelter_name?: string | null
          stars?: number
        }
        Relationships: [
          {
            foreignKeyName: "finder_reports_dog_id_fkey"
            columns: ["dog_id"]
            isOneToOne: false
            referencedRelation: "dogs"
            referencedColumns: ["id"]
          },
        ]
      }
      food_bags: {
        Row: {
          bag_kg: number
          brand: string
          created_at: string
          days_lasting: number
          id: string
          opened_on: string
          owner_id: string
        }
        Insert: {
          bag_kg: number
          brand: string
          created_at?: string
          days_lasting: number
          id?: string
          opened_on?: string
          owner_id?: string
        }
        Update: {
          bag_kg?: number
          brand?: string
          created_at?: string
          days_lasting?: number
          id?: string
          opened_on?: string
          owner_id?: string
        }
        Relationships: []
      }
      health_events: {
        Row: {
          clinic: string | null
          created_at: string
          dog_id: string | null
          done: boolean
          due_on: string
          id: string
          kind: string
          owner_id: string
          title: string
        }
        Insert: {
          clinic?: string | null
          created_at?: string
          dog_id?: string | null
          done?: boolean
          due_on: string
          id?: string
          kind: string
          owner_id?: string
          title: string
        }
        Update: {
          clinic?: string | null
          created_at?: string
          dog_id?: string | null
          done?: boolean
          due_on?: string
          id?: string
          kind?: string
          owner_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_events_dog_id_fkey"
            columns: ["dog_id"]
            isOneToOne: false
            referencedRelation: "dogs"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_cards: {
        Row: {
          business: string
          code: string
          created_at: string
          format: string
          id: string
          owner_id: string
        }
        Insert: {
          business: string
          code: string
          created_at?: string
          format?: string
          id?: string
          owner_id?: string
        }
        Update: {
          business?: string
          code?: string
          created_at?: string
          format?: string
          id?: string
          owner_id?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          monthly_budget: number
          owner_id: string
        }
        Insert: {
          monthly_budget?: number
          owner_id?: string
        }
        Update: {
          monthly_budget?: number
          owner_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      scan_match: {
        Args: { _region: string }
        Returns: {
          avatar: string
          breed: string
          dog_id: string
          fingerprint_id: string
          medical_alerts: string
          name: string
          photo_url: string
          purebred: boolean
        }[]
      }
      submit_finder_report: {
        Args: {
          _dog_id: string
          _email: string
          _location: string
          _message: string
          _mode: string
          _score: number
          _second_photo: string
          _shelter: string
        }
        Returns: number
      }
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
    Enums: {},
  },
} as const
