<template>
  <div class="user-ideas-list">
    <div class="section-header">
      <h2>
        <i class="fas fa-lightbulb"></i>
        Idées de {{ userName }}
      </h2>
      <div class="filter-controls">
        <select v-model="selectedFilter" @change="filterIdeas">
          <option value="all">Toutes les idées</option>
          <option value="approved">Approuvées</option>
          <option value="pending">En attente</option>
          <option value="featured">Mises en avant</option>
        </select>
        <select v-model="sortBy" @change="sortIdeas">
          <option value="created_at">Plus récentes</option>
          <option value="votes">Plus populaires</option>
          <option value="comments">Plus commentées</option>
          <option value="views">Plus vues</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Chargement des idées...</p>
    </div>

    <div v-else-if="filteredIdeas.length === 0" class="empty-state">
      <i class="fas fa-lightbulb"></i>
      <h3>Aucune idée trouvée</h3>
      <p v-if="selectedFilter === 'all'">
        {{ isOwnProfile ? 'Vous n\'avez pas encore soumis d\'idée.' : 'Cet utilisateur n\'a pas encore soumis d\'idée.' }}
      </p>
      <p v-else>
        Aucune idée ne correspond au filtre sélectionné.
      </p>
      <router-link v-if="isOwnProfile" to="/submit" class="btn btn-primary">
        <i class="fas fa-plus"></i>
        Soumettre une idée
      </router-link>
    </div>

    <div v-else class="ideas-grid">
      <div
        v-for="idea in paginatedIdeas"
        :key="idea.id"
        class="idea-card"
        @click="viewIdea(idea.id)"
      >
        <div class="idea-header">
          <div class="idea-meta">
            <span class="sector">
              <i class="fas fa-tag"></i>
              {{ idea.sector }}
            </span>
            <span :class="['status-badge', idea.status]">
              {{ getStatusText(idea.status) }}
            </span>
          </div>
          <h3>{{ idea.title }}</h3>
          <p class="idea-description">{{ truncateText(idea.description, 120) }}</p>
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

        <div class="idea-footer">
          <span class="creation-date">
            <i class="fas fa-calendar-alt"></i>
            {{ formatDate(idea.created_at) }}
          </span>
          <div class="idea-actions" v-if="isOwnProfile">
            <button @click.stop="editIdea(idea.id)" class="btn-icon" title="Modifier">
              <i class="fas fa-edit"></i>
            </button>
            <button @click.stop="deleteIdea(idea.id)" class="btn-icon delete" title="Supprimer">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination">
      <button 
        @click="changePage(currentPage - 1)"
        :disabled="currentPage === 1"
        class="btn btn-outline"
      >
        <i class="fas fa-chevron-left"></i>
        Précédent
      </button>
      
      <span class="page-info">
        Page {{ currentPage }} sur {{ totalPages }}
      </span>
      
      <button 
        @click="changePage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="btn btn-outline"
      >
        Suivant
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserIdeasList',
  props: {
    ideas: {
      type: Array,
      default: () => []
    },
    userName: {
      type: String,
      required: true
    },
    isOwnProfile: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['edit-idea', 'delete-idea', 'view-idea'],
  data() {
    return {
      selectedFilter: 'all',
      sortBy: 'created_at',
      currentPage: 1,
      itemsPerPage: 6
    }
  },
  computed: {
    filteredIdeas() {
      let ideas = [...this.ideas]
      
      // Filtrer par statut
      if (this.selectedFilter !== 'all') {
        ideas = ideas.filter(idea => idea.status === this.selectedFilter)
      }
      
      // Trier
      switch (this.sortBy) {
        case 'votes':
          ideas.sort((a, b) => (b.votes_count || 0) - (a.votes_count || 0))
          break
        case 'comments':
          ideas.sort((a, b) => (b.comments_count || 0) - (a.comments_count || 0))
          break
        case 'views':
          ideas.sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
          break
        default:
          ideas.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      }
      
      return ideas
    },
    
    totalPages() {
      return Math.ceil(this.filteredIdeas.length / this.itemsPerPage)
    },
    
    paginatedIdeas() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.filteredIdeas.slice(start, end)
    }
  },
  methods: {
    filterIdeas() {
      this.currentPage = 1
    },
    
    sortIdeas() {
      this.currentPage = 1
    },
    
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
      }
    },
    
    viewIdea(ideaId) {
      this.$emit('view-idea', ideaId)
    },
    
    editIdea(ideaId) {
      this.$emit('edit-idea', ideaId)
    },
    
    deleteIdea(ideaId) {
      if (confirm('Êtes-vous sûr de vouloir supprimer cette idée ?')) {
        this.$emit('delete-idea', ideaId)
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
.user-ideas-list {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-controls {
  display: flex;
  gap: 1rem;
}

.filter-controls select {
  padding: 0.5rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #718096;
}

.loading-state i,
.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #cbd5e0;
}

.empty-state h3 {
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.ideas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.idea-card {
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.idea-card:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.1);
}

.idea-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
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

.idea-card h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.idea-description {
  color: #718096;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.idea-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #718096;
  font-size: 0.875rem;
}

.idea-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.creation-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #718096;
  font-size: 0.875rem;
}

.idea-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: #f7fafc;
  color: #4a5568;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.btn-icon:hover {
  background: #edf2f7;
}

.btn-icon.delete:hover {
  background: #fed7d7;
  color: #e53e3e;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 1rem;
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

.btn-outline {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .filter-controls {
    width: 100%;
    flex-direction: column;
  }
  
  .ideas-grid {
    grid-template-columns: 1fr;
  }
}
</style>
