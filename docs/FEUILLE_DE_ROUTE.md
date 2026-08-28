# 🗺️ FEUILLE DE ROUTE OMLIINK

**Timeline Développement: 11 Semaines (Phase 0-6)**

---

## 📅 Vue d'Ensemble

```
SEMAINE  1  │ Phase 0: Setup & Configuration
SEMAINES 2-3 │ Phase 1: Foundation (DB, Auth, Landing)
SEMAINES 4-6 │ Phase 2: Core Features (Missions, Matching géo, Chat)
SEMAINES 7-8 │ Phase 3: Visio & Contrats
SEMAINE   9  │ Phase 4: Statut Candidat & Paiements (Stripe Connect)
   +4        │ Phase 4-BIS: Candidature/Visio + Onboarding + Premium (4a-4d)
   +4        │ Phase 4-TER: Navigation, Sécurité & Confiance (5a/Admin/
             │              Renommage/Modération)
SEMAINE  10  │ Phase 5: Polish & Dashboards
SEMAINE  11  │ Phase 6: Déploiement Production
```

**Total:** 11 semaines pour le MVP initial + 4 sprints supplémentaires
(Phase 4-BIS, séquence 4a-4d) + 4 sprints supplémentaires (Phase 4-TER)
décidés après retour d'usage — non comptés dans l'estimation initiale de
~2.5 mois.

> ⚠️ **Routes** : les chemins mentionnés dans les tâches/livrables
> ci-dessous (`/employer/missions`, `/candidate/missions`, `/profile/
> verification`, `/register/employer`, etc.) décrivent le plan initial,
> jamais suivi tel quel — l'architecture de routes réellement livrée a
> consolidé vers `/dashboard/*` avec rendu conditionnel par rôle. Voir
> [ARCHITECTURE_ROUTES.md](./ARCHITECTURE_ROUTES.md) pour la structure
> réelle.

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
- [ ] Cost simulator temps réel (tarif × durée + commission, si statut
      auto-entrepreneur ; hors URSSAF, voir Phase 4)
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

### Sprint 7: Matching Géographique (scope MVP — distance uniquement)

**Semaine 6, Mercredi-Vendredi**

**Objectif:** Tri/filtre des missions par distance — **pas** l'algorithme de
score multi-critères complet (celui-ci reste la vision cible à terme, voir
[CAHIER_DES_CHARGES.md](./CAHIER_DES_CHARGES.md#matching-algorithm), et
viendra plus tard avec plus de données réelles d'usage)

**Tâches:**
- [ ] Migration `candidate_profiles` : ajouter `location_lat`, `location_lng`
      (même autocomplete BAN que missions), `radius_km` — voir
      [ARCHITECTURE_DATABASE.md](./ARCHITECTURE_DATABASE.md) pour le SQL
- [ ] Calcul de distance par formule haversine (SQL ou applicatif — pas de
      PostGIS à ce volume)
- [ ] Côté candidat : missions triées/filtrées par distance, dans son rayon
      d'action (`radius_km`)
- [ ] Côté employeur : distance affichée sur chaque candidature reçue
      (candidat ↔ lieu de la mission)
- [ ] Tests avec seed data

**Deliverables:**
- Migration `candidate_profiles` (location_lat/location_lng/radius_km) ✅
- Tri par distance dashboard candidat ✅
- Distance affichée sur les candidatures (vue employeur) ✅

**Claude Code Prompts:**
- PROMPT #9: Matching géographique (distance uniquement)

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
- **Livrables:** Missions complètes + Matching géographique (distance) + Chat realtime
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

## 💰 PHASE 4 — STATUT CANDIDAT & PAIEMENTS (Semaine 9)

> Décision (recherche cadre légal français + comparaison Yoopies) : pas
> d'intégration URSSAF API dans cette phase. OMLIINK gère un flux de
> paiement réel uniquement pour les candidats au statut `auto_entrepreneur`,
> via Stripe Connect. Pour le statut `particulier_employeur`, OMLIINK
> fournit uniquement le générateur de contrat (déjà livré) — le salaire et
> les cotisations restent gérés par l'employeur via le CESU officiel, hors
> OMLIINK. Voir [CAHIER_DES_CHARGES.md](./CAHIER_DES_CHARGES.md#statut-candidat--paiement)
> et la migration `employment_status` dans
> [ARCHITECTURE_DATABASE.md](./ARCHITECTURE_DATABASE.md).

### Sprint 12: Statut Candidat & Stripe Connect

**Semaine 9, Lundi-Mercredi**

**Objectif:** Champ `employment_status` sur `candidate_profiles` + paiements
Stripe Connect pour le seul flux `auto_entrepreneur`

**Tâches:**
- [ ] Migration `employment_status` sur `candidate_profiles` (voir
      ARCHITECTURE_DATABASE.md — à exécuter avant ce sprint)
- [ ] Sélecteur de statut sur le profil candidat (information affichée,
      recherche/candidature identiques pour les deux statuts)
- [ ] Onboarding Stripe Connect (candidats `auto_entrepreneur` uniquement)
- [ ] Edge Function / Server Action de paiement : encaissement, commission
      10%, reversement du solde
- [ ] Fiscal page employeur (montant facturé, mode de paiement affiché
      selon le statut du candidat)
- [ ] Earnings page candidat `auto_entrepreneur` (revenus, graphiques)
- [ ] Pour `particulier_employeur` : page d'accompagnement CESU (liens
      officiels, pas de traitement de paiement côté OMLIINK)

**Deliverables:**
- Migration `employment_status` appliquée ✅
- `src/lib/actions/stripe-connect.ts` (paiement auto-entrepreneur) ✅
- `src/app/dashboard/employer/fiscal/page.tsx` ✅
- `src/app/dashboard/candidate/earnings/page.tsx` ✅

**Claude Code Prompts:**
- PROMPT #15: Statut candidat + Stripe Connect (auto-entrepreneur uniquement)

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
- **Livrables:** Statut candidat + Stripe Connect (auto-entrepreneur) + Avis + Notifications
- **Status:** ✅ Système paiements en place (hors URSSAF, hors périmètre actuel)

---

## 🧭 PHASE 4-BIS — REFONTE CANDIDATURE, ONBOARDING & MONÉTISATION HYBRIDE

Séquence de 4 sprints décidée après retour d'usage sur le MVP initial —
prend le relais après le sprint Stripe Connect. Détail complet dans
[CAHIER_DES_CHARGES.md](./CAHIER_DES_CHARGES.md) (sections Workflow
Candidature & Visio, Onboarding Candidat, Onboarding Employeur & Gestion
des Missions, Modèle Économique) et
[ARCHITECTURE_DATABASE.md](./ARCHITECTURE_DATABASE.md) pour le schéma
cible. Comme d'habitude, les migrations Supabase réelles de chaque sprint
sont créées et appliquées manuellement au moment du sprint — rien n'est
exécuté par cette mise à jour de documentation.

### Sprint 4a — Refonte Workflow Candidature/Visio

**Objectif :** remplacer le statut binaire accepté/refusé par un vrai
processus d'entretien (`pending` → `interviewing` → `hired`/`rejected`),
avec plusieurs entretiens en parallèle possibles avant décision.

**Tâches :**
- [ ] Migration `applications.status` : réécriture des valeurs existantes
      vers `pending`/`interviewing`/`hired`/`rejected`
- [ ] La mission reste `published` tant qu'aucun candidat n'est `hired`
- [ ] Nouvel onglet employeur "Entretiens" (candidats `interviewing`)
- [ ] Action "Choisir ce candidat" : `hired` + rejet auto des autres +
      génération contrat + mission → `assigned`

**Deliverables :**
- Migration `applications.status` (réécriture) ✅
- Onglet "Entretiens" côté employeur ✅

---

### Sprint 4b — Onboarding Candidat (Wizard 9 étapes)

**Objectif :** wizard d'inscription candidat en 9 étapes, adapté au
modèle mission-first (pas de profil-vitrine public).

**Tâches :**
- [ ] Migration `candidate_profiles` : `gender`, `birth_date`,
      `birth_place`, `native_language`, `phone_visible`, `photo_url`
      (NOT NULL), `experience_level`, `bio_title`, `bio_text`,
      `verification_status`, `verification_document_url`
- [ ] Nouvelles tables : `candidate_languages`, `candidate_service_types`,
      `candidate_supplements`, `skill_taxonomy`, `candidate_skills`
- [ ] Seed `skill_taxonomy` (référentiel de tags par catégorie, voir
      annexe CAHIER_DES_CHARGES.md)
- [ ] Wizard 9 étapes : à propos / infos complémentaires / photo
      (bloquant) / types de services / suppléments / expérience &
      tarif / compétences / bio / missions suggérées
- [ ] Vérification de profil : badge, upload pièce d'identité, revue
      manuelle (pas d'automatisation)
- [ ] Agenda candidat (visios et missions à venir)
- [ ] Onglets candidatures "En attente" / "Historique"

**Deliverables :**
- Migration `candidate_profiles` + 5 nouvelles tables ✅
- Wizard onboarding candidat (9 étapes) ✅
- Page vérification de profil ✅
- Agenda + onglets candidatures ✅

---

### Sprint 4c — Gestion Missions Employeur & Onboarding Enrichi

**Objectif :** cycle de vie complet des missions côté employeur (voir,
éditer, pause, réactivation) + onboarding employeur enrichi + suggestions
de candidats.

**Tâches :**
- [ ] Migration `missions.status` : ajout de `paused`
- [ ] Actions mission : Voir / Éditer / Mettre en pause / Réactiver
- [ ] Onboarding employeur enrichi : nationalité, sous-typage du besoin
      par catégorie (référentiel partagé avec les compétences candidat),
      titre mission (10-60 car.), description (30-2000 car.), photo
      optionnelle
- [ ] Suggestions de candidats compatibles post-publication + invitation
      à candidater (pas de contact direct libre)
- [ ] Nouvel onglet employeur "Mes intervenants" (historique `hired`)

**Deliverables :**
- Migration `missions.status` (+`paused`) ✅
- Actions pause/réactivation mission ✅
- Onboarding employeur enrichi ✅
- Onglet "Mes intervenants" ✅

---

### Sprint 4d — Abonnement Premium (Stripe Subscriptions + Codes Promo)

**Objectif :** monétisation hybride — commission 10% (inchangée) +
abonnement Premium employeur 10€/mois, sur un flux Stripe **distinct** du
Checkout de paiement de mission.

**Tâches :**
- [ ] Migration `employer_profiles` : `subscription_tier`,
      `subscription_status`, `stripe_subscription_id`
- [ ] Nouvelle table `promo_codes`
- [ ] Intégration Stripe Subscriptions (Billing) — distincte de Stripe
      Connect/Checkout déjà en place
- [ ] Webhooks : `invoice.paid`, `customer.subscription.updated`,
      `customer.subscription.deleted`
- [ ] Gratuit : 1-2 missions actives max ; Premium : illimité + priorité
      matching + accompagnement URSSAF manuel + codes promo
- [ ] Application d'un code promo au moment de la souscription

**Deliverables :**
- Migration `employer_profiles` + table `promo_codes` ✅
- Flux Stripe Subscriptions (souscription, webhooks) ✅
- Limite missions actives (gratuit vs Premium) ✅
- Codes promo fonctionnels ✅

---

### Phase 4-BIS Summary
- **Livrables :** Workflow entretien candidature + Onboarding candidat
  (wizard 9 étapes) + Gestion missions employeur (pause/édition) +
  Onboarding employeur enrichi + Abonnement Premium (Stripe Subscriptions)
- **Status :** ✅ Livré

---

## 🧭 PHASE 4-TER — NAVIGATION, SÉCURITÉ & CONFIANCE

Séquence de 4 sprints décidée après retour d'usage sur la Phase 4-BIS — pas
dans le plan initial, prend le relais après le sprint Premium. Deux volets
distincts : navigation (5a) puis confiance/sécurité (admin, renommage,
modération). Détail fonctionnel dans
[CAHIER_DES_CHARGES.md](./CAHIER_DES_CHARGES.md) (sections Modération &
Interface Admin) et [ARCHITECTURE_DATABASE.md](./ARCHITECTURE_DATABASE.md)
pour le schéma. Comme d'habitude, les migrations Supabase réelles de
chaque sprint sont créées et appliquées manuellement au moment du sprint.

### Sprint 5a — Navigation par onglets

**Objectif :** remplacer la navigation ad hoc par une IA à onglets
cohérente, côté candidat et employeur.

**Tâches :**
- [x] Routes dédiées par onglet (vraies routes Next.js, pas un état
      d'onglet côté client — pour que l'URL, le rechargement et le bouton
      retour du navigateur se comportent normalement)
- [x] Onglets candidat et employeur alignés sur le même pattern

**Deliverables :**
- Navigation à onglets (candidat + employeur) ✅

---

### Sprint Admin — Interface admin minimale

**Objectif :** donner à l'équipe OMLIINK un premier outil d'administration,
sans jamais permettre à l'application elle-même d'accorder ce rôle.

**Tâches :**
- [x] `profiles.is_admin` (défaut `false`) — aucune Server Action, aucun
      formulaire ne l'écrit ; uniquement modifiable manuellement en base
- [x] `is_admin_user()` (SECURITY DEFINER), réutilisée par toutes les
      nouvelles policies RLS admin plutôt que dupliquée
- [x] `requireAdminUser()` — revérifie le rôle depuis la base à chaque
      appel, jamais mis en cache ni fait confiance à un état client
- [x] 5 pages : tableau de bord (compteurs), vérifications candidat (URL
      signée sur le bucket privé, approbation/rejet), codes promo (CRUD,
      désactivation), CESU/Pajemploi (marquage "connecté" manuel), missions
      (scaffold de navigation à ce stade — complété par le sprint
      Modération ci-dessous)

**Deliverables :**
- `profiles.is_admin` + `is_admin_user()` + `requireAdminUser()` ✅
- 5 pages admin ✅

---

### Sprint Renommage — Chemin admin non public

**Objectif :** défense en profondeur — réduire l'exposition de
l'interface admin aux scans automatisés de chemins connus.

**Tâches :**
- [x] Déplacement de l'interface admin vers un chemin non public,
      **jamais committé en clair dans un fichier versionné**, communiqué
      séparément à l'équipe
- [x] Ancien chemin : 404 pur pour tout le monde, y compris un admin
      légitime — ni redirection, ni indice que la route ait existé
- [x] Constante centrale pour le chemin admin (une seule source de vérité,
      plus jamais codé en dur ailleurs)

**Deliverables :**
- Chemin admin non public ✅
- Ancien chemin renvoyant un 404 propre ✅

> ⚠️ Ceci est de l'obscurité, pas le contrôle d'accès réel —
> `is_admin_user()` (SECURITY DEFINER, vérifié côté serveur et via RLS)
> reste l'unique vraie défense, totalement inchangée par ce renommage.

---

### Sprint Modération — Modération des missions

**Objectif :** signalement par les utilisateurs + actions admin
(suspension réversible / suppression définitive), séparées du statut
`missions.status` piloté par l'employeur.

**Tâches :**
- [x] Migration `missions.moderation_status` (`normal`/`suspended`/
      `removed`), indépendant de `missions.status`
- [x] Nouvelle table `mission_reports` (signalement, un par utilisateur et
      par mission, motif + détails optionnels)
- [x] Filtrage `moderation_status = 'normal'` appliqué partout où des
      missions sont listées côté candidat (recherche, missions suggérées,
      tri de priorité Premium du Sprint 4d)
- [x] Blocage serveur des actions employeur (éditer/pause/réactiver) tant
      que `moderation_status != 'normal'` — pas seulement caché côté UI
- [x] Page admin Missions : file de signalements + suspendre/réactiver/
      supprimer, avec blocage de la suppression si candidature `hired`
      (contrat déjà généré) et rejet automatique des candidatures actives
      sinon
- [x] **Correctif RLS trouvé pendant les tests de ce sprint** : deux
      policies héritées du tout premier script de mise en place de la
      base (nommées différemment des policies modernes, donc jamais
      remplacées par les migrations suivantes) neutralisaient
      silencieusement `moderation_status` par appel API direct. Détecté
      par test RLS direct, corrigé, re-vérifié
- [x] **Correctif de suivi** : la liste admin des missions ne montrait que
      les missions `status = 'published'`, rendant invisible (sauf
      signalement préalable) toute mission dans un autre état — complétée
      avec la liste complète, un filtre par statut et une recherche

**Deliverables :**
- Migration `missions.moderation_status` + table `mission_reports` ✅
- Filtrage moderation_status côté candidat (partout) ✅
- Blocage serveur des actions employeur sur mission modérée ✅
- Page admin Missions complète (signalements + actions + liste totale) ✅
- Correctif RLS (policies legacy neutralisant moderation_status) ✅

---

### Phase 4-TER Summary
- **Livrables :** Navigation à onglets + Interface admin + Chemin admin
  non public + Modération des missions (avec correctif RLS)
- **Status :** ✅ Livré

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
| **4** | 9 | 50 | Statut Candidat + Paiements (Stripe Connect) |
| **4-BIS** | +4 sprints | — | Candidature/Visio + Onboarding + Premium (4a-4d) |
| **4-TER** | +4 sprints | — | Navigation + Admin + Renommage + Modération |
| **5** | 10 | 50 | Dashboards + Polish |
| **6** | 11 | 40 | Production + Launch |
| **TOTAL** | **11 + 8 sprints** | **435 +** | **MVP Complet + Phase 4-BIS + Phase 4-TER** |

---

## 🎯 Jalons Clés

```
Fin Semaine 1:    ✅ Environment ready
Fin Semaine 3:    ✅ Auth fonctionnelle + Landing
Fin Semaine 6:    ✅ Core features (Missions + Matching géo + Chat)
Fin Semaine 8:    ✅ Visio + Contrats
Fin Semaine 9:    ✅ Statut Candidat + Paiements (Stripe Connect)
Fin Sprint 4a-4d: ✅ Candidature/Visio + Onboarding + Premium
Fin Sprint 4-TER: ✅ Navigation + Admin + Renommage + Modération
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
  - Intégration Stripe Connect (KYC candidat auto-entrepreneur, prioritaire semaine 9)
  - Performance chat/visio temps réel
  - Responsabilité juridique (CGU, notamment la distinction des deux statuts candidat)

🟡 MEDIUM RISK:
  - LiveKit coûts (prévoir fallback)
  - Onfido KYC temps d'approbation
  - Matching géographique : précision adresse/rayon (formule haversine)

🟢 LOW RISK:
  - Design polish (peut être différé)
  - Emails transactionnels (fallback simple)
```

### Mitigation

```
✅ Stripe Connect: Tester en mode test semaine 8 (avant semaine 9)
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

### Si problème Stripe Connect
```
→ Garder le paiement auto-entrepreneur en "beta" jusqu'à validation
→ Le flux particulier-employeur (CESU externe) n'est pas affecté
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
