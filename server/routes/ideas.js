import express from 'express'
import { query } from '../database.js'

const router = express.Router()

// GET /api/ideas - Get all ideas with pagination and filtering
router.get('/', async (req, res) => {
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

    // Validate sort field
    const allowedSortFields = ['created_at', 'votes_count', 'comments_count', 'title']
    const sortField = allowedSortFields.includes(sort) ? sort : 'created_at'
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'

    const ideasQuery = `
      SELECT 
        i.*,
        u.username,
        u.first_name,
        u.last_name
      FROM ideas i
      LEFT JOIN users u ON i.user_id = u.id
      ${whereClause}
      ORDER BY i.${sortField} ${sortOrder}
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

// GET /api/ideas/:id - Get a specific idea
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

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
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      sector,
      target_audience,
      willingness_to_pay,
      estimated_budget,
      user_id = 1 // TODO: Get from authentication middleware
    } = req.body

    // Validation
    if (!title || !description || !sector) {
      return res.status(400).json({
        error: 'Title, description, and sector are required'
      })
    }

    if (title.length > 200) {
      return res.status(400).json({
        error: 'Title must be less than 200 characters'
      })
    }

    const insertQuery = `
      INSERT INTO ideas (
        title, description, sector, target_audience, 
        willingness_to_pay, estimated_budget, user_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `

    const result = await query(insertQuery, [
      title,
      description,
      sector,
      target_audience,
      willingness_to_pay,
      estimated_budget,
      user_id
    ])

    res.status(201).json({
      message: 'Idea created successfully',
      idea: result.rows[0]
    })

  } catch (error) {
    console.error('Error creating idea:', error)
    res.status(500).json({ error: 'Failed to create idea' })
  }
})

// PUT /api/ideas/:id - Update an idea
router.put('/:id', async (req, res) => {
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

    // TODO: Add authorization check (user can only update their own ideas)

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
router.delete('/:id', async (req, res) => {
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

export default router
