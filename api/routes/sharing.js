import express from 'express'
import { query } from '../database.js'
import { optionalAuth } from '../middleware/auth.js'
import { getClientIP } from '../utils/anonymousUser.js'

const router = express.Router()

// POST /api/ideas/:id/share - Enregistrer une action de partage
router.post('/:id/share', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { action, platform, share_url } = req.body
    const user_id = req.user?.id || null
    const ip_address = getClientIP(req)

    // Validation
    if (!action) {
      return res.status(400).json({
        error: 'Action de partage requise'
      })
    }

    // Vérifier que l'idée existe
    const ideaCheck = await query('SELECT id FROM ideas WHERE id = $1', [id])
    if (ideaCheck.rows.length === 0) {
      return res.status(404).json({
        error: 'Idée non trouvée'
      })
    }

    // Enregistrer l'action de partage
    await query(`
      INSERT INTO idea_shares (
        idea_id, user_id, action, platform, share_url, ip_address
      ) VALUES ($1, $2, $3, $4, $5, $6)
    `, [id, user_id, action, platform, share_url, ip_address])

    // Mettre à jour le compteur de partages de l'idée
    if (['whatsapp', 'twitter', 'facebook', 'linkedin', 'email', 'link_copied'].includes(action)) {
      await query(`
        UPDATE ideas 
        SET shares_count = shares_count + 1 
        WHERE id = $1
      `, [id])
    }

    res.json({
      message: 'Action de partage enregistrée',
      action: action
    })

  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du partage:', error)
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement du partage' })
  }
})

// GET /api/ideas/:id/share-stats - Obtenir les statistiques de partage
router.get('/:id/share-stats', async (req, res) => {
  try {
    const { id } = req.params

    // Vérifier que l'idée existe
    const ideaCheck = await query('SELECT shares_count FROM ideas WHERE id = $1', [id])
    if (ideaCheck.rows.length === 0) {
      return res.status(404).json({
        error: 'Idée non trouvée'
      })
    }

    // Statistiques détaillées par plateforme
    const platformStats = await query(`
      SELECT 
        platform,
        COUNT(*) as count
      FROM idea_shares 
      WHERE idea_id = $1 AND platform IS NOT NULL
      GROUP BY platform
      ORDER BY count DESC
    `, [id])

    // Statistiques par action
    const actionStats = await query(`
      SELECT 
        action,
        COUNT(*) as count
      FROM idea_shares 
      WHERE idea_id = $1
      GROUP BY action
      ORDER BY count DESC
    `, [id])

    // Partages récents (dernières 24h)
    const recentShares = await query(`
      SELECT COUNT(*) as count
      FROM idea_shares 
      WHERE idea_id = $1 AND created_at > NOW() - INTERVAL '24 hours'
    `, [id])

    // Total des partages depuis la table ideas
    const totalShares = ideaCheck.rows[0].shares_count || 0

    res.json({
      total_shares: totalShares,
      recent_shares_24h: parseInt(recentShares.rows[0]?.count || 0),
      by_platform: platformStats.rows.reduce((acc, row) => {
        acc[row.platform] = parseInt(row.count)
        return acc
      }, {}),
      by_action: actionStats.rows.reduce((acc, row) => {
        acc[row.action] = parseInt(row.count)
        return acc
      }, {})
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des stats de partage:', error)
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' })
  }
})

// GET /api/share/popular - Obtenir les idées les plus partagées
router.get('/popular', async (req, res) => {
  try {
    const { limit = 10, period = '7d' } = req.query

    let timeCondition = ''
    switch (period) {
      case '24h':
        timeCondition = "AND s.created_at > NOW() - INTERVAL '24 hours'"
        break
      case '7d':
        timeCondition = "AND s.created_at > NOW() - INTERVAL '7 days'"
        break
      case '30d':
        timeCondition = "AND s.created_at > NOW() - INTERVAL '30 days'"
        break
      case 'all':
      default:
        timeCondition = ''
    }

    const popularIdeas = await query(`
      SELECT 
        i.id,
        i.title,
        i.description,
        i.sector,
        i.shares_count,
        i.votes_count,
        i.comments_count,
        i.views_count,
        u.username,
        u.first_name,
        u.last_name,
        COUNT(s.id) as period_shares
      FROM ideas i
      LEFT JOIN users u ON i.user_id = u.id
      LEFT JOIN idea_shares s ON i.id = s.idea_id ${timeCondition}
      WHERE i.status = 'approved'
      GROUP BY i.id, u.username, u.first_name, u.last_name
      ORDER BY period_shares DESC, i.shares_count DESC
      LIMIT $1
    `, [limit])

    res.json({
      period: period,
      ideas: popularIdeas.rows
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des idées populaires:', error)
    res.status(500).json({ error: 'Erreur lors de la récupération des idées populaires' })
  }
})

// GET /api/share/trending - Obtenir les tendances de partage
router.get('/trending', async (req, res) => {
  try {
    // Partages par jour (derniers 7 jours)
    const dailyShares = await query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as shares
      FROM idea_shares 
      WHERE created_at > NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `)

    // Plateformes les plus utilisées
    const topPlatforms = await query(`
      SELECT 
        platform,
        COUNT(*) as count
      FROM idea_shares 
      WHERE platform IS NOT NULL 
        AND created_at > NOW() - INTERVAL '30 days'
      GROUP BY platform
      ORDER BY count DESC
      LIMIT 5
    `)

    // Heures de pointe pour le partage
    const peakHours = await query(`
      SELECT 
        EXTRACT(HOUR FROM created_at) as hour,
        COUNT(*) as count
      FROM idea_shares 
      WHERE created_at > NOW() - INTERVAL '7 days'
      GROUP BY EXTRACT(HOUR FROM created_at)
      ORDER BY count DESC
      LIMIT 5
    `)

    res.json({
      daily_shares: dailyShares.rows,
      top_platforms: topPlatforms.rows,
      peak_hours: peakHours.rows.map(row => ({
        hour: parseInt(row.hour),
        count: parseInt(row.count)
      }))
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des tendances:', error)
    res.status(500).json({ error: 'Erreur lors de la récupération des tendances' })
  }
})

export default router
