#!/usr/bin/env node

/**
 * Script pour vérifier les contraintes sur la table ideas
 */

import { query } from './api/database.js'

async function checkConstraints() {
  console.log('🔍 Vérification des contraintes sur la table ideas')
  console.log('=' .repeat(60))
  
  try {
    // Vérifier toutes les contraintes sur la table ideas
    console.log('📋 Contraintes sur la table ideas:')
    const constraints = await query(`
      SELECT 
        conname as constraint_name,
        contype as constraint_type,
        pg_get_constraintdef(oid) as constraint_definition
      FROM pg_constraint 
      WHERE conrelid = 'ideas'::regclass
      ORDER BY conname
    `)
    
    constraints.rows.forEach((constraint, index) => {
      console.log(`\n   ${index + 1}. ${constraint.constraint_name}`)
      console.log(`      Type: ${constraint.constraint_type}`)
      console.log(`      Définition: ${constraint.constraint_definition}`)
    })
    
    // Vérifier spécifiquement la contrainte willingness_to_pay
    console.log('\n🎯 Contrainte willingness_to_pay_check:')
    const willingnessConstraint = await query(`
      SELECT pg_get_constraintdef(oid) as definition
      FROM pg_constraint 
      WHERE conname = 'ideas_willingness_to_pay_check'
    `)
    
    if (willingnessConstraint.rows.length > 0) {
      console.log(`   Définition: ${willingnessConstraint.rows[0].definition}`)
    } else {
      console.log('   Contrainte non trouvée')
    }
    
    // Vérifier les valeurs autorisées
    console.log('\n📊 Analyse de la contrainte:')
    console.log('   Cette contrainte limite probablement les valeurs autorisées')
    console.log('   pour le champ willingness_to_pay à une liste prédéfinie.')
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

// Exécuter la vérification
if (import.meta.url === `file://${process.argv[1]}`) {
  checkConstraints().then(() => {
    console.log('\n✅ Vérification terminée')
    process.exit(0)
  }).catch(error => {
    console.error('❌ Erreur:', error)
    process.exit(1)
  })
}

export { checkConstraints }
