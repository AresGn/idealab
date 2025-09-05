// Script pour mettre à jour package.json avec les scripts nécessaires
import fs from 'fs';

try {
    // Lire le package.json existant
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Ajouter le type module
    packageJson.type = 'module';
    
    // Ajouter les scripts
    packageJson.scripts = {
        'dev': 'concurrently "npm run server:dev" "npm run client:dev"',
        'client:dev': 'vite',
        'client:build': 'vite build',
        'client:preview': 'vite preview',
        'server:dev': 'nodemon server/app.js',
        'server:start': 'node server/app.js',
        'build': 'npm run client:build',
        'start': 'npm run server:start',
        'db:init': 'node -e "import(\'./server/database.js\').then(db => db.initializeDatabase().then(() => process.exit(0)).catch(e => {console.error(e); process.exit(1)}))"'
    };
    
    // Ajouter les engines
    packageJson.engines = {
        'node': '>=16.0.0',
        'npm': '>=8.0.0'
    };
    
    // Sauvegarder le package.json
    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
    
    console.log('✅ Scripts npm configurés avec succès');
    
} catch (error) {
    console.error('❌ Erreur lors de la configuration:', error.message);
    process.exit(1);
}
