#!/usr/bin/env node

/**
 * Script pour corriger la taille du champ willingness_to_pay
 */

import { query } from './api/database.js'

async function fixWillingnessToPayField() {
  console.log('🔧 Correction du champ willingness_to_pay')
  console.log('=' .repeat(50))
  
  try {
    // Vérifier la structure actuelle
    console.log('🔍 Vérification de la structure actuelle...')
    const currentStructure = await query(`
      SELECT column_name, data_type, character_maximum_length 
      FROM information_schema.columns 
      WHERE table_name = 'ideas' AND column_name = 'willingness_to_pay'
    `)
    
    if (currentStructure.rows.length > 0) {
      const col = currentStructure.rows[0]
      console.log(`   Colonne trouvée: ${col.column_name}`)
      console.log(`   Type: ${col.data_type}`)
      console.log(`   Taille max: ${col.character_maximum_length}`)
    }
    
    // Sauvegarder la définition de la vue popular_ideas
    console.log('\n💾 Sauvegarde de la vue popular_ideas...')
    const viewDefinition = await query(`
      SELECT definition
      FROM pg_views
      WHERE viewname = 'popular_ideas'
    `)

    let viewDef = null
    if (viewDefinition.rows.length > 0) {
      viewDef = viewDefinition.rows[0].definition
      console.log('   Vue trouvée et sauvegardée')
    }

    // Supprimer la vue temporairement
    console.log('\n🗑️  Suppression temporaire de la vue...')
    await query(`DROP VIEW IF EXISTS popular_ideas`)

    // Modifier la taille du champ
    console.log('\n🔧 Modification de la taille du champ...')
    await query(`
      ALTER TABLE ideas
      ALTER COLUMN willingness_to_pay TYPE VARCHAR(200)
    `)

    // Recréer la vue si elle existait
    if (viewDef) {
      console.log('\n🔄 Recréation de la vue popular_ideas...')
      await query(`CREATE VIEW popular_ideas AS ${viewDef}`)
      console.log('   Vue recréée avec succès')
    }
    
    console.log('✅ Champ willingness_to_pay modifié avec succès!')
    
    // Vérifier la nouvelle structure
    console.log('\n✅ Vérification de la nouvelle structure...')
    const newStructure = await query(`
      SELECT column_name, data_type, character_maximum_length 
      FROM information_schema.columns 
      WHERE table_name = 'ideas' AND column_name = 'willingness_to_pay'
    `)
    
    if (newStructure.rows.length > 0) {
      const col = newStructure.rows[0]
      console.log(`   Colonne: ${col.column_name}`)
      console.log(`   Type: ${col.data_type}`)
      console.log(`   Nouvelle taille max: ${col.character_maximum_length}`)
    }
    
    console.log('\n🎉 Correction terminée avec succès!')
    console.log('   Le champ willingness_to_pay peut maintenant accepter jusqu\'à 200 caractères')
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error)
    process.exit(1)
  }
}

// Exécuter la correction
if (import.meta.url === `file://${process.argv[1]}`) {
  fixWillingnessToPayField().then(() => {
    console.log('✅ Script terminé')
    process.exit(0)
  }).catch(error => {
    console.error('❌ Erreur:', error)
    process.exit(1)
  })
}

export { fixWillingnessToPayField }
