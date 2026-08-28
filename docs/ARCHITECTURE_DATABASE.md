# 🗄️ ARCHITECTURE DATABASE — OMLIINK

**Schéma PostgreSQL Complet avec RLS Policies**

---

## 📚 Table des Matières

1. [Vue d'Ensemble](#vue-densemble)
2. [Tables Principales](#tables-principales)
3. [Tables de Liaison](#tables-de-liaison)
4. [Migrations SQL](#migrations)
5. [RLS Policies](#rls-policies)
6. [Indexes Performance](#indexes-performance)
7. [Triggers](#triggers)

---

## 👁️ Vue d'Ensemble

**18 tables MVP initial + 12 tables livrées en post-MVP = 30 tables au total :**

```
MVP initial (18) :

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

> ✅ **Livré post-MVP** (+12 tables, voir détail dans chaque section
> concernée ainsi que dans [Migrations](#migrations)) :
> `candidate_languages`, `candidate_service_types`, `candidate_supplements`,
> `skill_taxonomy`, `candidate_skills` (Sprint 4b — onboarding candidat) ·
> `mission_need_taxonomy`, `mission_needs`, `mission_invitations`
> (Sprint 4c — gestion missions employeur) ·
> `employer_social_connections` (Sprint 5c — coquille CESU/Pajemploi) ·
> `promo_codes`, `promo_code_redemptions` (Sprint 4d — abonnement Premium) ·
> `mission_reports` (Sprint Modération — signalement de missions, distinct
> de la table `reports` du MVP initial, restée inutilisée).

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
  
  -- URSSAF (réservé — pilote plateforme volontaire depuis avril 2026,
  -- généralisation 2027 ; hors périmètre actuel, voir CAHIER_DES_CHARGES.md)
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

#### Champ ajouté — `is_admin` (Sprint Admin, livré)

```sql
alter table public.profiles
  add column if not exists is_admin boolean not null default false;
```

Rôle admin — voir [CAHIER_DES_CHARGES.md](./CAHIER_DES_CHARGES.md#modération--interface-admin)
pour le détail fonctionnel. Points clés côté schéma :
- **Jamais modifiable par l'application** : aucune Server Action, aucun
  formulaire n'écrit cette colonne — uniquement en SQL manuel (Supabase SQL
  Editor).
- Vérifié via `is_admin_user()`, fonction `SECURITY DEFINER` :
  ```sql
  create or replace function public.is_admin_user()
  returns boolean
  language sql
  security definer
  set search_path = public
  stable
  as $$
    select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
  $$;
  ```
- Réutilisée par toutes les policies RLS admin (`profiles_select_admin`,
  `candidate_profiles_select/update_admin`,
  `employer_social_connections_select/update_admin`,
  `promo_codes_insert/update_admin`, `missions_select/update_admin`,
  `applications_select/update_admin`, `mission_reports_select/update_admin`,
  la policy de lecture admin sur `storage.objects` pour le bucket privé
  `verification-documents`) plutôt que dupliquée table par table.

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

> ⚠️ Le schéma réellement déployé (`src/types/database.types.ts`) est plus
> simple que ce plan d'origine — voir ci-dessous les deux évolutions décidées
> après recherche du cadre légal français et comparaison avec Yoopies. Le SQL
> de migration correspondant (à exécuter tel quel dans Supabase) est donné
> plus bas dans [Migrations](#migrations).

#### Champ ajouté — `employment_status` (Sprint 12, livré)

Un candidat porte un statut légal/fiscal, **sur la table `candidate_profiles`
existante** (pas de table séparée : les deux statuts partagent la même
mécanique de candidature/visio/contrat, seul le mode de paiement final
diffère) :

```sql
employment_status TEXT NOT NULL DEFAULT 'particulier_employeur'
-- 'particulier_employeur' : emploi déclaré classique. L'employeur (la
--   famille) reste l'employeur légal. OMLIINK NE devient PAS l'employeur,
--   ne gère PAS la déclaration URSSAF à sa place. OMLIINK fournit un
--   générateur de contrat de travail (déjà implémenté via `contracts`).
--   Salaire et cotisations restent gérés par l'employeur via le CESU
--   officiel, en dehors d'OMLIINK — OMLIINK ne touche pas cet argent.
-- 'auto_entrepreneur' : le candidat facture ses prestations comme
--   travailleur indépendant, l'employeur devient son client. Paiement via
--   Stripe Connect (marketplace standard) : OMLIINK encaisse, prend sa
--   commission (10%), reverse le solde. SEUL cas où OMLIINK gère un flux
--   de paiement réel.
```

> ⚠️ Ne pas confondre avec le champ `status` déjà documenté ci-dessus
> (`'student'`, `'unemployed'`, `'retired'`, …) : celui-ci décrit la
> situation personnelle du candidat, `employment_status` décrit son statut
> légal de facturation/paiement. Les deux statuts se recherchent et se
> candidatent mutuellement de la même façon (un employeur voit tous les
> candidats des deux statuts, un candidat de n'importe quel statut voit
> toutes les missions publiées) — `employment_status` n'est affiché que
> comme information sur le profil et ne détermine que le mode de paiement en
> fin de cycle (Stripe Connect, livré — voir Statut Candidat & Paiement dans
> CAHIER_DES_CHARGES.md).

#### Champs livrés — matching géographique (Sprint 7)

Tri/filtre par distance (formule haversine — voir
[CAHIER_DES_CHARGES.md](./CAHIER_DES_CHARGES.md#matching-algorithm)) :

```sql
location_lat  DOUBLE PRECISION  -- adresse de référence du candidat,
location_lng  DOUBLE PRECISION  --   via le même autocomplete BAN que missions
radius_km     INTEGER DEFAULT 20 -- rayon de déplacement accepté (ex: 10/20/30 km)
```

`missions` a déjà `location_lat`/`location_lng` (Sprint 2). Le calcul de
distance se fait par **formule haversine** (SQL ou applicatif) — pas besoin
d'extension PostGIS à ce volume pour le MVP. Deux usages prévus : (1) le
candidat voit les missions triées/filtrées par distance à sa position, dans
son rayon d'action ; (2) l'employeur voit, sur chaque candidature reçue, la
distance entre le candidat et le lieu de la mission.

#### Champs — Sprint 4b (onboarding candidat, wizard 9 étapes)

Schéma tel qu'appliqué (migration
`20260829000000_sprint4b_candidate_wizard_schema.sql`). Diverge sur
plusieurs points de la première passe documentaire ci-dessus — écarts
délibérés confirmés au moment du sprint, détaillés en commentaire dans la
migration elle-même :

```sql
gender                     VARCHAR(20)      -- étape 1 : 'homme', 'femme'
birth_date                 DATE             -- étape 2
birth_place                VARCHAR(255)     -- étape 2
native_language             VARCHAR(100)     -- étape 2 (langue natale ;
                                             --   langues additionnelles
                                             --   via candidate_languages)
phone_visible               BOOLEAN NOT NULL DEFAULT TRUE -- étape 2
photo_url                   TEXT NOT NULL    -- étape 3, OBLIGATOIRE (bloquant)
experience_level             VARCHAR(20)      -- étape 6 : 'debutant',
                                             --   '1-3ans', '3-5ans',
                                             --   '5ans-plus'
bio_title                   VARCHAR(60)      -- étape 8, 10-60 caractères (appli)
bio_text                   TEXT             -- étape 8, 30-2000 caractères (appli)
verification_status         VARCHAR(20) NOT NULL DEFAULT 'unverified'
                                             -- 'unverified', 'pending',
                                             --   'verified', 'rejected'
verification_document_url    TEXT             -- chemin du fichier dans le
                                             --   bucket privé
                                             --   verification-documents
                                             --   (pas une URL publique)
```

> ⚠️ `photo_url` est `NOT NULL`. Les lignes `candidate_profiles`
> pré-existant à ce sprint (comptes de test) ont été backfillées avec une
> chaîne vide avant l'ajout de la contrainte — voir la migration.

#### Nouvelles tables associées — Sprint 4b

```sql
-- Langues supplémentaires parlées (au-delà de native_language)
CREATE TABLE candidate_languages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES candidate_profiles(user_id) ON DELETE CASCADE,
  language VARCHAR(100) NOT NULL,
  is_native BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(candidate_id, language)
);

-- Types de services sélectionnés à l'étape 4 (multi-select 15 catégories)
CREATE TABLE candidate_service_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES candidate_profiles(user_id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(candidate_id, category_id)
);

-- Suppléments étape 5
CREATE TABLE candidate_supplements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES candidate_profiles(user_id) ON DELETE CASCADE,
  supplement_code VARCHAR(50) NOT NULL,
  -- 'premiers_secours', 'motorise', 'permis_conduire', 'dispo_immediate'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(candidate_id, supplement_code)
);

-- Référentiel des tags de compétences par catégorie (voir annexe
-- CAHIER_DES_CHARGES.md → Onboarding Candidat) — table de référence
-- publique, pas de owner candidat.
CREATE TABLE skill_taxonomy (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE,
  skill_tag VARCHAR(100) NOT NULL,
  label VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(category_id, skill_tag)
);

-- Compétences choisies par le candidat à l'étape 7. Dénormalisé
-- (category_id, skill_tag) directement plutôt qu'un skill_id unique, avec
-- une FK composite vers skill_taxonomy(category_id, skill_tag) : empêche
-- au niveau base qu'un candidat rattache un skill_tag à la mauvaise
-- catégorie.
CREATE TABLE candidate_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES candidate_profiles(user_id) ON DELETE CASCADE,
  category_id UUID NOT NULL,
  skill_tag VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(candidate_id, category_id, skill_tag),
  FOREIGN KEY (category_id, skill_tag) REFERENCES skill_taxonomy(category_id, skill_tag) ON DELETE CASCADE
);
```

RLS sur les 4 tables candidat-owned (`candidate_languages`,
`candidate_service_types`, `candidate_supplements`, `candidate_skills`) :
gestion complète par le candidat (`candidate_id = auth.uid()`) + lecture
employeur via candidature existante, exact copié-collé du pattern
`candidate_profiles_select_via_application` (Sprint 2) — un `EXISTS`
à sens unique vers `applications`/`missions`, jamais l'inverse, donc aucun
risque de la récursion RLS rencontrée au Sprint 3. `skill_taxonomy` est en
lecture publique (`SELECT true`), sans policy d'écriture (peuplée par
migration de seed uniquement).

Deux buckets Storage (migration `20260829020000_sprint4b_storage_buckets.sql`) :
`candidate-photos` (public, upload restreint au dossier `{auth.uid()}/…` du
candidat) et `verification-documents` (privé, même restriction de dossier ;
revue manuelle par l'équipe via le rôle service, pas d'interface de revue
applicative à ce stade).

#### Champs retirés — nettoyage legacy (2026-09-02)

`bio`, `skills` (TEXT[]) et `years_experience` — champs du tout premier
formulaire candidat, jamais retirés quand le Sprint 4b a introduit
`bio_title`/`bio_text`, la table `candidate_skills`, et `experience_level`.
Vérification exhaustive du codebase avant suppression (migrations
`20260902000000_candidate_profiles_bio_backfill.sql` puis
`20260902000001_candidate_profiles_drop_legacy_fields.sql`) : un seul
usage réel restait,
`CandidateProfileReveal.tsx` (panneau employeur "Voir le profil" sur les
candidatures/entretiens), corrigé dans le même sprint pour lire
`bio_text`, `candidate_skills` + `skill_taxonomy`, et `experience_level` au
lieu des champs legacy — ce qui a aussi révélé que ce composant n'avait
jamais été mis à jour pour le wizard 4b (compétences/expérience ne
s'affichaient déjà plus pour aucun candidat post-4b, bug préexistant
corrigé au passage). Les 3 lignes `candidate_profiles` qui portaient
encore des données legacy (comptes de test confirmés) ont eu leur `bio`
recopié vers `bio_text` avant le drop ; `skills`/`years_experience` non
migrés (formats différents de leurs équivalents modernes, pas de mapping
1:1 pertinent pour 3 lignes de test).

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
  
  -- Abonnement Premium (Sprint 4d — voir CAHIER_DES_CHARGES.md → Modèle
  -- Économique). Distinct du flux Stripe Checkout des paiements de
  -- mission : géré via Stripe Subscriptions (Billing).
  subscription_tier TEXT DEFAULT 'free', -- 'free', 'premium'
  subscription_status TEXT DEFAULT 'inactive',
  -- 'inactive', 'active', 'past_due', 'canceled'
  -- (reflète les événements webhook customer.subscription.updated/deleted)
  stripe_subscription_id TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_employer_profiles_user_id ON employer_profiles(user_id);
```

#### Nouvelle table associée — Sprint 4d

```sql
-- Codes promo réutilisables pour campagnes marketing (abonnement Premium)
CREATE TABLE promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL, -- 'percentage', 'fixed_amount'
  discount_value DECIMAL(10, 2) NOT NULL,
  valid_from TIMESTAMP NOT NULL DEFAULT NOW(),
  valid_until TIMESTAMP,
  max_uses INTEGER, -- NULL = illimité
  current_uses INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_promo_codes_code ON promo_codes(code);
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
  -- 'draft', 'published', 'paused', 'matching', 'visio_scheduled',
  -- 'assigned', 'in_progress', 'completed', 'cancelled', 'disputed'
  -- 'paused' ajouté Sprint 4c : mise en pause manuelle par l'employeur
  -- (Voir Onboarding Employeur & Gestion des Missions, CAHIER_DES_CHARGES.md)
  assigned_candidate_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Candidatures
  max_candidates INTEGER DEFAULT 10,
  auto_match BOOLEAN DEFAULT FALSE,
  
  -- URSSAF (champ existant dans le schéma déployé mais non utilisé — hors
  -- périmètre actuel, voir Statut Candidat & Paiement dans CAHIER_DES_CHARGES.md)
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

#### Champ ajouté — `moderation_status` (Sprint Modération, livré)

```sql
alter table public.missions
  add column if not exists moderation_status varchar(20) not null default 'normal';
  -- 'normal' | 'suspended' | 'removed'
```

**Indépendant** de `missions.status` ci-dessus (piloté par l'employeur) —
piloté uniquement par l'admin. Voir
[CAHIER_DES_CHARGES.md](./CAHIER_DES_CHARGES.md#modération--interface-admin)
pour le détail fonctionnel (visibilité candidat, blocage des actions
employeur, suppression bloquée si `hired`, etc.).

> ⚠️ **Incident RLS trouvé et corrigé pendant ce sprint** : deux policies
> héritées d'`OMLIINK_DATABASE_SETUP.sql` — `"Everyone can view published
> missions"` (SELECT, sans condition sur `moderation_status`) et
> `"Employers can manage their own missions"` (`FOR ALL`, sans aucune
> condition) — portaient un nom différent des policies modernes
> (`missions_select_own_or_published`, `missions_update_own`), donc aucun
> `drop policy if exists` des migrations suivantes ne les a jamais
> supprimées. Elles sont restées actives en parallèle et, Postgres
> additionnant les policies permissives par OR, neutralisaient
> silencieusement `moderation_status` : un employeur pouvait rouvrir sa
> propre mission suspendue par un appel API direct, et une mission
> supprimée restait lisible même sans authentification. Confirmé
> exploitable par test direct (PATCH/GET bruts contre PostgREST, hors
> application), puis les deux anciennes policies ont été supprimées :
> ```sql
> drop policy if exists "Employers can manage their own missions" on public.missions;
> drop policy if exists "Everyone can view published missions" on public.missions;
> ```
> Un audit complet de `pg_policies` sur tout le schéma a suivi pour
> vérifier qu'aucune autre table n'avait un problème équivalent — aucune
> autre policy héritée du script de setup initial ne s'est avérée plus
> permissive que son remplacement moderne.

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
  
  -- Status (Sprint 4a : refonte du workflow candidature/entretien)
  status TEXT DEFAULT 'pending',
  -- 'pending'      : candidature envoyée, pas encore d'entretien
  -- 'interviewing' : au moins une visio programmée/réalisée — PLUSIEURS
  --                  candidatures peuvent être 'interviewing' EN MÊME
  --                  TEMPS sur une même mission (entretiens en parallèle)
  -- 'hired'        : candidat retenu pour la mission (un seul par mission)
  -- 'rejected'     : non retenu (manuel, ou auto dès qu'un autre candidat
  --                  passe à 'hired')
  -- Remplace l'ancien enum 'accepted'/'withdrawn'/'expired' — voir
  -- CAHIER_DES_CHARGES.md → Workflow Candidature & Visio
  
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

### 19. `mission_need_taxonomy` (Sprint 4c, livré)

**Référentiel public des sous-types de besoin, par catégorie de service**
— même rôle que `skill_taxonomy` (Sprint 4b) côté candidat, mais
vocabulaire séparé (besoin employeur, ex. "Auxiliaire de vie", vs
compétence candidat, ex. "Aide à la toilette"). Lecture publique, seedé
uniquement par migration.

```sql
CREATE TABLE mission_need_taxonomy (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE,
  need_tag VARCHAR(100) NOT NULL,
  label VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(category_id, need_tag)
);
```

52 tags seedés (migration `20260830010000_sprint4c_mission_need_taxonomy_seed.sql`).

---

### 20. `mission_needs` (Sprint 4c, livré)

**Sous-typage du besoin choisi par l'employeur pour une mission donnée** —
FK composite vers `mission_need_taxonomy(category_id, need_tag)` (même
garde-fou d'intégrité que `candidate_skills` en Sprint 4b : empêche
d'associer un tag à la mauvaise catégorie). Géré par l'employeur
propriétaire de la mission uniquement.

```sql
CREATE TABLE mission_needs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  category_id UUID NOT NULL,
  need_tag VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(mission_id, need_tag),
  FOREIGN KEY (category_id, need_tag) REFERENCES mission_need_taxonomy(category_id, need_tag) ON DELETE CASCADE
);
```

---

### 21. `mission_invitations` (Sprint 4c, livré)

**Invitation à candidater**, envoyée par l'employeur à un candidat
compatible suggéré après publication d'une mission — jamais un contact
direct libre (voir
[Ce Qui Est Explicitement Écarté](./CAHIER_DES_CHARGES.md#ce-qui-est-explicitement-écarté)
dans CAHIER_DES_CHARGES.md).

```sql
CREATE TABLE mission_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  -- 'pending', 'viewed', 'applied', 'declined'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(mission_id, candidate_id)
);
```

---

### 22. `employer_social_connections` (Sprint 5c, livré)

**Coquille CESU/Pajemploi** — collecte de formulaire + traitement manuel
par l'équipe uniquement. **Aucune intégration API réelle URSSAF/CESU/
Pajemploi, aucun prélèvement SEPA** (voir
[Statut Candidat & Paiement](./CAHIER_DES_CHARGES.md#statut-candidat--paiement)
dans CAHIER_DES_CHARGES.md — phase 2, hors périmètre actuel).
Volontairement **aucun IBAN/BIC collecté** ce sprint (décision validée
avant migration — minimisation des données tant qu'aucun traitement réel
n'existe).

```sql
CREATE TABLE employer_social_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider VARCHAR(20) NOT NULL, -- 'pajemploi' | 'cesu'
  connection_status VARCHAR(30) NOT NULL DEFAULT 'not_connected',
  -- 'not_connected' | 'pending_verification' | 'connected'
  cesu_path VARCHAR(20), -- 'existing' | 'new' — uniquement si provider = 'cesu'
  provider_account_number VARCHAR(50), -- identifiant, pas un secret
  date_of_birth DATE,
  civility VARCHAR(10), -- 'M' | 'Mme'
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  phone VARCHAR(30),
  address TEXT,
  mandate_accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(employer_id, provider)
);
```

RLS : propriétaire uniquement (`employer_id = auth.uid()`, `FOR ALL`) —
aucun accès candidat, contrairement aux tables satellites candidat du
Sprint 4b (rien ici n'est du contenu marketplace visible côté candidat).
Traitement manuel : l'équipe revoit directement en base les lignes
`connection_status = 'pending_verification'`, puis les marque `connected`
depuis la page admin CESU/Pajemploi.

---

### 23. `mission_reports` (Sprint Modération, livré)

**Signalement de mission par un utilisateur** — distinct de la table `16.
reports` ci-dessus, qui date du script de setup initial, n'a jamais été
câblée à aucune interface, et reste inutilisée.

```sql
CREATE TABLE mission_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason VARCHAR(30) NOT NULL,
  -- 'contenu_inapproprie' | 'arnaque_suspectee' | 'informations_trompeuses' | 'autre'
  details TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending' | 'reviewed' | 'dismissed'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  UNIQUE(mission_id, reporter_id)
);
```

RLS : tout utilisateur authentifié peut signaler une mission (une fois,
contrainte unique `mission_id`+`reporter_id`) et lire ses propres
signalements ; lecture/écriture complètes réservées à l'admin
(`is_admin_user()`). Voir
[CAHIER_DES_CHARGES.md](./CAHIER_DES_CHARGES.md#modération--interface-admin)
pour le workflow complet (suspension, suppression, dismissal).

---

### 24. `promo_code_redemptions` (Sprint 4d, livré)

**Journal d'utilisation des codes promo**, un enregistrement par
(employeur, code) — la contrainte unique rend le webhook Stripe idempotent
en cas de re-livraison (l'incrément de `promo_codes.current_uses` n'a
lieu que si l'INSERT réussit réellement). Écrit uniquement par le webhook
(`service_role`, contourne RLS) ; la policy propriétaire existe par
symétrie avec le reste du schéma, pas parce que le client écrit ici
directement.

```sql
CREATE TABLE promo_code_redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  promo_code_id UUID NOT NULL REFERENCES promo_codes(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(employer_id, promo_code_id)
);
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

### Migration — `employment_status` (Sprint 12, livré)

Basée sur le schéma réellement déployé (`candidate_profiles` existe déjà
avec `id`, `user_id`, `bio`, `years_experience`, `skills`, `languages`,
`hourly_rate`, `availability_status`, `rating`, `total_missions_completed`,
`response_rate`, `no_show_count`).

```sql
-- supabase/migrations/<timestamp>_candidate_employment_status.sql

alter table public.candidate_profiles
  add column if not exists employment_status text not null default 'particulier_employeur';

alter table public.candidate_profiles
  add constraint candidate_profiles_employment_status_check
  check (employment_status in ('particulier_employeur', 'auto_entrepreneur'));
```

### Migration — champs de localisation candidat (Sprint 7, livré)

```sql
-- supabase/migrations/20260826000000_candidate_location_matching.sql

alter table public.candidate_profiles
  add column if not exists location_lat double precision,
  add column if not exists location_lng double precision,
  add column if not exists radius_km integer not null default 20;
```

### Migrations — Sprints 4a-4d, 4-TER (livrées)

Toutes les migrations listées ci-dessous ont été rédigées et appliquées
manuellement au moment de chaque sprint (voir
[FEUILLE_DE_ROUTE.md](./FEUILLE_DE_ROUTE.md) et
[SPRINTS.md](./SPRINTS.md) pour le détail fonctionnel) :

```
Sprint 4a  → réécriture des valeurs applications.status
             (pending/interviewing/hired/rejected)
             20260828120000_sprint4a_parallel_interviews.sql

Sprint 4b  → colonnes candidate_profiles (gender, birth_date, birth_place,
             native_language, phone_visible, photo_url, experience_level,
             bio_title, bio_text, verification_status,
             verification_document_url) + tables candidate_languages,
             candidate_service_types, candidate_supplements,
             skill_taxonomy, candidate_skills
             20260829000000_sprint4b_candidate_wizard_schema.sql
             20260829010000_sprint4b_skill_taxonomy_seed.sql
             20260829020000_sprint4b_storage_buckets.sql

Sprint 4c  → ajout du statut 'paused' sur missions (pas de migration —
             VARCHAR sans CHECK, valeur applicative uniquement) + tables
             mission_need_taxonomy, mission_needs, mission_invitations +
             employer_profiles.nationality
             20260830000000_sprint4c_mission_management_schema.sql
             20260830010000_sprint4c_mission_need_taxonomy_seed.sql
             20260830020000_sprint4c_employer_photo.sql
             20260830030000_sprint4c_employer_public_info.sql

Sprint 5c  → table employer_social_connections (coquille CESU/Pajemploi)
             20260831000000_sprint5c_employer_social_connections.sql

Sprint 4d  → colonnes employer_profiles (subscription_tier,
             subscription_status, stripe_subscription_id,
             subscription_current_period_end) + tables promo_codes,
             promo_code_redemptions
             20260901000000_sprint4d_premium_subscription.sql

Sprint Admin     → profiles.is_admin + is_admin_user() + policies RLS
                   admin sur profiles/candidate_profiles/
                   employer_social_connections/promo_codes/
                   storage.objects (verification-documents)
                   20260903000000_admin_role_and_permissions.sql

Sprint Modération → missions.moderation_status + table mission_reports +
                    policies RLS admin sur missions/applications +
                    correctif RLS (suppression des deux policies legacy
                    neutralisant moderation_status, voir la note dans la
                    section `missions` ci-dessus)
                    20260904000000_mission_moderation.sql
```

Le renommage du chemin admin (défense en profondeur) et le correctif de
la liste admin des missions (afficher tous les statuts, pas seulement
`published`) sont des changements applicatifs sans migration associée.

`OMLIINK_DATABASE_SETUP.sql` (racine `docs/`) a été mis à jour en
parallèle pour refléter ce schéma cible dans son ensemble — c'est un
fichier de référence, pas une migration à exécuter.

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
