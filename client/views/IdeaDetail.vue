<template>
  <div class="idea-detail-container">
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
      <router-link to="/" class="btn btn-primary">
        <i class="fas fa-home"></i>
        Retour à l'accueil
      </router-link>
    </div>

    <div v-else-if="idea" class="idea-detail">
      <!-- En-tête de l'idée -->
      <div class="idea-header">
        <div class="breadcrumb">
          <router-link to="/">
            <i class="fas fa-home"></i>
            Accueil
          </router-link>
          <i class="fas fa-chevron-right"></i>
          <span>{{ idea.title }}</span>
        </div>

        <div class="idea-meta">
          <span class="sector">
            <i class="fas fa-tag"></i>
            {{ idea.sector }}
          </span>
          <span class="date">
            <i class="fas fa-calendar-alt"></i>
            {{ formatDate(idea.created_at) }}
          </span>
          <span class="author">
            <i class="fas fa-user"></i>
            {{ idea.first_name }} {{ idea.last_name }}
          </span>
        </div>

        <h1>{{ idea.title }}</h1>

        <div class="idea-stats">
          <div class="stat-item">
            <i class="fas fa-thumbs-up"></i>
            <span>{{ idea.votes_count || 0 }} votes</span>
          </div>
          <div class="stat-item">
            <i class="fas fa-comments"></i>
            <span>{{ idea.comments_count || 0 }} commentaires</span>
          </div>
          <div class="stat-item">
            <i class="fas fa-eye"></i>
            <span>{{ idea.views_count || 0 }} vues</span>
          </div>
        </div>

        <!-- Système de vote amélioré -->
        <VotingButtons
          :idea-id="idea.id"
          @vote-updated="handleVoteUpdate"
        />

        <div class="idea-actions">
          <button class="btn btn-secondary" @click="shareIdea">
            <i class="fas fa-share-alt"></i>
            Partager
          </button>
        </div>
      </div>

      <!-- Contenu de l'idée -->
      <div class="idea-content">
        <div class="main-content">
          <section class="description-section">
            <h2>
              <i class="fas fa-lightbulb"></i>
              Description
            </h2>
            <div class="description-text">
              {{ idea.description }}
            </div>
          </section>

          <section v-if="idea.target_audience" class="audience-section">
            <h3>
              <i class="fas fa-users"></i>
              Public cible
            </h3>
            <p>{{ idea.target_audience }}</p>
          </section>

          <section v-if="idea.estimated_budget" class="budget-section">
            <h3>
              <i class="fas fa-dollar-sign"></i>
              Budget estimé
            </h3>
            <p>{{ formatCurrency(idea.estimated_budget) }}</p>
          </section>

          <section v-if="idea.willingness_to_pay" class="willingness-section">
            <h3>
              <i class="fas fa-credit-card"></i>
              Disposition à payer
            </h3>
            <p>{{ idea.willingness_to_pay }}</p>
          </section>
        </div>

        <div class="sidebar">
          <div class="status-card">
            <h3>Statut de l'idée</h3>
            <span :class="['status-badge', idea.status]">
              {{ getStatusText(idea.status) }}
            </span>
          </div>

          <div class="author-card">
            <h3>Auteur</h3>
            <div class="author-info">
              <div class="author-avatar">
                <i class="fas fa-user-circle"></i>
              </div>
              <div class="author-details">
                <h4>{{ idea.first_name }} {{ idea.last_name }}</h4>
                <p>@{{ idea.username }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Section commentaires -->
      <div class="comments-section">
        <h2>
          <i class="fas fa-comments"></i>
          Commentaires ({{ idea.comments_count || 0 }})
        </h2>
        
        <div class="add-comment">
          <textarea
            v-model="newComment"
            placeholder="Ajoutez votre commentaire..."
            rows="3"
          ></textarea>
          <button class="btn btn-primary" @click="addComment" :disabled="!newComment.trim() || commenting">
            <i v-if="commenting" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-paper-plane"></i>
            {{ commenting ? 'Envoi...' : 'Commenter' }}
          </button>
        </div>

        <div class="comments-list">
          <div class="comment-placeholder">
            <i class="fas fa-comments"></i>
            <p>Les commentaires seront bientôt disponibles</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import VotingButtons from '../components/VotingButtons.vue'

export default {
  name: 'IdeaDetail',
  components: {
    VotingButtons
  },
  data() {
    return {
      idea: null,
      loading: true,
      error: null,
      voting: false,
      commenting: false,
      newComment: ''
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
        this.idea = {
          id: ideaId,
          title: "Application de covoiturage rural",
          description: "Une application mobile innovante qui permet aux habitants des zones rurales de partager des trajets vers les villes. L'application utilise une interface simple et intuitive, adaptée aux utilisateurs ayant des compétences numériques limitées. Elle propose un système de géolocalisation optimisé pour les zones avec une connectivité internet faible, et intègre des options de paiement flexibles incluant le mobile money populaire en Afrique.",
          sector: "Transport",
          target_audience: "Habitants des zones rurales, travailleurs urbains originaires des villages",
          estimated_budget: "50000",
          willingness_to_pay: "Abonnement mensuel de 5000 FCFA",
          status: "approved",
          votes_count: 23,
          comments_count: 5,
          views_count: 156,
          created_at: "2024-01-20T10:00:00Z",
          first_name: "Marie",
          last_name: "Kouamé",
          username: "marie.kouame"
        }
      } catch (error) {
        this.error = "Impossible de charger l'idée"
        console.error('Erreur:', error)
      } finally {
        this.loading = false
      }
    },

    formatDate(date) {
      return new Date(date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },

    formatCurrency(amount) {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XOF'
      }).format(amount)
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

    handleVoteUpdate(voteData) {
      // Gérer les mises à jour de vote si nécessaire
      console.log('Vote mis à jour:', voteData)
      // Optionnel: mettre à jour les statistiques de l'idée
    },

    shareIdea() {
      if (navigator.share) {
        navigator.share({
          title: this.idea.title,
          text: this.idea.description,
          url: window.location.href
        })
      } else {
        // Fallback: copier l'URL
        navigator.clipboard.writeText(window.location.href)
        alert('Lien copié dans le presse-papiers!')
      }
    },

    async addComment() {
      if (!this.newComment.trim()) return
      
      this.commenting = true
      try {
        // Simulation d'API call
        await new Promise(resolve => setTimeout(resolve, 500))
        this.idea.comments_count++
        this.newComment = ''
      } catch (error) {
        console.error('Erreur lors de l\'ajout du commentaire:', error)
      } finally {
        this.commenting = false
      }
    }
  },

  mounted() {
    this.loadIdea()
  }
}
</script>

<style scoped>
.idea-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
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

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #718096;
}

.breadcrumb a {
  color: #667eea;
  text-decoration: none;
}

.idea-header {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.idea-meta {
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #718096;
}

.idea-meta span {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.idea-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 1.5rem;
}

.idea-stats {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4a5568;
  font-weight: 500;
}

.idea-actions {
  display: flex;
  gap: 1rem;
}

.idea-content {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  margin-bottom: 3rem;
}

.main-content {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.main-content section {
  margin-bottom: 2rem;
}

.main-content h2, .main-content h3 {
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.description-text {
  line-height: 1.6;
  color: #4a5568;
  font-size: 1.1rem;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.status-card, .author-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.status-card h3, .author-card h3 {
  color: #2d3748;
  margin-bottom: 1rem;
  font-size: 1rem;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
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

.author-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.author-avatar {
  font-size: 2.5rem;
  color: #667eea;
}

.author-details h4 {
  color: #2d3748;
  margin-bottom: 0.25rem;
}

.author-details p {
  color: #718096;
  font-size: 0.9rem;
}

.comments-section {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.comments-section h2 {
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.add-comment {
  margin-bottom: 2rem;
}

.add-comment textarea {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  resize: vertical;
  margin-bottom: 1rem;
}

.add-comment textarea:focus {
  outline: none;
  border-color: #667eea;
}

.comment-placeholder {
  text-align: center;
  padding: 3rem;
  color: #718096;
}

.comment-placeholder i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
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

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 768px) {
  .idea-detail-container {
    padding: 1rem;
  }
  
  .idea-content {
    grid-template-columns: 1fr;
  }
  
  .idea-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .idea-stats {
    flex-direction: column;
    gap: 1rem;
  }
  
  .idea-actions {
    flex-direction: column;
  }
}
</style>
