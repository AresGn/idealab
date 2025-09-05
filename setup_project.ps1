# IdéaLab Setup Script
# PowerShell version for better compatibility

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Configuration IdéaLab" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si Node.js est installé
Write-Host "Verification de Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "Node.js detecte: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERREUR: Node.js n'est pas installe" -ForegroundColor Red
    Write-Host "Veuillez installer Node.js depuis https://nodejs.org/" -ForegroundColor Red
    Read-Host "Appuyez sur Entree pour continuer"
    exit 1
}

# Vérifier si npm est installé
Write-Host "Verification de npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "npm detecte: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "ERREUR: npm n'est pas installe" -ForegroundColor Red
    Read-Host "Appuyez sur Entree pour continuer"
    exit 1
}

Write-Host ""

# Créer les répertoires principaux
Write-Host "Creation de la structure des dossiers..." -ForegroundColor Yellow

$folders = @(
    "public",
    "database",
    "client",
    "server",
    "client\assets",
    "client\components", 
    "client\views",
    "client\router",
    "client\store",
    "server\config",
    "server\controllers",
    "server\models", 
    "server\routes",
    "server\middlewares",
    "server\services",
    "server\utils"
)

foreach ($folder in $folders) {
    if (!(Test-Path $folder)) {
        New-Item -ItemType Directory -Path $folder -Force | Out-Null
        Write-Host "  Cree: $folder" -ForegroundColor Gray
    }
}

Write-Host "Structure des dossiers creee avec succes" -ForegroundColor Green
Write-Host ""

# Initialiser npm si package.json n'existe pas
if (!(Test-Path "package.json")) {
    Write-Host "Initialisation du projet npm..." -ForegroundColor Yellow
    npm init -y
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERREUR lors de l'initialisation npm" -ForegroundColor Red
        Read-Host "Appuyez sur Entree pour continuer"
        exit 1
    }
    Write-Host "package.json cree avec succes" -ForegroundColor Green
} else {
    Write-Host "package.json existe deja" -ForegroundColor Green
}
Write-Host ""

# Installer les dépendances backend
Write-Host "Installation des packages backend..." -ForegroundColor Yellow
npm install express pg cors dotenv helmet morgan bcryptjs jsonwebtoken multer
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERREUR lors de l'installation des packages backend" -ForegroundColor Red
    Read-Host "Appuyez sur Entree pour continuer"
    exit 1
}
Write-Host "Packages backend installes avec succes" -ForegroundColor Green
Write-Host ""

# Installer les dépendances frontend et outils de développement
Write-Host "Installation des outils de developpement..." -ForegroundColor Yellow
npm install -D vite @vitejs/plugin-vue nodemon concurrently
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERREUR lors de l'installation des outils de developpement" -ForegroundColor Red
    Read-Host "Appuyez sur Entree pour continuer"
    exit 1
}

Write-Host "Installation des packages frontend..." -ForegroundColor Yellow
npm install vue@latest vue-router@4 pinia axios
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERREUR lors de l'installation des packages frontend" -ForegroundColor Red
    Read-Host "Appuyez sur Entree pour continuer"
    exit 1
}
Write-Host "Packages frontend installes avec succes" -ForegroundColor Green
Write-Host ""

# Créer .gitignore
Write-Host "Creation des fichiers de configuration..." -ForegroundColor Yellow
$gitignoreContent = @"
node_modules/
dist/
.env
*.log
.DS_Store
Thumbs.db
"@
$gitignoreContent | Out-File -FilePath ".gitignore" -Encoding UTF8

# Mettre à jour package.json avec les scripts nécessaires
Write-Host "Configuration des scripts npm..." -ForegroundColor Yellow

$packageJsonPath = "package.json"
$packageJson = Get-Content $packageJsonPath | ConvertFrom-Json

# Ajouter le type module
$packageJson | Add-Member -MemberType NoteProperty -Name "type" -Value "module" -Force

# Ajouter les scripts
$scripts = @{
    "dev" = "concurrently `"npm run server:dev`" `"npm run client:dev`""
    "client:dev" = "vite"
    "client:build" = "vite build"
    "client:preview" = "vite preview"
    "server:dev" = "nodemon server/app.js"
    "server:start" = "node server/app.js"
    "build" = "npm run client:build"
    "start" = "npm run server:start"
    "db:init" = "node -e `"import('./server/database.js').then(db => db.initializeDatabase().then(() => process.exit(0)).catch(e => {console.error(e); process.exit(1)}))`""
}

$packageJson.scripts = $scripts

# Ajouter les engines
$engines = @{
    "node" = ">=16.0.0"
    "npm" = ">=8.0.0"
}
$packageJson | Add-Member -MemberType NoteProperty -Name "engines" -Value $engines -Force

# Sauvegarder le package.json
$packageJson | ConvertTo-Json -Depth 10 | Out-File -FilePath $packageJsonPath -Encoding UTF8

Write-Host "Scripts npm configures avec succes" -ForegroundColor Green
Write-Host ""

Write-Host "Tous les packages installes et fichiers de base crees" -ForegroundColor Green
Write-Host ""
Write-Host "Configuration terminee avec succes !" -ForegroundColor Green -BackgroundColor DarkGreen
Write-Host ""
Write-Host "Prochaines etapes :" -ForegroundColor Cyan
Write-Host "   1. Configurez votre base de donnees PostgreSQL" -ForegroundColor White
Write-Host "   2. Modifiez le fichier .env avec vos parametres de base de donnees" -ForegroundColor White
Write-Host "   3. Executez 'npm run db:init' pour initialiser la base de donnees" -ForegroundColor White
Write-Host "   4. Executez 'npm run dev' pour demarrer le serveur de developpement" -ForegroundColor White
Write-Host "   5. Ouvrez http://localhost:5173 dans votre navigateur" -ForegroundColor White
Write-Host "   6. Commencez a developper votre plateforme d'idees !" -ForegroundColor White
Write-Host ""
Write-Host "Conseils :" -ForegroundColor Cyan
Write-Host "   - Le frontend sera accessible sur http://localhost:5173" -ForegroundColor White
Write-Host "   - L'API backend sera accessible sur http://localhost:3000" -ForegroundColor White
Write-Host "   - Consultez le README.md pour plus d'informations" -ForegroundColor White
Write-Host ""
Read-Host "Appuyez sur Entree pour continuer"
