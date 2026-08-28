# 📋 CAHIER DES CHARGES — OMLIINK

**Plateforme de Service à la Personne entre Particuliers**

*Version 1.0 | Août 2026*

---

## 📚 Table des Matières

1. [Concept & Vision](#concept--vision)
2. [Services Proposés](#services-proposés)
3. [Architecture Technique](#architecture-technique)
4. [Modèle Économique](#modèle-économique)
5. [Workflow Candidature & Visio](#workflow-candidature--visio)
6. [Onboarding Candidat](#onboarding-candidat)
7. [Onboarding Employeur & Gestion des Missions](#onboarding-employeur--gestion-des-missions)
8. [Mon Compte (Gestion Profil)](#mon-compte-gestion-profil)
9. [Vérification Candidats](#vérification-candidats)
10. [Modération & Interface Admin](#modération--interface-admin)
11. [Statut Candidat & Paiement](#statut-candidat--paiement)
12. [Matching Algorithm](#matching-algorithm)
13. [Design System](#design-system)
14. [Contraintes & Règles](#contraintes--règles)
15. [Ce Qui Est Explicitement Écarté](#ce-qui-est-explicitement-écarté)

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

### Sprint 4d — Abonnement Premium employeur (livré)

Décision : passer d'un modèle purement transactionnel à un modèle
**hybride** — la commission 10% reste le revenu principal, l'abonnement
Premium devient un revenu secondaire, livré et testé (Sprint 4d), pas une
simple piste future.

**Abonnement Premium — 10€/mois fixe**
- Missions actives illimitées en simultané (**gratuit : limité à 1-2
  missions actives**)
- Mise en avant / priorité dans le matching candidat
- Accompagnement URSSAF (déclaration, CESU/Pajemploi) — **manuel pour
  l'instant**, assuré par l'équipe OMLIINK sur demande. **Pas d'intégration
  API automatisée à ce stade** (roadmap future distincte, voir
  [Statut Candidat & Paiement](#statut-candidat--paiement) sur le pilote
  URSSAF plateformes)
- Système de **codes promo** réutilisables pour campagnes marketing
  (`promo_codes` : code, type de remise, valeur, validité, plafond
  d'utilisations — voir ARCHITECTURE_DATABASE.md)

> ⚠️ Le Premium ne donne **jamais** accès à un contact direct libre des
> candidats ni à un profil-vitrine public — voir
> [Ce Qui Est Explicitement Écarté](#ce-qui-est-explicitement-écarté). Les
> seuls bénéfices sont : volume de missions, priorité de matching,
> accompagnement URSSAF manuel, codes promo.

**Infrastructure de paiement — deux flux Stripe distincts**
```
Stripe Checkout  → paiement ponctuel de mission (auto-entrepreneur, déjà
                    en place, Sprint Stripe Connect)
Stripe Subscriptions (Billing) → abonnement Premium récurrent (nouveau,
                    Sprint 4d)
                    Webhooks : invoice.paid,
                               customer.subscription.updated,
                               customer.subscription.deleted
```
Les deux flux sont volontairement séparés : le Checkout à usage unique
gère le paiement de mission avec `application_fee_amount` + `transfer_data`
vers le compte Connect du candidat ; les Subscriptions gèrent uniquement la
relation d'abonnement employeur ↔ OMLIINK (pas de split, pas de compte
Connect impliqué).

### Roadmap monétisation future (hors scope, au-delà de Sprint 4d)

À explorer une fois qu'on aura du recul sur l'usage réel — volume de
missions, taux de conversion candidat `auto_entrepreneur` vs
`particulier_employeur`, taux de conversion Premium. Rien ci-dessous n'est
engagé ou construit à ce stade.

**Autres leviers non engagés**
- Boost de visibilité candidat dans le matching (distinct de la priorité
  de matching déjà incluse dans le Premium employeur ci-dessus)
- Partenariats (CE / CESU préfinancés, assurances responsabilité civile,
  formations professionnelles)
- Intégration URSSAF/CESU API automatisée (voir
  [Ce Qui Est Explicitement Écarté](#ce-qui-est-explicitement-écarté))

**Objectif affiché** : faire au moins aussi bien que Yoopies sur
l'acquisition (gratuité d'entrée pour la publication de mission), tout en
gardant plusieurs leviers de revenus futurs ouverts et non engagés
prématurément.

> ⚠️ Ce choix de monétisation sera réévalué à la lumière de données d'usage
> réelles (volume de missions publiées, taux de conversion
> `auto_entrepreneur` vs `particulier_employeur`, adoption du Premium)
> plutôt que figé définitivement maintenant.

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

## 📋 Workflow Candidature & Visio

Décision Sprint 4a : passage d'un modèle "un clic accepte/rejette" à un
véritable processus d'entretien. Plusieurs candidats peuvent être en
entretien (visio) en parallèle sur une même mission avant toute décision
finale.

### Statuts `applications.status`

```
pending       → candidature envoyée, pas encore d'entretien programmé
interviewing  → au moins une visio programmée ou réalisée avec ce candidat
                (plusieurs candidatures peuvent être 'interviewing' EN
                MÊME TEMPS sur une même mission — plusieurs entretiens
                possibles avant décision)
hired         → candidat retenu pour la mission (un seul par mission)
rejected      → candidat non retenu (manuel, ou automatique dès qu'un
                autre candidat passe à 'hired')
```

> ⚠️ Remplace l'ancien statut `accepted`. Voir
> [ARCHITECTURE_DATABASE.md](./ARCHITECTURE_DATABASE.md) pour la migration
> de réécriture des valeurs existantes.

### Règle sur le statut de la mission

```
✅ La mission reste 'published' tant qu'aucun candidat n'est 'hired'
✅ Plusieurs entretiens (visio) peuvent avoir lieu en parallèle, avec des
   candidats différents, avant toute décision
✅ La mission ne passe à 'assigned' qu'au moment de l'embauche effective
✅ La mission peut aussi être mise en 'paused' par l'employeur à tout
   moment avant embauche — voir Onboarding Employeur & Gestion des Missions
```

### Nouvel onglet employeur — "Entretiens"

Liste tous les candidats actuellement `interviewing` sur la mission (visio
programmée ou déjà réalisée), avec accès à leur profil complet et à
l'historique de la visio.

**Action "Choisir ce candidat"** (déclenchée depuis cet onglet) :
```
1. Cette candidature       → 'hired'
2. Toutes les autres       → 'rejected' (automatique)
3. Génération du contrat   → table `contracts` (mécanique déjà existante)
4. Mission                 → 'assigned'
```

### Flux Visio Complet

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

## 🧩 Onboarding Candidat

Décision Sprint 4b : wizard d'inscription en **9 étapes** (8 étapes de
saisie dans l'interface wizard + une 9ème étape "Missions suggérées"),
adapté au modèle **mission-first** d'OMLIINK — pas de profil-vitrine public
contactable librement (voir
[Ce Qui Est Explicitement Écarté](#ce-qui-est-explicitement-écarté)). Le
profil enrichi sert à candidater efficacement et à être présenté à
l'employeur une fois qu'une candidature/visio est en cours — jamais comme
une annonce indépendante consultable par n'importe qui.

> **Note d'implémentation (Sprint 4b)** : l'étape 9 (missions suggérées) ne
> s'affiche pas dans le shell du wizard lui-même. La création du compte
> (étapes 1-8) et de son profil se termine par une redirection complète vers
> `/dashboard?onboarded=1`, où la 9ème étape apparaît comme un bandeau
> "Missions suggérées" en tête du tableau de bord. Raison technique : la
> route du wizard (`/dashboard/onboarding`) partage son layout avec
> `/dashboard`, qui redirige hors de l'onboarding dès qu'un profil candidat
> existe — un problème rencontré lors des tests de ce sprint, où toute
> action serveur (y compris "Candidater" depuis l'étape 9) déclenchait cette
> redirection avant que l'écran ne puisse s'afficher. Le résultat perçu par
> le candidat reste le même (inscription → présentation immédiate de
> missions pertinentes → candidature en un clic), seul l'écran qui l'affiche
> a changé.

### Les 9 Étapes

**ÉTAPE 1 — À propos de vous**
- Sexe, prénom, nom
- Adresse via autocomplete BAN (même composant que missions —
  `location_lat`/`location_lng`, voir Matching Algorithm)

**ÉTAPE 2 — Plus d'informations**
- Date et lieu de naissance
- Langue(s) parlée(s) — langue natale + langues additionnelles
- Téléphone + réglage de visibilité (visible ou masqué selon le profil)

**ÉTAPE 3 — Photo — OBLIGATOIRE**
```
⚠️ Bloquant : pas de bouton "ignorer cette étape"
```

**ÉTAPE 4 — Types de services**
- Cases à cocher multi-select sur les 15 catégories existantes (voir
  [Services Proposés](#services-proposés))

**ÉTAPE 5 — Suppléments**
- Premiers secours (certification)
- Motorisé (véhicule personnel)
- Permis de conduire
- Disponibilité immédiate

**ÉTAPE 6 — Expérience et tarif**
- Niveau d'expérience (débutant / 1-3 ans / 3-5 ans / 5 ans et plus)
- Tarif horaire
- Mention légale conditionnelle selon le statut (voir
  [Statut Candidat & Paiement](#statut-candidat--paiement)) :
  - `particulier_employeur` : mention CESU / emploi déclaré classique
  - `auto_entrepreneur` : mention Stripe Connect + commission OMLIINK 10%

**ÉTAPE 7 — Compétences**
- Taxonomie de tags **spécifique à chaque catégorie de service**
  sélectionnée à l'étape 4 (voir [Annexe — Référentiel de compétences par
  catégorie](#annexe--référentiel-de-compétences-par-catégorie) ci-dessous)

**ÉTAPE 8 — Bio / présentation**
- Titre court + texte libre
- Enrichit le profil affiché lors d'une candidature — ce n'est **pas** une
  annonce publique indépendante

**ÉTAPE 9 — Missions suggérées** (bandeau sur `/dashboard`, voir note
d'implémentation ci-dessus)
- Pré-matching géographique immédiat juste après l'inscription (tri par
  distance à l'adresse renseignée à l'étape 1, dans le `radius_km` par
  défaut — voir [Matching Algorithm](#matching-algorithm))

### Annexe — Référentiel de compétences par catégorie

Utilisé à l'étape 7 du wizard candidat, et repris côté employeur pour le
sous-typage du besoin (voir
[Onboarding Employeur](#onboarding-employeur--gestion-des-missions)).

Table alignée sur le seed réel exécuté en base (`skill_taxonomy`, 71 tags,
migration `20260829010000_sprint4b_skill_taxonomy_seed.sql`) — remplace la
liste précédente, qui datait d'une passe documentaire antérieure et ne
correspondait plus exactement aux tags livrés.

| Catégorie | Tags |
|---|---|
| 🧹 Ménage | Repassage, Cuisine/préparation repas, Rangement, Vitres, Nettoyage sols, Produits écologiques |
| 🌿 Jardinage | Tonte, Taille de haies, Entretien massifs, Désherbage, Arrosage, Petit élagage |
| 🔧 Bricolage | Petits travaux électriques, Plomberie de base, Montage meubles, Peinture, Pose d'étagères |
| 📦 Déménagement | Port de charges lourdes, Emballage/cartons, Démontage/remontage meubles, Permis B |
| 👶 Garde d'enfants | Nouveau-nés, Tout-petits, Âge préscolaire, Âge scolaire, Aide aux devoirs, Activités/Montessori, Premiers secours |
| 🐾 Garde d'animaux | Chiens, Chats, NAC, Promenade, Administration médicaments, Toilettage de base |
| 📚 Cours particuliers | Primaire, Collège, Lycée, Soutien méthodologie, Langues, Matières scientifiques |
| 👴 Aide personnes âgées | Aide à la toilette, Aide au repas, Accompagnement sorties, Stimulation cognitive, Premiers secours |
| 💻 Aide informatique | Initiation smartphone, Configuration ordinateur, Démarches en ligne, Dépannage de base |
| 🍳 Préparation repas | Cuisine traditionnelle, Régimes spécifiques, Batch cooking, Pâtisserie |
| 📬 Courses / Livraison | Motorisé, Grandes surfaces, Marchés, Pharmacie |
| 🚗 Accompagnement véhiculé | Permis de conduire, Véhicule personnel, Trajets médicaux, Trajets scolaires |
| 🎄 Aide saisonnière | Déneigement, Entretien extérieur hiver, Décorations saisonnières |
| 📸 Aide événementielle | Service à table, Aide logistique, Garde d'enfants en événement |
| 🏠 Surveillance domicile | Arrosage plantes, Relève courrier, Rondes de sécurité, Alimentation animaux |

---

## 👔 Onboarding Employeur & Gestion des Missions

Décision Sprint 4c : enrichissement du parcours employeur et de la gestion
du cycle de vie des missions.

### Étapes enrichies (inscription / création mission)

**À propos de vous**
- Informations existantes **+ nationalité**

**Mes besoins** (étape intégrée au formulaire de création/édition de
mission plutôt qu'à l'onboarding employeur lui-même — cohérent avec le
fait que `mission_needs` est rattaché à une mission qui doit déjà exister)
- Sous-typage du besoin par catégorie de service, affiché dès que la
  catégorie est choisie — même mécanique conditionnelle que les
  compétences candidat du Sprint 4b, mais **référentiel séparé**
  (`mission_need_taxonomy`, 52 tags) plutôt que la réutilisation de
  `skill_taxonomy` envisagée initialement ici : les deux vocabulaires
  diffèrent (besoin employeur — "Auxiliaire de vie" — vs compétence
  candidat — "Aide à la toilette"), voir ARCHITECTURE_DATABASE.md.

**Votre mission**
- Titre : 10 à 60 caractères
- Description : 30 à 2000 caractères

**Photo**
- Optionnelle, avec bouton "Ignorer pour l'instant" — étape ajoutée après
  coup au Sprint 4c (analysée dans le scénario Yoopies mais absente du
  prompt initial du sprint). Réutilise le pattern d'upload du candidat
  (Sprint 4b) : bucket Storage dédié `employer-photos`, policies
  insert/update/delete restreintes au dossier `{auth.uid()}/…`, pas
  d'`upsert:true` (leçon retenue du bug Sprint 4b). Contrairement au
  candidat, le champ `employer_profiles.photo_url` est nullable — rien
  n'oblige l'employeur à en fournir une. Affichée côté candidat ("Publié
  par [Nom]") sur la page de détail mission dès que celle-ci est publiée.

### Gestion des missions (cycle de vie)

```
Actions disponibles sur une mission publiée :
✅ Voir
✅ Éditer
✅ Mettre en pause   → statut 'paused' (nouveau, voir ARCHITECTURE_DATABASE.md)
✅ Réactiver         → retour à 'published'
```

### Suggestions de candidats compatibles

Après publication d'une mission, l'employeur voit des candidats
compatibles (matching géographique + types de services) avec une
**invitation à candidater** — jamais un contact direct libre (voir
[Ce Qui Est Explicitement Écarté](#ce-qui-est-explicitement-écarté)).

### Nouvel onglet — "Mes intervenants"

Historique des candidats passés `hired` (voir
[Workflow Candidature & Visio](#workflow-candidature--visio)), distinct
des candidatures en cours. Permet de retrouver rapidement quelqu'un avec
qui l'employeur a déjà travaillé pour une nouvelle mission.

### Fonctionnalités transverses candidat (à documenter également)

```
✅ Vérification de profil : badge, upload pièce d'identité, revue
   manuelle (pas d'automatisation à ce stade)
✅ Agenda : vue des visios et missions à venir
✅ Onglets candidatures : "En attente" / "Historique"
```

---

## ⚙️ Mon Compte (Gestion Profil)

Décision Sprint 5b : refonte de `/dashboard/profile` en blocs
indépendamment modifiables (pattern Yoopies), remplaçant l'ancien
formulaire monolithique à bouton "Enregistrer" unique.

- Chaque bloc (Photo, Informations, Statut, Services et compétences,
  Expérience et tarif, Bio, Mot de passe, Stripe Connect…) a sa propre
  bascule lecture/édition et sa propre Server Action indépendante — la
  sauvegarde d'un bloc ne touche jamais les autres.
- Étape Photo restylée façon wizard onboarding (cadre carré + bouton "+"
  en overlay + liste de bénéfices), réutilisant les buckets Storage et la
  règle "pas d'`upsert:true`" déjà en place depuis le Sprint 4b.
- **Mot de passe** : capacité de changement ajoutée (n'existait nulle
  part avant ce sprint — le lien "mot de passe oublié" du login pointait
  vers une route jamais construite), partagée à l'identique entre
  candidat et employeur.
- Les blocs candidat "Services et compétences" / "Expérience et tarif" /
  "Bio" éditent désormais les champs du wizard Sprint 4b
  (`bio_title`/`bio_text`, `experience_level`, `candidate_skills`…) —
  les anciens champs `candidate_profiles.bio` / `skills` /
  `years_experience` (pré-4b) restent en base à ce stade, non supprimés,
  mais ne sont plus édités nulle part. **Mise à jour 2026-09-02** : ces
  trois champs ont été supprimés (voir ARCHITECTURE_DATABASE.md,
  "Champs retirés — nettoyage legacy") après vérification qu'un seul
  usage réel restait (`CandidateProfileReveal.tsx`, corrigé pour lire les
  champs modernes) et backfill de `bio` vers `bio_text` pour les 3 comptes
  de test qui en dépendaient encore.
- Bloc "Mes informations" employeur limité à nom/société, nationalité,
  téléphone : `employer_profiles` n'a pas de colonne adresse (seul
  `candidate_profiles` en a une) — ajout volontairement écarté plutôt que
  migré, l'adresse employeur n'étant pas un besoin établi de ce sprint.

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

## 🛡️ Modération & Interface Admin

Décision post-MVP (sprint admin, puis sprint modération des missions) : une
interface d'administration existe, réservée à l'équipe OMLIINK — de la
modération **manuelle**, pas automatique, exercée par un rôle admin humain.

### Rôle admin

```
profiles.is_admin (boolean, défaut false)
```
- Jamais modifiable par l'application — aucun formulaire, aucune Server
  Action n'écrit cette colonne. Seule voie : une requête SQL manuelle en
  base (SQL Editor Supabase), exécutée par l'équipe.
- Vérifié via `is_admin_user()` (fonction SECURITY DEFINER), réutilisée par
  toutes les policies RLS admin plutôt que dupliquée table par table.
- Côté application, `requireAdminUser()` revérifie ce rôle depuis la base à
  chaque appel (jamais mis en cache, jamais fait confiance à un état
  client) — chaque page et chaque Server Action admin repasse par cette
  vérification indépendamment.

### Chemin d'accès

L'interface admin vit sur un chemin **non public, communiqué séparément,
jamais committé dans un fichier versionné** — mesure de défense en
profondeur (obscurité), distincte et indépendante du vrai contrôle d'accès
(`is_admin_user()` + RLS). L'ancien chemin d'origine renvoie désormais un
404 pur pour tout le monde, y compris un admin légitime — ni redirection,
ni indice que la route ait jamais existé ailleurs.

### Les 5 pages

1. **Tableau de bord** — compteurs (vérifications en attente, demandes
   CESU/Pajemploi en attente, codes promo actifs)
2. **Vérifications** — revue des documents d'identité candidat (URL
   signée, 5 minutes, sur le bucket privé `verification-documents`),
   approbation/rejet avec motif, notification au candidat
3. **Codes promo** — création, désactivation (`active = false`, jamais de
   suppression pour garder `promo_code_redemptions` cohérent)
4. **CESU / Pajemploi** — marquage "connecté" une fois qu'une demande a été
   traitée manuellement par l'équipe hors application (voir
   [Statut Candidat & Paiement](#statut-candidat--paiement) — aucune
   donnée bancaire n'y transite, décision Sprint 5c)
5. **Missions** — modération : file des missions signalées (motif, nombre,
   lien direct) en tête de liste, puis la liste complète de toutes les
   missions tous statuts confondus (recherche par titre/employeur, filtre
   par statut). Actions : suspendre / réactiver / supprimer définitivement,
   réservées à l'admin et totalement indépendantes du statut
   `missions.status` piloté par l'employeur (voir ci-dessous)

### Modération des missions

```
missions.moderation_status : 'normal' | 'suspended' | 'removed'
```
- Champ **indépendant** de `missions.status` (piloté par l'employeur,
  Sprint 4c) — piloté uniquement par l'admin.
- Une mission n'est visible aux candidats (recherche, missions suggérées,
  tri de priorité Premium) que si `status = 'published'` **ET**
  `moderation_status = 'normal'`.
- Tant que `moderation_status != 'normal'`, l'employeur ne peut plus
  éditer/mettre en pause/réactiver la mission lui-même — bloqué côté
  serveur (Server Action) et au niveau RLS, pas seulement caché côté UI.
- Signalement (`mission_reports`) : tout utilisateur authentifié peut
  signaler une mission une fois (motif + détails optionnels) ; l'admin peut
  ignorer un signalement (`dismissed`) ou agir dessus (suspension/
  suppression le marque `reviewed`).
- Suppression définitive bloquée si une candidature `hired` existe déjà sur
  la mission (contrat déjà généré) — message clair, la suspension reste
  possible dans ce cas. Sinon, les candidatures actives (`pending`/
  `interviewing`) sont rejetées automatiquement avec notification.
- Réactivation possible uniquement depuis `suspended`, jamais depuis
  `removed` (volontairement définitif via l'interface).

### Principe de sécurité

```
✅ Vérification serveur systématique — jamais de confiance dans un état
   client, chaque page et chaque action admin revérifie is_admin_user()
✅ RLS comme filet ultime — les policies Postgres sont l'autorité finale ;
   les vérifications applicatives ne sont qu'une couche de défense en
   profondeur supplémentaire, jamais l'unique rempart
✅ Chemin d'accès non public — obscurité en plus du contrôle d'accès réel,
   jamais un substitut à celui-ci
```

> ⚠️ Un incident a été trouvé et corrigé en cours de route : deux policies
> RLS héritées du tout premier script de mise en place de la base (nommées
> différemment des policies modernes, donc jamais remplacées par les
> migrations suivantes) permettaient de contourner `moderation_status` par
> un appel API direct — l'une aurait permis à un employeur de rouvrir
> lui-même sa propre mission suspendue, l'autre rendait une mission
> supprimée lisible même sans authentification. Détecté par test direct au
> niveau RLS (pas seulement via l'application), corrigé en supprimant les
> deux anciennes policies, re-vérifié après coup. Voir
> [ARCHITECTURE_DATABASE.md](./ARCHITECTURE_DATABASE.md) pour le détail
> schéma.

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

## 🚫 Ce Qui Est Explicitement Écarté

Noté ici pour éviter toute confusion future — ces deux points ont été
considérés puis délibérément écartés du périmètre actuel :

**Pas de profil-vitrine candidat public contactable librement**
```
Contraire au différenciateur "visio obligatoire" : le contact entre
employeur et candidat reste toujours conditionné à une candidature suivie
d'une visio. Aucune fonctionnalité (y compris le Premium employeur) ne
doit donner un accès direct au numéro de téléphone ou à la messagerie
d'un candidat en dehors de ce parcours.
```

**Pas d'intégration URSSAF/CESU API automatisée dans l'immédiat**
```
L'accompagnement URSSAF du Premium employeur (Sprint 4d) reste manuel,
assuré par l'équipe OMLIINK sur demande. Le cadre légal d'automatisation
par les plateformes existe (pilote volontaire depuis avril 2026,
généralisation prévue 2027 — voir Statut Candidat & Paiement) mais son
intégration API reste hors périmètre actuel.
```

---

## 🎯 Différenciation vs Concurrents

| Aspect | OMLIINK | Leboncoin | TaskRabbit | Yoopies |
|--------|---------|-----------|-----------|---------|
| **Visio intégrée** | ✅ Obligatoire | ❌ Non | ✅ Optionnel | ❌ Non |
| **Paiement légal** | ✅ Contrat auto + Stripe Connect (auto-entrepreneur) ou CESU (particulier employeur) | ❌ Non | ❌ Non | ✅ Partiel |
| **Particuliers only** | ✅ Strict | ❌ Mélangé | ❌ Pros acceptés | ❌ Pros |
| **Vérification** | ✅ Stricte | ❌ Minimal | ✅ KYC | ✅ KYC |
| **Matching géo** | ✅ Distance (livré) | ❌ Non | ❌ Simple | ❌ Simple |
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
