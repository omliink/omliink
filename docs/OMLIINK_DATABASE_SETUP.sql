-- ========================================
-- OMLIINK DATABASE SETUP
-- 30 Tables + RLS + Indexes + Triggers
-- (19 tables MVP initial (18 "core" + favorite_candidates en bonus) +
--  12 tables livrées post-MVP : 5 Sprint 4b (onboarding candidat), 3
--  Sprint 4c (gestion missions employeur), 1 Sprint 5c (CESU/Pajemploi),
--  2 Sprint 4d (abonnement Premium), 1 Sprint Modération (signalement de
--  missions) — voir ARCHITECTURE_DATABASE.md pour le détail par sprint)
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
  -- Sprint Admin : rôle admin. JAMAIS modifiable par l'application — aucun
  -- formulaire, aucune Server Action n'écrit cette colonne. Seule voie :
  -- SQL manuel en base (Supabase SQL Editor).
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Sprint Admin : fonction SECURITY DEFINER réutilisée par toutes les
-- policies RLS admin du schéma (voir chaque table concernée), plutôt que
-- dupliquée table par table.
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE((SELECT is_admin FROM profiles WHERE id = auth.uid()), FALSE);
$$;

CREATE POLICY "profiles_select_admin"
  ON profiles FOR SELECT USING (is_admin_user());

-- ========================================
-- 2. CANDIDATE_PROFILES
-- ========================================
CREATE TABLE candidate_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  -- bio, years_experience, skills (TEXT[]) removed — pre-Sprint-4b fields,
  -- superseded by bio_title/bio_text, experience_level, and the
  -- candidate_skills table below. Dropped via migration (sprint cleanup).
  languages VARCHAR(100)[],
  hourly_rate DECIMAL(10, 2),
  availability_status VARCHAR(50) DEFAULT 'available', -- 'available', 'busy', 'unavailable'
  rating DECIMAL(3, 2) DEFAULT 0, -- 0-5 stars
  total_missions_completed INTEGER DEFAULT 0,
  response_rate DECIMAL(5, 2) DEFAULT 0,
  no_show_count INTEGER DEFAULT 0,

  -- Onboarding candidat wizard 9 étapes (Sprint 4b)
  gender VARCHAR(20),                       -- étape 1: 'homme', 'femme'
  birth_date DATE,                          -- étape 2
  birth_place VARCHAR(255),                 -- étape 2
  native_language VARCHAR(100),             -- étape 2
  phone_visible BOOLEAN NOT NULL DEFAULT TRUE, -- étape 2
  photo_url TEXT NOT NULL,                  -- étape 3, OBLIGATOIRE (bloquant)
  experience_level VARCHAR(20),             -- étape 6: 'debutant', '1-3ans', '3-5ans', '5ans-plus'
  bio_title VARCHAR(60),                    -- étape 8, 10-60 caractères (validation applicative)
  bio_text TEXT,                            -- étape 8, 30-2000 caractères (validation applicative)
  verification_status VARCHAR(20) NOT NULL DEFAULT 'unverified',
  -- 'unverified', 'pending', 'verified', 'rejected'
  verification_document_url TEXT,           -- chemin dans le bucket privé verification-documents (pas une URL publique)

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
  nationality TEXT,                       -- Sprint 4c, étape "À propos de vous"
  photo_url TEXT,                         -- Sprint 4c, optionnelle (contrairement au candidat)

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
  -- Sprint Modération : indépendant de status ci-dessus, piloté UNIQUEMENT
  -- par l'admin. Une mission n'est visible aux candidats que si
  -- status = 'published' ET moderation_status = 'normal'.
  moderation_status VARCHAR(20) NOT NULL DEFAULT 'normal', -- 'normal', 'suspended', 'removed'
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
-- ⚠️ Historique : les deux policies de ce bloc ont longtemps été
-- "Everyone can view published missions" (SELECT, sans condition sur
-- moderation_status) et "Employers can manage their own missions"
-- (FOR ALL, sans aucune condition). Nommées différemment des policies
-- modernes introduites plus tard par les migrations réelles, elles
-- n'ont jamais été supprimées par un `DROP POLICY IF EXISTS` et
-- neutralisaient silencieusement moderation_status (Postgres additionne
-- les policies permissives par OR) : un employeur pouvait rouvrir sa
-- propre mission suspendue par appel API direct, une mission supprimée
-- restait lisible même sans authentification. Trouvé et corrigé pendant
-- le sprint Modération — remplacé ci-dessous par les policies
-- effectivement live aujourd'hui. Voir ARCHITECTURE_DATABASE.md pour le
-- détail complet de l'incident.
CREATE POLICY "missions_select_own_or_published"
  ON missions FOR SELECT
  USING (auth.uid() = employer_id OR (status = 'published' AND moderation_status = 'normal'));
CREATE POLICY "missions_select_admin"
  ON missions FOR SELECT USING (is_admin_user());
CREATE POLICY "missions_update_own"
  ON missions FOR UPDATE
  USING (auth.uid() = employer_id AND moderation_status = 'normal')
  WITH CHECK (auth.uid() = employer_id AND moderation_status = 'normal');
CREATE POLICY "missions_update_admin"
  ON missions FOR UPDATE USING (is_admin_user()) WITH CHECK (is_admin_user());
CREATE POLICY "missions_insert_own"
  ON missions FOR INSERT WITH CHECK (auth.uid() = employer_id);

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
-- 19. SKILL_TAXONOMY (Sprint 4b — référentiel public, pas de owner candidat)
-- ========================================
CREATE TABLE skill_taxonomy (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE,
  skill_tag VARCHAR(100) NOT NULL,
  label VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(category_id, skill_tag)
);

ALTER TABLE skill_taxonomy ENABLE ROW LEVEL SECURITY;
CREATE POLICY "skill_taxonomy_select_all"
  ON skill_taxonomy FOR SELECT USING (TRUE);

-- ========================================
-- 20. CANDIDATE_LANGUAGES (Sprint 4b — wizard étape 2)
-- ========================================
CREATE TABLE candidate_languages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES candidate_profiles(user_id) ON DELETE CASCADE,
  language VARCHAR(100) NOT NULL,
  is_native BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(candidate_id, language)
);

ALTER TABLE candidate_languages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "candidate_languages_manage_own"
  ON candidate_languages FOR ALL USING (candidate_id = auth.uid()) WITH CHECK (candidate_id = auth.uid());
CREATE POLICY "candidate_languages_select_via_application"
  ON candidate_languages FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM applications JOIN missions ON missions.id = applications.mission_id
      WHERE applications.candidate_id = candidate_languages.candidate_id AND missions.employer_id = auth.uid()
    )
  );

-- ========================================
-- 21. CANDIDATE_SERVICE_TYPES (Sprint 4b — wizard étape 4)
-- ========================================
CREATE TABLE candidate_service_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES candidate_profiles(user_id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(candidate_id, category_id)
);

ALTER TABLE candidate_service_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "candidate_service_types_manage_own"
  ON candidate_service_types FOR ALL USING (candidate_id = auth.uid()) WITH CHECK (candidate_id = auth.uid());
CREATE POLICY "candidate_service_types_select_via_application"
  ON candidate_service_types FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM applications JOIN missions ON missions.id = applications.mission_id
      WHERE applications.candidate_id = candidate_service_types.candidate_id AND missions.employer_id = auth.uid()
    )
  );

-- ========================================
-- 22. CANDIDATE_SUPPLEMENTS (Sprint 4b — wizard étape 5)
-- ========================================
CREATE TABLE candidate_supplements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES candidate_profiles(user_id) ON DELETE CASCADE,
  supplement_code VARCHAR(50) NOT NULL,
  -- 'premiers_secours', 'motorise', 'permis_conduire', 'dispo_immediate'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(candidate_id, supplement_code)
);

ALTER TABLE candidate_supplements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "candidate_supplements_manage_own"
  ON candidate_supplements FOR ALL USING (candidate_id = auth.uid()) WITH CHECK (candidate_id = auth.uid());
CREATE POLICY "candidate_supplements_select_via_application"
  ON candidate_supplements FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM applications JOIN missions ON missions.id = applications.mission_id
      WHERE applications.candidate_id = candidate_supplements.candidate_id AND missions.employer_id = auth.uid()
    )
  );

-- ========================================
-- 23. CANDIDATE_SKILLS (Sprint 4b — wizard étape 7)
-- Dénormalisé (category_id, skill_tag) avec FK composite vers
-- skill_taxonomy(category_id, skill_tag) plutôt qu'un skill_id unique :
-- empêche au niveau base qu'un candidat rattache un tag à la mauvaise
-- catégorie.
-- ========================================
CREATE TABLE candidate_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES candidate_profiles(user_id) ON DELETE CASCADE,
  category_id UUID NOT NULL,
  skill_tag VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(candidate_id, category_id, skill_tag),
  FOREIGN KEY (category_id, skill_tag) REFERENCES skill_taxonomy(category_id, skill_tag) ON DELETE CASCADE
);

ALTER TABLE candidate_skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "candidate_skills_manage_own"
  ON candidate_skills FOR ALL USING (candidate_id = auth.uid()) WITH CHECK (candidate_id = auth.uid());
CREATE POLICY "candidate_skills_select_via_application"
  ON candidate_skills FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM applications JOIN missions ON missions.id = applications.mission_id
      WHERE applications.candidate_id = candidate_skills.candidate_id AND missions.employer_id = auth.uid()
    )
  );

-- ========================================
-- 19b. STORAGE BUCKETS (Sprint 4b)
-- ========================================
-- candidate-photos: public (les employeurs doivent voir la photo), écriture
-- restreinte au dossier {auth.uid()}/… du candidat.
-- verification-documents: privé, même restriction de dossier ; revue
-- manuelle via le rôle service (pas d'interface de revue applicative).
-- Voir la migration 20260829020000_sprint4b_storage_buckets.sql pour le
-- détail des policies storage.objects.
--
-- employer-photos (Sprint 4c, ajouté après coup — analysé dans le scénario
-- Yoopies mais oublié du prompt initial du sprint) : public, même
-- restriction de dossier {auth.uid()}/…, bucket dédié plutôt que partagé
-- avec candidate-photos (employeur/candidat = deux lignes différentes de
-- profiles, mélanger leurs fichiers dans un seul bucket exigerait une RLS
-- par chemin plus confuse que deux buckets propres par rôle). Contrairement
-- au candidat, le champ est nullable et l'upload optionnel (bouton
-- "Ignorer pour l'instant" à l'inscription). Voir migration
-- 20260830020000_sprint4c_employer_photo.sql.
--
-- Lecture du nom/photo employeur par un candidat non-encore-postulant : a
-- nécessité une policy SELECT supplémentaire sur profiles ET
-- employer_profiles (aucune des deux n'était lisible par un candidat avant
-- sa première candidature), via une fonction SECURITY DEFINER partagée
-- employer_has_published_mission(employer_id) — voir migration
-- 20260830030000_sprint4c_employer_public_info.sql.

-- ========================================
-- 23b. MISSION_NEED_TAXONOMY (Sprint 4c — référentiel public)
-- ========================================
-- Séparé de skill_taxonomy (Sprint 4b) plutôt que réutilisé : les tags sont
-- formulés du point de vue du besoin employeur ("Auxiliaire de vie", "Dame
-- de compagnie") et non de la compétence candidat ("Aide à la toilette"),
-- deux vocabulaires distincts même quand la catégorie est la même. 52 tags
-- au total (3-4 par catégorie), validés en revue avant seed — voir
-- migration 20260830010000_sprint4c_mission_need_taxonomy_seed.sql.
CREATE TABLE mission_need_taxonomy (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE,
  need_tag VARCHAR(100) NOT NULL,
  label VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(category_id, need_tag)
);

ALTER TABLE mission_need_taxonomy ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mission_need_taxonomy_select_all"
  ON mission_need_taxonomy FOR SELECT USING (TRUE);

-- ========================================
-- 23c. MISSION_NEEDS (Sprint 4c — sous-typage du besoin, étape "Mes besoins")
-- ========================================
-- Composite FK vers mission_need_taxonomy(category_id, need_tag) — même
-- garde-fou que candidate_skills en Sprint 4b (empêche d'associer un tag à
-- la mauvaise catégorie).
CREATE TABLE mission_needs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  category_id UUID NOT NULL,
  need_tag VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(mission_id, need_tag),
  FOREIGN KEY (category_id, need_tag) REFERENCES mission_need_taxonomy(category_id, need_tag) ON DELETE CASCADE
);

ALTER TABLE mission_needs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mission_needs_select_all"
  ON mission_needs FOR SELECT USING (TRUE);
CREATE POLICY "mission_needs_manage_owner"
  ON mission_needs FOR ALL USING (
    EXISTS (SELECT 1 FROM missions WHERE missions.id = mission_needs.mission_id AND missions.employer_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM missions WHERE missions.id = mission_needs.mission_id AND missions.employer_id = auth.uid())
  );

-- ========================================
-- 23d. MISSION_INVITATIONS (Sprint 4c — suggestions de candidats + invitation)
-- ========================================
CREATE TABLE mission_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  -- 'pending', 'viewed', 'applied', 'declined'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(mission_id, candidate_id)
);

ALTER TABLE mission_invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mission_invitations_manage_employer"
  ON mission_invitations FOR ALL USING (
    EXISTS (SELECT 1 FROM missions WHERE missions.id = mission_invitations.mission_id AND missions.employer_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM missions WHERE missions.id = mission_invitations.mission_id AND missions.employer_id = auth.uid())
  );
CREATE POLICY "mission_invitations_select_candidate"
  ON mission_invitations FOR SELECT USING (candidate_id = auth.uid());
CREATE POLICY "mission_invitations_update_candidate"
  ON mission_invitations FOR UPDATE USING (candidate_id = auth.uid()) WITH CHECK (candidate_id = auth.uid());

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
-- 25. PROMO_CODE_REDEMPTIONS (Sprint 4d — abonnement Premium)
-- ========================================
-- Journal d'utilisation, un enregistrement par (employeur, code) — la
-- contrainte unique rend le webhook Stripe idempotent en cas de
-- re-livraison (l'incrément de promo_codes.current_uses n'a lieu que si
-- l'INSERT réussit réellement). Écrit uniquement par le webhook
-- (service_role, contourne RLS) ; la policy propriétaire existe par
-- symétrie avec le reste du schéma, pas parce que le client écrit ici.
CREATE TABLE promo_code_redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  promo_code_id UUID NOT NULL REFERENCES promo_codes(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(employer_id, promo_code_id)
);

ALTER TABLE promo_code_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "promo_code_redemptions_manage_own"
  ON promo_code_redemptions FOR ALL
  USING (employer_id = auth.uid()) WITH CHECK (employer_id = auth.uid());

-- ========================================
-- 26. EMPLOYER_SOCIAL_CONNECTIONS (Sprint 5c — coquille CESU/Pajemploi)
-- ========================================
-- Collecte de formulaire + traitement manuel par l'équipe uniquement.
-- AUCUNE intégration API réelle URSSAF/CESU/Pajemploi, aucun prélèvement
-- SEPA (phase 2, hors périmètre actuel — voir CAHIER_DES_CHARGES.md,
-- section Statut Candidat & Paiement). Volontairement aucun IBAN/BIC
-- collecté ce sprint (minimisation des données tant qu'aucun traitement
-- réel n'existe).
CREATE TABLE employer_social_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider VARCHAR(20) NOT NULL, -- 'pajemploi', 'cesu'
  connection_status VARCHAR(30) DEFAULT 'not_connected', -- 'not_connected', 'pending_verification', 'connected'
  cesu_path VARCHAR(20), -- 'existing', 'new' — uniquement si provider = 'cesu'
  provider_account_number VARCHAR(50), -- identifiant, pas un secret
  date_of_birth DATE,
  civility VARCHAR(10), -- 'M', 'Mme'
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  phone VARCHAR(30),
  address TEXT,
  mandate_accepted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(employer_id, provider)
);

ALTER TABLE employer_social_connections ENABLE ROW LEVEL SECURITY;
-- Propriétaire uniquement — aucun accès candidat, contrairement aux
-- tables satellites candidat du Sprint 4b (rien ici n'est du contenu
-- marketplace visible côté candidat).
CREATE POLICY "employer_social_connections_manage_own"
  ON employer_social_connections FOR ALL
  USING (employer_id = auth.uid()) WITH CHECK (employer_id = auth.uid());
CREATE POLICY "employer_social_connections_select_admin"
  ON employer_social_connections FOR SELECT USING (is_admin_user());
CREATE POLICY "employer_social_connections_update_admin"
  ON employer_social_connections FOR UPDATE USING (is_admin_user()) WITH CHECK (is_admin_user());

-- ========================================
-- 27. MISSION_REPORTS (Sprint Modération — signalement de mission)
-- ========================================
-- Distincte de la table 16. REPORTS ci-dessus, héritée du script de setup
-- initial, jamais câblée à aucune interface, restée inutilisée.
CREATE TABLE mission_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason VARCHAR(30) NOT NULL, -- 'contenu_inapproprie', 'arnaque_suspectee', 'informations_trompeuses', 'autre'
  details TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'reviewed', 'dismissed'
  created_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  UNIQUE(mission_id, reporter_id)
);

ALTER TABLE mission_reports ENABLE ROW LEVEL SECURITY;
-- Tout utilisateur authentifié peut signaler une mission (une fois) et
-- lire ses propres signalements ; lecture/écriture complètes réservées à
-- l'admin.
CREATE POLICY "mission_reports_insert_own"
  ON mission_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "mission_reports_select_own"
  ON mission_reports FOR SELECT USING (auth.uid() = reporter_id);
CREATE POLICY "mission_reports_select_admin"
  ON mission_reports FOR SELECT USING (is_admin_user());
CREATE POLICY "mission_reports_update_admin"
  ON mission_reports FOR UPDATE USING (is_admin_user()) WITH CHECK (is_admin_user());

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

CREATE TRIGGER employer_social_connections_updated_at BEFORE UPDATE ON employer_social_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- DONE
-- ========================================
-- Database setup complete!
-- All 30 tables created with RLS, indexes, and triggers
-- (19 tables MVP initial + 6 tables Sprint 4a-4d).
