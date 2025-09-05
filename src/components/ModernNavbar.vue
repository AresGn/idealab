<template>
  <nav class="modern-navbar">
    <div class="navbar-container">
      <!-- Logo et titre -->
      <div class="navbar-brand">
        <router-link to="/" class="brand-link" @click="closeMobileMenu">
          <div class="brand-icon">
            <i class="fas fa-lightbulb"></i>
          </div>
          <span class="brand-text">IdéaLab</span>
        </router-link>
      </div>

      <!-- Navigation principale (desktop) -->
      <div class="navbar-nav desktop-nav">
        <router-link to="/" class="nav-item" exact-active-class="active">
          <i class="fas fa-home"></i>
          <span>Accueil</span>
        </router-link>

        <!-- Dropdown Idées -->
        <div class="nav-dropdown" @mouseenter="showIdeasDropdown" @mouseleave="hideIdeasDropdown">
          <button class="nav-item dropdown-trigger" :class="{ active: ideasDropdownOpen }">
            <i class="fas fa-lightbulb"></i>
            <span>Idées</span>
            <i class="fas fa-chevron-down dropdown-arrow"></i>
          </button>
          <div class="dropdown-menu" :class="{ show: ideasDropdownOpen }">
            <router-link to="/all-ideas" class="dropdown-item" @click="closeDropdowns">
              <i class="fas fa-list"></i>
              <span>Toutes les idées</span>
            </router-link>
            <router-link to="/ideas-in-development" class="dropdown-item" @click="closeDropdowns">
              <i class="fas fa-cogs"></i>
              <span>En développement</span>
            </router-link>
            <div class="dropdown-divider"></div>
            <router-link to="/submit" class="dropdown-item highlight" @click="closeDropdowns">
              <i class="fas fa-plus-circle"></i>
              <span>Soumettre une idée</span>
            </router-link>
          </div>
        </div>

        <router-link 
          to="/dashboard" 
          class="nav-item" 
          v-if="authStore.isLoggedIn"
          active-class="active"
        >
          <i class="fas fa-chart-line"></i>
          <span>Tableau de bord</span>
        </router-link>
      </div>

      <!-- Actions utilisateur -->
      <div class="navbar-actions">
        <!-- Utilisateur connecté -->
        <div v-if="authStore.isLoggedIn" class="user-section">
          <div class="user-dropdown" @mouseenter="showUserDropdown" @mouseleave="hideUserDropdown">
            <button class="user-trigger" :class="{ active: userDropdownOpen }">
              <div class="user-avatar">
                <img v-if="authStore.user?.avatar" :src="authStore.user.avatar" :alt="authStore.userName">
                <i v-else class="fas fa-user-circle"></i>
              </div>
              <span class="user-name">{{ authStore.userName }}</span>
              <i class="fas fa-chevron-down"></i>
            </button>
            <div class="dropdown-menu user-menu" :class="{ show: userDropdownOpen }">
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
              <router-link to="/profile" class="dropdown-item" @click="closeDropdowns">
                <i class="fas fa-user"></i>
                <span>Mon profil</span>
              </router-link>
              <router-link to="/dashboard" class="dropdown-item" @click="closeDropdowns">
                <i class="fas fa-chart-line"></i>
                <span>Tableau de bord</span>
              </router-link>
              <router-link to="/settings" class="dropdown-item" @click="closeDropdowns">
                <i class="fas fa-cog"></i>
                <span>Paramètres</span>
              </router-link>
              <div class="dropdown-divider"></div>
              <button @click="logout" class="dropdown-item logout-item">
                <i class="fas fa-sign-out-alt"></i>
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Utilisateur non connecté -->
        <div v-else class="auth-section">
          <router-link to="/login" class="auth-btn login-btn">
            <i class="fas fa-sign-in-alt"></i>
            <span>Connexion</span>
          </router-link>
          <router-link to="/register" class="auth-btn register-btn">
            <i class="fas fa-user-plus"></i>
            <span>S'inscrire</span>
          </router-link>
        </div>

        <!-- Bouton menu mobile -->
        <button class="mobile-menu-btn" @click="toggleMobileMenu" :class="{ active: mobileMenuOpen }">
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        </button>
      </div>
    </div>

    <!-- Menu mobile -->
    <div class="mobile-menu" :class="{ open: mobileMenuOpen }">
      <div class="mobile-menu-content">
        <router-link to="/" class="mobile-nav-item" @click="closeMobileMenu">
          <i class="fas fa-home"></i>
          <span>Accueil</span>
        </router-link>

        <div class="mobile-nav-section">
          <div class="mobile-nav-title">
            <i class="fas fa-lightbulb"></i>
            <span>Idées</span>
          </div>
          <router-link to="/all-ideas" class="mobile-nav-item sub" @click="closeMobileMenu">
            <i class="fas fa-list"></i>
            <span>Toutes les idées</span>
          </router-link>
          <router-link to="/ideas-in-development" class="mobile-nav-item sub" @click="closeMobileMenu">
            <i class="fas fa-cogs"></i>
            <span>En développement</span>
          </router-link>
          <router-link to="/submit" class="mobile-nav-item sub highlight" @click="closeMobileMenu">
            <i class="fas fa-plus-circle"></i>
            <span>Soumettre une idée</span>
          </router-link>
        </div>

        <router-link 
          to="/dashboard" 
          class="mobile-nav-item" 
          v-if="authStore.isLoggedIn"
          @click="closeMobileMenu"
        >
          <i class="fas fa-chart-line"></i>
          <span>Tableau de bord</span>
        </router-link>

        <!-- Section utilisateur mobile -->
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
          <router-link to="/profile" class="mobile-nav-item" @click="closeMobileMenu">
            <i class="fas fa-user"></i>
            <span>Mon profil</span>
          </router-link>
          <router-link to="/settings" class="mobile-nav-item" @click="closeMobileMenu">
            <i class="fas fa-cog"></i>
            <span>Paramètres</span>
          </router-link>
          <button @click="logout" class="mobile-nav-item logout-item">
            <i class="fas fa-sign-out-alt"></i>
            <span>Déconnexion</span>
          </button>
        </div>

        <!-- Auth mobile -->
        <div v-else class="mobile-auth-section">
          <router-link to="/login" class="mobile-auth-btn login" @click="closeMobileMenu">
            <i class="fas fa-sign-in-alt"></i>
            <span>Connexion</span>
          </router-link>
          <router-link to="/register" class="mobile-auth-btn register" @click="closeMobileMenu">
            <i class="fas fa-user-plus"></i>
            <span>Créer un compte</span>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Overlay pour fermer le menu mobile -->
    <div v-if="mobileMenuOpen" class="mobile-overlay" @click="closeMobileMenu"></div>
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
      mobileMenuOpen: false,
      ideasDropdownOpen: false,
      userDropdownOpen: false
    }
  },
  methods: {
    toggleMobileMenu() {
      this.mobileMenuOpen = !this.mobileMenuOpen
      if (this.mobileMenuOpen) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    },

    closeMobileMenu() {
      this.mobileMenuOpen = false
      document.body.style.overflow = ''
    },

    showIdeasDropdown() {
      this.ideasDropdownOpen = true
    },

    hideIdeasDropdown() {
      setTimeout(() => {
        this.ideasDropdownOpen = false
      }, 150)
    },

    showUserDropdown() {
      this.userDropdownOpen = true
    },

    hideUserDropdown() {
      setTimeout(() => {
        this.userDropdownOpen = false
      }, 150)
    },

    closeDropdowns() {
      this.ideasDropdownOpen = false
      this.userDropdownOpen = false
    },

    async logout() {
      try {
        await this.authStore.logout()
        this.closeMobileMenu()
        this.closeDropdowns()
        this.$router.push('/')
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error)
      }
    }
  },

  mounted() {
    // Fermer les dropdowns en cliquant ailleurs
    document.addEventListener('click', (e) => {
      if (!this.$el.contains(e.target)) {
        this.closeDropdowns()
      }
    })
  },

  beforeUnmount() {
    document.body.style.overflow = ''
  }
}
</script>

<style scoped>
/* Variables CSS */
:root {
  --navbar-height: 70px;
  --primary-color: #667eea;
  --primary-dark: #5a67d8;
  --secondary-color: #764ba2;
  --text-color: #2d3748;
  --text-light: #718096;
  --border-color: #e2e8f0;
  --bg-white: #ffffff;
  --bg-light: #f8fafc;
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.15);
  --border-radius: 8px;
  --transition: all 0.3s ease;
}

/* Navbar principale */
.modern-navbar {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: var(--bg-white);
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  backdrop-filter: blur(10px);
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  height: var(--navbar-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Brand */
.navbar-brand {
  flex-shrink: 0;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: var(--text-color);
  font-weight: 700;
  font-size: 1.5rem;
  transition: var(--transition);
}

.brand-link:hover {
  color: var(--primary-color);
}

.brand-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
}

.brand-text {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Navigation desktop */
.desktop-nav {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  color: var(--text-color);
  text-decoration: none;
  border-radius: var(--border-radius);
  font-weight: 500;
  transition: var(--transition);
  position: relative;
}

.nav-item:hover,
.nav-item.active {
  color: var(--primary-color);
  background: rgba(102, 126, 234, 0.1);
}

/* Dropdown */
.nav-dropdown {
  position: relative;
}

.dropdown-trigger {
  background: none;
  border: none;
  cursor: pointer;
}

.dropdown-arrow {
  font-size: 0.75rem;
  transition: var(--transition);
}

.dropdown-trigger.active .dropdown-arrow {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 220px;
  background: var(--bg-white);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-md);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: var(--transition);
  z-index: 1000;
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
  color: var(--text-color);
  text-decoration: none;
  transition: var(--transition);
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
}

.dropdown-item:hover {
  background: var(--bg-light);
  color: var(--primary-color);
}

.dropdown-item.highlight {
  color: var(--primary-color);
  font-weight: 600;
}

.dropdown-divider {
  height: 1px;
  background: var(--border-color);
  margin: 0.5rem 0;
}

/* Actions utilisateur */
.navbar-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Section utilisateur */
.user-trigger {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  background: none;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: var(--transition);
}

.user-trigger:hover,
.user-trigger.active {
  background: var(--bg-light);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-light);
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-avatar i {
  font-size: 1.5rem;
  color: var(--text-light);
}

.user-avatar.large {
  width: 48px;
  height: 48px;
}

.user-name {
  font-weight: 500;
  color: var(--text-color);
}

.user-email {
  font-size: 0.875rem;
  color: var(--text-light);
}

.user-menu {
  right: 0;
  left: auto;
  min-width: 280px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.logout-item {
  color: #e53e3e !important;
}

.logout-item:hover {
  background: rgba(229, 62, 62, 0.1) !important;
}

/* Auth section */
.auth-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.auth-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  text-decoration: none;
  border-radius: var(--border-radius);
  font-weight: 500;
  transition: var(--transition);
}

.login-btn {
  color: var(--text-color);
}

.login-btn:hover {
  color: var(--primary-color);
  background: rgba(102, 126, 234, 0.1);
}

.register-btn {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
}

.register-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* Bouton menu mobile */
.mobile-menu-btn {
  display: none;
  flex-direction: column;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  gap: 4px;
}

.hamburger-line {
  width: 24px;
  height: 2px;
  background: var(--text-color);
  transition: var(--transition);
  transform-origin: center;
}

.mobile-menu-btn.active .hamburger-line:nth-child(1) {
  transform: rotate(45deg) translate(6px, 6px);
}

.mobile-menu-btn.active .hamburger-line:nth-child(2) {
  opacity: 0;
}

.mobile-menu-btn.active .hamburger-line:nth-child(3) {
  transform: rotate(-45deg) translate(6px, -6px);
}

/* Menu mobile */
.mobile-menu {
  position: fixed;
  top: var(--navbar-height);
  right: 0;
  width: 320px;
  height: calc(100vh - var(--navbar-height));
  background: var(--bg-white);
  border-left: 1px solid var(--border-color);
  transform: translateX(100%);
  transition: var(--transition);
  overflow-y: auto;
  z-index: 999;
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
  color: var(--text-color);
  text-decoration: none;
  border-radius: var(--border-radius);
  margin-bottom: 0.5rem;
  transition: var(--transition);
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
}

.mobile-nav-item:hover {
  background: var(--bg-light);
  color: var(--primary-color);
}

.mobile-nav-item.sub {
  margin-left: 1rem;
  padding-left: 2rem;
}

.mobile-nav-item.highlight {
  color: var(--primary-color);
  font-weight: 600;
}

.mobile-nav-section {
  margin-bottom: 1rem;
}

.mobile-nav-title {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  font-weight: 600;
  color: var(--text-color);
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 0.5rem;
}

.mobile-user-section,
.mobile-auth-section {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.mobile-user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-light);
  border-radius: var(--border-radius);
  margin-bottom: 1rem;
}

.mobile-auth-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem;
  text-decoration: none;
  border-radius: var(--border-radius);
  font-weight: 500;
  margin-bottom: 0.75rem;
  transition: var(--transition);
}

.mobile-auth-btn.login {
  color: var(--text-color);
  border: 1px solid var(--border-color);
}

.mobile-auth-btn.register {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
}

.mobile-overlay {
  position: fixed;
  top: var(--navbar-height);
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 998;
}

/* Responsive */
@media (max-width: 768px) {
  .desktop-nav {
    display: none;
  }

  .auth-section {
    display: none;
  }

  .user-section {
    display: none;
  }

  .mobile-menu-btn {
    display: flex;
  }

  .brand-text {
    display: none;
  }

  .navbar-container {
    padding: 0 1rem;
  }
}

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
}
</style>
