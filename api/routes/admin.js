import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { exportIdeasToJSON, clearAllIdeasAndStats } from '../database.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Middleware to check admin role (you might want to implement proper admin check)
const requireAdmin = (req, res, next) => {
  // For now, just check if user is authenticated
  // In production, you should check for admin role
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' })
  }
  // TODO: Add proper admin role check
  // if (req.user.role !== 'admin') {
  //   return res.status(403).json({ error: 'Admin access required' })
  // }
  next()
}

// POST /api/admin/export-ideas - Export all ideas to JSON
router.post('/export-ideas', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('📦 Admin export request from user:', req.user.username)
    
    const exportData = await exportIdeasToJSON()
    
    // Create backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupFilename = `ideas-backup-${timestamp}.json`
    
    // Set response headers for file download
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', `attachment; filename="${backupFilename}"`)
    
    // Send the export data as downloadable JSON
    res.json(exportData)
    
    console.log(`✅ Export completed for user ${req.user.username}`)
    console.log(`📊 Exported: ${exportData.ideas.length} ideas, ${exportData.votes.length} votes, ${exportData.comments.length} comments`)
    
  } catch (error) {
    console.error('❌ Error during export:', error)
    res.status(500).json({ 
      error: 'Failed to export ideas',
      details: error.message 
    })
  }
})

// POST /api/admin/clear-all-data - Clear all ideas and reset statistics
router.post('/clear-all-data', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { confirmDelete } = req.body
    
    if (!confirmDelete) {
      return res.status(400).json({ 
        error: 'Confirmation required',
        message: 'You must set confirmDelete to true to proceed with data deletion'
      })
    }
    
    console.log('🧹 Admin data cleanup request from user:', req.user.username)
    console.log('⚠️  WARNING: Proceeding with complete data deletion')
    
    const result = await clearAllIdeasAndStats()
    
    console.log(`✅ Data cleanup completed by user ${req.user.username}`)
    
    res.json({
      success: true,
      message: 'All ideas, votes, and comments have been deleted. Statistics have been reset.',
      timestamp: result.timestamp,
      performed_by: req.user.username
    })
    
  } catch (error) {
    console.error('❌ Error during data cleanup:', error)
    res.status(500).json({ 
      error: 'Failed to clear data',
      details: error.message 
    })
  }
})

// POST /api/admin/backup-and-clear - Export backup then clear all data
router.post('/backup-and-clear', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { confirmDelete } = req.body
    
    if (!confirmDelete) {
      return res.status(400).json({ 
        error: 'Confirmation required',
        message: 'You must set confirmDelete to true to proceed with backup and deletion'
      })
    }
    
    console.log('🚀 Admin backup and cleanup request from user:', req.user.username)
    
    // Step 1: Export data
    console.log('📦 Creating backup...')
    const exportData = await exportIdeasToJSON()
    
    // Create backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupFilename = `ideas-backup-${timestamp}.json`
    
    // Create backups directory if it doesn't exist
    const backupsDir = path.join(path.dirname(__dirname), '..', 'backups')
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true })
    }
    
    // Save backup file
    const backupPath = path.join(backupsDir, backupFilename)
    fs.writeFileSync(backupPath, JSON.stringify(exportData, null, 2))
    
    console.log(`✅ Backup saved: ${backupFilename}`)
    
    // Step 2: Clear all data
    console.log('🧹 Clearing all data...')
    const clearResult = await clearAllIdeasAndStats()
    
    console.log(`✅ Backup and cleanup completed by user ${req.user.username}`)
    
    res.json({
      success: true,
      message: 'Backup created and all data cleared successfully',
      backup: {
        filename: backupFilename,
        path: backupPath,
        ideas_count: exportData.ideas.length,
        votes_count: exportData.votes.length,
        comments_count: exportData.comments.length
      },
      cleanup: clearResult,
      performed_by: req.user.username
    })
    
  } catch (error) {
    console.error('❌ Error during backup and cleanup:', error)
    res.status(500).json({ 
      error: 'Failed to backup and clear data',
      details: error.message 
    })
  }
})

// GET /api/admin/stats - Get detailed admin statistics
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const exportData = await exportIdeasToJSON()
    
    res.json({
      current_stats: exportData.export_info.platform_stats,
      detailed_counts: {
        total_ideas: exportData.ideas.length,
        total_votes: exportData.votes.length,
        total_comments: exportData.comments.length
      },
      last_checked: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Error fetching admin stats:', error)
    res.status(500).json({ 
      error: 'Failed to fetch admin statistics',
      details: error.message 
    })
  }
})

export default router
