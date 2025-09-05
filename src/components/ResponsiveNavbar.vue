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

    <!-- Overlay pour mobile avec animation -->
    <div
      v-if="showMobileMenu"
      class="mobile-overlay"
      :class="{ show: showMobileMenu }"
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

/* Menu hamburger amélioré */
.mobile-menu-btn {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 44px;
  height: 44px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.3s ease;
  position: relative;
  z-index: 1001;
}

.mobile-menu-btn:hover {
  background: rgba(102, 126, 234, 0.1);
}

.mobile-menu-btn:active {
  background: rgba(102, 126, 234, 0.2);
}

.hamburger-line {
  width: 24px;
  height: 3px;
  background: #4a5568;
  margin: 2px 0;
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  border-radius: 3px;
  transform-origin: center;
}

.hamburger-line.active:nth-child(1) {
  transform: rotate(45deg) translate(0, 7px);
  background: #667eea;
}

.hamburger-line.active:nth-child(2) {
  opacity: 0;
  transform: scale(0);
}

.hamburger-line.active:nth-child(3) {
  transform: rotate(-45deg) translate(0, -7px);
  background: #667eea;
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
  color: #718096;
  margin-left: auto;
}

.dropdown-arrow.rotated {
  transform: rotate(180deg);
  color: #667eea;
}

/* Amélioration de la visibilité des flèches en mobile */
@media (max-width: 768px) {
  .dropdown-arrow {
    font-size: 0.875rem;
    color: #4a5568;
    font-weight: 600;
  }

  .dropdown-arrow.rotated {
    color: #ffffff;
  }
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

/* Mobile overlay amélioré */
.mobile-overlay {
  display: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.mobile-overlay.show {
  opacity: 1;
}

/* Responsive - Tablette */
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
    background: #ffffff;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    padding: 1.5rem;
    gap: 0;
    margin: 0;
    transform: translateX(-100%);
    transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    overflow-y: auto;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    z-index: 1000;
  }

  .nav-menu.mobile-open {
    transform: translateX(0);
  }

  .nav-links {
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    margin-bottom: 1.5rem;
  }

  .nav-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
    margin-top: auto;
    padding-top: 1rem;
    border-top: 1px solid #e2e8f0;
  }

  .nav-link {
    padding: 1rem 1.25rem;
    font-size: 1rem;
    border-bottom: 1px solid #f1f5f9;
    border-radius: 8px;
    margin: 0.25rem 0;
    transition: all 0.3s ease;
    color: #2d3748;
    background: #ffffff;
  }

  .nav-link:hover {
    background: #667eea;
    color: #ffffff;
    transform: translateX(8px);
    border-bottom-color: #667eea;
  }

  .nav-link.router-link-active {
    background: #667eea;
    color: #ffffff;
    border-left: 4px solid #5a67d8;
    border-bottom-color: #667eea;
  }

  .dropdown-content {
    position: static;
    box-shadow: none;
    background: #f8fafc;
    margin-left: 1rem;
    border-radius: 8px;
    margin-top: 0.5rem;
    border: 1px solid #e2e8f0;
  }

  .dropdown-content.show {
    opacity: 1;
    visibility: visible;
    transform: none;
  }

  .dropdown-link {
    color: #4a5568;
    background: #ffffff;
    margin: 0.25rem 0.5rem;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
  }

  .dropdown-link:hover {
    background: #667eea;
    color: #ffffff;
    border-color: #667eea;
  }

  .user-btn {
    justify-content: flex-start;
    padding: 1rem;
    border-bottom: 1px solid #e2e8f0;
    background: #ffffff;
    color: #2d3748;
    border-radius: 8px;
    margin: 0.25rem 0;
  }

  .user-btn:hover {
    background: #667eea;
    color: #ffffff;
  }

  .user-menu {
    position: static;
    box-shadow: none;
    background: #f8fafc;
    margin-left: 1rem;
    border-radius: 8px;
    margin-top: 0.5rem;
    border: 1px solid #e2e8f0;
  }

  .btn {
    justify-content: center;
    padding: 1rem;
    font-size: 1rem;
    margin: 0.25rem 0;
    border-radius: 8px;
  }

  .btn-outline {
    background: #ffffff;
    color: #667eea;
    border: 2px solid #667eea;
  }

  .btn-outline:hover {
    background: #667eea;
    color: #ffffff;
  }

  .btn-primary {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: #ffffff;
    border: none;
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

/* Mobile - Petits téléphones */
@media (max-width: 480px) {
  .nav-container {
    padding: 0 1rem;
    height: 64px;
  }

  .nav-menu {
    top: 64px;
    padding: 1rem;
    background: #ffffff;
  }

  .nav-links {
    margin-bottom: 1rem;
  }

  .nav-link {
    padding: 1.25rem 1rem;
    font-size: 1.1rem;
    font-weight: 600;
    border-radius: 12px;
    margin-bottom: 0.5rem;
    border: 2px solid #e2e8f0;
    background: #ffffff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    display: flex;
    align-items: center;
    gap: 1rem;
    color: #2d3748;
  }

  .nav-link i {
    font-size: 1.2rem;
    width: 24px;
    text-align: center;
  }

  .nav-link:hover {
    background: #667eea;
    color: #ffffff;
    border-color: #667eea;
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  }

  .nav-link.router-link-active {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: #ffffff;
    border-color: #5a67d8;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  }

  .dropdown-content {
    position: static;
    box-shadow: none;
    background: #f8fafc;
    margin: 0.5rem 0 0 1rem;
    border-radius: 8px;
    padding: 0.5rem 0;
    border: 1px solid #e2e8f0;
  }

  .dropdown-link {
    padding: 0.75rem 1rem;
    font-size: 0.95rem;
    border-radius: 6px;
    margin: 0.25rem 0.5rem;
    background: #ffffff;
    color: #4a5568;
    border: 1px solid #e2e8f0;
  }

  .dropdown-link:hover {
    background: #667eea;
    color: #ffffff;
    border-color: #667eea;
  }

  .user-btn {
    justify-content: flex-start;
    padding: 1.25rem 1rem;
    border-radius: 12px;
    background: #ffffff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    margin-bottom: 0.5rem;
    color: #2d3748;
    border: 2px solid #e2e8f0;
  }

  .user-btn:hover {
    background: #667eea;
    color: #ffffff;
    border-color: #667eea;
    transform: translateY(-2px);
  }

  .user-avatar {
    width: 36px;
    height: 36px;
  }

  .user-menu {
    position: static;
    box-shadow: none;
    background: #f8fafc;
    margin: 0.5rem 0 0 1rem;
    border-radius: 8px;
    padding: 0.5rem 0;
    border: 1px solid #e2e8f0;
  }

  .btn {
    justify-content: center;
    padding: 1.25rem 1rem;
    font-size: 1.1rem;
    font-weight: 600;
    border-radius: 12px;
    margin-bottom: 0.5rem;
    min-height: 52px;
  }

  .btn-outline {
    background: white;
    border: 2px solid #667eea;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .btn-primary {
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  }

  .mobile-overlay {
    display: block;
    position: fixed;
    top: 64px;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    z-index: 99;
    backdrop-filter: blur(2px);
  }

  .brand-link {
    font-size: 1.4rem;
    gap: 0.5rem;
  }

  .brand-text {
    font-size: 1.1rem;
    font-weight: 800;
  }

  .mobile-menu-btn {
    width: 48px;
    height: 48px;
    padding: 10px;
  }

  .hamburger-line {
    width: 22px;
    height: 2.5px;
  }
}

/* Animations d'entrée pour le menu mobile */
@keyframes slideInFromLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.nav-menu.mobile-open .nav-link {
  animation: slideInFromLeft 0.4s ease-out;
  animation-fill-mode: both;
}

.nav-menu.mobile-open .nav-link:nth-child(1) { animation-delay: 0.1s; }
.nav-menu.mobile-open .nav-link:nth-child(2) { animation-delay: 0.15s; }
.nav-menu.mobile-open .nav-link:nth-child(3) { animation-delay: 0.2s; }
.nav-menu.mobile-open .nav-link:nth-child(4) { animation-delay: 0.25s; }
.nav-menu.mobile-open .nav-link:nth-child(5) { animation-delay: 0.3s; }

.nav-menu.mobile-open .nav-actions {
  animation: fadeInUp 0.5s ease-out;
  animation-delay: 0.35s;
  animation-fill-mode: both;
}

/* Accessibilité */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
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

/* Amélioration du contraste pour l'accessibilité */
@media (prefers-contrast: high) {
  .nav-link,
  .btn,
  .hamburger-line {
    border: 2px solid #000;
  }

  .nav-link:hover,
  .btn:hover {
    background: #000;
    color: #fff;
  }
}
</style>
