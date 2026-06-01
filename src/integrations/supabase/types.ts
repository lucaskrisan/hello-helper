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
      daily_challenges: {
        Row: {
          completed_at: string | null
          correct_answers: number | null
          date: string
          id: string
          score: number | null
          total_questions: number | null
          total_time: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          correct_answers?: number | null
          date?: string
          id?: string
          score?: number | null
          total_questions?: number | null
          total_time?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          correct_answers?: number | null
          date?: string
          id?: string
          score?: number | null
          total_questions?: number | null
          total_time?: number | null
          user_id?: string
        }
        Relationships: []
      }
      exercise_history: {
        Row: {
          category: string
          id: string
          item_id: string
          session_id: string | null
          used_at: string | null
          user_id: string | null
        }
        Insert: {
          category: string
          id?: string
          item_id: string
          session_id?: string | null
          used_at?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string
          id?: string
          item_id?: string
          session_id?: string | null
          used_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      exercise_results: {
        Row: {
          challenge_id: string | null
          correct: number | null
          created_at: string
          exercise_type: string
          id: string
          score: number | null
          time_spent: number | null
          total: number | null
          user_id: string
        }
        Insert: {
          challenge_id?: string | null
          correct?: number | null
          created_at?: string
          exercise_type: string
          id?: string
          score?: number | null
          time_spent?: number | null
          total?: number | null
          user_id: string
        }
        Update: {
          challenge_id?: string | null
          correct?: number | null
          created_at?: string
          exercise_type?: string
          id?: string
          score?: number | null
          time_spent?: number | null
          total?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_results_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "daily_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      funnel_events: {
        Row: {
          created_at: string
          event_name: string
          id: string
          metadata: Json | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_name: string
          id?: string
          metadata?: Json | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_name?: string
          id?: string
          metadata?: Json | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      payment_events: {
        Row: {
          amount_total: number | null
          created_at: string
          currency: string | null
          event_type: string
          external_id: string | null
          id: string
          raw_payload: Json | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          amount_total?: number | null
          created_at?: string
          currency?: string | null
          event_type: string
          external_id?: string | null
          id?: string
          raw_payload?: Json | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          amount_total?: number | null
          created_at?: string
          currency?: string | null
          event_type?: string
          external_id?: string | null
          id?: string
          raw_payload?: Json | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age_range: string | null
          created_at: string
          id: string
          is_admin: boolean | null
          is_premium: boolean | null
          last_sign_in_at: string | null
          main_goal: string | null
          name: string | null
          trial_ends_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age_range?: string | null
          created_at?: string
          id?: string
          is_admin?: boolean | null
          is_premium?: boolean | null
          last_sign_in_at?: string | null
          main_goal?: string | null
          name?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age_range?: string | null
          created_at?: string
          id?: string
          is_admin?: boolean | null
          is_premium?: boolean | null
          last_sign_in_at?: string | null
          main_goal?: string | null
          name?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      streaks: {
        Row: {
          best_streak: number | null
          current_streak: number | null
          id: string
          last_completed_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          best_streak?: number | null
          current_streak?: number | null
          id?: string
          last_completed_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          best_streak?: number | null
          current_streak?: number | null
          id?: string
          last_completed_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          id: string
          plan: string | null
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          plan?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          plan?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          font_size: string | null
          id: string
          language: string | null
          notifications_enabled: boolean | null
          theme: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          font_size?: string | null
          id?: string
          language?: string | null
          notifications_enabled?: boolean | null
          theme?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          font_size?: string | null
          id?: string
          language?: string | null
          notifications_enabled?: boolean | null
          theme?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
