import express from 'express'
import { query } from '../database.js'

const router = express.Router()

// GET /api/users/profile/:id - Get user profile
router.get('/profile/:id', async (req, res) => {
  try {
    const { id } = req.params

    const userQuery = `
      SELECT 
        u.id,
        u.username,
        u.first_name,
        u.last_name,
        u.avatar_url,
        u.created_at,
        COUNT(DISTINCT i.id) as ideas_count,
        COALESCE(SUM(i.votes_count), 0) as total_votes,
        COALESCE(SUM(i.comments_count), 0) as total_comments
      FROM users u
      LEFT JOIN ideas i ON u.id = i.user_id AND i.status = 'approved'
      WHERE u.id = $1 AND u.is_active = true
      GROUP BY u.id, u.username, u.first_name, u.last_name, u.avatar_url, u.created_at
    `

    const result = await query(userQuery, [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    const user = result.rows[0]

    // Get user's recent ideas
    const ideasQuery = `
      SELECT id, title, sector, votes_count, comments_count, views_count, status, created_at
      FROM ideas
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 10
    `

    const ideasResult = await query(ideasQuery, [id])
    user.recent_ideas = ideasResult.rows

    res.json(user)

  } catch (error) {
    console.error('Error fetching user profile:', error)
    res.status(500).json({ error: 'Failed to fetch user profile' })
  }
})

// GET /api/users/dashboard/:id - Get user dashboard data
router.get('/dashboard/:id', async (req, res) => {
  try {
    const { id } = req.params

    // Get user statistics
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT i.id) as ideas_submitted,
        COALESCE(SUM(i.votes_count), 0) as total_votes,
        COALESCE(SUM(i.comments_count), 0) as total_comments,
        COALESCE(SUM(i.views_count), 0) as total_views
      FROM ideas i
      WHERE i.user_id = $1
    `

    const statsResult = await query(statsQuery, [id])
    const userStats = statsResult.rows[0]

    // Get user rank (based on total votes received)
    const rankQuery = `
      SELECT COUNT(*) + 1 as rank
      FROM (
        SELECT user_id, SUM(votes_count) as total_votes
        FROM ideas
        WHERE status = 'approved'
        GROUP BY user_id
        HAVING SUM(votes_count) > (
          SELECT COALESCE(SUM(votes_count), 0)
          FROM ideas
          WHERE user_id = $1 AND status = 'approved'
        )
      ) ranked_users
    `

    const rankResult = await query(rankQuery, [id])
    userStats.rank = parseInt(rankResult.rows[0].rank)

    // Get user's ideas with detailed info
    const ideasQuery = `
      SELECT 
        id, title, sector, description, status,
        votes_count, comments_count, views_count,
        created_at, updated_at
      FROM ideas
      WHERE user_id = $1
      ORDER BY created_at DESC
    `

    const ideasResult = await query(ideasQuery, [id])

    // Get recent activity (votes and comments on user's ideas)
    const activityQuery = `
      SELECT 
        'vote' as type,
        i.title as idea_title,
        v.created_at,
        'Nouveau vote sur votre idée "' || i.title || '"' as message
      FROM votes v
      JOIN ideas i ON v.idea_id = i.id
      WHERE i.user_id = $1
      
      UNION ALL
      
      SELECT 
        'comment' as type,
        i.title as idea_title,
        c.created_at,
        'Nouveau commentaire sur votre idée "' || i.title || '"' as message
      FROM comments c
      JOIN ideas i ON c.idea_id = i.id
      WHERE i.user_id = $1 AND c.user_id != $1
      
      ORDER BY created_at DESC
      LIMIT 10
    `

    const activityResult = await query(activityQuery, [id])

    res.json({
      stats: userStats,
      ideas: ideasResult.rows,
      recent_activity: activityResult.rows
    })

  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    res.status(500).json({ error: 'Failed to fetch dashboard data' })
  }
})

// GET /api/users/leaderboard - Get top users leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const { limit = 10 } = req.query

    const leaderboardQuery = `
      SELECT 
        u.id,
        u.username,
        u.first_name,
        u.last_name,
        u.avatar_url,
        COUNT(DISTINCT i.id) as ideas_count,
        COALESCE(SUM(i.votes_count), 0) as total_votes,
        COALESCE(SUM(i.comments_count), 0) as total_comments,
        COALESCE(AVG(i.votes_count), 0) as avg_votes_per_idea
      FROM users u
      LEFT JOIN ideas i ON u.id = i.user_id AND i.status = 'approved'
      WHERE u.is_active = true
      GROUP BY u.id, u.username, u.first_name, u.last_name, u.avatar_url
      HAVING COUNT(DISTINCT i.id) > 0
      ORDER BY total_votes DESC, ideas_count DESC
      LIMIT $1
    `

    const result = await query(leaderboardQuery, [limit])

    res.json({
      leaderboard: result.rows.map((user, index) => ({
        ...user,
        rank: index + 1
      }))
    })

  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    res.status(500).json({ error: 'Failed to fetch leaderboard' })
  }
})

// PUT /api/users/profile/:id - Update user profile
router.put('/profile/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { first_name, last_name, avatar_url } = req.body

    // TODO: Add authentication middleware to ensure user can only update their own profile

    const updateQuery = `
      UPDATE users 
      SET 
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        avatar_url = COALESCE($3, avatar_url),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4 AND is_active = true
      RETURNING id, username, first_name, last_name, avatar_url, updated_at
    `

    const result = await query(updateQuery, [first_name, last_name, avatar_url, id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      message: 'Profile updated successfully',
      user: result.rows[0]
    })

  } catch (error) {
    console.error('Error updating profile:', error)
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

// GET /api/users/search - Search users
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' })
    }

    const searchQuery = `
      SELECT 
        u.id,
        u.username,
        u.first_name,
        u.last_name,
        u.avatar_url,
        COUNT(DISTINCT i.id) as ideas_count,
        COALESCE(SUM(i.votes_count), 0) as total_votes
      FROM users u
      LEFT JOIN ideas i ON u.id = i.user_id AND i.status = 'approved'
      WHERE u.is_active = true 
        AND (
          u.username ILIKE $1 
          OR u.first_name ILIKE $1 
          OR u.last_name ILIKE $1
          OR CONCAT(u.first_name, ' ', u.last_name) ILIKE $1
        )
      GROUP BY u.id, u.username, u.first_name, u.last_name, u.avatar_url
      ORDER BY total_votes DESC, ideas_count DESC
      LIMIT $2
    `

    const searchTerm = `%${q.trim()}%`
    const result = await query(searchQuery, [searchTerm, limit])

    res.json({
      users: result.rows,
      query: q.trim()
    })

  } catch (error) {
    console.error('Error searching users:', error)
    res.status(500).json({ error: 'Failed to search users' })
  }
})

export default router
