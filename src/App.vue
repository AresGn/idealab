<template>
  <div id="app">
    <ModernNavbar />
    
    <main class="main-content">
      <router-view />
    </main>

    <footer class="footer">
      <p>&copy; 2025IdéaLab - Plateforme collaborative pour l'Afrique</p>
    </footer>

    <!-- Modal de bienvenue -->
    <WelcomeModal />

    <!-- Système d'alertes -->
    <AlertSystem />
  </div>
</template>

<script>
import { useAuthStore } from './store'
import WelcomeModal from './components/WelcomeModal.vue'
import ModernNavbar from './components/ModernNavbar.vue'
import AlertSystem from './components/AlertSystem.vue'

export default {
  name: 'App',
  components: {
    WelcomeModal,
    ModernNavbar,
    AlertSystem
  },
  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },
  async mounted() {
    // Initialiser l'authentification
    await this.authStore.initializeAuth()
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
  overflow-x: hidden;
  width: 100%;
  max-width: 100vw;
}

body.mobile-menu-open {
  overflow-y: hidden;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
}

/* Styles de base pour l'application */







.btn-secondary {
  background: #e2e8f0;
  color: #4a5568;
  border: 1px solid #cbd5e0;
}

.btn-secondary:hover {
  background: #cbd5e0;
  color: #2d3748;
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
  .main-content {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 0.75rem;
  }
}
</style>
