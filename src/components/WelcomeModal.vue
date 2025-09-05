<template>
  <div v-if="showModal" class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h2>
          <i class="fas fa-lightbulb"></i>
          Bienvenue sur IdéaLab !
        </h2>
        <button class="close-btn" @click="closeModal" aria-label="Fermer">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="modal-content">
        <div class="welcome-section">
          <div class="feature-highlight">
            <i class="fas fa-rocket"></i>
            <h3>Participez immédiatement !</h3>
            <p>Vous pouvez commencer à utiliser IdéaLab sans créer de compte.</p>
          </div>
        </div>

        <div class="features-grid">
          <div class="feature-card anonymous">
            <div class="feature-icon">
              <i class="fas fa-user-secret"></i>
            </div>
            <h4>Sans compte</h4>
            <ul>
              <li><i class="fas fa-check"></i> Voter sur les idées</li>
              <li><i class="fas fa-check"></i> Commenter avec votre email</li>
              <li><i class="fas fa-check"></i> Parcourir toutes les idées</li>
              <li><i class="fas fa-check"></i> Voir les statistiques</li>
            </ul>
          </div>

          <div class="feature-card registered">
            <div class="feature-icon">
              <i class="fas fa-user-plus"></i>
            </div>
            <h4>Avec un compte</h4>
            <ul>
              <li><i class="fas fa-check"></i> Soumettre vos propres idées</li>
              <li><i class="fas fa-check"></i> Accéder à votre tableau de bord</li>
              <li><i class="fas fa-check"></i> Gérer votre profil</li>
              <li><i class="fas fa-check"></i> Suivre vos contributions</li>
              <li><i class="fas fa-check"></i> Recevoir des notifications</li>
            </ul>
          </div>
        </div>

        <div class="cta-section">
          <p class="cta-text">
            Prêt à explorer les idées innovantes pour l'Afrique ?
          </p>
          <div class="cta-buttons">
            <button class="btn btn-primary" @click="startExploring">
              <i class="fas fa-compass"></i>
              Commencer à explorer
            </button>
            <router-link to="/register" class="btn btn-secondary" @click="closeModal">
              <i class="fas fa-user-plus"></i>
              Créer un compte
            </router-link>
          </div>
        </div>

        <div class="modal-footer">
          <label class="checkbox-container">
            <input 
              type="checkbox" 
              v-model="dontShowAgain"
              @change="updatePreference"
            >
            <span class="checkmark"></span>
            Ne plus afficher ce message
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WelcomeModal',
  data() {
    return {
      showModal: false,
      dontShowAgain: false
    }
  },
  mounted() {
    this.checkShouldShow()
  },
  methods: {
    checkShouldShow() {
      // Vérifier si l'utilisateur a choisi de ne plus voir le modal
      const hideWelcome = localStorage.getItem('hideWelcomeModal')
      const lastShown = localStorage.getItem('welcomeModalLastShown')
      const now = Date.now()
      const oneWeek = 7 * 24 * 60 * 60 * 1000 // 1 semaine en millisecondes

      // Afficher le modal si :
      // 1. L'utilisateur n'a pas choisi de le cacher définitivement
      // 2. ET (c'est la première visite OU plus d'une semaine s'est écoulée)
      if (hideWelcome !== 'true' && (!lastShown || (now - parseInt(lastShown)) > oneWeek)) {
        setTimeout(() => {
          this.showModal = true
        }, 1000) // Délai de 1 seconde pour une meilleure UX
      }
    },

    closeModal() {
      this.showModal = false
      // Enregistrer la date de fermeture
      localStorage.setItem('welcomeModalLastShown', Date.now().toString())
    },

    updatePreference() {
      if (this.dontShowAgain) {
        localStorage.setItem('hideWelcomeModal', 'true')
      } else {
        localStorage.removeItem('hideWelcomeModal')
      }
    },

    startExploring() {
      this.closeModal()
      // Rediriger vers la page d'accueil si on n'y est pas déjà
      if (this.$route.path !== '/') {
        this.$router.push('/')
      }
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.3s ease-out;
  overflow-y: auto;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-container {
  background: white;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e2e8f0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px 16px 0 0;
}

.modal-header h2 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.modal-content {
  padding: 2rem;
}

.welcome-section {
  text-align: center;
  margin-bottom: 2rem;
}

.feature-highlight {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

.feature-highlight i {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  display: block;
}

.feature-highlight h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.3rem;
}

.feature-highlight p {
  margin: 0;
  opacity: 0.9;
}

.features-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.feature-card {
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.feature-card.anonymous {
  border-color: #48bb78;
  background: linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%);
}

.feature-card.registered {
  border-color: #667eea;
  background: linear-gradient(135deg, #ebf8ff 0%, #bee3f8 100%);
}

.feature-icon {
  text-align: center;
  margin-bottom: 1rem;
}

.feature-icon i {
  font-size: 2rem;
  color: #667eea;
}

.feature-card.anonymous .feature-icon i {
  color: #48bb78;
}

.feature-card h4 {
  text-align: center;
  margin: 0 0 1rem 0;
  color: #2d3748;
  font-size: 1.1rem;
  font-weight: 600;
}

.feature-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-card li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #4a5568;
}

.feature-card li i {
  color: #48bb78;
  font-size: 0.8rem;
}

.cta-section {
  text-align: center;
  padding: 1.5rem;
  background: #f7fafc;
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

.cta-text {
  margin: 0 0 1.5rem 0;
  font-size: 1.1rem;
  color: #2d3748;
  font-weight: 500;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  text-decoration: none;
  font-size: 0.95rem;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5a67d8;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #e2e8f0;
  color: #4a5568;
}

.btn-secondary:hover {
  background: #cbd5e0;
  transform: translateY(-1px);
}

.modal-footer {
  border-top: 1px solid #e2e8f0;
  padding-top: 1rem;
}

.checkbox-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: #4a5568;
}

.checkbox-container input[type="checkbox"] {
  display: none;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #cbd5e0;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.checkbox-container input[type="checkbox"]:checked + .checkmark {
  background: #667eea;
  border-color: #667eea;
}

.checkbox-container input[type="checkbox"]:checked + .checkmark::after {
  content: '✓';
  color: white;
  font-size: 12px;
  font-weight: bold;
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 1rem;
    align-items: flex-start;
    padding-top: 2rem;
  }

  .modal-container {
    margin: 0;
    max-height: 90vh;
    width: 100%;
    max-width: 500px;
  }

  .modal-header {
    padding: 1rem 1.5rem;
  }

  .modal-header h2 {
    font-size: 1.3rem;
  }

  .modal-content {
    padding: 1.5rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .feature-card {
    padding: 1rem;
  }

  .cta-buttons {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .btn {
    width: 100%;
    max-width: 280px;
    justify-content: center;
    padding: 1rem 1.5rem;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .modal-overlay {
    padding: 0.75rem;
    padding-top: 1rem;
  }

  .modal-container {
    max-height: 95vh;
  }

  .modal-header {
    padding: 1rem;
  }

  .modal-header h2 {
    font-size: 1.2rem;
  }

  .modal-content {
    padding: 1rem;
  }

  .feature-highlight {
    padding: 1rem;
  }

  .feature-highlight i {
    font-size: 2rem;
  }

  .feature-highlight h3 {
    font-size: 1.1rem;
  }

  .feature-card h4 {
    font-size: 1rem;
  }

  .btn {
    max-width: 100%;
    padding: 0.875rem 1.25rem;
    font-size: 0.95rem;
  }

  .cta-text {
    font-size: 0.95rem;
  }
}
</style>
