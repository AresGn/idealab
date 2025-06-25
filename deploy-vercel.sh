#!/bin/bash

# 🚀 Script de déploiement IdéaLab sur Vercel
# Auteur: Assistant IA
# Date: $(date)

echo "🚀 Déploiement IdéaLab sur Vercel"
echo "=================================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages colorés
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

# Vérifier si Vercel CLI est installé
if ! command -v vercel &> /dev/null; then
    print_error "Vercel CLI n'est pas installé"
    print_status "Installation de Vercel CLI..."
    npm install -g vercel
fi

# Vérifier si nous sommes dans le bon répertoire
if [ ! -f "vercel.json" ]; then
    print_error "Fichier vercel.json non trouvé. Êtes-vous dans le bon répertoire ?"
    exit 1
fi

print_status "Vérification des dépendances..."

# Installer les dépendances du client
print_status "Installation des dépendances client..."
cd client
if [ ! -d "node_modules" ]; then
    npm install
else
    print_success "Dépendances client déjà installées"
fi

# Build du client
print_status "Build du client..."
npm run build
if [ $? -eq 0 ]; then
    print_success "Build client réussi"
else
    print_error "Échec du build client"
    exit 1
fi

cd ..

# Installer les dépendances du serveur
print_status "Installation des dépendances serveur..."
cd server
if [ ! -d "node_modules" ]; then
    npm install
else
    print_success "Dépendances serveur déjà installées"
fi

cd ..

# Vérifier les variables d'environnement
print_status "Vérification des variables d'environnement..."

if [ -f ".env" ]; then
    print_success "Fichier .env trouvé"
else
    print_warning "Fichier .env non trouvé. Création d'un exemple..."
    cat > .env.example << EOF
# Configuration de la base de données
DATABASE_URL=postgresql://username:password@host:port/database

# Configuration JWT
JWT_SECRET=your-super-secret-jwt-key-here

# Configuration de l'application
NODE_ENV=production
PORT=3000

# Configuration CORS
CORS_ORIGIN=https://your-domain.vercel.app
EOF
    print_warning "Veuillez configurer vos variables d'environnement dans Vercel Dashboard"
fi

# Déploiement sur Vercel
print_status "Déploiement sur Vercel..."

# Première fois ? Login requis
if ! vercel whoami &> /dev/null; then
    print_status "Connexion à Vercel requise..."
    vercel login
fi

# Déploiement
print_status "Lancement du déploiement..."
vercel --prod

if [ $? -eq 0 ]; then
    print_success "🎉 Déploiement réussi !"
    print_status "Votre application est maintenant en ligne !"
    
    # Afficher l'URL de déploiement
    DEPLOYMENT_URL=$(vercel ls | grep "idealab" | head -1 | awk '{print $2}')
    if [ ! -z "$DEPLOYMENT_URL" ]; then
        print_success "URL: https://$DEPLOYMENT_URL"
    fi
    
    echo ""
    echo "📋 Prochaines étapes :"
    echo "1. Configurez vos variables d'environnement dans Vercel Dashboard"
    echo "2. Configurez votre base de données PostgreSQL"
    echo "3. Testez votre application en production"
    echo ""
    
else
    print_error "Échec du déploiement"
    exit 1
fi

print_success "Script terminé avec succès !"
