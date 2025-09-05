# 🧹 Scripts de Nettoyage de la Base de Données IdéaLab

Ce dossier contient des scripts pour nettoyer et gérer la base de données IdéaLab.

## 📋 Scripts Disponibles

### 1. `check-database-status.js` - Vérification de l'état
**Usage:** `node check-database-status.js`

Ce script affiche un rapport complet de l'état actuel de la base de données :
- 📊 Statistiques générales (nombre d'idées, votes, commentaires, utilisateurs)
- 📋 Détail de toutes les idées avec leurs compteurs
- 💬 Liste des idées ayant des commentaires
- 👍 Répartition des votes (likes/dislikes)
- 🕒 Activité récente
- 🧹 Recommandations de nettoyage

**Recommandé avant tout nettoyage pour voir l'état actuel.**

### 2. `cleanup-database.js` - Nettoyage avec confirmation
**Usage:** `node cleanup-database.js`

Script de nettoyage complet avec demande de confirmation :
- ⚠️ Demande une confirmation explicite (tapez "OUI")
- 📊 Affiche l'état avant et après le nettoyage
- 🗑️ Supprime les 2 dernières idées (les plus récentes)
- 🗑️ Supprime toutes les idées ayant des commentaires
- 🔄 Remet à zéro les compteurs (votes, vues) des idées restantes
- 📈 Affiche des statistiques détaillées

**Recommandé pour un nettoyage sécurisé avec supervision.**

### 3. `quick-cleanup.js` - Nettoyage rapide
**Usage:** `node quick-cleanup.js`

Script de nettoyage rapide sans confirmation :
- 🚀 Exécution immédiate sans demande de confirmation
- 🗑️ Mêmes actions que le script principal
- 📝 Affichage minimal des résultats

**⚠️ ATTENTION: Utiliser avec précaution, aucune confirmation demandée!**

## 🎯 Actions Effectuées par le Nettoyage

### 1. Suppression des 2 dernières idées
- Identifie les 2 idées les plus récentes (ORDER BY created_at DESC)
- Supprime tous les votes associés
- Supprime tous les commentaires associés
- Supprime toutes les statistiques de partage associées
- Supprime les idées elles-mêmes

### 2. Suppression des idées avec commentaires
- Identifie toutes les idées ayant au moins un commentaire
- Supprime tous les votes associés
- Supprime tous les commentaires
- Supprime toutes les statistiques de partage associées
- Supprime les idées elles-mêmes

### 3. Remise à zéro des compteurs
- Pour les 3 idées restantes les plus anciennes
- Supprime tous les votes associés
- Remet à 0 : `votes_count`, `views_count`, `comments_count`

## 🔧 Configuration

### Variables d'environnement (.env)
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=idealab
```

### Dépendances requises
```bash
npm install mysql2 dotenv
```

## 📝 Exemple d'utilisation

### 1. Vérifier l'état actuel
```bash
node check-database-status.js
```

### 2. Nettoyer avec confirmation
```bash
node cleanup-database.js
```
Tapez "OUI" quand demandé pour confirmer.

### 3. Nettoyage rapide (sans confirmation)
```bash
node quick-cleanup.js
```

## ⚠️ Avertissements Importants

1. **Sauvegarde recommandée** : Faites une sauvegarde de votre base de données avant d'exécuter ces scripts
2. **Opération irréversible** : Les données supprimées ne peuvent pas être récupérées
3. **Environnement de production** : Utilisez avec une extrême prudence en production
4. **Test préalable** : Testez d'abord sur une copie de votre base de données

## 🔍 Vérification Post-Nettoyage

Après le nettoyage, exécutez à nouveau :
```bash
node check-database-status.js
```

Pour vérifier que :
- ✅ Le nombre d'idées correspond à vos attentes
- ✅ Les compteurs sont bien à zéro
- ✅ Aucun vote ou commentaire orphelin ne reste

## 🆘 En cas de problème

Si vous rencontrez des erreurs :

1. **Vérifiez la connexion** : Assurez-vous que MySQL est démarré
2. **Vérifiez les credentials** : Contrôlez votre fichier .env
3. **Vérifiez les permissions** : L'utilisateur doit avoir les droits DELETE et UPDATE
4. **Consultez les logs** : Les erreurs détaillées sont affichées dans la console

## 📊 Résultat Attendu

Après un nettoyage réussi, vous devriez avoir :
- **3 idées maximum** dans la base de données
- **0 votes** pour toutes les idées
- **0 vues** pour toutes les idées  
- **0 commentaires** pour toutes les idées
- **Aucune idée avec des commentaires**

---

**Développé pour IdéaLab - Plateforme collaborative pour l'Afrique** 🌍
