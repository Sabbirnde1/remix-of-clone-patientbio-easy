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
      admissions: {
        Row: {
          actual_discharge: string | null
          admission_date: string
          admission_reason: string | null
          admitting_doctor_id: string
          bed_id: string | null
          created_at: string | null
          diagnosis: string | null
          discharge_notes: string | null
          discharged_by: string | null
          expected_discharge: string | null
          hospital_id: string
          id: string
          patient_id: string
          status: Database["public"]["Enums"]["admission_status"] | null
          updated_at: string | null
        }
        Insert: {
          actual_discharge?: string | null
          admission_date?: string
          admission_reason?: string | null
          admitting_doctor_id: string
          bed_id?: string | null
          created_at?: string | null
          diagnosis?: string | null
          discharge_notes?: string | null
          discharged_by?: string | null
          expected_discharge?: string | null
          hospital_id: string
          id?: string
          patient_id: string
          status?: Database["public"]["Enums"]["admission_status"] | null
          updated_at?: string | null
        }
        Update: {
          actual_discharge?: string | null
          admission_date?: string
          admission_reason?: string | null
          admitting_doctor_id?: string
          bed_id?: string | null
          created_at?: string | null
          diagnosis?: string | null
          discharge_notes?: string | null
          discharged_by?: string | null
          expected_discharge?: string | null
          hospital_id?: string
          id?: string
          patient_id?: string
          status?: Database["public"]["Enums"]["admission_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admissions_bed_id_fkey"
            columns: ["bed_id"]
            isOneToOne: false
            referencedRelation: "beds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admissions_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_reminder_preferences: {
        Row: {
          created_at: string
          email_enabled: boolean
          id: string
          reminder_hours: number[]
          sms_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_enabled?: boolean
          id?: string
          reminder_hours?: number[]
          sms_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_enabled?: boolean
          id?: string
          reminder_hours?: number[]
          sms_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      appointment_reminders: {
        Row: {
          appointment_id: string
          created_at: string
          error_message: string | null
          hours_before: number
          id: string
          reminder_type: string
          scheduled_for: string
          sent_at: string | null
          status: string
        }
        Insert: {
          appointment_id: string
          created_at?: string
          error_message?: string | null
          hours_before: number
          id?: string
          reminder_type: string
          scheduled_for: string
          sent_at?: string | null
          status?: string
        }
        Update: {
          appointment_id?: string
          created_at?: string
          error_message?: string | null
          hours_before?: number
          id?: string
          reminder_type?: string
          scheduled_for?: string
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_reminders_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_date: string
          cancelled_at: string | null
          cancelled_by: string | null
          created_at: string | null
          doctor_id: string
          end_time: string
          hospital_id: string | null
          id: string
          notes: string | null
          patient_id: string
          reason: string | null
          start_time: string
          status: Database["public"]["Enums"]["appointment_status"] | null
          updated_at: string | null
        }
        Insert: {
          appointment_date: string
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string | null
          doctor_id: string
          end_time: string
          hospital_id?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          reason?: string | null
          start_time: string
          status?: Database["public"]["Enums"]["appointment_status"] | null
          updated_at?: string | null
        }
        Update: {
          appointment_date?: string
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string | null
          doctor_id?: string
          end_time?: string
          hospital_id?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          reason?: string | null
          start_time?: string
          status?: Database["public"]["Enums"]["appointment_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      beds: {
        Row: {
          bed_number: string
          bed_type: string | null
          created_at: string | null
          daily_rate: number | null
          hospital_id: string
          id: string
          notes: string | null
          status: Database["public"]["Enums"]["bed_status"] | null
          updated_at: string | null
          ward_id: string
        }
        Insert: {
          bed_number: string
          bed_type?: string | null
          created_at?: string | null
          daily_rate?: number | null
          hospital_id: string
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["bed_status"] | null
          updated_at?: string | null
          ward_id: string
        }
        Update: {
          bed_number?: string
          bed_type?: string | null
          created_at?: string | null
          daily_rate?: number | null
          hospital_id?: string
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["bed_status"] | null
          updated_at?: string | null
          ward_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "beds_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beds_ward_id_fkey"
            columns: ["ward_id"]
            isOneToOne: false
            referencedRelation: "wards"
            referencedColumns: ["id"]
          },
        ]
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
      doctor_applications: {
        Row: {
          cover_letter: string | null
          created_at: string | null
          experience_years: number | null
          full_name: string
          hospital_id: string
          id: string
          license_number: string | null
          phone: string | null
          qualification: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          specialty: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cover_letter?: string | null
          created_at?: string | null
          experience_years?: number | null
          full_name: string
          hospital_id: string
          id?: string
          license_number?: string | null
          phone?: string | null
          qualification?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          specialty?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cover_letter?: string | null
          created_at?: string | null
          experience_years?: number | null
          full_name?: string
          hospital_id?: string
          id?: string
          license_number?: string | null
          phone?: string | null
          qualification?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          specialty?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_applications_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_availability: {
        Row: {
          created_at: string | null
          day_of_week: number
          doctor_id: string
          end_time: string
          hospital_id: string | null
          id: string
          is_active: boolean | null
          slot_duration_minutes: number
          start_time: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          doctor_id: string
          end_time: string
          hospital_id?: string | null
          id?: string
          is_active?: boolean | null
          slot_duration_minutes?: number
          start_time: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          doctor_id?: string
          end_time?: string
          hospital_id?: string | null
          id?: string
          is_active?: boolean | null
          slot_duration_minutes?: number
          start_time?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doctor_availability_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
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
      doctor_patient_access: {
        Row: {
          access_token_id: string | null
          doctor_id: string
          granted_at: string | null
          id: string
          is_active: boolean | null
          last_accessed_at: string | null
          patient_id: string
        }
        Insert: {
          access_token_id?: string | null
          doctor_id: string
          granted_at?: string | null
          id?: string
          is_active?: boolean | null
          last_accessed_at?: string | null
          patient_id: string
        }
        Update: {
          access_token_id?: string | null
          doctor_id?: string
          granted_at?: string | null
          id?: string
          is_active?: boolean | null
          last_accessed_at?: string | null
          patient_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_patient_access_access_token_id_fkey"
            columns: ["access_token_id"]
            isOneToOne: false
            referencedRelation: "access_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          consultation_fee: number | null
          created_at: string | null
          experience_years: number | null
          full_name: string
          id: string
          is_verified: boolean | null
          license_number: string | null
          phone: string | null
          qualification: string | null
          specialty: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          consultation_fee?: number | null
          created_at?: string | null
          experience_years?: number | null
          full_name: string
          id?: string
          is_verified?: boolean | null
          license_number?: string | null
          phone?: string | null
          qualification?: string | null
          specialty?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          consultation_fee?: number | null
          created_at?: string | null
          experience_years?: number | null
          full_name?: string
          id?: string
          is_verified?: boolean | null
          license_number?: string | null
          phone?: string | null
          qualification?: string | null
          specialty?: string | null
          updated_at?: string | null
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
      doctor_time_off: {
        Row: {
          created_at: string | null
          doctor_id: string
          end_date: string
          hospital_id: string | null
          id: string
          reason: string | null
          start_date: string
        }
        Insert: {
          created_at?: string | null
          doctor_id: string
          end_date: string
          hospital_id?: string | null
          id?: string
          reason?: string | null
          start_date: string
        }
        Update: {
          created_at?: string | null
          doctor_id?: string
          end_date?: string
          hospital_id?: string | null
          id?: string
          reason?: string | null
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_time_off_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
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
      hospital_staff: {
        Row: {
          created_at: string | null
          department: string | null
          employee_id: string | null
          hospital_id: string
          id: string
          is_active: boolean | null
          joined_at: string | null
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          employee_id?: string | null
          hospital_id: string
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          role?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          department?: string | null
          employee_id?: string | null
          hospital_id?: string
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hospital_staff_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      hospitals: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          email: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          phone: string | null
          registration_number: string | null
          state: string | null
          type: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          phone?: string | null
          registration_number?: string | null
          state?: string | null
          type?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          registration_number?: string | null
          state?: string | null
          type?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          category: Database["public"]["Enums"]["invoice_item_category"] | null
          created_at: string | null
          description: string
          id: string
          invoice_id: string
          quantity: number
          service_date: string | null
          total_price: number
          unit_price: number
        }
        Insert: {
          category?: Database["public"]["Enums"]["invoice_item_category"] | null
          created_at?: string | null
          description: string
          id?: string
          invoice_id: string
          quantity?: number
          service_date?: string | null
          total_price?: number
          unit_price?: number
        }
        Update: {
          category?: Database["public"]["Enums"]["invoice_item_category"] | null
          created_at?: string | null
          description?: string
          id?: string
          invoice_id?: string
          quantity?: number
          service_date?: string | null
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          admission_id: string | null
          amount_paid: number | null
          appointment_id: string | null
          created_at: string | null
          created_by: string | null
          discount_amount: number | null
          due_date: string | null
          hospital_id: string
          id: string
          invoice_date: string
          invoice_number: string
          notes: string | null
          patient_id: string
          status: Database["public"]["Enums"]["invoice_status"] | null
          subtotal: number | null
          tax_amount: number | null
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          admission_id?: string | null
          amount_paid?: number | null
          appointment_id?: string | null
          created_at?: string | null
          created_by?: string | null
          discount_amount?: number | null
          due_date?: string | null
          hospital_id: string
          id?: string
          invoice_date?: string
          invoice_number: string
          notes?: string | null
          patient_id: string
          status?: Database["public"]["Enums"]["invoice_status"] | null
          subtotal?: number | null
          tax_amount?: number | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          admission_id?: string | null
          amount_paid?: number | null
          appointment_id?: string | null
          created_at?: string | null
          created_by?: string | null
          discount_amount?: number | null
          due_date?: string | null
          hospital_id?: string
          id?: string
          invoice_date?: string
          invoice_number?: string
          notes?: string | null
          patient_id?: string
          status?: Database["public"]["Enums"]["invoice_status"] | null
          subtotal?: number | null
          tax_amount?: number | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_admission_id_fkey"
            columns: ["admission_id"]
            isOneToOne: false
            referencedRelation: "admissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          hospital_id: string
          id: string
          invoice_id: string
          notes: string | null
          payment_date: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          received_by: string | null
          transaction_ref: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          hospital_id: string
          id?: string
          invoice_id: string
          notes?: string | null
          payment_date?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          received_by?: string | null
          transaction_ref?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          hospital_id?: string
          id?: string
          invoice_id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          received_by?: string | null
          transaction_ref?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          created_at: string | null
          diagnosis: string | null
          doctor_id: string
          follow_up_date: string | null
          hospital_id: string | null
          id: string
          instructions: string | null
          is_active: boolean | null
          medications: Json
          notes: string | null
          patient_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          diagnosis?: string | null
          doctor_id: string
          follow_up_date?: string | null
          hospital_id?: string | null
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          medications?: Json
          notes?: string | null
          patient_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          diagnosis?: string | null
          doctor_id?: string
          follow_up_date?: string | null
          hospital_id?: string | null
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          medications?: Json
          notes?: string | null
          patient_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
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
          is_guest_patient: boolean | null
          location: string | null
          notification_email_enabled: boolean
          phone: string | null
          registered_by_hospital_id: string | null
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
          is_guest_patient?: boolean | null
          location?: string | null
          notification_email_enabled?: boolean
          phone?: string | null
          registered_by_hospital_id?: string | null
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
          is_guest_patient?: boolean | null
          location?: string | null
          notification_email_enabled?: boolean
          phone?: string | null
          registered_by_hospital_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_registered_by_hospital_id_fkey"
            columns: ["registered_by_hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
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
      wards: {
        Row: {
          created_at: string | null
          description: string | null
          floor: string | null
          hospital_id: string
          id: string
          is_active: boolean | null
          name: string
          total_beds: number
          type: Database["public"]["Enums"]["ward_type"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          floor?: string | null
          hospital_id: string
          id?: string
          is_active?: boolean | null
          name: string
          total_beds?: number
          type?: Database["public"]["Enums"]["ward_type"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          floor?: string | null
          hospital_id?: string
          id?: string
          is_active?: boolean | null
          name?: string
          total_beds?: number
          type?: Database["public"]["Enums"]["ward_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wards_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_invoice_number: {
        Args: { p_hospital_id: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_hospital_admin: {
        Args: { _hospital_id: string; _user_id: string }
        Returns: boolean
      }
      is_hospital_staff: {
        Args: { _hospital_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      admission_status: "admitted" | "discharged" | "transferred"
      app_role: "admin" | "user" | "hospital_admin" | "doctor"
      appointment_status:
        | "scheduled"
        | "confirmed"
        | "completed"
        | "cancelled"
        | "no_show"
      bed_status: "available" | "occupied" | "maintenance" | "reserved"
      disease_category:
        | "general"
        | "cancer"
        | "covid19"
        | "diabetes"
        | "heart_disease"
        | "other"
      invoice_item_category:
        | "consultation"
        | "bed_charge"
        | "medication"
        | "procedure"
        | "lab_test"
        | "other"
      invoice_status: "draft" | "pending" | "partial" | "paid" | "cancelled"
      payment_method: "cash" | "card" | "upi" | "bank_transfer" | "insurance"
      record_category:
        | "prescription"
        | "lab_result"
        | "imaging"
        | "vaccination"
        | "other"
      ward_type:
        | "general"
        | "icu"
        | "emergency"
        | "maternity"
        | "pediatric"
        | "private"
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
      admission_status: ["admitted", "discharged", "transferred"],
      app_role: ["admin", "user", "hospital_admin", "doctor"],
      appointment_status: [
        "scheduled",
        "confirmed",
        "completed",
        "cancelled",
        "no_show",
      ],
      bed_status: ["available", "occupied", "maintenance", "reserved"],
      disease_category: [
        "general",
        "cancer",
        "covid19",
        "diabetes",
        "heart_disease",
        "other",
      ],
      invoice_item_category: [
        "consultation",
        "bed_charge",
        "medication",
        "procedure",
        "lab_test",
        "other",
      ],
      invoice_status: ["draft", "pending", "partial", "paid", "cancelled"],
      payment_method: ["cash", "card", "upi", "bank_transfer", "insurance"],
      record_category: [
        "prescription",
        "lab_result",
        "imaging",
        "vaccination",
        "other",
      ],
      ward_type: [
        "general",
        "icu",
        "emergency",
        "maternity",
        "pediatric",
        "private",
      ],
    },
  },
} as const
