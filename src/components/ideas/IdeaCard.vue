<template>
  <div :class="['idea-card', viewMode, { loading: navigating }]" @click="viewIdea">
    <!-- Badge de statut -->
    <div v-if="idea.status === 'featured'" class="featured-badge">
      <i class="fas fa-star"></i>
      Mise en avant
    </div>

    <!-- En-tête de la carte -->
    <div class="card-header">
      <div class="idea-meta">
        <span class="sector">
          <i class="fas fa-tag"></i>
          {{ idea.sector }}
        </span>
        <span :class="['status-badge', idea.status]">
          {{ getStatusText(idea.status) }}
        </span>
      </div>
      
      <div class="card-actions" @click.stop>
        <button
          @click="bookmarkIdea"
          :class="['action-btn', { active: isBookmarked }]"
          :title="isBookmarked ? 'Retirer des favoris' : 'Ajouter aux favoris'"
        >
          <i :class="isBookmarked ? 'fas fa-bookmark' : 'far fa-bookmark'"></i>
        </button>
        <button @click="shareIdea" class="action-btn" title="Partager">
          <i class="fas fa-share-alt"></i>
        </button>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="card-content">
      <h3 class="idea-title">{{ idea.title }}</h3>
      <p class="idea-description">{{ truncateText(idea.description, descriptionLength) }}</p>
      
      <!-- Informations Design Thinking -->
      <div v-if="idea.design_thinking_mode" class="design-thinking-info">
        <div class="dt-badge">
          <i class="fas fa-brain"></i>
          Design Thinking
        </div>
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: `${idea.completion_percentage || 0}%` }"
          ></div>
        </div>
        <span class="progress-text">{{ idea.completion_percentage || 0 }}% complété</span>
      </div>
    </div>

    <!-- Statistiques -->
    <div class="card-stats">
      <div class="stat-item">
        <i class="fas fa-thumbs-up"></i>
        <span>{{ idea.votes_count || 0 }}</span>
      </div>
      <div class="stat-item">
        <i class="fas fa-comments"></i>
        <span>{{ idea.comments_count || 0 }}</span>
      </div>
      <div class="stat-item">
        <i class="fas fa-eye"></i>
        <span>{{ idea.views_count || 0 }}</span>
      </div>
    </div>

    <!-- Pied de carte -->
    <div class="card-footer">
      <div class="author-info">
        <div class="author-avatar">
          <img v-if="idea.avatar_url" :src="idea.avatar_url" :alt="authorName">
          <i v-else class="fas fa-user-circle"></i>
        </div>
        <div class="author-details">
          <span class="author-name">{{ authorName }}</span>
          <span class="creation-date">{{ formatDate(idea.created_at) }}</span>
        </div>
      </div>
      
      <div class="action-section" @click.stop>
        <button
          @click="voteIdea"
          :class="['vote-btn', { voted: hasVoted }]"
          :disabled="voting"
        >
          <i class="fas fa-thumbs-up"></i>
          {{ hasVoted ? 'Voté' : 'Voter' }}
        </button>
        <ShareButton :idea="idea" size="small" />
      </div>
    </div>

    <!-- Overlay de chargement -->
    <div v-if="navigating" class="loading-overlay">
      <LoadingSpinner
        variant="pulse"
        size="large"
        :show-text="false"
      />
    </div>
  </div>
</template>

<script>
import ShareButton from '../ShareButton.vue'
import LoadingSpinner from '../LoadingSpinner.vue'

export default {
  name: 'IdeaCard',
  components: {
    ShareButton,
    LoadingSpinner
  },
  props: {
    idea: {
      type: Object,
      required: true
    },
    viewMode: {
      type: String,
      default: 'grid',
      validator: value => ['grid', 'list'].includes(value)
    },
    isBookmarked: {
      type: Boolean,
      default: false
    },
    hasVoted: {
      type: Boolean,
      default: false
    }
  },
  emits: ['view-idea', 'vote-idea', 'bookmark-idea'],
  data() {
    return {
      voting: false,
      navigating: false
    }
  },
  computed: {
    authorName() {
      if (this.idea.first_name && this.idea.last_name) {
        return `${this.idea.first_name} ${this.idea.last_name}`
      }
      return this.idea.username || 'Anonyme'
    },
    
    descriptionLength() {
      return this.viewMode === 'list' ? 200 : 120
    }
  },
  methods: {
    async viewIdea() {
      if (this.navigating) return

      this.navigating = true
      try {
        // Petit délai pour montrer l'animation
        await new Promise(resolve => setTimeout(resolve, 200))
        this.$emit('view-idea', this.idea.id)
      } finally {
        // Réinitialiser après navigation
        setTimeout(() => {
          this.navigating = false
        }, 500)
      }
    },
    
    async voteIdea() {
      if (this.voting) return
      
      this.voting = true
      try {
        await this.$emit('vote-idea', this.idea.id)
      } finally {
        this.voting = false
      }
    },
    
    bookmarkIdea() {
      this.$emit('bookmark-idea', this.idea.id)
    },
    
    shareIdea() {
      const url = `${window.location.origin}/idea/${this.idea.id}`
      
      if (navigator.share) {
        navigator.share({
          title: this.idea.title,
          text: this.truncateText(this.idea.description, 100),
          url: url
        })
      } else {
        navigator.clipboard.writeText(url)
        // Vous pourriez ajouter une notification toast ici
        console.log('Lien copié dans le presse-papiers')
      }
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
    
    truncateText(text, maxLength) {
      if (!text) return ''
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
    },
    
    formatDate(date) {
      return new Date(date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    }
  }
}
</script>

<style scoped>
.idea-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.idea-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.idea-card.grid {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.idea-card.list {
  padding: 1.5rem;
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.featured-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: linear-gradient(135deg, #f093fb, #f5576c);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  z-index: 2;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.idea-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #667eea;
  font-weight: 600;
  font-size: 0.875rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  width: fit-content;
}

.status-badge.approved {
  background: #f0fff4;
  color: #38a169;
}

.status-badge.pending {
  background: #fef5e7;
  color: #d69e2e;
}

.status-badge.featured {
  background: #e6fffa;
  color: #319795;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  min-width: 44px;
  min-height: 44px;
  border: none;
  border-radius: 8px;
  background: #f7fafc;
  color: #4a5568;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: #edf2f7;
  color: #2d3748;
}

.action-btn.active {
  background: #667eea;
  color: white;
}

.card-content {
  flex: 1;
  margin-bottom: 1rem;
}

.idea-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.75rem;
  line-height: 1.3;
}

.idea-description {
  color: #718096;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.design-thinking-info {
  margin-top: 1rem;
}

.dt-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #e6fffa;
  color: #319795;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #319795, #38b2ac);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.75rem;
  color: #319795;
  font-weight: 600;
}

.card-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #718096;
  font-size: 0.875rem;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f7fafc;
}

.author-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.author-avatar i {
  font-size: 1.5rem;
  color: #cbd5e0;
}

.author-details {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 600;
  color: #2d3748;
  font-size: 0.875rem;
}

.creation-date {
  color: #718096;
  font-size: 0.75rem;
}

.action-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.vote-btn {
  padding: 0.5rem 1rem;
  border: 2px solid #667eea;
  background: transparent;
  color: #667eea;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.vote-btn:hover:not(:disabled) {
  background: #667eea;
  color: white;
}

.vote-btn.voted {
  background: #667eea;
  color: white;
}

.vote-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Mode liste */
.idea-card.list .card-content {
  flex: 1;
}

.idea-card.list .card-footer {
  margin-top: auto;
}

@media (max-width: 768px) {
  .idea-card.list {
    flex-direction: column;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .card-actions {
    align-self: flex-end;
  }

  .card-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .action-btn {
    min-width: 48px;
    min-height: 48px;
  }

  .vote-btn {
    min-height: 48px;
    padding: 0.875rem 1rem;
    font-size: 0.95rem;
  }
}

@media (max-width: 480px) {
  .idea-card {
    margin-bottom: 1rem;
    border-radius: 12px;
  }

  .card-content {
    padding: 1rem;
  }

  .card-header {
    gap: 0.75rem;
  }

  .card-title {
    font-size: 1.1rem;
    line-height: 1.4;
  }

  .card-description {
    font-size: 0.9rem;
    line-height: 1.5;
  }

  .author-avatar {
    width: 36px;
    height: 36px;
  }

  .action-section {
    gap: 0.75rem;
  }
}

/* Accessibilité */
.action-btn:focus,
.vote-btn:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}

/* Overlay de chargement */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 16px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Animation de la carte en état de chargement */
.idea-card.loading {
  transform: scale(0.98);
  box-shadow: 0 2px 12px rgba(102, 126, 234, 0.2);
}

.idea-card.loading:hover {
  transform: scale(0.98);
}
</style>
