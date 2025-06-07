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
    <div class="development-stats">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-rocket"></i>
        </div>
        <div class="stat-content">
          <h3>{{ developmentIdeas.length }}</h3>
          <p>Idées en développement</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="stat-content">
          <h3>{{ completedIdeas.length }}</h3>
          <p>Projets terminés</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-content">
          <h3>{{ averageDevelopmentTime }}</h3>
          <p>Temps moyen de développement</p>
        </div>
      </div>
    </div>

    <!-- Filtres -->
    <div class="filters-section">
      <div class="filter-group">
        <label>
          <i class="fas fa-filter"></i>
          Statut de développement
        </label>
        <select v-model="selectedStatus" @change="filterIdeas" class="filter-select">
          <option value="all">Tous les statuts</option>
          <option value="planning">Planification</option>
          <option value="development">En développement</option>
          <option value="testing">Tests</option>
          <option value="completed">Terminé</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>
          <i class="fas fa-sort"></i>
          Trier par
        </label>
        <select v-model="sortBy" @change="filterIdeas" class="filter-select">
          <option value="progress">Progression</option>
          <option value="votes">Popularité</option>
          <option value="start_date">Date de début</option>
        </select>
      </div>
    </div>

    <!-- Chargement -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Chargement des projets en développement...</p>
      </div>
    </div>

    <!-- Liste des idées en développement -->
    <div v-else-if="filteredIdeas.length > 0" class="development-grid">
      <div 
        v-for="idea in filteredIdeas" 
        :key="idea.id" 
        class="development-card"
      >
        <!-- En-tête de la carte -->
        <div class="card-header">
          <div class="idea-info">
            <h3 class="idea-title">{{ idea.title }}</h3>
            <p class="idea-sector">
              <i class="fas fa-tag"></i>
              {{ idea.sector }}
            </p>
          </div>
          <div class="status-badge" :class="idea.development_status">
            <i :class="getStatusIcon(idea.development_status)"></i>
            {{ getStatusText(idea.development_status) }}
          </div>
        </div>

        <!-- Progression -->
        <div class="progress-section">
          <div class="progress-header">
            <span class="progress-label">Progression</span>
            <span class="progress-percentage">{{ idea.progress }}%</span>
          </div>
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: idea.progress + '%' }"
              :class="getProgressClass(idea.progress)"
            ></div>
          </div>
        </div>

        <!-- Métriques -->
        <div class="metrics-section">
          <div class="metric">
            <i class="fas fa-thumbs-up"></i>
            <span>{{ idea.votes_count }} votes</span>
          </div>
          <div class="metric">
            <i class="fas fa-calendar-alt"></i>
            <span>Début: {{ formatDate(idea.development_start_date) }}</span>
          </div>
          <div class="metric" v-if="idea.estimated_completion">
            <i class="fas fa-flag-checkered"></i>
            <span>Fin prévue: {{ formatDate(idea.estimated_completion) }}</span>
          </div>
        </div>

        <!-- Description du développement -->
        <div class="development-description">
          <h4>
            <i class="fas fa-info-circle"></i>
            État du développement
          </h4>
          <p>{{ idea.development_notes || 'Aucune information disponible sur l\'état du développement.' }}</p>
        </div>

        <!-- Équipe de développement -->
        <div v-if="idea.development_team" class="team-section">
          <h4>
            <i class="fas fa-users"></i>
            Équipe de développement
          </h4>
          <div class="team-members">
            <div 
              v-for="member in idea.development_team" 
              :key="member.id"
              class="team-member"
            >
              <div class="member-avatar">
                <i class="fas fa-user"></i>
              </div>
              <div class="member-info">
                <span class="member-name">{{ member.name }}</span>
                <span class="member-role">{{ member.role }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="card-actions">
          <button @click="viewIdea(idea.id)" class="btn-view">
            <i class="fas fa-eye"></i>
            Voir l'idée
          </button>
          <button @click="viewProgress(idea.id)" class="btn-progress">
            <i class="fas fa-chart-line"></i>
            Suivi détaillé
          </button>
        </div>
      </div>
    </div>

    <!-- Aucune idée en développement -->
    <div v-else class="no-development">
      <div class="no-development-content">
        <i class="fas fa-tools"></i>
        <h3>Aucune idée en développement</h3>
        <p>Il n'y a actuellement aucune idée qui correspond à vos critères de filtrage.</p>
        <router-link to="/all-ideas" class="btn-primary">
          <i class="fas fa-lightbulb"></i>
          Découvrir toutes les idées
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useIdeasStore } from '../store'

export default {
  name: 'IdeasInDevelopment',
  setup() {
    const router = useRouter()
    const ideasStore = useIdeasStore()

    const loading = ref(false)
    const selectedStatus = ref('all')
    const sortBy = ref('progress')

    // Données réelles depuis l'API
    const developmentIdeas = ref([
      {
        id: 1,
        title: 'Application de covoiturage écologique',
        sector: 'Transport',
        development_status: 'development',
        progress: 65,
        votes_count: 234,
        development_start_date: '2024-01-15',
        estimated_completion: '2024-06-15',
        development_notes: 'Développement de l\'interface utilisateur en cours. Les fonctionnalités de base sont implémentées.',
        development_team: [
          { id: 1, name: 'Marie Dubois', role: 'Chef de projet' },
          { id: 2, name: 'Pierre Martin', role: 'Développeur' },
          { id: 3, name: 'Sophie Leroy', role: 'Designer UX' }
        ]
      },
      {
        id: 2,
        title: 'Plateforme d\'agriculture urbaine',
        sector: 'Agriculture',
        development_status: 'testing',
        progress: 85,
        votes_count: 189,
        development_start_date: '2023-11-01',
        estimated_completion: '2024-03-01',
        development_notes: 'Phase de tests utilisateurs en cours. Corrections mineures à apporter.',
        development_team: [
          { id: 4, name: 'Jean Dupont', role: 'Développeur senior' },
          { id: 5, name: 'Alice Bernard', role: 'Testeur QA' }
        ]
      },
      {
        id: 3,
        title: 'Système de télémédecine rural',
        sector: 'Santé',
        development_status: 'planning',
        progress: 25,
        votes_count: 156,
        development_start_date: '2024-02-01',
        estimated_completion: '2024-08-01',
        development_notes: 'Phase de planification et d\'analyse des besoins. Recherche de partenaires médicaux.',
        development_team: [
          { id: 6, name: 'Dr. Claire Moreau', role: 'Consultant médical' },
          { id: 7, name: 'Thomas Petit', role: 'Analyste' }
        ]
      }
    ])

    const completedIdeas = ref([
      { id: 4, title: 'App de recyclage intelligent' },
      { id: 5, title: 'Plateforme d\'échange de compétences' }
    ])

    const filteredIdeas = computed(() => {
      let ideas = [...developmentIdeas.value]
      
      // Filtrer par statut
      if (selectedStatus.value !== 'all') {
        ideas = ideas.filter(idea => idea.development_status === selectedStatus.value)
      }
      
      // Trier
      ideas.sort((a, b) => {
        switch (sortBy.value) {
          case 'progress':
            return b.progress - a.progress
          case 'votes':
            return b.votes_count - a.votes_count
          case 'start_date':
            return new Date(b.development_start_date) - new Date(a.development_start_date)
          default:
            return 0
        }
      })
      
      return ideas
    })

    const averageDevelopmentTime = computed(() => {
      // Calcul simulé
      return '4.2 mois'
    })

    const getStatusIcon = (status) => {
      const icons = {
        planning: 'fas fa-clipboard-list',
        development: 'fas fa-code',
        testing: 'fas fa-vial',
        completed: 'fas fa-check-circle'
      }
      return icons[status] || 'fas fa-question-circle'
    }

    const getStatusText = (status) => {
      const texts = {
        planning: 'Planification',
        development: 'En développement',
        testing: 'Tests',
        completed: 'Terminé'
      }
      return texts[status] || status
    }

    const getProgressClass = (progress) => {
      if (progress >= 80) return 'high'
      if (progress >= 50) return 'medium'
      return 'low'
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    }

    const viewIdea = (ideaId) => {
      router.push(`/idea/${ideaId}`)
    }

    const viewProgress = (ideaId) => {
      // TODO: Implémenter la vue de suivi détaillé
      console.log('View progress for idea:', ideaId)
    }

    const fetchDevelopmentIdeas = async () => {
      loading.value = true
      try {
        const response = await ideasStore.fetchIdeasInDevelopment({
          status: selectedStatus.value,
          sort: sortBy.value
        })

        if (response.success) {
          developmentIdeas.value = response.data.ideas || []
        }
      } catch (error) {
        console.error('Erreur lors du chargement des idées en développement:', error)
      } finally {
        loading.value = false
      }
    }

    const filterIdeas = () => {
      fetchDevelopmentIdeas()
    }

    onMounted(() => {
      fetchDevelopmentIdeas()
    })

    return {
      loading,
      selectedStatus,
      sortBy,
      developmentIdeas,
      completedIdeas,
      filteredIdeas,
      averageDevelopmentTime,
      filterIdeas,
      getStatusIcon,
      getStatusText,
      getProgressClass,
      formatDate,
      viewIdea,
      viewProgress
    }
  }
}
</script>

<style scoped>
.ideas-in-development {
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

/* Statistiques de développement */
.development-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.stat-content h3 {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.25rem;
}

.stat-content p {
  color: #718096;
  font-size: 0.9rem;
}

/* Section des filtres */
.filters-section {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 200px;
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

/* Grille de développement */
.development-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.development-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.development-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  border-color: #667eea;
}

/* En-tête de carte */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.idea-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.5rem;
  line-height: 1.3;
}

.idea-sector {
  color: #667eea;
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
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

/* Section de progression */
.progress-section {
  margin-bottom: 1.5rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.progress-label {
  font-weight: 600;
  color: #2d3748;
  font-size: 0.9rem;
}

.progress-percentage {
  font-weight: 700;
  color: #667eea;
  font-size: 0.9rem;
}

.progress-bar {
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-fill.low {
  background: linear-gradient(135deg, #f56565, #e53e3e);
}

.progress-fill.medium {
  background: linear-gradient(135deg, #ed8936, #dd6b20);
}

.progress-fill.high {
  background: linear-gradient(135deg, #48bb78, #38a169);
}

/* Section des métriques */
.metrics-section {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
}

.metric {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4a5568;
  font-size: 0.85rem;
  font-weight: 500;
}

.metric i {
  color: #667eea;
}

/* Description du développement */
.development-description {
  margin-bottom: 1.5rem;
}

.development-description h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.development-description p {
  color: #718096;
  line-height: 1.6;
  font-size: 0.9rem;
}

/* Section équipe */
.team-section {
  margin-bottom: 1.5rem;
}

.team-section h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.team-members {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.team-member {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.member-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.9rem;
}

.member-info {
  display: flex;
  flex-direction: column;
}

.member-name {
  font-weight: 600;
  color: #2d3748;
  font-size: 0.9rem;
}

.member-role {
  color: #718096;
  font-size: 0.8rem;
}

/* Actions de carte */
.card-actions {
  display: flex;
  gap: 1rem;
  justify-content: space-between;
}

.btn-view, .btn-progress {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.btn-view {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-view:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
}

.btn-progress {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.btn-progress:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* Aucune idée en développement */
.no-development {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.no-development-content {
  text-align: center;
  max-width: 400px;
}

.no-development-content i {
  font-size: 4rem;
  color: #cbd5e0;
  margin-bottom: 1.5rem;
}

.no-development-content h3 {
  font-size: 1.5rem;
  color: #2d3748;
  margin-bottom: 1rem;
}

.no-development-content p {
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
  text-decoration: none;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .ideas-in-development {
    padding: 1rem;
  }

  .page-header h1 {
    font-size: 2rem;
  }

  .development-stats {
    grid-template-columns: 1fr;
  }

  .filters-section {
    flex-direction: column;
  }

  .filter-group {
    min-width: auto;
  }

  .development-grid {
    grid-template-columns: 1fr;
  }

  .metrics-section {
    flex-direction: column;
    gap: 0.5rem;
  }

  .team-members {
    flex-direction: column;
  }

  .card-actions {
    flex-direction: column;
  }
}
</style>
