#!/usr/bin/env node

/**
 * Script pour supprimer la contrainte restrictive sur willingness_to_pay
 */

import { query } from './api/database.js'

async function fixWillingnessConstraint() {
  console.log('🔧 Suppression de la contrainte restrictive sur willingness_to_pay')
  console.log('=' .repeat(60))
  
  try {
    // Vérifier la contrainte actuelle
    console.log('🔍 Vérification de la contrainte actuelle...')
    const currentConstraint = await query(`
      SELECT pg_get_constraintdef(oid) as definition
      FROM pg_constraint 
      WHERE conname = 'ideas_willingness_to_pay_check'
    `)
    
    if (currentConstraint.rows.length > 0) {
      console.log(`   Contrainte trouvée: ${currentConstraint.rows[0].definition}`)
    } else {
      console.log('   Aucune contrainte trouvée')
      return
    }
    
    // Supprimer la contrainte restrictive
    console.log('\n🗑️  Suppression de la contrainte...')
    await query(`
      ALTER TABLE ideas 
      DROP CONSTRAINT ideas_willingness_to_pay_check
    `)
    
    console.log('✅ Contrainte supprimée avec succès!')
    
    // Vérifier que la contrainte a été supprimée
    console.log('\n✅ Vérification de la suppression...')
    const checkRemoval = await query(`
      SELECT pg_get_constraintdef(oid) as definition
      FROM pg_constraint 
      WHERE conname = 'ideas_willingness_to_pay_check'
    `)
    
    if (checkRemoval.rows.length === 0) {
      console.log('   ✅ Contrainte supprimée avec succès')
    } else {
      console.log('   ⚠️  La contrainte existe encore')
    }
    
    // Tester avec une valeur libre
    console.log('\n🧪 Test avec une valeur libre...')
    try {
      await query(`
        UPDATE ideas 
        SET willingness_to_pay = 'Test de valeur libre - 50 USD/mois'
        WHERE id = 1
      `)
      console.log('   ✅ Test réussi - Les valeurs libres sont maintenant acceptées')
      
      // Remettre la valeur originale
      await query(`
        UPDATE ideas 
        SET willingness_to_pay = 'high'
        WHERE id = 1
      `)
      
    } catch (testError) {
      console.log(`   ❌ Test échoué: ${testError.message}`)
    }
    
    console.log('\n🎉 Correction terminée!')
    console.log('   Le champ willingness_to_pay accepte maintenant du texte libre')
    console.log('   Les utilisateurs peuvent saisir des réponses personnalisées')
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error)
    process.exit(1)
  }
}

// Exécuter la correction
if (import.meta.url === `file://${process.argv[1]}`) {
  fixWillingnessConstraint().then(() => {
    console.log('✅ Script terminé')
    process.exit(0)
  }).catch(error => {
    console.error('❌ Erreur:', error)
    process.exit(1)
  })
}

export { fixWillingnessConstraint }
