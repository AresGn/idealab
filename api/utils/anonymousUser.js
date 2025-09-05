import crypto from 'crypto'

/**
 * Génère un identifiant de session unique pour les utilisateurs anonymes
 * @returns {string} Identifiant de session unique
 */
export function generateSessionId() {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Extrait l'adresse IP de la requête
 * @param {Object} req - Objet de requête Express
 * @returns {string} Adresse IP du client
 */
export function getClientIP(req) {
  return req.ip || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         req.headers['x-real-ip'] ||
         '127.0.0.1'
}

/**
 * Obtient ou crée un identifiant de session pour un utilisateur anonyme
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns {string} Identifiant de session
 */
export function getOrCreateSessionId(req, res) {
  // Vérifier si l'utilisateur a déjà un session_id dans les cookies
  let sessionId = req.cookies?.anonymous_session_id
  
  if (!sessionId) {
    // Générer un nouveau session_id
    sessionId = generateSessionId()
    
    // Définir le cookie avec une durée de vie de 30 jours
    res.cookie('anonymous_session_id', sessionId, {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 jours en millisecondes
      httpOnly: true, // Sécurité : empêche l'accès via JavaScript
      secure: process.env.NODE_ENV === 'production', // HTTPS en production
      sameSite: 'lax' // Protection CSRF
    })
  }
  
  return sessionId
}

/**
 * Valide une adresse email
 * @param {string} email - Adresse email à valider
 * @returns {boolean} True si l'email est valide
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Nettoie et valide le nom d'un utilisateur anonyme
 * @param {string} name - Nom à nettoyer
 * @returns {string} Nom nettoyé
 */
export function sanitizeName(name) {
  if (!name || typeof name !== 'string') {
    return 'Utilisateur anonyme'
  }
  
  // Supprimer les caractères dangereux et limiter la longueur
  return name.trim()
             .replace(/[<>\"'&]/g, '') // Supprimer les caractères HTML dangereux
             .substring(0, 100) // Limiter à 100 caractères
             || 'Utilisateur anonyme'
}

/**
 * Vérifie si une adresse IP est dans une liste noire (pour prévenir les abus)
 * @param {string} ip - Adresse IP à vérifier
 * @returns {boolean} True si l'IP est bloquée
 */
export function isIPBlocked(ip) {
  // Liste noire basique - peut être étendue avec une base de données
  const blockedIPs = [
    '127.0.0.1', // Exemple - ne pas bloquer localhost en développement
    // Ajouter d'autres IPs si nécessaire
  ]
  
  // En développement, ne pas bloquer localhost
  if (process.env.NODE_ENV === 'development' && ip === '127.0.0.1') {
    return false
  }
  
  return blockedIPs.includes(ip)
}

/**
 * Limite le taux de votes par IP (protection contre le spam)
 * @param {string} ip - Adresse IP
 * @param {number} maxVotesPerHour - Nombre maximum de votes par heure
 * @returns {boolean} True si la limite est dépassée
 */
export function isRateLimited(ip, maxVotesPerHour = 50) {
  // Implémentation simple en mémoire - en production, utiliser Redis
  if (!global.voteLimits) {
    global.voteLimits = new Map()
  }

  const now = Date.now()
  const hourAgo = now - (60 * 60 * 1000) // 1 heure en millisecondes

  // Nettoyer les anciennes entrées
  for (const [key, data] of global.voteLimits.entries()) {
    if (data.timestamp < hourAgo) {
      global.voteLimits.delete(key)
    }
  }

  // Vérifier la limite pour cette IP
  const ipData = global.voteLimits.get(ip) || { count: 0, timestamp: now }

  if (ipData.timestamp < hourAgo) {
    // Réinitialiser le compteur si plus d'une heure s'est écoulée
    ipData.count = 1
    ipData.timestamp = now
  } else {
    ipData.count++
  }

  global.voteLimits.set(ip, ipData)

  return ipData.count > maxVotesPerHour
}

/**
 * Détecte les comportements suspects (votes rapides, patterns répétitifs)
 * @param {string} ip - Adresse IP
 * @param {string} sessionId - Identifiant de session
 * @returns {boolean} True si le comportement est suspect
 */
export function detectSuspiciousBehavior(ip, sessionId) {
  if (!global.behaviorTracking) {
    global.behaviorTracking = new Map()
  }

  const now = Date.now()
  const key = `${ip}_${sessionId}`
  const tracking = global.behaviorTracking.get(key) || {
    lastAction: 0,
    rapidActions: 0,
    totalActions: 0
  }

  // Détecter les actions trop rapides (moins de 2 secondes entre les votes)
  if (now - tracking.lastAction < 2000) {
    tracking.rapidActions++
  } else {
    tracking.rapidActions = Math.max(0, tracking.rapidActions - 1)
  }

  tracking.lastAction = now
  tracking.totalActions++

  global.behaviorTracking.set(key, tracking)

  // Comportement suspect si plus de 5 actions rapides ou plus de 100 actions totales
  return tracking.rapidActions > 5 || tracking.totalActions > 100
}

/**
 * Valide le contenu pour détecter le spam
 * @param {string} content - Contenu à valider
 * @returns {boolean} True si le contenu semble être du spam
 */
export function isSpamContent(content) {
  if (!content || typeof content !== 'string') {
    return false
  }

  const lowerContent = content.toLowerCase()

  // Mots-clés de spam courants
  const spamKeywords = [
    'viagra', 'casino', 'lottery', 'winner', 'congratulations',
    'click here', 'free money', 'make money fast', 'work from home',
    'buy now', 'limited time', 'act now', 'urgent'
  ]

  // Vérifier la présence de mots-clés de spam
  const hasSpamKeywords = spamKeywords.some(keyword =>
    lowerContent.includes(keyword)
  )

  // Détecter les répétitions excessives
  const words = content.split(/\s+/)
  const wordCount = {}
  let maxRepetition = 0

  words.forEach(word => {
    const cleanWord = word.toLowerCase().replace(/[^\w]/g, '')
    if (cleanWord.length > 2) {
      wordCount[cleanWord] = (wordCount[cleanWord] || 0) + 1
      maxRepetition = Math.max(maxRepetition, wordCount[cleanWord])
    }
  })

  // Détecter les URLs suspectes
  const urlPattern = /https?:\/\/[^\s]+/gi
  const urls = content.match(urlPattern) || []
  const hasMultipleUrls = urls.length > 2

  // Détecter les caractères répétitifs
  const hasRepeatedChars = /(.)\1{10,}/.test(content)

  return hasSpamKeywords || maxRepetition > 5 || hasMultipleUrls || hasRepeatedChars
}

/**
 * Nettoie périodiquement les données de tracking en mémoire
 */
export function cleanupTracking() {
  const now = Date.now()
  const hourAgo = now - (60 * 60 * 1000)

  // Nettoyer les limites de votes
  if (global.voteLimits) {
    for (const [key, data] of global.voteLimits.entries()) {
      if (data.timestamp < hourAgo) {
        global.voteLimits.delete(key)
      }
    }
  }

  // Nettoyer le tracking de comportement (garder 24h)
  const dayAgo = now - (24 * 60 * 60 * 1000)
  if (global.behaviorTracking) {
    for (const [key, data] of global.behaviorTracking.entries()) {
      if (data.lastAction < dayAgo) {
        global.behaviorTracking.delete(key)
      }
    }
  }
}

// Nettoyer automatiquement toutes les heures
setInterval(cleanupTracking, 60 * 60 * 1000)
