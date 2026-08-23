# 🏠 OMLIINK

**Plateforme de mise en relation entre particuliers pour les services à la personne**

*"La connexion de confiance pour votre domicile"*

---

## 📋 Qu'est-ce qu'OMLIINK?

OMLIINK est une **plateforme digitale innovante** reliant:
- **Particuliers employeurs** (besoin d'aide à domicile)
- **Particuliers candidats** (étudiants, demandeurs d'emploi, arrondisseurs de fins de mois)

**Aucun professionnel accepté — uniquement des particuliers.**

---

## ✨ Différenciation Clés

```
✅ 100% Légal & Déclaré      → URSSAF automatique via API
✅ 100% Vérifié               → KYC + Casier judiciaire + Attestation
✅ 100% Confiance             → Visio intégrée OBLIGATOIRE avant mission
✅ 100% Simple                → Zéro administratif pour l'employeur
```

---

## 🎯 Objectifs du Projet

**Phase 1 (Mois 1-3):** MVP + Test Market Hauts-de-France
**Phase 2 (Mois 4-6):** Acquisition 50 employeurs + 200 candidats
**Phase 3 (Mois 7-12):** Croissance + Expansion régions
**Phase 4 (Année 2):** Fundraising + Scale national

---

## 📚 Documentation

Ce repo contient:

| Document | Description |
|----------|-------------|
| **CAHIER_DES_CHARGES.md** | Spécifications complètes du projet |
| **ARCHITECTURE_DATABASE.md** | Schéma PostgreSQL + RLS policies |
| **FEUILLE_DE_ROUTE.md** | Timeline phases + jalons |
| **SPRINTS.md** | Détail sprints 2 semaines |
| **CLAUDE_CODE_PROMPTS.md** | 26 prompts pour Claude Code |

---

## 🛠️ Stack Technologique

**Frontend:**
- Next.js 14 (App Router)
- React 18 + TypeScript
- Tailwind CSS + shadcn/ui
- Framer Motion

**Backend:**
- Supabase (PostgreSQL + Auth + Storage + Realtime + Edge Functions)
- Stripe Connect (paiements)
- LiveKit Cloud (visioconférence WebRTC)

**Services Externes:**
- URSSAF API (déclarations légales)
- Onfido/Jumio (KYC)
- Resend (emails)
- Mapbox (cartes)

---

## 📊 Modèle Économique

**Revenu Principal:** Commission 10% par mission  
**Revenu Secondaire:** Abonnement Premium Employeur (9,90€/mois)  
**Revenu Tertiaire:** Boosts Candidat + Partenariats  

**Projection (1000 missions/mois):**
- Commissions: €5,000/mois
- Abonnements: €1,980/mois
- Boosts: €1,196/mois
- **Total: ~€8,176/mois**

---

## 🚀 Démarrage Rapide

### Prérequis
```bash
Node.js v20+
pnpm
Claude Code (pour développement)
Supabase CLI
Vercel CLI
```

### Installation Dev
```bash
git clone <repo>
cd omliink
pnpm install

# Setup Supabase local
supabase init
supabase link --project-ref <votre-project>
supabase gen types typescript --linked > src/types/database.ts

# Variables env
cp .env.example .env.local
# Remplir avec vos clés Supabase, LiveKit, Stripe, etc.

# Démarrer
pnpm dev
# http://localhost:3000
```

---

## 📖 Lecture Recommandée

**Ordre de lecture pour comprendre le projet:**

1. **Ce README** (30 sec)
2. **CAHIER_DES_CHARGES.md** (30 min) — Contexte complet
3. **ARCHITECTURE_DATABASE.md** (20 min) — Modèle données
4. **FEUILLE_DE_ROUTE.md** (15 min) — Timeline
5. **SPRINTS.md** (30 min) — Détail travail

---

## 🎯 Commandes Principales

```bash
# Développement
pnpm dev              # Lancer localhost:3000

# Qualité
pnpm type-check       # Vérifier TypeScript
pnpm lint             # Linter
pnpm build            # Build production

# Database
supabase db push      # Appliquer migrations
supabase gen types    # Regénérer types

# Git
git checkout -b feat/feature-name
git add .
git commit -m "feat: description courte"
git push origin feat/feature-name
# → Créer PR sur GitHub
```

---

## 📋 Structure du Repo

```
omliink/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Pages authentification
│   │   ├── (dashboard)/       # Pages dashboard
│   │   ├── (public)/          # Pages publiques
│   │   └── api/               # Routes API
│   ├── components/            # Composants React réutilisables
│   ├── lib/                   # Utilities + configs
│   │   ├── supabase/          # Client + server Supabase
│   │   ├── validations/       # Schémas Zod
│   │   └── ...
│   ├── hooks/                 # Custom React hooks
│   ├── types/                 # Types TypeScript
│   ├── stores/                # État Zustand
│   └── emails/                # Templates Resend
├── supabase/
│   ├── migrations/            # Migrations SQL
│   └── functions/             # Edge Functions
├── public/                    # Assets statiques
├── .env.example               # Template env
├── CAHIER_DES_CHARGES.md     # Spécifications
├── ARCHITECTURE_DATABASE.md  # Schéma DB
├── FEUILLE_DE_ROUTE.md       # Timeline
└── SPRINTS.md                # Détail sprints
```

---

## 🔄 Git Workflow

**Branching Strategy:** Git Flow

```
main              # Production (stabilisé)
├── develop       # Intégration (staging)
└── feat/*        # Features (branches de travail)
```

**Commits:** Conventional Commits
```
feat:   Nouvelle feature
fix:    Correction bug
docs:   Documentation
style:  Formatage/style
refactor: Refactoring sans changement fonctionnel
test:   Tests
chore:  Maintenance
```

---

## 🤝 Contribution

**Chaque sprint = 2 semaines**

1. Voir **SPRINTS.md** pour les tâches de la semaine
2. Créer branche `feat/sprint-X-task-Y`
3. Développer + tester localement
4. Commit + push
5. Créer PR avec description
6. Code review (auto-review = ok)
7. Merge dans `develop`
8. À la fin du sprint: `develop` → `main`

---

## 📞 Support

**Problèmes Supabase?**
- Docs: https://supabase.com/docs
- CLI: `supabase help`

**Problèmes Next.js?**
- Docs: https://nextjs.org/docs

**Problèmes LiveKit?**
- Docs: https://docs.livekit.io

**Problèmes Claude Code?**
- Docs: https://anthropic.com

---

## 📅 Calendrier

| Phase | Durée | Statut | Notes |
|-------|-------|--------|-------|
| **Phase 0: Setup** | Semaine 1 | ⏳ À faire | Env + Supabase + Config |
| **Phase 1: Foundation** | Semaine 2-3 | ⏳ À faire | DB + Auth + Landing |
| **Phase 2: Core** | Semaine 4-6 | ⏳ À faire | Missions + Matching + Chat |
| **Phase 3: Visio** | Semaine 7-8 | ⏳ À faire | LiveKit + Contrats |
| **Phase 4: URSSAF** | Semaine 9 | ⏳ À faire | Paiements + Déclarations |
| **Phase 5: Polish** | Semaine 10 | ⏳ À faire | Profils + Dashboards |
| **Phase 6: Déploiement** | Semaine 11 | ⏳ À faire | Vercel + Production |

---

## 🎓 Apprentissage

Lire dans cet ordre:

1. **Cahier des charges** pour comprendre le business
2. **Architecture Database** pour comprendre les données
3. **Feuille de Route** pour le contexte temporel
4. **Sprints** pour les détails techniques
5. **Claude Code Prompts** pour le développement

---

## ✅ Checklist Démarrage

- [ ] Repository cloné localement
- [ ] `pnpm install` exécuté
- [ ] Lire CAHIER_DES_CHARGES.md
- [ ] Lire ARCHITECTURE_DATABASE.md
- [ ] Lire FEUILLE_DE_ROUTE.md
- [ ] Lire SPRINTS.md
- [ ] Supabase local configuré
- [ ] `.env.local` rempli
- [ ] `pnpm dev` fonctionne
- [ ] Sprint 1 commencé! 🚀

---

## 📄 Licence

MIT (à définir)

---

**Prêt à créer OMLIINK? Let's go! 🚀**

Pour démarrer: `pnpm dev` puis lisez CAHIER_DES_CHARGES.md
