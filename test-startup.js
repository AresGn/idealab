#!/usr/bin/env node

/**
 * Script de test pour vérifier que IdéaLab démarre correctement
 * Usage: node test-startup.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Test de démarrage d\'IdéaLab...\n');

// 1. Vérifier que tous les fichiers requis existent
const requiredFiles = [
  'server/app.js',
  'server/routes/auth.js',
  'server/routes/ideas.js',
  'client/views/Login.vue',
  'client/views/Register.vue',
  'client/views/Dashboard.vue',
  'client/views/Profile.vue',
  'client/views/Settings.vue',
  'client/views/IdeaDetail.vue',
  'client/views/EditIdea.vue',
  'client/views/NotFound.vue',
  'client/views/ForgotPassword.vue',
  'client/views/Terms.vue',
  'client/views/Privacy.vue',
  'client/router/index.js',
  'client/store/index.js',
  '.gitignore'
];

console.log('📁 Vérification des fichiers requis...');
let missingFiles = [];

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MANQUANT`);
    missingFiles.push(file);
  }
});

if (missingFiles.length > 0) {
  console.log(`\n❌ ${missingFiles.length} fichier(s) manquant(s):`);
  missingFiles.forEach(file => console.log(`   - ${file}`));
  process.exit(1);
}

// 2. Vérifier la structure des routes
console.log('\n🛣️  Vérification des routes...');

try {
  const routerContent = fs.readFileSync('client/router/index.js', 'utf8');
  
  const requiredRoutes = [
    '/login',
    '/register', 
    '/dashboard',
    '/profile',
    '/settings',
    '/idea/:id',
    '/edit-idea/:id',
    '/terms',
    '/privacy',
    '/forgot-password'
  ];
  
  requiredRoutes.forEach(route => {
    if (routerContent.includes(`path: '${route}'`)) {
      console.log(`✅ Route ${route}`);
    } else {
      console.log(`❌ Route ${route} - MANQUANTE`);
    }
  });
  
} catch (error) {
  console.log('❌ Erreur lors de la lecture du router:', error.message);
}

// 3. Vérifier les imports dans le router
console.log('\n📦 Vérification des imports...');

try {
  const routerContent = fs.readFileSync('client/router/index.js', 'utf8');
  
  const requiredImports = [
    'Login',
    'Register',
    'Profile', 
    'Settings'
  ];
  
  requiredImports.forEach(component => {
    if (routerContent.includes(`import ${component}`)) {
      console.log(`✅ Import ${component}`);
    } else {
      console.log(`❌ Import ${component} - MANQUANT`);
    }
  });
  
} catch (error) {
  console.log('❌ Erreur lors de la vérification des imports:', error.message);
}

// 4. Vérifier les routes du serveur
console.log('\n🖥️  Vérification des routes serveur...');

try {
  const ideasRoutes = fs.readFileSync('server/routes/ideas.js', 'utf8');
  
  // Vérifier que la route /stats/overview est avant /:id
  const statsIndex = ideasRoutes.indexOf("router.get('/stats/overview'");
  const idIndex = ideasRoutes.indexOf("router.get('/:id'");
  
  if (statsIndex !== -1 && idIndex !== -1) {
    if (statsIndex < idIndex) {
      console.log('✅ Route /stats/overview correctement placée avant /:id');
    } else {
      console.log('❌ Route /stats/overview doit être placée AVANT /:id');
    }
  } else {
    console.log('⚠️  Impossible de vérifier l\'ordre des routes');
  }
  
} catch (error) {
  console.log('❌ Erreur lors de la vérification des routes serveur:', error.message);
}

// 5. Vérifier le .gitignore
console.log('\n🔒 Vérification de la sécurité (.gitignore)...');

try {
  const gitignoreContent = fs.readFileSync('.gitignore', 'utf8');
  
  const securityItems = [
    'database/',
    'scripts/',
    '.env',
    'node_modules/'
  ];
  
  securityItems.forEach(item => {
    if (gitignoreContent.includes(item)) {
      console.log(`✅ ${item} ignoré`);
    } else {
      console.log(`❌ ${item} - NON IGNORÉ (RISQUE DE SÉCURITÉ)`);
    }
  });
  
} catch (error) {
  console.log('❌ Erreur lors de la vérification du .gitignore:', error.message);
}

// 6. Vérifier les package.json
console.log('\n📋 Vérification des dépendances...');

try {
  // Serveur
  if (fs.existsSync('server/package.json')) {
    const serverPkg = JSON.parse(fs.readFileSync('server/package.json', 'utf8'));
    console.log(`✅ Server package.json - ${Object.keys(serverPkg.dependencies || {}).length} dépendances`);
  } else {
    console.log('❌ server/package.json manquant');
  }
  
  // Client
  if (fs.existsSync('client/package.json')) {
    const clientPkg = JSON.parse(fs.readFileSync('client/package.json', 'utf8'));
    console.log(`✅ Client package.json - ${Object.keys(clientPkg.dependencies || {}).length} dépendances`);
  } else {
    console.log('❌ client/package.json manquant');
  }
  
} catch (error) {
  console.log('❌ Erreur lors de la vérification des package.json:', error.message);
}

console.log('\n🎉 Test de démarrage terminé !');
console.log('\n📝 Instructions pour démarrer IdéaLab :');
console.log('1. Terminal 1 - Serveur backend :');
console.log('   cd server && npm install && npm run dev');
console.log('\n2. Terminal 2 - Client frontend :');
console.log('   cd client && npm install && npm run dev');
console.log('\n3. Ouvrir http://localhost:5173 dans votre navigateur');
console.log('\n🔐 Comptes de test :');
console.log('   Email: admin@idealab.com | Mot de passe: Admin2024!');
console.log('   Email: john.doe@example.com | Mot de passe: JohnSecure123!');
console.log('\n✨ Bienvenue sur IdéaLab - Votre plateforme d\'innovation ! ✨');
