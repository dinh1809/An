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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          created_at: string
          end_time: string
          id: string
          notes: string | null
          parent_id: string | null
          start_time: string
          status: Database["public"]["Enums"]["appointment_status"]
          therapist_id: string
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: string
          notes?: string | null
          parent_id?: string | null
          start_time: string
          status?: Database["public"]["Enums"]["appointment_status"]
          therapist_id: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          notes?: string | null
          parent_id?: string | null
          start_time?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          therapist_id?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      assessment_telemetry: {
        Row: {
          click_position_index: number | null
          id: number
          is_correct: boolean | null
          reaction_time_ms: number | null
          session_id: string | null
          target_position_index: number | null
          timestamp: string | null
        }
        Insert: {
          click_position_index?: number | null
          id?: number
          is_correct?: boolean | null
          reaction_time_ms?: number | null
          session_id?: string | null
          target_position_index?: number | null
          timestamp?: string | null
        }
        Update: {
          click_position_index?: number | null
          id?: number
          is_correct?: boolean | null
          reaction_time_ms?: number | null
          session_id?: string | null
          target_position_index?: number | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_telemetry_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      behavior_logs: {
        Row: {
          created_at: string
          id: string
          logged_at: string
          mood: string
          note: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          logged_at?: string
          mood: string
          note?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          logged_at?: string
          mood?: string
          note?: string | null
          user_id?: string
        }
        Relationships: []
      }
      connections: {
        Row: {
          created_at: string
          id: string
          parent_id: string
          status: string
          therapist_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          parent_id: string
          status?: string
          therapist_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          parent_id?: string
          status?: string
          therapist_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      exercises: {
        Row: {
          assigned_at: string
          description: string | null
          doctor_name: string
          id: string
          is_completed: boolean | null
          title: string
          user_id: string
          video_url: string | null
        }
        Insert: {
          assigned_at?: string
          description?: string | null
          doctor_name: string
          id?: string
          is_completed?: boolean | null
          title: string
          user_id: string
          video_url?: string | null
        }
        Update: {
          assigned_at?: string
          description?: string | null
          doctor_name?: string
          id?: string
          is_completed?: boolean | null
          title?: string
          user_id?: string
          video_url?: string | null
        }
        Relationships: []
      }
      game_sessions: {
        Row: {
          accuracy_percentage: number | null
          avg_reaction_time_ms: number | null
          completed_at: string | null
          difficulty_level_reached: number | null
          final_score: number | null
          game_type: string
          id: string
          metrics: Json | null
          started_at: string | null
          user_id: string
        }
        Insert: {
          accuracy_percentage?: number | null
          avg_reaction_time_ms?: number | null
          completed_at?: string | null
          difficulty_level_reached?: number | null
          final_score?: number | null
          game_type?: string
          id?: string
          metrics?: Json | null
          started_at?: string | null
          user_id: string
        }
        Update: {
          accuracy_percentage?: number | null
          avg_reaction_time_ms?: number | null
          completed_at?: string | null
          difficulty_level_reached?: number | null
          final_score?: number | null
          game_type?: string
          id?: string
          metrics?: Json | null
          started_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          active_mode: string | null
          avatar_url: string | null
          clinic_address: string | null
          clinic_name: string | null
          created_at: string
          full_name: string | null
          id: string
          is_public_profile: boolean | null
          latitude: number | null
          longitude: number | null
          phone: string | null
          role: string | null
          therapist_code: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active_mode?: string | null
          avatar_url?: string | null
          clinic_address?: string | null
          clinic_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_public_profile?: boolean | null
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          role?: string | null
          therapist_code?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active_mode?: string | null
          avatar_url?: string | null
          clinic_address?: string | null
          clinic_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_public_profile?: boolean | null
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          role?: string | null
          therapist_code?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      therapist_messages: {
        Row: {
          created_at: string
          id: string
          is_urgent: boolean | null
          message: string
          read_at: string | null
          therapist_name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_urgent?: boolean | null
          message: string
          read_at?: string | null
          therapist_name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_urgent?: boolean | null
          message?: string
          read_at?: string | null
          therapist_name?: string
          user_id?: string
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
          role?: Database["public"]["Enums"]["app_role"]
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
      video_uploads: {
        Row: {
          created_at: string
          duration_seconds: number | null
          file_path: string
          file_url: string
          id: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          file_path: string
          file_url: string
          id?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          file_path?: string
          file_url?: string
          id?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_therapist_code: { Args: never; Returns: string }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_therapist: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "parent" | "therapist"
      appointment_status: "available" | "booked" | "completed" | "cancelled"
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
      app_role: ["parent", "therapist"],
      appointment_status: ["available", "booked", "completed", "cancelled"],
    },
  },
} as const
