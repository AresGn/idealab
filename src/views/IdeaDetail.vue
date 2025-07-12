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
            <div class="description-text" v-html="formatDescription(idea.description)">
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
            <p>{{ formatWillingnessToPay(idea.willingness_to_pay) }}</p>
          </section>

          <!-- Section Design Thinking -->
          <section v-if="idea.design_thinking_mode" class="design-thinking-section">
            <h2>
              <i class="fas fa-brain"></i>
              Processus Design Thinking
            </h2>

            <div class="design-thinking-progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: idea.completion_percentage + '%' }"></div>
              </div>
              <span class="progress-text">{{ idea.completion_percentage }}% complété</span>
            </div>

            <!-- Phase EMPATHIZE -->
            <div class="dt-phase empathize">
              <h3>
                <i class="fas fa-heart"></i>
                1. EMPATHIZE - Comprendre les utilisateurs
              </h3>

              <div v-if="idea.empathy_target_users" class="dt-field">
                <h4>👥 Utilisateurs cibles</h4>
                <div v-html="formatDescription(idea.empathy_target_users)"></div>
              </div>

              <div v-if="idea.empathy_needs_frustrations" class="dt-field">
                <h4>😤 Besoins et frustrations</h4>
                <div v-html="formatDescription(idea.empathy_needs_frustrations)"></div>
              </div>

              <div v-if="idea.empathy_usage_context" class="dt-field">
                <h4>🎯 Contexte d'utilisation</h4>
                <div v-html="formatDescription(idea.empathy_usage_context)"></div>
              </div>
            </div>

            <!-- Phase DEFINE -->
            <div class="dt-phase define">
              <h3>
                <i class="fas fa-bullseye"></i>
                2. DEFINE - Définir le problème
              </h3>

              <div v-if="idea.define_problem_statement" class="dt-field">
                <h4>❗ Énoncé du problème</h4>
                <div v-html="formatDescription(idea.define_problem_statement)"></div>
              </div>

              <div v-if="idea.define_importance_reason" class="dt-field">
                <h4>🔥 Pourquoi c'est important</h4>
                <div v-html="formatDescription(idea.define_importance_reason)"></div>
              </div>

              <div v-if="idea.define_objective" class="dt-field">
                <h4>🎯 Objectif</h4>
                <div v-html="formatDescription(idea.define_objective)"></div>
              </div>
            </div>

            <!-- Phase IDEATE -->
            <div class="dt-phase ideate">
              <h3>
                <i class="fas fa-lightbulb"></i>
                3. IDEATE - Générer des solutions
              </h3>

              <div v-if="idea.ideate_proposed_solution" class="dt-field">
                <h4>💡 Solution proposée</h4>
                <div v-html="formatDescription(idea.ideate_proposed_solution)"></div>
              </div>

              <div v-if="idea.ideate_alternatives_considered" class="dt-field">
                <h4>🔄 Alternatives considérées</h4>
                <div v-html="formatDescription(idea.ideate_alternatives_considered)"></div>
              </div>

              <div v-if="idea.ideate_inspiration_references" class="dt-field">
                <h4>🌟 Sources d'inspiration</h4>
                <div v-html="formatDescription(idea.ideate_inspiration_references)"></div>
              </div>
            </div>
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
import { useIdeasStore } from '@/store'

export default {
  name: 'IdeaDetail',
  components: {
    VotingButtons
  },
  setup() {
    const ideasStore = useIdeasStore()
    return { ideasStore }
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
        this.error = null
        const ideaId = this.$route.params.id

        // Charger l'idée depuis l'API
        const result = await this.ideasStore.fetchIdea(ideaId)

        if (result.success) {
          this.idea = this.ideasStore.currentIdea
        } else {
          this.error = result.error || "Impossible de charger l'idée"
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

    formatWillingnessToPay(willingness) {
      const willingnessMap = {
        'low': 'Faible',
        'medium': 'Moyenne',
        'high': 'Élevée',
        'unknown': 'Non définie'
      }
      return willingnessMap[willingness] || willingness
    },

    formatDescription(text) {
      if (!text) return ''

      // Convertir le Markdown basique en HTML
      return text
        // Titres
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        // Gras
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italique
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Listes à puces
        .replace(/^\- (.*$)/gim, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
        // Liens
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
        // Sauts de ligne
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        // Envelopper dans des paragraphes
        .replace(/^(.*)$/gim, '<p>$1</p>')
        // Nettoyer les paragraphes vides
        .replace(/<p><\/p>/g, '')
        .replace(/<p><br><\/p>/g, '')
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

.description-text h1,
.description-text h2,
.description-text h3 {
  color: #2d3748;
  margin: 1.5rem 0 1rem 0;
  font-weight: 600;
}

.description-text h1 {
  font-size: 1.8rem;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 0.5rem;
}

.description-text h2 {
  font-size: 1.5rem;
  color: #667eea;
}

.description-text h3 {
  font-size: 1.3rem;
  color: #4a5568;
}

.description-text ul {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.description-text li {
  margin: 0.5rem 0;
  line-height: 1.6;
}

.description-text strong {
  color: #2d3748;
  font-weight: 600;
}

.description-text em {
  color: #667eea;
  font-style: italic;
}

.description-text a {
  color: #667eea;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.3s;
}

.description-text a:hover {
  border-bottom-color: #667eea;
}

.description-text p {
  margin: 1rem 0;
  line-height: 1.8;
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

/* Design Thinking Section Styles */
.design-thinking-section {
  margin-top: 3rem;
  padding: 2rem;
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
  border-radius: 16px;
  border: 2px solid #e2e8f0;
}

.design-thinking-section h2 {
  color: #2d3748;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.design-thinking-section h2 i {
  color: #667eea;
  font-size: 1.5rem;
}

.design-thinking-progress {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.progress-bar {
  flex: 1;
  height: 12px;
  background: #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 6px;
  transition: width 0.3s ease;
}

.progress-text {
  font-weight: 600;
  color: #4a5568;
  min-width: 80px;
  text-align: right;
}

.dt-phase {
  margin-bottom: 2.5rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  border-left: 4px solid transparent;
}

.dt-phase.empathize {
  border-left-color: #e53e3e;
}

.dt-phase.define {
  border-left-color: #dd6b20;
}

.dt-phase.ideate {
  border-left-color: #38a169;
}

.dt-phase h3 {
  color: #2d3748;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
}

.dt-phase h3 i {
  font-size: 1.25rem;
}

.empathize h3 i {
  color: #e53e3e;
}

.define h3 i {
  color: #dd6b20;
}

.ideate h3 i {
  color: #38a169;
}

.dt-field {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.dt-field h4 {
  color: #4a5568;
  margin-bottom: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dt-field p {
  color: #2d3748;
  line-height: 1.6;
  margin: 0;
}

.dt-field div {
  color: #2d3748;
  line-height: 1.6;
}

.dt-field h1,
.dt-field h2,
.dt-field h3 {
  color: #2d3748;
  margin: 1rem 0 0.5rem 0;
  font-weight: 600;
}

.dt-field h2 {
  font-size: 1.3rem;
  color: #667eea;
}

.dt-field h3 {
  font-size: 1.1rem;
  color: #4a5568;
}

.dt-field ul {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.dt-field li {
  margin: 0.25rem 0;
  line-height: 1.5;
}

.dt-field strong {
  color: #2d3748;
  font-weight: 600;
}

.dt-field em {
  color: #667eea;
  font-style: italic;
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

  .design-thinking-section {
    padding: 1rem;
    margin-top: 2rem;
  }

  .design-thinking-progress {
    flex-direction: column;
    gap: 0.75rem;
    text-align: center;
  }

  .progress-text {
    min-width: auto;
  }

  .dt-phase {
    padding: 1rem;
  }

  .dt-phase h3 {
    font-size: 1.1rem;
  }
}
</style>
