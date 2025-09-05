#!/usr/bin/env node

/**
 * Script de test pour vérifier le système de vote basé sur IP
 * Simule différents navigateurs avec la même IP
 */

import axios from 'axios'

const API_BASE = 'http://localhost:3000/api'
const TEST_IDEA_ID = 1

// Simuler différents navigateurs avec différents User-Agents
const browsers = [
  {
    name: 'Firefox',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64; rv:142.0) Gecko/20100101 Firefox/142.0'
  },
  {
    name: 'Chrome',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  },
  {
    name: 'Brave',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  },
  {
    name: 'Safari',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'
  }
]

/**
 * Simule un vote depuis un navigateur spécifique
 */
async function voteFromBrowser(browserName, userAgent, voteType = 'up') {
  try {
    console.log(`\n🌐 Test de vote depuis ${browserName}...`)
    
    // Créer une instance axios avec des headers spécifiques au navigateur
    const client = axios.create({
      baseURL: API_BASE,
      headers: {
        'User-Agent': userAgent,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      withCredentials: true // Important pour les cookies
    })

    // Tenter de voter
    const response = await client.post('/votes/regular', {
      idea_id: TEST_IDEA_ID,
      vote_type: voteType
    })

    console.log(`✅ ${browserName}: ${response.data.message}`)
    console.log(`   Action: ${response.data.action}`)
    console.log(`   Vote type: ${response.data.vote_type}`)
    
    return {
      success: true,
      browser: browserName,
      action: response.data.action,
      message: response.data.message
    }

  } catch (error) {
    const errorMsg = error.response?.data?.error || error.message
    console.log(`❌ ${browserName}: ${errorMsg}`)
    
    return {
      success: false,
      browser: browserName,
      error: errorMsg,
      status: error.response?.status
    }
  }
}

/**
 * Vérifie l'état actuel des votes pour une idée
 */
async function checkVoteStatus() {
  try {
    const response = await axios.get(`${API_BASE}/votes/idea/${TEST_IDEA_ID}`)
    console.log('\n📊 État actuel des votes:')
    console.log(`   Votes positifs: ${response.data.up_votes || 0}`)
    console.log(`   Votes négatifs: ${response.data.down_votes || 0}`)
    console.log(`   Total: ${(response.data.up_votes || 0) + (response.data.down_votes || 0)}`)
    return response.data
  } catch (error) {
    console.error('❌ Erreur lors de la vérification des votes:', error.message)
    return null
  }
}

/**
 * Vérifie les votes utilisateur depuis différents navigateurs
 */
async function checkUserVotesFromBrowsers() {
  console.log('\n🔍 Vérification des votes utilisateur depuis différents navigateurs:')
  
  for (const browser of browsers.slice(0, 2)) { // Tester seulement 2 navigateurs
    try {
      const client = axios.create({
        baseURL: API_BASE,
        headers: {
          'User-Agent': browser.userAgent
        },
        withCredentials: true
      })

      const response = await client.get(`/votes/user/${TEST_IDEA_ID}`)
      console.log(`   ${browser.name}: Vote régulier = ${response.data.regular_vote || 'aucun'}`)
      
    } catch (error) {
      console.log(`   ${browser.name}: Erreur - ${error.message}`)
    }
  }
}

/**
 * Test principal
 */
async function runIPVotingTest() {
  console.log('🧪 Test du système de vote basé sur IP')
  console.log('=' .repeat(50))
  console.log(`🎯 Test sur l'idée ID: ${TEST_IDEA_ID}`)
  console.log(`📍 API: ${API_BASE}`)

  // Vérifier que le serveur est accessible
  try {
    await axios.get(`${API_BASE}/health`)
    console.log('✅ Serveur accessible')
  } catch (error) {
    console.error('❌ Serveur non accessible:', error.message)
    return
  }

  // État initial
  console.log('\n📊 État initial des votes:')
  await checkVoteStatus()

  // Test 1: Vote depuis Firefox
  console.log('\n🔬 Test 1: Premier vote depuis Firefox')
  const firefoxResult = await voteFromBrowser(browsers[0].name, browsers[0].userAgent, 'up')

  // Attendre un peu pour que le vote soit enregistré
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Vérifier l'état après le premier vote
  await checkVoteStatus()

  // Test 2: Vote depuis Brave (même IP, navigateur différent)
  console.log('\n🔬 Test 2: Tentative de vote depuis Brave (même IP)')
  const braveResult = await voteFromBrowser(browsers[2].name, browsers[2].userAgent, 'up')

  // Attendre un peu
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Vérifier l'état final
  await checkVoteStatus()

  // Test 3: Vérifier les votes utilisateur
  await checkUserVotesFromBrowsers()

  // Test 4: Tenter un vote différent depuis Chrome
  console.log('\n🔬 Test 3: Tentative de vote "down" depuis Chrome')
  const chromeResult = await voteFromBrowser(browsers[1].name, browsers[1].userAgent, 'down')

  await new Promise(resolve => setTimeout(resolve, 1000))
  await checkVoteStatus()

  // Résumé des résultats
  console.log('\n📋 Résumé des tests:')
  console.log('=' .repeat(50))
  
  const results = [firefoxResult, braveResult, chromeResult]
  results.forEach((result, index) => {
    if (result.success) {
      console.log(`✅ Test ${index + 1} (${result.browser}): ${result.action} - ${result.message}`)
    } else {
      console.log(`❌ Test ${index + 1} (${result.browser}): ${result.error}`)
    }
  })

  // Analyse des résultats
  console.log('\n🔍 Analyse:')
  const successfulVotes = results.filter(r => r.success && r.action === 'created').length
  const blockedVotes = results.filter(r => !r.success).length
  
  console.log(`   Votes réussis: ${successfulVotes}`)
  console.log(`   Votes bloqués: ${blockedVotes}`)
  
  if (successfulVotes === 1 && blockedVotes >= 1) {
    console.log('✅ Le système de protection IP fonctionne correctement!')
    console.log('   Une seule IP peut voter une seule fois par idée.')
  } else if (successfulVotes > 1) {
    console.log('⚠️  Attention: Plusieurs votes depuis la même IP ont été acceptés.')
    console.log('   Le système de protection IP pourrait ne pas fonctionner comme attendu.')
  } else {
    console.log('ℹ️  Résultats à analyser manuellement.')
  }

  console.log('\n💡 Explication technique:')
  console.log('   Le système utilise une combinaison de:')
  console.log('   - Session ID (cookie unique par navigateur)')
  console.log('   - Adresse IP (même pour tous les navigateurs sur cette machine)')
  console.log('   - Contraintes de base de données pour éviter les doublons')
}

// Exécuter le test
if (import.meta.url === `file://${process.argv[1]}`) {
  runIPVotingTest().catch(console.error)
}

export { runIPVotingTest }
