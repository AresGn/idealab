#!/usr/bin/env node

/**
 * Validation de la configuration vercel.json
 * Usage: node validate-vercel-config.js
 */

import fs from 'fs'
import path from 'path'

console.log('🔍 Validation de la configuration Vercel')
console.log('=' .repeat(50))

function validateVercelConfig() {
  try {
    // Lire le fichier vercel.json
    const configPath = path.join(process.cwd(), 'vercel.json')
    
    if (!fs.existsSync(configPath)) {
      console.log('❌ Fichier vercel.json non trouvé')
      return false
    }
    
    const configContent = fs.readFileSync(configPath, 'utf8')
    console.log('✅ Fichier vercel.json trouvé')
    
    // Parser le JSON
    let config
    try {
      config = JSON.parse(configContent)
      console.log('✅ JSON valide')
    } catch (error) {
      console.log('❌ JSON invalide:', error.message)
      return false
    }
    
    // Vérifier la structure
    console.log('\n📋 Validation de la structure:')
    
    // Version
    if (config.version === 2) {
      console.log('✅ Version: 2')
    } else {
      console.log('❌ Version manquante ou incorrecte')
      return false
    }
    
    // Builds
    if (config.builds && Array.isArray(config.builds)) {
      console.log(`✅ Builds: ${config.builds.length} configurations`)
      
      config.builds.forEach((build, index) => {
        console.log(`   Build ${index + 1}: ${build.use} (${build.src})`)
      })
    } else {
      console.log('❌ Section builds manquante ou invalide')
      return false
    }
    
    // Routes
    if (config.routes && Array.isArray(config.routes)) {
      console.log(`✅ Routes: ${config.routes.length} règles`)
      
      config.routes.forEach((route, index) => {
        if (route.handle) {
          console.log(`   Route ${index + 1}: handle "${route.handle}"`)
        } else if (route.src && route.dest) {
          console.log(`   Route ${index + 1}: ${route.src} → ${route.dest}`)
        } else {
          console.log(`   Route ${index + 1}: Configuration invalide`)
          return false
        }
      })
    } else if (config.rewrites && Array.isArray(config.rewrites)) {
      console.log(`✅ Rewrites: ${config.rewrites.length} règles`)
      
      config.rewrites.forEach((rewrite, index) => {
        if (rewrite.source && rewrite.destination) {
          console.log(`   Rewrite ${index + 1}: ${rewrite.source} → ${rewrite.destination}`)
        } else {
          console.log(`   Rewrite ${index + 1}: Configuration invalide`)
          return false
        }
      })
    } else {
      console.log('❌ Section routes/rewrites manquante')
      return false
    }
    
    // Environnement
    if (config.env) {
      console.log('✅ Variables d\'environnement configurées')
      Object.keys(config.env).forEach(key => {
        console.log(`   ${key}: ${config.env[key]}`)
      })
    }
    
    // Régions
    if (config.regions) {
      console.log(`✅ Régions: ${config.regions.join(', ')}`)
    }
    
    console.log('\n📄 Configuration actuelle:')
    console.log(JSON.stringify(config, null, 2))
    
    return true
    
  } catch (error) {
    console.log('❌ Erreur lors de la validation:', error.message)
    return false
  }
}

function checkDistDirectory() {
  console.log('\n📁 Vérification du répertoire de build:')
  
  const distPath = path.join(process.cwd(), 'dist')
  
  if (!fs.existsSync(distPath)) {
    console.log('⚠️  Répertoire dist/ non trouvé')
    console.log('   Exécutez: npm run build')
    return false
  }
  
  console.log('✅ Répertoire dist/ trouvé')
  
  // Vérifier index.html
  const indexPath = path.join(distPath, 'index.html')
  if (fs.existsSync(indexPath)) {
    console.log('✅ dist/index.html présent')
  } else {
    console.log('❌ dist/index.html manquant')
    return false
  }
  
  // Vérifier les assets
  const assetsPath = path.join(distPath, 'assets')
  if (fs.existsSync(assetsPath)) {
    const assets = fs.readdirSync(assetsPath)
    console.log(`✅ dist/assets/ présent (${assets.length} fichiers)`)
  } else {
    console.log('⚠️  dist/assets/ non trouvé')
  }
  
  return true
}

function generateDeploymentInstructions(configValid, distValid) {
  console.log('\n' + '='.repeat(50))
  console.log('🚀 INSTRUCTIONS DE DÉPLOIEMENT')
  console.log('='.repeat(50))
  
  if (!configValid) {
    console.log('❌ Configuration vercel.json invalide')
    console.log('   Corrigez les erreurs ci-dessus avant de déployer')
    return
  }
  
  if (!distValid) {
    console.log('⚠️  Build manquant ou incomplet')
    console.log('   Exécutez: npm run build')
    console.log('   Puis redéployez')
  }
  
  console.log('✅ Configuration prête pour le déploiement')
  console.log('\n📝 Commandes de déploiement:')
  console.log('   git add vercel.json')
  console.log('   git commit -m "Fix: Correct vercel.json with filesystem handle for SPA routing"')
  console.log('   git push origin main')
  console.log('\n⏳ Après le déploiement:')
  console.log('   node test-complete-flow.js')
  
  console.log('\n🎯 Résultat attendu:')
  console.log('   - Routes SPA: 100% fonctionnelles')
  console.log('   - Score global: 100/100')
  console.log('   - Application prête pour la production')
}

function main() {
  console.log('🚀 Démarrage de la validation...\n')
  
  const configValid = validateVercelConfig()
  const distValid = checkDistDirectory()
  
  generateDeploymentInstructions(configValid, distValid)
  
  if (configValid && distValid) {
    console.log('\n🎉 Validation réussie - Prêt à déployer!')
    process.exit(0)
  } else {
    console.log('\n⚠️  Validation échouée - Corrections nécessaires')
    process.exit(1)
  }
}

main()
