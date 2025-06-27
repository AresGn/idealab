<template>
  <div class="side-panels">
    <!-- Idées populaires -->
    <div class="dashboard-card">
      <div class="card-header">
        <h2>
          <i class="fas fa-fire"></i>
          Idées Populaires
        </h2>
      </div>
      <div class="popular-ideas">
        <div 
          v-for="(idea, index) in popularIdeas" 
          :key="idea.id" 
          class="popular-item"
        >
          <div class="idea-rank">#{{ index + 1 }}</div>
          <div class="idea-content">
            <h4>{{ idea.title }}</h4>
            <p class="idea-author">par {{ idea.author || 'Anonyme' }}</p>
            <div class="idea-stats">
              <span class="stat">
                <i class="fas fa-thumbs-up"></i>
                {{ idea.votes }}
              </span>
              <span class="stat">
                <i class="fas fa-comments"></i>
                {{ idea.comments || 0 }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Activité récente -->
    <div class="dashboard-card">
      <div class="card-header">
        <h2>
          <i class="fas fa-clock"></i>
          Activité Récente
        </h2>
      </div>
      <div class="activity-list">
        <div 
          v-for="activity in recentActivity" 
          :key="activity.id" 
          class="activity-item"
        >
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
  </div>
</template>

<script>
export default {
  name: 'SidePanels',
  props: {
    popularIdeas: {
      type: Array,
      required: true,
      default: () => []
    },
    recentActivity: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }
}
</script>

<style scoped>
.side-panels {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.dashboard-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.card-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Popular Ideas */
.popular-ideas {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.popular-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.popular-item:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
}

.idea-rank {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  flex-shrink: 0;
}

.idea-content h4 {
  color: #2d3748;
  margin-bottom: 0.25rem;
  font-size: 1rem;
  font-weight: 600;
}

.idea-author {
  color: #718096;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.idea-content .idea-stats {
  display: flex;
  gap: 1rem;
}

.idea-content .stat {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #4a5568;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Activity List */
.activity-list {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.activity-item:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
  background: #e2e8f0;
  color: #4a5568;
}

.activity-icon.vote {
  background: linear-gradient(135deg, #f093fb, #f5576c);
  color: white;
}

.activity-icon.comment {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  color: white;
}

.activity-icon.featured {
  background: linear-gradient(135deg, #43e97b, #38f9d7);
  color: white;
}

.activity-icon.approved {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.activity-content p {
  color: #2d3748;
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.activity-content small {
  color: #718096;
  font-size: 0.8rem;
}

@media (max-width: 1024px) {
  .side-panels {
    grid-template-columns: 1fr;
  }
}
</style>
