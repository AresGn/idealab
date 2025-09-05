# Migration vers Monorepo - IdéaLab

## ✅ Migration Terminée

La restructuration du projet en monorepo a été complétée avec succès ! Votre projet est maintenant optimisé pour le déploiement sur Vercel.

## 📁 Nouvelle Structure

```
idealab/
├── src/                    # Code frontend (Vue.js)
│   ├── components/         # Composants Vue
│   ├── views/             # Pages Vue
│   ├── router/            # Configuration Vue Router
│   ├── store/             # Store Pinia
│   ├── styles/            # Fichiers CSS
│   ├── utils/             # Utilitaires
│   ├── App.vue            # Composant racine
│   └── main.js            # Point d'entrée
├── api/                   # Code backend (Express.js)
│   ├── routes/            # Routes API
│   ├── middleware/        # Middlewares
│   ├── app.js             # Serveur Express
│   └── database.js        # Configuration DB
├── dist/                  # Build de production (généré)
├── index.html             # Template HTML principal
├── package.json           # Dépendances unifiées
├── vite.config.js         # Configuration Vite
├── vercel.json            # Configuration Vercel (nouvelle)
├── tailwind.config.js     # Configuration Tailwind
└── postcss.config.js      # Configuration PostCSS
```

## 🚀 Commandes Disponibles

```bash
# Développement (frontend + backend)
npm run dev

# Build de production
npm run build

# Aperçu du build
npm run preview

# Serveur backend seul
npm run server:start

# Initialiser la base de données
npm run db:init
```

## 🔧 Changements Effectués

### 1. **Structure Unifiée**
- ✅ Fusion des dossiers `client/` et `server/` 
- ✅ Frontend déplacé vers `src/`
- ✅ Backend déplacé vers `api/` (convention Vercel)

### 2. **Configuration Vercel**
- ✅ Nouvelle configuration `vercel.json` optimisée
- ✅ Support des fonctions serverless
- ✅ Routage automatique `/api/*` vers le backend

### 3. **Build System**
- ✅ Configuration Vite unifiée
- ✅ Support Tailwind CSS
- ✅ Optimisation des bundles

### 4. **Dépendances**
- ✅ `package.json` unifié
- ✅ Suppression des duplications
- ✅ Versions harmonisées

## 🌐 Déploiement sur Vercel

Votre projet est maintenant prêt pour Vercel ! 

### Déploiement Automatique
1. Connectez votre repo GitHub à Vercel
2. Vercel détectera automatiquement la configuration
3. Le build et déploiement se feront automatiquement

### Variables d'Environnement
Assurez-vous de configurer vos variables d'environnement dans Vercel :
- `DATABASE_URL`
- `JWT_SECRET`
- Autres variables de votre `.env`

## 🔍 Vérifications

- ✅ Build fonctionne : `npm run build`
- ✅ Structure monorepo créée
- ✅ Configuration Vercel mise à jour
- ✅ Anciens dossiers supprimés
- ✅ Dépendances consolidées

## 📝 Prochaines Étapes

1. **Tester localement** : `npm run dev`
2. **Commit les changements** : `git add . && git commit -m "feat: migrate to monorepo structure"`
3. **Déployer sur Vercel** : Push vers votre branche principale
4. **Vérifier le déploiement** : Tester l'application en production

## 🆘 En cas de Problème

Si vous rencontrez des erreurs :

1. **Erreur de build** : Vérifiez les imports dans `src/`
2. **Erreur API** : Vérifiez les chemins dans `api/`
3. **Erreur Vercel** : Consultez les logs de déploiement

La structure est maintenant optimale pour Vercel et devrait résoudre vos problèmes de déploiement !
