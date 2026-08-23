# 🔧 LIVEKIT & MAPBOX — Rôles et Moments d'Utilisation

---

## 📹 LIVEKIT — Visioconférence WebRTC

### Qu'est-ce que c'est?

**LiveKit** = Plateforme de **visioconférence en temps réel** basée sur **WebRTC**.

```
Simplification:
  WebRTC = Protocole pour video/audio P2P sur navigateur
  LiveKit = Serveur + SDK qui simplifie WebRTC
  
  Sans LiveKit = Vous codez WebRTC de zéro (10+ semaines)
  Avec LiveKit = Intégration simple en quelques heures ✅
```

### Pourquoi LiveKit pour OMLIINK?

| Aspect | Importance | Pourquoi LiveKit |
|--------|-----------|------------------|
| **Vidéo HD** | 🔴 CRITIQUE | WebRTC natif, codec optimal |
| **Temps réel** | 🔴 CRITIQUE | <100ms latence |
| **Stable** | 🔴 CRITIQUE | Gestion automatique réseau faible |
| **P2P** | 🟡 Important | Réduit coûts serveur |
| **Enregistrement** | 🟢 Bonus | Inclus dans service |
| **Chat** | 🟢 Bonus | DataChannel intégré |
| **Coût** | 🟢 Bonus | Gratuit jusqu'à 50k min/mois |

**Verdict:** LiveKit = Solution parfaite pour OMLIINK

---

### Rôle dans OMLIINK

**Objectif:** Visioconférence **obligatoire avant chaque mission**

#### Use Case Principal
```
1. Employeur crée mission
2. Candidat postule
3. Avant d'accepter → VISIO OBLIGATOIRE 15-30 min
4. Employeur + Candidat se voient en live
5. Feedback immédiat après
6. Puis contrat signé + mission commence
```

#### Pourquoi c'est crucial?

```
🔴 PROBLÈME MARCHÉ:
  Leboncoin = Pas de vérification
  → Mauvaises surprises (professionnel, malhonnête, qualité basse)
  
✅ SOLUTION OMLIINK:
  Visio obligatoire = Confiance immédiate
  → Employeur voit candidat AVANT mission
  → Candidat voit lieu AVANT d'accepter
  → Les deux évaluent live (pas juste photos)
```

---

### Quand l'utiliser dans le Projet?

#### **PHASE 3: Semaines 7-8** (Sprints 9-10)

**Sprint 9 (Semaine 7, Lundi-Mercredi):**
```
- [ ] VisioScheduler component
  - Calendrier + créneaux proposés
  - Notification à l'autre partie
  - Edge Function pour créer room LiveKit
```

**Sprint 10 (Semaine 7-8):**
```
- [ ] VisioRoom component (la vraie visio)
  - Pre-join screen (test cam/micro)
  - Room LiveKit full screen
  - Contrôles: micro, cam, share, flou
  - Chat intégré
  - Chronomètre + fin auto
```

**Timeline Complet:**
```
Mois 1-6:   Développement
Mois 3:     Phase 3 = Visio intégrée (semaines 7-8)
Mois 6+:    Production
```

---

### Comment l'utiliser Techniquement?

#### **Installation**
```bash
pnpm install @livekit/components-react livekit-client
```

#### **Architecture**
```
Frontend:
  └─ VisioRoom.tsx
      └─ Importe @livekit/components-react
          ├─ LiveKitRoom (conteneur)
          ├─ VideoConference (UI standard)
          └─ useRoom hook (logique)

Backend:
  └─ supabase/functions/visio-create-room/index.ts
      ├─ Appelle API LiveKit
      ├─ Crée room unique
      ├─ Génère tokens (employeur + candidat)
      └─ Retourne URLs join
```

#### **Flux Techniquement**

```javascript
// 1. Proposer visio (depuis chat)
const scheduleVisio = async (employerId, candidateId, dateTime) => {
  // Edge Function: crée room LiveKit
  const response = await fetch('/api/visio-create-room', {
    body: JSON.stringify({ employerId, candidateId, dateTime })
  });
  const { room_name, livekit_token_employer, join_url_employer } = response;
  
  // Sauvegarder dans DB (table visio_meetings)
  // Notifier candidate
}

// 2. Candidat accepte
const acceptVisio = async (meetingId) => {
  // Mettre à jour status: 'accepted'
  // Edge Function: créer token candidat
  const candidateToken = await generateToken(candidateId);
  // Notifier employer
}

// 3. Avant visio (15 min avant)
const joinVisio = async (livekit_token) => {
  // Ouvrir VisioRoom.tsx
  <LiveKitRoom 
    token={livekit_token}
    serverUrl="wss://livekit.omliink.com"
  >
    <VideoConference />
  </LiveKitRoom>
}

// 4. Pendant visio
// LiveKit gère tout: vidéo, audio, chat, enregistrement

// 5. Fin visio
const endVisio = async (meetingId) => {
  // Fermer room LiveKit
  // Créer feedback form (avis)
  // Mettre à jour status: 'completed'
  // Proposer: accepter candidature?
}
```

#### **Coûts LiveKit**

```
Gratuit:    0 - 50,000 min/mois
Tier 1:     50k - 250k min → $0.005 / min
Tier 2:     250k+          → $0.003 / min

Projection OMLIINK année 1:
  100 missions × 20 min visio = 2,000 min
  = Entièrement GRATUIT ✅
```

---

## 🗺️ MAPBOX — Géolocalisation & Cartes

### Qu'est-ce que c'est?

**Mapbox** = Plateforme de **cartes interactives** + **géolocalisation**.

```
Alternatives:
  - Google Maps = Cher (US$7 par 1000 requêtes)
  - OpenStreetMap = Gratuit mais basique
  - Mapbox = Bon marché + Rich features
  
  Mapbox choisi pour OMLIINK = Balance parfaite prix/features
```

### Pourquoi Mapbox pour OMLIINK?

| Aspect | Importance | Pourquoi Mapbox |
|--------|-----------|-----------------|
| **Autocomplete adresse** | 🔴 CRITIQUE | Mapbox Geocoding API |
| **Afficher missions sur carte** | 🟡 Important | Mapbox GL JS |
| **Calculer distance** | 🟡 Important | Distance API |
| **Routing trajet** | 🟢 Bonus | Directions API |
| **Coût bas** | 🟢 Bonus | Gratuit jusqu'à 25k req/mois |

**Verdict:** Mapbox = Seule solution qui couvre tous les besoins

---

### Rôle dans OMLIINK

#### Use Case #1: Créer une Mission
```
1. Employeur tape adresse: "12 Rue de la Paix, Lille"
2. Mapbox Geocoding autocomplete
   ↓ (Mapbox suggère adresses possibles)
3. Employeur sélectionne bonne adresse
4. Mapbox retourne: lat/lng exact
5. Sauvegarder dans missions table
```

**Pourquoi c'est crucial?**
```
✅ Pas de typos dans adresses
✅ Lat/lng exact pour distance calculation
✅ UX lisse (pas "chercher adresse manuellement")
```

#### Use Case #2: Listing Missions (Candidat)
```
1. Candidat accède page missions
2. Voir 2 options:
   a) Liste (texte)
   b) Carte (visual)
3. Cliquer "Voir sur carte"
4. Affiche toutes missions de sa région
   ↓ (Avec Mapbox GL JS)
5. Cliquer mission sur carte → détail
```

**Pourquoi c'est crucial?**
```
✅ Visual = Plus attrayant que liste
✅ Distance visible immédiatement
✅ Contexte géographique
```

#### Use Case #3: Matching Algorithm
```
Algo Matching utilise:
  - Distance = distance entre candidat lat/lng 
              et mission lat/lng
  - Score distance = [100pts si <2km, 80 si 2-5km, ...]
  - Mapbox Directions API (optionnel) = calculer temps trajet
```

**Pourquoi c'est crucial?**
```
✅ Candidat voit pas missions à 100km
✅ Employeur voit candidats à proximité
✅ Matching + efficace géographiquement
```

---

### Quand l'utiliser dans le Projet?

#### **PHASE 2: Semaines 4-6** (Sprints 5-8)

**Sprint 5 (Semaine 4-5):**
```
- [ ] Créer mission
  - [ ] Mapbox autocomplete adresse
  - [ ] Sauvegarder lat/lng
```

**Sprint 6 (Semaine 5-6):**
```
- [ ] Listing missions candidat
  - [ ] Mapbox GL JS afficher missions
  - [ ] Toggle liste/carte
```

**Sprint 7 (Semaine 6):**
```
- [ ] Matching algorithm
  - [ ] Distance calculation (Mapbox)
  - [ ] Filtrage géographique
```

**Timeline Complet:**
```
Mois 1-2:   Développement
Mois 2:     Phase 2 = Missions + Matching (semaines 4-6)
            ↓ Mapbox utilisé ici
Mois 6+:    Production
```

---

### Comment l'utiliser Techniquement?

#### **Installation**
```bash
pnpm install mapbox-gl react-map-gl
```

#### **Architecture**

```
Frontend Components:
  ├─ MissionForm.tsx
  │   └─ AddressInput.tsx
  │       └─ Mapbox Geocoding API
  │
  ├─ MissionsMap.tsx
  │   └─ Mapbox GL JS (afficher missions)
  │
  └─ MissionCard.tsx
      └─ Distance (calculée depuis DB)
```

#### **Flux Techniquement**

```javascript
// 1. Addresss Autocomplete (Créer Mission)
const handleAddressInput = async (query) => {
  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${MAPBOX_TOKEN}`
  );
  const results = response.data.features;
  // Afficher suggestions
}

const selectAddress = (feature) => {
  const { center, place_name } = feature;
  setMission({
    address_street: place_name,
    address_lat: center[1],
    address_lng: center[0]
  });
}

// 2. Afficher missions sur carte
<MapContainer>
  <ReactMapGl
    mapboxAccessToken={MAPBOX_TOKEN}
    initialViewState={{
      longitude: candidatLng,
      latitude: candidatLat,
      zoom: 12
    }}
  >
    {missions.map(mission => (
      <Marker
        key={mission.id}
        longitude={mission.address_lng}
        latitude={mission.address_lat}
      >
        <MissionPopup mission={mission} />
      </Marker>
    ))}
  </ReactMapGl>
</MapContainer>

// 3. Distance calculation
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  // Haversine formula (simple)
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + 
            Math.cos(lat1*Math.PI/180) * 
            Math.cos(lat2*Math.PI/180) * 
            Math.sin(dLng/2)**2;
  const c = 2 * Math.asin(Math.sqrt(a));
  return R * c;
}

// OU utiliser Mapbox Directions API (plus précis)
const getDistance = async (lat1, lng1, lat2, lng2) => {
  const response = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/driving/${lng1},${lat1};${lng2},${lat2}?access_token=${MAPBOX_TOKEN}`
  );
  const { distance, duration } = response.routes[0];
  return { distance: distance / 1000, durationMin: duration / 60 };
}
```

#### **Coûts Mapbox**

```
Gratuit:    0 - 25,000 requêtes/mois

Projection OMLIINK année 1:
  Autocomplete adresses:  500 req
  Affichage cartes:       500 req
  Directions API:       1,000 req
  ──────────────────────────────
  Total:              ~2,000 req
  
  = Entièrement GRATUIT ✅
```

---

## 📊 Vue d'Ensemble: Quand Utiliser Quoi

### **Par Phase**

```
PHASE 0 (Semaine 1):
  LiveKit:  ❌ Pas encore
  Mapbox:   ❌ Pas encore

PHASE 1 (Semaines 2-3):
  LiveKit:  ❌ Pas encore
  Mapbox:   ❌ Pas encore

PHASE 2 (Semaines 4-6):      ← MAPBOX COMMENCE ICI
  LiveKit:  ❌ Pas encore
  Mapbox:   ✅ Autocomplete adresse (Sprint 5)
  Mapbox:   ✅ Afficher missions carte (Sprint 6)
  Mapbox:   ✅ Distance calculation (Sprint 7)

PHASE 3 (Semaines 7-8):      ← LIVEKIT COMMENCE ICI
  LiveKit:  ✅ VisioScheduler (Sprint 9)
  LiveKit:  ✅ VisioRoom complet (Sprint 10)
  Mapbox:   ✅ Continue pour affichage

PHASE 4-6 (Semaines 9-11):
  LiveKit:  ✅ Notifications + rappels
  Mapbox:   ✅ Continue pour affichage
```

### **Par Composant Frontend**

```
Auth Pages (Sprint 3):
  ├─ Mapbox: Autocomplete adresse dans register
  └─ LiveKit: ❌

Missions Pages (Sprints 5-6):
  ├─ Mapbox: Affichage missions sur carte
  ├─ Mapbox: Distance calculation
  └─ LiveKit: ❌

Matching (Sprint 7):
  ├─ Mapbox: Distance en algo
  └─ LiveKit: ❌

Chat (Sprint 8):
  ├─ Mapbox: ❌
  └─ LiveKit: ❌ (mais lien "Proposer visio")

Visio (Sprints 9-10):        ← ICI!
  ├─ Mapbox: ❌
  └─ LiveKit: ✅ COMPLET (VisioScheduler + VisioRoom)
```

---

## 💡 Résumé Rapide

### **MAPBOX = Géographie**
```
Quand:     Phases 2-6 (surtout Phase 2)
Utilité:   Adresses autocomplete + Afficher missions carte
Coût:      Gratuit (< 25k req/mois)
Sprints:   5, 6, 7
Critique:  OUI (matching utilise distance)
Fallback:  Oui (input texte manuel)
```

### **LIVEKIT = Visioconférence**
```
Quand:     Phases 3-6 (surtout Phase 3)
Utilité:   Visio obligatoire avant mission
Coût:      Gratuit (< 50k min/mois)
Sprints:   9, 10
Critique:  OUI (différenciation clé OMLIINK)
Fallback:  Non (c'est la feature clé)
```

---

## ❓ FAQ

### Q: Si je saute Mapbox?
A: Missions toujours possibles, mais:
- ❌ Pas d'autocomplete adresse
- ❌ Pas d'affichage carte
- ❌ Distance calc moins précise
→ Moins UX friendly, mais fonctionnel

### Q: Si je saute LiveKit?
A: **NE PAS FAIRE!** Parce que:
- ❌ Perd la différenciation clé (visio obligatoire)
- ❌ Perd la confiance (point clé marketing)
- ❌ Devient juste un Leboncoin clone
→ Cœur du projet!

### Q: LiveKit vs Jitsi (gratuit)?
A: 
- Jitsi = Gratuit mais ❌ Moins stable, ❌ Plus lent, ❌ UI basique
- LiveKit = Payant après 50k min (✅ Stable, ✅ Rapide, ✅ Bonne UI)
- Pour OMLIINK: LiveKit meilleur choix

### Q: Mapbox vs Google Maps?
A:
- Google Maps = ❌ Cher ($7 / 1k req), ❌ Plus lourd
- Mapbox = ✅ Moins cher, ✅ Plus léger, ✅ Customizable
- Pour OMLIINK: Mapbox meilleur choix

### Q: Coûts premiers mois?
A: **Zéro!** Vous restez dans tiers gratuit:
- Mapbox: < 2,000 req (gratuit jusqu'à 25k)
- LiveKit: < 2,000 min (gratuit jusqu'à 50k)
- = Aucun coût année 1

### Q: À partir de quand faut payer?
A: Seulement si you-scale MASSIF:
- Mapbox: > 25,000 req/mois (~500€/mois)
- LiveKit: > 50,000 min/mois (~250€/mois)
- Cela = des milliers de missions/mois
- → Problème heureux! Vous avez du revenu!

---

## 🚀 Ready?

**Mapbox** commence **Semaine 4 (Sprint 5)**  
**LiveKit** commence **Semaine 7 (Sprint 9)**  

**Entre-temps (Semaines 2-3):** Vous avez le temps de vous préparer mentalement! 😊

---

*Questions spécifiques sur comment utiliser dans les Sprints 5-10?*  
*Voir SPRINTS.md pour détail quotidien.*
