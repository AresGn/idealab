<template>
  <div class="profile-container">
    <div class="profile-header">
      <div class="header-content">
        <div class="profile-avatar">
          <div class="avatar-circle">
            <i class="fas fa-user"></i>
          </div>
          <button class="avatar-edit-btn" @click="showAvatarModal = true">
            <i class="fas fa-camera"></i>
          </button>
        </div>
        <div class="profile-info">
          <h1>{{ user.firstName }} {{ user.lastName }}</h1>
          <p class="username">@{{ user.username }}</p>
          <p class="join-date">
            <i class="fas fa-calendar-alt"></i>
            Membre depuis {{ formatDate(user.createdAt) }}
          </p>
        </div>
        <div class="profile-stats">
          <div class="stat-item">
            <span class="stat-number">{{ userStats.ideasCount }}</span>
            <span class="stat-label">Idées</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ userStats.votesReceived }}</span>
            <span class="stat-label">Votes</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ userStats.rank }}</span>
            <span class="stat-label">Rang</span>
          </div>
        </div>
      </div>
    </div>

    <div class="profile-content">
      <div class="profile-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="['tab-btn', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          <i :class="tab.icon"></i>
          {{ tab.label }}
        </button>
      </div>

      <div class="tab-content">
        <!-- Onglet Informations -->
        <div v-if="activeTab === 'info'" class="tab-panel">
          <div class="info-card">
            <div class="card-header">
              <h3>
                <i class="fas fa-user-edit"></i>
                Informations personnelles
              </h3>
              <button class="btn btn-secondary" @click="editMode = !editMode">
                <i :class="editMode ? 'fas fa-times' : 'fas fa-edit'"></i>
                {{ editMode ? 'Annuler' : 'Modifier' }}
              </button>
            </div>
            
            <form @submit.prevent="updateProfile" class="profile-form">
              <div class="form-row">
                <div class="form-group">
                  <label>Prénom</label>
                  <input 
                    type="text" 
                    v-model="profileForm.firstName" 
                    :readonly="!editMode"
                    :class="{ editable: editMode }"
                  >
                </div>
                <div class="form-group">
                  <label>Nom</label>
                  <input 
                    type="text" 
                    v-model="profileForm.lastName" 
                    :readonly="!editMode"
                    :class="{ editable: editMode }"
                  >
                </div>
              </div>
              
              <div class="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  v-model="profileForm.email" 
                  :readonly="!editMode"
                  :class="{ editable: editMode }"
                >
              </div>
              
              <div class="form-group">
                <label>Nom d'utilisateur</label>
                <input 
                  type="text" 
                  v-model="profileForm.username" 
                  :readonly="!editMode"
                  :class="{ editable: editMode }"
                >
              </div>
              
              <div class="form-group">
                <label>Bio</label>
                <textarea 
                  v-model="profileForm.bio" 
                  :readonly="!editMode"
                  :class="{ editable: editMode }"
                  rows="4"
                  placeholder="Parlez-nous de vous..."
                ></textarea>
              </div>
              
              <div v-if="editMode" class="form-actions">
                <button type="submit" class="btn btn-primary" :disabled="loading">
                  <i v-if="loading" class="fas fa-spinner fa-spin"></i>
                  <i v-else class="fas fa-save"></i>
                  {{ loading ? 'Sauvegarde...' : 'Sauvegarder' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Onglet Mes Idées -->
        <div v-if="activeTab === 'ideas'" class="tab-panel">
          <div class="ideas-grid">
            <div v-for="idea in userIdeas" :key="idea.id" class="idea-card">
              <div class="idea-header">
                <h4>{{ idea.title }}</h4>
                <span :class="['status-badge', idea.status]">
                  {{ getStatusText(idea.status) }}
                </span>
              </div>
              <p class="idea-description">{{ idea.description.substring(0, 150) }}...</p>
              <div class="idea-meta">
                <span class="sector">
                  <i class="fas fa-tag"></i>
                  {{ idea.sector }}
                </span>
                <span class="date">
                  <i class="fas fa-calendar"></i>
                  {{ formatDate(idea.createdAt) }}
                </span>
              </div>
              <div class="idea-stats">
                <span class="stat">
                  <i class="fas fa-thumbs-up"></i>
                  {{ idea.votes }}
                </span>
                <span class="stat">
                  <i class="fas fa-comments"></i>
                  {{ idea.comments }}
                </span>
                <span class="stat">
                  <i class="fas fa-eye"></i>
                  {{ idea.views }}
                </span>
              </div>
              <div class="idea-actions">
                <button class="btn-icon" @click="editIdea(idea.id)">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon" @click="viewIdea(idea.id)">
                  <i class="fas fa-external-link-alt"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Onglet Activité -->
        <div v-if="activeTab === 'activity'" class="tab-panel">
          <div class="activity-timeline">
            <div v-for="activity in userActivity" :key="activity.id" class="activity-item">
              <div class="activity-icon" :class="activity.type">
                <i :class="activity.icon"></i>
              </div>
              <div class="activity-content">
                <p>{{ activity.message }}</p>
                <small>{{ formatDate(activity.date) }}</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Onglet Sécurité -->
        <div v-if="activeTab === 'security'" class="tab-panel">
          <div class="security-card">
            <div class="card-header">
              <h3>
                <i class="fas fa-shield-alt"></i>
                Sécurité du compte
              </h3>
            </div>
            
            <div class="security-section">
              <h4>Changer le mot de passe</h4>
              <form @submit.prevent="changePassword" class="password-form">
                <div class="form-group">
                  <label>Mot de passe actuel</label>
                  <input type="password" v-model="passwordForm.current" required>
                </div>
                <div class="form-group">
                  <label>Nouveau mot de passe</label>
                  <input type="password" v-model="passwordForm.new" required>
                </div>
                <div class="form-group">
                  <label>Confirmer le nouveau mot de passe</label>
                  <input type="password" v-model="passwordForm.confirm" required>
                </div>
                <button type="submit" class="btn btn-primary">
                  <i class="fas fa-key"></i>
                  Changer le mot de passe
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '../store'

export default {
  name: 'Profile',
  data() {
    return {
      activeTab: 'info',
      editMode: false,
      loading: false,
      showAvatarModal: false,
      tabs: [
        { id: 'info', label: 'Informations', icon: 'fas fa-user' },
        { id: 'ideas', label: 'Mes Idées', icon: 'fas fa-lightbulb' },
        { id: 'activity', label: 'Activité', icon: 'fas fa-clock' },
        { id: 'security', label: 'Sécurité', icon: 'fas fa-shield-alt' }
      ],
      user: {
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'john.doe@example.com',
        bio: 'Passionné d\'innovation et de technologie, je cherche toujours de nouvelles façons d\'améliorer la vie quotidienne.',
        createdAt: '2024-01-15T10:00:00Z'
      },
      profileForm: {},
      passwordForm: {
        current: '',
        new: '',
        confirm: ''
      },
      userStats: {
        ideasCount: 5,
        votesReceived: 47,
        rank: 15
      },
      userIdeas: [],
      userActivity: []
    }
  },
  computed: {
    authStore() {
      return useAuthStore()
    }
  },
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },

    getStatusText(status) {
      const statusMap = {
        'pending': 'En attente',
        'approved': 'Approuvée',
        'featured': 'Mise en avant',
        'rejected': 'Rejetée'
      }
      return statusMap[status] || status
    },

    async updateProfile() {
      this.loading = true
      try {
        // Simulation d'API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mettre à jour les données utilisateur
        Object.assign(this.user, this.profileForm)
        this.editMode = false
        
        console.log('Profil mis à jour avec succès')
      } catch (error) {
        console.error('Erreur lors de la mise à jour:', error)
      } finally {
        this.loading = false
      }
    },

    async changePassword() {
      if (this.passwordForm.new !== this.passwordForm.confirm) {
        alert('Les mots de passe ne correspondent pas')
        return
      }
      
      try {
        // Simulation d'API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Reset form
        this.passwordForm = { current: '', new: '', confirm: '' }
        
        console.log('Mot de passe changé avec succès')
      } catch (error) {
        console.error('Erreur lors du changement de mot de passe:', error)
      }
    },

    editIdea(ideaId) {
      this.$router.push(`/edit-idea/${ideaId}`)
    },

    viewIdea(ideaId) {
      this.$router.push(`/idea/${ideaId}`)
    },

    async loadUserData() {
      // Simulation de chargement des données
      this.profileForm = { ...this.user }
      
      // Charger les idées de l'utilisateur
      this.userIdeas = [
        {
          id: 1,
          title: "Application de covoiturage rural",
          description: "Une application mobile qui permet aux habitants des zones rurales de partager des trajets vers les villes...",
          sector: "Transport",
          status: "approved",
          votes: 23,
          comments: 5,
          views: 156,
          createdAt: "2024-01-20T10:00:00Z"
        },
        {
          id: 2,
          title: "Plateforme d'éducation locale",
          description: "Système d'apprentissage numérique qui utilise les langues vernaculaires pour enseigner...",
          sector: "Éducation",
          status: "featured",
          votes: 18,
          comments: 3,
          views: 89,
          createdAt: "2024-01-15T14:30:00Z"
        }
      ]
      
      // Charger l'activité récente
      this.userActivity = [
        {
          id: 1,
          type: 'vote',
          icon: 'fas fa-thumbs-up',
          message: 'Votre idée "Application de covoiturage rural" a reçu 3 nouveaux votes',
          date: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 2,
          type: 'featured',
          icon: 'fas fa-star',
          message: 'Votre idée "Plateforme d\'éducation locale" a été mise en avant',
          date: new Date(Date.now() - 86400000).toISOString()
        }
      ]
    }
  },

  mounted() {
    this.loadUserData()
  }
}
</script>

<style scoped>
.profile-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.profile-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 3rem;
  border-radius: 20px;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.profile-avatar {
  position: relative;
}

.avatar-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  border: 4px solid rgba(255, 255, 255, 0.3);
}

.avatar-edit-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #667eea;
  border: 3px solid white;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-info {
  flex: 1;
}

.profile-info h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.username {
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: 0.5rem;
}

.join-date {
  opacity: 0.8;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.profile-stats {
  display: flex;
  gap: 2rem;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: 700;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.8;
}

.profile-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.profile-tabs {
  display: flex;
  border-bottom: 1px solid #e2e8f0;
}

.tab-btn {
  flex: 1;
  padding: 1.5rem;
  border: none;
  background: none;
  cursor: pointer;
  font-weight: 600;
  color: #718096;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.tab-btn:hover {
  background: #f8fafc;
  color: #667eea;
}

.tab-btn.active {
  color: #667eea;
  border-bottom: 3px solid #667eea;
  background: #f8fafc;
}

.tab-content {
  padding: 2rem;
}

.info-card, .security-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 2rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.card-header h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #2d3748;
  font-size: 1.25rem;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #2d3748;
}

.form-group input,
.form-group textarea {
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  transition: all 0.3s ease;
}

.form-group input:read-only,
.form-group textarea:read-only {
  background: #f7fafc;
  color: #4a5568;
}

.form-group input.editable,
.form-group textarea.editable {
  border-color: #667eea;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-actions {
  display: flex;
  gap: 1rem;
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

.btn:hover {
  transform: translateY(-2px);
}

.ideas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.idea-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
}

.idea-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.idea-header h4 {
  color: #2d3748;
  font-size: 1.1rem;
  font-weight: 600;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.approved {
  background: #c6f6d5;
  color: #22543d;
}

.status-badge.featured {
  background: #e9d8fd;
  color: #553c9a;
}

.status-badge.pending {
  background: #fed7cc;
  color: #c05621;
}

.idea-description {
  color: #718096;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.idea-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: #718096;
}

.idea-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #4a5568;
}

.idea-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 6px;
  background: #e2e8f0;
  color: #4a5568;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  background: #667eea;
  color: white;
}

.activity-timeline {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #667eea;
  color: white;
  flex-shrink: 0;
}

.activity-content p {
  color: #2d3748;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.activity-content small {
  color: #718096;
}

.security-section {
  margin-top: 2rem;
}

.security-section h4 {
  color: #2d3748;
  margin-bottom: 1rem;
}

.password-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 400px;
}

@media (max-width: 768px) {
  .profile-container {
    padding: 1rem;
  }
  
  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }
  
  .profile-stats {
    justify-content: center;
  }
  
  .profile-tabs {
    flex-wrap: wrap;
  }
  
  .tab-btn {
    flex: 1 1 50%;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .ideas-grid {
    grid-template-columns: 1fr;
  }
}
</style>
