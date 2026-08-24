// Auto-generated Database Types for OMLIINK
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          is_verified: boolean
          verification_type: string | null
          is_employer: boolean
          is_candidate: boolean
          account_status: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      candidate_profiles: {
        Row: {
          id: string
          user_id: string
          bio: string | null
          years_experience: number | null
          skills: string[] | null
          languages: string[] | null
          hourly_rate: number | null
          availability_status: string
          rating: number
          total_missions_completed: number
          response_rate: number
          no_show_count: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['candidate_profiles']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['candidate_profiles']['Insert']>
      }
      employer_profiles: {
        Row: {
          id: string
          user_id: string
          company_name: string | null
          bio: string | null
          total_missions_posted: number
          total_spent: number
          rating: number
          payment_verified: boolean
          stripe_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['employer_profiles']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['employer_profiles']['Insert']>
      }
      service_categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          icon_url: string | null
          sort_order: number | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['service_categories']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['service_categories']['Insert']>
      }
      missions: {
        Row: {
          id: string
          employer_id: string
          category_id: string
          title: string
          description: string | null
          location_address: string | null
          location_lat: number | null
          location_lng: number | null
          status: string
          mission_date: string | null
          mission_time_start: string | null
          mission_time_end: string | null
          estimated_duration_hours: number | null
          budget: number | null
          urssaf_declared: boolean
          visio_required: boolean
          visio_completed: boolean
          max_candidates: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['missions']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['missions']['Insert']>
      }
      visio_meetings: {
        Row: {
          id: string
          mission_id: string
          employer_id: string
          candidate_id: string
          room_name: string
          livekit_token_employer: string | null
          livekit_token_candidate: string | null
          status: string
          proposed_date: string | null
          scheduled_date: string | null
          started_at: string | null
          ended_at: string | null
          duration_minutes: number | null
          recording_url: string | null
          recording_consent_employer: boolean
          recording_consent_candidate: boolean
          reschedule_count: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['visio_meetings']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['visio_meetings']['Insert']>
      }
      applications: {
        Row: {
          id: string
          mission_id: string
          candidate_id: string
          status: string
          cover_letter: string | null
          proposed_rate: number | null
          applied_at: string
          viewed_at: string | null
          responded_at: string | null
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['applications']['Row'], 'id' | 'applied_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['applications']['Insert']>
      }
      contracts: {
        Row: {
          id: string
          mission_id: string
          candidate_id: string
          employer_id: string
          status: string
          total_amount: number | null
          payment_status: string
          signed_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['contracts']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['contracts']['Insert']>
      }
      payments: {
        Row: {
          id: string
          mission_id: string
          candidate_id: string
          employer_id: string
          amount: number
          payment_method: string | null
          stripe_payment_intent_id: string | null
          status: string
          fee_amount: number | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['payments']['Insert']>
      }
      reviews: {
        Row: {
          id: string
          mission_id: string
          from_user_id: string
          to_user_id: string
          rating: number
          comment: string | null
          is_anonymous: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['reviews']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>
      }
      conversations: {
        Row: {
          id: string
          mission_id: string | null
          user_1_id: string
          user_2_id: string
          last_message_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['conversations']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['conversations']['Insert']>
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          is_read: boolean
          read_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['messages']['Insert']>
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string | null
          title: string | null
          message: string | null
          related_id: string | null
          is_read: boolean
          read_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
      }
      documents: {
        Row: {
          id: string
          user_id: string
          type: string | null
          file_url: string | null
          file_name: string | null
          verification_status: string
          uploaded_at: string
          verified_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['documents']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['documents']['Insert']>
      }
      reports: {
        Row: {
          id: string
          reported_user_id: string
          reporter_user_id: string
          mission_id: string | null
          reason: string | null
          description: string | null
          status: string
          admin_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['reports']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['reports']['Insert']>
      }
      [key: string]: any
    }
    Views: {
      [key: string]: {
        Row: {
          [key: string]: any
        }
      }
    }
    Functions: {
      [key: string]: {
        Args: Record<string, unknown>
        Returns: unknown
      }
    }
    Enums: {
      [key: string]: string
    }
    CompositeTypes: {
      [key: string]: Record<string, unknown>
    }
  }
}