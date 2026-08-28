# 🗺️ ARCHITECTURE ROUTES — OMLIINK

**Structure réelle des routes App Router, telle qu'implémentée**

---

## ⚠️ Écart avec le plan initial

`SPRINTS.md` et `FEUILLE_DE_ROUTE.md` décrivent, dans leurs tâches et
livrables (Sprints 3, 5, 6, 15), un plan initial de routes **séparées par
rôle** : `/employer/missions`, `/candidate/missions`, `/profile/
verification`, `/profile/settings`, `/register/employer`, `/register/
candidate`, etc. Ce plan n'a **jamais été suivi tel quel** — au fil des
sprints, le code a consolidé vers une arborescence unique sous
`/dashboard/*`, avec rendu conditionnel selon le rôle (`profile.is_employer`
/ `profile.is_candidate`) plutôt que des sous-arbres de routes dupliqués
par rôle. Ni bug ni oubli : une évolution d'architecture jamais reflétée
dans les documents de planification, qui restent au stade du plan
d'origine sur ce point précis.

Ce fichier documente la structure **réellement livrée** — c'est elle qui
fait foi, pas les chemins mentionnés dans `SPRINTS.md`/
`FEUILLE_DE_ROUTE.md`.

---

## 📂 Arborescence réelle

```
app/
├── page.tsx                              Landing page publique
│
├── auth/
│   ├── login/page.tsx                    Connexion (email/password)
│   └── signup/page.tsx                   Inscription (rôle choisi dans le
│                                          formulaire, pas deux routes
│                                          séparées /register/employer et
│                                          /register/candidate)
│
├── dashboard/
│   ├── page.tsx                          Dashboard — rendu conditionnel
│   │                                      selon is_employer/is_candidate
│   │                                      (pas deux routes /employer et
│   │                                      /candidate séparées)
│   ├── onboarding/page.tsx               Wizard onboarding candidat
│   │                                      (9 étapes, Sprint 4b)
│   ├── profile/page.tsx                  "Mon compte" — blocs éditables
│   │                                      indépendants (Sprint 5b),
│   │                                      couvre à la fois le profil et
│   │                                      la vérification candidat (pas
│   │                                      de route /profile/verification
│   │                                      ni /profile/settings séparées)
│   ├── missions/
│   │   ├── page.tsx                      Liste missions — rendu
│   │   │                                  conditionnel par rôle (pas de
│   │   │                                  /employer/missions ni
│   │   │                                  /candidate/missions séparées)
│   │   ├── new/page.tsx                  Création mission (employeur)
│   │   └── [id]/
│   │       ├── page.tsx                  Détail mission
│   │       └── edit/page.tsx             Édition mission (employeur)
│   ├── candidatures/page.tsx             Candidatures (candidat)
│   ├── candidats/page.tsx                Entretiens / suggestions
│   │                                      (employeur)
│   ├── intervenants/page.tsx             "Mes intervenants" — historique
│   │                                      hired (Sprint 4c, employeur)
│   ├── agenda/page.tsx                   Agenda (visios + missions à
│   │                                      venir)
│   ├── messages/
│   │   ├── page.tsx                      Liste conversations
│   │   └── [id]/page.tsx                 Fil de conversation
│   ├── visio/[meetingId]/page.tsx        Salle LiveKit
│   └── premium/page.tsx                  Abonnement Premium (Sprint 4d)
│
└── <chemin admin>/                       Interface admin — chemin non
    ├── page.tsx                          public, communiqué séparément,
    ├── verifications/page.tsx            jamais committé en clair (voir
    ├── promo-codes/page.tsx              CAHIER_DES_CHARGES.md §
    ├── cesu-pajemploi/page.tsx           Modération & Interface Admin).
    └── missions/page.tsx                 5 pages : tableau de bord,
                                           vérifications, codes promo,
                                           CESU/Pajemploi, missions
                                           (signalements + modération).
```

---

## 🧭 Principe de navigation (Sprint 5a)

Navigation par onglets, routes dédiées (vraies routes Next.js, pas un état
d'onglet côté client) — cohérent côté candidat et employeur, permet à
l'URL, au rechargement et au bouton retour du navigateur de se comporter
normalement.

---

## 🔐 Note sécurité — chemin admin

Le chemin exact de l'interface admin est volontairement absent de ce
fichier et de tout autre fichier versionné du dépôt — mesure de défense en
profondeur (obscurité), en plus du vrai contrôle d'accès
(`is_admin_user()` + RLS, inchangé quel que soit le chemin). Voir
[CAHIER_DES_CHARGES.md](./CAHIER_DES_CHARGES.md#modération--interface-admin).
