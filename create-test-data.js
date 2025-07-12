#!/usr/bin/env node

import { query } from './api/database.js'

async function createTestData() {
  try {
    console.log('🚀 Creating test data...')
    
    // Create test users first
    console.log('👥 Creating test users...')
    
    const users = [
      {
        email: 'john.doe@example.com',
        username: 'johndoe',
        password_hash: '$2a$10$example.hash.here',
        first_name: 'John',
        last_name: 'Doe'
      },
      {
        email: 'jane.smith@example.com',
        username: 'janesmith',
        password_hash: '$2a$10$example.hash.here',
        first_name: 'Jane',
        last_name: 'Smith'
      },
      {
        email: 'alex.johnson@example.com',
        username: 'alexjohnson',
        password_hash: '$2a$10$example.hash.here',
        first_name: 'Alex',
        last_name: 'Johnson'
      }
    ]
    
    for (const user of users) {
      try {
        await query(`
          INSERT INTO users (email, username, password_hash, first_name, last_name)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (email) DO NOTHING
        `, [user.email, user.username, user.password_hash, user.first_name, user.last_name])
      } catch (error) {
        console.log(`User ${user.username} might already exist, skipping...`)
      }
    }
    
    console.log('✅ Test users created')
    
    // Create test ideas
    console.log('💡 Creating test ideas...')
    
    const ideas = [
      {
        title: 'Application de covoiturage pour zones rurales',
        description: 'Une solution de transport partagé adaptée aux routes africaines et aux besoins des communautés rurales.',
        sector: 'Transport',
        target_audience: 'Populations rurales',
        willingness_to_pay: 'low',
        estimated_budget: '50000-100000',
        votes_count: 75,
        comments_count: 12,
        views_count: 234,
        development_status: 'in_progress',
        development_progress: 35
      },
      {
        title: 'Plateforme d\'éducation en langues locales',
        description: 'Système d\'apprentissage utilisant les langues vernaculaires pour améliorer l\'accès à l\'éducation.',
        sector: 'Éducation',
        target_audience: 'Étudiants et enseignants',
        willingness_to_pay: 'medium',
        estimated_budget: '100000-200000',
        votes_count: 92,
        comments_count: 18,
        views_count: 456,
        development_status: 'in_progress',
        development_progress: 60
      },
      {
        title: 'Système de micro-crédit communautaire',
        description: 'Plateforme digitale pour faciliter l\'accès au crédit dans les communautés rurales.',
        sector: 'Finance',
        target_audience: 'Entrepreneurs ruraux',
        willingness_to_pay: 'high',
        estimated_budget: '200000-500000',
        votes_count: 128,
        comments_count: 25,
        views_count: 678,
        development_status: 'completed',
        development_progress: 100
      },
      {
        title: 'Application de télémédecine mobile',
        description: 'Solution de consultation médicale à distance pour les zones mal desservies.',
        sector: 'Santé',
        target_audience: 'Patients en zones rurales',
        willingness_to_pay: 'medium',
        estimated_budget: '150000-300000',
        votes_count: 67,
        comments_count: 15,
        views_count: 345,
        development_status: 'in_progress',
        development_progress: 25
      },
      {
        title: 'Marketplace pour produits agricoles locaux',
        description: 'Plateforme de vente directe entre producteurs et consommateurs.',
        sector: 'Agriculture',
        target_audience: 'Agriculteurs et consommateurs',
        willingness_to_pay: 'medium',
        estimated_budget: '75000-150000',
        votes_count: 45,
        comments_count: 8,
        views_count: 189,
        development_status: 'not_started',
        development_progress: 0
      },
      {
        title: 'Système de gestion des déchets intelligents',
        description: 'Solution IoT pour optimiser la collecte et le recyclage des déchets urbains.',
        sector: 'Environnement',
        target_audience: 'Municipalités',
        willingness_to_pay: 'high',
        estimated_budget: '300000-500000',
        votes_count: 156,
        comments_count: 32,
        views_count: 789,
        development_status: 'in_progress',
        development_progress: 80
      }
    ]
    
    for (let i = 0; i < ideas.length; i++) {
      const idea = ideas[i]
      const userId = (i % 3) + 1 // Distribute ideas among the 3 test users
      
      const result = await query(`
        INSERT INTO ideas (
          title, description, sector, target_audience, willingness_to_pay, 
          estimated_budget, votes_count, comments_count, views_count,
          development_status, development_progress, user_id, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'approved')
        RETURNING id
      `, [
        idea.title, idea.description, idea.sector, idea.target_audience,
        idea.willingness_to_pay, idea.estimated_budget, idea.votes_count,
        idea.comments_count, idea.views_count, idea.development_status,
        idea.development_progress, userId
      ])
      
      console.log(`✅ Created idea: ${idea.title} (ID: ${result.rows[0].id})`)
    }
    
    console.log('✅ Test ideas created')
    
    // Create some test votes
    console.log('🗳️ Creating test votes...')
    
    // Get all ideas
    const ideasResult = await query('SELECT id FROM ideas')
    const ideaIds = ideasResult.rows.map(row => row.id)
    
    // Create votes for each idea
    for (const ideaId of ideaIds) {
      for (let userId = 1; userId <= 3; userId++) {
        try {
          await query(`
            INSERT INTO votes (user_id, idea_id, vote_type)
            VALUES ($1, $2, 'up')
            ON CONFLICT (user_id, idea_id) DO NOTHING
          `, [userId, ideaId])
        } catch (error) {
          // Ignore conflicts
        }
      }
    }
    
    console.log('✅ Test votes created')
    
    // Create some test comments
    console.log('💬 Creating test comments...')
    
    const comments = [
      'Excellente idée ! Cela pourrait vraiment aider nos communautés.',
      'J\'aimerais contribuer à ce projet. Comment puis-je m\'impliquer ?',
      'Avez-vous pensé aux défis de connectivité dans les zones rurales ?',
      'Cette solution existe-t-elle déjà ailleurs ? Quelle serait la différence ?',
      'Le budget semble réaliste. Avez-vous des partenaires potentiels ?'
    ]
    
    for (let i = 0; i < ideaIds.length; i++) {
      const ideaId = ideaIds[i]
      const comment = comments[i % comments.length]
      const userId = (i % 3) + 1
      
      await query(`
        INSERT INTO comments (content, user_id, idea_id)
        VALUES ($1, $2, $3)
      `, [comment, userId, ideaId])
    }
    
    console.log('✅ Test comments created')
    
    // Summary
    console.log('\n📊 Test data creation summary:')
    const statsResult = await query(`
      SELECT 
        COUNT(*) as total_ideas,
        COUNT(CASE WHEN votes_count >= 50 THEN 1 END) as development_ready_ideas,
        SUM(votes_count) as total_votes,
        SUM(comments_count) as total_comments
      FROM ideas
    `)
    
    const stats = statsResult.rows[0]
    console.log(`✅ ${stats.total_ideas} ideas created`)
    console.log(`✅ ${stats.development_ready_ideas} ideas ready for development (50+ votes)`)
    console.log(`✅ ${stats.total_votes} total votes`)
    console.log(`✅ ${stats.total_comments} total comments`)
    
    console.log('\n🎉 Test data creation completed successfully!')
    
  } catch (error) {
    console.error('❌ Error creating test data:', error)
    process.exit(1)
  }
}

createTestData()
