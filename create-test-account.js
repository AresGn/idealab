#!/usr/bin/env node

/**
 * Script pour créer un compte test avec l'email btcoin2035@gmail.com
 */

import axios from 'axios'
import { query } from './api/database.js'

const API_BASE = 'http://localhost:3000/api'
const TEST_EMAIL = 'btcoin2035@gmail.com'
const TEST_USERNAME = 'testuser_btc2035'
const TEST_PASSWORD = 'TestPassword123!'

async function createTestAccount() {
  console.log('👤 Création du compte test')
  console.log('=' .repeat(50))
  console.log(`📧 Email: ${TEST_EMAIL}`)
  console.log(`👤 Nom d'utilisateur: ${TEST_USERNAME}`)
  console.log(`🔑 Mot de passe: ${TEST_PASSWORD}`)
  
  try {
    // Vérifier si l'utilisateur existe déjà
    console.log('\n🔍 Vérification de l\'existence du compte...')
    const existingUser = await query(
      'SELECT id, username, email FROM users WHERE email = $1 OR username = $2',
      [TEST_EMAIL, TEST_USERNAME]
    )
    
    if (existingUser.rows.length > 0) {
      const user = existingUser.rows[0]
      console.log('ℹ️  Le compte existe déjà!')
      console.log(`   ID: ${user.id}`)
      console.log(`   Username: ${user.username}`)
      console.log(`   Email: ${user.email}`)
      
      console.log('\n🔑 Informations de connexion:')
      console.log(`   Email/Username: ${TEST_EMAIL} ou ${TEST_USERNAME}`)
      console.log(`   Mot de passe: ${TEST_PASSWORD}`)
      
      return {
        exists: true,
        user: user,
        credentials: {
          email: TEST_EMAIL,
          username: TEST_USERNAME,
          password: TEST_PASSWORD
        }
      }
    }
    
    // Créer le compte via l'API
    console.log('\n📝 Création du compte via l\'API...')
    
    const client = axios.create({
      baseURL: API_BASE,
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    const registrationData = {
      username: TEST_USERNAME,
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      confirmPassword: TEST_PASSWORD
    }
    
    const response = await client.post('/auth/register', registrationData)
    
    console.log('✅ Compte créé avec succès!')
    console.log(`   Message: ${response.data.message}`)
    console.log(`   Token reçu: ${response.data.token ? 'Oui' : 'Non'}`)
    
    // Récupérer les informations du compte créé
    const newUser = await query(
      'SELECT id, username, email, created_at FROM users WHERE email = $1',
      [TEST_EMAIL]
    )
    
    if (newUser.rows.length > 0) {
      const user = newUser.rows[0]
      console.log('\n👤 Détails du compte créé:')
      console.log(`   ID: ${user.id}`)
      console.log(`   Username: ${user.username}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Créé le: ${new Date(user.created_at).toLocaleString('fr-FR')}`)
    }
    
    console.log('\n🔑 Informations de connexion:')
    console.log(`   Email/Username: ${TEST_EMAIL} ou ${TEST_USERNAME}`)
    console.log(`   Mot de passe: ${TEST_PASSWORD}`)
    
    return {
      exists: false,
      user: newUser.rows[0],
      credentials: {
        email: TEST_EMAIL,
        username: TEST_USERNAME,
        password: TEST_PASSWORD
      }
    }
    
  } catch (error) {
    console.log('❌ Erreur lors de la création du compte:')
    
    if (error.response) {
      console.log(`   Status: ${error.response.status}`)
      console.log(`   Erreur: ${error.response.data.error || error.response.data.message}`)
      
      // Si l'erreur indique que l'utilisateur existe déjà
      if (error.response.status === 400 && 
          (error.response.data.error?.includes('existe déjà') || 
           error.response.data.error?.includes('already exists'))) {
        
        console.log('\nℹ️  Le compte semble exister. Vérification en base...')
        
        const existingUser = await query(
          'SELECT id, username, email FROM users WHERE email = $1 OR username = $2',
          [TEST_EMAIL, TEST_USERNAME]
        )
        
        if (existingUser.rows.length > 0) {
          const user = existingUser.rows[0]
          console.log('✅ Compte trouvé en base:')
          console.log(`   ID: ${user.id}`)
          console.log(`   Username: ${user.username}`)
          console.log(`   Email: ${user.email}`)
          
          console.log('\n🔑 Informations de connexion:')
          console.log(`   Email/Username: ${TEST_EMAIL} ou ${TEST_USERNAME}`)
          console.log(`   Mot de passe: ${TEST_PASSWORD}`)
          
          return {
            exists: true,
            user: user,
            credentials: {
              email: TEST_EMAIL,
              username: TEST_USERNAME,
              password: TEST_PASSWORD
            }
          }
        }
      }
    } else {
      console.log(`   Erreur: ${error.message}`)
    }
    
    return null
  }
}

async function testLogin(credentials) {
  console.log('\n🔐 Test de connexion')
  console.log('=' .repeat(50))
  
  try {
    const client = axios.create({
      baseURL: API_BASE,
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    const loginData = {
      email: credentials.email,
      password: credentials.password
    }
    
    console.log(`📧 Tentative de connexion avec: ${credentials.email}`)
    
    const response = await client.post('/auth/login', loginData)
    
    console.log('✅ Connexion réussie!')
    console.log(`   Token reçu: ${response.data.token ? 'Oui' : 'Non'}`)
    console.log(`   Message: ${response.data.message}`)
    
    if (response.data.user) {
      console.log('\n👤 Informations utilisateur:')
      console.log(`   ID: ${response.data.user.id}`)
      console.log(`   Username: ${response.data.user.username}`)
      console.log(`   Email: ${response.data.user.email}`)
    }
    
    return true
    
  } catch (error) {
    console.log('❌ Erreur de connexion:')
    console.log(`   Status: ${error.response?.status}`)
    console.log(`   Erreur: ${error.response?.data?.error || error.message}`)
    return false
  }
}

async function runTestAccountCreation() {
  console.log('🧪 Création et test du compte test')
  console.log('=' .repeat(60))
  
  // Vérifier la connectivité
  try {
    await axios.get(`${API_BASE}/health`)
    console.log('✅ Serveur accessible')
  } catch (error) {
    console.error('❌ Serveur non accessible:', error.message)
    console.log('\n💡 Assurez-vous que le serveur est démarré avec: npm run dev')
    return
  }
  
  // Créer le compte
  const result = await createTestAccount()
  
  if (result && result.credentials) {
    // Tester la connexion
    await testLogin(result.credentials)
    
    console.log('\n🎉 Compte test prêt!')
    console.log('\n📋 Résumé des informations de connexion:')
    console.log('=' .repeat(50))
    console.log(`📧 Email: ${result.credentials.email}`)
    console.log(`👤 Nom d'utilisateur: ${result.credentials.username}`)
    console.log(`🔑 Mot de passe: ${result.credentials.password}`)
    console.log('\n💡 Vous pouvez maintenant utiliser ces informations pour:')
    console.log('   - Tester les formulaires de soumission d\'idées')
    console.log('   - Accéder au tableau de bord')
    console.log('   - Tester toutes les fonctionnalités nécessitant une authentification')
    
  } else {
    console.log('\n❌ Impossible de créer ou récupérer le compte test')
  }
}

// Exécuter le script
if (import.meta.url === `file://${process.argv[1]}`) {
  runTestAccountCreation().catch(console.error)
}

export { createTestAccount, testLogin }
