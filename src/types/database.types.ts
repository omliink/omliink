// Auto-generated Database Types for OMLIINK
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// --- profiles ---
type ProfilesRow = {
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
type ProfilesInsert = {
  id: string
  email: string
  full_name?: string | null
  phone?: string | null
  avatar_url?: string | null
  is_verified?: boolean
  verification_type?: string | null
  is_employer?: boolean
  is_candidate?: boolean
  account_status?: string
  created_at?: string
  updated_at?: string
}
type ProfilesUpdate = Partial<ProfilesInsert>

// --- candidate_profiles ---
type CandidateProfilesRow = {
  id: string
  user_id: string
  bio: string | null
  years_experience: number | null
  skills: string[] | null
  languages: string[] | null
  hourly_rate: number | null
  availability_status: string
  employment_status: string
  location_address: string | null
  location_lat: number | null
  location_lng: number | null
  radius_km: number
  stripe_connect_account_id: string | null
  stripe_connect_onboarded: boolean
  rating: number
  total_missions_completed: number
  response_rate: number
  no_show_count: number
  gender: string | null
  birth_date: string | null
  birth_place: string | null
  native_language: string | null
  phone_visible: boolean
  photo_url: string
  experience_level: string | null
  bio_title: string | null
  bio_text: string | null
  verification_status: string
  verification_document_url: string | null
  created_at: string
  updated_at: string
}
type CandidateProfilesInsert = {
  id?: string
  user_id: string
  bio?: string | null
  years_experience?: number | null
  skills?: string[] | null
  languages?: string[] | null
  hourly_rate?: number | null
  availability_status?: string
  employment_status?: string
  location_address?: string | null
  location_lat?: number | null
  location_lng?: number | null
  radius_km?: number
  stripe_connect_account_id?: string | null
  stripe_connect_onboarded?: boolean
  rating?: number
  total_missions_completed?: number
  response_rate?: number
  no_show_count?: number
  gender?: string | null
  birth_date?: string | null
  birth_place?: string | null
  native_language?: string | null
  phone_visible?: boolean
  photo_url?: string
  experience_level?: string | null
  bio_title?: string | null
  bio_text?: string | null
  verification_status?: string
  verification_document_url?: string | null
  created_at?: string
  updated_at?: string
}
type CandidateProfilesUpdate = Partial<CandidateProfilesInsert>

// --- skill_taxonomy ---
type SkillTaxonomyRow = {
  id: string
  category_id: string
  skill_tag: string
  label: string
  created_at: string
}
type SkillTaxonomyInsert = {
  id?: string
  category_id: string
  skill_tag: string
  label: string
  created_at?: string
}
type SkillTaxonomyUpdate = Partial<SkillTaxonomyInsert>

// --- candidate_languages ---
type CandidateLanguagesRow = {
  id: string
  candidate_id: string
  language: string
  is_native: boolean
  created_at: string
}
type CandidateLanguagesInsert = {
  id?: string
  candidate_id: string
  language: string
  is_native?: boolean
  created_at?: string
}
type CandidateLanguagesUpdate = Partial<CandidateLanguagesInsert>

// --- candidate_service_types ---
type CandidateServiceTypesRow = {
  id: string
  candidate_id: string
  category_id: string
  created_at: string
}
type CandidateServiceTypesInsert = {
  id?: string
  candidate_id: string
  category_id: string
  created_at?: string
}
type CandidateServiceTypesUpdate = Partial<CandidateServiceTypesInsert>

// --- candidate_supplements ---
type CandidateSupplementsRow = {
  id: string
  candidate_id: string
  supplement_code: string
  created_at: string
}
type CandidateSupplementsInsert = {
  id?: string
  candidate_id: string
  supplement_code: string
  created_at?: string
}
type CandidateSupplementsUpdate = Partial<CandidateSupplementsInsert>

// --- candidate_skills ---
type CandidateSkillsRow = {
  id: string
  candidate_id: string
  category_id: string
  skill_tag: string
  created_at: string
}
type CandidateSkillsInsert = {
  id?: string
  candidate_id: string
  category_id: string
  skill_tag: string
  created_at?: string
}
type CandidateSkillsUpdate = Partial<CandidateSkillsInsert>

// --- employer_profiles ---
type EmployerProfilesRow = {
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
type EmployerProfilesInsert = {
  id?: string
  user_id: string
  company_name?: string | null
  bio?: string | null
  total_missions_posted?: number
  total_spent?: number
  rating?: number
  payment_verified?: boolean
  stripe_customer_id?: string | null
  created_at?: string
  updated_at?: string
}
type EmployerProfilesUpdate = Partial<EmployerProfilesInsert>

// --- service_categories ---
type ServiceCategoriesRow = {
  id: string
  name: string
  slug: string
  description: string | null
  icon_url: string | null
  sort_order: number | null
  created_at: string
}
type ServiceCategoriesInsert = {
  id?: string
  name: string
  slug: string
  description?: string | null
  icon_url?: string | null
  sort_order?: number | null
  created_at?: string
}
type ServiceCategoriesUpdate = Partial<ServiceCategoriesInsert>

// --- missions ---
type MissionsRow = {
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
type MissionsInsert = {
  id?: string
  employer_id: string
  category_id: string
  title: string
  description?: string | null
  location_address?: string | null
  location_lat?: number | null
  location_lng?: number | null
  status?: string
  mission_date?: string | null
  mission_time_start?: string | null
  mission_time_end?: string | null
  estimated_duration_hours?: number | null
  budget?: number | null
  urssaf_declared?: boolean
  visio_required?: boolean
  visio_completed?: boolean
  max_candidates?: number
  created_at?: string
  updated_at?: string
}
type MissionsUpdate = Partial<MissionsInsert>

// --- visio_meetings ---
type VisioMeetingsRow = {
  id: string
  mission_id: string
  application_id: string | null
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
type VisioMeetingsInsert = {
  id?: string
  mission_id: string
  application_id?: string | null
  employer_id: string
  candidate_id: string
  room_name: string
  livekit_token_employer?: string | null
  livekit_token_candidate?: string | null
  status?: string
  proposed_date?: string | null
  scheduled_date?: string | null
  started_at?: string | null
  ended_at?: string | null
  duration_minutes?: number | null
  recording_url?: string | null
  recording_consent_employer?: boolean
  recording_consent_candidate?: boolean
  reschedule_count?: number
  notes?: string | null
  created_at?: string
  updated_at?: string
}
type VisioMeetingsUpdate = Partial<VisioMeetingsInsert>

// --- applications ---
type ApplicationsRow = {
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
type ApplicationsInsert = {
  id?: string
  mission_id: string
  candidate_id: string
  status?: string
  cover_letter?: string | null
  proposed_rate?: number | null
  applied_at?: string
  viewed_at?: string | null
  responded_at?: string | null
  updated_at?: string
}
type ApplicationsUpdate = Partial<ApplicationsInsert>

// --- contracts ---
type ContractsRow = {
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
type ContractsInsert = {
  id?: string
  mission_id: string
  candidate_id: string
  employer_id: string
  status?: string
  total_amount?: number | null
  payment_status?: string
  signed_date?: string | null
  created_at?: string
  updated_at?: string
}
type ContractsUpdate = Partial<ContractsInsert>

// --- payments ---
type PaymentsRow = {
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
type PaymentsInsert = {
  id?: string
  mission_id: string
  candidate_id: string
  employer_id: string
  amount: number
  payment_method?: string | null
  stripe_payment_intent_id?: string | null
  status?: string
  fee_amount?: number | null
  created_at?: string
  updated_at?: string
}
type PaymentsUpdate = Partial<PaymentsInsert>

// --- reviews ---
type ReviewsRow = {
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
type ReviewsInsert = {
  id?: string
  mission_id: string
  from_user_id: string
  to_user_id: string
  rating: number
  comment?: string | null
  is_anonymous?: boolean
  created_at?: string
  updated_at?: string
}
type ReviewsUpdate = Partial<ReviewsInsert>

// --- conversations ---
type ConversationsRow = {
  id: string
  mission_id: string | null
  user_1_id: string
  user_2_id: string
  last_message_at: string | null
  created_at: string
  updated_at: string
}
type ConversationsInsert = {
  id?: string
  mission_id?: string | null
  user_1_id: string
  user_2_id: string
  last_message_at?: string | null
  created_at?: string
  updated_at?: string
}
type ConversationsUpdate = Partial<ConversationsInsert>

// --- messages ---
type MessagesRow = {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  is_read: boolean
  read_at: string | null
  created_at: string
}
type MessagesInsert = {
  id?: string
  conversation_id: string
  sender_id: string
  content: string
  is_read?: boolean
  read_at?: string | null
  created_at?: string
}
type MessagesUpdate = Partial<MessagesInsert>

// --- notifications ---
type NotificationsRow = {
  id: string
  user_id: string
  type: string | null
  title: string | null
  message: string | null
  related_id: string | null
  is_read: boolean
  read_at: string | null
  created_at: string
  updated_at: string
}
type NotificationsInsert = {
  id?: string
  user_id: string
  type?: string | null
  title?: string | null
  message?: string | null
  related_id?: string | null
  is_read?: boolean
  read_at?: string | null
  created_at?: string
  updated_at?: string
}
type NotificationsUpdate = Partial<NotificationsInsert>

// --- documents ---
type DocumentsRow = {
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
type DocumentsInsert = {
  id?: string
  user_id: string
  type?: string | null
  file_url?: string | null
  file_name?: string | null
  verification_status?: string
  uploaded_at?: string
  verified_at?: string | null
  created_at?: string
}
type DocumentsUpdate = Partial<DocumentsInsert>

// --- reports ---
type ReportsRow = {
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
type ReportsInsert = {
  id?: string
  reported_user_id: string
  reporter_user_id: string
  mission_id?: string | null
  reason?: string | null
  description?: string | null
  status?: string
  admin_notes?: string | null
  created_at?: string
  updated_at?: string
}
type ReportsUpdate = Partial<ReportsInsert>

export interface Database {
  __InternalSupabase: {
    PostgrestVersion: '12'
  }
  public: {
    Tables: {
      profiles: { Row: ProfilesRow; Insert: ProfilesInsert; Update: ProfilesUpdate; Relationships: [] }
      candidate_profiles: {
        Row: CandidateProfilesRow
        Insert: CandidateProfilesInsert
        Update: CandidateProfilesUpdate
        Relationships: []
      }
      employer_profiles: {
        Row: EmployerProfilesRow
        Insert: EmployerProfilesInsert
        Update: EmployerProfilesUpdate
        Relationships: []
      }
      service_categories: {
        Row: ServiceCategoriesRow
        Insert: ServiceCategoriesInsert
        Update: ServiceCategoriesUpdate
        Relationships: []
      }
      skill_taxonomy: {
        Row: SkillTaxonomyRow
        Insert: SkillTaxonomyInsert
        Update: SkillTaxonomyUpdate
        Relationships: []
      }
      candidate_languages: {
        Row: CandidateLanguagesRow
        Insert: CandidateLanguagesInsert
        Update: CandidateLanguagesUpdate
        Relationships: []
      }
      candidate_service_types: {
        Row: CandidateServiceTypesRow
        Insert: CandidateServiceTypesInsert
        Update: CandidateServiceTypesUpdate
        Relationships: []
      }
      candidate_supplements: {
        Row: CandidateSupplementsRow
        Insert: CandidateSupplementsInsert
        Update: CandidateSupplementsUpdate
        Relationships: []
      }
      candidate_skills: {
        Row: CandidateSkillsRow
        Insert: CandidateSkillsInsert
        Update: CandidateSkillsUpdate
        Relationships: []
      }
      missions: { Row: MissionsRow; Insert: MissionsInsert; Update: MissionsUpdate; Relationships: [] }
      visio_meetings: {
        Row: VisioMeetingsRow
        Insert: VisioMeetingsInsert
        Update: VisioMeetingsUpdate
        Relationships: []
      }
      applications: { Row: ApplicationsRow; Insert: ApplicationsInsert; Update: ApplicationsUpdate; Relationships: [] }
      contracts: { Row: ContractsRow; Insert: ContractsInsert; Update: ContractsUpdate; Relationships: [] }
      payments: { Row: PaymentsRow; Insert: PaymentsInsert; Update: PaymentsUpdate; Relationships: [] }
      reviews: { Row: ReviewsRow; Insert: ReviewsInsert; Update: ReviewsUpdate; Relationships: [] }
      conversations: {
        Row: ConversationsRow
        Insert: ConversationsInsert
        Update: ConversationsUpdate
        Relationships: []
      }
      messages: { Row: MessagesRow; Insert: MessagesInsert; Update: MessagesUpdate; Relationships: [] }
      notifications: {
        Row: NotificationsRow
        Insert: NotificationsInsert
        Update: NotificationsUpdate
        Relationships: []
      }
      documents: { Row: DocumentsRow; Insert: DocumentsInsert; Update: DocumentsUpdate; Relationships: [] }
      reports: { Row: ReportsRow; Insert: ReportsInsert; Update: ReportsUpdate; Relationships: [] }
    }
    Views: {
      [key: string]: never
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
