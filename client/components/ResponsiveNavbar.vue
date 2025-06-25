<template>
  <nav class="responsive-navbar">
    <div class="nav-container">
      <!-- Logo et titre -->
      <div class="nav-brand">
        <router-link to="/" class="brand-link">
          <i class="fas fa-lightbulb"></i>
          <span class="brand-text">IdéaLab</span>
        </router-link>
      </div>

      <!-- Menu hamburger pour mobile -->
      <button 
        class="mobile-menu-btn"
        @click="toggleMobileMenu"
        :aria-expanded="showMobileMenu"
        aria-label="Menu de navigation"
      >
        <span class="hamburger-line" :class="{ active: showMobileMenu }"></span>
        <span class="hamburger-line" :class="{ active: showMobileMenu }"></span>
        <span class="hamburger-line" :class="{ active: showMobileMenu }"></span>
      </button>

      <!-- Navigation principale -->
      <div class="nav-menu" :class="{ 'mobile-open': showMobileMenu }">
        <!-- Liens de navigation -->
        <div class="nav-links">
          <router-link to="/" class="nav-link" @click="closeMobileMenu">
            <i class="fas fa-home"></i>
            <span>Accueil</span>
          </router-link>

          <!-- Dropdown Idées -->
          <div class="nav-dropdown" ref="ideasDropdown">
            <button 
              class="nav-link dropdown-trigger" 
              @click="toggleDropdown('ideas')"
              :aria-expanded="activeDropdown === 'ideas'"
            >
              <i class="fas fa-lightbulb"></i>
              <span>Idées</span>
              <i class="fas fa-chevron-down dropdown-arrow" :class="{ rotated: activeDropdown === 'ideas' }"></i>
            </button>
            <div class="dropdown-content" :class="{ show: activeDropdown === 'ideas' }">
              <router-link to="/all-ideas" class="dropdown-link" @click="closeAll">
                <i class="fas fa-list"></i>
                <span>Toutes les idées</span>
              </router-link>
              <router-link to="/ideas-in-development" class="dropdown-link" @click="closeAll">
                <i class="fas fa-cogs"></i>
                <span>En développement</span>
              </router-link>
              <router-link to="/submit" class="dropdown-link" @click="closeAll">
                <i class="fas fa-plus-circle"></i>
                <span>Soumettre une idée</span>
              </router-link>
            </div>
          </div>

          <!-- Liens conditionnels selon l'authentification -->
          <template v-if="authStore.isLoggedIn">
            <router-link to="/dashboard" class="nav-link" @click="closeMobileMenu">
              <i class="fas fa-chart-line"></i>
              <span>Tableau de bord</span>
            </router-link>
          </template>
        </div>

        <!-- Actions utilisateur -->
        <div class="nav-actions">
          <template v-if="authStore.isLoggedIn">
            <!-- Dropdown utilisateur -->
            <div class="nav-dropdown user-dropdown" ref="userDropdown">
              <button 
                class="user-btn"
                @click="toggleDropdown('user')"
                :aria-expanded="activeDropdown === 'user'"
              >
                <div class="user-avatar">
                  <img v-if="authStore.user?.avatar" :src="authStore.user.avatar" :alt="authStore.user.name">
                  <i v-else class="fas fa-user-circle"></i>
                </div>
                <span class="user-name hidden-mobile">{{ authStore.user?.first_name }}</span>
                <i class="fas fa-chevron-down dropdown-arrow hidden-mobile" :class="{ rotated: activeDropdown === 'user' }"></i>
              </button>
              <div class="dropdown-content user-menu" :class="{ show: activeDropdown === 'user' }">
                <router-link to="/profile" class="dropdown-link" @click="closeAll">
                  <i class="fas fa-user"></i>
                  <span>Mon profil</span>
                </router-link>
                <router-link to="/settings" class="dropdown-link" @click="closeAll">
                  <i class="fas fa-cog"></i>
                  <span>Paramètres</span>
                </router-link>
                <hr class="dropdown-divider">
                <button class="dropdown-link logout-btn" @click="logout">
                  <i class="fas fa-sign-out-alt"></i>
                  <span>Déconnexion</span>
                </button>
              </div>
            </div>
          </template>

          <template v-else>
            <router-link to="/login" class="btn btn-outline" @click="closeMobileMenu">
              <i class="fas fa-sign-in-alt"></i>
              <span>Connexion</span>
            </router-link>
            <router-link to="/register" class="btn btn-primary" @click="closeMobileMenu">
              <i class="fas fa-user-plus"></i>
              <span>Inscription</span>
            </router-link>
          </template>
        </div>
      </div>
    </div>

    <!-- Overlay pour mobile -->
    <div 
      v-if="showMobileMenu" 
      class="mobile-overlay"
      @click="closeMobileMenu"
    ></div>
  </nav>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/store'

export default {
  name: 'ResponsiveNavbar',
  setup() {
    const authStore = useAuthStore()
    const showMobileMenu = ref(false)
    const activeDropdown = ref(null)

    const toggleMobileMenu = () => {
      showMobileMenu.value = !showMobileMenu.value
      if (showMobileMenu.value) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    }

    const closeMobileMenu = () => {
      showMobileMenu.value = false
      document.body.style.overflow = ''
    }

    const toggleDropdown = (dropdown) => {
      activeDropdown.value = activeDropdown.value === dropdown ? null : dropdown
    }

    const closeDropdowns = () => {
      activeDropdown.value = null
    }

    const closeAll = () => {
      closeMobileMenu()
      closeDropdowns()
    }

    const logout = async () => {
      await authStore.logout()
      closeAll()
    }

    // Fermer les menus en cliquant à l'extérieur
    const handleClickOutside = (event) => {
      if (!event.target.closest('.nav-dropdown')) {
        closeDropdowns()
      }
    }

    // Fermer les menus avec Escape
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        closeAll()
      }
    }

    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    })

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    })

    return {
      authStore,
      showMobileMenu,
      activeDropdown,
      toggleMobileMenu,
      closeMobileMenu,
      toggleDropdown,
      closeDropdowns,
      closeAll,
      logout
    }
  }
}
</script>

<style scoped>
.responsive-navbar {
  background: white;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
}

/* Logo et marque */
.nav-brand {
  flex-shrink: 0;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: #667eea;
  font-size: 1.5rem;
  font-weight: 700;
  transition: color 0.3s ease;
}

.brand-link:hover {
  color: #5a67d8;
}

.brand-text {
  font-size: 1.25rem;
}

/* Menu hamburger */
.mobile-menu-btn {
  display: none;
  flex-direction: column;
  justify-content: center;
  width: 30px;
  height: 30px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.hamburger-line {
  width: 25px;
  height: 3px;
  background: #4a5568;
  margin: 3px 0;
  transition: 0.3s;
  border-radius: 2px;
}

.hamburger-line.active:nth-child(1) {
  transform: rotate(-45deg) translate(-5px, 6px);
}

.hamburger-line.active:nth-child(2) {
  opacity: 0;
}

.hamburger-line.active:nth-child(3) {
  transform: rotate(45deg) translate(-5px, -6px);
}

/* Navigation principale */
.nav-menu {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex: 1;
  justify-content: space-between;
  margin-left: 2rem;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Liens de navigation */
.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: #4a5568;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.3s ease;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
}

.nav-link:hover {
  background: #f7fafc;
  color: #667eea;
}

.nav-link.router-link-active {
  background: #e6fffa;
  color: #319795;
}

/* Dropdowns */
.nav-dropdown {
  position: relative;
}

.dropdown-trigger {
  background: none !important;
}

.dropdown-arrow {
  font-size: 0.75rem;
  transition: transform 0.3s ease;
}

.dropdown-arrow.rotated {
  transform: rotate(180deg);
}

.dropdown-content {
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  padding: 0.5rem 0;
  min-width: 200px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  z-index: 1000;
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
  text-decoration: none;
  color: #4a5568;
  font-weight: 500;
  transition: background 0.3s ease;
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
}

.dropdown-link:hover {
  background: #f7fafc;
  color: #667eea;
}

.dropdown-divider {
  border: none;
  border-top: 1px solid #e2e8f0;
  margin: 0.5rem 0;
}

/* Utilisateur */
.user-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.3s ease;
}

.user-btn:hover {
  background: #f7fafc;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e2e8f0;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-avatar i {
  font-size: 1.5rem;
  color: #a0aec0;
}

.user-name {
  font-weight: 600;
  color: #2d3748;
}

.user-menu {
  right: 0;
  left: auto;
}

/* Boutons */
.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  cursor: pointer;
  font-size: 0.875rem;
}

.btn-outline {
  color: #667eea;
  border-color: #667eea;
  background: transparent;
}

.btn-outline:hover {
  background: #667eea;
  color: white;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

/* Mobile overlay */
.mobile-overlay {
  display: none;
}

/* Responsive */
@media (max-width: 768px) {
  .mobile-menu-btn {
    display: flex;
  }

  .nav-menu {
    position: fixed;
    top: 70px;
    left: 0;
    right: 0;
    bottom: 0;
    background: white;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    padding: 2rem;
    gap: 0;
    margin: 0;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    overflow-y: auto;
  }

  .nav-menu.mobile-open {
    transform: translateX(0);
  }

  .nav-links {
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    margin-bottom: 2rem;
  }

  .nav-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .nav-link {
    padding: 1rem;
    font-size: 1rem;
    border-bottom: 1px solid #e2e8f0;
  }

  .dropdown-content {
    position: static;
    box-shadow: none;
    background: #f7fafc;
    margin-left: 1rem;
    border-radius: 8px;
    margin-top: 0.5rem;
  }

  .dropdown-content.show {
    opacity: 1;
    visibility: visible;
    transform: none;
  }

  .user-btn {
    justify-content: flex-start;
    padding: 1rem;
    border-bottom: 1px solid #e2e8f0;
  }

  .user-menu {
    position: static;
    box-shadow: none;
    background: #f7fafc;
    margin-left: 1rem;
    border-radius: 8px;
    margin-top: 0.5rem;
  }

  .btn {
    justify-content: center;
    padding: 1rem;
    font-size: 1rem;
  }

  .mobile-overlay {
    display: block;
    position: fixed;
    top: 70px;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 99;
  }

  .hidden-mobile {
    display: none;
  }

  .brand-text {
    font-size: 1.125rem;
  }
}

@media (max-width: 480px) {
  .nav-container {
    padding: 0 0.75rem;
    height: 60px;
  }

  .nav-menu {
    top: 60px;
    padding: 1rem;
  }

  .brand-link {
    font-size: 1.25rem;
  }

  .brand-text {
    font-size: 1rem;
  }
}

/* Accessibilité */
@media (prefers-reduced-motion: reduce) {
  * {
    transition-duration: 0.01ms !important;
  }
}

.nav-link:focus,
.btn:focus,
.user-btn:focus,
.mobile-menu-btn:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}
</style>
