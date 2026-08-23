# 🗺️ FEUILLE DE ROUTE OMLIINK

**Timeline Développement: 11 Semaines (Phase 0-6)**

---

## 📅 Vue d'Ensemble

```
SEMAINE  1  │ Phase 0: Setup & Configuration
SEMAINES 2-3 │ Phase 1: Foundation (DB, Auth, Landing)
SEMAINES 4-6 │ Phase 2: Core Features (Missions, Matching, Chat)
SEMAINES 7-8 │ Phase 3: Visio & Contrats
SEMAINE   9  │ Phase 4: URSSAF & Paiements
SEMAINE  10  │ Phase 5: Polish & Dashboards
SEMAINE  11  │ Phase 6: Déploiement Production
```

**Total:** 11 semaines = ~2.5 mois pour MVP complet

---

## 🎯 PHASE 0 — SETUP & CONFIGURATION (Semaine 1)

### Objectifs
- ✅ Environment local configuré
- ✅ Dépendances installées
- ✅ Git workflow établi
- ✅ Supabase connecté
- ✅ Prêt pour développement

### Livrables
- [ ] Repository GitHub cloné
- [ ] `pnpm install` réussi
- [ ] `.env.local` rempli (clés API)
- [ ] Supabase local OK
- [ ] `pnpm dev` fonctionne (localhost:3000)
- [ ] Première branche feature créée

### Ressources
- Next.js boilerplate
- Supabase CLI
- shadcn/ui composants
- Tailwind configuré

### Durée
**5 jours de travail (40 heures)**

### Status
⏳ À faire

---

## 🏗️ PHASE 1 — FOUNDATION (Semaines 2-3)

### Sprint 1: Database & Authentication

**Semaine 2, Lundi-Mercredi**

**Objectif:** DB complète + Auth fonctionnelle

**Tâches:**
- [ ] Créer migrations SQL (18 tables)
- [ ] Appliquer RLS policies
- [ ] Générer types TypeScript
- [ ] Configurer Supabase Storage (buckets)
- [ ] Tests SQL de base

**Deliverable:** `supabase/migrations/001_schema.sql` ✅

**Claude Code Prompts:**
- PROMPT #1: Migrations SQL complètes
- PROMPT #2: RLS policies

**Durée:** 20 heures

---

### Sprint 2: Layout & Landing Page

**Semaine 2, Jeudi-Vendredi + Semaine 3, Lundi-Mardi**

**Objectif:** Interface utilisateur + Landing publique

**Tâches:**
- [ ] Layout principal (navbar + sidebar/bottom-nav)
- [ ] Landing page 7 sections (production quality)
- [ ] Responsive mobile/tablet/desktop
- [ ] Dark mode fonctionnel
- [ ] Animations Framer Motion

**Deliverables:**
- `src/app/layout.tsx` ✅
- `src/app/(public)/page.tsx` ✅
- `src/components/layout/*` ✅

**Claude Code Prompts:**
- PROMPT #2: Layout principal
- PROMPT #3: Landing page

**Durée:** 30 heures

---

### Sprint 3: Authentication Pages

**Semaine 3, Mercredi-Vendredi**

**Objectif:** Login + Register (employeur + candidat)

**Tâches:**
- [ ] Login page (email/password + OAuth Google)
- [ ] Register choix rôle
- [ ] Register employeur (4 étapes)
- [ ] Register candidat (5 étapes)
- [ ] Validations Zod complètes
- [ ] Gestion erreurs + success messages

**Deliverables:**
- `src/app/(auth)/login/page.tsx` ✅
- `src/app/(auth)/register/page.tsx` ✅
- `src/app/(auth)/register/employer/page.tsx` ✅
- `src/app/(auth)/register/candidate/page.tsx` ✅
- `src/lib/validations/auth.ts` ✅

**Claude Code Prompts:**
- PROMPT #4: Login page
- PROMPT #5: Register pages

**Durée:** 25 heures

---

### Phase 1 Summary
- **Total:** 75 heures (~19 heures/jour sur 4 jours)
- **Livrables:** DB + Auth + Landing + UI complète
- **Status:** ✅ Prêt pour Phase 2

---

## 🎯 PHASE 2 — CORE FEATURES (Semaines 4-6)

### Sprint 4: Vérification Documents

**Semaine 4, Lundi-Mercredi**

**Objectif:** Stepper 5 étapes vérification candidat

**Tâches:**
- [ ] Stepper UI (5 étapes)
- [ ] Email + Téléphone (SMS OTP)
- [ ] Upload documents (drag & drop)
- [ ] Signature électronique
- [ ] Validations status + alertes

**Deliverables:**
- `src/app/(dashboard)/profile/verification/page.tsx` ✅
- `src/components/common/FileUpload.tsx` ✅

**Claude Code Prompts:**
- PROMPT #6: Tunnel vérification

**Durée:** 20 heures

---

### Sprint 5: Création Missions

**Semaine 4, Jeudi-Vendredi + Semaine 5, Lundi-Mercredi**

**Objectif:** Multi-step création mission + Cost simulator

**Tâches:**
- [ ] Stepper 5 étapes (catégorie, description, lieu, tarif, recap)
- [ ] Mapbox autocomplete adresse
- [ ] Cost simulator temps réel (URSSAF call)
- [ ] RHF + Zod validations
- [ ] Save to DB

**Deliverables:**
- `src/app/(dashboard)/employer/missions/new/page.tsx` ✅
- `src/components/missions/CostSimulator.tsx` ✅

**Claude Code Prompts:**
- PROMPT #7: Création mission
- PROMPT #8: Cost simulator

**Durée:** 25 heures

---

### Sprint 6: Listing Missions & Details

**Semaine 5, Jeudi-Vendredi + Semaine 6, Lundi-Mardi**

**Objectif:** Feed missions + detail page

**Tâches:**
- [ ] Listing employeur (tabs: toutes/brouillons/publiées/en cours)
- [ ] Listing candidat (feed filtrée + map toggle)
- [ ] Mission detail page complet
- [ ] MissionCard composant réutilisable
- [ ] Infinite scroll / pagination

**Deliverables:**
- `src/app/(dashboard)/employer/missions/page.tsx` ✅
- `src/app/(dashboard)/candidate/missions/page.tsx` ✅
- `src/app/(dashboard)/missions/[id]/page.tsx` ✅
- `src/components/missions/MissionCard.tsx` ✅

**Claude Code Prompts:**
- PROMPT #8: Listing missions

**Durée:** 20 heures

---

### Sprint 7: Matching Algorithm

**Semaine 6, Mercredi-Vendredi**

**Objectif:** Algorithme matching IA + interface

**Tâches:**
- [ ] Edge Function matching (distance, dispo, réputation, etc.)
- [ ] MatchList component + MatchScore animé
- [ ] Top 10 candidats retournés
- [ ] Tests avec seed data

**Deliverables:**
- `supabase/functions/matching/index.ts` ✅
- `src/components/candidates/MatchList.tsx` ✅
- `src/components/candidates/MatchScore.tsx` ✅

**Claude Code Prompts:**
- PROMPT #9: Matching algorithm

**Durée:** 20 heures

---

### Sprint 8: Chat Realtime

**Semaine 6, Mercredi-Vendredi (parallèle)**

**Objectif:** Messagerie temps réel avec Supabase Realtime

**Tâches:**
- [ ] Conversations list (avatars, unread, timestamps)
- [ ] Chat window (bulles, typing indicator, scroll)
- [ ] Message input + send
- [ ] Supabase Realtime subscription
- [ ] Mark as read

**Deliverables:**
- `src/app/(dashboard)/messages/page.tsx` ✅
- `src/components/chat/ConversationList.tsx` ✅
- `src/components/chat/ChatWindow.tsx` ✅
- `src/components/chat/MessageBubble.tsx` ✅
- `src/hooks/useMessages.ts` ✅

**Claude Code Prompts:**
- PROMPT #10: Chat system

**Durée:** 20 heures

---

### Phase 2 Summary
- **Total:** 125 heures (~21 heures/jour sur 6 jours)
- **Livrables:** Missions complètes + Matching IA + Chat realtime
- **Status:** ✅ Core features fonctionnelles

---

## 📹 PHASE 3 — VISIO & CONTRATS (Semaines 7-8)

### Sprint 9: Visio Scheduler

**Semaine 7, Lundi-Mercredi**

**Objectif:** Proposition + scheduling visios

**Tâches:**
- [ ] VisioScheduler component (calendrier + créneaux)
- [ ] Dialog depuis chat/profil
- [ ] Proposition 3 créneaux
- [ ] Confirmation/refus
- [ ] Edge Function visio-create-room

**Deliverables:**
- `src/components/visio/VisioScheduler.tsx` ✅
- `src/components/visio/VisioCard.tsx` ✅
- `supabase/functions/visio-create-room/index.ts` ✅

**Claude Code Prompts:**
- PROMPT #11: VisioScheduler

**Durée:** 15 heures

---

### Sprint 10: LiveKit Room

**Semaine 7, Jeudi-Vendredi + Semaine 8, Lundi**

**Objectif:** Visioconférence complète LiveKit

**Tâches:**
- [ ] VisioPreJoin (test cam/micro)
- [ ] VisioRoom (LiveKit intégration)
- [ ] Contrôles (micro, cam, partage, chat, flou)
- [ ] Chronomètre + durée max
- [ ] Fin automatique
- [ ] VisioEndScreen

**Deliverables:**
- `src/app/(dashboard)/visio/[id]/room/page.tsx` ✅
- `src/components/visio/VisioPreJoin.tsx` ✅
- `src/components/visio/VisioRoom.tsx` ✅
- `src/components/visio/VisioChat.tsx` ✅
- `src/components/visio/VisioEndScreen.tsx` ✅

**Claude Code Prompts:**
- PROMPT #12: VisioRoom LiveKit

**Durée:** 20 heures

---

### Sprint 11: Contrats & Work Sessions

**Semaine 8, Mardi-Vendredi**

**Objectif:** Contrats signés + clock in/out

**Tâches:**
- [ ] Contract display + signature électronique
- [ ] PDF génération + storage
- [ ] Work session clock-in/out
- [ ] Géolocalisation check-in
- [ ] Confirmation employeur + candidat

**Deliverables:**
- `src/components/contracts/ContractSign.tsx` ✅
- `src/components/contracts/WorkSession.tsx` ✅
- `src/app/(dashboard)/employer/contracts/page.tsx` ✅
- `src/app/(dashboard)/candidate/planning/page.tsx` ✅

**Claude Code Prompts:**
- PROMPT #13: Contracts & Work Sessions
- PROMPT #14: Visio Edge Functions

**Durée:** 20 heures

---

### Phase 3 Summary
- **Total:** 55 heures (~14 heures/jour sur 4 jours)
- **Livrables:** Système visio complet + Contrats + Planning
- **Status:** ✅ Visio + contrats fonctionnels

---

## 💰 PHASE 4 — URSSAF & PAIEMENTS (Semaine 9)

### Sprint 12: URSSAF Integration

**Semaine 9, Lundi-Mercredi**

**Objectif:** Paiements + Déclarations URSSAF

**Tâches:**
- [ ] Edge Function urssaf-simulate (coût simulator)
- [ ] Edge Function urssaf-declare (après confirmation heures)
- [ ] Fiscal page employeur (total dépensé, crédit)
- [ ] Earnings page candidat (revenus, graphiques)
- [ ] Bulletins de paie PDF

**Deliverables:**
- `supabase/functions/urssaf-simulate/index.ts` ✅
- `supabase/functions/urssaf-declare/index.ts` ✅
- `src/app/(dashboard)/employer/fiscal/page.tsx` ✅
- `src/app/(dashboard)/candidate/earnings/page.tsx` ✅

**Claude Code Prompts:**
- PROMPT #15: URSSAF integration

**Durée:** 20 heures

---

### Sprint 13: Reviews & Avis

**Semaine 9, Jeudi-Vendredi**

**Objectif:** Système avis post-mission

**Tâches:**
- [ ] ReviewForm (5 étoiles + notes + commentaire)
- [ ] ReviewCard affichage
- [ ] Profile reviews section
- [ ] Distribution graphique
- [ ] Triggers auto 2h après fin

**Deliverables:**
- `src/components/reviews/ReviewForm.tsx` ✅
- `src/components/reviews/ReviewCard.tsx` ✅
- `src/components/profile/ReviewsSection.tsx` ✅

**Claude Code Prompts:**
- PROMPT #16: Reviews system

**Durée:** 15 heures

---

### Sprint 14: Notifications

**Semaine 9, Parallèle**

**Objectif:** Notifications push + email

**Tâches:**
- [ ] NotificationBell component
- [ ] Notifications page
- [ ] Email templates Resend (invitation, rappels, paiements)
- [ ] Edge Function send-notification
- [ ] Push notifications Vercel

**Deliverables:**
- `src/hooks/useNotifications.ts` ✅
- `src/components/layout/NotificationBell.tsx` ✅
- `src/app/(dashboard)/notifications/page.tsx` ✅
- `src/emails/*.tsx` templates ✅
- `supabase/functions/send-notification/index.ts` ✅

**Claude Code Prompts:**
- PROMPT #17: Notifications system

**Durée:** 15 heures

---

### Phase 4 Summary
- **Total:** 50 heures (~16 heures/jour sur 3 jours)
- **Livrables:** URSSAF complet + Paiements + Avis + Notifications
- **Status:** ✅ Système paiements en place

---

## 🎨 PHASE 5 — POLISH & DASHBOARDS (Semaine 10)

### Sprint 15: Profils & Settings

**Semaine 10, Lundi-Mercredi**

**Objectif:** Pages profils + settings

**Tâches:**
- [ ] Profile page (photo, infos, services)
- [ ] Settings page (notifications, langue, compte)
- [ ] Documents page (statuts, alertes expiration)
- [ ] Progress bar complétude profil
- [ ] Badges vérification

**Deliverables:**
- `src/app/(dashboard)/profile/page.tsx` ✅
- `src/app/(dashboard)/profile/settings/page.tsx` ✅
- `src/app/(dashboard)/candidate/documents/page.tsx` ✅

**Claude Code Prompts:**
- PROMPT #18: Profiles & Settings

**Durée:** 15 heures

---

### Sprint 16: Dashboards Principaux

**Semaine 10, Jeudi-Vendredi + Semaine 11, Lundi**

**Objectif:** Dashboards employer + candidate

**Tâches:**
- [ ] Employer dashboard (stat cards, missions récentes, top candidats)
- [ ] Candidate dashboard (stat cards, opportunités, planning)
- [ ] UpcomingVisios component
- [ ] Alerts & empty states
- [ ] Skeleton loaders

**Deliverables:**
- `src/app/(dashboard)/employer/page.tsx` ✅
- `src/app/(dashboard)/candidate/page.tsx` ✅
- `src/components/dashboard/StatsCards.tsx` ✅
- `src/components/dashboard/UpcomingVisios.tsx` ✅

**Claude Code Prompts:**
- PROMPT #19: Dashboards

**Durée:** 15 heures

---

### Sprint 17: Design Polish

**Semaine 10-11, Parallèle**

**Objectif:** UX polish complet

**Tâches:**
- [ ] EmptyState components (tous contextes)
- [ ] LoadingSkeleton components
- [ ] error.tsx + not-found.tsx
- [ ] Dark mode test complet
- [ ] Responsive final 375px→1280px
- [ ] Animations polish
- [ ] Audit design complet

**Deliverables:**
- `src/components/common/EmptyState.tsx` ✅
- `src/components/common/LoadingSkeleton.tsx` ✅
- `src/app/error.tsx` ✅
- `src/app/not-found.tsx` ✅

**Claude Code Prompts:**
- PROMPT #20: Components & animations
- PROMPT #21: Design audit

**Durée:** 20 heures

---

### Phase 5 Summary
- **Total:** 50 heures (~16 heures/jour sur 3 jours)
- **Livrables:** Profils complets + Dashboards + Design polish
- **Status:** ✅ Application production-ready

---

## 🚀 PHASE 6 — DEPLOYMENT (Semaine 11)

### Sprint 18: Production Setup

**Semaine 11, Mercredi-Vendredi**

**Objectif:** Préparation + déploiement production

**Tâches:**
- [ ] Vercel deployment setup
- [ ] Env vars production
- [ ] Storage policies Supabase
- [ ] Edge Functions déployées
- [ ] Monitoring (Vercel Analytics, Sentry)
- [ ] Backups automatiques testés
- [ ] SSL/domaine configuré

**Deliverables:**
- Production en Vercel ✅
- Monitoring setup ✅
- Backup tested ✅

**Claude Code Prompts:**
- PROMPT #22: Storage policies
- PROMPT #23: Production setup

**Durée:** 15 heures

---

### Sprint 19: Final Testing

**Semaine 11, Parallèle**

**Objectif:** QA complet avant lancement

**Tâches:**
- [ ] Flux end-to-end (employer + candidat)
- [ ] Visio testing complet
- [ ] Paiements test
- [ ] URSSAF sandbox
- [ ] Mobile testing (real devices)
- [ ] Performance testing
- [ ] Security checklist

**Livrables:**
- QA Report ✅
- Bug fixes ✅

**Durée:** 15 heures

---

### Sprint 20: Final Polish & Launch

**Semaine 11, Vendredi (Buffer)**

**Objectif:** Dernier polish + go-live

**Tâches:**
- [ ] Seed data production
- [ ] CGU/CGV en ligne
- [ ] Mentions légales + RGPD
- [ ] Documentation utilisateur
- [ ] Monitoring production actif
- [ ] GO LIVE ✅

**Deliverables:**
- Live en production ✅
- Monitoring en place ✅
- Support en place ✅

**Claude Code Prompts:**
- PROMPT #24-26: Final review & launch

**Durée:** 10 heures

---

### Phase 6 Summary
- **Total:** 40 heures (~20 heures/jour sur 2 jours)
- **Livrables:** OMLIINK en production ✅
- **Status:** 🚀 LAUNCHED

---

## 📊 Timeline Résumée

| Phase | Semaines | Heures | Livrables |
|-------|----------|--------|-----------|
| **0** | 1 | 40 | Setup + Config |
| **1** | 2-3 | 75 | DB + Auth + Landing |
| **2** | 4-6 | 125 | Core Features |
| **3** | 7-8 | 55 | Visio + Contrats |
| **4** | 9 | 50 | URSSAF + Paiements |
| **5** | 10 | 50 | Dashboards + Polish |
| **6** | 11 | 40 | Production + Launch |
| **TOTAL** | **11** | **435** | **MVP Complet** |

---

## 🎯 Jalons Clés

```
Fin Semaine 1:    ✅ Environment ready
Fin Semaine 3:    ✅ Auth fonctionnelle + Landing
Fin Semaine 6:    ✅ Core features (Missions + Matching + Chat)
Fin Semaine 8:    ✅ Visio + Contrats
Fin Semaine 9:    ✅ URSSAF + Paiements
Fin Semaine 10:   ✅ Dashboards + Polish
Fin Semaine 11:   🚀 Production Launch
```

---

## 📈 Progression KPIs

```
Semaine 1:   5% (setup)
Semaine 3:   20% (auth)
Semaine 6:   55% (core)
Semaine 8:   70% (visio)
Semaine 9:   85% (paiements)
Semaine 10:  95% (polish)
Semaine 11:  100% (launch)
```

---

## ⚠️ Points de Vigilance

### Risques Identifiés

```
🔴 HIGH RISK:
  - Intégration URSSAF API (prioritaire semaine 9)
  - Performance chat/visio temps réel
  - Responsabilité juridique (CGU)

🟡 MEDIUM RISK:
  - LiveKit coûts (prévoir fallback)
  - Onfido KYC temps d'approbation
  - Matching algo edge cases

🟢 LOW RISK:
  - Design polish (peut être différé)
  - Emails transactionnels (fallback simple)
```

### Mitigation

```
✅ URSSAF: Tester sandbox semaine 8 (avant semaine 9)
✅ Chat/Visio: Load testing semaine 7-8
✅ Juridique: Validator externe semaine 10
✅ Performance: Monitoring Semaine 9+
```

---

## 🔄 Ajustements Possibles

### Si retard Phase 1-2
```
→ Repousser Phase 3 (Visio) à semaine 9-10
→ Lancer MVP sans Visio (dégradé mais fonctionnel)
```

### Si problème URSSAF
```
→ Implémenter déclaration manuelle temporaire
→ Garder URSSAF en "beta" jusqu'à validation
```

### Si retard général
```
→ Lancer MVP Phase 5 (sans Phase 6 polish)
→ Polish en semaine 12+
```

---

**Document actuel:** v1.0  
**Statut:** Prêt pour démarrage  
**Dernière MAJ:** Août 2026

Pour détail des tâches: Voir **SPRINTS.md**
