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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      ai_course_interviews: {
        Row: {
          additional_context: string | null
          created_at: string
          created_by: string
          desired_length: string | null
          error_message: string | null
          generated_course_id: string | null
          generated_outline: Json | null
          generation_mode: string
          id: string
          messages: Json
          sector_key: string | null
          status: string
          system_prompt: string | null
          target_audience: string | null
          tenant_id: string
          topic: string
          total_input_tokens: number | null
          total_output_tokens: number | null
          updated_at: string
          uploaded_documents: Json | null
        }
        Insert: {
          additional_context?: string | null
          created_at?: string
          created_by: string
          desired_length?: string | null
          error_message?: string | null
          generated_course_id?: string | null
          generated_outline?: Json | null
          generation_mode?: string
          id?: string
          messages?: Json
          sector_key?: string | null
          status?: string
          system_prompt?: string | null
          target_audience?: string | null
          tenant_id: string
          topic: string
          total_input_tokens?: number | null
          total_output_tokens?: number | null
          updated_at?: string
          uploaded_documents?: Json | null
        }
        Update: {
          additional_context?: string | null
          created_at?: string
          created_by?: string
          desired_length?: string | null
          error_message?: string | null
          generated_course_id?: string | null
          generated_outline?: Json | null
          generation_mode?: string
          id?: string
          messages?: Json
          sector_key?: string | null
          status?: string
          system_prompt?: string | null
          target_audience?: string | null
          tenant_id?: string
          topic?: string
          total_input_tokens?: number | null
          total_output_tokens?: number | null
          updated_at?: string
          uploaded_documents?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_course_interviews_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_course_interviews_generated_course_id_fkey"
            columns: ["generated_course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_course_interviews_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          application_number: string | null
          citizenship_document_type: string | null
          citizenship_document_url: string | null
          citizenship_status: string | null
          city: string | null
          country: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          first_name: string | null
          id: string
          isa_consent_given: boolean | null
          isa_consent_ip_address: unknown
          isa_consent_text: string | null
          isa_consent_timestamp: string | null
          last_name: string | null
          mailing_address_line1: string | null
          mailing_address_line2: string | null
          mailing_city: string | null
          mailing_country: string | null
          mailing_state: string | null
          mailing_zip: string | null
          middle_name: string | null
          payment_token: string | null
          phone: string | null
          program_id: string | null
          prospect_id: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          state: string | null
          status: string | null
          stripe_identity_session_id: string | null
          stripe_identity_status: string | null
          stripe_identity_verified_at: string | null
          submitted_at: string | null
          submitted_ip_address: unknown
          submitted_user_agent: string | null
          tenant_id: string
          updated_at: string | null
          user_id: string | null
          zip_code: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          application_number?: string | null
          citizenship_document_type?: string | null
          citizenship_document_url?: string | null
          citizenship_status?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          isa_consent_given?: boolean | null
          isa_consent_ip_address?: unknown
          isa_consent_text?: string | null
          isa_consent_timestamp?: string | null
          last_name?: string | null
          mailing_address_line1?: string | null
          mailing_address_line2?: string | null
          mailing_city?: string | null
          mailing_country?: string | null
          mailing_state?: string | null
          mailing_zip?: string | null
          middle_name?: string | null
          payment_token?: string | null
          phone?: string | null
          program_id?: string | null
          prospect_id?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          state?: string | null
          status?: string | null
          stripe_identity_session_id?: string | null
          stripe_identity_status?: string | null
          stripe_identity_verified_at?: string | null
          submitted_at?: string | null
          submitted_ip_address?: unknown
          submitted_user_agent?: string | null
          tenant_id: string
          updated_at?: string | null
          user_id?: string | null
          zip_code?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          application_number?: string | null
          citizenship_document_type?: string | null
          citizenship_document_url?: string | null
          citizenship_status?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          isa_consent_given?: boolean | null
          isa_consent_ip_address?: unknown
          isa_consent_text?: string | null
          isa_consent_timestamp?: string | null
          last_name?: string | null
          mailing_address_line1?: string | null
          mailing_address_line2?: string | null
          mailing_city?: string | null
          mailing_country?: string | null
          mailing_state?: string | null
          mailing_zip?: string | null
          middle_name?: string | null
          payment_token?: string | null
          phone?: string | null
          program_id?: string | null
          prospect_id?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          state?: string | null
          status?: string | null
          stripe_identity_session_id?: string | null
          stripe_identity_status?: string | null
          stripe_identity_verified_at?: string | null
          submitted_at?: string | null
          submitted_ip_address?: unknown
          submitted_user_agent?: string | null
          tenant_id?: string
          updated_at?: string | null
          user_id?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          class_id: string
          id: string
          marked_at: string | null
          marked_by: string
          session_date: string
          status: string
          student_id: string
          tenant_id: string
        }
        Insert: {
          class_id: string
          id?: string
          marked_at?: string | null
          marked_by: string
          session_date: string
          status: string
          student_id: string
          tenant_id: string
        }
        Update: {
          class_id?: string
          id?: string
          marked_at?: string | null
          marked_by?: string
          session_date?: string
          status?: string
          student_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_marked_by_fkey"
            columns: ["marked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          tenant_id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          tenant_id: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          certificate_number: string | null
          course_id: string
          created_at: string | null
          id: string
          issued_at: string | null
          pdf_url: string | null
          student_id: string
          template_data: Json | null
          tenant_id: string
          verification_code: string | null
        }
        Insert: {
          certificate_number?: string | null
          course_id: string
          created_at?: string | null
          id?: string
          issued_at?: string | null
          pdf_url?: string | null
          student_id: string
          template_data?: Json | null
          tenant_id: string
          verification_code?: string | null
        }
        Update: {
          certificate_number?: string | null
          course_id?: string
          created_at?: string | null
          id?: string
          issued_at?: string | null
          pdf_url?: string | null
          student_id?: string
          template_data?: Json | null
          tenant_id?: string
          verification_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      class_enrollments: {
        Row: {
          class_id: string
          enrolled_at: string | null
          id: string
          status: string | null
          stripe_payment_intent_id: string | null
          student_id: string
          tenant_id: string
        }
        Insert: {
          class_id: string
          enrolled_at?: string | null
          id?: string
          status?: string | null
          stripe_payment_intent_id?: string | null
          student_id: string
          tenant_id: string
        }
        Update: {
          class_id?: string
          enrolled_at?: string | null
          id?: string
          status?: string | null
          stripe_payment_intent_id?: string | null
          student_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_enrollments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_enrollments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          commission_rate: number | null
          created_at: string | null
          description: string | null
          id: string
          instructor_id: string
          is_active: boolean | null
          max_students: number | null
          name: string
          price_cents: number | null
          program_id: string | null
          schedule: Json | null
          tenant_id: string
          updated_at: string | null
          zoom_join_url: string | null
          zoom_meeting_id: string | null
          zoom_recording_url: string | null
          zoom_start_url: string | null
        }
        Insert: {
          commission_rate?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          instructor_id: string
          is_active?: boolean | null
          max_students?: number | null
          name: string
          price_cents?: number | null
          program_id?: string | null
          schedule?: Json | null
          tenant_id: string
          updated_at?: string | null
          zoom_join_url?: string | null
          zoom_meeting_id?: string | null
          zoom_recording_url?: string | null
          zoom_start_url?: string | null
        }
        Update: {
          commission_rate?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          instructor_id?: string
          is_active?: boolean | null
          max_students?: number | null
          name?: string
          price_cents?: number | null
          program_id?: string | null
          schedule?: Json | null
          tenant_id?: string
          updated_at?: string | null
          zoom_join_url?: string | null
          zoom_meeting_id?: string | null
          zoom_recording_url?: string | null
          zoom_start_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classes_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_log: {
        Row: {
          channel: string
          clicked_at: string | null
          delivered_at: string | null
          id: string
          link_url: string | null
          metadata: Json | null
          opened_at: string | null
          recipient_id: string | null
          recipient_type: string | null
          sent_at: string | null
          template_id: string | null
          tenant_id: string
          tracking_id: string | null
        }
        Insert: {
          channel: string
          clicked_at?: string | null
          delivered_at?: string | null
          id?: string
          link_url?: string | null
          metadata?: Json | null
          opened_at?: string | null
          recipient_id?: string | null
          recipient_type?: string | null
          sent_at?: string | null
          template_id?: string | null
          tenant_id: string
          tracking_id?: string | null
        }
        Update: {
          channel?: string
          clicked_at?: string | null
          delivered_at?: string | null
          id?: string
          link_url?: string | null
          metadata?: Json | null
          opened_at?: string | null
          recipient_id?: string | null
          recipient_type?: string | null
          sent_at?: string | null
          template_id?: string | null
          tenant_id?: string
          tracking_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communication_log_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "communication_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_templates: {
        Row: {
          body: string
          channel: string
          created_at: string | null
          created_by: string | null
          id: string
          name: string
          subject: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          body: string
          channel: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          name: string
          subject?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          body?: string
          channel?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          name?: string
          subject?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communication_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      consent_records: {
        Row: {
          consent_text: string
          consent_type: string
          consented: boolean
          consented_at: string | null
          id: string
          ip_address: unknown
          revoked_at: string | null
          tenant_id: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          consent_text: string
          consent_type: string
          consented: boolean
          consented_at?: string | null
          id?: string
          ip_address?: unknown
          revoked_at?: string | null
          tenant_id: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          consent_text?: string
          consent_type?: string
          consented?: boolean
          consented_at?: string | null
          id?: string
          ip_address?: unknown
          revoked_at?: string | null
          tenant_id?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consent_records_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consent_records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      course_enrollments: {
        Row: {
          certificate_id: string | null
          completed_at: string | null
          course_id: string
          created_at: string | null
          enrolled_at: string | null
          expires_at: string | null
          id: string
          last_accessed_at: string | null
          progress_pct: number | null
          status: string | null
          student_id: string
          tenant_id: string
        }
        Insert: {
          certificate_id?: string | null
          completed_at?: string | null
          course_id: string
          created_at?: string | null
          enrolled_at?: string | null
          expires_at?: string | null
          id?: string
          last_accessed_at?: string | null
          progress_pct?: number | null
          status?: string | null
          student_id: string
          tenant_id: string
        }
        Update: {
          certificate_id?: string | null
          completed_at?: string | null
          course_id?: string
          created_at?: string | null
          enrolled_at?: string | null
          expires_at?: string | null
          id?: string
          last_accessed_at?: string | null
          progress_pct?: number | null
          status?: string | null
          student_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_enrollments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_course_enrollments_certificate"
            columns: ["certificate_id"]
            isOneToOne: false
            referencedRelation: "certificates"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          difficulty: string | null
          estimated_hours: number | null
          id: string
          instructor_id: string | null
          is_free: boolean | null
          is_published: boolean | null
          learning_objectives: Json | null
          max_students: number | null
          prerequisites: Json | null
          price_cents: number | null
          published_at: string | null
          settings: Json | null
          slug: string
          sort_order: number | null
          tags: Json | null
          tenant_id: string
          thumbnail_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          estimated_hours?: number | null
          id?: string
          instructor_id?: string | null
          is_free?: boolean | null
          is_published?: boolean | null
          learning_objectives?: Json | null
          max_students?: number | null
          prerequisites?: Json | null
          price_cents?: number | null
          published_at?: string | null
          settings?: Json | null
          slug: string
          sort_order?: number | null
          tags?: Json | null
          tenant_id: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          estimated_hours?: number | null
          id?: string
          instructor_id?: string | null
          is_free?: boolean | null
          is_published?: boolean | null
          learning_objectives?: Json | null
          max_students?: number | null
          prerequisites?: Json | null
          price_cents?: number | null
          published_at?: string | null
          settings?: Json | null
          slug?: string
          sort_order?: number | null
          tags?: Json | null
          tenant_id?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      discussion_posts: {
        Row: {
          author_id: string
          body: string
          created_at: string | null
          edited_at: string | null
          id: string
          is_edited: boolean | null
          parent_post_id: string | null
          tenant_id: string
          thread_id: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string | null
          edited_at?: string | null
          id?: string
          is_edited?: boolean | null
          parent_post_id?: string | null
          tenant_id: string
          thread_id: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string | null
          edited_at?: string | null
          id?: string
          is_edited?: boolean | null
          parent_post_id?: string | null
          tenant_id?: string
          thread_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discussion_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_posts_parent_post_id_fkey"
            columns: ["parent_post_id"]
            isOneToOne: false
            referencedRelation: "discussion_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_posts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_posts_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "discussion_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      discussion_threads: {
        Row: {
          author_id: string
          body: string
          course_id: string
          created_at: string | null
          id: string
          is_locked: boolean | null
          is_pinned: boolean | null
          last_activity_at: string | null
          reply_count: number | null
          tenant_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          body?: string
          course_id: string
          created_at?: string | null
          id?: string
          is_locked?: boolean | null
          is_pinned?: boolean | null
          last_activity_at?: string | null
          reply_count?: number | null
          tenant_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          body?: string
          course_id?: string
          created_at?: string | null
          id?: string
          is_locked?: boolean | null
          is_pinned?: boolean | null
          last_activity_at?: string | null
          reply_count?: number | null
          tenant_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discussion_threads_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_threads_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_threads_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          application_id: string | null
          created_at: string | null
          enrolled_at: string | null
          enrollment_number: string | null
          id: string
          program_id: string
          status: string | null
          tenant_id: string
          tuition_payment_method: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          application_id?: string | null
          created_at?: string | null
          enrolled_at?: string | null
          enrollment_number?: string | null
          id?: string
          program_id: string
          status?: string | null
          tenant_id: string
          tuition_payment_method?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          application_id?: string | null
          created_at?: string | null
          enrolled_at?: string | null
          enrollment_number?: string | null
          id?: string
          program_id?: string
          status?: string | null
          tenant_id?: string
          tuition_payment_method?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      error_log: {
        Row: {
          context: Json | null
          created_at: string | null
          error_message: string
          error_type: string | null
          id: string
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          source: string
          stack_trace: string | null
          tenant_id: string | null
        }
        Insert: {
          context?: Json | null
          created_at?: string | null
          error_message: string
          error_type?: string | null
          id?: string
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          source: string
          stack_trace?: string | null
          tenant_id?: string | null
        }
        Update: {
          context?: Json | null
          created_at?: string | null
          error_message?: string
          error_type?: string | null
          id?: string
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          source?: string
          stack_trace?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "error_log_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "error_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          completed_at: string | null
          course_id: string
          created_at: string | null
          id: string
          last_position: Json | null
          lesson_id: string
          started_at: string | null
          status: string | null
          student_id: string
          tenant_id: string
          time_spent_seconds: number | null
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          created_at?: string | null
          id?: string
          last_position?: Json | null
          lesson_id: string
          started_at?: string | null
          status?: string | null
          student_id: string
          tenant_id: string
          time_spent_seconds?: number | null
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          created_at?: string | null
          id?: string
          last_position?: Json | null
          lesson_id?: string
          started_at?: string | null
          status?: string | null
          student_id?: string
          tenant_id?: string
          time_spent_seconds?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content: Json
          content_type: string | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_published: boolean | null
          is_required: boolean | null
          module_id: string
          sort_order: number | null
          tenant_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          content?: Json
          content_type?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_published?: boolean | null
          is_required?: boolean | null
          module_id: string
          sort_order?: number | null
          tenant_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: Json
          content_type?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_published?: boolean | null
          is_required?: boolean | null
          module_id?: string
          sort_order?: number | null
          tenant_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      live_class_sessions: {
        Row: {
          actual_end_at: string | null
          actual_start_at: string | null
          attendee_count: number | null
          class_id: string
          created_at: string | null
          end_time: string | null
          id: string
          notes: string | null
          session_date: string
          start_time: string
          status: string | null
          tenant_id: string
          updated_at: string | null
          zoom_join_url: string | null
          zoom_meeting_id: string | null
          zoom_recording_url: string | null
          zoom_start_url: string | null
        }
        Insert: {
          actual_end_at?: string | null
          actual_start_at?: string | null
          attendee_count?: number | null
          class_id: string
          created_at?: string | null
          end_time?: string | null
          id?: string
          notes?: string | null
          session_date: string
          start_time: string
          status?: string | null
          tenant_id: string
          updated_at?: string | null
          zoom_join_url?: string | null
          zoom_meeting_id?: string | null
          zoom_recording_url?: string | null
          zoom_start_url?: string | null
        }
        Update: {
          actual_end_at?: string | null
          actual_start_at?: string | null
          attendee_count?: number | null
          class_id?: string
          created_at?: string | null
          end_time?: string | null
          id?: string
          notes?: string | null
          session_date?: string
          start_time?: string
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
          zoom_join_url?: string | null
          zoom_meeting_id?: string | null
          zoom_recording_url?: string | null
          zoom_start_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "live_class_sessions_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_class_sessions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          created_at: string | null
          id: string
          is_read: boolean | null
          is_system: boolean | null
          message_type: string | null
          read_at: string | null
          recipient_id: string
          sender_id: string | null
          subject: string | null
          tenant_id: string
        }
        Insert: {
          body: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          is_system?: boolean | null
          message_type?: string | null
          read_at?: string | null
          recipient_id: string
          sender_id?: string | null
          subject?: string | null
          tenant_id: string
        }
        Update: {
          body?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          is_system?: boolean | null
          message_type?: string | null
          read_at?: string | null
          recipient_id?: string
          sender_id?: string | null
          subject?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          course_id: string
          created_at: string | null
          description: string | null
          id: string
          is_published: boolean | null
          sort_order: number | null
          tenant_id: string
          title: string
          unlock_date: string | null
          unlock_rule: string | null
          updated_at: string | null
        }
        Insert: {
          course_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          sort_order?: number | null
          tenant_id: string
          title: string
          unlock_date?: string | null
          unlock_rule?: string | null
          updated_at?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          sort_order?: number | null
          tenant_id?: string
          title?: string
          unlock_date?: string | null
          unlock_rule?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "modules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_cents: number
          application_id: string | null
          created_at: string | null
          currency: string | null
          enrollment_id: string | null
          fee_type: string
          id: string
          paid_at: string | null
          payment_method: string | null
          status: string | null
          stripe_checkout_session_id: string | null
          stripe_invoice_id: string | null
          stripe_payment_intent_id: string | null
          tenant_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount_cents: number
          application_id?: string | null
          created_at?: string | null
          currency?: string | null
          enrollment_id?: string | null
          fee_type: string
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          status?: string | null
          stripe_checkout_session_id?: string | null
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          tenant_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount_cents?: number
          application_id?: string | null
          created_at?: string | null
          currency?: string | null
          enrollment_id?: string | null
          fee_type?: string
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          status?: string | null
          stripe_checkout_session_id?: string | null
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          tenant_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          citizenship_status: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          mailing_address: string | null
          notification_preferences: Json | null
          phone: string | null
          program_of_interest: string | null
          role: string
          stripe_connect_id: string | null
          stripe_customer_id: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          citizenship_status?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          mailing_address?: string | null
          notification_preferences?: Json | null
          phone?: string | null
          program_of_interest?: string | null
          role: string
          stripe_connect_id?: string | null
          stripe_customer_id?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          citizenship_status?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          mailing_address?: string | null
          notification_preferences?: Json | null
          phone?: string | null
          program_of_interest?: string | null
          role?: string
          stripe_connect_id?: string | null
          stripe_customer_id?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          created_at: string | null
          description: string | null
          duration_weeks: number | null
          enrollment_fee_cents: number | null
          id: string
          is_active: boolean | null
          name: string
          tenant_id: string
          tuition_amount_cents: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_weeks?: number | null
          enrollment_fee_cents?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          tenant_id: string
          tuition_amount_cents?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_weeks?: number | null
          enrollment_fee_cents?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          tenant_id?: string
          tuition_amount_cents?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "programs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      prospects: {
        Row: {
          created_at: string | null
          discovery_call_date: string | null
          discovery_call_zoom_link: string | null
          eligibility_marked_at: string | null
          eligibility_marked_by: string | null
          eligibility_status: string | null
          email: string
          first_name: string
          google_calendar_event_id: string | null
          id: string
          inquiry_ip_address: unknown
          inquiry_submitted_at: string | null
          inquiry_user_agent: string | null
          last_name: string
          notes: string | null
          phone: string | null
          program_interest: string | null
          remarketing_eligible: boolean | null
          source: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          discovery_call_date?: string | null
          discovery_call_zoom_link?: string | null
          eligibility_marked_at?: string | null
          eligibility_marked_by?: string | null
          eligibility_status?: string | null
          email: string
          first_name: string
          google_calendar_event_id?: string | null
          id?: string
          inquiry_ip_address?: unknown
          inquiry_submitted_at?: string | null
          inquiry_user_agent?: string | null
          last_name: string
          notes?: string | null
          phone?: string | null
          program_interest?: string | null
          remarketing_eligible?: boolean | null
          source?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          discovery_call_date?: string | null
          discovery_call_zoom_link?: string | null
          eligibility_marked_at?: string | null
          eligibility_marked_by?: string | null
          eligibility_status?: string | null
          email?: string
          first_name?: string
          google_calendar_event_id?: string | null
          id?: string
          inquiry_ip_address?: unknown
          inquiry_submitted_at?: string | null
          inquiry_user_agent?: string | null
          last_name?: string
          notes?: string | null
          phone?: string | null
          program_interest?: string | null
          remarketing_eligible?: boolean | null
          source?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prospects_eligibility_marked_by_fkey"
            columns: ["eligibility_marked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prospects_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_attempts: {
        Row: {
          answers: Json | null
          attempt_number: number
          created_at: string | null
          graded_at: string | null
          graded_by: string | null
          id: string
          passed: boolean | null
          points_earned: number | null
          points_possible: number | null
          quiz_id: string
          score_pct: number | null
          started_at: string | null
          status: string | null
          student_id: string
          submitted_at: string | null
          tenant_id: string
          time_spent_seconds: number | null
        }
        Insert: {
          answers?: Json | null
          attempt_number?: number
          created_at?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          passed?: boolean | null
          points_earned?: number | null
          points_possible?: number | null
          quiz_id: string
          score_pct?: number | null
          started_at?: string | null
          status?: string | null
          student_id: string
          submitted_at?: string | null
          tenant_id: string
          time_spent_seconds?: number | null
        }
        Update: {
          answers?: Json | null
          attempt_number?: number
          created_at?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          passed?: boolean | null
          points_earned?: number | null
          points_possible?: number | null
          quiz_id?: string
          score_pct?: number | null
          started_at?: string | null
          status?: string | null
          student_id?: string
          submitted_at?: string | null
          tenant_id?: string
          time_spent_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_graded_by_fkey"
            columns: ["graded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          created_at: string | null
          explanation: string | null
          id: string
          options: Json | null
          points: number | null
          question_text: string
          question_type: string | null
          quiz_id: string
          sort_order: number | null
          tenant_id: string
        }
        Insert: {
          created_at?: string | null
          explanation?: string | null
          id?: string
          options?: Json | null
          points?: number | null
          question_text: string
          question_type?: string | null
          quiz_id: string
          sort_order?: number | null
          tenant_id: string
        }
        Update: {
          created_at?: string | null
          explanation?: string | null
          id?: string
          options?: Json | null
          points?: number | null
          question_text?: string
          question_type?: string | null
          quiz_id?: string
          sort_order?: number | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_questions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          course_id: string
          created_at: string | null
          description: string | null
          id: string
          is_published: boolean | null
          lesson_id: string | null
          max_attempts: number | null
          passing_score: number | null
          quiz_type: string | null
          show_answers_after: string | null
          shuffle_questions: boolean | null
          tenant_id: string
          time_limit_minutes: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          course_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          lesson_id?: string | null
          max_attempts?: number | null
          passing_score?: number | null
          quiz_type?: string | null
          show_answers_after?: string | null
          shuffle_questions?: boolean | null
          tenant_id: string
          time_limit_minutes?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          lesson_id?: string | null
          max_attempts?: number | null
          passing_score?: number | null
          quiz_type?: string | null
          show_answers_after?: string | null
          shuffle_questions?: boolean | null
          tenant_id?: string
          time_limit_minutes?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quizzes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quizzes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      sector_modules: {
        Row: {
          ai_system_prompt: string | null
          compliance_frameworks: Json | null
          created_at: string | null
          curriculum_standards: Json | null
          description: string | null
          display_name: string
          icon_name: string | null
          id: string
          is_active: boolean | null
          monthly_price_cents: number | null
          sector_key: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          ai_system_prompt?: string | null
          compliance_frameworks?: Json | null
          created_at?: string | null
          curriculum_standards?: Json | null
          description?: string | null
          display_name: string
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          monthly_price_cents?: number | null
          sector_key: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          ai_system_prompt?: string | null
          compliance_frameworks?: Json | null
          created_at?: string | null
          curriculum_standards?: Json | null
          description?: string | null
          display_name?: string
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          monthly_price_cents?: number | null
          sector_key?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sector_question_banks: {
        Row: {
          blooms_level: string | null
          created_at: string | null
          difficulty: string | null
          explanation: string | null
          id: string
          is_active: boolean | null
          options: Json | null
          question_text: string
          question_type: string | null
          regulatory_reference: string | null
          sector_module_id: string
          sort_order: number | null
          subtopic: string | null
          tags: Json | null
          topic: string
          updated_at: string | null
        }
        Insert: {
          blooms_level?: string | null
          created_at?: string | null
          difficulty?: string | null
          explanation?: string | null
          id?: string
          is_active?: boolean | null
          options?: Json | null
          question_text: string
          question_type?: string | null
          regulatory_reference?: string | null
          sector_module_id: string
          sort_order?: number | null
          subtopic?: string | null
          tags?: Json | null
          topic: string
          updated_at?: string | null
        }
        Update: {
          blooms_level?: string | null
          created_at?: string | null
          difficulty?: string | null
          explanation?: string | null
          id?: string
          is_active?: boolean | null
          options?: Json | null
          question_text?: string
          question_type?: string | null
          regulatory_reference?: string | null
          sector_module_id?: string
          sort_order?: number | null
          subtopic?: string | null
          tags?: Json | null
          topic?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sector_question_banks_sector_module_id_fkey"
            columns: ["sector_module_id"]
            isOneToOne: false
            referencedRelation: "sector_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      student_badges: {
        Row: {
          badge_description: string | null
          badge_icon: string
          badge_key: string
          badge_name: string
          created_at: string | null
          earned_at: string | null
          id: string
          student_id: string
          tenant_id: string
        }
        Insert: {
          badge_description?: string | null
          badge_icon?: string
          badge_key: string
          badge_name: string
          created_at?: string | null
          earned_at?: string | null
          id?: string
          student_id: string
          tenant_id: string
        }
        Update: {
          badge_description?: string | null
          badge_icon?: string
          badge_key?: string
          badge_name?: string
          created_at?: string | null
          earned_at?: string | null
          id?: string
          student_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_badges_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_badges_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      student_points: {
        Row: {
          created_at: string | null
          id: string
          points: number
          reason: string
          source_id: string | null
          source_type: string
          student_id: string
          tenant_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          points: number
          reason: string
          source_id?: string | null
          source_type: string
          student_id: string
          tenant_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          points?: number
          reason?: string
          source_id?: string | null
          source_type?: string
          student_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_points_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_points_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      student_streaks: {
        Row: {
          created_at: string | null
          current_streak: number | null
          id: string
          last_activity_date: string | null
          longest_streak: number | null
          student_id: string
          tenant_id: string
          total_active_days: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          student_id: string
          tenant_id: string
          total_active_days?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          student_id?: string
          tenant_id?: string
          total_active_days?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_streaks_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_streaks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_sector_subscriptions: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          sector_module_id: string
          status: string | null
          stripe_subscription_id: string | null
          subscribed_at: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          sector_module_id: string
          status?: string | null
          stripe_subscription_id?: string | null
          subscribed_at?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          sector_module_id?: string
          status?: string | null
          stripe_subscription_id?: string | null
          subscribed_at?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_sector_subscriptions_sector_module_id_fkey"
            columns: ["sector_module_id"]
            isOneToOne: false
            referencedRelation: "sector_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_sector_subscriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          accent_color: string | null
          brevo_api_key: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          custom_domain: string | null
          description: string | null
          feature_flags: Json | null
          id: string
          location: string | null
          logo_fallback_letter: string | null
          logo_url: string | null
          name: string
          notification_settings: Json | null
          primary_color: string | null
          secondary_color: string | null
          stripe_account_id: string | null
          subdomain: string
          trademark: string | null
          updated_at: string | null
          website_url: string | null
          zoom_credentials: Json | null
        }
        Insert: {
          accent_color?: string | null
          brevo_api_key?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          custom_domain?: string | null
          description?: string | null
          feature_flags?: Json | null
          id?: string
          location?: string | null
          logo_fallback_letter?: string | null
          logo_url?: string | null
          name: string
          notification_settings?: Json | null
          primary_color?: string | null
          secondary_color?: string | null
          stripe_account_id?: string | null
          subdomain: string
          trademark?: string | null
          updated_at?: string | null
          website_url?: string | null
          zoom_credentials?: Json | null
        }
        Update: {
          accent_color?: string | null
          brevo_api_key?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          custom_domain?: string | null
          description?: string | null
          feature_flags?: Json | null
          id?: string
          location?: string | null
          logo_fallback_letter?: string | null
          logo_url?: string | null
          name?: string
          notification_settings?: Json | null
          primary_color?: string | null
          secondary_color?: string | null
          stripe_account_id?: string | null
          subdomain?: string
          trademark?: string | null
          updated_at?: string | null
          website_url?: string | null
          zoom_credentials?: Json | null
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          created_at: string | null
          event_id: string
          event_type: string
          id: string
          payload: Json | null
          processed: boolean | null
          processed_at: string | null
          provider: string
          tenant_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_id: string
          event_type: string
          id?: string
          payload?: Json | null
          processed?: boolean | null
          processed_at?: string | null
          provider: string
          tenant_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string
          event_type?: string
          id?: string
          payload?: Json | null
          processed?: boolean | null
          processed_at?: string | null
          provider?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      whitelabel_tenants: {
        Row: {
          contact_email: string | null
          contact_name: string | null
          created_at: string | null
          domain: string | null
          id: string
          logo_url: string | null
          name: string
          notes: string | null
          primary_color: string | null
          provisioned_at: string | null
          secondary_color: string | null
          status: string | null
          supabase_project_url: string | null
          updated_at: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string | null
          domain?: string | null
          id?: string
          logo_url?: string | null
          name: string
          notes?: string | null
          primary_color?: string | null
          provisioned_at?: string | null
          secondary_color?: string | null
          status?: string | null
          supabase_project_url?: string | null
          updated_at?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string | null
          domain?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          notes?: string | null
          primary_color?: string | null
          provisioned_at?: string | null
          secondary_color?: string | null
          status?: string | null
          supabase_project_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_tenant_id: { Args: never; Returns: string }
      current_user_role: { Args: never; Returns: string }
      custom_access_token_hook: { Args: { event: Json }; Returns: Json }
      generate_application_number: { Args: never; Returns: string }
      generate_certificate_number: { Args: never; Returns: string }
      generate_enrollment_number: { Args: never; Returns: string }
      update_notification_preferences: {
        Args: { p_class_reminders?: boolean; p_general_messages?: boolean }
        Returns: undefined
      }
      update_student_profile: {
        Args: {
          p_address?: string
          p_email?: string
          p_mailing_address?: string
          p_phone?: string
        }
        Returns: undefined
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
