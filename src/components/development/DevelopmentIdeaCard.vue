<template>
  <div class="development-idea-card">
    <div class="idea-header">
      <div class="idea-meta">
        <span class="sector">
          <i class="fas fa-tag"></i>
          {{ idea.sector }}
        </span>
        <span :class="['status-badge', idea.development_status]">
          {{ getStatusText(idea.development_status) }}
        </span>
      </div>
      <h3>{{ idea.title }}</h3>
      <p class="idea-description">{{ truncateText(idea.description, 150) }}</p>
    </div>

    <div class="progress-section">
      <div class="progress-header">
        <span class="progress-label">Progression</span>
        <span class="progress-percentage">{{ idea.development_progress || 0 }}%</span>
      </div>
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: `${idea.development_progress || 0}%` }"
        ></div>
      </div>
    </div>

    <div class="idea-stats">
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

    <div class="development-info">
      <div class="info-item" v-if="idea.development_start_date">
        <i class="fas fa-calendar-alt"></i>
        <span>Début: {{ formatDate(idea.development_start_date) }}</span>
      </div>
      <div class="info-item" v-if="idea.estimated_completion">
        <i class="fas fa-flag-checkered"></i>
        <span>Fin prévue: {{ formatDate(idea.estimated_completion) }}</span>
      </div>
      <div class="info-item" v-if="idea.development_notes">
        <i class="fas fa-sticky-note"></i>
        <span>{{ truncateText(idea.development_notes, 100) }}</span>
      </div>
    </div>

    <div class="author-info">
      <div class="author-avatar">
        <i class="fas fa-user-circle"></i>
      </div>
      <div class="author-details">
        <span class="author-name">{{ idea.first_name }} {{ idea.last_name }}</span>
        <span class="author-username">@{{ idea.username }}</span>
      </div>
    </div>

    <div class="card-actions">
      <button @click="viewDetails" class="btn btn-outline">
        <i class="fas fa-eye"></i>
        Voir détails
      </button>
      <button @click="viewProgress" class="btn btn-primary">
        <i class="fas fa-chart-line"></i>
        Suivi
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DevelopmentIdeaCard',
  props: {
    idea: {
      type: Object,
      required: true
    }
  },
  emits: ['view-details', 'view-progress'],
  methods: {
    getStatusText(status) {
      const statusMap = {
        'planning': 'Planification',
        'development': 'En développement',
        'testing': 'Tests',
        'completed': 'Terminé',
        'paused': 'En pause'
      }
      return statusMap[status] || status
    },
    
    truncateText(text, maxLength) {
      if (!text) return ''
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
    },
    
    formatDate(date) {
      if (!date) return ''
      return new Date(date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    },
    
    viewDetails() {
      this.$emit('view-details', this.idea.id)
    },
    
    viewProgress() {
      this.$emit('view-progress', this.idea.id)
    }
  }
}
</script>

<style scoped>
.development-idea-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.development-idea-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.idea-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0.5rem 0;
}

.idea-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
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
}

.status-badge.planning {
  background: #fef5e7;
  color: #d69e2e;
}

.status-badge.development {
  background: #e6fffa;
  color: #319795;
}

.status-badge.testing {
  background: #fef5e7;
  color: #d69e2e;
}

.status-badge.completed {
  background: #f0fff4;
  color: #38a169;
}

.status-badge.paused {
  background: #fed7d7;
  color: #e53e3e;
}

.idea-description {
  color: #718096;
  line-height: 1.6;
  margin: 0;
}

.progress-section {
  margin: 1rem 0;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.progress-label {
  font-weight: 600;
  color: #4a5568;
}

.progress-percentage {
  font-weight: 700;
  color: #667eea;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.3s ease;
}

.idea-stats {
  display: flex;
  gap: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #718096;
  font-size: 0.875rem;
}

.development-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4a5568;
  font-size: 0.875rem;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.author-avatar {
  font-size: 2rem;
  color: #cbd5e0;
}

.author-details {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 600;
  color: #2d3748;
}

.author-username {
  color: #718096;
  font-size: 0.875rem;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
}

.btn {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.btn-outline {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn:hover {
  transform: translateY(-2px);
}
</style>
