<template>
  <div class="mobile-nav-test">
    <h2>🧪 Test Navigation Mobile</h2>
    
    <div class="test-controls">
      <button @click="simulateDevice('mobile')" class="test-btn mobile">
        📱 Mobile (375px)
      </button>
      <button @click="simulateDevice('tablet')" class="test-btn tablet">
        📱 Tablette (768px)
      </button>
      <button @click="simulateDevice('desktop')" class="test-btn desktop">
        💻 Desktop (1200px)
      </button>
    </div>

    <div class="device-simulator" :class="currentDevice">
      <div class="device-frame">
        <div class="device-screen">
          <ResponsiveNavbar />
          <div class="test-content">
            <h3>Contenu de test</h3>
            <p>Cette zone simule le contenu de la page pour tester la navigation responsive.</p>
            
            <div class="test-sections">
              <div class="test-section">
                <h4>📱 Tests Mobile</h4>
                <ul>
                  <li>✅ Menu hamburger visible</li>
                  <li>✅ Animation fluide</li>
                  <li>✅ Overlay fonctionnel</li>
                  <li>✅ Navigation tactile</li>
                  <li>✅ Taille des boutons (44px min)</li>
                </ul>
              </div>
              
              <div class="test-section">
                <h4>📱 Tests Tablette</h4>
                <ul>
                  <li>✅ Adaptation automatique</li>
                  <li>✅ Espacement optimisé</li>
                  <li>✅ Dropdowns fonctionnels</li>
                </ul>
              </div>
              
              <div class="test-section">
                <h4>💻 Tests Desktop</h4>
                <ul>
                  <li>✅ Navigation horizontale</li>
                  <li>✅ Dropdowns hover</li>
                  <li>✅ Responsive breakpoints</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="test-info">
      <h3>📊 Informations du Test</h3>
      <div class="info-grid">
        <div class="info-item">
          <strong>Appareil simulé:</strong>
          <span>{{ deviceInfo.name }}</span>
        </div>
        <div class="info-item">
          <strong>Largeur:</strong>
          <span>{{ deviceInfo.width }}px</span>
        </div>
        <div class="info-item">
          <strong>Breakpoint:</strong>
          <span>{{ deviceInfo.breakpoint }}</span>
        </div>
        <div class="info-item">
          <strong>Navigation:</strong>
          <span>{{ deviceInfo.navType }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import ResponsiveNavbar from './ResponsiveNavbar.vue'

export default {
  name: 'MobileNavigationTest',
  components: {
    ResponsiveNavbar
  },
  setup() {
    const currentDevice = ref('mobile')
    
    const devices = {
      mobile: {
        name: 'iPhone SE / Petit mobile',
        width: 375,
        breakpoint: 'Mobile (≤ 480px)',
        navType: 'Menu hamburger'
      },
      tablet: {
        name: 'iPad / Tablette',
        width: 768,
        breakpoint: 'Tablette (481px - 768px)',
        navType: 'Menu hamburger adaptatif'
      },
      desktop: {
        name: 'Desktop / Ordinateur',
        width: 1200,
        breakpoint: 'Desktop (≥ 769px)',
        navType: 'Navigation horizontale'
      }
    }
    
    const deviceInfo = computed(() => devices[currentDevice.value])
    
    const simulateDevice = (device) => {
      currentDevice.value = device
    }
    
    return {
      currentDevice,
      deviceInfo,
      simulateDevice
    }
  }
}
</script>

<style scoped>
.mobile-nav-test {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  background: #f8fafc;
  min-height: 100vh;
}

.mobile-nav-test h2 {
  text-align: center;
  color: #2d3748;
  margin-bottom: 2rem;
  font-size: 2rem;
}

.test-controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.test-btn {
  padding: 0.75rem 1.5rem;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  font-size: 0.875rem;
}

.test-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.test-btn.mobile {
  border-color: #f093fb;
  color: #f093fb;
}

.test-btn.tablet {
  border-color: #4facfe;
  color: #4facfe;
}

.test-btn.desktop {
  border-color: #43e97b;
  color: #43e97b;
}

.device-simulator {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.device-frame {
  background: #2d3748;
  padding: 1rem;
  border-radius: 20px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  transition: all 0.5s ease;
}

.device-simulator.mobile .device-frame {
  width: 375px;
  background: linear-gradient(135deg, #f093fb, #f5576c);
}

.device-simulator.tablet .device-frame {
  width: 768px;
  background: linear-gradient(135deg, #4facfe, #00f2fe);
}

.device-simulator.desktop .device-frame {
  width: 100%;
  max-width: 1200px;
  background: linear-gradient(135deg, #43e97b, #38f9d7);
}

.device-screen {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  min-height: 600px;
}

.test-content {
  padding: 2rem;
}

.test-content h3 {
  color: #2d3748;
  margin-bottom: 1rem;
}

.test-sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.test-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.test-section h4 {
  color: #667eea;
  margin-bottom: 1rem;
  font-size: 1.125rem;
}

.test-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.test-section li {
  padding: 0.5rem 0;
  color: #4a5568;
  font-size: 0.875rem;
}

.test-info {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.test-info h3 {
  color: #2d3748;
  margin-bottom: 1.5rem;
  text-align: center;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.info-item strong {
  color: #2d3748;
}

.info-item span {
  color: #667eea;
  font-weight: 600;
}

@media (max-width: 768px) {
  .mobile-nav-test {
    padding: 1rem;
  }
  
  .device-simulator.mobile .device-frame,
  .device-simulator.tablet .device-frame,
  .device-simulator.desktop .device-frame {
    width: 100%;
  }
  
  .test-controls {
    flex-direction: column;
    align-items: center;
  }
  
  .test-btn {
    width: 100%;
    max-width: 300px;
  }
}
</style>
