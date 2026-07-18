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
      activities: {
        Row: {
          avg_hr: number | null
          avg_pace_s_per_km: number | null
          created_at: string
          distance_m: number | null
          elapsed_s: number
          elevation_gain_m: number | null
          id: string
          max_hr: number | null
          modality: string
          moving_s: number | null
          notes: string | null
          pool_length_m: number | null
          source: string
          srpe: number | null
          started_at: string
          status: string
          stroke: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avg_hr?: number | null
          avg_pace_s_per_km?: number | null
          created_at?: string
          distance_m?: number | null
          elapsed_s: number
          elevation_gain_m?: number | null
          id?: string
          max_hr?: number | null
          modality?: string
          moving_s?: number | null
          notes?: string | null
          pool_length_m?: number | null
          source?: string
          srpe?: number | null
          started_at: string
          status?: string
          stroke?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avg_hr?: number | null
          avg_pace_s_per_km?: number | null
          created_at?: string
          distance_m?: number | null
          elapsed_s?: number
          elevation_gain_m?: number | null
          id?: string
          max_hr?: number | null
          modality?: string
          moving_s?: number | null
          notes?: string | null
          pool_length_m?: number | null
          source?: string
          srpe?: number | null
          started_at?: string
          status?: string
          stroke?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      activity_metrics: {
        Row: {
          activity_id: string
          avg_pace_s_per_100m: number | null
          computed_at: string
          confidence: number | null
          hrtss: number | null
          id: string
          methodology_version: string
          rtss: number | null
          session_load: number | null
          splits: Json | null
          srpe_load: number | null
          stss: number | null
          time_in_zone: Json | null
          tonnage_kg: number | null
          trimp: number | null
          user_id: string
        }
        Insert: {
          activity_id: string
          avg_pace_s_per_100m?: number | null
          computed_at?: string
          confidence?: number | null
          hrtss?: number | null
          id?: string
          methodology_version: string
          rtss?: number | null
          session_load?: number | null
          splits?: Json | null
          srpe_load?: number | null
          stss?: number | null
          time_in_zone?: Json | null
          tonnage_kg?: number | null
          trimp?: number | null
          user_id: string
        }
        Update: {
          activity_id?: string
          avg_pace_s_per_100m?: number | null
          computed_at?: string
          confidence?: number | null
          hrtss?: number | null
          id?: string
          methodology_version?: string
          rtss?: number | null
          session_load?: number | null
          splits?: Json | null
          srpe_load?: number | null
          stss?: number | null
          time_in_zone?: Json | null
          tonnage_kg?: number | null
          trimp?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_metrics_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          created_at: string
          equipment: string
          id: string
          muscle_group: string
          name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          equipment: string
          id?: string
          muscle_group: string
          name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          equipment?: string
          id?: string
          muscle_group?: string
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      strength_sets: {
        Row: {
          activity_id: string
          created_at: string
          exercise_id: string
          id: string
          reps: number
          rpe: number | null
          set_number: number
          user_id: string
          weight_kg: number
        }
        Insert: {
          activity_id: string
          created_at?: string
          exercise_id: string
          id?: string
          reps: number
          rpe?: number | null
          set_number: number
          user_id: string
          weight_kg?: number
        }
        Update: {
          activity_id?: string
          created_at?: string
          exercise_id?: string
          id?: string
          reps?: number
          rpe?: number | null
          set_number?: number
          user_id?: string
          weight_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "strength_sets_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "strength_sets_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      swim_segments: {
        Row: {
          activity_id: string
          created_at: string
          distance_m: number
          elapsed_s: number
          id: string
          segment_number: number
          stroke: string
          user_id: string
        }
        Insert: {
          activity_id: string
          created_at?: string
          distance_m: number
          elapsed_s: number
          id?: string
          segment_number: number
          stroke: string
          user_id: string
        }
        Update: {
          activity_id?: string
          created_at?: string
          distance_m?: number
          elapsed_s?: number
          id?: string
          segment_number?: number
          stroke?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "swim_segments_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      swim_tests: {
        Row: {
          confidence: number
          created_at: string
          css_pace_s_per_100m: number
          id: string
          pool_length_m: number
          t200_s: number
          t400_s: number
          tested_at: string
          user_id: string
        }
        Insert: {
          confidence?: number
          created_at?: string
          css_pace_s_per_100m: number
          id?: string
          pool_length_m: number
          t200_s: number
          t400_s: number
          tested_at?: string
          user_id: string
        }
        Update: {
          confidence?: number
          created_at?: string
          css_pace_s_per_100m?: number
          id?: string
          pool_length_m?: number
          t200_s?: number
          t400_s?: number
          tested_at?: string
          user_id?: string
        }
        Relationships: []
      }
      coach_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_load: {
        Row: {
          acwr: number | null
          acwr_alert: boolean
          atl: number
          computed_at: string
          ctl: number
          daily_load: number
          day: string
          id: string
          methodology_version: string
          tsb: number
          user_id: string
        }
        Insert: {
          acwr?: number | null
          acwr_alert?: boolean
          atl?: number
          computed_at?: string
          ctl?: number
          daily_load?: number
          day: string
          id?: string
          methodology_version: string
          tsb?: number
          user_id: string
        }
        Update: {
          acwr?: number | null
          acwr_alert?: boolean
          atl?: number
          computed_at?: string
          ctl?: number
          daily_load?: number
          day?: string
          id?: string
          methodology_version?: string
          tsb?: number
          user_id?: string
        }
        Relationships: []
      }
      planned_workouts: {
        Row: {
          created_at: string
          day: string
          description: string | null
          distance_m: number | null
          duration_s: number | null
          id: string
          matched_activity_id: string | null
          plan_id: string
          status: string
          target_zone: string | null
          title: string
          type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          day: string
          description?: string | null
          distance_m?: number | null
          duration_s?: number | null
          id?: string
          matched_activity_id?: string | null
          plan_id: string
          status?: string
          target_zone?: string | null
          title: string
          type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          day?: string
          description?: string | null
          distance_m?: number | null
          duration_s?: number | null
          id?: string
          matched_activity_id?: string | null
          plan_id?: string
          status?: string
          target_zone?: string | null
          title?: string
          type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "planned_workouts_matched_activity_id_fkey"
            columns: ["matched_activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planned_workouts_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          created_at: string
          id: string
          phase: string | null
          race_date: string | null
          race_distance_m: number | null
          race_name: string | null
          target_time_s: number | null
          total_weeks: number | null
          updated_at: string
          user_id: string
          week: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          phase?: string | null
          race_date?: string | null
          race_distance_m?: number | null
          race_name?: string | null
          target_time_s?: number | null
          total_weeks?: number | null
          updated_at?: string
          user_id: string
          week?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          phase?: string | null
          race_date?: string | null
          race_distance_m?: number | null
          race_name?: string | null
          target_time_s?: number | null
          total_weeks?: number | null
          updated_at?: string
          user_id?: string
          week?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          birth_date: string | null
          consent_analytics: boolean
          consent_marketing: boolean
          consent_share_anon: boolean
          created_at: string
          css_pace_s_per_100m: number | null
          css_pool_length_m: number | null
          css_tested_at: string | null
          display_name: string | null
          hr_max: number | null
          hr_rest: number | null
          lthr: number | null
          onboarded: boolean
          self_level: string | null
          sex: string | null
          threshold_pace_s_per_km: number | null
          updated_at: string
          user_id: string
          vo2max: number | null
          weekly_volume_km: number | null
          weight_kg: number | null
          zone_anchor: string
          zone_model: number
        }
        Insert: {
          birth_date?: string | null
          consent_analytics?: boolean
          consent_marketing?: boolean
          consent_share_anon?: boolean
          created_at?: string
          css_pace_s_per_100m?: number | null
          css_pool_length_m?: number | null
          css_tested_at?: string | null
          display_name?: string | null
          hr_max?: number | null
          hr_rest?: number | null
          lthr?: number | null
          onboarded?: boolean
          self_level?: string | null
          sex?: string | null
          threshold_pace_s_per_km?: number | null
          updated_at?: string
          user_id: string
          vo2max?: number | null
          weekly_volume_km?: number | null
          weight_kg?: number | null
          zone_anchor?: string
          zone_model?: number
        }
        Update: {
          birth_date?: string | null
          consent_analytics?: boolean
          consent_marketing?: boolean
          consent_share_anon?: boolean
          created_at?: string
          css_pace_s_per_100m?: number | null
          css_pool_length_m?: number | null
          css_tested_at?: string | null
          display_name?: string | null
          hr_max?: number | null
          hr_rest?: number | null
          lthr?: number | null
          onboarded?: boolean
          self_level?: string | null
          sex?: string | null
          threshold_pace_s_per_km?: number | null
          updated_at?: string
          user_id?: string
          vo2max?: number | null
          weekly_volume_km?: number | null
          weight_kg?: number | null
          zone_anchor?: string
          zone_model?: number
        }
        Relationships: []
      }
      wellness: {
        Row: {
          created_at: string
          day: string
          hr_rest_bpm: number | null
          hrv_baseline: number | null
          hrv_rmssd: number | null
          id: string
          readiness: number | null
          sleep_s: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          day: string
          hr_rest_bpm?: number | null
          hrv_baseline?: number | null
          hrv_rmssd?: number | null
          id?: string
          readiness?: number | null
          sleep_s?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          day?: string
          hr_rest_bpm?: number | null
          hrv_baseline?: number | null
          hrv_rmssd?: number | null
          id?: string
          readiness?: number | null
          sleep_s?: number | null
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
