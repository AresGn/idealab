import pkg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pkg

// Database configuration
const dbConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'idea_platform',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      ssl: { rejectUnauthorized: false },
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
    }

// Create connection pool
const pool = new Pool(dbConfig)

// Log database configuration (without sensitive data)
console.log('🔧 Database configuration:')
console.log('  Using DATABASE_URL:', !!process.env.DATABASE_URL)
console.log('  Host:', process.env.DATABASE_URL ? 'From URL' : process.env.DB_HOST)
console.log('  Database:', process.env.DB_NAME)
console.log('  Connection timeout:', dbConfig.connectionTimeoutMillis || 'default')

// Test database connection
pool.on('connect', (client) => {
  console.log('✅ New client connected to PostgreSQL database')
})

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client:', err.message)
  console.error('   Error code:', err.code)
  if (err.address) {
    console.error('   Address:', err.address)
    console.error('   Port:', err.port)
  }
  // Don't exit the process, just log the error
})

// Database query helper function
export const query = async (text, params) => {
  const start = Date.now()
  try {
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    console.log('📊 Executed query', { text, duration, rows: res.rowCount })
    return res
  } catch (error) {
    console.error('❌ Database query error:', error)
    throw error
  }
}

// Get a client from the pool for transactions
export const getClient = async () => {
  try {
    const client = await pool.connect()
    return client
  } catch (error) {
    console.error('❌ Error getting database client:', error)
    throw error
  }
}

// Initialize database tables
export const initializeDatabase = async () => {
  try {
    console.log('🔧 Initializing database tables...')
    
    // Create users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        avatar_url VARCHAR(500),
        role VARCHAR(20) DEFAULT 'user',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // Create ideas table
    await query(`
      CREATE TABLE IF NOT EXISTS ideas (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        sector VARCHAR(100) NOT NULL,
        target_audience VARCHAR(200),
        willingness_to_pay VARCHAR(20),
        estimated_budget VARCHAR(100),
        status VARCHAR(20) DEFAULT 'approved',
        votes_count INTEGER DEFAULT 0,
        comments_count INTEGER DEFAULT 0,
        views_count INTEGER DEFAULT 0,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        -- Design Thinking fields
        design_thinking_mode BOOLEAN DEFAULT false,
        completion_percentage INTEGER DEFAULT 0,
        -- EMPATHIZE
        empathy_target_users TEXT,
        empathy_needs_frustrations TEXT,
        empathy_usage_context TEXT,
        -- DEFINE
        define_problem_statement TEXT,
        define_importance_reason TEXT,
        define_objective TEXT,
        -- IDEATE
        ideate_proposed_solution TEXT,
        ideate_alternatives_considered TEXT,
        ideate_inspiration_references TEXT
      )
    `)
    
    // Create votes table
    await query(`
      CREATE TABLE IF NOT EXISTS votes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        idea_id INTEGER REFERENCES ideas(id) ON DELETE CASCADE,
        vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('up', 'down')),
        session_id VARCHAR(255),
        ip_address INET,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create payment_votes table
    await query(`
      CREATE TABLE IF NOT EXISTS payment_votes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        idea_id INTEGER REFERENCES ideas(id) ON DELETE CASCADE,
        vote_type VARCHAR(20) NOT NULL CHECK (vote_type IN ('would_pay', 'would_not_pay')),
        session_id VARCHAR(255),
        ip_address INET,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // Create comments table
    await query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        idea_id INTEGER REFERENCES ideas(id) ON DELETE CASCADE,
        parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
        author_email VARCHAR(255),
        author_name VARCHAR(255),
        session_id VARCHAR(255),
        ip_address INET,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // Migration: Add Design Thinking columns if they don't exist
    try {
      await query(`ALTER TABLE ideas ADD COLUMN IF NOT EXISTS design_thinking_mode BOOLEAN DEFAULT false`)
      await query(`ALTER TABLE ideas ADD COLUMN IF NOT EXISTS completion_percentage INTEGER DEFAULT 0`)
      await query(`ALTER TABLE ideas ADD COLUMN IF NOT EXISTS empathy_target_users TEXT`)
      await query(`ALTER TABLE ideas ADD COLUMN IF NOT EXISTS empathy_needs_frustrations TEXT`)
      await query(`ALTER TABLE ideas ADD COLUMN IF NOT EXISTS empathy_usage_context TEXT`)
      await query(`ALTER TABLE ideas ADD COLUMN IF NOT EXISTS define_problem_statement TEXT`)
      await query(`ALTER TABLE ideas ADD COLUMN IF NOT EXISTS define_importance_reason TEXT`)
      await query(`ALTER TABLE ideas ADD COLUMN IF NOT EXISTS define_objective TEXT`)
      await query(`ALTER TABLE ideas ADD COLUMN IF NOT EXISTS ideate_proposed_solution TEXT`)
      await query(`ALTER TABLE ideas ADD COLUMN IF NOT EXISTS ideate_alternatives_considered TEXT`)
      await query(`ALTER TABLE ideas ADD COLUMN IF NOT EXISTS ideate_inspiration_references TEXT`)

      // Update default status to 'approved' for auto-publication
      await query(`ALTER TABLE ideas ALTER COLUMN status SET DEFAULT 'approved'`)

      // Make description nullable for Design Thinking mode
      await query(`ALTER TABLE ideas ALTER COLUMN description DROP NOT NULL`)

      // Add development tracking columns
      await query(`ALTER TABLE ideas ADD COLUMN IF NOT EXISTS development_status VARCHAR(20) DEFAULT 'not_started'`)
      await query(`ALTER TABLE ideas ADD COLUMN IF NOT EXISTS development_progress INTEGER DEFAULT 0`)
      await query(`ALTER TABLE ideas ADD COLUMN IF NOT EXISTS development_started_at TIMESTAMP`)
      await query(`ALTER TABLE ideas ADD COLUMN IF NOT EXISTS development_completed_at TIMESTAMP`)

      console.log('✅ Design Thinking and development columns migration completed successfully')
    } catch (error) {
      console.log('ℹ️ Migration already applied or error:', error.message)
    }

    // Create indexes for better performance
    await query(`CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON ideas(user_id)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_ideas_sector ON ideas(sector)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_ideas_design_thinking ON ideas(design_thinking_mode)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at DESC)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_ideas_development_status ON ideas(development_status)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_ideas_development_progress ON ideas(development_progress)`)

    // Votes indexes
    await query(`CREATE INDEX IF NOT EXISTS idx_votes_idea_id ON votes(idea_id)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_votes_session_id ON votes(session_id)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_votes_ip_address ON votes(ip_address)`)

    // Payment votes indexes
    await query(`CREATE INDEX IF NOT EXISTS idx_payment_votes_idea_id ON payment_votes(idea_id)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_payment_votes_user_id ON payment_votes(user_id)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_payment_votes_session_id ON payment_votes(session_id)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_payment_votes_ip_address ON payment_votes(ip_address)`)

    // Comments indexes
    await query(`CREATE INDEX IF NOT EXISTS idx_comments_idea_id ON comments(idea_id)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_comments_email ON comments(author_email)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_comments_session_id ON comments(session_id)`)

    // Create unique constraints for preventing duplicate votes
    // For authenticated users
    await query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_votes_user_idea_unique
                 ON votes(user_id, idea_id) WHERE user_id IS NOT NULL`)
    await query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_votes_user_idea_unique
                 ON payment_votes(user_id, idea_id) WHERE user_id IS NOT NULL`)

    // For anonymous users (session-based)
    await query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_votes_session_idea_unique
                 ON votes(session_id, idea_id) WHERE session_id IS NOT NULL AND user_id IS NULL`)
    await query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_votes_session_idea_unique
                 ON payment_votes(session_id, idea_id) WHERE session_id IS NOT NULL AND user_id IS NULL`)

    console.log('✅ Database tables initialized successfully')
    
  } catch (error) {
    console.error('❌ Error initializing database:', error)
    throw error
  }
}

// Test database connection
export const testConnection = async () => {
  try {
    console.log('🧪 Testing database connection...')
    const result = await query('SELECT NOW() as current_time, version() as version')
    console.log('✅ Database connection successful!')
    console.log('   Current time:', result.rows[0].current_time)
    console.log('   PostgreSQL version:', result.rows[0].version.split(' ')[0])
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    console.error('   Error code:', error.code)
    if (error.address) {
      console.error('   Address:', error.address)
      console.error('   Port:', error.port)
    }
    return false
  }
}

// Close database connection
export const closeDatabase = async () => {
  try {
    await pool.end()
    console.log('✅ Database connection closed')
  } catch (error) {
    console.error('❌ Error closing database connection:', error)
  }
}

// Export all ideas to JSON for backup
export const exportIdeasToJSON = async () => {
  try {
    console.log('🔄 Exporting all ideas to JSON...')

    // Get all ideas with user information
    const ideasQuery = `
      SELECT
        i.*,
        u.username,
        u.first_name,
        u.last_name,
        u.email,
        u.avatar_url
      FROM ideas i
      LEFT JOIN users u ON i.user_id = u.id
      ORDER BY i.created_at DESC
    `

    const ideasResult = await query(ideasQuery)

    // Get all votes
    const votesQuery = `
      SELECT
        v.*,
        u.username
      FROM votes v
      LEFT JOIN users u ON v.user_id = u.id
      ORDER BY v.created_at DESC
    `

    const votesResult = await query(votesQuery)

    // Get all comments
    const commentsQuery = `
      SELECT
        c.*,
        u.username,
        i.title as idea_title
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN ideas i ON c.idea_id = i.id
      WHERE c.is_active = true
      ORDER BY c.created_at DESC
    `

    const commentsResult = await query(commentsQuery)

    // Get platform statistics
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

    const statsResult = await query(statsQuery)

    // Get user count
    const userCountResult = await query('SELECT COUNT(*) as total_users FROM users WHERE is_active = true')

    const exportData = {
      export_info: {
        timestamp: new Date().toISOString(),
        total_ideas: ideasResult.rows.length,
        total_votes: votesResult.rows.length,
        total_comments: commentsResult.rows.length,
        platform_stats: {
          ...statsResult.rows[0],
          total_users: parseInt(userCountResult.rows[0].total_users)
        }
      },
      ideas: ideasResult.rows,
      votes: votesResult.rows,
      comments: commentsResult.rows
    }

    console.log(`✅ Successfully exported ${ideasResult.rows.length} ideas, ${votesResult.rows.length} votes, and ${commentsResult.rows.length} comments`)

    return exportData

  } catch (error) {
    console.error('❌ Error exporting ideas:', error)
    throw error
  }
}

// Clear all ideas and reset statistics
export const clearAllIdeasAndStats = async () => {
  try {
    console.log('🔄 Clearing all ideas and resetting statistics...')

    // Start transaction
    await query('BEGIN')

    // Delete all comments first (due to foreign key constraints)
    await query('DELETE FROM comments')
    console.log('✅ Deleted all comments')

    // Delete all votes
    await query('DELETE FROM votes')
    console.log('✅ Deleted all votes')

    // Delete all payment votes if table exists
    try {
      await query('DELETE FROM payment_votes')
      console.log('✅ Deleted all payment votes')
    } catch (error) {
      // Table might not exist, continue
      console.log('ℹ️ Payment votes table not found, skipping...')
    }

    // Delete all ideas
    await query('DELETE FROM ideas')
    console.log('✅ Deleted all ideas')

    // Reset sequences to start from 1
    await query('ALTER SEQUENCE ideas_id_seq RESTART WITH 1')
    await query('ALTER SEQUENCE votes_id_seq RESTART WITH 1')
    await query('ALTER SEQUENCE comments_id_seq RESTART WITH 1')

    try {
      await query('ALTER SEQUENCE payment_votes_id_seq RESTART WITH 1')
    } catch (error) {
      // Sequence might not exist, continue
    }

    console.log('✅ Reset all sequences')

    // Commit transaction
    await query('COMMIT')

    console.log('✅ Successfully cleared all ideas and reset statistics')

    return {
      success: true,
      message: 'All ideas, votes, comments deleted and statistics reset',
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    // Rollback transaction on error
    await query('ROLLBACK')
    console.error('❌ Error clearing ideas and stats:', error)
    throw error
  }
}

export default pool
