// Script de test pour vérifier les endpoints API d'IdéaLab
// Exécuter avec: node test_api_endpoints.js

import axios from 'axios'

const API_BASE = 'http://localhost:3000/api'
let authToken = null
let testUserId = null
let testIdeaId = null

// Configuration axios
const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000
})

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`
  }
  return config
})

// Fonction utilitaire pour les logs
function log(message, data = null) {
  console.log(`\n🔍 ${message}`)
  if (data) {
    console.log(JSON.stringify(data, null, 2))
  }
}

function success(message) {
  console.log(`✅ ${message}`)
}

function error(message, err = null) {
  console.log(`❌ ${message}`)
  if (err) {
    console.log(`   Erreur: ${err.response?.data?.error || err.message}`)
  }
}

// Tests d'authentification
async function testAuthentication() {
  log('=== TESTS D\'AUTHENTIFICATION ===')
  
  try {
    // Test de connexion
    log('Test de connexion...')
    const loginResponse = await api.post('/auth/login', {
      email: 'john.doe@example.com',
      password: 'password123'
    })
    
    authToken = loginResponse.data.token
    testUserId = loginResponse.data.user.id
    success('Connexion réussie')
    
    // Test de récupération du profil
    log('Test de récupération du profil...')
    const profileResponse = await api.get('/auth/me')
    success('Profil récupéré avec succès')
    
  } catch (err) {
    error('Erreur lors des tests d\'authentification', err)
    throw err
  }
}

// Tests des idées
async function testIdeas() {
  log('=== TESTS DES IDÉES ===')
  
  try {
    // Test de récupération des idées
    log('Test de récupération des idées...')
    const ideasResponse = await api.get('/ideas')
    success(`${ideasResponse.data.ideas.length} idées récupérées`)
    
    if (ideasResponse.data.ideas.length > 0) {
      testIdeaId = ideasResponse.data.ideas[0].id
    }
    
    // Test de création d'une idée
    log('Test de création d\'une idée...')
    const createResponse = await api.post('/ideas', {
      title: 'Test API - Idée de test',
      description: 'Ceci est une idée de test créée par le script de test automatique.',
      sector: 'Technologie',
      target_audience: 'Développeurs',
      willingness_to_pay: 'medium',
      estimated_budget: '10000 FCFA'
    })
    
    const newIdeaId = createResponse.data.id
    success('Idée créée avec succès')
    
    // Test de récupération d'une idée spécifique
    log('Test de récupération d\'une idée spécifique...')
    const ideaResponse = await api.get(`/ideas/${newIdeaId}`)
    success('Idée spécifique récupérée')
    
    // Test de mise à jour de l'idée
    log('Test de mise à jour de l\'idée...')
    await api.put(`/ideas/${newIdeaId}`, {
      title: 'Test API - Idée de test (modifiée)'
    })
    success('Idée mise à jour')
    
    // Test de suppression de l'idée
    log('Test de suppression de l\'idée...')
    await api.delete(`/ideas/${newIdeaId}`)
    success('Idée supprimée')
    
  } catch (err) {
    error('Erreur lors des tests des idées', err)
  }
}

// Tests du système de vote
async function testVoting() {
  log('=== TESTS DU SYSTÈME DE VOTE ===')
  
  if (!testIdeaId) {
    error('Aucune idée disponible pour les tests de vote')
    return
  }
  
  try {
    // Test de vote standard
    log('Test de vote standard (up)...')
    await api.post('/votes/regular', {
      idea_id: testIdeaId,
      vote_type: 'up'
    })
    success('Vote standard enregistré')
    
    // Test de vote de paiement
    log('Test de vote de paiement (would_pay)...')
    await api.post('/votes/payment', {
      idea_id: testIdeaId,
      vote_type: 'would_pay'
    })
    success('Vote de paiement enregistré')
    
    // Test de récupération des votes d'une idée
    log('Test de récupération des votes d\'une idée...')
    const votesResponse = await api.get(`/votes/idea/${testIdeaId}`)
    success('Votes de l\'idée récupérés')
    log('Compteurs de votes:', votesResponse.data)
    
    // Test de récupération des votes de l'utilisateur
    log('Test de récupération des votes de l\'utilisateur...')
    const userVotesResponse = await api.get(`/votes/user/${testIdeaId}`)
    success('Votes de l\'utilisateur récupérés')
    log('Votes utilisateur:', userVotesResponse.data)
    
    // Test de modification de vote (toggle)
    log('Test de modification de vote (toggle)...')
    await api.post('/votes/regular', {
      idea_id: testIdeaId,
      vote_type: 'up'
    })
    success('Vote modifié (toggle)')
    
  } catch (err) {
    error('Erreur lors des tests de vote', err)
  }
}

// Tests des utilisateurs
async function testUsers() {
  log('=== TESTS DES UTILISATEURS ===')
  
  try {
    // Test de récupération du profil utilisateur
    log('Test de récupération du profil utilisateur...')
    const profileResponse = await api.get(`/users/profile/${testUserId}`)
    success('Profil utilisateur récupéré')
    
    // Test de récupération du dashboard
    log('Test de récupération du dashboard...')
    const dashboardResponse = await api.get(`/users/dashboard/${testUserId}`)
    success('Dashboard récupéré')
    
    // Test du leaderboard
    log('Test du leaderboard...')
    const leaderboardResponse = await api.get('/users/leaderboard')
    success(`Leaderboard récupéré avec ${leaderboardResponse.data.users.length} utilisateurs`)
    
  } catch (err) {
    error('Erreur lors des tests des utilisateurs', err)
  }
}

// Tests sans authentification
async function testUnauthenticatedAccess() {
  log('=== TESTS D\'ACCÈS NON AUTHENTIFIÉ ===')
  
  // Sauvegarder le token
  const savedToken = authToken
  authToken = null
  
  try {
    // Test d'accès aux idées publiques
    log('Test d\'accès aux idées publiques...')
    const ideasResponse = await api.get('/ideas')
    success('Idées publiques accessibles')
    
    // Test d'accès refusé pour création d'idée
    log('Test d\'accès refusé pour création d\'idée...')
    try {
      await api.post('/ideas', {
        title: 'Test non autorisé',
        description: 'Ceci ne devrait pas fonctionner',
        sector: 'Test'
      })
      error('PROBLÈME: Création d\'idée autorisée sans authentification')
    } catch (err) {
      if (err.response?.status === 401) {
        success('Accès correctement refusé pour création d\'idée')
      } else {
        error('Erreur inattendue', err)
      }
    }
    
    // Test d'accès refusé pour vote
    log('Test d\'accès refusé pour vote...')
    try {
      await api.post('/votes/regular', {
        idea_id: 1,
        vote_type: 'up'
      })
      error('PROBLÈME: Vote autorisé sans authentification')
    } catch (err) {
      if (err.response?.status === 401) {
        success('Accès correctement refusé pour vote')
      } else {
        error('Erreur inattendue', err)
      }
    }
    
  } catch (err) {
    error('Erreur lors des tests d\'accès non authentifié', err)
  } finally {
    // Restaurer le token
    authToken = savedToken
  }
}

// Test de santé de l'API
async function testHealth() {
  log('=== TEST DE SANTÉ DE L\'API ===')
  
  try {
    const healthResponse = await api.get('/health')
    success('API en bonne santé')
    log('Statut:', healthResponse.data)
  } catch (err) {
    error('Problème de santé de l\'API', err)
  }
}

// Fonction principale
async function runAllTests() {
  console.log('🚀 Démarrage des tests API pour IdéaLab\n')
  
  try {
    await testHealth()
    await testAuthentication()
    await testIdeas()
    await testVoting()
    await testUsers()
    await testUnauthenticatedAccess()
    
    console.log('\n🎉 Tous les tests sont terminés!')
    console.log('✅ L\'API IdéaLab fonctionne correctement')
    
  } catch (err) {
    console.log('\n💥 Échec des tests')
    console.log('❌ Vérifiez que le serveur est démarré et la base de données configurée')
    process.exit(1)
  }
}

// Exécuter les tests
runAllTests()
