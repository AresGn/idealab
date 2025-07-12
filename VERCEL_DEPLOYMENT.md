# Guide de Déploiement Vercel pour IdéaLab

## 🚀 Étapes de Déploiement

### 1. Configuration des Variables d'Environnement sur Vercel

Allez dans votre dashboard Vercel > Votre projet > Settings > Environment Variables

**Variables OBLIGATOIRES :**

```bash
# Base de données (CRITIQUE)
DATABASE_URL=postgresql://username:password@host:port/idealab_production

# JWT Secret (CRITIQUE - générez une clé sécurisée)
JWT_SECRET=votre-cle-jwt-super-securisee-ici

# CORS Origin (remplacez par votre domaine Vercel)
CORS_ORIGIN=https://votre-app.vercel.app

# Environment
NODE_ENV=production

# Session Secret
SESSION_SECRET=votre-session-secret-securise

# Logging
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif

# Security
BCRYPT_ROUNDS=12
```

### 2. Corrections Apportées

✅ **Corrigé le problème path-to-regexp** dans `vercel.json`
✅ **Résolu le conflit builds/functions** qui causait l'erreur de build
✅ **Optimisé les routes** pour Vercel
✅ **Ajouté la gestion des assets statiques**
✅ **Configuration simplifiée** sans conflits

### 3. Structure des Routes Vercel

```json
{
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js"
    },
    {
      "src": "/(.*\\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot))",
      "dest": "/dist/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/dist/index.html"
    }
  ]
}
```

### 4. Commandes de Déploiement

```bash
# Build local (pour tester)
npm run build

# Déploiement automatique via Git
git add .
git commit -m "fix: Correction erreur path-to-regexp Vercel"
git push origin main
```

### 5. Vérification Post-Déploiement

1. **API Health Check :** `https://votre-app.vercel.app/api/health`
2. **Base de données :** Vérifiez les logs Vercel pour la connexion DB
3. **Frontend :** Testez la navigation et les appels API

### 6. Debugging

Si vous avez encore des erreurs :

1. **Vérifiez les logs Vercel** dans Functions > View Function Logs
2. **Testez localement** avec `npm run build && npm run preview`
3. **Vérifiez les variables d'environnement** dans Vercel Dashboard

### 7. Variables d'Environnement Critiques

⚠️ **ATTENTION :** Assurez-vous que ces variables sont définies sur Vercel :

- `DATABASE_URL` : Votre URL PostgreSQL complète
- `JWT_SECRET` : Clé secrète pour les tokens JWT
- `CORS_ORIGIN` : URL de votre app Vercel (https://votre-app.vercel.app)

## 🔧 Troubleshooting

### Erreur "Missing parameter name"
✅ **RÉSOLU** - Problème dans vercel.json corrigé

### Erreur "Conflicting functions and builds configuration"
✅ **RÉSOLU** - Configuration simplifiée sans section functions conflictuelle

### Erreur de connexion DB
- Vérifiez que `DATABASE_URL` est correctement définie
- Testez la connexion depuis votre machine locale

### Erreur CORS
- Mettez à jour `CORS_ORIGIN` avec votre vraie URL Vercel
