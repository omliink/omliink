-- ========================================
-- OMLIINK DATABASE SETUP
-- 25 Tables + RLS + Indexes + Triggers
-- (19 tables MVP initial (18 "core" + favorite_candidates en bonus) +
--  6 tables Sprint 4a-4d — voir ARCHITECTURE_DATABASE.md pour le détail
--  par sprint)
--
-- ⚠️ Fichier de référence du schéma CIBLE — pas une migration à exécuter.
-- Les migrations Supabase réelles sont créées et appliquées manuellement,
-- sprint par sprint, dans supabase/migrations/.
-- ========================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- 1. PROFILES (Users Auth)
-- ========================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_type VARCHAR(50), -- 'kyc', 'onfido', 'case_judiciaire'
  is_employer BOOLEAN DEFAULT FALSE,
  is_candidate BOOLEAN DEFAULT FALSE,
  account_status VARCHAR(50) DEFAULT 'active', -- 'active', 'suspended', 'deleted'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- ========================================
-- 2. CANDIDATE_PROFILES
-- ========================================
CREATE TABLE candidate_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  bio TEXT,
  years_experience INTEGER,
  skills TEXT[], -- Array of skills
  languages VARCHAR(100)[],
  hourly_rate DECIMAL(10, 2),
  availability_status VARCHAR(50) DEFAULT 'available', -- 'available', 'busy', 'unavailable'
  rating DECIMAL(3, 2) DEFAULT 0, -- 0-5 stars
  total_missions_completed INTEGER DEFAULT 0,
  response_rate DECIMAL(5, 2) DEFAULT 0,
  no_show_count INTEGER DEFAULT 0,

  -- Onboarding candidat wizard 9 étapes (Sprint 4b)
  gender VARCHAR(50),                       -- étape 1
  birth_date DATE,                          -- étape 2
  birth_place VARCHAR(255),                 -- étape 2
  native_language VARCHAR(100),             -- étape 2
  phone_visible BOOLEAN DEFAULT FALSE,      -- étape 2
  photo_url TEXT NOT NULL,                  -- étape 3, OBLIGATOIRE (bloquant)
  experience_level VARCHAR(50),             -- étape 6: 'debutant', 'intermediaire', 'experimente'
  bio_title VARCHAR(255),                   -- étape 8
  bio_text TEXT,                            -- étape 8
  verification_status VARCHAR(50) DEFAULT 'not_submitted',
  -- 'not_submitted', 'pending', 'verified', 'rejected'
  verification_document_url TEXT,           -- pièce d'identité uploadée

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE candidate_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Candidates can view/update their own profile"
  ON candidate_profiles FOR ALL USING (user_id = auth.uid());

-- ========================================
-- 3. EMPLOYER_PROFILES
-- ========================================
CREATE TABLE employer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_name VARCHAR(255),
  bio TEXT,
  total_missions_posted INTEGER DEFAULT 0,
  total_spent DECIMAL(15, 2) DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0,
  payment_verified BOOLEAN DEFAULT FALSE,
  stripe_customer_id VARCHAR(255),

  -- Abonnement Premium (Sprint 4d) — Stripe Subscriptions, distinct du
  -- Stripe Checkout des paiements de mission
  subscription_tier VARCHAR(50) DEFAULT 'free', -- 'free', 'premium'
  subscription_status VARCHAR(50) DEFAULT 'inactive',
  -- 'inactive', 'active', 'past_due', 'canceled'
  stripe_subscription_id VARCHAR(255),

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE employer_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Employers can view/update their own profile"
  ON employer_profiles FOR ALL USING (user_id = auth.uid());

-- ========================================
-- 4. SERVICE_CATEGORIES
-- ========================================
CREATE TABLE service_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon_url TEXT,
  sort_order INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view categories"
  ON service_categories FOR SELECT USING (TRUE);

-- ========================================
-- 5. MISSIONS
-- ========================================
CREATE TABLE missions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES service_categories(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location_address VARCHAR(500),
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'published', 'paused', 'matching', 'visio_scheduled', 'assigned', 'in_progress', 'completed', 'cancelled', 'disputed'
  -- 'paused' ajouté Sprint 4c : mise en pause manuelle par l'employeur
  mission_date DATE,
  mission_time_start TIME,
  mission_time_end TIME,
  estimated_duration_hours DECIMAL(5, 2),
  budget DECIMAL(10, 2),
  urssaf_declared BOOLEAN DEFAULT FALSE,
  visio_required BOOLEAN DEFAULT TRUE,
  visio_completed BOOLEAN DEFAULT FALSE,
  max_candidates INTEGER DEFAULT 10,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view published missions"
  ON missions FOR SELECT USING (status = 'published' OR employer_id = auth.uid());
CREATE POLICY "Employers can manage their own missions"
  ON missions FOR ALL USING (employer_id = auth.uid());

-- Index for geo queries
CREATE INDEX idx_missions_location ON missions(location_lat, location_lng);
CREATE INDEX idx_missions_status ON missions(status);
CREATE INDEX idx_missions_employer ON missions(employer_id);

-- ========================================
-- 6. VISIO_MEETINGS
-- ========================================
CREATE TABLE visio_meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  employer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  room_name VARCHAR(255) NOT NULL UNIQUE,
  livekit_token_employer TEXT,
  livekit_token_candidate TEXT,
  status VARCHAR(50) DEFAULT 'proposed', -- 'proposed', 'accepted', 'in_progress', 'completed', 'cancelled', 'no_show_employer', 'no_show_candidate'
  proposed_date TIMESTAMP,
  scheduled_date TIMESTAMP,
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  duration_minutes INTEGER,
  recording_url TEXT,
  recording_consent_employer BOOLEAN DEFAULT FALSE,
  recording_consent_candidate BOOLEAN DEFAULT FALSE,
  reschedule_count INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE visio_meetings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their visio meetings"
  ON visio_meetings FOR SELECT USING (employer_id = auth.uid() OR candidate_id = auth.uid());
CREATE POLICY "Users can update their visio meetings"
  ON visio_meetings FOR UPDATE USING (employer_id = auth.uid() OR candidate_id = auth.uid());

-- ========================================
-- 7. VISIO_AVAILABILITY_SLOTS
-- ========================================
CREATE TABLE visio_availability_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  proposed_start TIMESTAMP NOT NULL,
  proposed_end TIMESTAMP NOT NULL,
  is_accepted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE visio_availability_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view availability slots"
  ON visio_availability_slots FOR SELECT USING (
    candidate_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM missions WHERE id = mission_id AND employer_id = auth.uid())
  );

-- ========================================
-- 8. VISIO_FEEDBACK
-- ========================================
CREATE TABLE visio_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visio_meeting_id UUID NOT NULL REFERENCES visio_meetings(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES profiles(id),
  to_user_id UUID NOT NULL REFERENCES profiles(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE visio_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view feedback about them"
  ON visio_feedback FOR SELECT USING (to_user_id = auth.uid() OR from_user_id = auth.uid());

-- ========================================
-- 9. APPLICATIONS
-- ========================================
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending',
  -- Sprint 4a: 'pending', 'interviewing', 'hired', 'rejected'
  -- 'interviewing': plusieurs candidatures peuvent l'être EN MEME TEMPS
  --   sur une même mission (entretiens en parallèle) ; 'hired': un seul
  --   candidat par mission, rejet automatique des autres candidatures
  cover_letter TEXT,
  proposed_rate DECIMAL(10, 2),
  applied_at TIMESTAMP DEFAULT NOW(),
  viewed_at TIMESTAMP,
  responded_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(mission_id, candidate_id)
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Candidates can view their applications"
  ON applications FOR SELECT USING (candidate_id = auth.uid());
CREATE POLICY "Employers can view applications to their missions"
  ON applications FOR SELECT USING (
    EXISTS (SELECT 1 FROM missions WHERE id = mission_id AND employer_id = auth.uid())
  );

-- ========================================
-- 10. CONTRACTS
-- ========================================
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  employer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'signed', 'active', 'completed', 'cancelled'
  total_amount DECIMAL(10, 2),
  payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'refunded'
  signed_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(mission_id, candidate_id)
);

ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their contracts"
  ON contracts FOR SELECT USING (candidate_id = auth.uid() OR employer_id = auth.uid());

-- ========================================
-- 11. WORK_SESSIONS
-- ========================================
CREATE TABLE work_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  duration_hours DECIMAL(5, 2),
  amount DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE work_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their work sessions"
  ON work_sessions FOR SELECT USING (
    candidate_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM missions WHERE id = mission_id AND employer_id = auth.uid())
  );

-- ========================================
-- 12. PAYMENTS
-- ========================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  employer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50), -- 'stripe', 'bank_transfer'
  stripe_payment_intent_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'succeeded', 'failed', 'refunded'
  fee_amount DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their payments"
  ON payments FOR SELECT USING (candidate_id = auth.uid() OR employer_id = auth.uid());

-- ========================================
-- 13. REVIEWS
-- ========================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(mission_id, from_user_id, to_user_id)
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view reviews"
  ON reviews FOR SELECT USING (TRUE);
CREATE POLICY "Users can create reviews"
  ON reviews FOR INSERT WITH CHECK (from_user_id = auth.uid());

-- ========================================
-- 14. CONVERSATIONS
-- ========================================
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
  user_1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_2_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_message_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their conversations"
  ON conversations FOR SELECT USING (user_1_id = auth.uid() OR user_2_id = auth.uid());

-- ========================================
-- 15. MESSAGES
-- ========================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE id = conversation_id 
      AND (user_1_id = auth.uid() OR user_2_id = auth.uid())
    )
  );
CREATE POLICY "Users can create messages"
  ON messages FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Index for message queries
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);

-- ========================================
-- 16. NOTIFICATIONS
-- ========================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(100), -- 'application_received', 'mission_matched', 'message', 'payment_received', etc.
  title VARCHAR(255),
  message TEXT,
  related_id UUID, -- mission_id, application_id, etc.
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their notifications"
  ON notifications FOR SELECT USING (user_id = auth.uid());

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- ========================================
-- 17. DOCUMENTS
-- ========================================
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(100), -- 'id', 'passport', 'background_check', etc.
  file_url TEXT,
  file_name VARCHAR(255),
  verification_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
  uploaded_at TIMESTAMP DEFAULT NOW(),
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own documents"
  ON documents FOR SELECT USING (user_id = auth.uid());

-- ========================================
-- 18. REPORTS
-- ========================================
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reported_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reporter_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mission_id UUID REFERENCES missions(id) ON DELETE SET NULL,
  reason VARCHAR(255),
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'investigating', 'resolved', 'dismissed'
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view reports about them"
  ON reports FOR SELECT USING (reported_user_id = auth.uid() OR reporter_user_id = auth.uid());

-- ========================================
-- BONUS: FAVORITE_CANDIDATES
-- ========================================
CREATE TABLE favorite_candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(employer_id, candidate_id)
);

ALTER TABLE favorite_candidates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Employers can view their favorites"
  ON favorite_candidates FOR SELECT USING (employer_id = auth.uid());
CREATE POLICY "Employers can manage their favorites"
  ON favorite_candidates FOR ALL USING (employer_id = auth.uid());

-- ========================================
-- 19. SKILL_TAXONOMY (Sprint 4b — référentiel, pas de RLS candidat)
-- ========================================
CREATE TABLE skill_taxonomy (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES service_categories(id),
  tag VARCHAR(255) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(category_id, tag)
);

ALTER TABLE skill_taxonomy ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view skill taxonomy"
  ON skill_taxonomy FOR SELECT USING (TRUE);

-- ========================================
-- 20. CANDIDATE_LANGUAGES (Sprint 4b — wizard étape 2)
-- ========================================
CREATE TABLE candidate_languages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES candidate_profiles(user_id) ON DELETE CASCADE,
  language VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(candidate_id, language)
);

ALTER TABLE candidate_languages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Candidates can manage their own languages"
  ON candidate_languages FOR ALL USING (candidate_id = auth.uid());

-- ========================================
-- 21. CANDIDATE_SERVICE_TYPES (Sprint 4b — wizard étape 4)
-- ========================================
CREATE TABLE candidate_service_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES candidate_profiles(user_id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES service_categories(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(candidate_id, category_id)
);

ALTER TABLE candidate_service_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Candidates can manage their own service types"
  ON candidate_service_types FOR ALL USING (candidate_id = auth.uid());
CREATE POLICY "Everyone can view candidate service types"
  ON candidate_service_types FOR SELECT USING (TRUE);

-- ========================================
-- 22. CANDIDATE_SUPPLEMENTS (Sprint 4b — wizard étape 5)
-- ========================================
CREATE TABLE candidate_supplements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES candidate_profiles(user_id) ON DELETE CASCADE,
  supplement VARCHAR(100) NOT NULL,
  -- 'first_aid', 'has_vehicle', 'driving_license', 'immediate_availability'
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(candidate_id, supplement)
);

ALTER TABLE candidate_supplements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Candidates can manage their own supplements"
  ON candidate_supplements FOR ALL USING (candidate_id = auth.uid());
CREATE POLICY "Everyone can view candidate supplements"
  ON candidate_supplements FOR SELECT USING (TRUE);

-- ========================================
-- 23. CANDIDATE_SKILLS (Sprint 4b — wizard étape 7)
-- ========================================
CREATE TABLE candidate_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES candidate_profiles(user_id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skill_taxonomy(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(candidate_id, skill_id)
);

ALTER TABLE candidate_skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Candidates can manage their own skills"
  ON candidate_skills FOR ALL USING (candidate_id = auth.uid());
CREATE POLICY "Everyone can view candidate skills"
  ON candidate_skills FOR SELECT USING (TRUE);

-- ========================================
-- 24. PROMO_CODES (Sprint 4d — abonnement Premium)
-- ========================================
CREATE TABLE promo_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(100) UNIQUE NOT NULL,
  discount_type VARCHAR(50) NOT NULL, -- 'percentage', 'fixed_amount'
  discount_value DECIMAL(10, 2) NOT NULL,
  valid_from TIMESTAMP NOT NULL DEFAULT NOW(),
  valid_until TIMESTAMP,
  max_uses INTEGER, -- NULL = illimité
  current_uses INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
-- Pas de policy SELECT publique : les codes promo sont validés côté
-- serveur (Server Action / Edge Function), jamais lus directement par le
-- client. Voir CAHIER_DES_CHARGES.md → Modèle Économique, Sprint 4d.

CREATE INDEX idx_promo_codes_code ON promo_codes(code);

-- ========================================
-- TRIGGERS for updated_at
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER candidate_profiles_updated_at BEFORE UPDATE ON candidate_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER employer_profiles_updated_at BEFORE UPDATE ON employer_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER missions_updated_at BEFORE UPDATE ON missions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER visio_meetings_updated_at BEFORE UPDATE ON visio_meetings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER visio_availability_slots_updated_at BEFORE UPDATE ON visio_availability_slots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER applications_updated_at BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER contracts_updated_at BEFORE UPDATE ON contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER work_sessions_updated_at BEFORE UPDATE ON work_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER notifications_updated_at BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER reports_updated_at BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER promo_codes_updated_at BEFORE UPDATE ON promo_codes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- DONE
-- ========================================
-- Database setup complete!
-- All 25 tables created with RLS, indexes, and triggers
-- (19 tables MVP initial + 6 tables Sprint 4a-4d).
