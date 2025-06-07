<template>
  <div class="edit-idea-container">
    <div class="edit-header">
      <div class="breadcrumb">
        <router-link to="/dashboard">
          <i class="fas fa-chart-line"></i>
          Dashboard
        </router-link>
        <i class="fas fa-chevron-right"></i>
        <span>Modifier l'idée</span>
      </div>
      
      <h1>
        <i class="fas fa-edit"></i>
        Modifier votre idée
      </h1>
      <p>Améliorez et peaufinez votre proposition</p>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
      </div>
      <p>Chargement de l'idée...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <div class="error-icon">
        <i class="fas fa-exclamation-triangle"></i>
      </div>
      <h2>Erreur</h2>
      <p>{{ error }}</p>
      <router-link to="/dashboard" class="btn btn-primary">
        <i class="fas fa-arrow-left"></i>
        Retour au dashboard
      </router-link>
    </div>

    <form v-else @submit.prevent="updateIdea" class="edit-form">
      <div class="form-section">
        <h2>
          <i class="fas fa-lightbulb"></i>
          Informations principales
        </h2>
        
        <div class="form-group">
          <label for="title">Titre de l'idée *</label>
          <input
            type="text"
            id="title"
            v-model="form.title"
            :class="{ 'error': errors.title }"
            placeholder="Un titre accrocheur pour votre idée"
            required
          >
          <span v-if="errors.title" class="error-message">{{ errors.title }}</span>
        </div>

        <div class="form-group">
          <label for="sector">Secteur d'activité *</label>
          <select
            id="sector"
            v-model="form.sector"
            :class="{ 'error': errors.sector }"
            required
          >
            <option value="">Sélectionnez un secteur</option>
            <option value="Agriculture">Agriculture</option>
            <option value="Éducation">Éducation</option>
            <option value="Santé">Santé</option>
            <option value="Transport">Transport</option>
            <option value="Finance">Finance</option>
            <option value="Énergie">Énergie</option>
            <option value="Commerce">Commerce</option>
            <option value="Technologie">Technologie</option>
            <option value="Environnement">Environnement</option>
            <option value="Autre">Autre</option>
          </select>
          <span v-if="errors.sector" class="error-message">{{ errors.sector }}</span>
        </div>

        <div class="form-group">
          <label for="description">Description détaillée *</label>
          <textarea
            id="description"
            v-model="form.description"
            :class="{ 'error': errors.description }"
            rows="6"
            placeholder="Décrivez votre idée en détail : le problème qu'elle résout, comment elle fonctionne, ses avantages..."
            required
          ></textarea>
          <div class="character-count">
            {{ form.description.length }}/2000 caractères
          </div>
          <span v-if="errors.description" class="error-message">{{ errors.description }}</span>
        </div>
      </div>

      <div class="form-section">
        <h2>
          <i class="fas fa-users"></i>
          Marché et audience
        </h2>
        
        <div class="form-group">
          <label for="targetAudience">Public cible</label>
          <textarea
            id="targetAudience"
            v-model="form.targetAudience"
            rows="3"
            placeholder="Qui sont vos utilisateurs potentiels ? (ex: agriculteurs, étudiants, PME...)"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="estimatedBudget">Budget estimé (FCFA)</label>
          <input
            type="number"
            id="estimatedBudget"
            v-model="form.estimatedBudget"
            placeholder="Budget nécessaire pour développer l'idée"
            min="0"
          >
        </div>

        <div class="form-group">
          <label for="willingnessToPayy">Disposition à payer</label>
          <textarea
            id="willingnessToPayy"
            v-model="form.willingness_to_pay"
            rows="2"
            placeholder="Comment les utilisateurs seraient-ils prêts à payer ? (abonnement, achat unique, freemium...)"
          ></textarea>
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary" :disabled="saving">
          <i v-if="saving" class="fas fa-spinner fa-spin"></i>
          <i v-else class="fas fa-save"></i>
          {{ saving ? 'Sauvegarde...' : 'Sauvegarder les modifications' }}
        </button>
        
        <router-link to="/dashboard" class="btn btn-secondary">
          <i class="fas fa-times"></i>
          Annuler
        </router-link>
        
        <button type="button" class="btn btn-danger" @click="showDeleteModal = true">
          <i class="fas fa-trash"></i>
          Supprimer l'idée
        </button>
      </div>

      <div v-if="errors.general" class="error-banner">
        <i class="fas fa-exclamation-triangle"></i>
        {{ errors.general }}
      </div>
    </form>

    <!-- Modal de confirmation de suppression -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>
            <i class="fas fa-exclamation-triangle"></i>
            Supprimer l'idée
          </h3>
        </div>
        <div class="modal-body">
          <p>Êtes-vous sûr de vouloir supprimer cette idée ? Cette action est irréversible.</p>
          <p><strong>{{ form.title }}</strong></p>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showDeleteModal = false">
            Annuler
          </button>
          <button class="btn btn-danger" @click="deleteIdea" :disabled="deleting">
            <i v-if="deleting" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-trash"></i>
            {{ deleting ? 'Suppression...' : 'Supprimer définitivement' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EditIdea',
  data() {
    return {
      loading: true,
      saving: false,
      deleting: false,
      error: null,
      showDeleteModal: false,
      form: {
        title: '',
        sector: '',
        description: '',
        targetAudience: '',
        estimatedBudget: '',
        willingness_to_pay: ''
      },
      errors: {}
    }
  },
  methods: {
    async loadIdea() {
      try {
        this.loading = true
        const ideaId = this.$route.params.id
        
        // Simulation d'API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Données simulées
        this.form = {
          title: "Application de covoiturage rural",
          sector: "Transport",
          description: "Une application mobile innovante qui permet aux habitants des zones rurales de partager des trajets vers les villes. L'application utilise une interface simple et intuitive, adaptée aux utilisateurs ayant des compétences numériques limitées.",
          targetAudience: "Habitants des zones rurales, travailleurs urbains originaires des villages",
          estimatedBudget: "50000",
          willingness_to_pay: "Abonnement mensuel de 5000 FCFA"
        }
      } catch (error) {
        this.error = "Impossible de charger l'idée"
        console.error('Erreur:', error)
      } finally {
        this.loading = false
      }
    },

    validateForm() {
      this.errors = {}
      
      if (!this.form.title.trim()) {
        this.errors.title = 'Le titre est requis'
      } else if (this.form.title.length < 10) {
        this.errors.title = 'Le titre doit contenir au moins 10 caractères'
      }
      
      if (!this.form.sector) {
        this.errors.sector = 'Le secteur est requis'
      }
      
      if (!this.form.description.trim()) {
        this.errors.description = 'La description est requise'
      } else if (this.form.description.length < 50) {
        this.errors.description = 'La description doit contenir au moins 50 caractères'
      } else if (this.form.description.length > 2000) {
        this.errors.description = 'La description ne peut pas dépasser 2000 caractères'
      }
      
      return Object.keys(this.errors).length === 0
    },

    async updateIdea() {
      if (!this.validateForm()) return
      
      this.saving = true
      this.errors = {}
      
      try {
        // Simulation d'API call
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Rediriger vers le dashboard avec un message de succès
        this.$router.push({
          path: '/dashboard',
          query: { message: 'Idée mise à jour avec succès' }
        })
      } catch (error) {
        this.errors.general = 'Erreur lors de la sauvegarde. Veuillez réessayer.'
        console.error('Erreur:', error)
      } finally {
        this.saving = false
      }
    },

    async deleteIdea() {
      this.deleting = true
      
      try {
        // Simulation d'API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Rediriger vers le dashboard avec un message
        this.$router.push({
          path: '/dashboard',
          query: { message: 'Idée supprimée avec succès' }
        })
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
        this.showDeleteModal = false
      } finally {
        this.deleting = false
      }
    }
  },

  mounted() {
    this.loadIdea()
  }
}
</script>

<style scoped>
.edit-idea-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.edit-header {
  text-align: center;
  margin-bottom: 3rem;
}

.breadcrumb {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #718096;
}

.breadcrumb a {
  color: #667eea;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.edit-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.edit-header p {
  color: #718096;
  font-size: 1.1rem;
}

.loading-state, .error-state {
  text-align: center;
  padding: 4rem 2rem;
}

.loading-spinner, .error-icon {
  font-size: 3rem;
  color: #667eea;
  margin-bottom: 1rem;
}

.error-state h2 {
  color: #e53e3e;
  margin-bottom: 1rem;
}

.edit-form {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.form-section {
  margin-bottom: 3rem;
}

.form-section h2 {
  color: #2d3748;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e2e8f0;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input.error,
.form-group select.error,
.form-group textarea.error {
  border-color: #e53e3e;
}

.character-count {
  text-align: right;
  font-size: 0.875rem;
  color: #718096;
  margin-top: 0.25rem;
}

.error-message {
  color: #e53e3e;
  font-size: 0.875rem;
  font-weight: 500;
  margin-top: 0.25rem;
  display: block;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e2e8f0;
}

.btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
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

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.error-banner {
  background: #fed7d7;
  color: #c53030;
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  margin-top: 1rem;
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

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .edit-idea-container {
    padding: 1rem;
  }
  
  .edit-header h1 {
    font-size: 2rem;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>
