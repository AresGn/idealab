#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { exportIdeasToJSON, clearAllIdeasAndStats } from './api/database.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function main() {
  try {
    console.log('🚀 Starting backup and cleanup process...')
    console.log('=' .repeat(50))
    
    // Step 1: Export all ideas to JSON
    console.log('\n📦 Step 1: Exporting all ideas to JSON backup...')
    const exportData = await exportIdeasToJSON()
    
    // Create backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupFilename = `ideas-backup-${timestamp}.json`
    const backupPath = path.join(__dirname, 'backups', backupFilename)
    
    // Create backups directory if it doesn't exist
    const backupsDir = path.join(__dirname, 'backups')
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true })
      console.log('📁 Created backups directory')
    }
    
    // Write backup file
    fs.writeFileSync(backupPath, JSON.stringify(exportData, null, 2))
    console.log(`✅ Backup saved to: ${backupPath}`)
    console.log(`📊 Backup contains:`)
    console.log(`   - ${exportData.ideas.length} ideas`)
    console.log(`   - ${exportData.votes.length} votes`)
    console.log(`   - ${exportData.comments.length} comments`)
    console.log(`   - Platform statistics included`)
    
    // Step 2: Ask for confirmation before clearing data
    console.log('\n⚠️  Step 2: Data Cleanup Confirmation')
    console.log('=' .repeat(50))
    console.log('🔴 WARNING: This will permanently delete ALL ideas, votes, and comments!')
    console.log('🔴 WARNING: All statistics will be reset to zero!')
    console.log('🔴 WARNING: This action cannot be undone!')
    console.log(`✅ Backup has been saved to: ${backupFilename}`)
    
    // In a real scenario, you might want to add a confirmation prompt
    // For now, we'll add a safety check
    const shouldProceed = process.argv.includes('--confirm-delete')
    
    if (!shouldProceed) {
      console.log('\n❌ Cleanup cancelled for safety.')
      console.log('💡 To proceed with cleanup, run: node backup-and-clean.js --confirm-delete')
      console.log('📦 Backup has been created successfully and can be found in the backups folder.')
      return
    }
    
    console.log('\n🧹 Proceeding with data cleanup...')
    
    // Step 3: Clear all data and reset statistics
    const cleanupResult = await clearAllIdeasAndStats()
    
    console.log('\n✅ Cleanup completed successfully!')
    console.log('📊 All counters have been reset to zero')
    console.log('🔄 Database sequences have been reset')
    
    // Step 4: Summary
    console.log('\n📋 SUMMARY')
    console.log('=' .repeat(50))
    console.log(`✅ Backup created: ${backupFilename}`)
    console.log(`✅ ${exportData.ideas.length} ideas backed up and deleted`)
    console.log(`✅ ${exportData.votes.length} votes backed up and deleted`)
    console.log(`✅ ${exportData.comments.length} comments backed up and deleted`)
    console.log('✅ All statistics reset to zero')
    console.log('✅ Database sequences reset')
    console.log('\n🎉 Process completed successfully!')
    
  } catch (error) {
    console.error('\n❌ Error during backup and cleanup process:')
    console.error(error)
    process.exit(1)
  }
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('📖 Backup and Cleanup Tool')
  console.log('=' .repeat(30))
  console.log('This tool exports all ideas to JSON backup and optionally clears the database.')
  console.log('')
  console.log('Usage:')
  console.log('  node backup-and-clean.js                    # Create backup only')
  console.log('  node backup-and-clean.js --confirm-delete   # Create backup AND clear database')
  console.log('  node backup-and-clean.js --help             # Show this help')
  console.log('')
  console.log('⚠️  WARNING: The --confirm-delete flag will permanently delete all data!')
  process.exit(0)
}

main()
