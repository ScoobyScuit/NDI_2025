# Projet NIRD - Nuit de l'Info 2025

<div align="center">

**Numérique Inclusif Reconditionné Durable**

Une expérience interactive rétro-gaming pour sensibiliser aux enjeux du numérique responsable

[![Deployed on Railway](https://img.shields.io/badge/Deployed%20on-Railway-blueviolet?logo=railway)](https://ndi2025-production.up.railway.app)
[![Angular](https://img.shields.io/badge/Angular-18+-red?logo=angular)](https://angular.io/)
[![NestJS](https://img.shields.io/badge/NestJS-10+-e0234e?logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node-22.12+-green?logo=node.js)](https://nodejs.org/)

[Démo en ligne](https://ndi2025-production.up.railway.app) | [Documentation](./readme.8bit)

</div>

---

## Table des matières

- [À propos](#à-propos)
- [Contexte](#contexte)
- [Fonctionnalités](#fonctionnalités)
- [Stack Technique](#stack-technique)
- [Architecture](#architecture)
- [Installation](#installation)
- [Déploiement](#déploiement)
- [Défis NDI](#défis-ndi-réalisés)
- [Captures d'écran](#captures-décran)
- [Équipe](#équipe)
- [Licence](#licence)

---

## À propos

**Projet NIRD** est une application web interactive développée pour la **Nuit de l'Info 2025** qui sensibilise aux enjeux du numérique responsable à travers une expérience de jeu rétro-gaming en pixel art 8-bit.

### Concept

Pilotez une fusée spatiale dans un univers rétro parsemé de planètes thématiques et découvrez les 5 leviers du projet NIRD :
- **Le Constat** - La menace Big Tech
- **Levier Technique** - Passer au Libre (Linux)
- **Levier Matériel** - Reconditionnement
- **Levier Pédagogique** - Élèves acteurs
- **La Méthode NIRD** - 3 jalons d'action

### Objectif pédagogique

Sensibiliser de manière ludique à :
- L'obsolescence programmée et ses impacts écologiques
- Les alternatives libres (Linux, logiciels open source)
- Le reconditionnement de matériel informatique
- La souveraineté numérique dans l'éducation
- L'économie circulaire et durable

---

## Contexte

Ce projet s'inscrit dans le cadre de la **Nuit de l'Info 2025**, marathon de développement de 24h organisé par des universités françaises.

**Thématique principale** : Numérique Responsable et Souveraineté des Données

**Date** : Décembre 2025  
**Déploiement** : Railway  
**URL Production** : https://ndi2025-production.up.railway.app

---

## Fonctionnalités

### Expérience Spatiale Interactive

- **Jeu spatial rétro 8-bit** avec physique réaliste
- **Contrôles ZQSD/WASD/Flèches** pour piloter la fusée
- **5 planètes interactives** à explorer avec contenu pédagogique
- **Trou noir central** avec attraction gravitationnelle et effet de spaghettification
- **4 objets interactifs** positionnés aux coins de l'univers :
  - Ordinateur rétro (Chat Bruti IA)
  - Media player rétro (Visualiseur audio)
  - Carte des talents
  - Formulaire de contact

### Chat Bruti - Assistant IA

- Chat interactif avec IA (Mistral AI)
- Répond aux questions sur le projet NIRD
- Interface rétro terminal
- Accessible via l'ordinateur in-game ou le portail dimensionnel

### Design Rétro

- Pixel art 8-bit authentique
- Étoiles scintillantes et étoiles filantes
- Effets de néons et glow
- Palette de couleurs vibrantes années 80-90
- Animations fluides 60 FPS
- Ambiance sonore rétro (visualiseur audio)

### Responsive & Accessible

- Adaptation multi-écrans (desktop, tablette, mobile)
- Support clavier AZERTY/QWERTY
- Navigation intuitive
- Chargement optimisé

---

## Stack Technique

### Frontend

```json
{
  "framework": "Angular 18+",
  "language": "TypeScript 5+",
  "styling": "CSS3 (Animations, Grid, Flexbox)",
  "reactivity": "Angular Signals",
  "architecture": "Standalone Components"
}
```

**Pages principales** :
- `nird-space` - Expérience spatiale interactive 8-bit (jeu principal)
- `carte-talents` - Page de présentation de l'équipe et collaborations
- `chat-bruti` - Interface de chat avec IA Mistral
- `ergonomie` - Tests et défis d'accessibilité
- `gros-pixel` - Effets et composants pixel art

### Backend

```json
{
  "framework": "NestJS 10+",
  "language": "TypeScript",
  "runtime": "Node.js 22.12+",
  "api": "RESTful API",
  "ai": "Mistral AI"
}
```

**Modules principaux** :
- `chat-bruti` - Service de chat avec IA Mistral
- `carte-talents` - Gestion des profils d'équipe
- `visualisation-audio` - Traitement audio
- `ergonomie` - Métriques UX
- `gros-pixel` - Effets pixel art

### Infrastructure

- **Déploiement** : Railway
- **CI/CD** : Git + Railway auto-deploy
- **Build** : Nixpacks
- **Docker** : Multi-stage build
- **Node** : v22.12.0

---

## Architecture

```
ndi_2025/
├── frontend_ndi_2025/           # Application Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── defis-national/
│   │   │   │   ├── pages/
│   │   │   │   │   └── nird-space/              # Jeu spatial principal
│   │   │   │   └── component/                   # Composants du jeu spatial
│   │   │   │       ├── rocket/                  # Composant fusée
│   │   │   │       ├── planet/                  # Composants planètes
│   │   │   │       ├── black-hole/              # Trou noir
│   │   │   │       ├── stars-background/        # Fond étoilé
│   │   │   │       ├── retro-computer/          # Ordinateur rétro
│   │   │   │       ├── retro-media-player/      # Lecteur audio
│   │   │   │       ├── card-talents/            # Carte talents
│   │   │   │       ├── retro-form/              # Formulaire
│   │   │   │       ├── portal-menu/             # Menu portail
│   │   │   │       └── arcade-cabinet/          # Écran d'accueil
│   │   │   │
│   │   │   └── defis/                           # Pages des défis NDI
│   │   │       ├── carte-talents/               # Défi Carte des Talents
│   │   │       ├── chat-bruti/                  # Défi Chat Bruti
│   │   │       ├── ergonomie/                   # Défi Ergonomie
│   │   │       └── gros-pixel/                  # Défi Gros Pixel
│   │   │
│   │   └── index.html
│   ├── angular.json
│   └── package.json
│
├── backend_ndi_2025/            # API NestJS
│   ├── src/
│   │   ├── defis/
│   │   │   ├── chat-bruti/                      # API Chat IA Mistral
│   │   │   ├── carte-talents/                   # API Talents
│   │   │   ├── visualisation-audio/             # API Audio
│   │   │   ├── ergonomie/                       # API Ergonomie
│   │   │   └── gros-pixel/                      # API Pixel art
│   │   └── main.ts
│   ├── nest-cli.json
│   └── package.json
│
├── Dockerfile                   # Configuration Docker
├── railway.json                 # Config Railway
├── nixpacks.toml               # Build config
├── package.json                # Scripts racine
├── readme.8bit                 # Documentation rétro
└── README.md                   # Ce fichier
```

---

## Installation

### Prérequis

- **Node.js** >= 22.12.0
- **npm** >= 10.x
- **Git**

### Installation locale

1. **Cloner le repository**

```bash
git clone git@github.com:ScoobyScuit/NDI_2025.git
cd ndi_2025
```

2. **Installer les dépendances**

```bash
# Frontend
cd frontend_ndi_2025
npm install

# Backend
cd ../backend_ndi_2025
npm install
```

3. **Configuration des variables d'environnement**

Créer un fichier `.env` dans `backend_ndi_2025/` :

```env
# API Mistral pour le chat
MISTRAL_API_KEY=votre_clé_api_mistral

# Port backend
PORT=3000
```

4. **Lancer en développement**

**Terminal 1 - Backend** :
```bash
cd backend_ndi_2025
npm run start:dev
```

**Terminal 2 - Frontend** :
```bash
cd frontend_ndi_2025
ng serve
```

5. **Accéder à l'application**

Ouvrir votre navigateur sur : `http://localhost:4200`

---

## Déploiement

### Production (Railway)

Le projet est configuré pour un déploiement automatique sur Railway.

**Configuration** :
- `railway.json` - Configuration des services
- `nixpacks.toml` - Build configuration
- `Dockerfile` - Image Docker multi-stage

**Variables d'environnement Railway** :
- `MISTRAL_API_KEY` - Clé API Mistral
- `PORT` - Port d'écoute (auto-défini par Railway)
- `NODE_ENV=production`

**URL de production** : https://ndi2025-production.up.railway.app

### Docker

```bash
# Build
docker build -t ndi-2025 .

# Run
docker run -p 3000:3000 -e MISTRAL_API_KEY=votre_clé ndi-2025
```

---

## Défis NDI réalisés

### Défi Principal : Numérique Responsable

Sensibilisation ludique aux enjeux du numérique inclusif, reconditionné et durable à travers une expérience interactive immersive.

### Défi Chat Bruti

Assistant conversationnel IA intégré au jeu permettant de poser des questions sur le projet NIRD. Accessible via :
- L'ordinateur rétro in-game (coin supérieur droit)
- Le portail dimensionnel (trou noir central)

### Défi Ergonomie

Saisie de formulaire de la manière la moins ergonomique possible

### Défi Visualisation Audio

Lecteur audio rétro style Winamp années 90 accessible in-game (coin inférieur gauche).

### Défi Carte des Talents

Page dédiée à l'équipe avec profils et contributions, accessible in-game (coin inférieur droit).

### Défi Gros Pixel

Rendu pixel art 8-bit complet :
- Fusée pixelisée avec rotation fluide
- Planètes en pixel art avec effets glow
- Étoiles et effets de particules
- Grille rétro et scanlines
- Palette de couleurs vibrantes

---

## Captures d'écran

Découvrez l'application en action sur : https://ndi2025-production.up.railway.app

- **Écran d'accueil** : Borne d'arcade rétro
- **Jeu spatial** : Univers 8-bit avec fusée pilotable
- **Interface planète** : Modales informatives thématiques
- **Chat Bruti** : Interface de chat avec IA

---

## Équipe

Projet développé dans le cadre de la **Nuit de l'Info 2025**.

**Membres de l'équipe** : 
- CHOUANGMALA Tommy
- GARCIA Tommy
- SCHNEIDER Macxence
- MOUKTAR HOUSSEN Shams Ryan
- MATTE Quentin
- BOUBEFOUA Lina
- AIT YAHIATENE Melissa
- MINET Baptiste

**Rôles** :
- Design & UX
- Développement Frontend
- Développement Backend
- Intégration IA
- DevOps & Déploiement

---

## Licence

Ce projet est développé dans le cadre de la Nuit de l'Info 2025.

**Crédits** :
- Framework Frontend : [Angular](https://angular.io/)
- Framework Backend : [NestJS](https://nestjs.com/)
- IA : [Mistral AI](https://mistral.ai/)
- Hébergement : [Railway](https://railway.app/)

---

## Liens utiles

- **Site en production** : https://ndi2025-production.up.railway.app
- **Jeu NIRD Space** : https://ndi2025-production.up.railway.app/nird
- **Documentation défi : On veut du gros pixel !** : [readme.8bit](./readme.8bit)
- **Site officiel NIRD** : https://nird.forge.apps.education.fr

---

## Notes de développement
### Scripts disponibles

```bash
# Installation
cd frontend_ndi_2025 && npm i   # Installe frontend
cd backend_ndi_2025 && npm i    # Installe backend

# Start dev
cd backend_ndi_2025 && npm run start:dev # Lance le serveur (backend)
cd frontend_ndi_2025 && ng serve         # Lance le frontend

---

<div align="center">

**Fait avec pour la Nuit de l'Info 2025**

**Projet NIRD** - *Numérique Inclusif Reconditionné Durable*

</div>
