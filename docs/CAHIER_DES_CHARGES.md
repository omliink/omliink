# 📋 CAHIER DES CHARGES — OMLIINK

**Plateforme de Service à la Personne entre Particuliers**

*Version 1.0 | Août 2026*

---

## 📚 Table des Matières

1. [Concept & Vision](#concept--vision)
2. [Services Proposés](#services-proposés)
3. [Architecture Technique](#architecture-technique)
4. [Modèle Économique](#modèle-économique)
5. [Système Visio](#système-visio)
6. [Vérification Candidats](#vérification-candidats)
7. [Statut Candidat & Paiement](#statut-candidat--paiement)
8. [Matching Algorithm](#matching-algorithm)
9. [Design System](#design-system)
10. [Contraintes & Règles](#contraintes--règles)

---

## 🎯 Concept & Vision

### Qu'est-ce qu'OMLIINK?

**Plateforme digitale de mise en relation** entre:
- **Particuliers employeurs:** Personnes ayant besoin d'aide à domicile
- **Particuliers candidats:** Étudiants, demandeurs d'emploi, retraités

### Règle Fondamentale

```
⚠️ Aucun professionnel accepté — UNIQUEMENT des particuliers
```

### La Promesse OMLIINK

```
✅ 100% Légal      (contrat généré automatiquement, paiement sécurisé via
                     Stripe Connect pour les auto-entrepreneurs, ou
                     accompagnement vers le CESU officiel pour les
                     particuliers employeurs)
✅ 100% Vérifié    (Casier judiciaire, KYC, attestation)
✅ 100% Confiance  (Visio obligatoire avant mission)
✅ 100% Simple     (Zéro administratif employeur)
```

> Le cadre légal permettant à une plateforme comme OMLIINK d'automatiser
> elle-même la déclaration URSSAF existe, mais n'est qu'en phase pilote
> volontaire depuis avril 2026 (généralisation prévue en 2027). Ce n'est donc
> pas dans le périmètre actuel — voir [Statut Candidat & Paiement](#statut-candidat--paiement).

---

## 🏠 Services Proposés

**15 catégories de services:**

1. 🧹 Ménage / Repassage
2. 🌿 Jardinage
3. 🔧 Bricolage
4. 📦 Déménagement / Manutention
5. 👶 Garde d'enfants
6. 🐾 Garde d'animaux
7. 📚 Cours particuliers
8. 👴 Aide personnes âgées
9. 💻 Aide informatique / numérique
10. 🍳 Aide préparation repas
11. 📬 Courses / Livraison
12. 🚗 Accompagnement véhiculé
13. 🎄 Aide saisonnière
14. 📸 Aide événementielle
15. 🏠 Surveillance domicile

---

## 🏗️ Architecture Technique

### Stack Frontend

```
Next.js 14 (App Router)
React 18 + TypeScript
Tailwind CSS + shadcn/ui
Framer Motion (animations)
React Hook Form + Zod (formulaires)
Zustand + Immer (état)
```

### Stack Backend

```
Supabase (PostgreSQL + Auth + Storage + Realtime)
Stripe Connect (paiements)
LiveKit Cloud (visioconférence WebRTC)
Resend (emails transactionnels)
Mapbox / API Adresse (BAN) (géolocalisation)
```

> Pas d'intégration URSSAF API dans le périmètre actuel — voir
> [Statut Candidat & Paiement](#statut-candidat--paiement). Le générateur de
> contrat de travail (`contracts`) est en revanche déjà implémenté.

### Infrastructure

```
Frontend: Vercel (Next.js + Edge Functions)
Backend: Supabase Cloud (PostgreSQL + services)
Domaine: omliink.fr + SSL
```

---

## 💰 Modèle Économique

Décision prise après comparaison explicite avec **Yoopies** (leader du
marché) : privilégier l'acquisition et le volume de missions publiées
plutôt que la monétisation immédiate de chaque geste, et concentrer le
seul revenu transactionnel actif sur le flux où OMLIINK gère réellement
l'argent.

### Phase actuelle (MVP)

**Publication de mission — Gratuite**
- Aucune limite de missions/mois, aucune friction, aucun palier payant à
  l'entrée
- Choix délibéré : maximiser le volume de missions publiées plutôt que de
  monétiser ce geste dès le lancement

**Commission — 10%, sur le seul flux `auto_entrepreneur`**
- Prélevée uniquement sur les missions où le candidat a le statut
  `auto_entrepreneur` — c'est le **seul revenu transactionnel actif** au
  lancement (paiement via Stripe Connect, déjà en cours de construction —
  voir [Statut Candidat & Paiement](#statut-candidat--paiement))
- Côté employeur (montant facturé, la commission est retenue sur le
  reversement au candidat)
- À chaque mission validée

**Statut `particulier_employeur` — zéro revenu direct**
- Contrat de travail généré gratuitement, paiement intégralement hors
  plateforme via le CESU officiel
- Ce n'est pas un oubli : c'est un choix stratégique délibéré pour
  maximiser l'adoption de ce statut, qui reste malgré tout le cas d'usage
  le plus proche du besoin réel de nombreux employeurs (emploi déclaré
  classique)

### Roadmap monétisation future (hors scope du sprint actuel)

À explorer une fois qu'on aura du recul sur l'usage réel — volume de
missions, taux de conversion candidat `auto_entrepreneur` vs
`particulier_employeur`. Rien ci-dessous n'est engagé ou construit
aujourd'hui.

**Options premium employeur** (inspiré du modèle Yoopies : *"Options
premium payantes — Mise en avant des annonces, Contacts illimités, Accès
aux numéros de téléphone"*)
- Mise en avant d'annonce
- Accès prioritaire ou illimité aux profils candidats
- Contacts illimités

**Abonnement mensuel employeur** (usage récurrent)
- À évaluer séparément — nécessite un produit Stripe différent (**Stripe
  Billing / Subscriptions**, distinct de **Stripe Connect** utilisé pour la
  commission auto-entrepreneur)
- Volontairement non mélangé avec le sprint paiement actuel pour éviter
  d'ajouter de la complexité avant d'avoir validé le flux de base

**Autres leviers non engagés**
- Boost de visibilité candidat dans le matching
- Partenariats (CE / CESU préfinancés, assurances responsabilité civile,
  formations professionnelles)

**Objectif affiché** : faire au moins aussi bien que Yoopies sur
l'acquisition (gratuité d'entrée), tout en gardant plusieurs leviers de
revenus futurs ouverts et non engagés prématurément.

> ⚠️ Ce choix de monétisation sera réévalué à la lumière de données d'usage
> réelles (volume de missions publiées, taux de conversion
> `auto_entrepreneur` vs `particulier_employeur`) plutôt que figé
> définitivement maintenant.

### Projection Financière — vision long terme (pas la réalité du MVP actuel)

Cette projection suppose un modèle plus mature (options premium employeur
+ abonnement en place) et **ne reflète pas** le MVP actuel, où seul le
flux `auto_entrepreneur` génère de la commission — le reste (missions
`particulier_employeur`, publication) est gratuit par choix.

```
Commissions (10%, hypothèse: toutes missions payantes): 5 000€/mois
Abonnements Premium (hypothèse future):                 1 980€/mois
Boosts / options premium (hypothèse future):             1 196€/mois
─────────────────────────────────────────────────────────────────
TOTAL REVENU (vision long terme):                       ~8 176€/mois

Coûts opérationnels:                                       ~150€/mois
─────────────────────────────────────────────────────────────────
MARGE BRUTE:                                                95%+ ✅
```

### Seuil de rentabilité — même mise en garde

```
100 missions/mois × 50€ × 10% = 500€/mois (si 100% des missions étaient
commissionnables — hypothèse long terme, pas la réalité MVP où seule la
part auto-entrepreneur l'est)
Coûts: 150€
```

---

## 📹 Système Visioconférence

### Flux Complet

**ÉTAPE 1 — Proposition**
- Une partie propose 3 créneaux
- Notification push + email + message système

**ÉTAPE 2 — Confirmation**
- L'autre choisit ou contre-propose
- Update statut meeting

**ÉTAPE 3 — Rappels Automatiques**
- J-1: Email + notification
- H-1: Push notification
- M-15: "Rejoindre" devient actif
- M-5: "Visio commence dans 5 min"

**ÉTAPE 4 — La Visio (LiveKit)**
- Pre-join screen (test cam/micro)
- Vidéo HD 2 participants
- Chat intégré
- Partage écran
- Enregistrement (consentement mutuel)
- Durée max forcée automatiquement

**ÉTAPE 5 — Après Visio**
- Feedback structuré (impression, critères)
- Actions: Accepter / Refuser / Re-planifier
- Signalement si problème

### Durées par Service

```
15 min (défaut):  Ménage, Jardinage, Courses, Accompagnement
30 min (recommandé): Garde enfants, Garde animaux, Personnes âgées, Bricolage
30 min (requis):  Cours particuliers (besoin discussion)
```

### Enregistrement & Consentement

```
- Optionnel (consentement explicite des 2 parties)
- Stockage: Supabase Storage (visio-recordings bucket)
- Auto-suppression après 7 jours
- Droit à l'oubli immédiat si refus
```

---

## 🔐 Vérification Candidats

### Tunnel Complet (5 Étapes)

**ÉTAPE 1 — Basic**
- Email + Téléphone (SMS OTP)
- Niveau: BASIC (peut naviguer, pas candidater)

**ÉTAPE 2 — Identité (KYC)**
- CNI/Passeport + Selfie liveness
- Vérification Onfido/Jumio (24-48h)

**ÉTAPE 3 — Casier Judiciaire**
- Bulletin n°3 (< 3 mois, rappel 30j avant exp.)
- Obligatoire pour: garde enfants, personnes âgées, accès domicile

**ÉTAPE 4 — Attestation sur l'Honneur**
- Signature électronique
- PDF archivé

**ÉTAPE 5 — Profil Complet**
- Services + Tarifs + Disponibilités + Zone km
- Niveau: VERIFIED (peut candidater)

**BONUS — Premium (Automatique)**
- 10+ missions complétées
- Note > 4.5/5
- Fiabilité > 95%
- 3+ visios bien notées
- Badge PREMIUM + priorité matching

### Règles Strictes

```
✅ Pas candidature sans BASIC (email + phone)
✅ Pas contrat sans VERIFIED (tous 5 niveaux)
✅ Casier obligatoire pour: garde enfants, personnes âgées, accès domicile
✅ Attestation valide max 2 ans
```

---

## 🤝 Statut Candidat & Paiement

Décision prise après recherche du cadre légal français et comparaison avec
Yoopies (leader du marché) : un candidat porte un champ `employment_status`
sur `candidate_profiles` — **une seule table**, pas deux profils séparés. Les
deux statuts partagent exactement la même mécanique de candidature, de visio
et de contrat ; seul le mode de paiement final diffère.

### `particulier_employeur` — emploi déclaré classique

```
✅ L'employeur (la famille) reste l'employeur légal
❌ OMLIINK ne devient PAS l'employeur
❌ OMLIINK ne gère PAS la déclaration URSSAF à sa place
✅ OMLIINK fournit un générateur de contrat de travail (table `contracts`,
   déjà implémenté)
✅ Salaire et cotisations gérés par l'employeur via le CESU officiel,
   entièrement en dehors d'OMLIINK
❌ OMLIINK ne touche pas cet argent → pas de commission sur ce flux
```

### `auto_entrepreneur` — prestation indépendante

```
✅ Le candidat facture ses prestations comme travailleur indépendant
✅ L'employeur devient son client
✅ Paiement via Stripe Connect (marketplace standard) :
   OMLIINK encaisse → prend sa commission (10%) → reverse le solde
✅ SEUL cas où OMLIINK gère un flux de paiement réel
```

### Recherche & visibilité : statut neutre

```
✅ Un employeur voit tous les candidats (des deux statuts) sur ses missions
✅ Un candidat, quel que soit son statut, voit toutes les missions publiées
✅ Le statut n'est affiché que comme information sur le profil
✅ Il détermine uniquement le mode de paiement en fin de cycle (Sprint futur)
```

### Roadmap : automatisation URSSAF

Le cadre légal permettant à une plateforme de déclarer elle-même les heures
à l'URSSAF pour le compte de l'employeur existe, mais n'est qu'en phase
pilote volontaire depuis avril 2026 — généralisation prévue en 2027. OMLIINK
pourra évoluer vers ce modèle plus tard ; c'est **hors périmètre actuel**.

---

## 🧠 Matching Algorithm

> **Scope du prochain sprint (matching géographique) :** tri/filtre simple
> des missions par distance, calculée par formule haversine (SQL ou
> applicatif — pas besoin de PostGIS à ce volume). Pas de score
> multi-critères pour l'instant. Voir
> [ARCHITECTURE_DATABASE.md](./ARCHITECTURE_DATABASE.md) pour les champs
> `location_lat`/`location_lng`/`radius_km` à ajouter à `candidate_profiles`.
> Le score complet ci-dessous reste la **vision cible à terme**, une fois
> assez de données réelles d'usage accumulées (disponibilité, réputation,
> fiabilité, etc.) pour le rendre pertinent.

### Formule Complète (vision cible — pas encore implémentée)

```
Score =
  Distance         (25%) +
  Disponibilité    (25%) +
  Réputation       (20%) +
  Fiabilité        (15%) +
  Vérification     (10%) +
  Visio            (5%) +
  Bonus/Malus
```

### Critères Détaillés

| Critère | Excellent | Bon | Moyen | Faible |
|---------|-----------|-----|-------|--------|
| **Distance** | <2km (100) | 2-5km (80) | 5-10km (60) | >zone (0) |
| **Dispo** | Parfaite (100) | Partielle (50) | Flexible (70) | Aucune (0) |
| **Réput** | 4.5+ (100) | 4.0+ (80) | 3.5+ (60) | Nouveau (50) |
| **Fiabilité** | 95%+ (100) | 85%+ (70) | 75%+ (40) | <75% (0) |
| **Vérif** | Premium (100) | Verified (70) | Basic (30) | None (0) |
| **Visio** | 5+ (100) | 1-4 (60) | Aucune (30) | - |

### Bonus & Malus

```
+15 pts: Déjà travaillé ensemble
+10 pts: Taux réponse > 90%
+10 pts: Visio positive ensemble
-5 pts:  Annulation récente
-10 pts: No-show visio
-20 pts: Signalement en cours
```

### Retour

```
Top 10 candidats retournés à l'employeur
Triés par score décroissant
Affichage détails du matching
```

---

## 🎨 Design System

### Logo
```
"omliink" — Typo épaisse, ronde, rassurante
Les deux "ii" = dégradé Indigo → Coral
Symbolisme: deux personnes face à face (concept visio)
```

### Couleurs

```
Indigo:    #6366f1 (confiance, tech, sérieux)
Coral:     #ff5a3d (chaleur, humain, proximité)
Succès:    #10b981 (Emerald)
Attention: #f59e0b (Amber)
Danger:    #ef4444 (Red)
```

### Typographie

```
Titres:    Geist Sans Bold/Black
Corps:     Geist Sans Regular/Medium
Monospace: Geist Mono
```

### Composants

- Radius: 0.75rem (rounded-xl)
- Ombres: douces, élégantes
- Animations: Framer Motion fluides
- Dark mode: natif

---

## ⚠️ Contraintes & Règles

### Légales

```
✅ Cadre légal respecté selon le statut du candidat : contrat de travail
   généré automatiquement (les deux statuts), paiement via le CESU officiel
   hors OMLIINK (particulier employeur) ou via Stripe Connect (auto-
   entrepreneur) — voir Statut Candidat & Paiement
✅ KYC obligatoire (Know Your Customer)
✅ Casier judiciaire (certains services)
✅ Conformité RGPD (données utilisateurs)
✅ Conditions d'utilisation claires
```

### Techniques

```
✅ RLS (Row Level Security) sur toutes tables
✅ Chiffrement données sensibles
✅ Backup automatiques Supabase
✅ Monitoring Sentry + Vercel Analytics
✅ CDN pour assets (Vercel)
```

### Fonctionnelles

```
✅ Pas de double-booking (missions)
✅ Pas de candidats pros (validation stricte)
✅ Visio obligatoire avant mission
✅ Rating après mission (rétroaction)
✅ Recours signalement (modération)
```

---

## 🎯 Différenciation vs Concurrents

| Aspect | OMLIINK | Leboncoin | TaskRabbit | Yoopies |
|--------|---------|-----------|-----------|---------|
| **Visio intégrée** | ✅ Obligatoire | ❌ Non | ✅ Optionnel | ❌ Non |
| **Paiement légal** | ✅ Contrat auto + Stripe Connect (auto-entrepreneur) ou CESU (particulier employeur) | ❌ Non | ❌ Non | ✅ Partiel |
| **Particuliers only** | ✅ Strict | ❌ Mélangé | ❌ Pros acceptés | ❌ Pros |
| **Vérification** | ✅ Stricte | ❌ Minimal | ✅ KYC | ✅ KYC |
| **Matching géo** | 🔜 Distance (à venir) | ❌ Non | ❌ Simple | ❌ Simple |
| **Marché** | 🇫🇷 France | 🇫🇷 France | 🌍 Global | 🇫🇷 France |

---

## 📊 KPIs Clés

**Suivi de succès:**

```
Côté Employeur:
  - Missions créées/mois
  - Employeurs actifs
  - TAM (Hauts-de-France initiale)

Côté Candidat:
  - Candidats actifs
  - Missions complétées
  - Revenus totaux générés

Plateforme:
  - Commission mensuelle
  - Churn rate
  - NPS (Net Promoter Score)
  - Session time
```

---

## ✅ Checklist Lancement

**Avant Production:**

- [ ] Database production validée
- [ ] Migrations Supabase appliquées
- [ ] Edge Functions déployées
- [ ] Stripe Connect production live (statut auto-entrepreneur)
- [ ] Générateur de contrat testé pour les deux statuts candidat
- [ ] LiveKit production testée
- [ ] Emails transactionnels testés
- [ ] Mapbox production configuré
- [ ] SEO métadonnées OK
- [ ] Dark mode complet
- [ ] Mobile responsive (375px→1280px)
- [ ] Lighthouse > 90
- [ ] Security checklist complétée
- [ ] Backup/Disaster recovery testés

---

**Version actuelle:** 1.0  
**Dernière mise à jour:** Août 2026  
**Statut:** Prêt pour développement

Pour développer: Voir **SPRINTS.md** pour le détail des tâches.
