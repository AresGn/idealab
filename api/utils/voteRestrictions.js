/**
 * Configuration et utilitaires pour les restrictions de vote
 */

// Configuration des restrictions de vote
export const VOTE_RESTRICTIONS = {
  // Mode de restriction pour les utilisateurs anonymes
  // 'session' : Un vote par session/navigateur
  // 'ip' : Un vote par adresse IP (défaut pour éviter les votes multiples)
  // 'both' : Un vote par session ET par IP (très strict)
  ANONYMOUS_MODE: process.env.VOTE_RESTRICTION_MODE || 'ip',
  
  // Durée de validité d'une restriction IP (en millisecondes)
  IP_RESTRICTION_DURATION: 24 * 60 * 60 * 1000, // 24 heures
  
  // Permettre le changement de vote (up vers down, etc.)
  ALLOW_VOTE_CHANGE: true
}

/**
 * Vérifie si un utilisateur anonyme peut voter selon les restrictions configurées
 * @param {Object} params - Paramètres de vérification
 * @param {string} params.sessionId - ID de session
 * @param {string} params.ipAddress - Adresse IP
 * @param {number} params.ideaId - ID de l'idée
 * @param {Function} params.query - Fonction de requête DB
 * @returns {Object} Résultat de la vérification
 */
export async function checkVoteRestrictions({ sessionId, ipAddress, ideaId, query }) {
  const mode = VOTE_RESTRICTIONS.ANONYMOUS_MODE
  
  try {
    switch (mode) {
      case 'session':
        return await checkSessionRestriction({ sessionId, ideaId, query })
        
      case 'ip':
        return await checkIPRestriction({ ipAddress, ideaId, query })
        
      case 'both':
        const sessionCheck = await checkSessionRestriction({ sessionId, ideaId, query })
        if (!sessionCheck.canVote) return sessionCheck
        
        const ipCheck = await checkIPRestriction({ ipAddress, ideaId, query })
        return ipCheck
        
      default:
        return { canVote: true, reason: null, existingVote: null }
    }
  } catch (error) {
    console.error('Erreur lors de la vérification des restrictions de vote:', error)
    return { canVote: false, reason: 'Erreur système', existingVote: null }
  }
}

/**
 * Vérifie les restrictions basées sur la session
 */
async function checkSessionRestriction({ sessionId, ideaId, query }) {
  const existingVote = await query(
    'SELECT id, vote_type FROM votes WHERE session_id = $1 AND idea_id = $2 AND user_id IS NULL',
    [sessionId, ideaId]
  )
  
  return {
    canVote: true, // Toujours autorisé avec les sessions (peut changer le vote)
    reason: null,
    existingVote: existingVote.rows[0] || null
  }
}

/**
 * Vérifie les restrictions basées sur l'IP
 */
async function checkIPRestriction({ ipAddress, ideaId, query }) {
  // Vérifier s'il y a déjà un vote depuis cette IP pour cette idée
  const existingVote = await query(
    'SELECT id, vote_type, session_id, created_at FROM votes WHERE ip_address = $1 AND idea_id = $2',
    [ipAddress, ideaId]
  )
  
  if (existingVote.rows.length > 0) {
    const vote = existingVote.rows[0]
    const voteAge = Date.now() - new Date(vote.created_at).getTime()
    
    // Si le vote est récent (dans la période de restriction)
    if (voteAge < VOTE_RESTRICTIONS.IP_RESTRICTION_DURATION) {
      return {
        canVote: false,
        reason: 'IP_ALREADY_VOTED',
        existingVote: vote,
        message: 'Cette adresse IP a déjà voté pour cette idée'
      }
    }
  }
  
  return {
    canVote: true,
    reason: null,
    existingVote: existingVote.rows[0] || null
  }
}

/**
 * Obtient les statistiques de vote par IP pour une idée
 */
export async function getVoteStatsByIP(ideaId, query) {
  try {
    const stats = await query(`
      SELECT 
        ip_address,
        COUNT(*) as vote_count,
        array_agg(vote_type) as vote_types,
        array_agg(session_id) as session_ids,
        MIN(created_at) as first_vote,
        MAX(created_at) as last_vote
      FROM votes 
      WHERE idea_id = $1 AND ip_address IS NOT NULL
      GROUP BY ip_address
      ORDER BY vote_count DESC
    `, [ideaId])
    
    return stats.rows
  } catch (error) {
    console.error('Erreur lors de la récupération des stats de vote par IP:', error)
    return []
  }
}

/**
 * Nettoie les anciennes restrictions IP expirées
 */
export async function cleanupExpiredIPRestrictions(query) {
  try {
    const cutoffDate = new Date(Date.now() - VOTE_RESTRICTIONS.IP_RESTRICTION_DURATION)
    
    // Cette fonction pourrait être utilisée pour nettoyer d'anciennes données
    // si nous implémentons une table séparée pour les restrictions IP
    console.log(`Nettoyage des restrictions IP antérieures à ${cutoffDate.toISOString()}`)
    
    return true
  } catch (error) {
    console.error('Erreur lors du nettoyage des restrictions IP:', error)
    return false
  }
}

/**
 * Obtient la configuration actuelle des restrictions
 */
export function getVoteRestrictionsConfig() {
  return {
    mode: VOTE_RESTRICTIONS.ANONYMOUS_MODE,
    ipRestrictionDuration: VOTE_RESTRICTIONS.IP_RESTRICTION_DURATION,
    allowVoteChange: VOTE_RESTRICTIONS.ALLOW_VOTE_CHANGE,
    description: getRestrictionModeDescription(VOTE_RESTRICTIONS.ANONYMOUS_MODE)
  }
}

/**
 * Obtient la description d'un mode de restriction
 */
function getRestrictionModeDescription(mode) {
  switch (mode) {
    case 'session':
      return 'Un vote par navigateur/session (défaut) - Différents navigateurs peuvent voter'
    case 'ip':
      return 'Un vote par adresse IP - Même IP ne peut voter qu\'une fois'
    case 'both':
      return 'Un vote par session ET par IP - Restriction maximale'
    default:
      return 'Mode de restriction inconnu'
  }
}

/**
 * Valide et normalise une adresse IP
 */
export function normalizeIP(ipAddress) {
  if (!ipAddress) return null
  
  // Supprimer les préfixes IPv6 pour IPv4
  if (ipAddress.startsWith('::ffff:')) {
    return ipAddress.substring(7)
  }
  
  // Normaliser localhost
  if (ipAddress === '::1' || ipAddress === '127.0.0.1') {
    return '127.0.0.1'
  }
  
  return ipAddress
}
