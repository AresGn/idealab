<template>
  <div class="navbar-test-debug">
    <h2>🧪 Test Debug Navbar Mobile</h2>
    
    <!-- Simulateur de taille d'écran -->
    <div class="screen-simulator">
      <h3>📱 Simulateur d'écran</h3>
      <div class="simulator-controls">
        <button @click="setScreenSize(375)" class="sim-btn" :class="{ active: currentWidth === 375 }">
          📱 Mobile (375px)
        </button>
        <button @click="setScreenSize(768)" class="sim-btn" :class="{ active: currentWidth === 768 }">
          📱 Tablette (768px)
        </button>
        <button @click="setScreenSize(1200)" class="sim-btn" :class="{ active: currentWidth === 1200 }">
          💻 Desktop (1200px)
        </button>
        <button @click="setScreenSize(window.innerWidth)" class="sim-btn">
          🔄 Taille réelle ({{ window.innerWidth }}px)
        </button>
      </div>
    </div>

    <!-- Navbar de test -->
    <div class="test-navbar-container" :style="{ width: currentWidth + 'px', margin: '0 auto' }">
      <nav class="test-navbar">
        <div class="test-navbar-container">
          <!-- Logo -->
          <div class="test-brand">
            <div class="test-brand-icon">💡</div>
            <span class="test-brand-text">IdéaLab</span>
          </div>

          <!-- Navigation desktop -->
          <div class="test-desktop-nav">
            <a href="#" class="test-nav-item">🏠 Accueil</a>
            
            <!-- Dropdown Idées -->
            <div class="test-dropdown" @click="toggleIdeasDropdown">
              <button class="test-nav-item test-dropdown-trigger" :class="{ active: ideasOpen }">
                💡 Idées <span class="test-arrow">{{ ideasOpen ? '▲' : '▼' }}</span>
              </button>
              <div class="test-dropdown-menu" :class="{ show: ideasOpen }">
                <a href="#" class="test-dropdown-item">📋 Toutes les idées</a>
                <a href="#" class="test-dropdown-item">⚙️ En développement</a>
                <a href="#" class="test-dropdown-item">➕ Soumettre</a>
              </div>
            </div>
            
            <a href="#" class="test-nav-item">📊 Dashboard</a>
          </div>

          <!-- Bouton hamburger -->
          <button class="test-mobile-btn" @click="toggleMobileMenu" :class="{ active: mobileOpen }">
            <span class="test-hamburger-line"></span>
            <span class="test-hamburger-line"></span>
            <span class="test-hamburger-line"></span>
          </button>
        </div>

        <!-- Menu mobile -->
        <div class="test-mobile-menu" :class="{ open: mobileOpen }">
          <div class="test-mobile-content">
            <a href="#" class="test-mobile-item" @click="closeMobileMenu">🏠 Accueil</a>
            <a href="#" class="test-mobile-item" @click="closeMobileMenu">💡 Toutes les idées</a>
            <a href="#" class="test-mobile-item" @click="closeMobileMenu">⚙️ En développement</a>
            <a href="#" class="test-mobile-item" @click="closeMobileMenu">➕ Soumettre</a>
            <a href="#" class="test-mobile-item" @click="closeMobileMenu">📊 Dashboard</a>
            <a href="#" class="test-mobile-item" @click="closeMobileMenu">👤 Connexion</a>
          </div>
        </div>

        <!-- Overlay -->
        <div v-if="mobileOpen" class="test-overlay" @click="closeMobileMenu"></div>
      </nav>
    </div>

    <!-- Informations de debug -->
    <div class="debug-panel">
      <h3>🔍 Informations de Debug</h3>
      <div class="debug-grid">
        <div class="debug-item">
          <strong>Largeur simulée:</strong>
          <span>{{ currentWidth }}px</span>
        </div>
        <div class="debug-item">
          <strong>Largeur réelle:</strong>
          <span>{{ window.innerWidth }}px</span>
        </div>
        <div class="debug-item">
          <strong>Menu mobile:</strong>
          <span :class="{ success: mobileOpen, error: !mobileOpen }">
            {{ mobileOpen ? 'Ouvert' : 'Fermé' }}
          </span>
        </div>
        <div class="debug-item">
          <strong>Dropdown idées:</strong>
          <span :class="{ success: ideasOpen, error: !ideasOpen }">
            {{ ideasOpen ? 'Ouvert' : 'Fermé' }}
          </span>
        </div>
        <div class="debug-item">
          <strong>Breakpoint:</strong>
          <span>{{ currentBreakpoint }}</span>
        </div>
        <div class="debug-item">
          <strong>Bouton hamburger visible:</strong>
          <span :class="{ success: shouldShowMobileBtn, error: !shouldShowMobileBtn }">
            {{ shouldShowMobileBtn ? 'Oui' : 'Non' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Tests automatiques -->
    <div class="auto-tests">
      <h3>🧪 Tests Automatiques</h3>
      <div class="test-buttons">
        <button @click="runMobileTest" class="test-btn">📱 Test Mobile</button>
        <button @click="runDropdownTest" class="test-btn">💡 Test Dropdown</button>
        <button @click="runResponsiveTest" class="test-btn">📐 Test Responsive</button>
        <button @click="runAllTests" class="test-btn primary">🚀 Tous les Tests</button>
      </div>
      
      <div v-if="testResults.length > 0" class="test-results">
        <h4>📊 Résultats des Tests</h4>
        <div v-for="(result, index) in testResults" :key="index" class="test-result" :class="result.status">
          <span class="test-icon">{{ result.status === 'success' ? '✅' : '❌' }}</span>
          <span class="test-name">{{ result.name }}</span>
          <span class="test-message">{{ result.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'

export default {
  name: 'NavbarTestDebug',
  setup() {
    const currentWidth = ref(window.innerWidth)
    const mobileOpen = ref(false)
    const ideasOpen = ref(false)
    const testResults = ref([])

    const currentBreakpoint = computed(() => {
      if (currentWidth.value <= 480) return 'Mobile (≤480px)'
      if (currentWidth.value <= 768) return 'Tablette (≤768px)'
      return 'Desktop (≥769px)'
    })

    const shouldShowMobileBtn = computed(() => {
      return currentWidth.value <= 768
    })

    const setScreenSize = (width) => {
      currentWidth.value = width
    }

    const toggleMobileMenu = () => {
      console.log('🔄 Toggle mobile menu:', !mobileOpen.value)
      mobileOpen.value = !mobileOpen.value
      if (mobileOpen.value) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    }

    const closeMobileMenu = () => {
      console.log('❌ Close mobile menu')
      mobileOpen.value = false
      document.body.style.overflow = ''
    }

    const toggleIdeasDropdown = () => {
      console.log('🔄 Toggle ideas dropdown:', !ideasOpen.value)
      ideasOpen.value = !ideasOpen.value
    }

    const addTestResult = (name, status, message) => {
      testResults.value.push({ name, status, message })
    }

    const clearTestResults = () => {
      testResults.value = []
    }

    const runMobileTest = () => {
      clearTestResults()
      
      // Test 1: Bouton hamburger visible sur mobile
      setScreenSize(375)
      setTimeout(() => {
        const isVisible = shouldShowMobileBtn.value
        addTestResult(
          'Bouton hamburger mobile',
          isVisible ? 'success' : 'error',
          isVisible ? 'Visible sur mobile ✓' : 'Non visible sur mobile ✗'
        )
        
        // Test 2: Menu mobile fonctionne
        toggleMobileMenu()
        setTimeout(() => {
          const isOpen = mobileOpen.value
          addTestResult(
            'Ouverture menu mobile',
            isOpen ? 'success' : 'error',
            isOpen ? 'Menu s\'ouvre correctement ✓' : 'Menu ne s\'ouvre pas ✗'
          )
          
          // Test 3: Fermeture menu mobile
          closeMobileMenu()
          setTimeout(() => {
            const isClosed = !mobileOpen.value
            addTestResult(
              'Fermeture menu mobile',
              isClosed ? 'success' : 'error',
              isClosed ? 'Menu se ferme correctement ✓' : 'Menu ne se ferme pas ✗'
            )
          }, 100)
        }, 100)
      }, 100)
    }

    const runDropdownTest = () => {
      clearTestResults()
      
      // Test dropdown sur desktop
      setScreenSize(1200)
      setTimeout(() => {
        toggleIdeasDropdown()
        setTimeout(() => {
          const isOpen = ideasOpen.value
          addTestResult(
            'Dropdown idées desktop',
            isOpen ? 'success' : 'error',
            isOpen ? 'Dropdown s\'ouvre sur desktop ✓' : 'Dropdown ne s\'ouvre pas ✗'
          )
          
          // Fermer le dropdown
          toggleIdeasDropdown()
        }, 100)
      }, 100)
    }

    const runResponsiveTest = () => {
      clearTestResults()
      
      const sizes = [
        { width: 320, name: 'Très petit mobile' },
        { width: 375, name: 'Mobile standard' },
        { width: 768, name: 'Tablette' },
        { width: 1024, name: 'Desktop' },
        { width: 1200, name: 'Large desktop' }
      ]
      
      sizes.forEach((size, index) => {
        setTimeout(() => {
          setScreenSize(size.width)
          setTimeout(() => {
            const shouldShow = size.width <= 768
            const actualShow = shouldShowMobileBtn.value
            addTestResult(
              `Responsive ${size.name}`,
              shouldShow === actualShow ? 'success' : 'error',
              `${size.width}px: Hamburger ${actualShow ? 'visible' : 'caché'} ${shouldShow === actualShow ? '✓' : '✗'}`
            )
          }, 50)
        }, index * 200)
      })
    }

    const runAllTests = () => {
      clearTestResults()
      runMobileTest()
      setTimeout(() => runDropdownTest(), 1000)
      setTimeout(() => runResponsiveTest(), 2000)
    }

    const handleResize = () => {
      currentWidth.value = window.innerWidth
    }

    onMounted(() => {
      window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
      document.body.style.overflow = ''
    })

    return {
      currentWidth,
      mobileOpen,
      ideasOpen,
      testResults,
      currentBreakpoint,
      shouldShowMobileBtn,
      setScreenSize,
      toggleMobileMenu,
      closeMobileMenu,
      toggleIdeasDropdown,
      runMobileTest,
      runDropdownTest,
      runResponsiveTest,
      runAllTests,
      window
    }
  }
}
</script>

<style scoped>
.navbar-test-debug {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.screen-simulator {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  border: 2px solid #e9ecef;
}

.simulator-controls {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.sim-btn {
  padding: 0.75rem 1rem;
  border: 2px solid #667eea;
  background: white;
  color: #667eea;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.sim-btn:hover,
.sim-btn.active {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
}

/* Navbar de test */
.test-navbar-container {
  border: 2px solid #667eea;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 2rem;
  position: relative;
}

.test-navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
}

.test-navbar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  height: 70px;
}

.test-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: white;
  font-weight: 700;
  font-size: 1.5rem;
}

.test-brand-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.test-desktop-nav {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  justify-content: center;
}

.test-nav-item {
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
}

.test-nav-item:hover {
  color: white;
  background: rgba(255, 255, 255, 0.15);
}

.test-dropdown {
  position: relative;
}

.test-dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 220px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  z-index: 1000;
}

.test-dropdown-menu.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.test-dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: #2d3748;
  text-decoration: none;
  transition: all 0.3s ease;
}

.test-dropdown-item:hover {
  background: #f8fafc;
  color: #667eea;
}

.test-mobile-btn {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  cursor: pointer;
  padding: 0;
  gap: 4px;
  transition: all 0.3s ease;
}

.test-mobile-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.test-hamburger-line {
  width: 24px;
  height: 2px;
  background: white;
  transition: all 0.3s ease;
  transform-origin: center;
}

.test-mobile-btn.active .test-hamburger-line:nth-child(1) {
  transform: rotate(45deg) translate(6px, 6px);
}

.test-mobile-btn.active .test-hamburger-line:nth-child(2) {
  opacity: 0;
}

.test-mobile-btn.active .test-hamburger-line:nth-child(3) {
  transform: rotate(-45deg) translate(6px, -6px);
}

.test-mobile-menu {
  position: fixed;
  top: 70px;
  right: 0;
  width: 320px;
  height: calc(100vh - 70px);
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  transform: translateX(100%);
  transition: transform 0.3s ease;
  overflow-y: auto;
  z-index: 9999;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.3);
}

.test-mobile-menu.open {
  transform: translateX(0);
}

.test-mobile-content {
  padding: 1rem;
}

.test-mobile-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  transition: all 0.3s ease;
}

.test-mobile-item:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
}

.test-overlay {
  position: fixed;
  top: 70px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9998;
}

/* Responsive pour le test */
@media (max-width: 768px) {
  .test-desktop-nav {
    display: none;
  }
  
  .test-mobile-btn {
    display: flex !important;
  }
  
  .test-brand-text {
    display: none;
  }
}

@media (max-width: 480px) {
  .test-mobile-menu {
    width: 100%;
  }
}

/* Debug panel */
.debug-panel {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  border: 2px solid #e9ecef;
}

.debug-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.debug-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.debug-item strong {
  color: #495057;
}

.debug-item .success {
  color: #28a745;
  font-weight: 600;
}

.debug-item .error {
  color: #dc3545;
  font-weight: 600;
}

/* Tests automatiques */
.auto-tests {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
  border: 2px solid #e9ecef;
}

.test-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.test-btn {
  padding: 0.75rem 1rem;
  border: 2px solid #28a745;
  background: white;
  color: #28a745;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.test-btn:hover,
.test-btn.primary {
  background: #28a745;
  color: white;
  transform: translateY(-2px);
}

.test-results {
  margin-top: 1.5rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.test-result {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  border-radius: 6px;
}

.test-result.success {
  background: rgba(40, 167, 69, 0.1);
  border: 1px solid rgba(40, 167, 69, 0.3);
}

.test-result.error {
  background: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.3);
}

.test-icon {
  font-size: 1.2rem;
}

.test-name {
  font-weight: 600;
  min-width: 150px;
}

.test-message {
  color: #6c757d;
}

h2, h3, h4 {
  color: #495057;
  margin-bottom: 1rem;
}

h2 {
  font-size: 1.8rem;
  text-align: center;
  margin-bottom: 2rem;
}
</style>
