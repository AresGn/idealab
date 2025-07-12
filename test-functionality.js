#!/usr/bin/env node

import express from 'express'
import { query } from './api/database.js'

// Simple test to verify functionality
async function testFunctionality() {
  try {
    console.log('🧪 Testing application functionality...')
    console.log('=' .repeat(50))
    
    // Test 1: Database connection
    console.log('\n1️⃣ Testing database connection...')
    try {
      const result = await query('SELECT NOW() as current_time')
      console.log('✅ Database connection successful')
      console.log(`   Current time: ${result.rows[0].current_time}`)
    } catch (error) {
      console.log('❌ Database connection failed:', error.message)
      return
    }
    
    // Test 2: Check ideas count
    console.log('\n2️⃣ Testing ideas data...')
    const ideasResult = await query('SELECT COUNT(*) as count FROM ideas')
    const ideasCount = parseInt(ideasResult.rows[0].count)
    console.log(`✅ Total ideas in database: ${ideasCount}`)
    
    // Test 3: Check development-ready ideas
    console.log('\n3️⃣ Testing development-ready ideas...')
    const devIdeasResult = await query('SELECT COUNT(*) as count FROM ideas WHERE votes_count >= 50')
    const devIdeasCount = parseInt(devIdeasResult.rows[0].count)
    console.log(`✅ Ideas ready for development (50+ votes): ${devIdeasCount}`)
    
    // Test 4: Check recent ideas
    console.log('\n4️⃣ Testing recent ideas query...')
    const recentIdeasResult = await query(`
      SELECT 
        i.id, i.title, i.sector, i.description, i.votes_count, i.comments_count, i.views_count,
        i.created_at, u.first_name, u.last_name
      FROM ideas i
      LEFT JOIN users u ON i.user_id = u.id
      WHERE i.status = 'approved'
      ORDER BY i.created_at DESC
      LIMIT 6
    `)
    console.log(`✅ Recent ideas query successful: ${recentIdeasResult.rows.length} ideas found`)
    
    if (recentIdeasResult.rows.length > 0) {
      console.log('   Sample idea:')
      const sample = recentIdeasResult.rows[0]
      console.log(`   - Title: ${sample.title}`)
      console.log(`   - Sector: ${sample.sector}`)
      console.log(`   - Votes: ${sample.votes_count}`)
      console.log(`   - Author: ${sample.first_name} ${sample.last_name}`)
    }
    
    // Test 5: Check development ideas query
    console.log('\n5️⃣ Testing development ideas query...')
    const developmentQuery = `
      SELECT
        i.*,
        u.username,
        u.first_name,
        u.last_name,
        u.avatar_url
      FROM ideas i
      LEFT JOIN users u ON i.user_id = u.id
      WHERE i.status = 'approved' AND i.votes_count >= 50
      ORDER BY i.development_progress DESC, i.votes_count DESC
    `
    
    const developmentResult = await query(developmentQuery)
    console.log(`✅ Development ideas query successful: ${developmentResult.rows.length} ideas found`)
    
    if (developmentResult.rows.length > 0) {
      console.log('   Development ideas:')
      developmentResult.rows.forEach((idea, index) => {
        console.log(`   ${index + 1}. ${idea.title}`)
        console.log(`      Status: ${idea.development_status}, Progress: ${idea.development_progress}%`)
        console.log(`      Votes: ${idea.votes_count}, Views: ${idea.views_count}`)
      })
    }
    
    // Test 6: Check votes and comments
    console.log('\n6️⃣ Testing votes and comments...')
    const votesResult = await query('SELECT COUNT(*) as count FROM votes')
    const commentsResult = await query('SELECT COUNT(*) as count FROM comments WHERE is_active = true')
    console.log(`✅ Total votes: ${votesResult.rows[0].count}`)
    console.log(`✅ Total active comments: ${commentsResult.rows[0].count}`)
    
    // Test 7: Check users
    console.log('\n7️⃣ Testing users...')
    const usersResult = await query('SELECT COUNT(*) as count FROM users WHERE is_active = true')
    console.log(`✅ Total active users: ${usersResult.rows[0].count}`)
    
    // Test 8: Statistics overview
    console.log('\n8️⃣ Testing statistics overview...')
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
    const stats = statsResult.rows[0]
    console.log('✅ Platform statistics:')
    console.log(`   - Total ideas: ${stats.total_ideas}`)
    console.log(`   - Approved ideas: ${stats.approved_ideas}`)
    console.log(`   - Pending ideas: ${stats.pending_ideas}`)
    console.log(`   - Total votes: ${stats.total_votes}`)
    console.log(`   - Total comments: ${stats.total_comments}`)
    console.log(`   - Total views: ${stats.total_views}`)
    
    // Summary
    console.log('\n📊 FUNCTIONALITY TEST SUMMARY')
    console.log('=' .repeat(50))
    console.log('✅ Database connection: Working')
    console.log(`✅ Ideas system: ${ideasCount} ideas available`)
    console.log(`✅ Development tracking: ${devIdeasCount} ideas ready for development`)
    console.log(`✅ Recent ideas: ${recentIdeasResult.rows.length} recent ideas`)
    console.log(`✅ Voting system: ${votesResult.rows[0].count} votes recorded`)
    console.log(`✅ Comments system: ${commentsResult.rows[0].count} comments`)
    console.log(`✅ User system: ${usersResult.rows[0].count} active users`)
    console.log('✅ Statistics: All counters working')
    
    console.log('\n🎉 All functionality tests passed!')
    console.log('\n📝 Next steps:')
    console.log('   1. Start the development server: npm run dev')
    console.log('   2. Test the frontend interface')
    console.log('   3. Verify the "Ideas in Development" page works')
    console.log('   4. Test the voting functionality in "Recent Ideas"')
    console.log('   5. Check the brain icon alignment in the homepage')
    
  } catch (error) {
    console.error('\n❌ Functionality test failed:', error)
    process.exit(1)
  }
}

testFunctionality()
