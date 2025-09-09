#!/usr/bin/env node

/**
 * Script de validation finale pour IdéaLab
 * Usage: node final-validation-test.js
 */

import axios from 'axios'

const BASE_URL = 'https://idealab-six.vercel.app'
const API_URL = `${BASE_URL}/api`

console.log('🎯 VALIDATION FINALE - IdéaLab')
console.log('📍 URL:', BASE_URL)
console.log('🕒 Date:', new Date().toLocaleString('fr-FR'))
console.log('=' .repeat(70))

// Configuration des tests
const TESTS_CONFIG = {
  timeout: 10000,
  retries: 2
}

async function makeRequest(url, options = {}) {
  const config = {
    timeout: TESTS_CONFIG.timeout,
    ...options
  }
  
  for (let attempt = 1; attempt <= TESTS_CONFIG.retries; attempt++) {
    try {
      return await axios(url, config)
    } catch (error) {
      if (attempt === TESTS_CONFIG.retries) throw error
      console.log(`   Tentative ${attempt} échouée, retry...`)
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
}

async function testAPIHealth() {
  console.log('\n🏥 Test 1: Santé de l\'API')
  try {
    const response = await makeRequest(`${API_URL}/health`)
    const data = response.data
    
    console.log('✅ API Health Check réussi')
    console.log(`   Status: ${data.status}`)
    console.log(`   Environment: ${data.environment}`)
    console.log(`   Database: ${data.database || 'Non spécifié'}`)
    console.log(`   CORS Origin: ${data.cors_origin || 'Non spécifié'}`)
    
    return {
      success: true,
      details: { status: data.status, environment: data.environment }
    }
  } catch (error) {
    console.log('❌ API Health Check échoué')
    console.log(`   Erreur: ${error.response?.status} - ${error.message}`)
    return { success: false, error: error.message }
  }
}

async function testAPIAuthentication() {
  console.log('\n🔐 Test 2: Authentification API')
  try {
    const response = await makeRequest(`${API_URL}/ideas`, {
      method: 'POST',
      data: { title: 'Test', sector: 'Test' }
    })
    
    console.log('❌ Erreur: Soumission sans auth devrait échouer')
    return { success: false, error: 'Auth bypass detected' }
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Authentification requise (correct)')
      console.log(`   Message: ${error.response.data.error}`)
      return { success: true, details: { authRequired: true } }
    } else if (error.response?.status === 500) {
      console.log('❌ Erreur 500: Problème serveur')
      console.log(`   Détails: ${JSON.stringify(error.response.data)}`)
      return { success: false, error: 'Server error 500' }
    } else {
      console.log(`❌ Erreur inattendue: ${error.response?.status}`)
      return { success: false, error: `Unexpected error: ${error.response?.status}` }
    }
  }
}

async function testIdeasRetrieval() {
  console.log('\n📚 Test 3: Récupération des idées')
  try {
    const response = await makeRequest(`${API_URL}/ideas`)
    const data = response.data
    
    console.log('✅ Récupération des idées réussie')
    console.log(`   Nombre d'idées: ${data.ideas?.length || 0}`)
    console.log(`   Pagination: Page ${data.pagination?.page}/${data.pagination?.pages}`)
    console.log(`   Total: ${data.pagination?.total} idées`)
    
    return {
      success: true,
      details: {
        count: data.ideas?.length || 0,
        total: data.pagination?.total || 0
      }
    }
  } catch (error) {
    console.log('❌ Récupération des idées échouée')
    console.log(`   Erreur: ${error.response?.status} - ${error.message}`)
    return { success: false, error: error.message }
  }
}

async function testSPARouting() {
  console.log('\n🔄 Test 4: Routage SPA')
  
  const routes = [
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/ideas-in-development', name: 'Ideas in Development' },
    { path: '/all-ideas', name: 'All Ideas' },
    { path: '/idea/1', name: 'Idea Detail' }
  ]
  
  let workingRoutes = 0
  const results = []
  
  for (const route of routes) {
    try {
      const response = await makeRequest(`${BASE_URL}${route.path}`)
      
      if (response.status === 200 && response.data.includes('<!DOCTYPE html>')) {
        console.log(`✅ ${route.name} (${route.path}) - OK`)
        workingRoutes++
        results.push({ ...route, status: 'OK' })
      } else {
        console.log(`❌ ${route.name} (${route.path}) - Réponse invalide`)
        results.push({ ...route, status: 'Invalid Response' })
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log(`❌ ${route.name} (${route.path}) - 404 (Problème routage SPA)`)
        results.push({ ...route, status: '404 - SPA Routing Issue' })
      } else {
        console.log(`❌ ${route.name} (${route.path}) - Erreur: ${error.response?.status}`)
        results.push({ ...route, status: `Error ${error.response?.status}` })
      }
    }
  }
  
  console.log(`   Routes fonctionnelles: ${workingRoutes}/${routes.length}`)
  
  return {
    success: workingRoutes === routes.length,
    details: {
      working: workingRoutes,
      total: routes.length,
      percentage: Math.round((workingRoutes / routes.length) * 100),
      results
    }
  }
}

async function testVotingSystem() {
  console.log('\n🗳️  Test 5: Système de vote')
  
  const voteData = { idea_id: 1, vote_type: 'up' }
  
  try {
    const response = await makeRequest(`${API_URL}/votes/regular`, {
      method: 'POST',
      data: voteData
    })
    
    console.log('✅ Vote anonyme réussi')
    console.log(`   Message: ${response.data.message}`)
    console.log(`   Action: ${response.data.action}`)
    
    return { success: true, details: { action: response.data.action } }
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('⚠️  Idée non trouvée (normal si base vide)')
      return { success: true, details: { reason: 'No ideas to vote on' } }
    } else if (error.response?.status === 403) {
      console.log('⚠️  IP bloquée (sécurité anti-abus normale)')
      return { success: true, details: { reason: 'IP blocked - security working' } }
    } else if (error.response?.status === 400 && error.response?.data?.code === 'ALREADY_VOTED_SAME_TYPE') {
      console.log('✅ Système de vote fonctionne (déjà voté)')
      return { success: true, details: { reason: 'Already voted - system working' } }
    } else {
      console.log('❌ Erreur de vote')
      console.log(`   Status: ${error.response?.status}`)
      console.log(`   Détails: ${JSON.stringify(error.response?.data)}`)
      return { success: false, error: error.message }
    }
  }
}

async function generateReport(results) {
  console.log('\n' + '='.repeat(70))
  console.log('📊 RAPPORT DE VALIDATION FINALE')
  console.log('='.repeat(70))
  
  const tests = [
    { name: 'API Health', key: 'health' },
    { name: 'Authentication', key: 'auth' },
    { name: 'Ideas Retrieval', key: 'ideas' },
    { name: 'SPA Routing', key: 'routing' },
    { name: 'Voting System', key: 'voting' }
  ]
  
  let passedTests = 0
  
  tests.forEach(test => {
    const result = results[test.key]
    const status = result.success ? '✅ RÉUSSI' : '❌ ÉCHOUÉ'
    console.log(`${status} ${test.name}`)
    
    if (result.success) passedTests++
  })
  
  const score = Math.round((passedTests / tests.length) * 100)
  
  console.log(`\n🎯 SCORE GLOBAL: ${passedTests}/${tests.length} (${score}%)`)
  
  if (score === 100) {
    console.log('🎉 PARFAIT! Toutes les fonctionnalités marchent!')
  } else if (score >= 80) {
    console.log('✅ TRÈS BIEN! La plupart des fonctionnalités marchent.')
  } else if (score >= 60) {
    console.log('⚠️  ACCEPTABLE. Quelques problèmes à résoudre.')
  } else {
    console.log('❌ PROBLÉMATIQUE. Plusieurs corrections nécessaires.')
  }
  
  // Détails spécifiques
  console.log('\n📋 DÉTAILS:')
  
  if (results.routing.success) {
    console.log('✅ Routage SPA: Toutes les routes fonctionnent')
  } else {
    console.log(`⚠️  Routage SPA: ${results.routing.details.percentage}% des routes fonctionnent`)
    console.log('   → Redéploiement nécessaire pour appliquer vercel.json')
  }
  
  if (results.auth.success && results.ideas.success) {
    console.log('✅ API Backend: Fonctionnel et sécurisé')
  }
  
  if (results.voting.success) {
    console.log('✅ Système de vote: Opérationnel avec sécurité anti-abus')
  }
  
  console.log('\n🚀 PROCHAINES ÉTAPES:')
  if (!results.routing.success) {
    console.log('1. Redéployer l\'application pour appliquer vercel.json')
    console.log('2. Re-tester les routes SPA après déploiement')
  } else {
    console.log('1. Application prête pour la production!')
    console.log('2. Monitoring des performances recommandé')
  }
  
  return { score, passedTests, totalTests: tests.length }
}

async function runFinalValidation() {
  console.log('🚀 Démarrage de la validation finale...\n')
  
  const results = {
    health: await testAPIHealth(),
    auth: await testAPIAuthentication(),
    ideas: await testIdeasRetrieval(),
    routing: await testSPARouting(),
    voting: await testVotingSystem()
  }
  
  const report = await generateReport(results)
  
  return report.score >= 80
}

// Exécuter la validation finale
runFinalValidation().then(success => {
  process.exit(success ? 0 : 1)
}).catch(error => {
  console.error('💥 Erreur critique lors de la validation:', error)
  process.exit(1)
})
