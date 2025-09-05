#!/usr/bin/env node

/**
 * Script de test pour les différents modes de restriction de vote
 */

import axios from 'axios'
import { getVoteRestrictionsConfig } from './api/utils/voteRestrictions.js'

const API_BASE = 'http://localhost:3000/api'
const TEST_IDEA_ID = 1

async function testCurrentSystem() {
  console.log('🧪 Test du système de vote actuel')
  console.log('=' .repeat(60))
  
  // Obtenir la configuration actuelle
  const config = getVoteRestrictionsConfig()
  console.log('📋 Configuration actuelle:')
  console.log(`   Mode: ${config.mode}`)
  console.log(`   Description: ${config.description}`)
  console.log(`   Durée restriction IP: ${config.ipRestrictionDuration / (60 * 60 * 1000)}h`)
  
  // Simuler des votes depuis différents navigateurs
  const browsers = [
    { name: 'Firefox', userAgent: 'Mozilla/5.0 (Firefox)' },
    { name: 'Chrome', userAgent: 'Mozilla/5.0 (Chrome)' },
    { name: 'Safari', userAgent: 'Mozilla/5.0 (Safari)' }
  ]
  
  console.log('\n🌐 Test de votes depuis différents navigateurs (même IP):')
  
  for (let i = 0; i < browsers.length; i++) {
    const browser = browsers[i]
    
    try {
      console.log(`\n${i + 1}. Test depuis ${browser.name}...`)
      
      const client = axios.create({
        baseURL: API_BASE,
        headers: { 'User-Agent': browser.userAgent },
        withCredentials: true
      })
      
      const response = await client.post('/votes/regular', {
        idea_id: TEST_IDEA_ID,
        vote_type: 'up'
      })
      
      console.log(`   ✅ ${response.data.message} (${response.data.action})`)
      
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message
      console.log(`   ❌ ${errorMsg}`)
    }
    
    // Petite pause entre les tests
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  // Vérifier l'état final des votes
  try {
    console.log('\n📊 État final des votes:')
    const votesResponse = await axios.get(`${API_BASE}/votes/idea/${TEST_IDEA_ID}`)
    const votes = votesResponse.data
    
    console.log(`   Votes positifs: ${votes.regular?.up || 0}`)
    console.log(`   Votes négatifs: ${votes.regular?.down || 0}`)
    console.log(`   Total votes réguliers: ${(votes.regular?.up || 0) + (votes.regular?.down || 0)}`)
    
  } catch (error) {
    console.log('   ❌ Erreur lors de la récupération des votes')
  }
}

async function demonstrateIPRestriction() {
  console.log('\n\n🔒 Démonstration: Comment implémenter la restriction par IP')
  console.log('=' .repeat(60))
  
  console.log(`
💡 Pour empêcher les votes multiples depuis la même IP:

1. 📝 Modifier la variable d'environnement:
   VOTE_RESTRICTION_MODE=ip

2. 🔧 Ou modifier le code dans voteRestrictions.js:
   ANONYMOUS_MODE: 'ip'

3. 🔄 Redémarrer le serveur

4. 🧪 Résultat attendu:
   - Premier navigateur: ✅ Vote accepté
   - Deuxième navigateur (même IP): ❌ Vote refusé
   - Message: "Cette adresse IP a déjà voté pour cette idée"

📊 Modes disponibles:
   - 'session' (actuel): Un vote par navigateur
   - 'ip': Un vote par adresse IP  
   - 'both': Un vote par session ET par IP (très strict)
`)
}

async function analyzeCurrentBehavior() {
  console.log('\n\n🔍 Analyse du comportement actuel')
  console.log('=' .repeat(60))
  
  console.log(`
🎯 Système actuel (mode 'session'):

✅ Avantages:
   - Flexibilité pour les utilisateurs multi-navigateurs
   - Pas de restriction pour les familles/bureaux partagés
   - Expérience utilisateur fluide

⚠️  Considérations:
   - Un utilisateur peut voter plusieurs fois avec différents navigateurs
   - Possible manipulation avec navigation privée
   - Plus difficile de détecter les abus sophistiqués

🔒 Si vous voulez plus de restriction:
   - Utilisez le mode 'ip' pour limiter par adresse IP
   - Utilisez le mode 'both' pour une sécurité maximale

🏠 Cas d'usage typiques:
   - Famille: Plusieurs personnes, même IP → Mode 'session' recommandé
   - Bureau: Plusieurs employés, même IP → Mode 'session' recommandé  
   - Sécurité maximale: Une personne = un vote → Mode 'ip' recommandé
`)
}

async function runAllTests() {
  try {
    // Vérifier que le serveur est accessible
    await axios.get(`${API_BASE}/health`)
    console.log('✅ Serveur accessible\n')
    
    await testCurrentSystem()
    await demonstrateIPRestriction()
    await analyzeCurrentBehavior()
    
    console.log('\n🎉 Tests terminés!')
    console.log('\n💬 Conclusion:')
    console.log('   Le système actuel permet les votes multiples depuis la même IP')
    console.log('   avec différents navigateurs. C\'est un choix de design pour')
    console.log('   favoriser l\'accessibilité plutôt que la restriction stricte.')
    
  } catch (error) {
    console.error('❌ Erreur:', error.message)
    console.log('\n💡 Assurez-vous que le serveur est démarré avec: npm run dev')
  }
}

// Exécuter les tests
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests()
}

export { runAllTests }
