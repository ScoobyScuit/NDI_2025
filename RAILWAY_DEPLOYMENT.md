# Déploiement sur Railway - NDI 2025

## Architecture
Ce projet est déployé en **monolithe** sur Railway :
- Frontend Angular compilé en fichiers statiques
- Backend NestJS qui sert le frontend ET les API

## Configuration Railway

### 1. Créer le service sur Railway

1. Connectez-vous à [Railway](https://railway.app)
2. Créez un nouveau projet
3. Choisissez "Deploy from GitHub repo"
4. Sélectionnez votre repository

### 2. Variables d'environnement

Dans les **Variables** de Railway, ajoutez :

```
NODE_ENV=production
OPENROUTER_API_KEY=votre_clé_api_openrouter
PORT=3000
```

**Important** : Railway définit automatiquement la variable `PORT`, mais vous pouvez la forcer à 3000 si nécessaire.

### 3. Configuration du build

Railway détectera automatiquement le fichier `nixpacks.toml` à la racine du projet qui contient :
- Installation des dépendances du frontend et du backend
- Build du frontend Angular (génère les fichiers statiques)
- Build du backend NestJS
- Démarrage du serveur en mode production

### 4. Domaine

Railway vous fournira automatiquement un domaine type : `https://votre-app.up.railway.app`

Votre application sera accessible directement via ce domaine (pas besoin de port dans l'URL).

## Structure du déploiement

```
Railway exécute:
1. npm ci dans frontend_ndi_2025 (installe les dépendances)
2. npm ci dans backend_ndi_2025 (installe les dépendances)
3. npm run build dans frontend_ndi_2025 (compile Angular → dist/)
4. npm run build dans backend_ndi_2025 (compile NestJS → dist/)
5. npm run start:prod dans backend_ndi_2025 (démarre le serveur)

Le backend sert:
- Les API sur /api/* (ou vos routes API)
- Les fichiers statiques Angular sur /* (toutes les autres routes)
```

## CORS

Le CORS est configuré pour accepter toutes les origines en production (`origin: '*'`).
Cela permet à votre frontend de communiquer avec le backend sans problème.

## Vérification du déploiement

1. Une fois déployé, visitez l'URL fournie par Railway
2. Vous devriez voir votre frontend Angular
3. Les appels API vers le backend devraient fonctionner automatiquement

## Logs

Pour voir les logs de votre application :
- Allez dans votre projet Railway
- Cliquez sur le service
- Onglet "Logs"

## Redéploiement

Railway redéploie automatiquement à chaque push sur la branche principale de votre repo GitHub.

## Troubleshooting

### Le frontend ne s'affiche pas
- Vérifiez que le build Angular s'est bien terminé dans les logs
- Vérifiez le chemin dans `app.module.ts` (ServeStaticModule)

### Les API ne fonctionnent pas
- Vérifiez les logs pour voir les erreurs
- Vérifiez que `OPENROUTER_API_KEY` est bien définie dans les variables d'environnement

### Erreur de mémoire pendant le build
- Allez dans les Settings du service Railway
- Augmentez la mémoire disponible pour le build

