import pkg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pkg

// Database configuration
const dbConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'idea_platform',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
    }

// Create connection pool
const pool = new Pool(dbConfig)

// Test database connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database')
})

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err)
  process.exit(-1)
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
        description TEXT NOT NULL,
        sector VARCHAR(100) NOT NULL,
        target_audience VARCHAR(200),
        willingness_to_pay VARCHAR(20),
        estimated_budget VARCHAR(100),
        status VARCHAR(20) DEFAULT 'pending',
        votes_count INTEGER DEFAULT 0,
        comments_count INTEGER DEFAULT 0,
        views_count INTEGER DEFAULT 0,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
    
    // Create indexes for better performance
    await query(`CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON ideas(user_id)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_ideas_sector ON ideas(sector)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at DESC)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_votes_idea_id ON votes(idea_id)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_comments_idea_id ON comments(idea_id)`)
    
    console.log('✅ Database tables initialized successfully')
    
  } catch (error) {
    console.error('❌ Error initializing database:', error)
    throw error
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
