import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

// Import routes
import ideaRoutes from './routes/ideas.js'
import userRoutes from './routes/users.js'
import authRoutes from './routes/auth.js'
import voteRoutes from './routes/votes.js'

// Import database functions
import { testConnection } from './database.js'

// Load environment variables
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
  crossOriginEmbedderPolicy: false
}))

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}))

// Logging middleware
app.use(morgan('combined'))

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// API Routes
app.use('/api/ideas', ideaRoutes)
app.use('/api/users', userRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/votes', voteRoutes)

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'public')))
  
  // Handle client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'))
  })
} else {
  // Development route
  app.get('/', (req, res) => {
    res.json({
      message: 'IdéaLab API',
      version: '1.0.0',
      documentation: '/api/docs',
      status: 'Development Mode'
    })
  })
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack)
  
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  })
})

// 404 handler for API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    error: {
      message: 'API endpoint not found',
      status: 404,
      path: req.path
    }
  })
})

// Start server only if not in Vercel environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, async () => {
    console.log(`🚀 Server running on port ${PORT}`)
    console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`)
    console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`)

    if (process.env.NODE_ENV !== 'production') {
      console.log(`📋 API Documentation: http://localhost:${PORT}/api`)
      console.log(`❤️  Health Check: http://localhost:${PORT}/api/health`)
    }

    // Test database connection
    console.log('')
    await testConnection()
    console.log('')
  })
}

export default app
