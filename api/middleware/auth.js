import jwt from 'jsonwebtoken'
import { query } from '../database.js'

// Middleware pour vérifier l'authentification JWT
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Token d\'authentification requis'
      })
    }

    // Vérifier le token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Vérifier que l'utilisateur existe toujours et est actif
    const userQuery = `
      SELECT id, email, username, role, is_active
      FROM users 
      WHERE id = $1
    `
    const result = await query(userQuery, [decoded.userId])

    if (result.rows.length === 0 || !result.rows[0].is_active) {
      return res.status(401).json({
        error: 'Token invalide ou utilisateur inactif'
      })
    }

    // Ajouter les informations utilisateur à la requête
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      username: decoded.username,
      role: decoded.role || result.rows[0].role
    }

    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token invalide'
      })
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expiré'
      })
    }

    console.error('Erreur d\'authentification:', error)
    res.status(500).json({
      error: 'Erreur interne du serveur'
    })
  }
}

// Middleware optionnel pour récupérer l'utilisateur si connecté
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      req.user = null
      return next()
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    const userQuery = `
      SELECT id, email, username, role, is_active
      FROM users 
      WHERE id = $1
    `
    const result = await query(userQuery, [decoded.userId])

    if (result.rows.length > 0 && result.rows[0].is_active) {
      req.user = {
        id: decoded.userId,
        email: decoded.email,
        username: decoded.username,
        role: decoded.role || result.rows[0].role
      }
    } else {
      req.user = null
    }

    next()
  } catch (error) {
    // En cas d'erreur, continuer sans utilisateur
    req.user = null
    next()
  }
}

// Middleware pour vérifier les rôles
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentification requise'
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Permissions insuffisantes'
      })
    }

    next()
  }
}

// Middleware pour vérifier que l'utilisateur peut modifier une ressource
export const requireOwnership = (resourceType) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentification requise'
        })
      }

      const resourceId = req.params.id
      let checkQuery = ''

      switch (resourceType) {
        case 'idea':
          checkQuery = 'SELECT user_id FROM ideas WHERE id = $1'
          break
        case 'comment':
          checkQuery = 'SELECT user_id FROM comments WHERE id = $1'
          break
        default:
          return res.status(400).json({
            error: 'Type de ressource non supporté'
          })
      }

      const result = await query(checkQuery, [resourceId])

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: 'Ressource non trouvée'
        })
      }

      const resourceOwnerId = result.rows[0].user_id

      // Vérifier si l'utilisateur est propriétaire ou admin
      if (resourceOwnerId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          error: 'Vous n\'êtes pas autorisé à modifier cette ressource'
        })
      }

      next()
    } catch (error) {
      console.error('Erreur de vérification de propriété:', error)
      res.status(500).json({
        error: 'Erreur interne du serveur'
      })
    }
  }
}
