#!/usr/bin/env node

/**
 * Script de test complet pour les formulaires de soumission d'idées
 * Utilise le compte test: btcoin2035@gmail.com
 */

import axios from 'axios'

const API_BASE = 'http://localhost:3000/api'
const TEST_EMAIL = 'btcoin2035@gmail.com'
const TEST_PASSWORD = 'TestPassword123!'

// Configuration du client HTTP
const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
})

/**
 * Connexion avec le compte test
 */
async function loginTestAccount() {
  console.log('\n🔐 Connexion avec le compte test')
  console.log('=' .repeat(50))
  
  try {
    const response = await client.post('/auth/login', {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    })
    
    console.log('✅ Connexion réussie!')
    console.log(`   Token reçu: ${response.data.token ? 'Oui' : 'Non'}`)
    
    // Configurer le token pour les requêtes suivantes
    if (response.data.token) {
      client.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`
      console.log('🔑 Token configuré pour les requêtes suivantes')
    }
    
    return response.data
    
  } catch (error) {
    console.log('❌ Erreur de connexion:')
    console.log(`   Status: ${error.response?.status}`)
    console.log(`   Erreur: ${error.response?.data?.error || error.message}`)
    return null
  }
}

/**
 * Test 1: Soumission d'idée standard
 */
async function testStandardIdeaSubmission() {
  console.log('\n📝 Test 1: Soumission d\'idée standard')
  console.log('=' .repeat(50))
  
  try {
    const ideaData = {
      title: `Application de gestion agricole intelligente - Test ${Date.now()}`,
      description: `Cette application révolutionnaire aide les agriculteurs africains à optimiser leurs rendements grâce à l'intelligence artificielle. Elle fournit des prédictions météorologiques précises, des conseils personnalisés sur les cultures, et un système de suivi des récoltes en temps réel. L'application intègre également un marketplace pour vendre directement aux consommateurs, éliminant les intermédiaires et augmentant les profits des agriculteurs.`,
      sector: 'Agriculture',
      target_audience: 'Agriculteurs ruraux en Afrique de l\'Ouest',
      willingness_to_pay: 'Oui, jusqu\'à 50 USD/mois',
      estimated_budget: '100 000 USD pour le développement initial'
    }
    
    console.log('📤 Envoi de l\'idée standard...')
    console.log(`   Titre: ${ideaData.title}`)
    console.log(`   Secteur: ${ideaData.sector}`)
    console.log(`   Description: ${ideaData.description.substring(0, 100)}...`)
    
    const response = await client.post('/ideas', ideaData)
    
    console.log('✅ Idée standard soumise avec succès!')
    console.log(`   ID: ${response.data.idea.id}`)
    console.log(`   Message: ${response.data.message}`)
    console.log(`   Status: ${response.data.idea.status}`)
    console.log(`   Date de création: ${new Date(response.data.idea.created_at).toLocaleString('fr-FR')}`)
    
    return response.data.idea
    
  } catch (error) {
    console.log('❌ Erreur lors de la soumission standard:')
    console.log(`   Status: ${error.response?.status}`)
    console.log(`   Erreur: ${error.response?.data?.error || error.message}`)
    return null
  }
}

/**
 * Test 2: Soumission d'idée Design Thinking
 */
async function testDesignThinkingSubmission() {
  console.log('\n🎨 Test 2: Soumission d\'idée Design Thinking')
  console.log('=' .repeat(50))
  
  try {
    const designThinkingData = {
      title: `Plateforme d'éducation numérique pour zones rurales - Test DT ${Date.now()}`,
      sector: 'Éducation',
      design_thinking_mode: true,
      completion_percentage: 60,
      
      // EMPATHIZE
      empathy_target_users: 'Enfants et adolescents des zones rurales africaines âgés de 8 à 18 ans, ainsi que leurs enseignants et parents.',
      empathy_needs_frustrations: 'Manque d\'accès à des ressources éducatives de qualité, connexion internet limitée, équipements obsolètes, enseignants sous-formés aux nouvelles technologies.',
      empathy_usage_context: 'Utilisation principalement dans les écoles rurales avec une connectivité intermittente, sur des appareils partagés, pendant les heures de classe et à la maison.',
      
      // DEFINE
      define_problem_statement: 'Les enfants des zones rurales africaines n\'ont pas accès à une éducation numérique de qualité en raison du manque d\'infrastructure technologique et de ressources pédagogiques adaptées.',
      define_importance_reason: 'Cette inégalité éducative perpétue le cycle de pauvreté et limite les opportunités de développement économique des communautés rurales.',
      define_objective: 'Créer une plateforme éducative accessible hors ligne qui fournit des contenus pédagogiques interactifs adaptés au contexte local et aux programmes scolaires africains.',
      
      // IDEATE
      ideate_proposed_solution: 'Une plateforme éducative hybride (en ligne/hors ligne) avec des contenus téléchargeables, des jeux éducatifs, des vidéos courtes, et un système de suivi des progrès. La plateforme fonctionne sur tablettes robustes alimentées par énergie solaire.',
      ideate_alternatives_considered: 'Applications mobiles simples, kits éducatifs physiques, partenariats avec radios locales, formation d\'enseignants uniquement.',
      ideate_inspiration_references: 'Khan Academy, Eneza Education (Kenya), iSchool Zambia, One Laptop Per Child initiative.',
      
      // Champs de compatibilité
      description: 'Plateforme éducative numérique conçue spécifiquement pour les zones rurales africaines avec fonctionnalités hors ligne.',
      target_audience: 'Enfants et adolescents des zones rurales africaines',
      willingness_to_pay: 'Modèle freemium avec contenus premium',
      estimated_budget: '500 000 USD sur 3 ans'
    }
    
    console.log('📤 Envoi de l\'idée Design Thinking...')
    console.log(`   Titre: ${designThinkingData.title}`)
    console.log(`   Mode Design Thinking: ${designThinkingData.design_thinking_mode}`)
    console.log(`   Progression: ${designThinkingData.completion_percentage}%`)
    
    const response = await client.post('/ideas', designThinkingData)
    
    console.log('✅ Idée Design Thinking soumise avec succès!')
    console.log(`   ID: ${response.data.idea.id}`)
    console.log(`   Message: ${response.data.message}`)
    console.log(`   Mode DT: ${response.data.idea.design_thinking_mode}`)
    console.log(`   Progression: ${response.data.idea.completion_percentage}%`)
    console.log(`   Date de création: ${new Date(response.data.idea.created_at).toLocaleString('fr-FR')}`)
    
    return response.data.idea
    
  } catch (error) {
    console.log('❌ Erreur lors de la soumission Design Thinking:')
    console.log(`   Status: ${error.response?.status}`)
    console.log(`   Erreur: ${error.response?.data?.error || error.message}`)
    return null
  }
}

/**
 * Test 3: Validation des champs requis
 */
async function testFieldValidation() {
  console.log('\n✅ Test 3: Validation des champs requis')
  console.log('=' .repeat(50))
  
  const testCases = [
    {
      name: 'Titre manquant',
      data: { description: 'Test', sector: 'Agriculture' },
      expectedError: true
    },
    {
      name: 'Secteur manquant',
      data: { title: 'Test', description: 'Test' },
      expectedError: true
    },
    {
      name: 'Titre trop long',
      data: { 
        title: 'A'.repeat(201), // Dépasse la limite de 200 caractères
        description: 'Test',
        sector: 'Agriculture'
      },
      expectedError: true
    },
    {
      name: 'Données valides minimales',
      data: {
        title: 'Idée test valide',
        sector: 'Agriculture'
      },
      expectedError: false
    }
  ]
  
  for (const testCase of testCases) {
    try {
      console.log(`\n   Test: ${testCase.name}`)
      
      const response = await client.post('/ideas', testCase.data)
      
      if (testCase.expectedError) {
        console.log('   ⚠️  Données invalides acceptées (problème potentiel)')
      } else {
        console.log('   ✅ Données valides acceptées')
        console.log(`      ID créé: ${response.data.idea.id}`)
      }
      
    } catch (error) {
      if (testCase.expectedError && error.response?.status === 400) {
        console.log('   ✅ Données invalides correctement rejetées')
        console.log(`      Erreur: ${error.response.data.error}`)
      } else if (!testCase.expectedError) {
        console.log('   ❌ Données valides incorrectement rejetées')
        console.log(`      Erreur: ${error.response?.data?.error}`)
      } else {
        console.log(`   ❌ Erreur inattendue: ${error.response?.data?.error}`)
      }
    }
  }
}

/**
 * Test 4: Récupération des idées créées
 */
async function testIdeaRetrieval() {
  console.log('\n📖 Test 4: Récupération des idées créées')
  console.log('=' .repeat(50))
  
  try {
    const response = await client.get('/ideas?limit=5&sort=created_at&order=DESC')
    
    console.log('✅ Idées récupérées avec succès!')
    console.log(`   Total d'idées: ${response.data.pagination.total}`)
    console.log(`   Idées sur cette page: ${response.data.ideas.length}`)
    
    // Afficher les dernières idées créées
    response.data.ideas.forEach((idea, index) => {
      console.log(`\n   Idée ${index + 1}:`)
      console.log(`     ID: ${idea.id}`)
      console.log(`     Titre: ${idea.title}`)
      console.log(`     Secteur: ${idea.sector}`)
      console.log(`     Auteur: ${idea.author_name}`)
      console.log(`     Mode DT: ${idea.design_thinking_mode ? 'Oui' : 'Non'}`)
      console.log(`     Status: ${idea.status}`)
      console.log(`     Date: ${new Date(idea.created_at).toLocaleString('fr-FR')}`)
    })
    
    return response.data.ideas
    
  } catch (error) {
    console.log('❌ Erreur lors de la récupération:')
    console.log(`   Status: ${error.response?.status}`)
    console.log(`   Erreur: ${error.response?.data?.error || error.message}`)
    return []
  }
}

/**
 * Test principal
 */
async function runIdeaSubmissionTests() {
  console.log('🧪 Tests des formulaires de soumission d\'idées')
  console.log('=' .repeat(60))
  console.log(`📧 Compte test: ${TEST_EMAIL}`)
  console.log(`📍 API: ${API_BASE}`)
  
  // Vérifier la connectivité
  try {
    await axios.get(`${API_BASE}/health`)
    console.log('✅ Serveur accessible')
  } catch (error) {
    console.error('❌ Serveur non accessible:', error.message)
    console.log('\n💡 Assurez-vous que le serveur est démarré avec: npm run dev')
    return
  }
  
  // Se connecter avec le compte test
  const loginResult = await loginTestAccount()
  if (!loginResult) {
    console.log('❌ Impossible de se connecter. Tests annulés.')
    return
  }
  
  // Exécuter les tests
  const standardIdea = await testStandardIdeaSubmission()
  const designThinkingIdea = await testDesignThinkingSubmission()
  await testFieldValidation()
  const retrievedIdeas = await testIdeaRetrieval()
  
  // Résumé final
  console.log('\n🎉 Tests terminés!')
  console.log('\n📋 Résumé:')
  console.log(`   ✅ Connexion avec compte test: ${loginResult ? 'Réussie' : 'Échouée'}`)
  console.log(`   ✅ Soumission idée standard: ${standardIdea ? 'Réussie' : 'Échouée'}`)
  console.log(`   ✅ Soumission Design Thinking: ${designThinkingIdea ? 'Réussie' : 'Échouée'}`)
  console.log(`   ✅ Validation des champs: Testée`)
  console.log(`   ✅ Récupération des idées: ${retrievedIdeas.length > 0 ? 'Réussie' : 'Échouée'}`)
  
  console.log('\n💡 Prochaines étapes recommandées:')
  console.log('   - Tester l\'interface utilisateur dans le navigateur')
  console.log('   - Vérifier les formulaires de soumission')
  console.log('   - Tester la validation côté client')
  console.log('   - Considérer l\'ajout d\'un éditeur WYSIWYG')
  
  console.log('\n🔑 Informations de connexion pour tests manuels:')
  console.log(`   Email: ${TEST_EMAIL}`)
  console.log(`   Mot de passe: ${TEST_PASSWORD}`)
}

// Exécuter les tests
if (import.meta.url === `file://${process.argv[1]}`) {
  runIdeaSubmissionTests().catch(console.error)
}

export { runIdeaSubmissionTests }
