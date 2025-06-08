# 🌍 IdéaLab - Plateforme Collaborative d'Idées pour l'Afrique

Plateforme collaborative de gestion d'idées adaptée au contexte africain. Cette application permet aux utilisateurs de soumettre, voter et commenter des idées innovantes pour résoudre des problèmes locaux.

## 🚨 ÉTAT ACTUEL - PROBLÈMES RÉSOLUS

### ✅ Corrections Récentes (Décembre 2024)
- **Persistance de session** : Correction de l'initialisation de l'authentification après actualisation
- **Menu déroulant utilisateur** : Réparation des gestionnaires d'événements et fermeture automatique
- **Boutons de navigation** : Vérification et correction du routage vers les formulaires
- **Gestion d'état** : Amélioration de la synchronisation du store Pinia
- **Chart.js v4** : Correction critique des contrôleurs non enregistrés (bar, line, doughnut, pie)
- **Configuration centralisée** : Création d'un système de configuration Chart.js unifié
- **Gestion d'erreurs** : Amélioration du débogage et de la gestion d'erreurs des graphiques

## 🌟 Fonctionnalités

- **Soumission d'idées** : Formulaires structurés pour proposer des idées avec secteur, description détaillée, public cible
- **Système de vote** : Vote pour les meilleures idées avec comptage en temps réel
- **Commentaires** : Discussions constructives sur chaque idée
- **Tableaux de bord** : Suivi personnel des idées et statistiques globales
- **Modération** : Système de validation et de mise en avant des idées
- **Recherche et filtrage** : Recherche par secteur, popularité, date
- **Interface responsive** : Optimisée pour mobile et desktop

## 🏗️ Architecture Technique

### Frontend
- **Vue.js 3** avec Composition API
- **Vue Router 4** pour la navigation
- **Pinia** pour la gestion d'état
- **Vite** comme bundler et serveur de développement
- **CSS moderne** avec Flexbox et Grid

### Backend
- **Node.js** avec **Express.js**
- **PostgreSQL** comme base de données
- **JWT** pour l'authentification
- **bcrypt** pour le hachage des mots de passe
- **CORS** et **Helmet** pour la sécurité

### Structure du projet
```
my-idea-platform/
├── client/                   # Frontend Vue.js
│   ├── assets/
│   ├── components/
│   ├── views/
│   ├── router/
│   ├── store/
│   ├── App.vue
│   ├── main.js
│   └── index.html
├── server/                   # Backend Express.js
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middlewares/
│   ├── services/
│   ├── utils/
│   ├── app.js
│   └── database.js
├── database/
│   └── init.sql
├── public/                   # Assets statiques
├── .env                      # Variables d'environnement
├── .gitignore
├── package.json
├── vite.config.js
└── README.md
```

## 🚀 Installation et Configuration

### Prérequis
- **Node.js** (version 16 ou supérieure)
- **npm** (version 8 ou supérieure)
- **PostgreSQL** (version 12 ou supérieure)

### Installation automatique
1. Exécutez le script de configuration :
   ```bash
   setup_project.bat
   ```

### Installation manuelle
1. **Cloner le projet** (si applicable) ou créer le dossier
2. **Installer les dépendances** :
   ```bash
   npm install
   ```

3. **Configurer la base de données** :
   - Créez une base de données PostgreSQL nommée `idea_platform`
   - Modifiez le fichier `.env` avec vos paramètres :
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=idea_platform
   DB_USER=votre_utilisateur
   DB_PASSWORD=votre_mot_de_passe
   
   PORT=3000
   NODE_ENV=development
   JWT_SECRET=votre-clé-secrète-très-sécurisée
   CORS_ORIGIN=http://localhost:5173
   ```

4. **Initialiser la base de données** :
   ```bash
   npm run db:init
   ```

## 🎯 Utilisation

### Développement
```bash
# Démarrer le serveur de développement (frontend + backend)
npm run dev

# Ou démarrer séparément :
npm run client:dev    # Frontend sur http://localhost:5173
npm run server:dev    # Backend sur http://localhost:3000
```

### Production
```bash
# Construire le frontend
npm run build

# Démarrer le serveur de production
npm start
```

### Scripts disponibles
- `npm run dev` - Développement complet (frontend + backend)
- `npm run client:dev` - Frontend uniquement
- `npm run client:build` - Build du frontend
- `npm run server:dev` - Backend avec rechargement automatique
- `npm run server:start` - Backend en mode production
- `npm run db:init` - Initialisation de la base de données

## 📊 API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur
- `POST /api/auth/refresh` - Renouvellement du token

### Idées
- `GET /api/ideas` - Liste des idées (avec pagination et filtres)
- `GET /api/ideas/:id` - Détails d'une idée
- `POST /api/ideas` - Créer une idée
- `PUT /api/ideas/:id` - Modifier une idée
- `DELETE /api/ideas/:id` - Supprimer une idée
- `GET /api/ideas/stats/overview` - Statistiques globales

### Utilisateurs
- `GET /api/users/profile/:id` - Profil utilisateur
- `GET /api/users/dashboard/:id` - Données du tableau de bord
- `GET /api/users/leaderboard` - Classement des utilisateurs
- `PUT /api/users/profile/:id` - Modifier le profil

## 🔧 Configuration

### Variables d'environnement
Copiez `.env.example` vers `.env` et modifiez les valeurs :

```env
# Base de données
DB_HOST=localhost
DB_PORT=5432
DB_NAME=idea_platform
DB_USER=postgres
DB_PASSWORD=password

# Serveur
PORT=3000
NODE_ENV=development

# Sécurité
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173
```

### Base de données
Le fichier `database/init.sql` contient :
- Schéma complet des tables
- Index pour les performances
- Triggers pour les mises à jour automatiques
- Données d'exemple pour les tests

## 🧪 Tests et Développement

### Données d'exemple
Le script d'initialisation crée des utilisateurs et idées d'exemple :
- **Admin** : admin@ideaplatform.com / password123
- **Utilisateurs** : john.doe@example.com, marie.kouame@example.com, etc.
- **Idées** : Covoiturage rural, éducation locale, marketplace agricole, etc.

### Développement local
1. Le frontend utilise Vite avec rechargement à chaud
2. Le backend utilise Nodemon pour le rechargement automatique
3. Les deux serveurs communiquent via proxy Vite

### 🧪 Tests des Corrections Chart.js
Pour tester les corrections Chart.js :
1. Démarrer l'application : `npm run dev`
2. Accéder à la page de test : `http://localhost:5173/chart-test`
3. Vérifier que tous les graphiques s'affichent sans erreur
4. Tester la connexion et accéder au tableau de bord
5. Vérifier que les graphiques du dashboard fonctionnent

## 🚀 Déploiement

### Hébergement recommandé
- **Frontend + Backend** : Render, Railway, Heroku
- **Base de données** : PostgreSQL sur Render, Supabase, ou AWS RDS
- **Assets statiques** : CDN comme Cloudflare

### Variables d'environnement en production
```env
NODE_ENV=production
PORT=3000
DB_HOST=your-production-db-host
DB_NAME=your-production-db-name
DB_USER=your-production-db-user
DB_PASSWORD=your-production-db-password
JWT_SECRET=your-very-secure-production-secret
CORS_ORIGIN=https://your-domain.com
```

## 🤝 Contribution

1. Fork le projet
2. Créez une branche pour votre fonctionnalité
3. Committez vos changements
4. Poussez vers la branche
5. Ouvrez une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour toute question ou problème :
1. Consultez la documentation
2. Vérifiez les issues existantes
3. Créez une nouvelle issue si nécessaire

## 🎯 Roadmap

- [ ] Système de notifications en temps réel
- [ ] Upload d'images pour les idées
- [ ] Système de tags et catégories avancées
- [ ] API mobile avec React Native
- [ ] Intégration avec les réseaux sociaux
- [ ] Système de récompenses et gamification
- [ ] Analytics et rapports avancés
- [ ] Support multilingue complet
