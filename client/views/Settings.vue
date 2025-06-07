<template>
  <div class="settings-container">
    <div class="settings-header">
      <div class="header-content">
        <h1>
          <i class="fas fa-cog"></i>
          Paramètres
        </h1>
        <p>Personnalisez votre expérience IdéaLab</p>
      </div>
    </div>

    <div class="settings-content">
      <div class="settings-sidebar">
        <nav class="settings-nav">
          <button 
            v-for="section in sections" 
            :key="section.id"
            :class="['nav-item', { active: activeSection === section.id }]"
            @click="activeSection = section.id"
          >
            <i :class="section.icon"></i>
            {{ section.label }}
          </button>
        </nav>
      </div>

      <div class="settings-main">
        <!-- Section Général -->
        <div v-if="activeSection === 'general'" class="settings-section">
          <div class="section-header">
            <h2>
              <i class="fas fa-user-cog"></i>
              Paramètres généraux
            </h2>
            <p>Configurez vos préférences de base</p>
          </div>

          <div class="settings-card">
            <h3>Langue et région</h3>
            <div class="setting-item">
              <label>Langue de l'interface</label>
              <select v-model="settings.language" class="setting-select">
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div>
            <div class="setting-item">
              <label>Fuseau horaire</label>
              <select v-model="settings.timezone" class="setting-select">
                <option value="Africa/Abidjan">Abidjan (GMT+0)</option>
                <option value="Africa/Dakar">Dakar (GMT+0)</option>
                <option value="Africa/Lagos">Lagos (GMT+1)</option>
                <option value="Africa/Cairo">Le Caire (GMT+2)</option>
              </select>
            </div>
          </div>

          <div class="settings-card">
            <h3>Apparence</h3>
            <div class="setting-item">
              <label>Thème</label>
              <div class="theme-options">
                <label class="theme-option">
                  <input type="radio" v-model="settings.theme" value="light">
                  <div class="theme-preview light">
                    <i class="fas fa-sun"></i>
                    Clair
                  </div>
                </label>
                <label class="theme-option">
                  <input type="radio" v-model="settings.theme" value="dark">
                  <div class="theme-preview dark">
                    <i class="fas fa-moon"></i>
                    Sombre
                  </div>
                </label>
                <label class="theme-option">
                  <input type="radio" v-model="settings.theme" value="auto">
                  <div class="theme-preview auto">
                    <i class="fas fa-adjust"></i>
                    Auto
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Section Notifications -->
        <div v-if="activeSection === 'notifications'" class="settings-section">
          <div class="section-header">
            <h2>
              <i class="fas fa-bell"></i>
              Notifications
            </h2>
            <p>Gérez vos préférences de notification</p>
          </div>

          <div class="settings-card">
            <h3>Notifications par email</h3>
            <div class="setting-item">
              <div class="setting-toggle">
                <label class="toggle-label">
                  <input type="checkbox" v-model="settings.notifications.newVotes">
                  <span class="toggle-slider"></span>
                  Nouveaux votes sur mes idées
                </label>
              </div>
            </div>
            <div class="setting-item">
              <div class="setting-toggle">
                <label class="toggle-label">
                  <input type="checkbox" v-model="settings.notifications.newComments">
                  <span class="toggle-slider"></span>
                  Nouveaux commentaires
                </label>
              </div>
            </div>
            <div class="setting-item">
              <div class="setting-toggle">
                <label class="toggle-label">
                  <input type="checkbox" v-model="settings.notifications.ideaApproved">
                  <span class="toggle-slider"></span>
                  Idée approuvée ou mise en avant
                </label>
              </div>
            </div>
            <div class="setting-item">
              <div class="setting-toggle">
                <label class="toggle-label">
                  <input type="checkbox" v-model="settings.notifications.newsletter">
                  <span class="toggle-slider"></span>
                  Newsletter hebdomadaire
                </label>
              </div>
            </div>
          </div>

          <div class="settings-card">
            <h3>Notifications push</h3>
            <div class="setting-item">
              <div class="setting-toggle">
                <label class="toggle-label">
                  <input type="checkbox" v-model="settings.notifications.pushEnabled">
                  <span class="toggle-slider"></span>
                  Activer les notifications push
                </label>
              </div>
            </div>
            <div class="setting-item">
              <label>Fréquence des notifications</label>
              <select v-model="settings.notifications.frequency" class="setting-select">
                <option value="instant">Instantané</option>
                <option value="daily">Résumé quotidien</option>
                <option value="weekly">Résumé hebdomadaire</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Section Confidentialité -->
        <div v-if="activeSection === 'privacy'" class="settings-section">
          <div class="section-header">
            <h2>
              <i class="fas fa-shield-alt"></i>
              Confidentialité et sécurité
            </h2>
            <p>Contrôlez la visibilité de vos informations</p>
          </div>

          <div class="settings-card">
            <h3>Visibilité du profil</h3>
            <div class="setting-item">
              <div class="setting-toggle">
                <label class="toggle-label">
                  <input type="checkbox" v-model="settings.privacy.publicProfile">
                  <span class="toggle-slider"></span>
                  Profil public
                </label>
              </div>
              <p class="setting-description">
                Permettre aux autres utilisateurs de voir votre profil
              </p>
            </div>
            <div class="setting-item">
              <div class="setting-toggle">
                <label class="toggle-label">
                  <input type="checkbox" v-model="settings.privacy.showEmail">
                  <span class="toggle-slider"></span>
                  Afficher l'email sur le profil
                </label>
              </div>
            </div>
            <div class="setting-item">
              <div class="setting-toggle">
                <label class="toggle-label">
                  <input type="checkbox" v-model="settings.privacy.showStats">
                  <span class="toggle-slider"></span>
                  Afficher les statistiques publiquement
                </label>
              </div>
            </div>
          </div>

          <div class="settings-card">
            <h3>Données et analytiques</h3>
            <div class="setting-item">
              <div class="setting-toggle">
                <label class="toggle-label">
                  <input type="checkbox" v-model="settings.privacy.analytics">
                  <span class="toggle-slider"></span>
                  Autoriser l'analyse des données d'usage
                </label>
              </div>
              <p class="setting-description">
                Nous aide à améliorer la plateforme
              </p>
            </div>
          </div>
        </div>

        <!-- Section Compte -->
        <div v-if="activeSection === 'account'" class="settings-section">
          <div class="section-header">
            <h2>
              <i class="fas fa-user-circle"></i>
              Gestion du compte
            </h2>
            <p>Options avancées de gestion du compte</p>
          </div>

          <div class="settings-card">
            <h3>Exportation des données</h3>
            <div class="setting-item">
              <p class="setting-description">
                Téléchargez une copie de toutes vos données
              </p>
              <button class="btn btn-secondary">
                <i class="fas fa-download"></i>
                Exporter mes données
              </button>
            </div>
          </div>

          <div class="settings-card danger">
            <h3>Zone de danger</h3>
            <div class="setting-item">
              <p class="setting-description">
                Supprimer définitivement votre compte et toutes vos données
              </p>
              <button class="btn btn-danger" @click="showDeleteModal = true">
                <i class="fas fa-trash"></i>
                Supprimer le compte
              </button>
            </div>
          </div>
        </div>

        <div class="settings-actions">
          <button class="btn btn-primary" @click="saveSettings" :disabled="loading">
            <i v-if="loading" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-save"></i>
            {{ loading ? 'Sauvegarde...' : 'Sauvegarder les paramètres' }}
          </button>
          <button class="btn btn-secondary" @click="resetSettings">
            <i class="fas fa-undo"></i>
            Réinitialiser
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de confirmation de suppression -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>
            <i class="fas fa-exclamation-triangle"></i>
            Supprimer le compte
          </h3>
        </div>
        <div class="modal-body">
          <p>Cette action est irréversible. Toutes vos données seront définitivement supprimées.</p>
          <p>Tapez <strong>SUPPRIMER</strong> pour confirmer :</p>
          <input 
            type="text" 
            v-model="deleteConfirmation" 
            placeholder="SUPPRIMER"
            class="confirmation-input"
          >
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showDeleteModal = false">
            Annuler
          </button>
          <button 
            class="btn btn-danger" 
            :disabled="deleteConfirmation !== 'SUPPRIMER'"
            @click="deleteAccount"
          >
            Supprimer définitivement
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Settings',
  data() {
    return {
      activeSection: 'general',
      loading: false,
      showDeleteModal: false,
      deleteConfirmation: '',
      sections: [
        { id: 'general', label: 'Général', icon: 'fas fa-user-cog' },
        { id: 'notifications', label: 'Notifications', icon: 'fas fa-bell' },
        { id: 'privacy', label: 'Confidentialité', icon: 'fas fa-shield-alt' },
        { id: 'account', label: 'Compte', icon: 'fas fa-user-circle' }
      ],
      settings: {
        language: 'fr',
        timezone: 'Africa/Abidjan',
        theme: 'light',
        notifications: {
          newVotes: true,
          newComments: true,
          ideaApproved: true,
          newsletter: false,
          pushEnabled: true,
          frequency: 'instant'
        },
        privacy: {
          publicProfile: true,
          showEmail: false,
          showStats: true,
          analytics: true
        }
      }
    }
  },
  methods: {
    async saveSettings() {
      this.loading = true
      try {
        // Simulation d'API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        console.log('Paramètres sauvegardés:', this.settings)
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error)
      } finally {
        this.loading = false
      }
    },

    resetSettings() {
      // Réinitialiser aux valeurs par défaut
      this.settings = {
        language: 'fr',
        timezone: 'Africa/Abidjan',
        theme: 'light',
        notifications: {
          newVotes: true,
          newComments: true,
          ideaApproved: true,
          newsletter: false,
          pushEnabled: true,
          frequency: 'instant'
        },
        privacy: {
          publicProfile: true,
          showEmail: false,
          showStats: true,
          analytics: true
        }
      }
    },

    async deleteAccount() {
      try {
        // Simulation d'API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Rediriger vers la page d'accueil après suppression
        this.$router.push('/')
        console.log('Compte supprimé')
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
      }
    }
  }
}
</script>

<style scoped>
.settings-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.settings-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 16px;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.header-content h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-content p {
  opacity: 0.9;
  font-size: 1.1rem;
}

.settings-content {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.settings-sidebar {
  background: #f8fafc;
  padding: 2rem 0;
}

.settings-nav {
  display: flex;
  flex-direction: column;
}

.nav-item {
  padding: 1rem 2rem;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  font-weight: 500;
  color: #4a5568;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.nav-item:hover {
  background: #e2e8f0;
  color: #667eea;
}

.nav-item.active {
  background: #667eea;
  color: white;
  border-right: 4px solid #4c51bf;
}

.settings-main {
  padding: 2rem;
}

.section-header {
  margin-bottom: 2rem;
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-header p {
  color: #718096;
}

.settings-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid #e2e8f0;
}

.settings-card.danger {
  border-color: #fed7d7;
  background: #fffaf0;
}

.settings-card h3 {
  color: #2d3748;
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.setting-item {
  margin-bottom: 1.5rem;
}

.setting-item:last-child {
  margin-bottom: 0;
}

.setting-item label {
  display: block;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.setting-select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  font-size: 1rem;
}

.setting-select:focus {
  outline: none;
  border-color: #667eea;
}

.theme-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.theme-option {
  cursor: pointer;
}

.theme-option input {
  display: none;
}

.theme-preview {
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  text-align: center;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.theme-option input:checked + .theme-preview {
  border-color: #667eea;
  background: #f0f4ff;
}

.theme-preview.light {
  background: white;
  color: #2d3748;
}

.theme-preview.dark {
  background: #2d3748;
  color: white;
}

.theme-preview.auto {
  background: linear-gradient(45deg, white 50%, #2d3748 50%);
  color: #667eea;
}

.setting-toggle {
  display: flex;
  align-items: center;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  font-weight: 500;
  color: #2d3748;
}

.toggle-label input {
  display: none;
}

.toggle-slider {
  width: 50px;
  height: 24px;
  background: #e2e8f0;
  border-radius: 12px;
  position: relative;
  transition: all 0.3s ease;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-label input:checked + .toggle-slider {
  background: #667eea;
}

.toggle-label input:checked + .toggle-slider::before {
  transform: translateX(26px);
}

.setting-description {
  color: #718096;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.settings-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e2e8f0;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.btn-secondary {
  background: #e2e8f0;
  color: #4a5568;
}

.btn-danger {
  background: #e53e3e;
  color: white;
}

.btn:hover {
  transform: translateY(-2px);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
}

.modal-header h3 {
  color: #e53e3e;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.modal-body p {
  margin-bottom: 1rem;
  color: #4a5568;
}

.confirmation-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .settings-container {
    padding: 1rem;
  }
  
  .settings-content {
    grid-template-columns: 1fr;
  }
  
  .settings-sidebar {
    order: 2;
    padding: 1rem;
  }
  
  .settings-nav {
    flex-direction: row;
    overflow-x: auto;
  }
  
  .nav-item {
    white-space: nowrap;
    padding: 1rem;
  }
  
  .theme-options {
    grid-template-columns: 1fr;
  }
  
  .settings-actions {
    flex-direction: column;
  }
}
</style>
