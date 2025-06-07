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

export default {
  name: 'Dashboard',
  components: {
    DashboardHeader,
    StatsOverview,
    ChartsSection,
    MyIdeasSection,
    SidePanels
  },
  data() {
    return {
      userStats: {
        ideasSubmitted: 0,
        totalVotes: 0,
        totalComments: 0,
        rank: 0
      },
      userIdeas: [],
      popularIdeas: [],
      recentActivity: [],
      ideasFilter: 'all',
      ideasPerformanceData: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
        datasets: [{
          label: 'Votes reçus',
          data: [12, 19, 8, 15, 22, 18],
          backgroundColor: 'rgba(102, 126, 234, 0.8)',
          borderColor: 'rgba(102, 126, 234, 1)',
          borderWidth: 2
        }, {
          label: 'Commentaires',
          data: [5, 8, 3, 7, 12, 9],
          backgroundColor: 'rgba(118, 75, 162, 0.8)',
          borderColor: 'rgba(118, 75, 162, 1)',
          borderWidth: 2
        }]
      },
      sectorDistributionData: {
        labels: ['Transport', 'Éducation', 'Agriculture', 'Santé', 'Finance', 'Énergie'],
        datasets: [{
          data: [23, 18, 15, 12, 20, 12],
          backgroundColor: [
            '#667eea',
            '#764ba2',
            '#f093fb',
            '#f5576c',
            '#4facfe',
            '#43e97b'
          ],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      }
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
        // Statistiques utilisateur
        this.userStats = {
          ideasSubmitted: 3,
          totalVotes: 47,
          totalComments: 12,
          rank: 15
        }
        
        // Idées de l'utilisateur
        this.userIdeas = [
          {
            id: 1,
            title: "Application de covoiturage rural",
            sector: "Transport",
            votes: 23,
            comments: 5,
            views: 156,
            status: "approved"
          },
          {
            id: 2,
            title: "Plateforme d'éducation locale",
            sector: "Éducation",
            votes: 18,
            comments: 3,
            views: 89,
            status: "featured"
          },
          {
            id: 3,
            title: "Système de paiement mobile",
            sector: "Finance",
            votes: 6,
            comments: 4,
            views: 45,
            status: "pending"
          }
        ]
        
        // Idées populaires
        this.popularIdeas = [
          { id: 1, title: "Marketplace agricole mobile", sector: "Agriculture", votes: 89, author: "Marie K." },
          { id: 2, title: "Télémédecine pour zones rurales", sector: "Santé", votes: 76, author: "Ibrahim T." },
          { id: 3, title: "Énergie solaire communautaire", sector: "Énergie", votes: 65, author: "Fatou D." },
          { id: 4, title: "Éducation numérique", sector: "Éducation", votes: 54, author: "John D." },
          { id: 5, title: "Fintech pour PME", sector: "Finance", votes: 43, author: "Admin" }
        ]
        
        // Activité récente
        this.recentActivity = [
          {
            id: 1,
            type: "vote",
            icon: "fas fa-thumbs-up",
            message: "Votre idée 'Application de covoiturage rural' a reçu 3 nouveaux votes",
            date: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: 2,
            type: "comment",
            icon: "fas fa-comments",
            message: "Nouveau commentaire sur 'Plateforme d'éducation locale'",
            date: new Date(Date.now() - 7200000).toISOString()
          },
          {
            id: 3,
            type: "featured",
            icon: "fas fa-star",
            message: "Votre idée 'Plateforme d'éducation locale' a été mise en avant",
            date: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: 4,
            type: "approved",
            icon: "fas fa-check",
            message: "Votre idée 'Application de covoiturage rural' a été approuvée",
            date: new Date(Date.now() - 172800000).toISOString()
          }
        ]
        
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error)
      }
    }
  },
  
  mounted() {
    this.loadDashboardData()
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
