/**
 * Supabase Database Types for SimpliLMS Platform
 *
 * These types mirror the Supabase-generated types format for the
 * SimpliLMS PostgreSQL schema. All 17 tables in the public schema
 * are represented with Row, Insert, and Update variants.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string;
          name: string;
          subdomain: string;
          custom_domain: string | null;
          logo_url: string | null;
          primary_color: string;
          secondary_color: string;
          stripe_account_id: string | null;
          brevo_api_key: string | null;
          zoom_credentials: Json | null;
          feature_flags: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          subdomain: string;
          custom_domain?: string | null;
          logo_url?: string | null;
          primary_color?: string;
          secondary_color?: string;
          stripe_account_id?: string | null;
          brevo_api_key?: string | null;
          zoom_credentials?: Json | null;
          feature_flags?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          subdomain?: string;
          custom_domain?: string | null;
          logo_url?: string | null;
          primary_color?: string;
          secondary_color?: string;
          stripe_account_id?: string | null;
          brevo_api_key?: string | null;
          zoom_credentials?: Json | null;
          feature_flags?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
        ];
      };
      profiles: {
        Row: {
          id: string;
          tenant_id: string;
          role: "super_admin" | "school_rep" | "teacher_paid" | "teacher_unpaid" | "student";
          first_name: string | null;
          last_name: string | null;
          email: string | null;
          phone: string | null;
          address: string | null;
          mailing_address: string | null;
          date_of_birth: string | null;
          citizenship_status: string | null;
          program_of_interest: string | null;
          stripe_customer_id: string | null;
          stripe_connect_id: string | null;
          avatar_url: string | null;
          notification_preferences: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          tenant_id: string;
          role: "super_admin" | "school_rep" | "teacher_paid" | "teacher_unpaid" | "student";
          first_name?: string | null;
          last_name?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          mailing_address?: string | null;
          date_of_birth?: string | null;
          citizenship_status?: string | null;
          program_of_interest?: string | null;
          stripe_customer_id?: string | null;
          stripe_connect_id?: string | null;
          avatar_url?: string | null;
          notification_preferences?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          role?: "super_admin" | "school_rep" | "teacher_paid" | "teacher_unpaid" | "student";
          first_name?: string | null;
          last_name?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          mailing_address?: string | null;
          date_of_birth?: string | null;
          citizenship_status?: string | null;
          program_of_interest?: string | null;
          stripe_customer_id?: string | null;
          stripe_connect_id?: string | null;
          avatar_url?: string | null;
          notification_preferences?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      prospects: {
        Row: {
          id: string;
          tenant_id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string | null;
          program_interest: string | null;
          source: string | null;
          inquiry_ip_address: string | null;
          inquiry_user_agent: string | null;
          inquiry_submitted_at: string;
          discovery_call_date: string | null;
          discovery_call_zoom_link: string | null;
          google_calendar_event_id: string | null;
          eligibility_status: "pending" | "yes" | "no" | "maybe";
          eligibility_marked_by: string | null;
          eligibility_marked_at: string | null;
          remarketing_eligible: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone?: string | null;
          program_interest?: string | null;
          source?: string | null;
          inquiry_ip_address?: string | null;
          inquiry_user_agent?: string | null;
          inquiry_submitted_at?: string;
          discovery_call_date?: string | null;
          discovery_call_zoom_link?: string | null;
          google_calendar_event_id?: string | null;
          eligibility_status?: "pending" | "yes" | "no" | "maybe";
          eligibility_marked_by?: string | null;
          eligibility_marked_at?: string | null;
          remarketing_eligible?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          first_name?: string;
          last_name?: string;
          email?: string;
          phone?: string | null;
          program_interest?: string | null;
          source?: string | null;
          inquiry_ip_address?: string | null;
          inquiry_user_agent?: string | null;
          inquiry_submitted_at?: string;
          discovery_call_date?: string | null;
          discovery_call_zoom_link?: string | null;
          google_calendar_event_id?: string | null;
          eligibility_status?: "pending" | "yes" | "no" | "maybe";
          eligibility_marked_by?: string | null;
          eligibility_marked_at?: string | null;
          remarketing_eligible?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "prospects_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "prospects_eligibility_marked_by_fkey";
            columns: ["eligibility_marked_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      programs: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          description: string | null;
          tuition_amount_cents: number | null;
          enrollment_fee_cents: number;
          duration_weeks: number | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          description?: string | null;
          tuition_amount_cents?: number | null;
          enrollment_fee_cents?: number;
          duration_weeks?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          description?: string | null;
          tuition_amount_cents?: number | null;
          enrollment_fee_cents?: number;
          duration_weeks?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "programs_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      applications: {
        Row: {
          id: string;
          tenant_id: string;
          prospect_id: string | null;
          user_id: string | null;
          application_number: string | null;
          status: "draft" | "submitted" | "under_review" | "approved" | "rejected" | "enrolled";
          first_name: string | null;
          last_name: string | null;
          middle_name: string | null;
          email: string | null;
          phone: string | null;
          date_of_birth: string | null;
          address_line1: string | null;
          address_line2: string | null;
          city: string | null;
          state: string | null;
          zip_code: string | null;
          country: string | null;
          mailing_address_line1: string | null;
          mailing_address_line2: string | null;
          mailing_city: string | null;
          mailing_state: string | null;
          mailing_zip: string | null;
          mailing_country: string | null;
          program_id: string | null;
          citizenship_status: string | null;
          citizenship_document_type: string | null;
          citizenship_document_url: string | null;
          stripe_identity_session_id: string | null;
          stripe_identity_status: string | null;
          stripe_identity_verified_at: string | null;
          submitted_ip_address: string | null;
          submitted_user_agent: string | null;
          submitted_at: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          rejection_reason: string | null;
          isa_consent_given: boolean;
          isa_consent_text: string | null;
          isa_consent_timestamp: string | null;
          isa_consent_ip_address: string | null;
          payment_token: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          prospect_id?: string | null;
          user_id?: string | null;
          application_number?: string | null;
          status?: "draft" | "submitted" | "under_review" | "approved" | "rejected" | "enrolled";
          first_name?: string | null;
          last_name?: string | null;
          middle_name?: string | null;
          email?: string | null;
          phone?: string | null;
          date_of_birth?: string | null;
          address_line1?: string | null;
          address_line2?: string | null;
          city?: string | null;
          state?: string | null;
          zip_code?: string | null;
          country?: string | null;
          mailing_address_line1?: string | null;
          mailing_address_line2?: string | null;
          mailing_city?: string | null;
          mailing_state?: string | null;
          mailing_zip?: string | null;
          mailing_country?: string | null;
          program_id?: string | null;
          citizenship_status?: string | null;
          citizenship_document_type?: string | null;
          citizenship_document_url?: string | null;
          stripe_identity_session_id?: string | null;
          stripe_identity_status?: string | null;
          stripe_identity_verified_at?: string | null;
          submitted_ip_address?: string | null;
          submitted_user_agent?: string | null;
          submitted_at?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          rejection_reason?: string | null;
          isa_consent_given?: boolean;
          isa_consent_text?: string | null;
          isa_consent_timestamp?: string | null;
          isa_consent_ip_address?: string | null;
          payment_token?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          prospect_id?: string | null;
          user_id?: string | null;
          application_number?: string | null;
          status?: "draft" | "submitted" | "under_review" | "approved" | "rejected" | "enrolled";
          first_name?: string | null;
          last_name?: string | null;
          middle_name?: string | null;
          email?: string | null;
          phone?: string | null;
          date_of_birth?: string | null;
          address_line1?: string | null;
          address_line2?: string | null;
          city?: string | null;
          state?: string | null;
          zip_code?: string | null;
          country?: string | null;
          mailing_address_line1?: string | null;
          mailing_address_line2?: string | null;
          mailing_city?: string | null;
          mailing_state?: string | null;
          mailing_zip?: string | null;
          mailing_country?: string | null;
          program_id?: string | null;
          citizenship_status?: string | null;
          citizenship_document_type?: string | null;
          citizenship_document_url?: string | null;
          stripe_identity_session_id?: string | null;
          stripe_identity_status?: string | null;
          stripe_identity_verified_at?: string | null;
          submitted_ip_address?: string | null;
          submitted_user_agent?: string | null;
          submitted_at?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          rejection_reason?: string | null;
          isa_consent_given?: boolean;
          isa_consent_text?: string | null;
          isa_consent_timestamp?: string | null;
          isa_consent_ip_address?: string | null;
          payment_token?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "applications_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "applications_prospect_id_fkey";
            columns: ["prospect_id"];
            isOneToOne: false;
            referencedRelation: "prospects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "applications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "applications_program_id_fkey";
            columns: ["program_id"];
            isOneToOne: false;
            referencedRelation: "programs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "applications_reviewed_by_fkey";
            columns: ["reviewed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      enrollments: {
        Row: {
          id: string;
          tenant_id: string;
          application_id: string | null;
          user_id: string;
          enrollment_number: string | null;
          program_id: string;
          status: "active" | "payment_plan_active" | "suspended" | "completed" | "withdrawn";
          tuition_payment_method: "full_payment" | "isa" | null;
          enrolled_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          application_id?: string | null;
          user_id: string;
          enrollment_number?: string | null;
          program_id: string;
          status?: "active" | "payment_plan_active" | "suspended" | "completed" | "withdrawn";
          tuition_payment_method?: "full_payment" | "isa" | null;
          enrolled_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          application_id?: string | null;
          user_id?: string;
          enrollment_number?: string | null;
          program_id?: string;
          status?: "active" | "payment_plan_active" | "suspended" | "completed" | "withdrawn";
          tuition_payment_method?: "full_payment" | "isa" | null;
          enrolled_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "enrollments_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "enrollments_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "enrollments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "enrollments_program_id_fkey";
            columns: ["program_id"];
            isOneToOne: false;
            referencedRelation: "programs";
            referencedColumns: ["id"];
          },
        ];
      };
      payments: {
        Row: {
          id: string;
          tenant_id: string;
          user_id: string;
          application_id: string | null;
          enrollment_id: string | null;
          stripe_payment_intent_id: string | null;
          stripe_checkout_session_id: string | null;
          stripe_invoice_id: string | null;
          amount_cents: number;
          currency: string;
          fee_type: "registration" | "admission" | "document" | "deposit" | "tuition" | "installment";
          status: "pending" | "processing" | "succeeded" | "failed" | "refunded";
          payment_method: string | null;
          paid_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          user_id: string;
          application_id?: string | null;
          enrollment_id?: string | null;
          stripe_payment_intent_id?: string | null;
          stripe_checkout_session_id?: string | null;
          stripe_invoice_id?: string | null;
          amount_cents: number;
          currency?: string;
          fee_type: "registration" | "admission" | "document" | "deposit" | "tuition" | "installment";
          status?: "pending" | "processing" | "succeeded" | "failed" | "refunded";
          payment_method?: string | null;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          user_id?: string;
          application_id?: string | null;
          enrollment_id?: string | null;
          stripe_payment_intent_id?: string | null;
          stripe_checkout_session_id?: string | null;
          stripe_invoice_id?: string | null;
          amount_cents?: number;
          currency?: string;
          fee_type?: "registration" | "admission" | "document" | "deposit" | "tuition" | "installment";
          status?: "pending" | "processing" | "succeeded" | "failed" | "refunded";
          payment_method?: string | null;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payments_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_enrollment_id_fkey";
            columns: ["enrollment_id"];
            isOneToOne: false;
            referencedRelation: "enrollments";
            referencedColumns: ["id"];
          },
        ];
      };
      messages: {
        Row: {
          id: string;
          tenant_id: string;
          sender_id: string | null;
          recipient_id: string;
          subject: string | null;
          body: string;
          is_read: boolean;
          read_at: string | null;
          is_system: boolean;
          message_type: "general" | "payment_update" | "emergency" | "class_reminder";
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          sender_id?: string | null;
          recipient_id: string;
          subject?: string | null;
          body: string;
          is_read?: boolean;
          read_at?: string | null;
          is_system?: boolean;
          message_type?: "general" | "payment_update" | "emergency" | "class_reminder";
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          sender_id?: string | null;
          recipient_id?: string;
          subject?: string | null;
          body?: string;
          is_read?: boolean;
          read_at?: string | null;
          is_system?: boolean;
          message_type?: "general" | "payment_update" | "emergency" | "class_reminder";
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_recipient_id_fkey";
            columns: ["recipient_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      communication_templates: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          channel: "email" | "sms" | "whatsapp";
          subject: string | null;
          body: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          channel: "email" | "sms" | "whatsapp";
          subject?: string | null;
          body: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          channel?: "email" | "sms" | "whatsapp";
          subject?: string | null;
          body?: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "communication_templates_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "communication_templates_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      communication_log: {
        Row: {
          id: string;
          tenant_id: string;
          template_id: string | null;
          recipient_id: string | null;
          recipient_type: "profile" | "prospect";
          channel: string;
          sent_at: string;
          delivered_at: string | null;
          opened_at: string | null;
          clicked_at: string | null;
          tracking_id: string | null;
          link_url: string | null;
          metadata: Json | null;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          template_id?: string | null;
          recipient_id?: string | null;
          recipient_type: "profile" | "prospect";
          channel: string;
          sent_at?: string;
          delivered_at?: string | null;
          opened_at?: string | null;
          clicked_at?: string | null;
          tracking_id?: string | null;
          link_url?: string | null;
          metadata?: Json | null;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          template_id?: string | null;
          recipient_id?: string | null;
          recipient_type?: "profile" | "prospect";
          channel?: string;
          sent_at?: string;
          delivered_at?: string | null;
          opened_at?: string | null;
          clicked_at?: string | null;
          tracking_id?: string | null;
          link_url?: string | null;
          metadata?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "communication_log_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "communication_log_template_id_fkey";
            columns: ["template_id"];
            isOneToOne: false;
            referencedRelation: "communication_templates";
            referencedColumns: ["id"];
          },
        ];
      };
      classes: {
        Row: {
          id: string;
          tenant_id: string;
          program_id: string | null;
          instructor_id: string;
          name: string;
          description: string | null;
          zoom_meeting_id: string | null;
          zoom_join_url: string | null;
          zoom_start_url: string | null;
          schedule: Json | null;
          max_students: number | null;
          commission_rate: number;
          price_cents: number | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          program_id?: string | null;
          instructor_id: string;
          name: string;
          description?: string | null;
          zoom_meeting_id?: string | null;
          zoom_join_url?: string | null;
          zoom_start_url?: string | null;
          schedule?: Json | null;
          max_students?: number | null;
          commission_rate?: number;
          price_cents?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          program_id?: string | null;
          instructor_id?: string;
          name?: string;
          description?: string | null;
          zoom_meeting_id?: string | null;
          zoom_join_url?: string | null;
          zoom_start_url?: string | null;
          schedule?: Json | null;
          max_students?: number | null;
          commission_rate?: number;
          price_cents?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "classes_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "classes_program_id_fkey";
            columns: ["program_id"];
            isOneToOne: false;
            referencedRelation: "programs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "classes_instructor_id_fkey";
            columns: ["instructor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      class_enrollments: {
        Row: {
          id: string;
          tenant_id: string;
          class_id: string;
          student_id: string;
          stripe_payment_intent_id: string | null;
          status: "enrolled" | "dropped" | "completed";
          enrolled_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          class_id: string;
          student_id: string;
          stripe_payment_intent_id?: string | null;
          status?: "enrolled" | "dropped" | "completed";
          enrolled_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          class_id?: string;
          student_id?: string;
          stripe_payment_intent_id?: string | null;
          status?: "enrolled" | "dropped" | "completed";
          enrolled_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "class_enrollments_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "class_enrollments_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "classes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "class_enrollments_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      attendance: {
        Row: {
          id: string;
          tenant_id: string;
          class_id: string;
          student_id: string;
          session_date: string;
          status: "present" | "absent" | "late" | "excused";
          marked_by: string;
          marked_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          class_id: string;
          student_id: string;
          session_date: string;
          status: "present" | "absent" | "late" | "excused";
          marked_by: string;
          marked_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          class_id?: string;
          student_id?: string;
          session_date?: string;
          status?: "present" | "absent" | "late" | "excused";
          marked_by?: string;
          marked_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "attendance_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attendance_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "classes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attendance_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attendance_marked_by_fkey";
            columns: ["marked_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      consent_records: {
        Row: {
          id: string;
          tenant_id: string;
          user_id: string;
          consent_type: "isa_data_sharing" | "marketing_email" | "marketing_sms" | "terms_of_service" | "privacy_policy";
          consent_text: string;
          consented: boolean;
          ip_address: string | null;
          user_agent: string | null;
          consented_at: string;
          revoked_at: string | null;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          user_id: string;
          consent_type: "isa_data_sharing" | "marketing_email" | "marketing_sms" | "terms_of_service" | "privacy_policy";
          consent_text: string;
          consented: boolean;
          ip_address?: string | null;
          user_agent?: string | null;
          consented_at?: string;
          revoked_at?: string | null;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          user_id?: string;
          consent_type?: "isa_data_sharing" | "marketing_email" | "marketing_sms" | "terms_of_service" | "privacy_policy";
          consent_text?: string;
          consented?: boolean;
          ip_address?: string | null;
          user_agent?: string | null;
          consented_at?: string;
          revoked_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "consent_records_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "consent_records_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      audit_log: {
        Row: {
          id: string;
          tenant_id: string;
          actor_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          old_values: Json | null;
          new_values: Json | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          actor_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          old_values?: Json | null;
          new_values?: Json | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          actor_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          old_values?: Json | null;
          new_values?: Json | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "audit_log_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "audit_log_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      error_log: {
        Row: {
          id: string;
          tenant_id: string | null;
          source: string;
          error_type: string | null;
          error_message: string;
          stack_trace: string | null;
          context: Json | null;
          resolved: boolean;
          resolved_by: string | null;
          resolved_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string | null;
          source: string;
          error_type?: string | null;
          error_message: string;
          stack_trace?: string | null;
          context?: Json | null;
          resolved?: boolean;
          resolved_by?: string | null;
          resolved_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string | null;
          source?: string;
          error_type?: string | null;
          error_message?: string;
          stack_trace?: string | null;
          context?: Json | null;
          resolved?: boolean;
          resolved_by?: string | null;
          resolved_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "error_log_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "error_log_resolved_by_fkey";
            columns: ["resolved_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      webhook_events: {
        Row: {
          id: string;
          tenant_id: string | null;
          provider: string;
          event_id: string;
          event_type: string;
          payload: Json | null;
          processed: boolean;
          processed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string | null;
          provider: string;
          event_id: string;
          event_type: string;
          payload?: Json | null;
          processed?: boolean;
          processed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string | null;
          provider?: string;
          event_id?: string;
          event_type?: string;
          payload?: Json | null;
          processed?: boolean;
          processed_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "webhook_events_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
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

// ============================================================================
// Helper types
// ============================================================================

type PublicSchema = Database[Extract<keyof Database, "public">];

/**
 * Extract the Row type for a given table name.
 */
export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

/**
 * Extract the Insert type for a given table name.
 */
export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

/**
 * Extract the Update type for a given table name.
 */
export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;
