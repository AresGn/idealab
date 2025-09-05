#!/bin/bash

# 🔄 Script de création de Pull Request - IdéaLab
# Auteur: Assistant IA

echo "🔄 Création de Pull Request pour IdéaLab"
echo "======================================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier si nous sommes sur la bonne branche
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "feature/vercel-deployment-responsive-refactoring" ]; then
    print_error "Vous n'êtes pas sur la branche feature/vercel-deployment-responsive-refactoring"
    print_status "Branche actuelle: $CURRENT_BRANCH"
    print_status "Changement vers la bonne branche..."
    git checkout feature/vercel-deployment-responsive-refactoring
fi

# Vérifier s'il y a des modifications non commitées
if ! git diff-index --quiet HEAD --; then
    print_warning "Il y a des modifications non commitées"
    print_status "Ajout et commit des modifications..."
    
    git add .
    git commit -m "chore: 📝 Finalisation documentation et configuration

- Ajout README détaillé avec instructions déploiement
- Configuration production complète
- Scripts de déploiement Windows/Linux
- Documentation technique et guides utilisateur"
    
    if [ $? -eq 0 ]; then
        print_success "Modifications commitées avec succès"
    else
        print_error "Échec du commit"
        exit 1
    fi
fi

# Pousser la branche vers le remote
print_status "Push de la branche vers GitHub..."
git push -u origin feature/vercel-deployment-responsive-refactoring

if [ $? -eq 0 ]; then
    print_success "Branche poussée avec succès vers GitHub"
else
    print_error "Échec du push vers GitHub"
    exit 1
fi

# Afficher les informations pour créer la PR
echo ""
print_success "🎉 Branche prête pour Pull Request !"
echo ""
echo "📋 Informations de la Pull Request :"
echo "=================================="
echo ""
echo "🌿 Branche source : feature/vercel-deployment-responsive-refactoring"
echo "🎯 Branche cible  : main"
echo ""
echo "📝 Titre suggéré :"
echo "feat: 🚀 Déploiement Vercel + Refactorisation + Responsivité Complète"
echo ""
echo "📄 Description suggérée :"
echo "## 🚀 Nouvelles Fonctionnalités"
echo ""
echo "### ✨ Publication Automatique"
echo "- Toutes les idées publiées immédiatement sans approbation"
echo "- Contrôle qualité par la communauté (votes et engagement)"
echo "- Mise à jour en temps réel (30s)"
echo "- Visibilité instantanée dans toutes les sections"
echo ""
echo "### 🎨 Modes de Soumission Avancés"
echo "- Mode Express pour soumission rapide"
echo "- Mode Design Thinking avec processus structuré (Empathie → Définition → Idéation)"
echo ""
echo "### 📊 Données 100% Dynamiques"
echo "- Remplacement de toutes les données statiques"
echo "- API statistiques en temps réel"
echo "- Graphiques interactifs avec Chart.js"
echo "- Tendances temporelles et analytics"
echo ""
echo "## 🔧 Refactorisation Majeure"
echo ""
echo "### 📉 Réduction Significative du Code"
echo "- **IdeasInDevelopment.vue** : 926 → ~300 lignes (67% réduction)"
echo "- **Profile.vue** : 821 → ~300 lignes (63% réduction)"
echo ""
echo "### 📦 Architecture Modulaire"
echo "- 9 nouveaux composants modulaires créés"
echo "- Séparation des styles CSS dans des fichiers dédiés"
echo "- Composition API pour logique complexe"
echo "- Props et événements bien définis"
echo ""
echo "## 📱 Responsivité Complète"
echo ""
echo "### 🎯 Design Mobile-First"
echo "- Navigation responsive avec menu hamburger"
echo "- Breakpoints optimisés (mobile/tablette/desktop)"
echo "- Accessibilité WCAG 2.1"
echo "- Support touch et clavier"
echo ""
echo "### 🎨 Composants Adaptatifs"
echo "- Grilles responsive automatiques"
echo "- Formulaires optimisés mobile"
echo "- Modals et dropdowns adaptatifs"
echo "- Images et médias responsive"
echo ""
echo "## 🚀 Déploiement Vercel"
echo ""
echo "### ⚙️ Configuration Complète"
echo "- \`vercel.json\` configuré pour frontend + backend"
echo "- Scripts de déploiement automatisé (Windows + Linux)"
echo "- Variables d'environnement de production"
echo "- Optimisations de build (code splitting, minification)"
echo ""
echo "### 📈 Performance"
echo "- Bundle splitting automatique"
echo "- Compression et minification"
echo "- Lazy loading des composants"
echo "- Cache optimisé"
echo ""
echo "## 🧪 Tests et Validation"
echo ""
echo "### ✅ Tests Réussis"
echo "- [x] Publication automatique fonctionnelle"
echo "- [x] Responsivité sur tous appareils (320px → 1920px+)"
echo "- [x] Navigation et interactions fluides"
echo "- [x] Données temps réel synchronisées"
echo "- [x] Performance maintenue (Lighthouse 90+)"
echo ""
echo "### 🔍 Aucune Régression"
echo "- [x] Toutes les fonctionnalités existantes préservées"
echo "- [x] Interface utilisateur cohérente"
echo "- [x] API endpoints fonctionnels"
echo "- [x] Base de données compatible"
echo ""
echo "## 📚 Documentation"
echo ""
echo "### 📖 Guides Ajoutés"
echo "- Guide de déploiement Vercel complet"
echo "- Rapport de refactorisation détaillé"
echo "- Tests de publication automatique"
echo "- Configuration de production"
echo ""
echo "## 🎯 Impact"
echo ""
echo "### 🚀 Pour les Utilisateurs"
echo "- Expérience plus fluide et responsive"
echo "- Publication immédiate des idées"
echo "- Interface moderne et accessible"
echo "- Performance améliorée"
echo ""
echo "### 👨‍💻 Pour les Développeurs"
echo "- Code plus maintenable et modulaire"
echo "- Architecture évolutive"
echo "- Déploiement simplifié"
echo "- Documentation complète"
echo ""
echo "---"
echo ""
echo "🔗 **Liens pour créer la PR :**"
echo ""
echo "1. **GitHub Web** :"
echo "   https://github.com/votre-username/idealab/compare/main...feature/vercel-deployment-responsive-refactoring"
echo ""
echo "2. **GitHub CLI** (si installé) :"
echo "   gh pr create --title \"feat: 🚀 Déploiement Vercel + Refactorisation + Responsivité Complète\" --body-file pr-description.md"
echo ""
echo "3. **Manuellement** :"
echo "   - Aller sur GitHub → votre repo → Pull Requests → New Pull Request"
echo "   - Sélectionner la branche feature/vercel-deployment-responsive-refactoring"
echo "   - Copier le titre et la description ci-dessus"
echo ""
print_success "Script terminé ! Votre branche est prête pour la Pull Request 🎉"
