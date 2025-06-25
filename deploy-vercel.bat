@echo off
REM 🚀 Script de déploiement IdéaLab sur Vercel (Windows)
REM Auteur: Assistant IA

echo 🚀 Déploiement IdéaLab sur Vercel
echo ==================================

REM Vérifier si Vercel CLI est installé
where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Vercel CLI n'est pas installé
    echo [INFO] Installation de Vercel CLI...
    npm install -g vercel
)

REM Vérifier si nous sommes dans le bon répertoire
if not exist "vercel.json" (
    echo [ERROR] Fichier vercel.json non trouvé. Êtes-vous dans le bon répertoire ?
    pause
    exit /b 1
)

echo [INFO] Vérification des dépendances...

REM Installer les dépendances du client
echo [INFO] Installation des dépendances client...
cd client
if not exist "node_modules" (
    npm install
) else (
    echo [SUCCESS] Dépendances client déjà installées
)

REM Build du client
echo [INFO] Build du client...
npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Échec du build client
    pause
    exit /b 1
)
echo [SUCCESS] Build client réussi

cd ..

REM Installer les dépendances du serveur
echo [INFO] Installation des dépendances serveur...
cd server
if not exist "node_modules" (
    npm install
) else (
    echo [SUCCESS] Dépendances serveur déjà installées
)

cd ..

REM Vérifier les variables d'environnement
echo [INFO] Vérification des variables d'environnement...

if exist ".env" (
    echo [SUCCESS] Fichier .env trouvé
) else (
    echo [WARNING] Fichier .env non trouvé. Création d'un exemple...
    (
        echo # Configuration de la base de données
        echo DATABASE_URL=postgresql://USER:PASSWORD@HOST/DBNAME
        echo.
        echo # Configuration JWT
        echo JWT_SECRET=your-super-secret-jwt-key-here
        echo.
        echo # Configuration de l'application
        echo NODE_ENV=production
        echo PORT=3000
        echo.
        echo # Configuration CORS
        echo CORS_ORIGIN=https://your-domain.vercel.app
    ) > .env.example
    echo [WARNING] Veuillez configurer vos variables d'environnement dans Vercel Dashboard
)

REM Déploiement sur Vercel
echo [INFO] Déploiement sur Vercel...

REM Première fois ? Login requis
vercel whoami >nul 2>nul
if %errorlevel% neq 0 (
    echo [INFO] Connexion à Vercel requise...
    vercel login
)

REM Déploiement
echo [INFO] Lancement du déploiement...
vercel --prod

if %errorlevel% equ 0 (
    echo [SUCCESS] 🎉 Déploiement réussi !
    echo [INFO] Votre application est maintenant en ligne !
    echo.
    echo 📋 Prochaines étapes :
    echo 1. Configurez vos variables d'environnement dans Vercel Dashboard
    echo 2. Configurez votre base de données PostgreSQL
    echo 3. Testez votre application en production
    echo.
) else (
    echo [ERROR] Échec du déploiement
    pause
    exit /b 1
)

echo [SUCCESS] Script terminé avec succès !
pause
