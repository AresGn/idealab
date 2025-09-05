import express from 'express'
import { query } from '../database.js'
import { authenticateToken, optionalAuth } from '../middleware/auth.js'
import {
  getOrCreateSessionId,
  getClientIP,
  isIPBlocked,
  isRateLimited,
  detectSuspiciousBehavior
} from '../utils/anonymousUser.js'

const router = express.Router()

// POST /api/votes/regular - Vote standard (up/down) pour une idée
router.post('/regular', optionalAuth, async (req, res) => {
  try {
    const { idea_id, vote_type } = req.body
    const user_id = req.user?.id || null
    const ip_address = getClientIP(req)

    // Validation
    if (!idea_id || !vote_type) {
      return res.status(400).json({
        error: 'ID de l\'idée et type de vote requis'
      })
    }

    if (!['up', 'down'].includes(vote_type)) {
      return res.status(400).json({
        error: 'Type de vote invalide. Utilisez "up" ou "down"'
      })
    }

    // Vérifications de sécurité pour les utilisateurs anonymes
    if (!user_id) {
      if (isIPBlocked(ip_address)) {
        return res.status(403).json({
          error: 'Adresse IP bloquée'
        })
      }

      if (isRateLimited(ip_address)) {
        return res.status(429).json({
          error: 'Trop de votes. Veuillez réessayer plus tard.'
        })
      }

      // Détecter les comportements suspects
      const session_id_temp = req.cookies?.anonymous_session_id || 'temp'
      if (detectSuspiciousBehavior(ip_address, session_id_temp)) {
        return res.status(429).json({
          error: 'Comportement suspect détecté. Veuillez ralentir vos actions.'
        })
      }
    }

    // Vérifier que l'idée existe
    const ideaCheck = await query('SELECT id FROM ideas WHERE id = $1', [idea_id])
    if (ideaCheck.rows.length === 0) {
      return res.status(404).json({
        error: 'Idée non trouvée'
      })
    }

    let existingVote
    let session_id = null

    if (user_id) {
      // Utilisateur connecté
      existingVote = await query(
        'SELECT id, vote_type FROM votes WHERE user_id = $1 AND idea_id = $2',
        [user_id, idea_id]
      )
    } else {
      // Utilisateur anonyme
      session_id = getOrCreateSessionId(req, res)
      existingVote = await query(
        'SELECT id, vote_type FROM votes WHERE session_id = $1 AND idea_id = $2 AND user_id IS NULL',
        [session_id, idea_id]
      )
    }

    if (existingVote.rows.length > 0) {
      // Si même type de vote, supprimer le vote (toggle)
      if (existingVote.rows[0].vote_type === vote_type) {
        if (user_id) {
          await query('DELETE FROM votes WHERE user_id = $1 AND idea_id = $2', [user_id, idea_id])
        } else {
          await query('DELETE FROM votes WHERE session_id = $1 AND idea_id = $2 AND user_id IS NULL', [session_id, idea_id])
        }

        res.json({
          message: 'Vote supprimé',
          action: 'removed',
          vote_type: null
        })
      } else {
        // Sinon, mettre à jour le vote
        if (user_id) {
          await query(
            'UPDATE votes SET vote_type = $1, created_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND idea_id = $3',
            [vote_type, user_id, idea_id]
          )
        } else {
          await query(
            'UPDATE votes SET vote_type = $1, created_at = CURRENT_TIMESTAMP WHERE session_id = $2 AND idea_id = $3 AND user_id IS NULL',
            [vote_type, session_id, idea_id]
          )
        }

        res.json({
          message: 'Vote mis à jour',
          action: 'updated',
          vote_type: vote_type
        })
      }
    } else {
      // Créer un nouveau vote
      await query(
        'INSERT INTO votes (user_id, idea_id, vote_type, session_id, ip_address) VALUES ($1, $2, $3, $4, $5)',
        [user_id, idea_id, vote_type, session_id, ip_address]
      )

      res.json({
        message: 'Vote enregistré',
        action: 'created',
        vote_type: vote_type
      })
    }

  } catch (error) {
    console.error('Erreur lors du vote:', error)
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement du vote' })
  }
})

// POST /api/votes/payment - Vote de paiement (would_pay/would_not_pay)
router.post('/payment', optionalAuth, async (req, res) => {
  try {
    const { idea_id, vote_type } = req.body
    const user_id = req.user?.id || null
    const ip_address = getClientIP(req)

    // Validation
    if (!idea_id || !vote_type) {
      return res.status(400).json({
        error: 'ID de l\'idée et type de vote requis'
      })
    }

    if (!['would_pay', 'would_not_pay'].includes(vote_type)) {
      return res.status(400).json({
        error: 'Type de vote invalide. Utilisez "would_pay" ou "would_not_pay"'
      })
    }

    // Vérifications de sécurité pour les utilisateurs anonymes
    if (!user_id) {
      if (isIPBlocked(ip_address)) {
        return res.status(403).json({
          error: 'Adresse IP bloquée'
        })
      }

      if (isRateLimited(ip_address)) {
        return res.status(429).json({
          error: 'Trop de votes. Veuillez réessayer plus tard.'
        })
      }

      // Détecter les comportements suspects
      const session_id_temp = req.cookies?.anonymous_session_id || 'temp'
      if (detectSuspiciousBehavior(ip_address, session_id_temp)) {
        return res.status(429).json({
          error: 'Comportement suspect détecté. Veuillez ralentir vos actions.'
        })
      }
    }

    // Vérifier que l'idée existe
    const ideaCheck = await query('SELECT id FROM ideas WHERE id = $1', [idea_id])
    if (ideaCheck.rows.length === 0) {
      return res.status(404).json({
        error: 'Idée non trouvée'
      })
    }

    let existingVote
    let session_id = null

    if (user_id) {
      // Utilisateur connecté
      existingVote = await query(
        'SELECT id, vote_type FROM payment_votes WHERE user_id = $1 AND idea_id = $2',
        [user_id, idea_id]
      )
    } else {
      // Utilisateur anonyme
      session_id = getOrCreateSessionId(req, res)
      existingVote = await query(
        'SELECT id, vote_type FROM payment_votes WHERE session_id = $1 AND idea_id = $2 AND user_id IS NULL',
        [session_id, idea_id]
      )
    }

    if (existingVote.rows.length > 0) {
      // Si même type de vote, supprimer le vote (toggle)
      if (existingVote.rows[0].vote_type === vote_type) {
        if (user_id) {
          await query('DELETE FROM payment_votes WHERE user_id = $1 AND idea_id = $2', [user_id, idea_id])
        } else {
          await query('DELETE FROM payment_votes WHERE session_id = $1 AND idea_id = $2 AND user_id IS NULL', [session_id, idea_id])
        }

        res.json({
          message: 'Vote de paiement supprimé',
          action: 'removed',
          vote_type: null
        })
      } else {
        // Sinon, mettre à jour le vote
        if (user_id) {
          await query(
            'UPDATE payment_votes SET vote_type = $1, created_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND idea_id = $3',
            [vote_type, user_id, idea_id]
          )
        } else {
          await query(
            'UPDATE payment_votes SET vote_type = $1, created_at = CURRENT_TIMESTAMP WHERE session_id = $2 AND idea_id = $3 AND user_id IS NULL',
            [vote_type, session_id, idea_id]
          )
        }

        res.json({
          message: 'Vote de paiement mis à jour',
          action: 'updated',
          vote_type: vote_type
        })
      }
    } else {
      // Créer un nouveau vote de paiement
      await query(
        'INSERT INTO payment_votes (user_id, idea_id, vote_type, session_id, ip_address) VALUES ($1, $2, $3, $4, $5)',
        [user_id, idea_id, vote_type, session_id, ip_address]
      )

      res.json({
        message: 'Vote de paiement enregistré',
        action: 'created',
        vote_type: vote_type
      })
    }

  } catch (error) {
    console.error('Erreur lors du vote de paiement:', error)
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement du vote de paiement' })
  }
})

// GET /api/votes/idea/:id - Obtenir les votes d'une idée
router.get('/idea/:id', async (req, res) => {
  try {
    const { id } = req.params

    // Votes standards
    const regularVotesQuery = `
      SELECT 
        vote_type,
        COUNT(*) as count
      FROM votes 
      WHERE idea_id = $1 
      GROUP BY vote_type
    `
    const regularVotes = await query(regularVotesQuery, [id])

    // Votes de paiement
    const paymentVotesQuery = `
      SELECT 
        vote_type,
        COUNT(*) as count
      FROM payment_votes 
      WHERE idea_id = $1 
      GROUP BY vote_type
    `
    const paymentVotes = await query(paymentVotesQuery, [id])

    // Formater les résultats
    const voteCounts = {
      regular: {
        up: 0,
        down: 0
      },
      payment: {
        would_pay: 0,
        would_not_pay: 0
      }
    }

    regularVotes.rows.forEach(row => {
      voteCounts.regular[row.vote_type] = parseInt(row.count)
    })

    paymentVotes.rows.forEach(row => {
      voteCounts.payment[row.vote_type] = parseInt(row.count)
    })

    res.json(voteCounts)

  } catch (error) {
    console.error('Erreur lors de la récupération des votes:', error)
    res.status(500).json({ error: 'Erreur lors de la récupération des votes' })
  }
})

// GET /api/votes/user/:idea_id - Obtenir les votes d'un utilisateur pour une idée
router.get('/user/:idea_id', optionalAuth, async (req, res) => {
  try {
    const { idea_id } = req.params
    const user_id = req.user?.id || null

    let regularVote, paymentVote

    if (user_id) {
      // Utilisateur connecté
      const regularVoteQuery = `
        SELECT vote_type FROM votes
        WHERE user_id = $1 AND idea_id = $2
      `
      regularVote = await query(regularVoteQuery, [user_id, idea_id])

      const paymentVoteQuery = `
        SELECT vote_type FROM payment_votes
        WHERE user_id = $1 AND idea_id = $2
      `
      paymentVote = await query(paymentVoteQuery, [user_id, idea_id])
    } else {
      // Utilisateur anonyme - vérifier via session_id
      const session_id = req.cookies?.anonymous_session_id

      if (session_id) {
        const regularVoteQuery = `
          SELECT vote_type FROM votes
          WHERE session_id = $1 AND idea_id = $2 AND user_id IS NULL
        `
        regularVote = await query(regularVoteQuery, [session_id, idea_id])

        const paymentVoteQuery = `
          SELECT vote_type FROM payment_votes
          WHERE session_id = $1 AND idea_id = $2 AND user_id IS NULL
        `
        paymentVote = await query(paymentVoteQuery, [session_id, idea_id])
      } else {
        // Pas de session, pas de votes
        regularVote = { rows: [] }
        paymentVote = { rows: [] }
      }
    }

    res.json({
      regular_vote: regularVote.rows.length > 0 ? regularVote.rows[0].vote_type : null,
      payment_vote: paymentVote.rows.length > 0 ? paymentVote.rows[0].vote_type : null
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des votes utilisateur:', error)
    res.status(500).json({ error: 'Erreur lors de la récupération des votes utilisateur' })
  }
})

export default router
