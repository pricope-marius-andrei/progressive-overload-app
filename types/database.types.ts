export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1";
  };
  public: {
    Tables: {
      app_state: {
        Row: {
          created_at: string;
          daily_streak: number;
          experience_score: number;
          id: number;
          last_open_date: string | null;
          last_monthly_bonus_period: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          daily_streak?: number;
          experience_score?: number;
          id?: number;
          last_open_date?: string | null;
          last_monthly_bonus_period?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          daily_streak?: number;
          experience_score?: number;
          id?: number;
          last_open_date?: string | null;
          last_monthly_bonus_period?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      excercise_set: {
        Row: {
          created_at: string;
          exercise_id: number;
          id: number;
          reps: number | null;
          updated_at: string;
          weight: number | null;
        };
        Insert: {
          created_at?: string;
          exercise_id: number;
          id?: number;
          reps?: number | null;
          updated_at?: string;
          weight?: number | null;
        };
        Update: {
          created_at?: string;
          exercise_id?: number;
          id?: number;
          reps?: number | null;
          updated_at?: string;
          weight?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "workout_set_exercise_id_fkey";
            columns: ["exercise_id"];
            isOneToOne: false;
            referencedRelation: "exercise";
            referencedColumns: ["id"];
          },
        ];
      };
      exercise_daily_snapshot: {
        Row: {
          created_at: string;
          exercise_id: number;
          id: number;
          snapshot_date: string;
          snapshot_state: Json;
          updated_at: string;
          workout_id: number;
        };
        Insert: {
          created_at?: string;
          exercise_id: number;
          id?: number;
          snapshot_date?: string;
          snapshot_state: Json;
          updated_at?: string;
          workout_id: number;
        };
        Update: {
          created_at?: string;
          exercise_id?: number;
          id?: number;
          snapshot_date?: string;
          snapshot_state?: Json;
          updated_at?: string;
          workout_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "exercise_daily_snapshot_exercise_id_fkey";
            columns: ["exercise_id"];
            isOneToOne: false;
            referencedRelation: "exercise";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "exercise_daily_snapshot_workout_id_fkey";
            columns: ["workout_id"];
            isOneToOne: false;
            referencedRelation: "workout";
            referencedColumns: ["id"];
          },
        ];
      };
      exercise_performance_index: {
        Row: {
          best_set_e1rm_pr: number;
          best_set_e1rm_pr_date: string | null;
          created_at: string;
          exercise_id: number;
          id: number;
          rep_pr_dates: Json;
          rep_prs: Json;
          total_volume_pr: number;
          total_volume_pr_date: string | null;
          updated_at: string;
          workout_id: number;
        };
        Insert: {
          best_set_e1rm_pr?: number;
          best_set_e1rm_pr_date?: string | null;
          created_at?: string;
          exercise_id: number;
          id?: number;
          rep_pr_dates?: Json;
          rep_prs?: Json;
          total_volume_pr?: number;
          total_volume_pr_date?: string | null;
          updated_at?: string;
          workout_id: number;
        };
        Update: {
          best_set_e1rm_pr?: number;
          best_set_e1rm_pr_date?: string | null;
          created_at?: string;
          exercise_id?: number;
          id?: number;
          rep_pr_dates?: Json;
          rep_prs?: Json;
          total_volume_pr?: number;
          total_volume_pr_date?: string | null;
          updated_at?: string;
          workout_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "exercise_performance_index_exercise_id_fkey";
            columns: ["exercise_id"];
            isOneToOne: true;
            referencedRelation: "exercise";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "exercise_performance_index_workout_id_fkey";
            columns: ["workout_id"];
            isOneToOne: false;
            referencedRelation: "workout";
            referencedColumns: ["id"];
          },
        ];
      };
      exercise: {
        Row: {
          created_at: string;
          id: number;
          name: string;
          updated_at: string;
          workout_id: number;
        };
        Insert: {
          created_at?: string;
          id?: number;
          name: string;
          updated_at?: string;
          workout_id: number;
        };
        Update: {
          created_at?: string;
          id?: number;
          name?: string;
          updated_at?: string;
          workout_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "exercise_workout_id_fkey";
            columns: ["workout_id"];
            isOneToOne: false;
            referencedRelation: "workout";
            referencedColumns: ["id"];
          },
        ];
      };
      workout: {
        Row: {
          created_at: string;
          id: number;
          name: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          name: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          name?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
