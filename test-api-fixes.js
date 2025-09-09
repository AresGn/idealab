#!/usr/bin/env node

/**
 * Script de test pour valider les corrections de l'API
 * Usage: node test-api-fixes.js
 */

import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

const BASE_URL = process.env.TEST_URL || 'https://idealab-six.vercel.app'
const API_URL = `${BASE_URL}/api`

console.log('🧪 Test des corrections de l\'API IdéaLab')
console.log('📍 URL de base:', BASE_URL)
console.log('=' .repeat(50))

async function testHealthEndpoint() {
  console.log('\n1. Test de l\'endpoint de santé...')
  try {
    const response = await axios.get(`${API_URL}/health`)
    console.log('✅ Health check réussi')
    console.log('   Status:', response.data.status)
    console.log('   Database:', response.data.database)
    console.log('   Environment:', response.data.environment)
    return true
  } catch (error) {
    console.log('❌ Health check échoué')
    console.log('   Error:', error.response?.data || error.message)
    return false
  }
}

async function testTestEndpoint() {
  console.log('\n2. Test de l\'endpoint de test...')
  try {
    const testData = {
      title: 'Test Idea',
      sector: 'Technology',
      description: 'This is a test idea'
    }
    
    const response = await axios.post(`${API_URL}/test/idea`, testData)
    console.log('✅ Test endpoint réussi')
    console.log('   Status:', response.data.status)
    console.log('   Database test:', response.data.database_test?.current_time)
    return true
  } catch (error) {
    console.log('❌ Test endpoint échoué')
    console.log('   Error:', error.response?.data || error.message)
    return false
  }
}

async function testIdeasEndpoint() {
  console.log('\n3. Test de récupération des idées...')
  try {
    const response = await axios.get(`${API_URL}/ideas`)
    console.log('✅ Récupération des idées réussie')
    console.log('   Nombre d\'idées:', response.data.ideas?.length || 0)
    console.log('   Pagination:', response.data.pagination)
    return true
  } catch (error) {
    console.log('❌ Récupération des idées échouée')
    console.log('   Error:', error.response?.data || error.message)
    return false
  }
}

async function testSPARouting() {
  console.log('\n4. Test du routage SPA...')
  const routes = [
    '/dashboard',
    '/ideas-in-development',
    '/idea/1',
    '/all-ideas'
  ]
  
  let successCount = 0
  
  for (const route of routes) {
    try {
      const response = await axios.get(`${BASE_URL}${route}`)
      if (response.status === 200 && response.data.includes('<!DOCTYPE html>')) {
        console.log(`✅ Route ${route} - OK`)
        successCount++
      } else {
        console.log(`❌ Route ${route} - Réponse inattendue`)
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log(`❌ Route ${route} - 404 (problème de routage SPA)`)
      } else {
        console.log(`❌ Route ${route} - Erreur: ${error.message}`)
      }
    }
  }
  
  console.log(`   Routes fonctionnelles: ${successCount}/${routes.length}`)
  return successCount === routes.length
}

async function runTests() {
  console.log('🚀 Démarrage des tests...\n')
  
  const results = {
    health: await testHealthEndpoint(),
    testEndpoint: await testTestEndpoint(),
    ideas: await testIdeasEndpoint(),
    routing: await testSPARouting()
  }
  
  console.log('\n' + '='.repeat(50))
  console.log('📊 RÉSULTATS DES TESTS')
  console.log('='.repeat(50))
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'RÉUSSI' : 'ÉCHOUÉ'}`)
  })
  
  const passedTests = Object.values(results).filter(Boolean).length
  const totalTests = Object.keys(results).length
  
  console.log(`\n🎯 Score: ${passedTests}/${totalTests} tests réussis`)
  
  if (passedTests === totalTests) {
    console.log('🎉 Tous les tests sont passés ! L\'API fonctionne correctement.')
  } else {
    console.log('⚠️  Certains tests ont échoué. Vérifiez les logs ci-dessus.')
  }
  
  return passedTests === totalTests
}

// Exécuter les tests
runTests().then(success => {
  process.exit(success ? 0 : 1)
}).catch(error => {
  console.error('💥 Erreur lors de l\'exécution des tests:', error)
  process.exit(1)
})
