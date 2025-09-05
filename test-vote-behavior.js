#!/usr/bin/env node

/**
 * Script pour tester le comportement des votes et s'assurer qu'il n'y a pas de votes multiples
 */

import axios from 'axios'

const API_BASE = 'http://localhost:3000/api'
const TEST_IDEA_ID = 1

// Configuration du client HTTP
const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'Test-Vote-Behavior/1.0'
  },
  withCredentials: true
})

/**
 * Test du comportement de vote multiple
 */
async function testMultipleVotes() {
  console.log('🧪 Test du comportement de vote multiple')
  console.log('=' .repeat(60))
  
  try {
    // Obtenir l'état initial des votes
    console.log('📊 État initial des votes:')
    let votesResponse = await client.get(`/votes/idea/${TEST_IDEA_ID}`)
    let initialVotes = votesResponse.data
    console.log(`   Votes positifs: ${initialVotes.regular.up}`)
    console.log(`   Votes négatifs: ${initialVotes.regular.down}`)
    
    // Test 1: Premier vote "up"
    console.log('\n🔼 Test 1: Premier vote "up"')
    let voteResponse = await client.post('/votes/regular', {
      idea_id: TEST_IDEA_ID,
      vote_type: 'up'
    })
    console.log(`   Résultat: ${voteResponse.data.message} (${voteResponse.data.action})`)
    
    // Vérifier les votes après le premier vote
    votesResponse = await client.get(`/votes/idea/${TEST_IDEA_ID}`)
    let afterFirstVote = votesResponse.data
    console.log(`   Votes après: up=${afterFirstVote.regular.up}, down=${afterFirstVote.regular.down}`)
    
    // Test 2: Deuxième vote "up" (devrait être retiré)
    console.log('\n🔼 Test 2: Deuxième vote "up" (même bouton)')
    try {
      voteResponse = await client.post('/votes/regular', {
        idea_id: TEST_IDEA_ID,
        vote_type: 'up'
      })
      console.log(`   Résultat: ${voteResponse.data.message} (${voteResponse.data.action})`)
    } catch (error) {
      console.log(`   Erreur: ${error.response?.data?.error || error.message}`)
    }
    
    // Vérifier les votes après le deuxième vote
    votesResponse = await client.get(`/votes/idea/${TEST_IDEA_ID}`)
    let afterSecondVote = votesResponse.data
    console.log(`   Votes après: up=${afterSecondVote.regular.up}, down=${afterSecondVote.regular.down}`)
    
    // Test 3: Vote "down" (changement de vote)
    console.log('\n🔽 Test 3: Vote "down" (changement de vote)')
    try {
      voteResponse = await client.post('/votes/regular', {
        idea_id: TEST_IDEA_ID,
        vote_type: 'down'
      })
      console.log(`   Résultat: ${voteResponse.data.message} (${voteResponse.data.action})`)
    } catch (error) {
      console.log(`   Erreur: ${error.response?.data?.error || error.message}`)
    }
    
    // Vérifier les votes après le changement
    votesResponse = await client.get(`/votes/idea/${TEST_IDEA_ID}`)
    let afterChangeVote = votesResponse.data
    console.log(`   Votes après: up=${afterChangeVote.regular.up}, down=${afterChangeVote.regular.down}`)
    
    // Test 4: Tentative de vote multiple "down"
    console.log('\n🔽 Test 4: Tentative de vote multiple "down"')
    for (let i = 1; i <= 3; i++) {
      try {
        console.log(`   Tentative ${i}:`)
        voteResponse = await client.post('/votes/regular', {
          idea_id: TEST_IDEA_ID,
          vote_type: 'down'
        })
        console.log(`     Résultat: ${voteResponse.data.message} (${voteResponse.data.action})`)
        
        // Vérifier les votes après chaque tentative
        votesResponse = await client.get(`/votes/idea/${TEST_IDEA_ID}`)
        let currentVotes = votesResponse.data
        console.log(`     Votes: up=${currentVotes.regular.up}, down=${currentVotes.regular.down}`)
        
      } catch (error) {
        console.log(`     Erreur: ${error.response?.data?.error || error.message}`)
      }
      
      // Petite pause entre les tentatives
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    // État final
    console.log('\n📊 État final des votes:')
    votesResponse = await client.get(`/votes/idea/${TEST_IDEA_ID}`)
    let finalVotes = votesResponse.data
    console.log(`   Votes positifs: ${finalVotes.regular.up}`)
    console.log(`   Votes négatifs: ${finalVotes.regular.down}`)
    
    // Analyse des résultats
    console.log('\n📈 Analyse des résultats:')
    const upDifference = finalVotes.regular.up - initialVotes.regular.up
    const downDifference = finalVotes.regular.down - initialVotes.regular.down
    
    console.log(`   Changement votes up: ${upDifference > 0 ? '+' : ''}${upDifference}`)
    console.log(`   Changement votes down: ${downDifference > 0 ? '+' : ''}${downDifference}`)
    
    if (Math.abs(upDifference) + Math.abs(downDifference) <= 1) {
      console.log('   ✅ Comportement correct: Maximum 1 vote par utilisateur')
    } else {
      console.log('   ❌ Problème détecté: Votes multiples possibles')
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message)
  }
}

/**
 * Test avec différents navigateurs simulés
 */
async function testDifferentBrowsers() {
  console.log('\n🌐 Test avec différents navigateurs simulés')
  console.log('=' .repeat(60))
  
  const browsers = [
    { name: 'Firefox', userAgent: 'Mozilla/5.0 (Firefox)' },
    { name: 'Chrome', userAgent: 'Mozilla/5.0 (Chrome)' },
    { name: 'Safari', userAgent: 'Mozilla/5.0 (Safari)' }
  ]
  
  // État initial
  let initialResponse = await client.get(`/votes/idea/${TEST_IDEA_ID}`)
  let initialVotes = initialResponse.data
  console.log(`📊 État initial: up=${initialVotes.regular.up}, down=${initialVotes.regular.down}`)
  
  for (let i = 0; i < browsers.length; i++) {
    const browser = browsers[i]
    
    try {
      console.log(`\n${i + 1}. Test avec ${browser.name}:`)
      
      const browserClient = axios.create({
        baseURL: API_BASE,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': browser.userAgent
        },
        withCredentials: true
      })
      
      const response = await browserClient.post('/votes/regular', {
        idea_id: TEST_IDEA_ID,
        vote_type: 'up'
      })
      
      console.log(`   Résultat: ${response.data.message} (${response.data.action})`)
      
      // Vérifier l'état après ce vote
      const votesAfter = await client.get(`/votes/idea/${TEST_IDEA_ID}`)
      console.log(`   Votes après: up=${votesAfter.data.regular.up}, down=${votesAfter.data.regular.down}`)
      
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message
      console.log(`   Résultat: ${errorMsg}`)
    }
    
    // Pause entre les tests
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  // État final
  let finalResponse = await client.get(`/votes/idea/${TEST_IDEA_ID}`)
  let finalVotes = finalResponse.data
  console.log(`\n📊 État final: up=${finalVotes.regular.up}, down=${finalVotes.regular.down}`)
  
  const totalIncrease = (finalVotes.regular.up - initialVotes.regular.up) + 
                       (finalVotes.regular.down - initialVotes.regular.down)
  
  console.log(`\n📈 Analyse:`)
  console.log(`   Augmentation totale des votes: ${totalIncrease}`)
  
  if (totalIncrease <= 1) {
    console.log('   ✅ Restriction IP fonctionne: Un seul vote autorisé')
  } else {
    console.log('   ⚠️  Plusieurs votes détectés depuis la même IP')
  }
}

/**
 * Test principal
 */
async function runVoteBehaviorTests() {
  console.log('🧪 Tests du comportement des votes')
  console.log('=' .repeat(60))
  console.log(`📍 API: ${API_BASE}`)
  console.log(`🎯 ID d'idée: ${TEST_IDEA_ID}`)
  
  // Vérifier la connectivité
  try {
    await axios.get(`${API_BASE}/health`)
    console.log('✅ Serveur accessible')
  } catch (error) {
    console.error('❌ Serveur non accessible:', error.message)
    console.log('\n💡 Assurez-vous que le serveur est démarré avec: npm run dev')
    return
  }
  
  // Exécuter les tests
  await testMultipleVotes()
  await testDifferentBrowsers()
  
  console.log('\n🎉 Tests terminés!')
  console.log('\n💡 Résumé:')
  console.log('   - Le système devrait empêcher les votes multiples depuis la même IP')
  console.log('   - Un utilisateur peut changer son vote (up ↔ down)')
  console.log('   - Cliquer deux fois sur le même bouton retire le vote')
}

// Exécuter les tests
if (import.meta.url === `file://${process.argv[1]}`) {
  runVoteBehaviorTests().catch(console.error)
}

export { runVoteBehaviorTests }
