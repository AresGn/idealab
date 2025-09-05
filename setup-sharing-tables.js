#!/usr/bin/env node

/**
 * Script pour créer les tables nécessaires au système de partage
 */

import { query } from './api/database.js'

async function setupSharingTables() {
  console.log('🔧 Configuration des tables de partage')
  console.log('=' .repeat(50))
  
  try {
    // 1. Ajouter la colonne shares_count à la table ideas si elle n'existe pas
    console.log('📊 Ajout de la colonne shares_count à la table ideas...')
    
    try {
      await query(`
        ALTER TABLE ideas 
        ADD COLUMN shares_count INTEGER DEFAULT 0
      `)
      console.log('   ✅ Colonne shares_count ajoutée')
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('   ℹ️  Colonne shares_count existe déjà')
      } else {
        throw error
      }
    }

    // 2. Créer la table idea_shares
    console.log('\n📋 Création de la table idea_shares...')
    
    await query(`
      CREATE TABLE IF NOT EXISTS idea_shares (
        id SERIAL PRIMARY KEY,
        idea_id INTEGER NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(50) NOT NULL,
        platform VARCHAR(50),
        share_url TEXT,
        ip_address INET,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Créer les index séparément
    console.log('   📊 Création des index...')

    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_idea_shares_idea_id ON idea_shares(idea_id)',
      'CREATE INDEX IF NOT EXISTS idx_idea_shares_platform ON idea_shares(platform)',
      'CREATE INDEX IF NOT EXISTS idx_idea_shares_created_at ON idea_shares(created_at)',
      'CREATE INDEX IF NOT EXISTS idx_idea_shares_action ON idea_shares(action)'
    ]

    for (const indexQuery of indexes) {
      try {
        await query(indexQuery)
      } catch (error) {
        console.log(`   ℹ️  Index déjà existant: ${error.message}`)
      }
    }
    console.log('   ✅ Table idea_shares créée')

    // 3. Initialiser les compteurs de partage existants
    console.log('\n🔄 Initialisation des compteurs de partage...')
    
    const updateResult = await query(`
      UPDATE ideas 
      SET shares_count = 0 
      WHERE shares_count IS NULL
    `)
    console.log(`   ✅ ${updateResult.rowCount} idées mises à jour`)

    // 4. Créer des index supplémentaires pour les performances
    console.log('\n⚡ Création d\'index pour les performances...')
    
    try {
      await query(`
        CREATE INDEX IF NOT EXISTS idx_ideas_shares_count 
        ON ideas(shares_count DESC)
      `)
      console.log('   ✅ Index sur shares_count créé')
    } catch (error) {
      console.log('   ℹ️  Index shares_count existe déjà')
    }

    // 5. Vérifier la structure créée
    console.log('\n✅ Vérification de la structure...')
    
    const tableCheck = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'idea_shares'
      ORDER BY ordinal_position
    `)
    
    console.log('   Colonnes de la table idea_shares:')
    tableCheck.rows.forEach(col => {
      console.log(`     - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`)
    })

    // 6. Vérifier la colonne shares_count dans ideas
    const ideasCheck = await query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns 
      WHERE table_name = 'ideas' AND column_name = 'shares_count'
    `)
    
    if (ideasCheck.rows.length > 0) {
      const col = ideasCheck.rows[0]
      console.log(`\n   Colonne shares_count dans ideas: ${col.data_type} DEFAULT ${col.column_default}`)
    }

    // 7. Créer quelques données de test
    console.log('\n🧪 Création de données de test...')
    
    const testIdea = await query('SELECT id FROM ideas LIMIT 1')
    if (testIdea.rows.length > 0) {
      const ideaId = testIdea.rows[0].id
      
      // Ajouter quelques partages de test
      await query(`
        INSERT INTO idea_shares (idea_id, action, platform, ip_address)
        VALUES 
          ($1, 'link_copied', 'direct', '127.0.0.1'),
          ($1, 'whatsapp', 'whatsapp', '127.0.0.1'),
          ($1, 'twitter', 'twitter', '127.0.0.1')
        ON CONFLICT DO NOTHING
      `, [ideaId])
      
      // Mettre à jour le compteur
      await query(`
        UPDATE ideas 
        SET shares_count = (
          SELECT COUNT(*) 
          FROM idea_shares 
          WHERE idea_id = $1 AND platform IS NOT NULL
        )
        WHERE id = $1
      `, [ideaId])
      
      console.log(`   ✅ Données de test créées pour l'idée ${ideaId}`)
    }

    console.log('\n🎉 Configuration terminée avec succès!')
    console.log('\n📋 Résumé:')
    console.log('   ✅ Table idea_shares créée')
    console.log('   ✅ Colonne shares_count ajoutée à ideas')
    console.log('   ✅ Index de performance créés')
    console.log('   ✅ Données de test ajoutées')
    
    console.log('\n💡 Prochaines étapes:')
    console.log('   - Intégrer le composant ShareButton dans les vues d\'idées')
    console.log('   - Ajouter les routes de partage à l\'API')
    console.log('   - Tester le système de partage')

  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error)
    process.exit(1)
  }
}

// Exécuter la configuration
if (import.meta.url === `file://${process.argv[1]}`) {
  setupSharingTables().then(() => {
    console.log('✅ Script terminé')
    process.exit(0)
  }).catch(error => {
    console.error('❌ Erreur:', error)
    process.exit(1)
  })
}

export { setupSharingTables }
