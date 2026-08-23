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
7. [Intégration URSSAF](#intégration-urssaf)
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
✅ 100% Légal & Déclaré          (URSSAF automatique)
✅ 100% Vérifié                  (Casier judiciaire, KYC, attestation)
✅ 100% Confiance                (Visio obligatoire avant mission)
✅ 100% Simple                   (Zéro administratif employeur)
```

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
Mapbox (géolocalisation)
URSSAF API (déclarations légales)
```

### Infrastructure

```
Frontend: Vercel (Next.js + Edge Functions)
Backend: Supabase Cloud (PostgreSQL + services)
Domaine: omliink.fr + SSL
```

---

## 💰 Modèle Économique

### Revenus

**Commission (Principal) — 10%**
- Côté employeur uniquement
- À chaque mission validée
- Possible réduction partenariats

**Abonnement Premium Employeur — 9,90€/mois**
- Gratuit: 3 missions/mois, commission 12%
- Premium: illimité, commission 8%, visios 30min

**Boosts Visibilité Candidat — 2,99€/semaine**
- Apparaître en tête du matching

**Partenariats**
- CE (CESU préfinancés)
- Assurances responsabilité civile
- Formations professionnelles

### Projection Financière (1000 missions/mois à 50€ moyen)

```
Commissions (10%):      5 000€/mois
Abonnements Premium:    1 980€/mois
Boosts Candidat:        1 196€/mois
─────────────────────────────────────
TOTAL REVENU:          ~8 176€/mois

Coûts opérationnels:    ~150€/mois
─────────────────────────────────────
MARGE BRUTE:           95%+ ✅
```

### Seuil Rentabilité

```
100 missions/mois × 50€ × 10% = 500€/mois
Coûts: 150€
→ Profitable à 100 missions/mois (très bas)
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

## 🤝 Intégration URSSAF

### Automatisations

```
✅ Inscription CESU de l'employeur
✅ Déclaration heures après confirmation
✅ Calcul charges (patronales + salariales)
✅ Génération bulletin paie PDF
✅ Dispatch paiement (net candidat + charges URSSAF)
✅ Attestation crédit impôt (50% dépenses)
✅ Récapitulatif fiscal annuel
```

### Simulateur Temps Réel

```
Tarif horaire:              13,00 €
Durée:                       3 heures
Salaire brut:               39,00 €
Charges patronales:         15,60 €
Commission OMLIINK:          3,90 € (10%)
──────────────────────────────────────
Coût total:                 58,50 €
Crédit impôt:              -29,25 € (50%)
Coût réel:                  29,25 €
Candidat reçoit:            30,42 € net
```

### Plafonds & Limites

```
Crédit impôt: 12 000€/an max
Commission: 10% (variable par partenaire)
Taux CESU: Variable (via API URSSAF)
Seuil déclaration: À partir 1ère heure
```

---

## 🧠 Matching Algorithm

### Formule Complète

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
✅ 100% URSSAF déclaré (zéro travail noir)
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
| **URSSAF auto** | ✅ API | ❌ Non | ❌ Non | ✅ Partiel |
| **Particuliers only** | ✅ Strict | ❌ Mélangé | ❌ Pros acceptés | ❌ Pros |
| **Vérification** | ✅ Stricte | ❌ Minimal | ✅ KYC | ✅ KYC |
| **Matching algo** | ✅ IA | ❌ Non | ❌ Simple | ❌ Simple |
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
- [ ] Stripe production live
- [ ] URSSAF production testée
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
