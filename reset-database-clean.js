#!/usr/bin/env node

/**
 * Script de remise à zéro de la base de données
 * Supprime votes, sessions, IPs et garde seulement les 2 premières idées
 * Usage: node reset-database-clean.js
 */

import { query } from './api/database.js'
import dotenv from 'dotenv'

dotenv.config()

console.log('🔄 REMISE À ZÉRO DE LA BASE DE DONNÉES')
console.log('=' .repeat(50))

async function resetDatabase() {
  try {
    console.log('🚀 Démarrage de la remise à zéro...\n')

    // 1. Supprimer tous les votes standards
    console.log('1️⃣ Suppression des votes standards...')
    const votesResult = await query('DELETE FROM votes')
    console.log(`   ✅ ${votesResult.rowCount || 0} votes supprimés`)

    // 2. Supprimer tous les votes de paiement
    console.log('2️⃣ Suppression des votes de paiement...')
    const paymentVotesResult = await query('DELETE FROM payment_votes')
    console.log(`   ✅ ${paymentVotesResult.rowCount || 0} votes de paiement supprimés`)

    // 3. Supprimer tous les commentaires
    console.log('3️⃣ Suppression des commentaires...')
    const commentsResult = await query('DELETE FROM comments')
    console.log(`   ✅ ${commentsResult.rowCount || 0} commentaires supprimés`)

    // 4. Identifier les 2 premières idées à conserver
    console.log('4️⃣ Identification des idées à conserver...')
    const firstTwoIdeas = await query(`
      SELECT id, title, sector, created_at
      FROM ideas 
      ORDER BY created_at ASC 
      LIMIT 2
    `)
    
    if (firstTwoIdeas.rows.length === 0) {
      console.log('   ⚠️  Aucune idée trouvée dans la base')
      return false
    }

    console.log('   📋 Idées à conserver:')
    firstTwoIdeas.rows.forEach((idea, index) => {
      const date = new Date(idea.created_at).toLocaleDateString('fr-FR')
      console.log(`      ${index + 1}. [ID: ${idea.id}] ${idea.title} (${idea.sector}) - ${date}`)
    })

    // 5. Supprimer toutes les autres idées
    if (firstTwoIdeas.rows.length > 0) {
      const idsToKeep = firstTwoIdeas.rows.map(row => row.id)
      const placeholders = idsToKeep.map((_, i) => `$${i + 1}`).join(', ')
      
      console.log('5️⃣ Suppression des idées excédentaires...')
      const deleteIdeasResult = await query(`
        DELETE FROM ideas 
        WHERE id NOT IN (${placeholders})
      `, idsToKeep)
      
      console.log(`   ✅ ${deleteIdeasResult.rowCount || 0} idées supprimées`)
    }

    // 6. Réinitialiser les compteurs des idées conservées
    console.log('6️⃣ Réinitialisation des compteurs...')
    const resetCountersResult = await query(`
      UPDATE ideas 
      SET votes_count = 0, 
          comments_count = 0, 
          views_count = 0
    `)
    console.log(`   ✅ ${resetCountersResult.rowCount || 0} idées réinitialisées`)

    // 7. Vérification finale
    console.log('\n🔍 Vérification finale...')
    
    const finalStats = await query(`
      SELECT 
        (SELECT COUNT(*) FROM ideas) as ideas_count,
        (SELECT COUNT(*) FROM votes) as votes_count,
        (SELECT COUNT(*) FROM payment_votes) as payment_votes_count,
        (SELECT COUNT(*) FROM comments) as comments_count
    `)
    
    const stats = finalStats.rows[0]
    console.log('   📊 État final:')
    console.log(`      💡 Idées: ${stats.ideas_count}`)
    console.log(`      🗳️  Votes: ${stats.votes_count}`)
    console.log(`      💰 Votes paiement: ${stats.payment_votes_count}`)
    console.log(`      💬 Commentaires: ${stats.comments_count}`)

    // 8. Afficher les idées finales
    console.log('\n📋 Idées conservées:')
    const finalIdeas = await query(`
      SELECT id, title, sector, created_at, votes_count, comments_count, views_count
      FROM ideas 
      ORDER BY created_at ASC
    `)
    
    finalIdeas.rows.forEach((idea, index) => {
      const date = new Date(idea.created_at).toLocaleDateString('fr-FR')
      console.log(`   ${index + 1}. [ID: ${idea.id}] ${idea.title}`)
      console.log(`      📂 Secteur: ${idea.sector}`)
      console.log(`      📅 Créée: ${date}`)
      console.log(`      📊 Compteurs: ${idea.votes_count} votes | ${idea.comments_count} commentaires | ${idea.views_count} vues`)
      console.log('')
    })

    console.log('🎉 Remise à zéro terminée avec succès!')
    console.log('\n✅ RÉSUMÉ:')
    console.log('   🗳️  Tous les votes supprimés (IP reset)')
    console.log('   💬 Tous les commentaires supprimés')
    console.log('   💡 Seules les 2 premières idées conservées')
    console.log('   📊 Tous les compteurs remis à zéro')
    console.log('   🔒 Système anti-abus réinitialisé')
    
    return true

  } catch (error) {
    console.error('❌ Erreur lors de la remise à zéro:', error)
    console.error('   Message:', error.message)
    console.error('   Code:', error.code)
    return false
  }
}

// Exécution
async function main() {
  console.log('⚠️  Cette opération va:')
  console.log('   - Supprimer TOUS les votes et sessions')
  console.log('   - Supprimer TOUS les commentaires')
  console.log('   - Garder seulement les 2 PREMIÈRES idées')
  console.log('   - Remettre tous les compteurs à ZÉRO')
  console.log('')

  const success = await resetDatabase()
  
  if (success) {
    console.log('\n🚀 PRÊT POUR LES TESTS!')
    console.log('   Vous pouvez maintenant:')
    console.log('   1. Déployer vercel.json: git add . && git commit -m "Fix SPA routing" && git push')
    console.log('   2. Tester: node test-complete-flow.js')
    console.log('   3. Score attendu: 100/100')
  }
  
  process.exit(success ? 0 : 1)
}

main().catch(error => {
  console.error('💥 Erreur critique:', error)
  process.exit(1)
})
