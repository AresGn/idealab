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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, idea_id)
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

      console.log('✅ Design Thinking columns migration completed successfully')
    } catch (error) {
      console.log('ℹ️ Migration already applied or error:', error.message)
    }

    // Create indexes for better performance
    await query(`CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON ideas(user_id)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_ideas_sector ON ideas(sector)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_ideas_design_thinking ON ideas(design_thinking_mode)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at DESC)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_votes_idea_id ON votes(idea_id)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_comments_idea_id ON comments(idea_id)`)
    
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

export default pool
