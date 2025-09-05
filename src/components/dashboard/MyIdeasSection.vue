<template>
  <div class="dashboard-card">
    <div class="card-header">
      <h2>
        <i class="fas fa-lightbulb"></i>
        Mes Idées
      </h2>
      <div class="card-actions">
        <select :value="filter" @change="$emit('update-filter', $event.target.value)" class="filter-select">
          <option value="all">Toutes</option>
          <option value="approved">Approuvées</option>
          <option value="pending">En attente</option>
          <option value="featured">Mises en avant</option>
        </select>
      </div>
    </div>
    
    <div class="ideas-list" v-if="filteredIdeas.length > 0">
      <div 
        v-for="idea in filteredIdeas" 
        :key="idea.id" 
        class="idea-item"
      >
        <div class="idea-info">
          <h3>{{ idea.title }}</h3>
          <p class="idea-sector">
            <i class="fas fa-tag"></i>
            {{ idea.sector }}
          </p>
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
        </div>
        <div class="idea-actions">
          <span :class="['status-badge', idea.status]">
            {{ getStatusText(idea.status) }}
          </span>
          <div class="action-buttons">
            <button class="btn-icon" @click="$emit('edit-idea', idea.id)" title="Modifier">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon" @click="$emit('view-idea', idea.id)" title="Voir">
              <i class="fas fa-external-link-alt"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="empty-state">
      <div class="empty-icon">
        <i class="fas fa-lightbulb"></i>
      </div>
      <h3>Aucune idée trouvée</h3>
      <p>{{ filter === 'all' ? 'Vous n\'avez pas encore soumis d\'idées.' : 'Aucune idée ne correspond à ce filtre.' }}</p>
      <router-link to="/submit" class="btn btn-primary" v-if="filter === 'all'">
        <i class="fas fa-plus"></i>
        Soumettre ma première idée
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MyIdeasSection',
  props: {
    ideas: {
      type: Array,
      required: true,
      default: () => []
    },
    filter: {
      type: String,
      required: true,
      default: 'all'
    }
  },
  emits: ['update-filter', 'edit-idea', 'view-idea'],
  computed: {
    filteredIdeas() {
      if (this.filter === 'all') {
        return this.ideas
      }
      return this.ideas.filter(idea => idea.status === this.filter)
    }
  },
  methods: {
    getStatusText(status) {
      const statusMap = {
        'pending': 'En attente',
        'approved': 'Approuvée',
        'featured': 'Mise en avant',
        'rejected': 'Rejetée'
      }
      return statusMap[status] || status
    }
  }
}
</script>

<style scoped>
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
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-select {
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #4a5568;
  font-size: 0.875rem;
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.ideas-list {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.idea-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  transition: all 0.3s ease;
  background: #fafafa;
}

.idea-item:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
  transform: translateY(-2px);
}

.idea-info h3 {
  color: #2d3748;
  margin-bottom: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
}

.idea-sector {
  color: #667eea;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.idea-stats {
  display: flex;
  gap: 1.5rem;
  font-size: 0.875rem;
}

.idea-stats .stat {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #718096;
  font-weight: 500;
}

.idea-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: #f7fafc;
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
  transform: scale(1.05);
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.pending {
  background: linear-gradient(135deg, #f6ad55, #ed8936);
  color: white;
}

.status-badge.approved {
  background: linear-gradient(135deg, #68d391, #38a169);
  color: white;
}

.status-badge.featured {
  background: linear-gradient(135deg, #b794f6, #9f7aea);
  color: white;
}

.status-badge.rejected {
  background: linear-gradient(135deg, #fc8181, #e53e3e);
  color: white;
}

.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: #718096;
}

.empty-icon {
  font-size: 3rem;
  color: #cbd5e0;
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: #4a5568;
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.empty-state p {
  margin-bottom: 1.5rem;
  font-size: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

@media (max-width: 768px) {
  .idea-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .idea-actions {
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
  }
  
  .card-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}
</style>
