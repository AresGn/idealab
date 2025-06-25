<template>
  <div class="ideas-in-development">
    <!-- En-tête de la page -->
    <div class="page-header">
      <div class="breadcrumb">
        <router-link to="/">
          <i class="fas fa-home"></i>
          Accueil
        </router-link>
        <i class="fas fa-chevron-right"></i>
        <span>Idées en développement</span>
      </div>
      
      <h1>
        <i class="fas fa-cogs"></i>
        Idées en cours de développement
      </h1>
      <p class="page-description">
        Découvrez les idées qui ont atteint le seuil de popularité et sont maintenant en phase de développement
      </p>
    </div>

    <!-- Statistiques de développement -->
    <DevelopmentStats
      :development-ideas="developmentIdeas"
      :completed-ideas="completedIdeas"
      :average-development-time="averageDevelopmentTime"
      :total-developers="totalDevelopers"
    />

    <!-- Filtres -->
    <DevelopmentFilters
      :filters="filters"
      @update-filter="updateFilter"
      @reset-filters="resetFilters"
      @export-data="exportData"
    />

    <!-- État de chargement -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
      </div>
      <p>Chargement des idées en développement...</p>
    </div>

    <!-- État d'erreur -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">
        <i class="fas fa-exclamation-triangle"></i>
      </div>
      <h3>Erreur</h3>
      <p>{{ error }}</p>
      <button @click="loadDevelopmentIdeas" class="btn btn-primary">
        <i class="fas fa-redo"></i>
        Réessayer
      </button>
    </div>

    <!-- Liste des idées -->
    <div v-else class="ideas-grid">
      <DevelopmentIdeaCard
        v-for="idea in filteredIdeas"
        :key="idea.id"
        :idea="idea"
        @view-details="viewIdeaDetails"
        @view-progress="viewIdeaProgress"
      />
    </div>

    <!-- État vide -->
    <div v-if="!loading && !error && filteredIdeas.length === 0" class="empty-state">
      <div class="empty-icon">
        <i class="fas fa-search"></i>
      </div>
      <h3>Aucune idée trouvée</h3>
      <p>Aucune idée ne correspond à vos critères de recherche.</p>
      <button @click="resetFilters" class="btn btn-secondary">
        <i class="fas fa-undo"></i>
        Réinitialiser les filtres
      </button>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DevelopmentStats from '../components/development/DevelopmentStats.vue'
import DevelopmentFilters from '../components/development/DevelopmentFilters.vue'
import DevelopmentIdeaCard from '../components/development/DevelopmentIdeaCard.vue'
import { useIdeasStore } from '@/store'

export default {
  name: 'IdeasInDevelopment',
  components: {
    DevelopmentStats,
    DevelopmentFilters,
    DevelopmentIdeaCard
  },
  setup() {
    const router = useRouter()
    const ideasStore = useIdeasStore()
    
    // État réactif
    const loading = ref(false)
    const error = ref(null)
    const developmentIdeas = ref([])
    const currentPage = ref(1)
    const totalPages = ref(1)
    
    // Filtres
    const filters = ref({
      status: 'all',
      sort: 'progress',
      search: '',
      minProgress: 0
    })
    
    // Données calculées
    const completedIdeas = computed(() => 
      developmentIdeas.value.filter(idea => idea.development_status === 'completed')
    )
    
    const averageDevelopmentTime = computed(() => {
      const completed = completedIdeas.value
      if (completed.length === 0) return '0 mois'
      
      const totalMonths = completed.reduce((sum, idea) => {
        if (idea.development_start_date && idea.estimated_completion) {
          const start = new Date(idea.development_start_date)
          const end = new Date(idea.estimated_completion)
          const months = (end - start) / (1000 * 60 * 60 * 24 * 30)
          return sum + months
        }
        return sum
      }, 0)
      
      return `${Math.round(totalMonths / completed.length)} mois`
    })
    
    const totalDevelopers = computed(() => {
      const uniqueDevelopers = new Set()
      developmentIdeas.value.forEach(idea => {
        if (idea.user_id) uniqueDevelopers.add(idea.user_id)
      })
      return uniqueDevelopers.size
    })
    
    const filteredIdeas = computed(() => {
      let ideas = [...developmentIdeas.value]
      
      // Filtrer par statut
      if (filters.value.status !== 'all') {
        ideas = ideas.filter(idea => idea.development_status === filters.value.status)
      }
      
      // Filtrer par recherche
      if (filters.value.search) {
        const search = filters.value.search.toLowerCase()
        ideas = ideas.filter(idea => 
          idea.title.toLowerCase().includes(search) ||
          idea.description.toLowerCase().includes(search)
        )
      }
      
      // Filtrer par progression minimale
      ideas = ideas.filter(idea => 
        (idea.development_progress || 0) >= filters.value.minProgress
      )
      
      // Trier
      switch (filters.value.sort) {
        case 'progress':
          ideas.sort((a, b) => (b.development_progress || 0) - (a.development_progress || 0))
          break
        case 'votes':
          ideas.sort((a, b) => (b.votes_count || 0) - (a.votes_count || 0))
          break
        case 'start_date':
          ideas.sort((a, b) => new Date(b.development_start_date || 0) - new Date(a.development_start_date || 0))
          break
        case 'estimated_completion':
          ideas.sort((a, b) => new Date(a.estimated_completion || 0) - new Date(b.estimated_completion || 0))
          break
      }
      
      return ideas
    })
    
    // Méthodes
    const loadDevelopmentIdeas = async () => {
      loading.value = true
      error.value = null
      
      try {
        const result = await ideasStore.fetchIdeasInDevelopment({
          status: 'all',
          sort: filters.value.sort
        })
        
        if (result.success) {
          developmentIdeas.value = result.data || []
        } else {
          error.value = result.error || 'Erreur lors du chargement'
        }
      } catch (err) {
        error.value = 'Erreur lors du chargement des idées'
        console.error('Erreur:', err)
      } finally {
        loading.value = false
      }
    }
    
    const updateFilter = ({ key, value }) => {
      filters.value[key] = value
      currentPage.value = 1
    }
    
    const resetFilters = () => {
      filters.value = {
        status: 'all',
        sort: 'progress',
        search: '',
        minProgress: 0
      }
      currentPage.value = 1
    }
    
    const exportData = () => {
      // Logique d'export des données
      console.log('Export des données de développement')
    }
    
    const viewIdeaDetails = (ideaId) => {
      router.push(`/idea/${ideaId}`)
    }
    
    const viewIdeaProgress = (ideaId) => {
      router.push(`/idea/${ideaId}/progress`)
    }
    
    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
      }
    }
    
    // Lifecycle
    onMounted(() => {
      loadDevelopmentIdeas()
    })
    
    return {
      loading,
      error,
      developmentIdeas,
      completedIdeas,
      averageDevelopmentTime,
      totalDevelopers,
      filteredIdeas,
      filters,
      currentPage,
      totalPages,
      loadDevelopmentIdeas,
      updateFilter,
      resetFilters,
      exportData,
      viewIdeaDetails,
      viewIdeaProgress,
      changePage
    }
  }
}
</script>

<style>
@import '../styles/ideas-in-development.css';
</style>
