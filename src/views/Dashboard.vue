<template>
  <div class="dashboard">
    <DashboardHeader />
    
    <div class="dashboard-content">
      <StatsOverview :stats="userStats" />
      <ChartsSection 
        :performance-data="ideasPerformanceData" 
        :sector-data="sectorDistributionData" 
      />
      <MyIdeasSection 
        :ideas="userIdeas" 
        :filter="ideasFilter" 
        @update-filter="ideasFilter = $event"
        @edit-idea="editIdea"
        @view-idea="viewIdea"
      />
      <SidePanels 
        :popular-ideas="popularIdeas" 
        :recent-activity="recentActivity" 
        @format-date="formatDate"
      />
    </div>
  </div>
</template>

<script>
import DashboardHeader from '../components/dashboard/DashboardHeader.vue'
import StatsOverview from '../components/dashboard/StatsOverview.vue'
import ChartsSection from '../components/dashboard/ChartsSection.vue'
import MyIdeasSection from '../components/dashboard/MyIdeasSection.vue'
import SidePanels from '../components/dashboard/SidePanels.vue'
import { useAuthStore, useIdeasStore, useStatsStore } from '@/store'

export default {
  name: 'Dashboard',
  components: {
    DashboardHeader,
    StatsOverview,
    ChartsSection,
    MyIdeasSection,
    SidePanels
  },
  setup() {
    const authStore = useAuthStore()
    const ideasStore = useIdeasStore()
    const statsStore = useStatsStore()
    return { authStore, ideasStore, statsStore }
  },
  data() {
    return {
      userIdeas: [],
      popularIdeas: [],
      recentActivity: [],
      ideasFilter: 'all',
      refreshInterval: null
    }
  },

  computed: {
    // Utiliser les données dynamiques du store
    userStats() {
      return this.statsStore.userStats
    },

    ideasPerformanceData() {
      return this.statsStore.chartData.performance
    },

    sectorDistributionData() {
      return this.statsStore.chartData.sectors
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
    },

    editIdea(ideaId) {
      this.$router.push(`/edit-idea/${ideaId}`)
    },

    viewIdea(ideaId) {
      this.$router.push(`/idea/${ideaId}`)
    },
    
    async loadDashboardData() {
      try {
        const currentUserId = this.authStore.user?.id

        // Charger toutes les données en parallèle
        const promises = [
          this.ideasStore.fetchIdeas({ limit: 50 }),
          this.statsStore.refreshAllStats(currentUserId)
        ]

        await Promise.all(promises)

        // Filtrer les idées de l'utilisateur connecté
        this.userIdeas = this.ideasStore.ideas.filter(idea => idea.user_id === currentUserId)

        // Idées populaires (top 5 par votes)
        this.popularIdeas = [...this.ideasStore.ideas]
          .sort((a, b) => (b.votes_count || 0) - (a.votes_count || 0))
          .slice(0, 5)
          .map(idea => ({
            id: idea.id,
            title: idea.title,
            sector: idea.sector,
            votes: idea.votes_count || 0,
            author: idea.username || 'Anonyme'
          }))

        // Activité récente (basée sur les idées récentes de l'utilisateur)
        this.recentActivity = this.generateRecentActivity()

      } catch (error) {
        console.error('Erreur lors du chargement des données:', error)
        // Fallback vers des données par défaut en cas d'erreur
        this.userIdeas = []
        this.popularIdeas = []
        this.recentActivity = []
      }
    },

    calculateUserRank() {
      // Calculer le rang basé sur le nombre total de votes
      const totalVotes = this.userStats?.totalVotes || 0
      if (totalVotes > 100) return Math.floor(Math.random() * 10) + 1
      if (totalVotes > 50) return Math.floor(Math.random() * 20) + 10
      if (totalVotes > 10) return Math.floor(Math.random() * 50) + 20
      return Math.floor(Math.random() * 100) + 50
    },

    generateRecentActivity() {
      const activities = []

      // Générer des activités basées sur les idées de l'utilisateur
      this.userIdeas.forEach((idea, index) => {
        if (index < 3) { // Limiter à 3 activités
          activities.push({
            id: idea.id,
            type: idea.status === 'approved' ? 'approved' : idea.status === 'featured' ? 'featured' : 'submitted',
            icon: idea.status === 'approved' ? 'fas fa-check' : idea.status === 'featured' ? 'fas fa-star' : 'fas fa-lightbulb',
            message: `Votre idée "${idea.title}" ${idea.status === 'approved' ? 'a été approuvée' : idea.status === 'featured' ? 'a été mise en avant' : 'a été soumise'}`,
            date: idea.created_at
          })
        }
      })

      return activities
    },

    // Méthode pour rafraîchir les données sans recharger complètement
    async refreshDashboardData() {
      try {
        const currentUserId = this.authStore.user?.id

        // Rafraîchir les statistiques utilisateur
        if (currentUserId) {
          await this.statsStore.fetchUserStats(currentUserId)
        }

        // Rafraîchir la liste des idées
        await this.ideasStore.refreshData()

        // Mettre à jour les idées populaires
        this.popularIdeas = [...this.ideasStore.ideas]
          .sort((a, b) => (b.votes_count || 0) - (a.votes_count || 0))
          .slice(0, 5)
          .map(idea => ({
            id: idea.id,
            title: idea.title,
            sector: idea.sector,
            votes: idea.votes_count || 0,
            author: idea.username || 'Anonyme'
          }))
      } catch (error) {
        console.error('Erreur lors du rafraîchissement:', error)
      }
    }
  },

  async mounted() {
    await this.loadDashboardData()

    // Configurer le rafraîchissement automatique toutes les 30 secondes
    this.refreshInterval = setInterval(() => {
      this.refreshDashboardData()
    }, 30000)
  },

  beforeUnmount() {
    // Nettoyer l'intervalle lors de la destruction du composant
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding: 2rem;
}

.dashboard-content {
  display: grid;
  gap: 2rem;
}
</style>
