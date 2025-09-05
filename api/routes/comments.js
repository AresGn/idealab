import express from 'express'
import { query } from '../database.js'
import { authenticateToken, optionalAuth } from '../middleware/auth.js'
import {
  getOrCreateSessionId,
  getClientIP,
  isValidEmail,
  sanitizeName,
  isIPBlocked,
  isRateLimited,
  detectSuspiciousBehavior,
  isSpamContent
} from '../utils/anonymousUser.js'

const router = express.Router()

// GET /api/comments/idea/:id - Obtenir les commentaires d'une idée
router.get('/idea/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { page = 1, limit = 20 } = req.query

    const offset = (page - 1) * limit

    // Récupérer les commentaires avec les informations de l'auteur
    const commentsQuery = `
      SELECT 
        c.id,
        c.content,
        c.created_at,
        c.updated_at,
        c.parent_id,
        CASE 
          WHEN c.user_id IS NOT NULL THEN u.username
          ELSE c.author_name
        END as author_name,
        CASE 
          WHEN c.user_id IS NOT NULL THEN u.email
          ELSE c.author_email
        END as author_email,
        c.user_id IS NOT NULL as is_registered_user,
        COUNT(replies.id) as replies_count
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN comments replies ON replies.parent_id = c.id AND replies.is_active = true
      WHERE c.idea_id = $1 AND c.is_active = true AND c.parent_id IS NULL
      GROUP BY c.id, c.content, c.created_at, c.updated_at, c.parent_id, 
               u.username, u.email, c.author_name, c.author_email, c.user_id
      ORDER BY c.created_at DESC
      LIMIT $2 OFFSET $3
    `

    const comments = await query(commentsQuery, [id, limit, offset])

    // Récupérer le nombre total de commentaires
    const countQuery = `
      SELECT COUNT(*) as total
      FROM comments 
      WHERE idea_id = $1 AND is_active = true AND parent_id IS NULL
    `
    const countResult = await query(countQuery, [id])

    res.json({
      comments: comments.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].total),
        pages: Math.ceil(countResult.rows[0].total / limit)
      }
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des commentaires:', error)
    res.status(500).json({ error: 'Erreur lors de la récupération des commentaires' })
  }
})

// GET /api/comments/:id/replies - Obtenir les réponses d'un commentaire
router.get('/:id/replies', async (req, res) => {
  try {
    const { id } = req.params

    const repliesQuery = `
      SELECT 
        c.id,
        c.content,
        c.created_at,
        c.updated_at,
        CASE 
          WHEN c.user_id IS NOT NULL THEN u.username
          ELSE c.author_name
        END as author_name,
        CASE 
          WHEN c.user_id IS NOT NULL THEN u.email
          ELSE c.author_email
        END as author_email,
        c.user_id IS NOT NULL as is_registered_user
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.parent_id = $1 AND c.is_active = true
      ORDER BY c.created_at ASC
    `

    const replies = await query(repliesQuery, [id])

    res.json({
      replies: replies.rows
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des réponses:', error)
    res.status(500).json({ error: 'Erreur lors de la récupération des réponses' })
  }
})

// POST /api/comments - Créer un nouveau commentaire
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { idea_id, content, parent_id = null, author_email, author_name } = req.body
    const user_id = req.user?.id || null
    const ip_address = getClientIP(req)

    // Validation de base
    if (!idea_id || !content?.trim()) {
      return res.status(400).json({
        error: 'ID de l\'idée et contenu requis'
      })
    }

    if (content.trim().length < 3) {
      return res.status(400).json({
        error: 'Le commentaire doit contenir au moins 3 caractères'
      })
    }

    if (content.trim().length > 2000) {
      return res.status(400).json({
        error: 'Le commentaire ne peut pas dépasser 2000 caractères'
      })
    }

    // Détecter le spam
    if (isSpamContent(content)) {
      return res.status(400).json({
        error: 'Contenu détecté comme spam'
      })
    }

    // Vérifications pour les utilisateurs anonymes
    if (!user_id) {
      if (!author_email || !isValidEmail(author_email)) {
        return res.status(400).json({
          error: 'Adresse email valide requise pour commenter'
        })
      }

      if (isIPBlocked(ip_address)) {
        return res.status(403).json({
          error: 'Adresse IP bloquée'
        })
      }

      if (isRateLimited(ip_address, 10)) { // Limite plus stricte pour les commentaires
        return res.status(429).json({
          error: 'Trop de commentaires. Veuillez réessayer plus tard.'
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

    // Vérifier que le commentaire parent existe (si spécifié)
    if (parent_id) {
      const parentCheck = await query(
        'SELECT id FROM comments WHERE id = $1 AND idea_id = $2 AND is_active = true',
        [parent_id, idea_id]
      )
      if (parentCheck.rows.length === 0) {
        return res.status(404).json({
          error: 'Commentaire parent non trouvé'
        })
      }
    }

    let session_id = null
    let finalAuthorEmail = null
    let finalAuthorName = null

    if (user_id) {
      // Utilisateur connecté - utiliser ses informations
      finalAuthorEmail = req.user.email
      finalAuthorName = req.user.username
    } else {
      // Utilisateur anonyme
      session_id = getOrCreateSessionId(req, res)
      finalAuthorEmail = author_email.trim().toLowerCase()
      finalAuthorName = sanitizeName(author_name) || 'Utilisateur anonyme'
    }

    // Créer le commentaire
    const insertQuery = `
      INSERT INTO comments (
        content, user_id, idea_id, parent_id, 
        author_email, author_name, session_id, ip_address
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, content, created_at
    `

    const result = await query(insertQuery, [
      content.trim(),
      user_id,
      idea_id,
      parent_id,
      finalAuthorEmail,
      finalAuthorName,
      session_id,
      ip_address
    ])

    const newComment = result.rows[0]

    res.status(201).json({
      message: 'Commentaire créé avec succès',
      comment: {
        id: newComment.id,
        content: newComment.content,
        created_at: newComment.created_at,
        author_name: finalAuthorName,
        author_email: finalAuthorEmail,
        is_registered_user: !!user_id
      }
    })

  } catch (error) {
    console.error('Erreur lors de la création du commentaire:', error)
    res.status(500).json({ error: 'Erreur lors de la création du commentaire' })
  }
})

// PUT /api/comments/:id - Modifier un commentaire (seulement pour l'auteur)
router.put('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { content } = req.body
    const user_id = req.user?.id || null

    if (!content?.trim()) {
      return res.status(400).json({
        error: 'Contenu requis'
      })
    }

    if (content.trim().length < 3 || content.trim().length > 2000) {
      return res.status(400).json({
        error: 'Le commentaire doit contenir entre 3 et 2000 caractères'
      })
    }

    // Récupérer le commentaire existant
    const commentQuery = `
      SELECT user_id, session_id, author_email 
      FROM comments 
      WHERE id = $1 AND is_active = true
    `
    const commentResult = await query(commentQuery, [id])

    if (commentResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Commentaire non trouvé'
      })
    }

    const comment = commentResult.rows[0]

    // Vérifier les permissions
    let canEdit = false
    
    if (user_id && comment.user_id === user_id) {
      // Utilisateur connecté et propriétaire
      canEdit = true
    } else if (!user_id && !comment.user_id) {
      // Utilisateur anonyme - vérifier via session
      const session_id = req.cookies?.anonymous_session_id
      if (session_id && comment.session_id === session_id) {
        canEdit = true
      }
    }

    if (!canEdit) {
      return res.status(403).json({
        error: 'Vous ne pouvez modifier que vos propres commentaires'
      })
    }

    // Mettre à jour le commentaire
    const updateQuery = `
      UPDATE comments 
      SET content = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2
      RETURNING content, updated_at
    `

    const result = await query(updateQuery, [content.trim(), id])

    res.json({
      message: 'Commentaire mis à jour avec succès',
      comment: result.rows[0]
    })

  } catch (error) {
    console.error('Erreur lors de la modification du commentaire:', error)
    res.status(500).json({ error: 'Erreur lors de la modification du commentaire' })
  }
})

// DELETE /api/comments/:id - Supprimer un commentaire (soft delete)
router.delete('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params
    const user_id = req.user?.id || null

    // Récupérer le commentaire existant
    const commentQuery = `
      SELECT user_id, session_id 
      FROM comments 
      WHERE id = $1 AND is_active = true
    `
    const commentResult = await query(commentQuery, [id])

    if (commentResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Commentaire non trouvé'
      })
    }

    const comment = commentResult.rows[0]

    // Vérifier les permissions (même logique que pour l'édition)
    let canDelete = false
    
    if (user_id && comment.user_id === user_id) {
      canDelete = true
    } else if (!user_id && !comment.user_id) {
      const session_id = req.cookies?.anonymous_session_id
      if (session_id && comment.session_id === session_id) {
        canDelete = true
      }
    }

    if (!canDelete) {
      return res.status(403).json({
        error: 'Vous ne pouvez supprimer que vos propres commentaires'
      })
    }

    // Soft delete
    await query('UPDATE comments SET is_active = false WHERE id = $1', [id])

    res.json({
      message: 'Commentaire supprimé avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de la suppression du commentaire:', error)
    res.status(500).json({ error: 'Erreur lors de la suppression du commentaire' })
  }
})

export default router
