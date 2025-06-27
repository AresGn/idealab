<template>
  <div class="all-ideas">
    <!-- En-tête de la page -->
    <div class="page-header">
      <div class="breadcrumb">
        <router-link to="/">
          <i class="fas fa-home"></i>
          Accueil
        </router-link>
        <i class="fas fa-chevron-right"></i>
        <span>Toutes les idées</span>
      </div>
      
      <h1>
        <i class="fas fa-lightbulb"></i>
        Toutes les idées
      </h1>
      <p class="page-description">
        Découvrez toutes les idées innovantes partagées par notre communauté
      </p>
    </div>

    <!-- Filtres et tri -->
    <div class="filters-section">
      <div class="filters-container">
        <div class="filter-group">
          <label>
            <i class="fas fa-sort"></i>
            Trier par
          </label>
          <select v-model="filters.sort" @change="applyFilters" class="filter-select">
            <option value="votes_count">Plus appréciées</option>
            <option value="comments_count">Plus commentées</option>
            <option value="created_at">Plus récentes</option>
            <option value="views_count">Plus vues</option>
            <option value="trending">Tendance</option>
          </select>
        </div>

        <div class="filter-group">
          <label>
            <i class="fas fa-tag"></i>
            Catégorie
          </label>
          <select v-model="filters.sector" @change="applyFilters" class="filter-select">
            <option value="">Toutes les catégories</option>
            <option value="Agriculture">Agriculture</option>
            <option value="Technologie">Technologie</option>
            <option value="Santé">Santé</option>
            <option value="Éducation">Éducation</option>
            <option value="Environnement">Environnement</option>
            <option value="Transport">Transport</option>
            <option value="Finance">Finance</option>
            <option value="Énergie">Énergie</option>
            <option value="Commerce">Commerce</option>
            <option value="Philanthropie">Philanthropie</option>
            <option value="Autre">Autre</option>
          </select>
        </div>

        <div class="filter-group">
          <label>
            <i class="fas fa-list"></i>
            Affichage
          </label>
          <select v-model="filters.limit" @change="applyFilters" class="filter-select">
            <option value="12">12 par page</option>
            <option value="24">24 par page</option>
            <option value="48">48 par page</option>
          </select>
        </div>

        <button @click="resetFilters" class="reset-btn">
          <i class="fas fa-undo"></i>
          Réinitialiser
        </button>
      </div>
    </div>

    <!-- Statistiques -->
    <div class="stats-bar">
      <div class="stat-item">
        <i class="fas fa-lightbulb"></i>
        <span>{{ totalIdeas }} idées</span>
      </div>
      <div class="stat-item">
        <i class="fas fa-filter"></i>
        <span>{{ filteredCount }} affichées</span>
      </div>
    </div>

    <!-- Chargement -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Chargement des idées...</p>
      </div>
    </div>

    <!-- Grille des idées -->
    <div v-else-if="ideas.length > 0" class="ideas-grid">
      <div 
        v-for="idea in ideas" 
        :key="idea.id" 
        class="idea-card"
        @click="viewIdea(idea.id)"
      >
        <div class="idea-header">
          <span class="idea-sector">
            <i class="fas fa-tag"></i>
            {{ idea.sector }}
          </span>
          <span class="idea-date">
            <i class="fas fa-calendar-alt"></i>
            {{ formatDate(idea.created_at) }}
          </span>
        </div>

        <h3 class="idea-title">{{ idea.title }}</h3>
        <p class="idea-description">{{ truncateText(idea.description, 120) }}</p>

        <div class="idea-author">
          <i class="fas fa-user"></i>
          <span>{{ idea.first_name }} {{ idea.last_name }}</span>
        </div>

        <div class="idea-stats">
          <div class="stat">
            <i class="fas fa-thumbs-up"></i>
            <span>{{ idea.votes_count || 0 }}</span>
          </div>
          <div class="stat">
            <i class="fas fa-comments"></i>
            <span>{{ idea.comments_count || 0 }}</span>
          </div>
          <div class="stat">
            <i class="fas fa-eye"></i>
            <span>{{ idea.views_count || 0 }}</span>
          </div>
        </div>

        <div class="idea-actions">
          <button @click.stop="likeIdea(idea.id)" class="like-btn" :class="{ liked: idea.user_liked }">
            <i class="fas fa-heart"></i>
          </button>
          <button @click.stop="viewIdea(idea.id)" class="view-btn">
            <i class="fas fa-arrow-right"></i>
            Voir plus
          </button>
        </div>
      </div>
    </div>

    <!-- Aucune idée trouvée -->
    <div v-else class="no-ideas">
      <div class="no-ideas-content">
        <i class="fas fa-search"></i>
        <h3>Aucune idée trouvée</h3>
        <p>Essayez de modifier vos filtres ou de rechercher autre chose.</p>
        <button @click="resetFilters" class="btn-primary">
          <i class="fas fa-undo"></i>
          Réinitialiser les filtres
        </button>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination">
      <button 
        @click="changePage(currentPage - 1)" 
        :disabled="currentPage === 1"
        class="page-btn"
      >
        <i class="fas fa-chevron-left"></i>
        Précédent
      </button>
      
      <div class="page-numbers">
        <button 
          v-for="page in visiblePages" 
          :key="page"
          @click="changePage(page)"
          :class="['page-number', { active: page === currentPage }]"
        >
          {{ page }}
        </button>
      </div>
      
      <button 
        @click="changePage(currentPage + 1)" 
        :disabled="currentPage === totalPages"
        class="page-btn"
      >
        Suivant
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>
  </div>
</template>

<script>
import { useIdeasStore } from '../store'
import { computed, ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'AllIdeas',
  setup() {
    const ideasStore = useIdeasStore()
    const router = useRouter()
    
    const filters = ref({
      sort: 'created_at',
      sector: '',
      limit: 12,
      page: 1
    })

    const loading = ref(false)
    const ideas = ref([])
    const totalIdeas = ref(0)
    const totalPages = ref(0)
    const currentPage = ref(1)

    const filteredCount = computed(() => ideas.value.length)
    
    const visiblePages = computed(() => {
      const pages = []
      const start = Math.max(1, currentPage.value - 2)
      const end = Math.min(totalPages.value, currentPage.value + 2)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      return pages
    })

    const fetchIdeas = async () => {
      loading.value = true
      try {
        const params = {
          page: filters.value.page,
          limit: filters.value.limit,
          sort: filters.value.sort,
          order: filters.value.sort === 'created_at' ? 'DESC' : 'DESC'
        }
        
        if (filters.value.sector) {
          params.sector = filters.value.sector
        }

        const response = await ideasStore.fetchIdeas(params)
        if (response.success) {
          ideas.value = ideasStore.ideas
          totalIdeas.value = ideasStore.pagination.total
          totalPages.value = ideasStore.pagination.pages
          currentPage.value = ideasStore.pagination.page
        }
      } catch (error) {
        console.error('Erreur lors du chargement des idées:', error)
      } finally {
        loading.value = false
      }
    }

    const applyFilters = () => {
      filters.value.page = 1
      fetchIdeas()
    }

    const resetFilters = () => {
      filters.value = {
        sort: 'created_at',
        sector: '',
        limit: 12,
        page: 1
      }
      fetchIdeas()
    }

    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        filters.value.page = page
        fetchIdeas()
      }
    }

    const viewIdea = (ideaId) => {
      router.push(`/idea/${ideaId}`)
    }

    const likeIdea = async (ideaId) => {
      // TODO: Implémenter le système de likes
      console.log('Like idea:', ideaId)
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    }

    const truncateText = (text, maxLength) => {
      if (text.length <= maxLength) return text
      return text.substring(0, maxLength) + '...'
    }

    onMounted(() => {
      fetchIdeas()
    })

    return {
      filters,
      loading,
      ideas,
      totalIdeas,
      totalPages,
      currentPage,
      filteredCount,
      visiblePages,
      applyFilters,
      resetFilters,
      changePage,
      viewIdea,
      likeIdea,
      formatDate,
      truncateText
    }
  }
}
</script>

<style scoped>
.all-ideas {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* En-tête de la page */
.page-header {
  margin-bottom: 2rem;
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
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.breadcrumb a:hover {
  text-decoration: underline;
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.page-header h1 i {
  color: #667eea;
}

.page-description {
  font-size: 1.1rem;
  color: #718096;
  margin-bottom: 2rem;
}

/* Section des filtres */
.filters-section {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.filters-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 180px;
}

.filter-group label {
  font-weight: 600;
  color: #2d3748;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.reset-btn {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #f56565, #e53e3e);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  height: fit-content;
}

.reset-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 101, 101, 0.3);
}

/* Barre de statistiques */
.stats-bar {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 12px;
  color: white;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

/* Chargement */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem;
}

.loading-spinner {
  text-align: center;
  color: #667eea;
}

.loading-spinner i {
  font-size: 2rem;
  margin-bottom: 1rem;
}

/* Grille des idées */
.ideas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.idea-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;
}

.idea-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  border-color: #667eea;
}

.idea-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.idea-sector {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.idea-date {
  color: #718096;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
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

.idea-author {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4a5568;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.idea-stats {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.idea-stats .stat {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #718096;
  font-size: 0.9rem;
  font-weight: 500;
}

.idea-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.like-btn {
  background: none;
  border: 2px solid #e2e8f0;
  color: #718096;
  padding: 0.5rem;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.like-btn:hover {
  border-color: #f56565;
  color: #f56565;
}

.like-btn.liked {
  background: #f56565;
  border-color: #f56565;
  color: white;
}

.view-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.view-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* Aucune idée trouvée */
.no-ideas {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.no-ideas-content {
  text-align: center;
  max-width: 400px;
}

.no-ideas-content i {
  font-size: 4rem;
  color: #cbd5e0;
  margin-bottom: 1.5rem;
}

.no-ideas-content h3 {
  font-size: 1.5rem;
  color: #2d3748;
  margin-bottom: 1rem;
}

.no-ideas-content p {
  color: #718096;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 3rem;
}

.page-btn {
  background: white;
  border: 2px solid #e2e8f0;
  color: #4a5568;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.page-btn:hover:not(:disabled) {
  border-color: #667eea;
  color: #667eea;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 0.5rem;
}

.page-number {
  background: white;
  border: 2px solid #e2e8f0;
  color: #4a5568;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  min-width: 45px;
  text-align: center;
}

.page-number:hover {
  border-color: #667eea;
  color: #667eea;
}

.page-number.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-color: #667eea;
  color: white;
}

/* Responsive */
@media (max-width: 768px) {
  .all-ideas {
    padding: 1rem;
  }

  .page-header h1 {
    font-size: 2rem;
  }

  .filters-container {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group {
    min-width: auto;
  }

  .stats-bar {
    flex-direction: column;
    gap: 1rem;
  }

  .ideas-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .pagination {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .page-numbers {
    order: -1;
    width: 100%;
    justify-content: center;
  }
}
</style>
