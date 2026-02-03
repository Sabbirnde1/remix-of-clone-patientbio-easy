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
      access_notifications: {
        Row: {
          access_count_at_notification: number | null
          created_at: string
          email_sent_to: string | null
          id: string
          notification_type: string
          sent_at: string
          token_id: string | null
          user_id: string
        }
        Insert: {
          access_count_at_notification?: number | null
          created_at?: string
          email_sent_to?: string | null
          id?: string
          notification_type?: string
          sent_at?: string
          token_id?: string | null
          user_id: string
        }
        Update: {
          access_count_at_notification?: number | null
          created_at?: string
          email_sent_to?: string | null
          id?: string
          notification_type?: string
          sent_at?: string
          token_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_notifications_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "access_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      access_tokens: {
        Row: {
          access_count: number | null
          accessed_at: string | null
          created_at: string
          expires_at: string
          id: string
          is_revoked: boolean | null
          label: string | null
          token: string
          user_id: string
        }
        Insert: {
          access_count?: number | null
          accessed_at?: string | null
          created_at?: string
          expires_at: string
          id?: string
          is_revoked?: boolean | null
          label?: string | null
          token: string
          user_id: string
        }
        Update: {
          access_count?: number | null
          accessed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          is_revoked?: boolean | null
          label?: string | null
          token?: string
          user_id?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          read_at: string | null
          status: string | null
          subject: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          read_at?: string | null
          status?: string | null
          subject: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          read_at?: string | null
          status?: string | null
          subject?: string
        }
        Relationships: []
      }
      doctor_connections: {
        Row: {
          created_at: string
          doctor_name: string
          email: string | null
          hospital_clinic: string | null
          id: string
          notes: string | null
          phone: string | null
          specialty: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          doctor_name: string
          email?: string | null
          hospital_clinic?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          specialty?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          doctor_name?: string
          email?: string | null
          hospital_clinic?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          specialty?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      doctor_share_history: {
        Row: {
          doctor_id: string | null
          id: string
          notes: string | null
          shared_at: string
          token_id: string | null
          user_id: string
        }
        Insert: {
          doctor_id?: string | null
          id?: string
          notes?: string | null
          shared_at?: string
          token_id?: string | null
          user_id: string
        }
        Update: {
          doctor_id?: string | null
          id?: string
          notes?: string | null
          shared_at?: string
          token_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_share_history_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctor_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctor_share_history_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "access_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      health_data: {
        Row: {
          bad_habits: string | null
          birth_defects: string | null
          blood_group: string | null
          chronic_diseases: string | null
          created_at: string | null
          current_medications: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          health_allergies: string | null
          height: string | null
          id: string
          previous_diseases: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bad_habits?: string | null
          birth_defects?: string | null
          blood_group?: string | null
          chronic_diseases?: string | null
          created_at?: string | null
          current_medications?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          health_allergies?: string | null
          height?: string | null
          id?: string
          previous_diseases?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bad_habits?: string | null
          birth_defects?: string | null
          blood_group?: string | null
          chronic_diseases?: string | null
          created_at?: string | null
          current_medications?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          health_allergies?: string | null
          height?: string | null
          id?: string
          previous_diseases?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      health_records: {
        Row: {
          category: Database["public"]["Enums"]["record_category"] | null
          description: string | null
          disease_category:
            | Database["public"]["Enums"]["disease_category"]
            | null
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          notes: string | null
          provider_name: string | null
          record_date: string | null
          title: string
          uploaded_at: string | null
          user_id: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["record_category"] | null
          description?: string | null
          disease_category?:
            | Database["public"]["Enums"]["disease_category"]
            | null
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          notes?: string | null
          provider_name?: string | null
          record_date?: string | null
          title: string
          uploaded_at?: string | null
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["record_category"] | null
          description?: string | null
          disease_category?:
            | Database["public"]["Enums"]["disease_category"]
            | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          notes?: string | null
          provider_name?: string | null
          record_date?: string | null
          title?: string
          uploaded_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      site_content: {
        Row: {
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      team_members: {
        Row: {
          bio: string | null
          created_at: string
          display_order: number
          email: string | null
          github_url: string | null
          gradient: string | null
          id: string
          is_advisor: boolean
          linkedin_url: string | null
          name: string
          phone: string | null
          profile_image_url: string | null
          role: string
          twitter_url: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          display_order?: number
          email?: string | null
          github_url?: string | null
          gradient?: string | null
          id?: string
          is_advisor?: boolean
          linkedin_url?: string | null
          name: string
          phone?: string | null
          profile_image_url?: string | null
          role: string
          twitter_url?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          display_order?: number
          email?: string | null
          github_url?: string | null
          gradient?: string | null
          id?: string
          is_advisor?: boolean
          linkedin_url?: string | null
          name?: string
          phone?: string | null
          profile_image_url?: string | null
          role?: string
          twitter_url?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          date_of_birth: string | null
          display_name: string | null
          gender: string | null
          id: string
          location: string | null
          notification_email_enabled: boolean
          phone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          display_name?: string | null
          gender?: string | null
          id?: string
          location?: string | null
          notification_email_enabled?: boolean
          phone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          display_name?: string | null
          gender?: string | null
          id?: string
          location?: string | null
          notification_email_enabled?: boolean
          phone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
      app_role: "admin" | "user"
      disease_category:
        | "general"
        | "cancer"
        | "covid19"
        | "diabetes"
        | "heart_disease"
        | "other"
      record_category:
        | "prescription"
        | "lab_result"
        | "imaging"
        | "vaccination"
        | "other"
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
      app_role: ["admin", "user"],
      disease_category: [
        "general",
        "cancer",
        "covid19",
        "diabetes",
        "heart_disease",
        "other",
      ],
      record_category: [
        "prescription",
        "lab_result",
        "imaging",
        "vaccination",
        "other",
      ],
    },
  },
} as const
