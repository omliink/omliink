# 📑 INDEX OMLIINK — Guide de Démarrage

**Vous avez 5 fichiers .md à mettre dans votre repo GitHub**

---

## 📚 Les 5 Fichiers Principaux

### 1️⃣ **README.md** — Point d'Entrée du Projet
```
Lire en PREMIER (5 min)
├─ Qu'est-ce qu'OMLIINK?
├─ Différenciation clés
├─ Stack technologique
├─ Commandes principales
└─ Checklist démarrage
```
**Placement:** `/README.md` (racine repo)  
**Quand l'utiliser:** Première lecture, onboarding nouvelles personnes

---

### 2️⃣ **CAHIER_DES_CHARGES.md** — Spécifications du Projet
```
Lire en DEUXIÈME (30 min)
├─ Concept & Vision
├─ Services proposés (15 catégories)
├─ Architecture technique
├─ Modèle économique
├─ Système visio
├─ Vérification candidats
├─ Intégration URSSAF
├─ Matching algorithm
└─ Design system
```
**Placement:** `/docs/CAHIER_DES_CHARGES.md` ou `/CAHIER_DES_CHARGES.md`  
**Quand l'utiliser:** Comprendre le projet en profondeur, valider requirements

---

### 3️⃣ **ARCHITECTURE_DATABASE.md** — Schéma PostgreSQL
```
Lire en TROISIÈME (20 min)
├─ 18 tables principales
├─ Migrations SQL
├─ RLS Policies
├─ Indexes performance
├─ Triggers
└─ Relations complètes
```
**Placement:** `/docs/ARCHITECTURE_DATABASE.md` ou `/DATABASE.md`  
**Quand l'utiliser:** Avant développement, pour comprendre structure données

---

### 4️⃣ **FEUILLE_DE_ROUTE.md** — Timeline du Projet
```
Lire en QUATRIÈME (15 min)
├─ 6 phases (0-6)
├─ 20 sprints détaillés
├─ Jalons clés
├─ KPIs progression
└─ Mitigation risques
```
**Placement:** `/docs/FEUILLE_DE_ROUTE.md`  
**Quand l'utiliser:** Planning, suivre progression, coordonner équipe

---

### 5️⃣ **SPRINTS.md** — Détail des Sprints
```
Lire en DERNIER (30 min par sprint)
├─ Sprint 0-20 détaillés
├─ Tâches par jour
├─ Claude Code Prompts
├─ Deliverables par sprint
└─ Workflow git standard
```
**Placement:** `/docs/SPRINTS.md`  
**Quand l'utiliser:** Chaque sprint (avant de commencer), tâches quotidiennes

---

## 🎯 Ordre de Lecture Recommandé

### Avant de coder (Jour 1)
1. **README.md** (5 min) — Contexte général
2. **CAHIER_DES_CHARGES.md** (30 min) — Comprendre le projet
3. **ARCHITECTURE_DATABASE.md** (20 min) — Modèle données
4. Faire Sprint 0 setup

### Au début de chaque sprint
1. Lire **FEUILLE_DE_ROUTE.md** (section du sprint)
2. Lire **SPRINTS.md** (détail du sprint)
3. Lancer première tâche

### Pour questions spécifiques
- **"Quelle est la structure DB?"** → ARCHITECTURE_DATABASE.md
- **"Comment créer une mission?"** → CAHIER_DES_CHARGES.md (Missions)
- **"Quand on arrive à visio?"** → FEUILLE_DE_ROUTE.md (Phase 3)
- **"Quoi faire aujourd'hui?"** → SPRINTS.md (sprint actuel)
- **"Comment lancer le projet?"** → README.md

---

## 📂 Placement Recommandé dans le Repo

```
omliink/
├── README.md                    ← Point d'entrée
├── docs/
│   ├── CAHIER_DES_CHARGES.md    ← Spécifications
│   ├── ARCHITECTURE_DATABASE.md ← DB schema
│   ├── FEUILLE_DE_ROUTE.md      ← Timeline
│   └── SPRINTS.md               ← Tâches détaillées
├── src/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── ...
├── supabase/
│   ├── migrations/
│   └── functions/
└── .gitignore
```

---

## 🚀 Quickstart (5 minutes)

```bash
# 1. Clone
git clone <repo>
cd omliink

# 2. Install
pnpm install

# 3. Setup env
cp .env.example .env.local
# Remplir clés Supabase, Stripe, etc.

# 4. Read
# Ouvrir README.md

# 5. Dev
pnpm dev
# Accédez http://localhost:3000

# 6. Lire CAHIER_DES_CHARGES.md

# 7. Faire Sprint 0 (Setup)
```

---

## 📊 Tableau de Marche

### Phase 0: Setup (Semaine 1)
- [ ] Lire README.md
- [ ] Faire Sprint 0 (setup)
- [ ] Pré-requis: Node v20, pnpm, Supabase, Vercel, Claude Code

### Phase 1: Foundation (Semaines 2-3)
- [ ] Lire ARCHITECTURE_DATABASE.md
- [ ] Faire Sprint 1: Database (8h)
- [ ] Faire Sprint 2: Layout (16h)
- [ ] Faire Sprint 3: Auth (8h)

### Phase 2: Core (Semaines 4-6)
- [ ] Faire Sprint 4-8 (visio scheduler, chat, etc.)
- [ ] Lire CAHIER_DES_CHARGES.md (services, matching)

### Phase 3+: Specialization
- [ ] Faire Sprint 9-20
- [ ] Consulter SPRINTS.md jour par jour

---

## 🔄 Workflow Standard

```markdown
## Chaque Matin (Start of Day):
1. Ouvrir SPRINTS.md → section sprint actuel
2. Lire tâches du jour
3. Créer branche git: `feat/sprint-X-description`
4. Travailler 8h
5. Commits réguliers

## Fin de Journée:
6. `pnpm type-check` ✅
7. `pnpm lint` ✅
8. `pnpm build` ✅
9. Git push
10. Update SPRINTS.md status

## Fin de Sprint (Vendredi):
11. Merge PR vers develop
12. Vérifier tous deliverables OK
13. PR develop → main si stable
14. Lire SPRINTS.md (sprint suivant)
```

---

## ✅ Checklist Démarrage Complet

### Avant Jour 1
- [ ] Git repo cloné
- [ ] Lire README.md
- [ ] Lire CAHIER_DES_CHARGES.md
- [ ] Lire ARCHITECTURE_DATABASE.md

### Sprint 0 (Jour 1-5)
- [ ] Suivre SPRINTS.md (Sprint 0)
- [ ] Setup local complet
- [ ] Supabase connecté
- [ ] Claude Code testé
- [ ] `pnpm dev` fonctionne

### Sprint 1 (Jour 6-10)
- [ ] Suivre SPRINTS.md (Sprint 1)
- [ ] Database migrations appliquées
- [ ] RLS policies en place
- [ ] Types TypeScript générés
- [ ] Middleware auth OK

### Sprints 2+ (Semaines 2+)
- [ ] Lire FEUILLE_DE_ROUTE.md pour contexte
- [ ] Lire SPRINTS.md pour tâches
- [ ] Faire 1 sprint par semaine
- [ ] Update status dans SPRINTS.md

---

## 💡 Tips d'Utilisation

### Pour Rapide Lookup
```
grep -n "SPRINT 5" SPRINTS.md  → Trouver Sprint 5
grep -n "profiles" ARCHITECTURE_DATABASE.md  → Trouver table profiles
grep -n "Matching" CAHIER_DES_CHARGES.md  → Lire matching algo
```

### Pour Navigation Git
```bash
# Chaque sprint = branche
git log --oneline | grep "sprint"  → Voir tous les sprints

# Ou voir tags
git tag -l  → Voir milestones
git checkout v1.0  → Voir state à milestone
```

### Pour Documenter Progress
```markdown
# OMLIINK Progress

## Sprints Complétés
- [x] Sprint 0: Setup (100%)
- [x] Sprint 1: Database (100%)
- [ ] Sprint 2: Layout (0%)
- [ ] Sprint 3: Auth (0%)

## Status
- DB: ✅ Ready
- Auth: 🔄 In Progress (SPRINTS.md Jour 3)
- Missions: ⏳ Blocked (waiting for database)
```

---

## 🔗 Liens Rapides

**Fichiers:**
- [README.md](README.md) — Start here
- [CAHIER_DES_CHARGES.md](CAHIER_DES_CHARGES.md) — What to build
- [ARCHITECTURE_DATABASE.md](ARCHITECTURE_DATABASE.md) — How DB works
- [FEUILLE_DE_ROUTE.md](FEUILLE_DE_ROUTE.md) — Timeline
- [SPRINTS.md](SPRINTS.md) — What to do today

**Resources:**
- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs
- LiveKit Docs: https://docs.livekit.io
- shadcn/ui: https://ui.shadcn.com
- Anthropic: https://anthropic.com

---

## ❓ FAQ

### Q: Par où commencer?
A: Lire **README.md** (5 min), puis faire **Sprint 0** (setup).

### Q: Comment savoir quoi faire demain?
A: Ouvrir **SPRINTS.md**, trouver votre sprint, lire tâches du jour.

### Q: Structure de la DB?
A: Voir **ARCHITECTURE_DATABASE.md** → Tables Principales.

### Q: Différenciation vs concurrents?
A: Voir **CAHIER_DES_CHARGES.md** → Différenciation vs Concurrents.

### Q: Combien de temps total?
A: **11 semaines** (11 sprints de 2 semaines ou ~20 sprints de 1 semaine).

### Q: Risques principaux?
A: Voir **FEUILLE_DE_ROUTE.md** → Points de Vigilance.

### Q: Supabase vs Local?
A: Recommandé: Supabase cloud (mais local possible, voir Sprint 0).

---

## 🎯 Vision Globale

```
OMLIINK
├─ Qu'est-ce? → CAHIER_DES_CHARGES.md
├─ Comment? → ARCHITECTURE_DATABASE.md
├─ Quand? → FEUILLE_DE_ROUTE.md
├─ Quoi faire aujourd'hui? → SPRINTS.md
└─ Démarrer? → README.md
```

---

## 📝 Versioning

| Version | Date | Status | Notes |
|---------|------|--------|-------|
| 1.0 | Aug 2026 | ✅ Ready | Initial release for Rachid |
| - | - | - | - |

---

## 🚀 Ready to Build?

1. **Imprimer cet INDEX**
2. **Lire README.md**
3. **Faire Sprint 0**
4. **Lancer: `pnpm dev`**
5. **Let's build OMLIINK!** 🎉

---

**Questions? Besoin d'aide?**
- Relire le fichier pertinent (README, CAHIER_DES_CHARGES, etc.)
- Chercher dans SPRINTS.md (tâche similaire)
- Consulter ARCHITECTURE_DATABASE.md (structure donnée)

**Bon courage!** 💪🚀

---

*Ce document = Votre guide complet OMLIINK*  
*Imprimez-le, mettez-le en favori, consultez-le quotidiennement.*
