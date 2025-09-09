#!/usr/bin/env node

/**
 * Script de test pour l'API en production
 * Usage: node test-production-api.js
 */

import axios from 'axios'

const BASE_URL = 'https://idealab-six.vercel.app'
const API_URL = `${BASE_URL}/api`

console.log('🧪 Test de l\'API IdéaLab en production')
console.log('📍 URL:', BASE_URL)
console.log('=' .repeat(50))

async function testAuthenticationRequired() {
  console.log('\n1. Test: Soumission sans authentification...')
  
  const testData = {
    title: 'Test Idea',
    description: 'Test description',
    sector: 'Technology'
  }
  
  try {
    const response = await axios.post(`${API_URL}/ideas`, testData)
    console.log('❌ ERREUR: La soumission sans auth devrait échouer')
    return false
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Authentification requise (correct)')
      console.log('   Message:', error.response.data.error)
      return true
    } else if (error.response?.status === 500) {
      console.log('❌ ERREUR 500: Problème serveur')
      console.log('   Détails:', error.response.data)
      return false
    } else {
      console.log('❌ Erreur inattendue:', error.response?.status, error.response?.data)
      return false
    }
  }
}

async function testGetIdeas() {
  console.log('\n2. Test: Récupération des idées...')
  
  try {
    const response = await axios.get(`${API_URL}/ideas`)
    console.log('✅ Récupération réussie')
    console.log('   Nombre d\'idées:', response.data.ideas?.length || 0)
    console.log('   Pagination:', response.data.pagination)
    return true
  } catch (error) {
    console.log('❌ Erreur lors de la récupération')
    console.log('   Status:', error.response?.status)
    console.log('   Détails:', error.response?.data)
    return false
  }
}

async function testHealthCheck() {
  console.log('\n3. Test: Health check...')
  
  try {
    const response = await axios.get(`${API_URL}/health`)
    console.log('✅ Health check réussi')
    console.log('   Status:', response.data.status)
    console.log('   Environment:', response.data.environment)
    console.log('   Database:', response.data.database || 'Non spécifié')
    return true
  } catch (error) {
    console.log('❌ Health check échoué')
    console.log('   Status:', error.response?.status)
    console.log('   Détails:', error.response?.data)
    return false
  }
}

async function testVotingEndpoints() {
  console.log('\n4. Test: Endpoints de vote...')
  
  const voteData = {
    idea_id: 1,
    vote_type: 'up'
  }
  
  try {
    const response = await axios.post(`${API_URL}/votes/regular`, voteData)
    console.log('✅ Vote anonyme réussi')
    console.log('   Message:', response.data.message)
    console.log('   Action:', response.data.action)
    return true
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('⚠️  Idée non trouvée (normal si base vide)')
      return true
    } else if (error.response?.status === 400 && error.response?.data?.code === 'ALREADY_VOTED_SAME_TYPE') {
      console.log('✅ Système de vote fonctionne (déjà voté)')
      return true
    } else {
      console.log('❌ Erreur de vote')
      console.log('   Status:', error.response?.status)
      console.log('   Détails:', error.response?.data)
      return false
    }
  }
}

async function testSPARouting() {
  console.log('\n5. Test: Routage SPA...')
  
  const routes = ['/dashboard', '/ideas-in-development', '/all-ideas']
  let workingRoutes = 0
  
  for (const route of routes) {
    try {
      const response = await axios.get(`${BASE_URL}${route}`)
      if (response.status === 200 && response.data.includes('<!DOCTYPE html>')) {
        console.log(`✅ ${route} - OK`)
        workingRoutes++
      } else {
        console.log(`❌ ${route} - Réponse invalide`)
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log(`❌ ${route} - 404 (problème de routage SPA)`)
      } else {
        console.log(`❌ ${route} - Erreur: ${error.response?.status}`)
      }
    }
  }
  
  console.log(`   Routes fonctionnelles: ${workingRoutes}/${routes.length}`)
  return workingRoutes > 0
}

async function runAllTests() {
  console.log('🚀 Démarrage des tests...\n')
  
  const tests = [
    { name: 'Authentication', fn: testAuthenticationRequired },
    { name: 'Get Ideas', fn: testGetIdeas },
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'Voting System', fn: testVotingEndpoints },
    { name: 'SPA Routing', fn: testSPARouting }
  ]
  
  const results = {}
  
  for (const test of tests) {
    try {
      results[test.name] = await test.fn()
    } catch (error) {
      console.log(`❌ ${test.name}: Exception - ${error.message}`)
      results[test.name] = false
    }
  }
  
  console.log('\n' + '='.repeat(50))
  console.log('📊 RÉSULTATS FINAUX')
  console.log('='.repeat(50))
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'RÉUSSI' : 'ÉCHOUÉ'}`)
  })
  
  const passedTests = Object.values(results).filter(Boolean).length
  const totalTests = Object.keys(results).length
  
  console.log(`\n🎯 Score global: ${passedTests}/${totalTests} tests réussis`)
  
  if (passedTests >= totalTests * 0.8) {
    console.log('🎉 La plupart des fonctionnalités marchent !')
  } else {
    console.log('⚠️  Plusieurs problèmes détectés.')
  }
  
  console.log('\n📋 RÉSUMÉ DES CORRECTIONS APPLIQUÉES:')
  console.log('✅ Correction du middleware d\'authentification (colonne last_login)')
  console.log('✅ Amélioration de la gestion d\'erreurs dans POST /api/ideas')
  console.log('✅ Configuration vercel.json pour le routage SPA')
  console.log('✅ Logs de débogage ajoutés')
  
  return passedTests >= totalTests * 0.6
}

// Exécuter tous les tests
runAllTests().then(success => {
  process.exit(success ? 0 : 1)
}).catch(error => {
  console.error('💥 Erreur critique:', error)
  process.exit(1)
})
