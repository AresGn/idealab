import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { query } from '../database.js'

const router = express.Router()

// POST /api/auth/register - Register a new user
router.post('/register', async (req, res) => {
  try {
    const { email, username, password, first_name, last_name } = req.body

    // Validation
    if (!email || !username || !password) {
      return res.status(400).json({
        error: 'Email, username, and password are required'
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters long'
      })
    }

    // Check if user already exists
    const existingUserQuery = `
      SELECT id FROM users 
      WHERE email = $1 OR username = $2
    `
    const existingUser = await query(existingUserQuery, [email, username])

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        error: 'User with this email or username already exists'
      })
    }

    // Hash password
    const saltRounds = 12
    const password_hash = await bcrypt.hash(password, saltRounds)

    // Create user
    const insertUserQuery = `
      INSERT INTO users (email, username, password_hash, first_name, last_name)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, username, first_name, last_name, created_at
    `

    const result = await query(insertUserQuery, [
      email.toLowerCase(),
      username,
      password_hash,
      first_name,
      last_name
    ])

    const user = result.rows[0]

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        username: user.username 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        created_at: user.created_at
      },
      token
    })

  } catch (error) {
    console.error('Error registering user:', error)
    res.status(500).json({ error: 'Failed to register user' })
  }
})

// POST /api/auth/login - Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      })
    }

    // Find user
    const userQuery = `
      SELECT id, email, username, password_hash, first_name, last_name, role, is_active
      FROM users 
      WHERE email = $1
    `
    const result = await query(userQuery, [email.toLowerCase()])

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Invalid email or password'
      })
    }

    const user = result.rows[0]

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        error: 'Account is deactivated'
      })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash)

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid email or password'
      })
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role
      },
      token
    })

  } catch (error) {
    console.error('Error logging in user:', error)
    res.status(500).json({ error: 'Failed to login' })
  }
})

// POST /api/auth/refresh - Refresh JWT token
router.post('/refresh', async (req, res) => {
  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({
        error: 'Token is required'
      })
    }

    // Verify existing token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Check if user still exists and is active
    const userQuery = `
      SELECT id, email, username, role, is_active
      FROM users 
      WHERE id = $1
    `
    const result = await query(userQuery, [decoded.userId])

    if (result.rows.length === 0 || !result.rows[0].is_active) {
      return res.status(401).json({
        error: 'Invalid token'
      })
    }

    const user = result.rows[0]

    // Generate new token
    const newToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    res.json({
      message: 'Token refreshed successfully',
      token: newToken
    })

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Invalid or expired token'
      })
    }

    console.error('Error refreshing token:', error)
    res.status(500).json({ error: 'Failed to refresh token' })
  }
})

// GET /api/auth/me - Get current user info
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authorization token required'
      })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Get user info
    const userQuery = `
      SELECT 
        u.id, u.email, u.username, u.first_name, u.last_name, 
        u.avatar_url, u.role, u.created_at,
        COUNT(DISTINCT i.id) as ideas_count,
        COALESCE(SUM(i.votes_count), 0) as total_votes
      FROM users u
      LEFT JOIN ideas i ON u.id = i.user_id AND i.status = 'approved'
      WHERE u.id = $1 AND u.is_active = true
      GROUP BY u.id, u.email, u.username, u.first_name, u.last_name, 
               u.avatar_url, u.role, u.created_at
    `

    const result = await query(userQuery, [decoded.userId])

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Invalid token'
      })
    }

    res.json({
      user: result.rows[0]
    })

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Invalid or expired token'
      })
    }

    console.error('Error getting user info:', error)
    res.status(500).json({ error: 'Failed to get user info' })
  }
})

// POST /api/auth/logout - Logout user (client-side token removal)
router.post('/logout', (req, res) => {
  // In a JWT-based system, logout is typically handled client-side
  // by removing the token from storage
  res.json({
    message: 'Logout successful. Please remove the token from client storage.'
  })
})

export default router
