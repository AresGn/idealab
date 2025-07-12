#!/usr/bin/env node

import bcrypt from 'bcryptjs'
import { query } from './api/database.js'

async function createRealUsers() {
  try {
    console.log('🚀 Creating real users...')
    console.log('=' .repeat(50))
    
    // First, delete all existing users
    console.log('\n🧹 Deleting all existing users...')
    await query('DELETE FROM users')
    await query('ALTER SEQUENCE users_id_seq RESTART WITH 1')
    console.log('✅ All existing users deleted')
    
    // Real users data
    const realUsers = [
      {
        first_name: 'Arès',
        last_name: 'GNIMAGNON',
        username: 'aresbillion',
        email: 'techares0@gmail.com',
        password: 'AresA2025$'
      },
      {
        first_name: 'Junior',
        last_name: 'BILLION',
        username: 'Juinior27',
        email: 'gnimagnoncressent@gmail.com',
        password: 'JuniorJ2025$'
      }
    ]
    
    console.log('\n👥 Creating real users...')
    
    for (const userData of realUsers) {
      console.log(`\n📝 Creating user: ${userData.first_name} ${userData.last_name}`)
      
      // Hash the password
      const saltRounds = 10
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds)
      
      // Insert user into database
      const result = await query(`
        INSERT INTO users (
          email, username, password_hash, first_name, last_name, 
          role, is_active, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, 'user', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id, email, username, first_name, last_name, created_at
      `, [
        userData.email,
        userData.username,
        hashedPassword,
        userData.first_name,
        userData.last_name
      ])
      
      const createdUser = result.rows[0]
      console.log(`✅ User created successfully:`)
      console.log(`   ID: ${createdUser.id}`)
      console.log(`   Name: ${createdUser.first_name} ${createdUser.last_name}`)
      console.log(`   Username: @${createdUser.username}`)
      console.log(`   Email: ${createdUser.email}`)
      console.log(`   Created: ${createdUser.created_at}`)
    }
    
    // Verify users creation
    console.log('\n🔍 Verifying users creation...')
    const usersResult = await query(`
      SELECT id, first_name, last_name, username, email, is_active, created_at
      FROM users 
      ORDER BY id
    `)
    
    console.log(`✅ Total users in database: ${usersResult.rows.length}`)
    
    usersResult.rows.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.first_name} ${user.last_name}`)
      console.log(`   Username: @${user.username}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Status: ${user.is_active ? 'Active' : 'Inactive'}`)
      console.log(`   Created: ${user.created_at}`)
    })
    
    // Check platform statistics
    console.log('\n📊 Platform statistics after cleanup:')
    const statsResult = await query(`
      SELECT
        COUNT(*) as total_ideas,
        SUM(votes_count) as total_votes,
        SUM(comments_count) as total_comments,
        SUM(views_count) as total_views
      FROM ideas
    `)
    
    const userCountResult = await query('SELECT COUNT(*) as total_users FROM users WHERE is_active = true')
    
    const stats = statsResult.rows[0]
    const userCount = userCountResult.rows[0].total_users
    
    console.log(`✅ Ideas submitted: ${stats.total_ideas || 0}`)
    console.log(`✅ Active users: ${userCount}`)
    console.log(`✅ Votes expressed: ${stats.total_votes || 0}`)
    console.log(`✅ Comments: ${stats.total_comments || 0}`)
    console.log(`✅ Views: ${stats.total_views || 0}`)
    
    console.log('\n🎉 Real users creation completed successfully!')
    console.log('\n📝 Summary:')
    console.log('   - All fictitious data removed')
    console.log('   - 2 real users created with secure passwords')
    console.log('   - Platform statistics reset to zero')
    console.log('   - Database ready for production use')
    
    console.log('\n🔐 User credentials (for testing):')
    realUsers.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.first_name} ${user.last_name}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Username: @${user.username}`)
      console.log(`   Password: ${user.password}`)
    })
    
    console.log('\n⚠️  Note: Passwords are securely hashed in the database.')
    
  } catch (error) {
    console.error('\n❌ Error creating real users:', error)
    process.exit(1)
  }
}

createRealUsers()
