<template>
  <nav class="navbar">
    <div class="navbar-container">
      <!-- Logo -->
      <router-link to="/" class="navbar-brand" @click="closeAllMenus">
        <div class="brand-icon">💡</div>
        <span class="brand-text">IdéaLab</span>
      </router-link>

      <!-- Navigation Desktop -->
      <div class="navbar-menu desktop-only">
        <router-link to="/" class="nav-link" @click="closeAllMenus">
          <i class="fas fa-home"></i>
          <span>Accueil</span>
        </router-link>

        <!-- Dropdown Idées -->
        <div class="nav-dropdown" ref="ideasDropdown">
          <button 
            class="nav-link dropdown-btn" 
            @click="toggleIdeasDropdown"
            :class="{ active: showIdeasDropdown }"
          >
            <i class="fas fa-lightbulb"></i>
            <span>Idées</span>
            <i class="fas fa-chevron-down" :class="{ rotated: showIdeasDropdown }"></i>
          </button>
          
          <div class="dropdown-menu" :class="{ show: showIdeasDropdown }">
            <router-link to="/all-ideas" class="dropdown-item" @click="closeAllMenus">
              <i class="fas fa-list"></i>
              <span>Toutes les idées</span>
            </router-link>
            <router-link to="/ideas-in-development" class="dropdown-item" @click="closeAllMenus">
              <i class="fas fa-cogs"></i>
              <span>En développement</span>
            </router-link>
            <div class="dropdown-divider"></div>
            <router-link to="/submit" class="dropdown-item highlight" @click="closeAllMenus">
              <i class="fas fa-plus-circle"></i>
              <span>Soumettre une idée</span>
            </router-link>
          </div>
        </div>

        <router-link 
          to="/dashboard" 
          class="nav-link" 
          v-if="authStore.isLoggedIn"
          @click="closeAllMenus"
        >
          <i class="fas fa-chart-line"></i>
          <span>Tableau de bord</span>
        </router-link>
      </div>

      <!-- Actions utilisateur Desktop -->
      <div class="navbar-actions desktop-only">
        <!-- Utilisateur connecté -->
        <div v-if="authStore.isLoggedIn" class="user-menu" ref="userDropdown">
          <button 
            class="user-btn" 
            @click="toggleUserDropdown"
            :class="{ active: showUserDropdown }"
          >
            <div class="user-avatar">
              <img v-if="authStore.user?.avatar" :src="authStore.user.avatar" :alt="authStore.userName">
              <i v-else class="fas fa-user-circle"></i>
            </div>
            <span class="user-name">{{ authStore.userName }}</span>
            <i class="fas fa-chevron-down" :class="{ rotated: showUserDropdown }"></i>
          </button>
          
          <div class="dropdown-menu user-dropdown-menu" :class="{ show: showUserDropdown }">
            <div class="user-info">
              <div class="user-avatar large">
                <img v-if="authStore.user?.avatar" :src="authStore.user.avatar" :alt="authStore.userName">
                <i v-else class="fas fa-user-circle"></i>
              </div>
              <div class="user-details">
                <span class="user-name">{{ authStore.userName }}</span>
                <span class="user-email">{{ authStore.user?.email }}</span>
              </div>
            </div>
            <div class="dropdown-divider"></div>
            <router-link to="/profile" class="dropdown-item" @click="closeAllMenus">
              <i class="fas fa-user"></i>
              <span>Mon profil</span>
            </router-link>
            <router-link to="/settings" class="dropdown-item" @click="closeAllMenus">
              <i class="fas fa-cog"></i>
              <span>Paramètres</span>
            </router-link>
            <div class="dropdown-divider"></div>
            <button @click="logout" class="dropdown-item logout-btn">
              <i class="fas fa-sign-out-alt"></i>
              <span>Déconnexion</span>
            </button>
          </div>
        </div>

        <!-- Utilisateur non connecté -->
        <div v-else class="auth-buttons">
          <router-link to="/login" class="btn btn-outline" @click="closeAllMenus">
            <i class="fas fa-sign-in-alt"></i>
            <span>Connexion</span>
          </router-link>
          <router-link to="/register" class="btn btn-primary" @click="closeAllMenus">
            <i class="fas fa-user-plus"></i>
            <span>S'inscrire</span>
          </router-link>
        </div>
      </div>

      <!-- Bouton Menu Mobile -->
      <button 
        class="mobile-menu-toggle mobile-only" 
        @click="toggleMobileMenu"
        :class="{ active: showMobileMenu }"
        aria-label="Menu de navigation"
      >
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </button>
    </div>

    <!-- Menu Mobile -->
    <div class="mobile-menu" :class="{ open: showMobileMenu }">
      <div class="mobile-menu-content">
        <router-link to="/" class="mobile-nav-item" @click="closeAllMenus">
          <i class="fas fa-home"></i>
          <span>Accueil</span>
        </router-link>

        <!-- Section Idées Mobile -->
        <div class="mobile-nav-section">
          <div class="mobile-section-title">
            <i class="fas fa-lightbulb"></i>
            <span>Idées</span>
          </div>
          <router-link to="/all-ideas" class="mobile-nav-item indent" @click="closeAllMenus">
            <i class="fas fa-list"></i>
            <span>Toutes les idées</span>
          </router-link>
          <router-link to="/ideas-in-development" class="mobile-nav-item indent" @click="closeAllMenus">
            <i class="fas fa-cogs"></i>
            <span>En développement</span>
          </router-link>
          <router-link to="/submit" class="mobile-nav-item indent highlight" @click="closeAllMenus">
            <i class="fas fa-plus-circle"></i>
            <span>Soumettre une idée</span>
          </router-link>
        </div>

        <router-link 
          to="/dashboard" 
          class="mobile-nav-item" 
          v-if="authStore.isLoggedIn"
          @click="closeAllMenus"
        >
          <i class="fas fa-chart-line"></i>
          <span>Tableau de bord</span>
        </router-link>

        <!-- Section Utilisateur Mobile -->
        <div v-if="authStore.isLoggedIn" class="mobile-user-section">
          <div class="mobile-user-info">
            <div class="user-avatar">
              <img v-if="authStore.user?.avatar" :src="authStore.user.avatar" :alt="authStore.userName">
              <i v-else class="fas fa-user-circle"></i>
            </div>
            <div class="user-details">
              <span class="user-name">{{ authStore.userName }}</span>
              <span class="user-email">{{ authStore.user?.email }}</span>
            </div>
          </div>
          <router-link to="/profile" class="mobile-nav-item" @click="closeAllMenus">
            <i class="fas fa-user"></i>
            <span>Mon profil</span>
          </router-link>
          <router-link to="/settings" class="mobile-nav-item" @click="closeAllMenus">
            <i class="fas fa-cog"></i>
            <span>Paramètres</span>
          </router-link>
          <button @click="logout" class="mobile-nav-item logout-btn">
            <i class="fas fa-sign-out-alt"></i>
            <span>Déconnexion</span>
          </button>
        </div>

        <!-- Auth Mobile -->
        <div v-else class="mobile-auth-section">
          <router-link to="/login" class="mobile-auth-btn login" @click="closeAllMenus">
            <i class="fas fa-sign-in-alt"></i>
            <span>Connexion</span>
          </router-link>
          <router-link to="/register" class="mobile-auth-btn register" @click="closeAllMenus">
            <i class="fas fa-user-plus"></i>
            <span>Créer un compte</span>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Overlay Mobile -->
    <div 
      v-if="showMobileMenu" 
      class="mobile-overlay" 
      @click="closeAllMenus"
    ></div>
  </nav>
</template>

<script>
import { useAuthStore } from '../store'

export default {
  name: 'ModernNavbar',
  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },
  data() {
    return {
      showMobileMenu: false,
      showIdeasDropdown: false,
      showUserDropdown: false
    }
  },
  methods: {
    toggleMobileMenu() {
      console.log('🔄 Toggle mobile menu')
      this.showMobileMenu = !this.showMobileMenu
      this.showIdeasDropdown = false
      this.showUserDropdown = false
      
      // Empêcher le scroll du body quand le menu est ouvert
      if (this.showMobileMenu) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    },

    toggleIdeasDropdown() {
      console.log('🔄 Toggle ideas dropdown')
      this.showIdeasDropdown = !this.showIdeasDropdown
      this.showUserDropdown = false
    },

    toggleUserDropdown() {
      console.log('🔄 Toggle user dropdown')
      this.showUserDropdown = !this.showUserDropdown
      this.showIdeasDropdown = false
    },

    closeAllMenus() {
      console.log('❌ Close all menus')
      this.showMobileMenu = false
      this.showIdeasDropdown = false
      this.showUserDropdown = false
      document.body.style.overflow = ''
    },

    async logout() {
      try {
        await this.authStore.logout()
        this.closeAllMenus()
        this.$router.push('/')
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error)
      }
    },

    handleClickOutside(event) {
      // Fermer les dropdowns si on clique à l'extérieur
      if (this.$refs.ideasDropdown && !this.$refs.ideasDropdown.contains(event.target)) {
        this.showIdeasDropdown = false
      }
      if (this.$refs.userDropdown && !this.$refs.userDropdown.contains(event.target)) {
        this.showUserDropdown = false
      }
    }
  },

  mounted() {
    // Écouter les clics à l'extérieur pour fermer les dropdowns
    document.addEventListener('click', this.handleClickOutside)
  },

  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
    document.body.style.overflow = ''
  }
}
</script>

<style scoped>
/* ===== NAVBAR PRINCIPAL ===== */
.navbar {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
  backdrop-filter: blur(10px);
  width: 100%;
  height: 70px;
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

/* ===== LOGO/BRAND ===== */
.navbar-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: white;
  font-weight: 700;
  font-size: 1.5rem;
  transition: var(--transition);
  flex-shrink: 0;
}

.navbar-brand:hover {
  color: rgba(255, 255, 255, 0.9);
  transform: scale(1.05);
}

.brand-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  transition: all 0.3s ease;
}

.navbar-brand:hover .brand-icon {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

.brand-text {
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* ===== NAVIGATION DESKTOP ===== */
.navbar-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  justify-content: center;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}

.nav-link:hover,
.nav-link.active,
.nav-link.router-link-active {
  color: white;
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}

/* ===== DROPDOWNS ===== */
.nav-dropdown {
  position: relative;
}

.dropdown-btn {
  position: relative;
}

.dropdown-btn .fa-chevron-down {
  font-size: 0.75rem;
  transition: all 0.3s ease;
}

.dropdown-btn .fa-chevron-down.rotated {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 220px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  z-index: 1000;
  overflow: hidden;
}

.dropdown-menu.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: #2d3748;
  text-decoration: none;
  transition: all 0.3s ease;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  font-size: 0.95rem;
}

.dropdown-item:hover {
  background: #f8fafc;
  color: #667eea;
}

.dropdown-item.highlight {
  color: #667eea;
  font-weight: 600;
}

.dropdown-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 0.5rem 0;
}

/* ===== ACTIONS UTILISATEUR ===== */
.navbar-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

/* ===== MENU UTILISATEUR ===== */
.user-menu {
  position: relative;
}

.user-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
  font-size: 0.95rem;
}

.user-btn:hover,
.user-btn.active {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-avatar i {
  font-size: 1.5rem;
  color: #718096;
}

.user-avatar.large {
  width: 48px;
  height: 48px;
}

.user-name {
  font-weight: 500;
  color: white;
}

.user-email {
  font-size: 0.875rem;
  color: #718096;
}

.user-dropdown-menu {
  right: 0;
  left: auto;
  min-width: 280px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.logout-btn {
  color: #e53e3e !important;
}

.logout-btn:hover {
  background: rgba(229, 62, 62, 0.1) !important;
}

/* ===== BOUTONS AUTH ===== */
.auth-buttons {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
  border: 1px solid transparent;
  cursor: pointer;
  font-size: 0.95rem;
}

.btn-outline {
  color: rgba(255, 255, 255, 0.9);
  border-color: rgba(255, 255, 255, 0.3);
}

.btn-outline:hover {
  color: white;
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.5);
}

.btn-primary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border-color: rgba(255, 255, 255, 0.3);
}

.btn-primary:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* ===== BOUTON MENU MOBILE ===== */
.mobile-menu-toggle {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  cursor: pointer;
  padding: 0;
  gap: 4px;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1001;
}

.mobile-menu-toggle:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

.hamburger-line {
  width: 24px;
  height: 2px;
  background: white;
  transition: all 0.3s ease;
  transform-origin: center;
}

.mobile-menu-toggle.active .hamburger-line:nth-child(1) {
  transform: rotate(45deg) translate(6px, 6px);
}

.mobile-menu-toggle.active .hamburger-line:nth-child(2) {
  opacity: 0;
}

.mobile-menu-toggle.active .hamburger-line:nth-child(3) {
  transform: rotate(-45deg) translate(6px, -6px);
}

/* ===== MENU MOBILE ===== */
.mobile-menu {
  position: fixed;
  top: 70px;
  right: 0;
  width: 320px;
  height: calc(100vh - 70px);
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  transform: translateX(100%);
  transition: transform 0.3s ease;
  overflow-y: auto;
  z-index: 9999;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.3);
}

.mobile-menu.open {
  transform: translateX(0);
}

.mobile-menu-content {
  padding: 1rem;
}

.mobile-nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  transition: all 0.3s ease;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  font-size: 1rem;
}

.mobile-nav-item:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
}

.mobile-nav-item.indent {
  margin-left: 1rem;
  padding-left: 2rem;
}

.mobile-nav-item.highlight {
  color: white;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.1);
}

.mobile-nav-section {
  margin-bottom: 1rem;
}

.mobile-section-title {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  font-weight: 600;
  color: white;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 0.5rem;
}

.mobile-user-section,
.mobile-auth-section {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.mobile-user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  margin-bottom: 1rem;
}

.mobile-auth-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  margin-bottom: 0.75rem;
  transition: all 0.3s ease;
}

.mobile-auth-btn.login {
  color: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.mobile-auth-btn.register {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.mobile-overlay {
  position: fixed;
  top: 70px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9998;
}

/* ===== RESPONSIVE ===== */
/* Desktop */
@media (min-width: 769px) {
  .mobile-only {
    display: none !important;
  }

  .desktop-only {
    display: flex !important;
  }
}

/* Mobile et Tablette */
@media (max-width: 768px) {
  .desktop-only {
    display: none !important;
  }

  .mobile-only {
    display: flex !important;
  }

  .brand-text {
    display: none;
  }

  .navbar-container {
    padding: 0 1rem;
  }
}

/* Petits mobiles */
@media (max-width: 480px) {
  .mobile-menu {
    width: 100%;
  }

  .navbar-container {
    padding: 0 0.75rem;
  }

  .brand-icon {
    width: 36px;
    height: 36px;
    font-size: 1.1rem;
  }

  .mobile-menu-toggle {
    width: 40px;
    height: 40px;
  }

  .hamburger-line {
    width: 20px;
  }
}

/* Très petits écrans */
@media (max-width: 320px) {
  .navbar-container {
    padding: 0 0.5rem;
  }

  .brand-icon {
    width: 32px;
    height: 32px;
    font-size: 1rem;
  }

  .mobile-menu-toggle {
    width: 36px;
    height: 36px;
  }

  .hamburger-line {
    width: 18px;
  }
}

/* Utilitaires */
.desktop-only {
  display: flex;
}

.mobile-only {
  display: none;
}
</style>
