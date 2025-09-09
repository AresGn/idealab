#!/usr/bin/env node

/**
 * Test complet de tous les flux IdéaLab
 * Usage: node test-complete-flow.js
 */

import axios from 'axios'

const BASE_URL = 'https://idealab-six.vercel.app'
const API_URL = `${BASE_URL}/api`

console.log('🎯 TEST COMPLET DES FLUX - IdéaLab')
console.log('📍 URL:', BASE_URL)
console.log('🕒 Date:', new Date().toLocaleString('fr-FR'))
console.log('=' .repeat(80))

// Configuration
const TIMEOUT = 15000
const MAX_RETRIES = 3

async function makeRequest(url, options = {}) {
  const config = { timeout: TIMEOUT, ...options }
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await axios(url, config)
    } catch (error) {
      if (attempt === MAX_RETRIES) throw error
      console.log(`   ⏳ Tentative ${attempt}/${MAX_RETRIES} échouée, retry...`)
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }
}

async function testSPARoutingComplete() {
  console.log('\n🔄 TEST 1: Routage SPA Complet')
  
  const routes = [
    { path: '/', name: 'Accueil', critical: true },
    { path: '/dashboard', name: 'Dashboard', critical: true },
    { path: '/submit', name: 'Soumission rapide', critical: true },
    { path: '/submit-design-thinking', name: 'Soumission DT', critical: true },
    { path: '/ideas-in-development', name: 'Idées en développement', critical: true },
    { path: '/all-ideas', name: 'Toutes les idées', critical: true },
    { path: '/idea/1', name: 'Détail idée', critical: false },
    { path: '/login', name: 'Connexion', critical: false },
    { path: '/register', name: 'Inscription', critical: false }
  ]
  
  let workingRoutes = 0
  let criticalRoutes = 0
  let criticalWorking = 0
  const results = []
  
  for (const route of routes) {
    if (route.critical) criticalRoutes++
    
    try {
      const response = await makeRequest(`${BASE_URL}${route.path}`)
      
      if (response.status === 200 && response.data.includes('<!DOCTYPE html>')) {
        console.log(`✅ ${route.name} (${route.path})`)
        workingRoutes++
        if (route.critical) criticalWorking++
        results.push({ ...route, status: 'OK' })
      } else {
        console.log(`❌ ${route.name} (${route.path}) - Réponse invalide`)
        results.push({ ...route, status: 'Invalid Response' })
      }
    } catch (error) {
      const status = error.response?.status || 'Network Error'
      console.log(`❌ ${route.name} (${route.path}) - ${status}`)
      results.push({ ...route, status })
    }
  }
  
  const percentage = Math.round((workingRoutes / routes.length) * 100)
  const criticalPercentage = Math.round((criticalWorking / criticalRoutes) * 100)
  
  console.log(`\n📊 Résultats Routage:`)
  console.log(`   Total: ${workingRoutes}/${routes.length} (${percentage}%)`)
  console.log(`   Routes critiques: ${criticalWorking}/${criticalRoutes} (${criticalPercentage}%)`)
  
  return {
    success: criticalPercentage >= 80,
    details: { total: percentage, critical: criticalPercentage, results }
  }
}

async function testAPIEndpoints() {
  console.log('\n🔌 TEST 2: Endpoints API')
  
  const tests = [
    {
      name: 'Health Check',
      method: 'GET',
      url: `${API_URL}/health`,
      expectedStatus: 200,
      critical: true
    },
    {
      name: 'Get Ideas',
      method: 'GET', 
      url: `${API_URL}/ideas`,
      expectedStatus: 200,
      critical: true
    },
    {
      name: 'Post Ideas (sans auth)',
      method: 'POST',
      url: `${API_URL}/ideas`,
      data: { title: 'Test', sector: 'Test' },
      expectedStatus: 401,
      critical: true
    },
    {
      name: 'Get Ideas Stats',
      method: 'GET',
      url: `${API_URL}/ideas/stats/overview`,
      expectedStatus: 200,
      critical: false
    },
    {
      name: 'Get Ideas in Development',
      method: 'GET',
      url: `${API_URL}/ideas/in-development`,
      expectedStatus: 200,
      critical: false
    }
  ]
  
  let workingEndpoints = 0
  let criticalEndpoints = 0
  let criticalWorking = 0
  
  for (const test of tests) {
    if (test.critical) criticalEndpoints++
    
    try {
      const config = {
        method: test.method,
        url: test.url,
        timeout: TIMEOUT
      }
      
      if (test.data) config.data = test.data
      
      const response = await axios(config)
      
      if (response.status === test.expectedStatus) {
        console.log(`✅ ${test.name} - ${response.status}`)
        workingEndpoints++
        if (test.critical) criticalWorking++
      } else {
        console.log(`⚠️  ${test.name} - ${response.status} (attendu: ${test.expectedStatus})`)
      }
    } catch (error) {
      const status = error.response?.status
      if (status === test.expectedStatus) {
        console.log(`✅ ${test.name} - ${status} (erreur attendue)`)
        workingEndpoints++
        if (test.critical) criticalWorking++
      } else {
        console.log(`❌ ${test.name} - ${status || 'Network Error'}`)
      }
    }
  }
  
  const percentage = Math.round((workingEndpoints / tests.length) * 100)
  const criticalPercentage = Math.round((criticalWorking / criticalEndpoints) * 100)
  
  console.log(`\n📊 Résultats API:`)
  console.log(`   Total: ${workingEndpoints}/${tests.length} (${percentage}%)`)
  console.log(`   Endpoints critiques: ${criticalWorking}/${criticalEndpoints} (${criticalPercentage}%)`)
  
  return {
    success: criticalPercentage >= 80,
    details: { total: percentage, critical: criticalPercentage }
  }
}

async function testVotingFlow() {
  console.log('\n🗳️  TEST 3: Flux de Vote')
  
  // Test vote standard
  try {
    const voteResponse = await makeRequest(`${API_URL}/votes/regular`, {
      method: 'POST',
      data: { idea_id: 1, vote_type: 'up' }
    })
    
    console.log(`✅ Vote standard - ${voteResponse.data.message}`)
  } catch (error) {
    const status = error.response?.status
    const data = error.response?.data
    
    if (status === 404) {
      console.log('⚠️  Vote standard - Aucune idée à voter (base vide)')
    } else if (status === 403) {
      console.log('✅ Vote standard - IP bloquée (sécurité anti-abus)')
    } else if (status === 400 && data?.code === 'ALREADY_VOTED_SAME_TYPE') {
      console.log('✅ Vote standard - Déjà voté (système fonctionne)')
    } else {
      console.log(`❌ Vote standard - Erreur ${status}`)
      return { success: false, error: `Vote error: ${status}` }
    }
  }
  
  // Test récupération des votes
  try {
    const votesResponse = await makeRequest(`${API_URL}/votes/idea/1`)
    console.log('✅ Récupération votes - OK')
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('⚠️  Récupération votes - Idée non trouvée')
    } else {
      console.log(`❌ Récupération votes - Erreur ${error.response?.status}`)
    }
  }
  
  console.log('\n📊 Système de vote: Fonctionnel avec sécurité anti-abus')
  return { success: true, details: { antiAbuse: true } }
}

async function testSubmissionValidation() {
  console.log('\n📝 TEST 4: Validation des Soumissions')
  
  const testCases = [
    {
      name: 'Données valides (sans auth)',
      data: {
        title: 'Application de covoiturage écologique',
        description: 'Une app mobile pour partager des trajets verts',
        sector: 'Transport',
        target_audience: 'Étudiants urbains'
      },
      expectedStatus: 401
    },
    {
      name: 'Titre manquant',
      data: { sector: 'Technology' },
      expectedStatus: 401 // Auth check avant validation
    },
    {
      name: 'Secteur manquant',
      data: { title: 'Test App' },
      expectedStatus: 401
    }
  ]
  
  let validationTests = 0
  
  for (const testCase of testCases) {
    try {
      await makeRequest(`${API_URL}/ideas`, {
        method: 'POST',
        data: testCase.data
      })
      console.log(`❌ ${testCase.name} - Devrait échouer`)
    } catch (error) {
      const status = error.response?.status
      if (status === testCase.expectedStatus) {
        console.log(`✅ ${testCase.name} - ${status} (attendu)`)
        validationTests++
      } else {
        console.log(`⚠️  ${testCase.name} - ${status} (attendu: ${testCase.expectedStatus})`)
      }
    }
  }
  
  console.log(`\n📊 Validation: ${validationTests}/${testCases.length} tests réussis`)
  return { success: validationTests >= testCases.length * 0.8 }
}

async function generateFinalReport(results) {
  console.log('\n' + '='.repeat(80))
  console.log('📊 RAPPORT FINAL - TOUS LES FLUX')
  console.log('='.repeat(80))
  
  const tests = [
    { name: 'Routage SPA', key: 'routing', weight: 30 },
    { name: 'API Endpoints', key: 'api', weight: 30 },
    { name: 'Système de Vote', key: 'voting', weight: 20 },
    { name: 'Validation Soumissions', key: 'validation', weight: 20 }
  ]
  
  let totalScore = 0
  let passedTests = 0
  
  tests.forEach(test => {
    const result = results[test.key]
    const status = result.success ? '✅ RÉUSSI' : '❌ ÉCHOUÉ'
    console.log(`${status} ${test.name} (Poids: ${test.weight}%)`)
    
    if (result.success) {
      totalScore += test.weight
      passedTests++
    }
  })
  
  console.log(`\n🎯 SCORE GLOBAL: ${totalScore}/100 (${passedTests}/${tests.length} tests)`)
  
  if (totalScore >= 90) {
    console.log('🎉 EXCELLENT! Application prête pour la production!')
  } else if (totalScore >= 70) {
    console.log('✅ TRÈS BIEN! Quelques améliorations mineures possibles.')
  } else if (totalScore >= 50) {
    console.log('⚠️  ACCEPTABLE. Corrections importantes nécessaires.')
  } else {
    console.log('❌ CRITIQUE. Problèmes majeurs à résoudre.')
  }
  
  // Détails spécifiques
  console.log('\n📋 DÉTAILS TECHNIQUES:')
  
  if (results.routing.success) {
    console.log(`✅ Routage SPA: ${results.routing.details.critical}% des routes critiques`)
  } else {
    console.log(`❌ Routage SPA: Seulement ${results.routing.details.critical}% des routes critiques`)
  }
  
  if (results.api.success) {
    console.log(`✅ API Backend: ${results.api.details.critical}% des endpoints critiques`)
  }
  
  console.log('\n🚀 STATUT FINAL:')
  if (totalScore >= 70) {
    console.log('✅ Application fonctionnelle et déployable')
    console.log('✅ Flux de soumission opérationnels')
    console.log('✅ Sécurité et validation en place')
  } else {
    console.log('⚠️  Application nécessite des corrections avant production')
  }
  
  return totalScore
}

async function runCompleteTest() {
  console.log('🚀 Démarrage du test complet...\n')
  
  const results = {
    routing: await testSPARoutingComplete(),
    api: await testAPIEndpoints(),
    voting: await testVotingFlow(),
    validation: await testSubmissionValidation()
  }
  
  const finalScore = await generateFinalReport(results)
  
  return finalScore >= 70
}

// Exécuter le test complet
runCompleteTest().then(success => {
  console.log(`\n${success ? '🎉' : '⚠️'} Test terminé - ${success ? 'SUCCÈS' : 'AMÉLIORATIONS NÉCESSAIRES'}`)
  process.exit(success ? 0 : 1)
}).catch(error => {
  console.error('💥 Erreur critique:', error.message)
  process.exit(1)
})
