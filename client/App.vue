<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-brand">
          <router-link to="/" class="nav-title">
            <i class="fas fa-lightbulb"></i>
            IdéaLab
          </router-link>
        </div>
        <div class="nav-links">
          <!-- Menu hamburger pour mobile -->
          <button class="mobile-menu-toggle" @click="toggleMobileMenu">
            <i class="fas fa-bars"></i>
          </button>

          <!-- Navigation desktop et mobile -->
          <div class="nav-menu" :class="{ 'mobile-open': showMobileMenu }">
            <router-link to="/" class="nav-link" @click="closeMobileMenu">
              <i class="fas fa-home"></i>
              Accueil
            </router-link>

            <!-- Menu déroulant Idées -->
            <div class="nav-dropdown">
              <button class="nav-link dropdown-trigger" @click="toggleDropdown('ideas')">
                <i class="fas fa-lightbulb"></i>
                Idées
                <i class="fas fa-chevron-down dropdown-arrow"></i>
              </button>
              <div class="dropdown-content" :class="{ 'show': activeDropdown === 'ideas' }">
                <router-link to="/all-ideas" class="dropdown-link" @click="closeDropdowns">
                  <i class="fas fa-list"></i>
                  Toutes les idées
                </router-link>
                <router-link to="/ideas-in-development" class="dropdown-link" @click="closeDropdowns">
                  <i class="fas fa-cogs"></i>
                  En développement
                </router-link>
                <router-link to="/submit" class="dropdown-link" @click="closeDropdowns">
                  <i class="fas fa-plus-circle"></i>
                  Soumettre une idée
                </router-link>
              </div>
            </div>

            <router-link to="/dashboard" class="nav-link" v-if="authStore.isLoggedIn" @click="closeMobileMenu">
              <i class="fas fa-chart-line"></i>
              Tableau de bord
            </router-link>
          </div>
        </div>
        <div class="nav-user" v-if="authStore.isLoggedIn">
          <div class="user-info">
            <span class="user-name">{{ authStore.userName }}</span>
            <div class="user-dropdown">
              <button class="dropdown-toggle" @click="toggleDropdown">
                <i class="fas fa-user-circle"></i>
                <i class="fas fa-chevron-down"></i>
              </button>
              <div class="dropdown-menu" v-show="showDropdown">
                <router-link to="/profile" class="dropdown-item">
                  <i class="fas fa-user"></i>
                  Profil
                </router-link>
                <router-link to="/settings" class="dropdown-item">
                  <i class="fas fa-cog"></i>
                  Paramètres
                </router-link>
                <hr class="dropdown-divider">
                <button @click="logout" class="dropdown-item logout-btn">
                  <i class="fas fa-sign-out-alt"></i>
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="nav-auth" v-else>
          <router-link to="/login" class="nav-link">
            <i class="fas fa-sign-in-alt"></i>
            Connexion
          </router-link>
          <router-link to="/register" class="nav-link btn-primary">
            <i class="fas fa-user-plus"></i>
            Inscription
          </router-link>
        </div>
      </div>
    </nav>
    
    <main class="main-content">
      <router-view />
    </main>
    
    <footer class="footer">
      <p>&copy; 2024 IdéaLab - Plateforme collaborative pour l'Afrique</p>
    </footer>
  </div>
</template>

<script>
import { useAuthStore } from './store'

export default {
  name: 'App',
  data() {
    return {
      showDropdown: false,
      showMobileMenu: false,
      activeDropdown: null
    }
  },
  computed: {
    authStore() {
      return useAuthStore()
    }
  },
  methods: {
    toggleDropdown(type = 'user') {
      if (type === 'user') {
        this.showDropdown = !this.showDropdown
      } else {
        this.activeDropdown = this.activeDropdown === type ? null : type
      }
    },
    toggleMobileMenu() {
      this.showMobileMenu = !this.showMobileMenu
    },
    closeMobileMenu() {
      this.showMobileMenu = false
      this.activeDropdown = null
    },
    closeDropdowns() {
      this.activeDropdown = null
      this.showMobileMenu = false
    },
    async logout() {
      await this.authStore.logout()
      this.showDropdown = false
      this.$router.push('/')
    }
  },
  async mounted() {
    // Initialiser l'authentification
    await this.authStore.initializeAuth()

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.user-dropdown')) {
        this.showDropdown = false
      }
      if (!e.target.closest('.nav-dropdown') && !e.target.closest('.mobile-menu-toggle')) {
        this.activeDropdown = null
        this.showMobileMenu = false
      }
    })
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f5f5f5;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Navigation */
.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-brand .nav-title {
  color: white;
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-brand .nav-title:hover {
  opacity: 0.9;
}

.nav-links {
  display: flex;
  align-items: center;
  position: relative;
}

/* Menu hamburger pour mobile */
.mobile-menu-toggle {
  display: none;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background 0.3s ease;
}

.mobile-menu-toggle:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Menu de navigation */
.nav-menu {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-link {
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
}

.nav-link.router-link-active {
  background: rgba(255, 255, 255, 0.2);
}

.nav-link.btn-primary {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.nav-link.btn-primary:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Menu déroulant de navigation */
.nav-dropdown {
  position: relative;
}

.dropdown-trigger {
  background: none;
  border: none;
  cursor: pointer;
}

.dropdown-arrow {
  margin-left: 0.5rem;
  font-size: 0.8rem;
  transition: transform 0.3s ease;
}

.nav-dropdown .dropdown-content.show .dropdown-arrow {
  transform: rotate(180deg);
}

.dropdown-content {
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  min-width: 220px;
  padding: 0.5rem 0;
  margin-top: 0.5rem;
  z-index: 1001;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease;
}

.dropdown-content.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: #333;
  text-decoration: none;
  transition: background 0.2s ease;
  font-size: 0.9rem;
  font-weight: 500;
}

.dropdown-link:hover {
  background: #f8f9fa;
  color: #667eea;
}

.dropdown-link i {
  width: 16px;
  text-align: center;
}

/* User dropdown */
.nav-user {
  position: relative;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-name {
  font-weight: 500;
  color: white;
}

.user-dropdown {
  position: relative;
}

.dropdown-toggle {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background 0.3s ease;
}

.dropdown-toggle:hover {
  background: rgba(255, 255, 255, 0.1);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  padding: 0.5rem 0;
  margin-top: 0.5rem;
  z-index: 1001;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: #333;
  text-decoration: none;
  transition: background 0.2s ease;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  font-size: 0.9rem;
}

.dropdown-item:hover {
  background: #f8f9fa;
}

.dropdown-divider {
  border: none;
  border-top: 1px solid #e9ecef;
  margin: 0.5rem 0;
}

.logout-btn {
  color: #dc3545;
}

.logout-btn:hover {
  background: #fff5f5;
}

.nav-auth {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.main-content {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
}

.footer {
  background-color: #34495e;
  color: white;
  text-align: center;
  padding: 1rem;
  margin-top: auto;
}

/* Responsive Design */
@media (max-width: 768px) {
  .nav-container {
    padding: 0 1rem;
  }

  .mobile-menu-toggle {
    display: block;
  }

  .nav-menu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    flex-direction: column;
    gap: 0;
    padding: 1rem 0;
    margin-top: 1rem;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    opacity: 0;
    visibility: hidden;
    transform: translateY(-10px);
    transition: all 0.3s ease;
    z-index: 1000;
  }

  .nav-menu.mobile-open {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }

  .nav-menu .nav-link {
    width: 100%;
    padding: 1rem 1.5rem;
    border-radius: 0;
    justify-content: flex-start;
  }

  .nav-dropdown {
    width: 100%;
  }

  .nav-dropdown .dropdown-trigger {
    width: 100%;
    padding: 1rem 1.5rem;
    justify-content: space-between;
    text-align: left;
  }

  .dropdown-content {
    position: static;
    background: rgba(255, 255, 255, 0.1);
    box-shadow: none;
    margin: 0;
    border-radius: 0;
    padding: 0;
    opacity: 1;
    visibility: visible;
    transform: none;
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;
  }

  .dropdown-content.show {
    max-height: 300px;
  }

  .dropdown-link {
    color: rgba(255, 255, 255, 0.9);
    padding: 0.75rem 2rem;
  }

  .dropdown-link:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  .user-dropdown .dropdown-menu {
    position: fixed;
    top: auto;
    bottom: 1rem;
    right: 1rem;
    left: 1rem;
    width: auto;
  }
}

@media (max-width: 480px) {
  .nav-brand .nav-title {
    font-size: 1.25rem;
  }

  .main-content {
    padding: 1rem;
  }
}
</style>
