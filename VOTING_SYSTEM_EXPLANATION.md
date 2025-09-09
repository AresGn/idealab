# Système de Vote - IdéaLab

## Vue d'ensemble

Le système de vote d'IdéaLab utilise une approche hybride qui permet aux utilisateurs connectés et anonymes de voter sur les idées, avec des mécanismes de sécurité pour prévenir les abus.

## Types de votes

### 1. Votes standards (Regular Votes)
- **Types**: `up` (pour) et `down` (contre)
- **Endpoint**: `POST /api/votes/regular`
- **Usage**: Évaluer la qualité et la pertinence d'une idée

### 2. Votes de paiement (Payment Votes)
- **Types**: `would_pay` (prêt à payer) et `would_not_pay` (pas prêt à payer)
- **Endpoint**: `POST /api/votes/payment`
- **Usage**: Évaluer la viabilité commerciale d'une idée

## Mécanismes de sécurité

### Pour les utilisateurs connectés
- **Identification**: Par `user_id` dans la base de données
- **Restriction**: Un vote par utilisateur par idée
- **Modification**: Possibilité de changer son vote ou de l'annuler (toggle)

### Pour les utilisateurs anonymes
Le système utilise une **double protection** :

#### 1. Protection par adresse IP (Principale)
- **Règle stricte**: Une seule adresse IP peut voter une seule fois par idée
- **Vérification**: Requête SQL sur `ip_address` dans la table `votes`
- **Comportement**: 
  - Si même vote → Refus avec message explicite
  - Si vote différent → Mise à jour autorisée

#### 2. Protection par session (Secondaire)
- **Session ID**: Cookie `anonymous_session_id` généré automatiquement
- **Durée**: Persistant pendant la session du navigateur
- **Usage**: Suivi des votes pour l'interface utilisateur

### Mécanismes anti-abus

#### 1. Détection d'IP bloquées
```javascript
if (isIPBlocked(ip_address)) {
  return res.status(403).json({
    error: 'Adresse IP bloquée'
  })
}
```

#### 2. Limitation de débit (Rate Limiting)
```javascript
if (isRateLimited(ip_address)) {
  return res.status(429).json({
    error: 'Trop de votes. Veuillez réessayer plus tard.'
  })
}
```

#### 3. Détection de comportement suspect
```javascript
if (detectSuspiciousBehavior(ip_address, session_id)) {
  return res.status(429).json({
    error: 'Comportement suspect détecté. Veuillez ralentir vos actions.'
  })
}
```

## Structure de la base de données

### Table `votes` (votes standards)
```sql
CREATE TABLE votes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  idea_id INTEGER REFERENCES ideas(id),
  vote_type VARCHAR(10) NOT NULL, -- 'up' ou 'down'
  session_id VARCHAR(255),
  ip_address INET,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table `payment_votes` (votes de paiement)
```sql
CREATE TABLE payment_votes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  idea_id INTEGER REFERENCES ideas(id),
  vote_type VARCHAR(20) NOT NULL, -- 'would_pay' ou 'would_not_pay'
  session_id VARCHAR(255),
  ip_address INET,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Flux de vote

### 1. Réception de la requête
```javascript
const { idea_id, vote_type } = req.body
const user_id = req.user?.id || null
const ip_address = getClientIP(req)
```

### 2. Validation des données
- Vérification de l'existence de l'idée
- Validation du type de vote
- Contrôles de sécurité pour les utilisateurs anonymes

### 3. Vérification des votes existants
- **Utilisateurs connectés**: Recherche par `user_id`
- **Utilisateurs anonymes**: Recherche par `ip_address` (priorité) puis `session_id`

### 4. Actions possibles
- **Nouveau vote**: Insertion en base
- **Même vote**: Suppression (toggle)
- **Vote différent**: Mise à jour

### 5. Mise à jour des compteurs
```javascript
async function updateIdeaVoteCounts(ideaId) {
  // Compter les votes up et down
  // Mettre à jour le champ votes_count de l'idée
}
```

## Endpoints disponibles

### Voter
- `POST /api/votes/regular` - Vote standard
- `POST /api/votes/payment` - Vote de paiement

### Consulter les votes
- `GET /api/votes/idea/:id` - Votes d'une idée
- `GET /api/votes/user/:idea_id` - Votes d'un utilisateur pour une idée

## Réponses API

### Succès
```json
{
  "message": "Vote enregistré",
  "action": "created|updated|removed",
  "vote_type": "up|down|would_pay|would_not_pay|null"
}
```

### Erreurs courantes
```json
{
  "error": "Vote déjà enregistré",
  "message": "Vous avez déjà voté pour cette idée avec cette adresse IP.",
  "code": "ALREADY_VOTED_SAME_TYPE",
  "vote_type": "up"
}
```

## Sécurité et confidentialité

1. **Anonymat**: Les adresses IP sont stockées mais pas exposées publiquement
2. **Intégrité**: Impossible de voter plusieurs fois avec la même IP
3. **Flexibilité**: Possibilité de changer d'avis (vote différent)
4. **Performance**: Index sur les colonnes fréquemment requêtées

## Recommandations d'utilisation

1. **Pour les développeurs**: Toujours vérifier les réponses d'erreur pour informer l'utilisateur
2. **Pour les utilisateurs**: Se connecter pour un suivi personnalisé des votes
3. **Pour les administrateurs**: Surveiller les patterns de vote suspects via les logs
