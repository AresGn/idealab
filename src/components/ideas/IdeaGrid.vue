<template>
  <div class="idea-grid">
    <!-- En-tête avec compteur et options d'affichage -->
    <div class="grid-header">
      <div class="results-info">
        <h3>
          <i class="fas fa-lightbulb"></i>
          {{ totalIdeas }} idée(s) trouvée(s)
        </h3>
        <p v-if="hasFilters">Résultats filtrés</p>
      </div>
      
      <div class="view-options">
        <button
          @click="$emit('change-view', 'grid')"
          :class="['view-btn', { active: viewMode === 'grid' }]"
          title="Vue grille"
        >
          <i class="fas fa-th"></i>
        </button>
        <button
          @click="$emit('change-view', 'list')"
          :class="['view-btn', { active: viewMode === 'list' }]"
          title="Vue liste"
        >
          <i class="fas fa-list"></i>
        </button>
      </div>
    </div>

    <!-- État de chargement -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
      </div>
      <p>Chargement des idées...</p>
    </div>

    <!-- État vide -->
    <div v-else-if="ideas.length === 0" class="empty-state">
      <div class="empty-icon">
        <i class="fas fa-search"></i>
      </div>
      <h3>Aucune idée trouvée</h3>
      <p v-if="hasFilters">
        Aucune idée ne correspond à vos critères de recherche.
        Essayez de modifier vos filtres.
      </p>
      <p v-else>
        Aucune idée n'a encore été soumise.
        Soyez le premier à partager votre innovation !
      </p>
      <router-link to="/submit" class="btn btn-primary">
        <i class="fas fa-plus"></i>
        Soumettre une idée
      </router-link>
    </div>

    <!-- Grille des idées -->
    <div v-else :class="['ideas-container', viewMode]">
      <IdeaCard
        v-for="idea in ideas"
        :key="idea.id"
        :idea="idea"
        :view-mode="viewMode"
        @view-idea="$emit('view-idea', $event)"
        @vote-idea="$emit('vote-idea', $event)"
        @bookmark-idea="$emit('bookmark-idea', $event)"
      />
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination">
      <button
        @click="$emit('change-page', currentPage - 1)"
        :disabled="currentPage === 1"
        class="btn btn-outline"
      >
        <i class="fas fa-chevron-left"></i>
        Précédent
      </button>

      <div class="page-numbers">
        <button
          v-for="page in visiblePages"
          :key="page"
          @click="$emit('change-page', page)"
          :class="['page-btn', { active: page === currentPage }]"
        >
          {{ page }}
        </button>
      </div>

      <button
        @click="$emit('change-page', currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="btn btn-outline"
      >
        Suivant
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>

    <!-- Informations de pagination -->
    <div class="pagination-info">
      <p>
        Affichage de {{ startItem }} à {{ endItem }} sur {{ totalIdeas }} idées
      </p>
    </div>
  </div>
</template>

<script>
import IdeaCard from './IdeaCard.vue'

export default {
  name: 'IdeaGrid',
  components: {
    IdeaCard
  },
  props: {
    ideas: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    totalIdeas: {
      type: Number,
      default: 0
    },
    currentPage: {
      type: Number,
      default: 1
    },
    totalPages: {
      type: Number,
      default: 1
    },
    itemsPerPage: {
      type: Number,
      default: 12
    },
    viewMode: {
      type: String,
      default: 'grid',
      validator: value => ['grid', 'list'].includes(value)
    },
    hasFilters: {
      type: Boolean,
      default: false
    }
  },
  emits: ['view-idea', 'vote-idea', 'bookmark-idea', 'change-view', 'change-page'],
  computed: {
    startItem() {
      return (this.currentPage - 1) * this.itemsPerPage + 1
    },
    
    endItem() {
      return Math.min(this.currentPage * this.itemsPerPage, this.totalIdeas)
    },
    
    visiblePages() {
      const pages = []
      const maxVisible = 5
      let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2))
      let end = Math.min(this.totalPages, start + maxVisible - 1)
      
      // Ajuster le début si on est près de la fin
      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1)
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      return pages
    }
  }
}
</script>

<style scoped>
.idea-grid {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 2rem;
}

.grid-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.results-info h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 0.25rem 0;
}

.results-info p {
  color: #718096;
  margin: 0;
  font-size: 0.875rem;
}

.view-options {
  display: flex;
  gap: 0.5rem;
}

.view-btn {
  width: 40px;
  height: 40px;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  color: #718096;
}

.view-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.view-btn.active {
  background: #667eea;
  border-color: #667eea;
  color: white;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.loading-spinner,
.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.loading-spinner {
  color: #667eea;
}

.empty-icon {
  color: #cbd5e0;
}

.loading-state p,
.empty-state p {
  color: #718096;
  font-size: 1.125rem;
  margin-bottom: 1.5rem;
}

.empty-state h3 {
  color: #2d3748;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.ideas-container.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.ideas-container.list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.page-numbers {
  display: flex;
  gap: 0.5rem;
}

.page-btn {
  width: 40px;
  height: 40px;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  transition: all 0.3s ease;
  color: #4a5568;
}

.page-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.page-btn.active {
  background: #667eea;
  border-color: #667eea;
  color: white;
}

.pagination-info {
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.pagination-info p {
  color: #718096;
  font-size: 0.875rem;
  margin: 0;
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

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-outline {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-outline:hover:not(:disabled) {
  background: #667eea;
  color: white;
}

@media (max-width: 768px) {
  .idea-grid {
    padding: 1rem;
  }
  
  .grid-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .ideas-container.grid {
    grid-template-columns: 1fr;
  }
  
  .pagination {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .page-numbers {
    order: -1;
  }
}

@media (max-width: 480px) {
  .results-info h3 {
    font-size: 1.25rem;
  }
  
  .view-options {
    width: 100%;
    justify-content: center;
  }
}

/* Accessibilité */
.view-btn:focus,
.page-btn:focus,
.btn:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}
</style>
