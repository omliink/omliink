# ⚡ SPRINTS DÉTAILLÉS — OMLIINK

**Format Sprint:** 2 semaines (10 jours de travail)  
**Heures/jour:** 8-10h selon phase  
**Cadence:** Lundi-Vendredi (pause weekend)

---

## 📋 Vue d'Ensemble Sprints

> ⚠️ **Routes** : les chemins mentionnés dans les tâches/deliverables de ce
> fichier (`/employer/missions`, `/candidate/missions`, `/profile/
> verification`, `/register/employer`, etc.) décrivent le plan initial,
> jamais suivi tel quel — voir
> [ARCHITECTURE_ROUTES.md](./ARCHITECTURE_ROUTES.md) pour la structure de
> routes réellement livrée (`/dashboard/*`, rendu conditionnel par rôle).

```
SPRINT  0 │ Setup (Semaine 1)
SPRINT  1 │ Database & Auth (Semaine 2)
SPRINT  2 │ Layout & Landing (Semaine 2-3)
SPRINT  3 │ Auth Pages (Semaine 3)
SPRINT  4 │ Verification (Semaine 4)
SPRINT  5 │ Missions (Semaine 4-5)
SPRINT  6 │ Mission Listings (Semaine 5-6)
SPRINT  7 │ Matching Géographique — distance (Semaine 6)
SPRINT  8 │ Chat (Semaine 6)
SPRINT  9 │ Visio Scheduler (Semaine 7)
SPRINT 10 │ LiveKit Room (Semaine 7-8)
SPRINT 11 │ Contracts (Semaine 8)
SPRINT 12 │ Statut Candidat & Stripe Connect (Semaine 9)
SPRINT 13 │ Reviews (Semaine 9)
SPRINT 14 │ Notifications (Semaine 9)
SPRINT 15 │ Profiles (Semaine 10)
SPRINT 16 │ Dashboards (Semaine 10-11)
SPRINT 17 │ Polish (Semaine 10-11)
SPRINT 18 │ Production (Semaine 11)
SPRINT 19 │ Testing (Semaine 11)
SPRINT 20 │ Launch (Semaine 11)
─────────────────────────────────────────────────────
SPRINT 4a │ Refonte Workflow Candidature/Visio (post-MVP)
SPRINT 4b │ Onboarding Candidat — Wizard 9 étapes (post-MVP)
SPRINT 4c │ Gestion Missions Employeur & Onboarding Enrichi (post-MVP)
SPRINT 4d │ Abonnement Premium (Stripe Subscriptions + Promo) (post-MVP)
─────────────────────────────────────────────────────
SPRINT 5a │ Navigation par onglets (post-MVP)
SPRINT AD │ Interface admin minimale (post-MVP)
SPRINT AR │ Renommage du chemin admin — défense en profondeur (post-MVP)
SPRINT MOD│ Modération des missions + correctif RLS + correctif liste admin
          │ (post-MVP)
```

---

## 🚀 SPRINT 0 — SETUP (Semaine 1)

### Durée
5 jours × 8h = 40 heures

### Objectif
Environnement développement complet et prêt

### Monday

**Matin (4h):**
- [ ] Clone repo depuis GitHub
- [ ] `git config` user.name + email
- [ ] `pnpm install` (attendre compilation)
- [ ] Verifier Node v20+

**Après-midi (4h):**
- [ ] Créer comptes:
  - Supabase (free tier)
  - Vercel (lié GitHub)
  - Anthropic (Claude Code)
  - Stripe (test mode)
  - LiveKit (cloud)
  - Resend (emails)
  - Mapbox (géo)
- [ ] Documenter clés API dans `.env.example`

### Tuesday

**Full Day (8h):**
- [ ] **Supabase Setup:**
  - [ ] Créer projet
  - [ ] `supabase link --project-ref <ref>`
  - [ ] `supabase init`
  - [ ] Tester connexion
  
- [ ] **Next.js Config:**
  - [ ] Vérifier App Router OK
  - [ ] `.env.local` avec clés Supabase
  - [ ] Tailwind + shadcn/ui OK
  - [ ] `pnpm dev` fonctionne
  
- [ ] **Git Workflow:**
  - [ ] Créer branche `develop`
  - [ ] First commit: "chore: initial setup"

### Wednesday

**Full Day (8h):**
- [ ] **Claude Code Setup:**
  - [ ] `claude auth login` (enter API key)
  - [ ] `claude --version`
  - [ ] Créer `CLAUDE.md` avec instructions
  - [ ] Test premier prompt simple
  
- [ ] **Dev Environment:**
  - [ ] Setup linter (`pnpm lint`)
  - [ ] Setup type checker (`pnpm type-check`)
  - [ ] Setup formatter (Prettier)
  - [ ] VSCode settings (debugging, et.)

### Thursday

**Full Day (8h):**
- [ ] **Docker & Local DB (Optionnel):**
  - [ ] `supabase start` (local Postgres)
  - [ ] Vérifier localhost:5432
  - [ ] Backup fixtures
  
- [ ] **Documentation:**
  - [ ] README.md revue
  - [ ] ARCHITECTURE.md parcouru
  - [ ] Setup verified via checklist

### Friday

**Full Day (8h):**
- [ ] **Final Checks:**
  - [ ] `pnpm build` sans erreurs
  - [ ] `pnpm type-check` sans erreurs
  - [ ] `pnpm lint` sans erreurs
  - [ ] Tous les env vars OK
  
- [ ] **First Branch:**
  - [ ] Créer branche `feat/sprint-1-database`
  - [ ] First commit sur cette branche
  - [ ] Pousser vers GitHub
  
- [ ] **Kickoff Sprint 1:**
  - [ ] Lire Claude Code Prompt #1
  - [ ] Préparé pour lundi matin

### Deliverables
- ✅ Repo fonctionnel localement
- ✅ Tous env vars configurés
- ✅ Claude Code testé
- ✅ Premier commit en git
- ✅ Prêt pour Sprint 1

### Checklist EOF Sprint
- [ ] `pnpm dev` fonctionne
- [ ] `pnpm build` OK
- [ ] `pnpm type-check` OK
- [ ] Git branches OK
- [ ] Claude Code testé
- [ ] Supabase connecté

---

## 🗄️ SPRINT 1 — DATABASE & AUTHENTICATION (Semaine 2)

### Durée
5 jours × 8h = 40 heures

### Objectif
Database complète + Supabase RLS policies + Types TypeScript

### Tâches

#### Jour 1: Database Schema (8h)

**Matin (4h) - Créer migrations:**
- [ ] Créer `supabase/migrations/001_initial_schema.sql`
- [ ] Copier toutes les 18 tables (voir ARCHITECTURE_DATABASE.md)
- [ ] Verifier:
  - [ ] Types corrects
  - [ ] Contraintes (FK, UNIQUE, CHECK)
  - [ ] Defaults
  - [ ] Timestamps

**Après-midi (4h) - Appliquer & seed:**
- [ ] `supabase db push`
- [ ] Créer `supabase/migrations/002_seed_categories.sql`
- [ ] Insérer 15 catégories de services
- [ ] Vérifier données visibles en Supabase Dashboard

#### Jour 2: RLS Policies (8h)

**Matin (4h) - Policies création:**
- [ ] Créer `supabase/migrations/003_enable_rls.sql`
- [ ] Activé RLS sur 18 tables
- [ ] Policies: `profiles`, `candidate_profiles`, `employer_profiles`

**Après-midi (4h) - Policies détail:**
- [ ] Policies: `missions`, `applications`, `conversations`, `messages`
- [ ] Policies: `notifications`, `work_sessions`, `contracts`
- [ ] Tester policies en Supabase UI

#### Jour 3: Types TypeScript (8h)

**Full Day:**
- [ ] `supabase gen types typescript --linked > src/types/database.ts`
- [ ] Vérifier types générés (~1000 lignes, c'est normal)
- [ ] Créer `src/types/index.ts` pour ré-exporter
- [ ] Tester imports dans un composant test

#### Jour 4: Supabase Client Setup (8h)

**Matin (4h):**
- [ ] Créer `src/lib/supabase/client.ts` (client-side)
- [ ] Créer `src/lib/supabase/server.ts` (server-side)
- [ ] Tester connexion depuis page test

**Après-midi (4h):**
- [ ] Créer `src/middleware.ts` (auth middleware)
- [ ] Tester redirect non-auth → login
- [ ] Tester redirect employeur → employer dashboard

#### Jour 5: Testing & Commit (8h)

**Matin (4h):**
- [ ] Écrire tests simples (voir Database Queries)
- [ ] `pnpm type-check` pass
- [ ] `pnpm lint` pass

**Après-midi (4h):**
- [ ] Commit: `feat: complete database schema + RLS`
- [ ] Commit: `feat: supabase client setup`
- [ ] Push vers `feat/sprint-1-database`
- [ ] Créer PR (auto-approve = ok)

### Claude Code Prompts
- **PROMPT #1:** Migrations SQL complètes
- **PROMPT #2:** RLS Policies

### Deliverables
- ✅ `supabase/migrations/001_initial_schema.sql` (18 tables)
- ✅ `supabase/migrations/002_seed_categories.sql` (15 catégories)
- ✅ `supabase/migrations/003_enable_rls.sql` (RLS + policies)
- ✅ `src/types/database.ts` (types générés)
- ✅ `src/lib/supabase/client.ts` et `server.ts`
- ✅ `src/middleware.ts` (auth)

### Checklist EOF Sprint
- [ ] `supabase db push` OK
- [ ] 18 tables en production
- [ ] Types TypeScript générés
- [ ] Middleware auth testé
- [ ] DB schema + RLS en git

---

## 🎨 SPRINT 2 — LAYOUT & LANDING (Semaine 2-3)

### Durée
8 jours × 8h = 64 heures

### Objectif
Interface complète + Landing page production-quality

### Tâches

#### Jour 1-2: Main Layout (16h)

**Jour 1:**
- [ ] Créer `src/app/layout.tsx` (root layout)
- [ ] Setup fonts Geist
- [ ] Setup ThemeProvider
- [ ] Setup Sonner Toaster
- [ ] Setup metadata SEO

**Jour 2:**
- [ ] Créer `src/components/layout/Navbar.tsx`
  - [ ] Logo avec gradient "ii"
  - [ ] Navigation links (Home, Login, Register)
  - [ ] Avatar dropdown si connecté
  - [ ] Hamburger menu mobile
  - [ ] Animations au scroll (backdrop blur)
- [ ] Tester responsive mobile/desktop

#### Jour 3-4: Landing Page (16h)

**Jour 3:**
- [ ] Créer `src/app/(public)/page.tsx` (landing)
- [ ] Section 1: HERO (badge + title + stats animées)
- [ ] Section 2: COMMENT ÇA MARCHE (tabs 3 étapes)
- [ ] Section 3: CATÉGORIES (grid 15 cards)

**Jour 4:**
- [ ] Section 4: POURQUOI OMLIINK (6 avantages)
- [ ] Section 5: TESTIMONIALS (carousel)
- [ ] Section 6: CTA FINAL (gradient animé)
- [ ] Section 7: FOOTER (complet)
- [ ] Framer Motion animations partout

#### Jour 5-6: Responsive & Dark Mode (16h)

**Jour 5:**
- [ ] Tester responsive:
  - [ ] Mobile 375px (iPhone 12 mini)
  - [ ] Tablet 768px (iPad)
  - [ ] Desktop 1280px (MacBook)
  - [ ] Fixes layout issues
- [ ] Test Lighthouse score (target > 80)

**Jour 6:**
- [ ] Dark mode implémenté partout
- [ ] Tester tous les colors en dark
- [ ] Fix contrast issues
- [ ] Animation polish

#### Jour 7-8: Polish & Commit (16h)

**Jour 7:**
- [ ] Performance audit
- [ ] Image optimization
- [ ] Lazy loading
- [ ] Fix Lighthouse issues

**Jour 8:**
- [ ] Final design review
- [ ] Commit: `feat: main layout + navbar`
- [ ] Commit: `feat: landing page (production quality)`
- [ ] Commit: `feat: dark mode + responsive`
- [ ] Push & PR

### Claude Code Prompts
- **PROMPT #2:** Layout principal
- **PROMPT #3:** Landing page 7 sections

### Deliverables
- ✅ `src/app/layout.tsx` (root layout)
- ✅ `src/components/layout/Navbar.tsx` (navbar)
- ✅ `src/app/(public)/page.tsx` (landing page)
- ✅ Responsive mobile/tablet/desktop
- ✅ Dark mode fonctionnel
- ✅ Lighthouse > 80

### Checklist EOF Sprint
- [ ] Landing page visuelle production-quality
- [ ] Responsive mobile OK
- [ ] Dark mode OK
- [ ] Navbar animations smooth
- [ ] Layout en git

---

## 🔐 SPRINT 3 — AUTHENTICATION PAGES (Semaine 3)

### Durée
5 jours × 8h = 40 heures

### Objectif
Login + Register (4 + 5 étapes) complets avec validations

### Tâches

#### Jour 1-2: Login Page (16h)

**Jour 1:**
- [ ] Créer `src/app/(auth)/login/page.tsx`
- [ ] Split layout: illustration + formulaire
- [ ] Email input + password
- [ ] OAuth Google button
- [ ] "Se souvenir de moi" checkbox
- [ ] "Mot de passe oublié" link

**Jour 2:**
- [ ] Zod validation schema
- [ ] RHF hook form integration
- [ ] Supabase Auth call
- [ ] Success toasts
- [ ] Error handling + affichage
- [ ] Redirect vers dashboard si success

#### Jour 3: Register Rôle (8h)

- [ ] Créer `src/app/(auth)/register/page.tsx`
- [ ] Deux cards cliquables: "Employeur" vs "Candidat"
- [ ] Animations au click
- [ ] Redirect vers register/{role}

#### Jour 4: Register Employeur (8h)

- [ ] Créer `src/app/(auth)/register/employer/page.tsx`
- [ ] Multi-step 4 étapes (RHF FormContext)
- [ ] Étape 1: Infos perso (nom, prénom, email, téléphone)
- [ ] Étape 2: Adresse (Mapbox autocomplete)
- [ ] Étape 3: Foyer (enfants, animaux, domicile type)
- [ ] Étape 4: Recap + CGU
- [ ] Progress bar visible
- [ ] Prev/Next navigation

#### Jour 5: Register Candidat (8h)

- [ ] Créer `src/app/(auth)/register/candidate/page.tsx`
- [ ] Multi-step 5 étapes
- [ ] Étape 1: Infos perso
- [ ] Étape 2: Adresse + slider rayon km
- [ ] Étape 3: Services (multi-select) + tarifs
- [ ] Étape 4: Disponibilités (calendrier hebdo)
- [ ] Étape 5: Statut + CGU
- [ ] Supabase Auth + inserts profiles

### Validations (Zod)

- [ ] Schema login
- [ ] Schema register employeur
- [ ] Schema register candidat
- [ ] Error messages clairs

### Claude Code Prompts
- **PROMPT #4:** Login page
- **PROMPT #5:** Register pages

### Deliverables
- ✅ `src/app/(auth)/login/page.tsx`
- ✅ `src/app/(auth)/register/page.tsx` (rôle)
- ✅ `src/app/(auth)/register/employer/page.tsx`
- ✅ `src/app/(auth)/register/candidate/page.tsx`
- ✅ `src/lib/validations/auth.ts` (schemas)

### Checklist EOF Sprint
- [ ] Login fonctionnel (OAuth + email)
- [ ] Register 2 rôles OK
- [ ] Validations Zod complètes
- [ ] Auth flow complet
- [ ] Auth en git

---

**Sprint 3 complété = Phase 1 complètement finie ✅**

### Commit Summary Phase 1

```bash
git merge feat/sprint-0-setup develop
git merge feat/sprint-1-database develop
git merge feat/sprint-2-layout develop
git merge feat/sprint-3-auth develop
git merge develop main  # Phase 1 stable
```

---

## 🧭 SPRINTS 4a-4d — Refonte Candidature, Onboarding & Monétisation Hybride

Séquence post-MVP décidée après retour d'usage (Phase 4-BIS dans
[FEUILLE_DE_ROUTE.md](./FEUILLE_DE_ROUTE.md) — tâches complètes,
deliverables et migrations détaillées là-bas ; détail fonctionnel dans
[CAHIER_DES_CHARGES.md](./CAHIER_DES_CHARGES.md)). Suit le même
[Format Standard](#format-standard-pour-sprints-4-20) que les sprints
4-20 ci-dessous.

```
SPRINT 4a │ Refonte Workflow Candidature/Visio
          │ Objectif : pending/interviewing/hired/rejected, entretiens
          │            en parallèle, onglet "Entretiens" employeur

SPRINT 4b │ Onboarding Candidat — Wizard 9 étapes
          │ Objectif : wizard complet (photo obligatoire, compétences par
          │            catégorie, missions suggérées), vérification de
          │            profil, agenda, onglets candidatures

SPRINT 4c │ Gestion Missions Employeur & Onboarding Enrichi
          │ Objectif : pause/réactivation mission, onboarding employeur
          │            enrichi, suggestions candidats + invitation,
          │            onglet "Mes intervenants"

SPRINT 4d │ Abonnement Premium
          │ Objectif : Stripe Subscriptions (distinct de Stripe Connect),
          │            10€/mois, missions illimitées + priorité matching
          │            + accompagnement URSSAF manuel, codes promo
```

---

## 🧭 SPRINTS 5a, Admin & Modération — Navigation, Sécurité & Confiance

Séquence décidée après retour d'usage sur la Phase 4-BIS — pas dans le
plan initial, ajoutée au fil des besoins réels (navigation, puis
confiance/sécurité). Détail complet dans
[FEUILLE_DE_ROUTE.md](./FEUILLE_DE_ROUTE.md#phase-4-ter--navigation-sécurité--confiance).

```
SPRINT 5a  │ Navigation par onglets
           │ Objectif : IA à onglets pour candidat et employeur (routes
           │            dédiées, pas un état d'onglet côté client)

SPRINT AD  │ Interface admin minimale
           │ Objectif : rôle is_admin (jamais modifiable par l'app),
           │            5 pages (tableau de bord, vérifications, codes
           │            promo, CESU/Pajemploi, missions — scaffold à ce
           │            stade), is_admin_user() SECURITY DEFINER réutilisée
           │            partout

SPRINT AR  │ Renommage du chemin admin
           │ Objectif : défense en profondeur — chemin non public (jamais
           │            committé en clair), 404 pur sur l'ancien chemin
           │            pour tout le monde y compris un admin légitime.
           │            N'affecte en rien le vrai contrôle d'accès
           │            (is_admin_user() + RLS), qui reste inchangé

SPRINT MOD │ Modération des missions
           │ Objectif : missions.moderation_status indépendant de
           │            missions.status, table mission_reports
           │            (signalement par tout utilisateur), page admin
           │            Missions complétée (file de signalements +
           │            suspendre/réactiver/supprimer), + un correctif
           │            RLS trouvé et corrigé pendant les tests de ce
           │            sprint (deux policies legacy sur `missions`
           │            neutralisaient silencieusement moderation_status),
           │            + un correctif de suivi sur la liste admin
           │            (n'affichait que les missions 'published')
```

---

## 📝 Format Standard pour Sprints 4-20

### Pour chaque sprint suivant:

```markdown
## SPRINT XX — [NOM] (Semaine Y-Z)

### Durée
X jours × 8h = Y heures

### Objectif
[1-2 phrases claires]

### Tâches Par Jour
- Jour 1: [Task A (4h), Task B (4h)]
- Jour 2: [Task C (8h)]
- etc.

### Claude Code Prompts
- PROMPT #N: [Description]
- PROMPT #N+1: [Description]

### Deliverables
- ✅ File1.tsx
- ✅ File2.ts
- etc.

### Checklist EOF Sprint
- [ ] Feature fonctionnelle
- [ ] Tests passent
- [ ] PR créée et mergée
```

---

## 🎯 Workflow Git Standard

**Pour chaque sprint:**

```bash
# 1. Créer branche feature
git checkout develop
git pull origin develop
git checkout -b feat/sprint-X-description

# 2. Développer
pnpm dev
# ... faire les trucs ...
pnpm type-check  # Vérifier types
pnpm lint        # Linter
pnpm build       # Build test

# 3. Commit
git add .
git commit -m "feat: description courte du sprint"

# 4. Push et PR
git push origin feat/sprint-X-description
# Ouvrir PR sur GitHub
# Auto-merge ou review

# 5. Intégrer
git checkout develop
git pull origin feat/sprint-X-description
git merge --no-ff feat/sprint-X-description

# 6. Cleanup
git branch -d feat/sprint-X-description
```

---

## 📊 Métriques EOF Sprint

**À mesurer chaque EOSprint:**

```
Lines of Code: +X LOC
Files Changed: Y fichiers
Components Added: Z composants
Type Coverage: >98%
Test Coverage: >70%
Lighthouse Score: > 80
Build Time: < 30s
```

---

## ⚠️ Halt Conditions

**Si sprint bloqué:**

```
🔴 STOP: Bug critique (app crash)
🟡 PAUSE: Feature incomplète > 2j de retard
🟢 GO: Minor issues, continue
```

---

**Total Sprints:** 20 (MVP initial) + 4 (Sprints 4a-4d, post-MVP) + 4
(Sprints 5a/Admin/Renommage/Modération, post-MVP)  
**Total Heures:** ~435h (11 semaines) + Phase 4-BIS + Phase 4-TER  
**Livrable:** OMLIINK MVP en production, puis refonte candidature/onboarding
+ monétisation hybride, puis navigation à onglets + interface admin +
modération des missions

Voir FEUILLE_DE_ROUTE.md pour vue complète.
