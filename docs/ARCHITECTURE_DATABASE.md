# 🗄️ ARCHITECTURE DATABASE — OMLIINK

**Schéma PostgreSQL Complet avec RLS Policies**

---

## 📚 Table des Matières

1. [Vue d'Ensemble](#vue-densemble)
2. [Tables Principales](#tables-principales)
3. [Tables de Liaison](#tables-de-liaison)
4. [Migrations SQL](#migrations-sql)
5. [RLS Policies](#rls-policies)
6. [Indexes Performance](#indexes-performance)
7. [Triggers](#triggers)

---

## 👁️ Vue d'Ensemble

**18 tables principales:**

```
Authentification & Profils (3):
  - auth.users (Supabase)
  - profiles
  - candidate_profiles
  - employer_profiles

Missions & Candidatures (4):
  - service_categories
  - missions
  - applications
  - favorite_candidates

Visioconférence (3):
  - visio_meetings
  - visio_feedback

Chat & Notifications (3):
  - conversations
  - messages
  - notifications

Contrats & Paiements (3):
  - contracts
  - work_sessions
  - payments

Avis & Signalements (2):
  - reviews
  - reports

Autres (1):
  - documents
```

---

## 📋 Tables Principales

### 1. `profiles`

**Données utilisateur de base — Employeurs + Candidats**

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  
  -- Adresse
  address_street TEXT,
  address_city TEXT,
  address_postal_code TEXT,
  address_lat DECIMAL(10, 8),
  address_lng DECIMAL(11, 8),
  
  -- Rôle
  role TEXT NOT NULL, -- 'employer', 'candidate', 'both'
  
  -- Vérification
  id_verified BOOLEAN DEFAULT FALSE,
  id_document_url TEXT,
  id_verification_date TIMESTAMP,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_banned BOOLEAN DEFAULT FALSE,
  ban_reason TEXT,
  
  -- Présence
  is_online BOOLEAN DEFAULT FALSE,
  last_seen_at TIMESTAMP,
  
  -- URSSAF
  urssaf_account_linked BOOLEAN DEFAULT FALSE,
  urssaf_employer_id TEXT,
  
  -- Préférences visio
  visio_camera_default_on BOOLEAN DEFAULT TRUE,
  visio_mic_default_on BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_verified ON profiles(id_verified);
```

---

### 2. `candidate_profiles`

**Profil candidat spécifique**

```sql
CREATE TABLE candidate_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Statut
  status TEXT NOT NULL DEFAULT 'student', 
  -- 'student', 'unemployed', 'retired', 'part_time', 'other'
  
  -- Vérification
  criminal_record_status TEXT DEFAULT 'not_submitted',
  -- 'not_submitted', 'pending', 'verified', 'rejected'
  criminal_record_url TEXT,
  criminal_record_date DATE,
  criminal_record_expiry DATE,
  
  honor_certificate_signed BOOLEAN DEFAULT FALSE,
  honor_certificate_date DATE,
  honor_certificate_url TEXT,
  
  -- Disponibilités
  availability JSONB DEFAULT '{}',
  -- { "monday": [{"start": "09:00", "end": "12:00"}], ... }
  
  -- Localisation
  max_travel_distance_km INTEGER DEFAULT 10,
  has_vehicle BOOLEAN DEFAULT FALSE,
  has_driving_license BOOLEAN DEFAULT FALSE,
  
  -- Services
  services JSONB DEFAULT '[]', -- ["menage", "jardinage", ...]
  average_rating DECIMAL(2, 1) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  
  -- Fiabilité
  total_missions_completed INTEGER DEFAULT 0,
  reliability_score DECIMAL(3, 2) DEFAULT 100, -- %
  response_rate DECIMAL(3, 2) DEFAULT 0, -- %
  
  -- Profil
  profile_verified BOOLEAN DEFAULT FALSE,
  verification_level TEXT DEFAULT 'none',
  -- 'none', 'basic', 'verified', 'premium'
  
  -- Visio
  visio_calls_completed INTEGER DEFAULT 0,
  visio_rating DECIMAL(2, 1) DEFAULT 0,
  prefers_visio_before_mission BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_candidate_profiles_user_id ON candidate_profiles(user_id);
CREATE INDEX idx_candidate_profiles_verification_level ON candidate_profiles(verification_level);
```

---

### 3. `employer_profiles`

**Profil employeur spécifique**

```sql
CREATE TABLE employer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Foyer
  household_description TEXT,
  number_of_children INTEGER DEFAULT 0,
  children_ages JSONB DEFAULT '[]',
  has_pets BOOLEAN DEFAULT FALSE,
  pets_description TEXT,
  
  -- Domicile
  home_type TEXT, -- 'apartment', 'house', 'other'
  home_size_m2 INTEGER,
  has_garden BOOLEAN DEFAULT FALSE,
  garden_size_m2 INTEGER,
  
  -- Fiscal
  cesu_registered BOOLEAN DEFAULT FALSE,
  cesu_number TEXT,
  preferred_payment_method TEXT DEFAULT 'direct',
  -- 'cesu', 'cesu_prefinance', 'direct'
  tax_credit_eligible BOOLEAN DEFAULT TRUE,
  
  -- Réputation
  average_rating DECIMAL(2, 1) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_missions_posted INTEGER DEFAULT 0,
  
  -- Préférences
  requires_visio_before_hiring BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_employer_profiles_user_id ON employer_profiles(user_id);
```

---

### 4. `service_categories`

**Catalogue des services**

```sql
CREATE TABLE service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT,
  description TEXT,
  
  -- Tarifs
  min_hourly_rate DECIMAL(6, 2),
  max_hourly_rate DECIMAL(6, 2),
  
  -- Vérification
  requires_criminal_check BOOLEAN DEFAULT FALSE,
  
  -- Visio
  visio_recommended BOOLEAN DEFAULT FALSE,
  visio_recommendation_reason TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 5. `missions`

**Offres de missions**

```sql
CREATE TABLE missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Descriptif
  title TEXT NOT NULL,
  description TEXT,
  category_id UUID NOT NULL REFERENCES service_categories(id),
  subcategories JSONB DEFAULT '[]',
  
  -- Localisation
  address_street TEXT NOT NULL,
  address_city TEXT NOT NULL,
  address_postal_code TEXT NOT NULL,
  address_lat DECIMAL(10, 8),
  address_lng DECIMAL(11, 8),
  
  -- Timing
  mission_type TEXT NOT NULL, -- 'one_time', 'recurring'
  mission_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  estimated_duration_hours DECIMAL(4, 2),
  recurrence_pattern JSONB,
  -- { "days": ["monday", "wednesday"], "frequency": "weekly", "until": "2025-12-31" }
  
  -- Tarification
  hourly_rate DECIMAL(7, 2) NOT NULL,
  estimated_total DECIMAL(10, 2),
  
  -- Exigences
  required_experience TEXT,
  required_vehicle BOOLEAN DEFAULT FALSE,
  required_equipment JSONB DEFAULT '[]',
  employer_provides_equipment BOOLEAN DEFAULT FALSE,
  additional_requirements TEXT,
  
  -- Visio
  visio_required BOOLEAN DEFAULT FALSE,
  visio_preferred BOOLEAN DEFAULT FALSE,
  visio_note TEXT,
  
  -- Urgence
  is_urgent BOOLEAN DEFAULT FALSE,
  urgent_premium_rate DECIMAL(4, 2),
  
  -- Status
  status TEXT DEFAULT 'draft',
  -- 'draft', 'published', 'matching', 'visio_scheduled', 'assigned',
  -- 'in_progress', 'completed', 'cancelled', 'disputed'
  assigned_candidate_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Candidatures
  max_candidates INTEGER DEFAULT 10,
  auto_match BOOLEAN DEFAULT FALSE,
  
  -- URSSAF
  urssaf_declaration_id TEXT,
  urssaf_declared BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE INDEX idx_missions_status ON missions(status);
CREATE INDEX idx_missions_category ON missions(category_id);
CREATE INDEX idx_missions_geo ON missions(address_lat, address_lng);
CREATE INDEX idx_missions_employer ON missions(employer_id);
CREATE INDEX idx_missions_date ON missions(mission_date);
```

---

### 6. `visio_meetings`

**Enregistrements de visioconférences**

```sql
CREATE TABLE visio_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mission_id UUID REFERENCES missions(id) ON DELETE SET NULL,
  application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  
  -- Timing
  scheduled_at TIMESTAMP NOT NULL,
  duration_minutes INTEGER DEFAULT 15,
  timezone TEXT DEFAULT 'Europe/Paris',
  
  -- LiveKit
  room_name TEXT UNIQUE NOT NULL,
  room_sid TEXT,
  livekit_token_employer TEXT,
  livekit_token_candidate TEXT,
  join_url_employer TEXT,
  join_url_candidate TEXT,
  
  -- Status
  status TEXT DEFAULT 'proposed',
  -- 'proposed', 'accepted', 'rescheduled', 'in_progress', 'completed',
  -- 'cancelled', 'no_show_employer', 'no_show_candidate', 'no_show_both'
  
  -- Confirmation
  proposed_by TEXT, -- 'employer', 'candidate'
  employer_confirmed BOOLEAN DEFAULT FALSE,
  employer_confirmed_at TIMESTAMP,
  candidate_confirmed BOOLEAN DEFAULT FALSE,
  candidate_confirmed_at TIMESTAMP,
  
  -- Durée réelle
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  actual_duration_seconds INTEGER,
  
  -- Qualité
  connection_quality TEXT, -- 'excellent', 'good', 'fair', 'poor'
  
  -- Enregistrement
  is_recorded BOOLEAN DEFAULT FALSE,
  recording_consent_employer BOOLEAN DEFAULT FALSE,
  recording_consent_candidate BOOLEAN DEFAULT FALSE,
  recording_url TEXT,
  recording_expires_at TIMESTAMP,
  
  -- Notes
  employer_notes TEXT,
  candidate_notes TEXT,
  
  -- Rappels
  reminder_24h_sent BOOLEAN DEFAULT FALSE,
  reminder_1h_sent BOOLEAN DEFAULT FALSE,
  reminder_15m_sent BOOLEAN DEFAULT FALSE,
  
  -- Annulation/Report
  cancel_reason TEXT,
  cancelled_by TEXT, -- 'employer', 'candidate', 'admin'
  reschedule_count INTEGER DEFAULT 0,
  max_reschedules INTEGER DEFAULT 3,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_visio_meetings_employer ON visio_meetings(employer_id);
CREATE INDEX idx_visio_meetings_candidate ON visio_meetings(candidate_id);
CREATE INDEX idx_visio_meetings_status ON visio_meetings(status);
CREATE INDEX idx_visio_meetings_scheduled ON visio_meetings(scheduled_at);
```

---

### 7. `applications`

**Candidatures aux missions**

```sql
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Candidature
  message TEXT,
  proposed_rate DECIMAL(7, 2),
  
  -- Status
  status TEXT DEFAULT 'pending',
  -- 'pending', 'visio_proposed', 'visio_scheduled', 'visio_completed',
  -- 'accepted', 'rejected', 'withdrawn', 'expired'
  
  -- Matching
  match_score DECIMAL(5, 2),
  match_details JSONB,
  
  -- Visio
  visio_meeting_id UUID REFERENCES visio_meetings(id) ON DELETE SET NULL,
  visio_completed BOOLEAN DEFAULT FALSE,
  visio_employer_impression TEXT,
  visio_candidate_impression TEXT,
  
  -- Timeline
  employer_response_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_applications_mission ON applications(mission_id);
CREATE INDEX idx_applications_candidate ON applications(candidate_id);
CREATE INDEX idx_applications_status ON applications(status);
```

---

### 8. `contracts`

**Contrats de travail**

```sql
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  employer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Accord
  agreed_hourly_rate DECIMAL(7, 2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  
  -- Signatures
  employer_signed BOOLEAN DEFAULT FALSE,
  employer_signed_at TIMESTAMP,
  candidate_signed BOOLEAN DEFAULT FALSE,
  candidate_signed_at TIMESTAMP,
  contract_pdf_url TEXT,
  
  -- Visio
  visio_completed_before_contract BOOLEAN DEFAULT FALSE,
  visio_meeting_id UUID REFERENCES visio_meetings(id) ON DELETE SET NULL,
  
  -- URSSAF
  urssaf_contract_ref TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending_signatures',
  -- 'pending_signatures', 'active', 'completed', 'terminated', 'disputed'
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_contracts_employer ON contracts(employer_id);
CREATE INDEX idx_contracts_candidate ON contracts(candidate_id);
CREATE INDEX idx_contracts_status ON contracts(status);
```

---

### 9. `work_sessions`

**Sessions de travail réelles**

```sql
CREATE TABLE work_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  employer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Timing
  session_date DATE NOT NULL,
  clock_in TIMESTAMP NOT NULL,
  clock_out TIMESTAMP,
  break_duration_minutes INTEGER DEFAULT 0,
  total_hours DECIMAL(5, 2),
  
  -- Confirmation
  candidate_confirmed BOOLEAN DEFAULT FALSE,
  employer_confirmed BOOLEAN DEFAULT FALSE,
  
  -- Géolocalisation
  check_in_lat DECIMAL(10, 8),
  check_in_lng DECIMAL(11, 8),
  check_in_distance_meters INTEGER, -- Distance avec adresse mission
  
  -- URSSAF
  declared_to_urssaf BOOLEAN DEFAULT FALSE,
  urssaf_declaration_ref TEXT,
  
  -- Status
  status TEXT DEFAULT 'scheduled',
  -- 'scheduled', 'clocked_in', 'clocked_out', 'confirmed', 'disputed', 'declared'
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_work_sessions_date ON work_sessions(session_date);
CREATE INDEX idx_work_sessions_candidate ON work_sessions(candidate_id);
CREATE INDEX idx_work_sessions_employer ON work_sessions(employer_id);
```

---

### 10. `payments`

**Historique paiements**

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_session_id UUID REFERENCES work_sessions(id) ON DELETE SET NULL,
  contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
  employer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Montants
  gross_amount DECIMAL(10, 2) NOT NULL,
  employer_charges DECIMAL(10, 2),
  employee_charges DECIMAL(10, 2),
  net_amount DECIMAL(10, 2),
  platform_fee DECIMAL(10, 2),
  total_employer_cost DECIMAL(10, 2),
  tax_credit_amount DECIMAL(10, 2),
  
  -- Méthode
  payment_method TEXT DEFAULT 'card',
  -- 'card', 'sepa', 'cesu_prefinance'
  
  -- Stripe
  stripe_payment_intent_id TEXT,
  stripe_transfer_id TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending',
  -- 'pending', 'processing', 'completed', 'failed', 'refunded'
  
  -- URSSAF
  urssaf_payslip_id TEXT,
  urssaf_payslip_url TEXT,
  
  paid_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_employer ON payments(employer_id);
CREATE INDEX idx_payments_candidate ON payments(candidate_id);
CREATE INDEX idx_payments_date ON payments(paid_at);
```

---

### 11. `reviews`

**Avis après missions**

```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewed_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Rôle
  reviewer_role TEXT NOT NULL, -- 'employer', 'candidate'
  
  -- Notes
  overall_rating INTEGER NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
  punctuality_rating INTEGER CHECK (punctuality_rating BETWEEN 1 AND 5),
  quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5),
  communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
  reliability_rating INTEGER CHECK (reliability_rating BETWEEN 1 AND 5),
  
  -- Visio
  visio_helped BOOLEAN,
  visio_comment TEXT,
  
  -- Contenu
  comment TEXT NOT NULL,
  is_visible BOOLEAN DEFAULT TRUE,
  is_flagged BOOLEAN DEFAULT FALSE,
  flag_reason TEXT,
  moderated_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reviews_reviewed_id ON reviews(reviewed_id);
CREATE INDEX idx_reviews_mission ON reviews(mission_id);
```

---

### 12. `conversations`

**Conversations entre utilisateurs**

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID REFERENCES missions(id) ON DELETE SET NULL,
  employer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Stats
  last_message_at TIMESTAMP,
  last_message_preview TEXT,
  employer_unread_count INTEGER DEFAULT 0,
  candidate_unread_count INTEGER DEFAULT 0,
  
  -- Historique
  last_visio_meeting_id UUID REFERENCES visio_meetings(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_conversations_employer ON conversations(employer_id);
CREATE INDEX idx_conversations_candidate ON conversations(candidate_id);
CREATE INDEX idx_conversations_active ON conversations(is_active);
```

---

### 13. `messages`

**Messages individuels**

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Contenu
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  -- 'text', 'system', 'image', 'document', 'visio_invitation'
  
  -- Attachments
  attachment_url TEXT,
  visio_meeting_id UUID REFERENCES visio_meetings(id) ON DELETE SET NULL,
  
  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX idx_messages_sender ON messages(sender_id);
```

---

### 14. `notifications`

**Notifications utilisateur**

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Contenu
  type TEXT NOT NULL, -- 'visio_invitation', 'mission_accepted', etc.
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  action_url TEXT,
  action_type TEXT,
  
  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  
  -- Canaux
  push_sent BOOLEAN DEFAULT FALSE,
  email_sent BOOLEAN DEFAULT FALSE,
  sms_sent BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);
```

---

### 15. `documents`

**Fichiers utilisateur**

```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Type
  type TEXT NOT NULL,
  -- 'id_card', 'passport', 'criminal_record', 'honor_certificate', etc.
  
  -- Fichier
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  
  -- Vérification
  status TEXT DEFAULT 'uploaded',
  -- 'uploaded', 'pending_review', 'verified', 'rejected', 'expired'
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at TIMESTAMP,
  rejection_reason TEXT,
  
  -- Expiration
  expires_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_documents_user ON documents(user_id);
CREATE INDEX idx_documents_expires ON documents(expires_at);
```

---

### 16. `reports`

**Signalements**

```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reported_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Contexte
  mission_id UUID REFERENCES missions(id) ON DELETE SET NULL,
  visio_meeting_id UUID REFERENCES visio_meetings(id) ON DELETE SET NULL,
  
  -- Contenu
  reason TEXT NOT NULL,
  -- 'inappropriate_behavior', 'no_show', 'fraud', 'harassment', 'quality_issue'
  description TEXT,
  evidence_urls JSONB DEFAULT '[]',
  
  -- Modération
  status TEXT DEFAULT 'open',
  -- 'open', 'under_review', 'resolved', 'dismissed'
  admin_notes TEXT,
  resolved_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reports_reported_id ON reports(reported_id);
CREATE INDEX idx_reports_status ON reports(status);
```

---

### 17. `favorite_candidates`

**Candidats favoris de l'employeur**

```sql
CREATE TABLE favorite_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Notes
  note TEXT,
  met_via_visio BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(employer_id, candidate_id)
);

CREATE INDEX idx_favorite_candidates_employer ON favorite_candidates(employer_id);
```

---

### 18. `visio_feedback`

**Avis structurés après visio**

```sql
CREATE TABLE visio_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES visio_meetings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Rôle
  role TEXT NOT NULL, -- 'employer', 'candidate'
  
  -- Impression
  overall_impression TEXT,
  -- 'very_positive', 'positive', 'neutral', 'negative'
  
  -- Notes
  communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
  presentation_rating INTEGER CHECK (presentation_rating BETWEEN 1 AND 5),
  professionalism_rating INTEGER CHECK (professionalism_rating BETWEEN 1 AND 5),
  
  -- Intention
  would_hire BOOLEAN,
  would_work_for BOOLEAN,
  
  -- Détails
  comment TEXT,
  red_flags JSONB DEFAULT '[]',
  had_technical_issues BOOLEAN DEFAULT FALSE,
  technical_issue_description TEXT,
  
  -- Signalement
  wants_to_report BOOLEAN DEFAULT FALSE,
  report_reason TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_visio_feedback_meeting ON visio_feedback(meeting_id);
```

---

## 🔒 RLS Policies

### Stratégie Générale

```
Chaque utilisateur peut voir:
✅ Son propre profil
✅ Profils autres si publics (is_active + NOT is_banned)
✅ Messages de ses conversations
✅ Ses notifications
✅ Ses missions/applications/contrats
```

### Exemple: Table `profiles`

```sql
-- RLS activé
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Utilisateur voit son profil
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Utilisateur voit profils publics
CREATE POLICY "Users can view public profiles"
ON profiles FOR SELECT
USING (is_active = true AND is_banned = false);

-- Utilisateur edit son profil
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

### Autres Tables

**Appliquer le même pattern à:**
- `candidate_profiles` (candidat voit le sien)
- `employer_profiles` (employeur voit le sien)
- `conversations` (participants seulement)
- `messages` (participants seulement)
- `notifications` (utilisateur seulement)
- `work_sessions` (employeur + candidat)
- etc.

---

## ⚡ Indexes Performance

**Index essentiels:**

```sql
-- Recherche & filtres
CREATE INDEX idx_missions_status ON missions(status);
CREATE INDEX idx_missions_category ON missions(category_id);
CREATE INDEX idx_missions_geo ON missions(address_lat, address_lng);
CREATE INDEX idx_missions_date ON missions(mission_date);

-- Notifications
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);

-- Messages
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);

-- Paiements
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_date ON payments(paid_at);

-- Candidatures
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_mission ON applications(mission_id);

-- Visio
CREATE INDEX idx_visio_meetings_status ON visio_meetings(status);
CREATE INDEX idx_visio_meetings_scheduled ON visio_meetings(scheduled_at);

-- Documents
CREATE INDEX idx_documents_expires ON documents(expires_at);
```

---

## ⏰ Triggers

### `updated_at` Automatique

**Sur TOUTES les tables:**

```sql
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer sur: profiles, candidate_profiles, employer_profiles, missions,
-- applications, contracts, work_sessions, payments, reviews, etc.
CREATE TRIGGER update_profiles_timestamp
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- ... répéter pour autres tables
```

---

## 🚀 Migrations

**Structure `supabase/migrations/`:**

```
001_initial_schema.sql
  └─ Créer toutes les tables + indexes

002_enable_rls.sql
  └─ Activer RLS + appliquer policies

003_seed_service_categories.sql
  └─ Insérer 15 catégories de services

004_create_triggers.sql
  └─ Créer triggers updated_at
```

---

## 📊 Vue d'Ensemble Relationnel

```
auth.users
  └─ profiles (1:1)
      ├─ candidate_profiles (1:1)
      ├─ employer_profiles (1:1)
      ├─ missions (many) -- employer
      ├─ applications (many) -- candidate
      ├─ contracts (many) -- both
      ├─ work_sessions (many) -- both
      ├─ reviews (many) -- reviewer & reviewed
      ├─ conversations (many) -- both
      ├─ messages (many) -- sender
      ├─ notifications (many)
      ├─ documents (many)
      └─ reports (many) -- reporter & reported

missions
  ├─ service_categories (many:1)
  ├─ applications (1:many)
  ├─ contracts (1:many)
  ├─ work_sessions (1:many)
  └─ visio_meetings (1:many)

applications
  ├─ visio_meetings (1:many)
  └─ contracts (1:1)

contracts
  ├─ work_sessions (1:many)
  └─ visio_meetings (0:1)

work_sessions
  └─ payments (0:1)
```

---

**Version:** 1.0  
**Dernière mise à jour:** Août 2026  
**Statut:** Prêt pour migration Supabase
