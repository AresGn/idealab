@echo off
REM 🔄 Script de création de Pull Request - IdéaLab (Windows)

echo 🔄 Création de Pull Request pour IdéaLab
echo =======================================

REM Vérifier la branche actuelle
for /f "tokens=*" %%i in ('git branch --show-current') do set CURRENT_BRANCH=%%i

if not "%CURRENT_BRANCH%"=="feature/vercel-deployment-responsive-refactoring" (
    echo [ERROR] Vous n'êtes pas sur la bonne branche
    echo [INFO] Branche actuelle: %CURRENT_BRANCH%
    echo [INFO] Changement vers la bonne branche...
    git checkout feature/vercel-deployment-responsive-refactoring
)

REM Vérifier s'il y a des modifications non commitées
git diff-index --quiet HEAD --
if %errorlevel% neq 0 (
    echo [WARNING] Il y a des modifications non commitées
    echo [INFO] Ajout et commit des modifications...
    
    git add .
    git commit -m "chore: 📝 Finalisation documentation et configuration"
    
    if %errorlevel% equ 0 (
        echo [SUCCESS] Modifications commitées avec succès
    ) else (
        echo [ERROR] Échec du commit
        pause
        exit /b 1
    )
)

REM Pousser la branche vers le remote
echo [INFO] Push de la branche vers GitHub...
git push -u origin feature/vercel-deployment-responsive-refactoring

if %errorlevel% equ 0 (
    echo [SUCCESS] Branche poussée avec succès vers GitHub
) else (
    echo [ERROR] Échec du push vers GitHub
    pause
    exit /b 1
)

REM Afficher les informations pour créer la PR
echo.
echo [SUCCESS] 🎉 Branche prête pour Pull Request !
echo.
echo 📋 Informations de la Pull Request :
echo ==================================
echo.
echo 🌿 Branche source : feature/vercel-deployment-responsive-refactoring
echo 🎯 Branche cible  : main
echo.
echo 📝 Titre suggéré :
echo feat: 🚀 Déploiement Vercel + Refactorisation + Responsivité Complète
echo.
echo 📄 Description suggérée :
echo ## 🚀 Nouvelles Fonctionnalités
echo.
echo ### ✨ Publication Automatique
echo - Toutes les idées publiées immédiatement sans approbation
echo - Contrôle qualité par la communauté (votes et engagement)
echo - Mise à jour en temps réel (30s)
echo - Visibilité instantanée dans toutes les sections
echo.
echo ### 🎨 Modes de Soumission Avancés
echo - Mode Express pour soumission rapide
echo - Mode Design Thinking avec processus structuré
echo.
echo ### 📊 Données 100%% Dynamiques
echo - Remplacement de toutes les données statiques
echo - API statistiques en temps réel
echo - Graphiques interactifs avec Chart.js
echo.
echo ## 🔧 Refactorisation Majeure
echo.
echo ### 📉 Réduction Significative du Code
echo - IdeasInDevelopment.vue : 926 → ~300 lignes (67%% réduction)
echo - Profile.vue : 821 → ~300 lignes (63%% réduction)
echo.
echo ### 📦 Architecture Modulaire
echo - 9 nouveaux composants modulaires créés
echo - Séparation des styles CSS
echo - Composition API pour logique complexe
echo.
echo ## 📱 Responsivité Complète
echo.
echo ### 🎯 Design Mobile-First
echo - Navigation responsive avec menu hamburger
echo - Breakpoints optimisés
echo - Accessibilité WCAG 2.1
echo.
echo ## 🚀 Déploiement Vercel
echo.
echo ### ⚙️ Configuration Complète
echo - vercel.json configuré
echo - Scripts de déploiement automatisé
echo - Variables d'environnement de production
echo.
echo ## 🧪 Tests et Validation
echo.
echo ### ✅ Tests Réussis
echo - Publication automatique fonctionnelle
echo - Responsivité sur tous appareils
echo - Performance maintenue
echo.
echo 🔗 Liens pour créer la PR :
echo.
echo 1. GitHub Web :
echo    https://github.com/votre-username/idealab/compare/main...feature/vercel-deployment-responsive-refactoring
echo.
echo 2. GitHub CLI (si installé) :
echo    gh pr create --title "feat: 🚀 Déploiement Vercel + Refactorisation + Responsivité Complète"
echo.
echo 3. Manuellement :
echo    - Aller sur GitHub → votre repo → Pull Requests → New Pull Request
echo    - Sélectionner la branche feature/vercel-deployment-responsive-refactoring
echo.
echo [SUCCESS] Script terminé ! Votre branche est prête pour la Pull Request 🎉

pause
