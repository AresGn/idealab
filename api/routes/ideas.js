import express from 'express'
import { query } from '../database.js'
import { authenticateToken, optionalAuth, requireOwnership } from '../middleware/auth.js'

const router = express.Router()

// GET /api/ideas - Get all ideas with pagination and filtering
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sector,
      status = 'approved',
      sort = 'created_at',
      order = 'DESC'
    } = req.query

    const offset = (page - 1) * limit
    let whereClause = 'WHERE i.status = $1'
    let queryParams = [status]
    let paramCount = 1

    // Add sector filter if provided
    if (sector) {
      paramCount++
      whereClause += ` AND i.sector = $${paramCount}`
      queryParams.push(sector)
    }

    // Handle special sorting for trending ideas
    let orderClause = ''
    if (sort === 'trending') {
      // Trending algorithm: recent ideas with high engagement
      orderClause = `ORDER BY (
        (i.votes_count * 0.4) +
        (i.comments_count * 0.3) +
        (i.views_count * 0.1) +
        (CASE WHEN i.created_at > NOW() - INTERVAL '7 days' THEN 20 ELSE 0 END)
      ) DESC`
    } else {
      orderClause = `ORDER BY i.${sort} ${order}`
    }

    // Validate sort field for non-trending sorts
    const allowedSortFields = ['created_at', 'votes_count', 'comments_count', 'views_count', 'title']
    let finalOrderClause = orderClause

    if (sort !== 'trending') {
      const sortField = allowedSortFields.includes(sort) ? sort : 'created_at'
      const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'
      finalOrderClause = `ORDER BY i.${sortField} ${sortOrder}`
    }

    const ideasQuery = `
      SELECT
        i.*,
        u.username,
        u.first_name,
        u.last_name,
        u.avatar_url
      FROM ideas i
      LEFT JOIN users u ON i.user_id = u.id
      ${whereClause}
      ${finalOrderClause}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `

    queryParams.push(limit, offset)
    const result = await query(ideasQuery, queryParams)

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) FROM ideas i ${whereClause}`
    const countResult = await query(countQuery, queryParams.slice(0, paramCount))
    const totalCount = parseInt(countResult.rows[0].count)

    res.json({
      ideas: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching ideas:', error)
    res.status(500).json({ error: 'Failed to fetch ideas' })
  }
})

// GET /api/ideas/stats/overview - Get platform statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const statsQuery = `
      SELECT
        COUNT(*) as total_ideas,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_ideas,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_ideas,
        SUM(votes_count) as total_votes,
        SUM(comments_count) as total_comments,
        SUM(views_count) as total_views
      FROM ideas
    `

    const result = await query(statsQuery)
    const stats = result.rows[0]

    // Get user count
    const userCountResult = await query('SELECT COUNT(*) as total_users FROM users WHERE is_active = true')
    stats.total_users = parseInt(userCountResult.rows[0].total_users)

    res.json(stats)

  } catch (error) {
    console.error('Error fetching stats:', error)
    res.status(500).json({ error: 'Failed to fetch statistics' })
  }
})

// GET /api/ideas/stats/user/:userId - Get user-specific statistics
router.get('/stats/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params

    // Get user's ideas statistics
    const userStatsQuery = `
      SELECT
        COUNT(*) as ideas_submitted,
        SUM(votes_count) as total_votes,
        SUM(comments_count) as total_comments,
        SUM(views_count) as total_views,
        AVG(votes_count) as avg_votes_per_idea
      FROM ideas
      WHERE user_id = $1 AND status = 'approved'
    `

    const userStatsResult = await query(userStatsQuery, [userId])
    const userStats = userStatsResult.rows[0]

    // Get user's rank based on total votes
    const rankQuery = `
      SELECT COUNT(*) + 1 as rank
      FROM (
        SELECT user_id, SUM(votes_count) as total_votes
        FROM ideas
        WHERE status = 'approved'
        GROUP BY user_id
        HAVING SUM(votes_count) > $1
      ) ranked_users
    `

    const rankResult = await query(rankQuery, [userStats.total_votes || 0])
    userStats.rank = parseInt(rankResult.rows[0].rank)

    // Get monthly trends for the user (last 6 months)
    const trendsQuery = `
      SELECT
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as ideas_count,
        SUM(votes_count) as votes_received,
        SUM(comments_count) as comments_received
      FROM ideas
      WHERE user_id = $1 AND status = 'approved'
        AND created_at >= CURRENT_DATE - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
    `

    const trendsResult = await query(trendsQuery, [userId])
    userStats.monthly_trends = trendsResult.rows

    // Calculate growth metrics
    const currentMonth = userStats.monthly_trends[0]
    const previousMonth = userStats.monthly_trends[1]

    if (currentMonth && previousMonth) {
      userStats.ideas_growth = parseInt(currentMonth.ideas_count) - parseInt(previousMonth.ideas_count)
      userStats.votes_growth = parseInt(currentMonth.votes_received) - parseInt(previousMonth.votes_received)
      userStats.comments_growth = parseInt(currentMonth.comments_received) - parseInt(previousMonth.comments_received)
    } else {
      userStats.ideas_growth = currentMonth ? parseInt(currentMonth.ideas_count) : 0
      userStats.votes_growth = currentMonth ? parseInt(currentMonth.votes_received) : 0
      userStats.comments_growth = currentMonth ? parseInt(currentMonth.comments_received) : 0
    }

    res.json(userStats)
  } catch (error) {
    console.error('Error fetching user stats:', error)
    res.status(500).json({ error: 'Failed to fetch user statistics' })
  }
})

// GET /api/ideas/stats/trends - Get platform trends and analytics
router.get('/stats/trends', async (req, res) => {
  try {
    // Get monthly submission trends (last 12 months)
    const submissionTrendsQuery = `
      SELECT
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as ideas_count,
        SUM(votes_count) as total_votes,
        SUM(comments_count) as total_comments,
        COUNT(CASE WHEN design_thinking_mode = true THEN 1 END) as design_thinking_count
      FROM ideas
      WHERE status = 'approved'
        AND created_at >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month ASC
    `

    const submissionTrends = await query(submissionTrendsQuery)

    // Get sector distribution
    const sectorDistributionQuery = `
      SELECT
        sector,
        COUNT(*) as count,
        SUM(votes_count) as total_votes,
        AVG(votes_count) as avg_votes
      FROM ideas
      WHERE status = 'approved'
      GROUP BY sector
      ORDER BY count DESC
    `

    const sectorDistribution = await query(sectorDistributionQuery)

    // Get top performing ideas (last 30 days)
    const topIdeasQuery = `
      SELECT
        i.id, i.title, i.sector, i.votes_count, i.comments_count, i.views_count,
        u.username, u.first_name, u.last_name
      FROM ideas i
      LEFT JOIN users u ON i.user_id = u.id
      WHERE i.status = 'approved'
        AND i.created_at >= CURRENT_DATE - INTERVAL '30 days'
      ORDER BY i.votes_count DESC
      LIMIT 10
    `

    const topIdeas = await query(topIdeasQuery)

    res.json({
      submission_trends: submissionTrends.rows,
      sector_distribution: sectorDistribution.rows,
      top_ideas_last_30_days: topIdeas.rows
    })
  } catch (error) {
    console.error('Error fetching trends:', error)
    res.status(500).json({ error: 'Failed to fetch trends data' })
  }
})

// GET /api/ideas/in-development - Get ideas that are in development phase
router.get('/in-development', async (req, res) => {
  try {
    const { status = 'all', sort = 'progress' } = req.query

    let whereClause = 'WHERE i.status = $1 AND i.votes_count >= $2'
    let queryParams = ['approved', 50] // Minimum 50 votes to enter development
    let paramCount = 2

    // Add development status filter if provided
    if (status !== 'all') {
      paramCount++
      whereClause += ` AND i.development_status = $${paramCount}`
      queryParams.push(status)
    }

    // Handle sorting
    let orderClause = ''
    switch (sort) {
      case 'progress':
        orderClause = 'ORDER BY i.development_progress DESC'
        break
      case 'votes':
        orderClause = 'ORDER BY i.votes_count DESC'
        break
      case 'start_date':
        orderClause = 'ORDER BY i.development_start_date DESC'
        break
      default:
        orderClause = 'ORDER BY i.development_progress DESC'
    }

    const developmentQuery = `
      SELECT
        i.*,
        u.username,
        u.first_name,
        u.last_name,
        u.avatar_url
      FROM ideas i
      LEFT JOIN users u ON i.user_id = u.id
      ${whereClause}
      ${orderClause}
    `

    const result = await query(developmentQuery, queryParams)

    // Simulate development team data (in a real app, this would come from a separate table)
    const ideasWithTeams = result.rows.map(idea => ({
      ...idea,
      development_team: [
        { id: 1, name: 'Équipe de développement', role: 'Développeur' },
        { id: 2, name: 'Chef de projet', role: 'Manager' }
      ]
    }))

    res.json({
      ideas: ideasWithTeams,
      total: ideasWithTeams.length
    })

  } catch (error) {
    console.error('Error fetching development ideas:', error)
    res.status(500).json({ error: 'Failed to fetch development ideas' })
  }
})

// GET /api/ideas/:id - Get a specific idea
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    // Validate that id is a number
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ error: 'Invalid idea ID' })
    }

    // Increment view count
    await query('UPDATE ideas SET views_count = views_count + 1 WHERE id = $1', [id])

    // Get idea with user info
    const ideaQuery = `
      SELECT
        i.*,
        u.username,
        u.first_name,
        u.last_name,
        u.avatar_url
      FROM ideas i
      LEFT JOIN users u ON i.user_id = u.id
      WHERE i.id = $1
    `

    const result = await query(ideaQuery, [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Idea not found' })
    }

    res.json(result.rows[0])

  } catch (error) {
    console.error('Error fetching idea:', error)
    res.status(500).json({ error: 'Failed to fetch idea' })
  }
})

// POST /api/ideas - Create a new idea
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      title,
      description,
      sector,
      target_audience,
      willingness_to_pay,
      estimated_budget,
      user_id = req.user.id,
      // Design Thinking fields
      design_thinking_mode = false,
      completion_percentage = 0,
      // EMPATHIZE
      empathy_target_users,
      empathy_needs_frustrations,
      empathy_usage_context,
      // DEFINE
      define_problem_statement,
      define_importance_reason,
      define_objective,
      // IDEATE
      ideate_proposed_solution,
      ideate_alternatives_considered,
      ideate_inspiration_references
    } = req.body

    // Validation
    if (!title || !sector) {
      return res.status(400).json({
        error: 'Title and sector are required'
      })
    }

    if (title.length > 200) {
      return res.status(400).json({
        error: 'Title must be less than 200 characters'
      })
    }

    // Validation spécifique pour Design Thinking
    if (design_thinking_mode) {
      if (!empathy_target_users || !empathy_needs_frustrations || !empathy_usage_context) {
        return res.status(400).json({
          error: 'EMPATHIZE fields are required for Design Thinking mode'
        })
      }
      if (!define_problem_statement || !define_importance_reason || !define_objective) {
        return res.status(400).json({
          error: 'DEFINE fields are required for Design Thinking mode'
        })
      }
      if (!ideate_proposed_solution) {
        return res.status(400).json({
          error: 'IDEATE solution is required for Design Thinking mode'
        })
      }
    } else {
      // Validation classique
      if (!description) {
        return res.status(400).json({
          error: 'Description is required for standard mode'
        })
      }
    }

    const insertQuery = `
      INSERT INTO ideas (
        title, description, sector, target_audience,
        willingness_to_pay, estimated_budget, user_id, status,
        design_thinking_mode, completion_percentage,
        empathy_target_users, empathy_needs_frustrations, empathy_usage_context,
        define_problem_statement, define_importance_reason, define_objective,
        ideate_proposed_solution, ideate_alternatives_considered, ideate_inspiration_references
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'approved', $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *
    `

    const result = await query(insertQuery, [
      title,
      description || '', // Description peut être vide en mode Design Thinking
      sector,
      target_audience,
      willingness_to_pay,
      estimated_budget,
      user_id,
      design_thinking_mode,
      completion_percentage,
      empathy_target_users,
      empathy_needs_frustrations,
      empathy_usage_context,
      define_problem_statement,
      define_importance_reason,
      define_objective,
      ideate_proposed_solution,
      ideate_alternatives_considered,
      ideate_inspiration_references
    ])

    res.status(201).json({
      message: `Idea created successfully${design_thinking_mode ? ' with Design Thinking methodology' : ''}`,
      idea: result.rows[0]
    })

  } catch (error) {
    console.error('Error creating idea:', error)
    res.status(500).json({ error: 'Failed to create idea' })
  }
})

// PUT /api/ideas/:id - Update an idea
router.put('/:id', authenticateToken, requireOwnership('idea'), async (req, res) => {
  try {
    const { id } = req.params
    const {
      title,
      description,
      sector,
      target_audience,
      willingness_to_pay,
      estimated_budget
    } = req.body

    // Authorization is handled by requireOwnership middleware

    const updateQuery = `
      UPDATE ideas 
      SET 
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        sector = COALESCE($3, sector),
        target_audience = COALESCE($4, target_audience),
        willingness_to_pay = COALESCE($5, willingness_to_pay),
        estimated_budget = COALESCE($6, estimated_budget),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `

    const result = await query(updateQuery, [
      title,
      description,
      sector,
      target_audience,
      willingness_to_pay,
      estimated_budget,
      id
    ])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Idea not found' })
    }

    res.json({
      message: 'Idea updated successfully',
      idea: result.rows[0]
    })

  } catch (error) {
    console.error('Error updating idea:', error)
    res.status(500).json({ error: 'Failed to update idea' })
  }
})

// DELETE /api/ideas/:id - Delete an idea
router.delete('/:id', authenticateToken, requireOwnership('idea'), async (req, res) => {
  try {
    const { id } = req.params

    // TODO: Add authorization check (user can only delete their own ideas or admin)

    const result = await query('DELETE FROM ideas WHERE id = $1 RETURNING *', [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Idea not found' })
    }

    res.json({ message: 'Idea deleted successfully' })

  } catch (error) {
    console.error('Error deleting idea:', error)
    res.status(500).json({ error: 'Failed to delete idea' })
  }
})

export default router
