<template>
  <div class="home">
    <section class="hero">
      <div class="hero-content">
        <div class="hero-icon">
          <i class="fas fa-globe-africa"></i>
        </div>
        <h1>Plateforme Collaborative d'Idées pour l'Afrique</h1>
        <p class="hero-subtitle">
          Partagez vos idées innovantes, votez pour les meilleures propositions
          et contribuez au développement de solutions adaptées au contexte africain.
        </p>
        <div class="hero-actions">
          <div class="submit-options">
            <router-link to="/submit-design-thinking" class="btn btn-primary btn-featured">
              <i class="fas fa-brain"></i>
              <span>
                <strong>Design Thinking</strong>
                <small>Méthode structurée</small>
              </span>
            </router-link>
            <router-link to="/submit" class="btn btn-primary btn-express">
              <i class="fas fa-lightbulb"></i>
              <span>
                <strong>Mode Express</strong>
                <small>Soumission rapide</small>
              </span>
            </router-link>
          </div>
          <button @click="scrollToIdeas" class="btn btn-secondary btn-uniform">
            <i class="fas fa-eye"></i>
            <span>
              <strong>Voir les idées</strong>
              <small>Explorer la communauté</small>
            </span>
          </button>
        </div>
      </div>
    </section>

    <section class="stats" v-if="stats">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-lightbulb"></i>
        </div>
        <h3>{{ stats.totalIdeas }}</h3>
        <p>Idées soumises</p>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-users"></i>
        </div>
        <h3>{{ stats.totalUsers }}</h3>
        <p>Utilisateurs actifs</p>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-thumbs-up"></i>
        </div>
        <h3>{{ stats.totalVotes }}</h3>
        <p>Votes exprimés</p>
      </div>
    </section>

    <section class="recent-ideas" ref="ideasSection">
      <div class="section-header">
        <i class="fas fa-brain"></i>
        <h2>Idées Récentes</h2>
      </div>
      <div class="ideas-grid" v-if="recentIdeas.length > 0">
        <div
          v-for="idea in recentIdeas"
          :key="idea.id"
          class="idea-card"
          @click="viewIdeaDetails(idea.id)"
        >
          <h3>{{ idea.title }}</h3>
          <p class="idea-sector">{{ idea.sector }}</p>
          <p class="idea-description">{{ truncateText(idea.description, 120) }}</p>
          <div class="idea-author" v-if="idea.first_name || idea.last_name">
            <i class="fas fa-user"></i>
            <span>{{ idea.first_name }} {{ idea.last_name }}</span>
          </div>
          <div class="idea-meta">
            <span class="votes">
              <i class="fas fa-thumbs-up"></i>
              {{ idea.votes_count || 0 }}
            </span>
            <span class="comments">
              <i class="fas fa-comments"></i>
              {{ idea.comments_count || 0 }}
            </span>
            <span class="views">
              <i class="fas fa-eye"></i>
              {{ idea.views_count || 0 }}
            </span>
            <span class="date">
              <i class="fas fa-calendar-alt"></i>
              {{ formatDate(idea.created_at) }}
            </span>
          </div>
          <div class="idea-actions">
            <button @click.stop="voteIdea(idea.id)" class="vote-btn" :class="{ voted: idea.user_voted }">
              <i class="fas fa-thumbs-up"></i>
              {{ idea.user_voted ? 'Voté' : 'Voter' }}
            </button>
            <button @click.stop="viewIdeaDetails(idea.id)" class="view-btn">
              <i class="fas fa-arrow-right"></i>
              Voir plus
            </button>
          </div>
        </div>
      </div>
      <div v-else class="no-ideas">
        <p>Aucune idée pour le moment. Soyez le premier à en soumettre une !</p>
        <router-link to="/submit" class="btn btn-primary">
          Soumettre la première idée
        </router-link>
      </div>
    </section>
  </div>
</template>

<script>
import { api } from '@/store'

export default {
  name: 'Home',
  data() {
    return {
      stats: {
        totalIdeas: 0,
        totalUsers: 0,
        totalVotes: 0
      },
      recentIdeas: []
    }
  },
  computed: {
    isAuthenticated() {
      // Vérifier s'il y a un token dans localStorage ou sessionStorage
      return !!(localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token'))
    }
  },
  methods: {
    scrollToIdeas() {
      this.$refs.ideasSection.scrollIntoView({ behavior: 'smooth' })
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('fr-FR')
    },
    async loadStats() {
      try {
        const response = await api.get('/ideas/stats/overview')
        this.stats = {
          totalIdeas: response.data.total_ideas || 0,
          totalUsers: response.data.total_users || 0,
          totalVotes: response.data.total_votes || 0
        }
        console.log('✅ Stats loaded:', this.stats)
      } catch (error) {
        console.error('❌ Erreur lors du chargement des statistiques:', error)
        // Fallback to zero values if API fails
        this.stats = {
          totalIdeas: 0,
          totalUsers: 0,
          totalVotes: 0
        }
      }
    },
    async loadRecentIdeas() {
      try {
        const response = await api.get('/ideas', {
          params: {
            limit: 6,
            sort: 'created_at',
            order: 'DESC'
          }
        })
        this.recentIdeas = response.data.ideas || []
        console.log('✅ Recent ideas loaded:', this.recentIdeas.length, 'ideas')
      } catch (error) {
        console.error('❌ Erreur lors du chargement des idées récentes:', error)
        this.recentIdeas = []
      }
    },

    viewIdeaDetails(ideaId) {
      this.$router.push(`/idea/${ideaId}`)
    },

    async voteIdea(ideaId) {
      try {
        if (!this.isAuthenticated) {
          this.$router.push('/login')
          return
        }

        await api.post('/votes/regular', {
          idea_id: ideaId,
          vote_type: 'up'
        })

        // Recharger les idées récentes pour mettre à jour les compteurs
        await this.loadRecentIdeas()
      } catch (error) {
        console.error('Erreur lors du vote:', error)
        if (error.response?.status === 401) {
          this.$router.push('/login')
        }
      }
    },

    truncateText(text, maxLength) {
      if (!text) return ''
      if (text.length <= maxLength) return text
      return text.substring(0, maxLength) + '...'
    }
  },
  mounted() {
    this.loadStats()
    this.loadRecentIdeas()
  }
}
</script>

<style scoped>
.hero {
  text-align: center;
  padding: 4rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  margin-bottom: 3rem;
}

.hero h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  font-weight: bold;
}

.hero-subtitle {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-block;
}

.btn-primary {
  background-color: #e74c3c;
  color: white;
}

.btn-primary:hover {
  background-color: #c0392b;
  transform: translateY(-2px);
}

.btn-secondary {
  background-color: transparent;
  color: white;
  border: 2px solid white;
}

.btn-secondary:hover {
  background-color: white;
  color: #667eea;
}

/* Submit Options Styles */
.submit-options {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

/* Styles communs pour tous les boutons uniformes */
.btn-featured,
.btn-express,
.btn-uniform {
  padding: 1rem 1.5rem;
  position: relative;
  overflow: hidden;
  min-width: 200px;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.btn-featured span,
.btn-express span,
.btn-uniform span {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.btn-featured strong,
.btn-express strong,
.btn-uniform strong {
  font-size: 1.1rem;
}

.btn-featured small,
.btn-express small,
.btn-uniform small {
  font-size: 0.8rem;
  opacity: 0.9;
  font-weight: normal;
}

/* Design Thinking - Gradient violet */
.btn-featured {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-featured::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

.btn-featured:hover::before {
  left: 100%;
}

.btn-featured:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

/* Mode Express - Gradient orange */
.btn-express {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
}

.btn-express::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

.btn-express:hover::before {
  left: 100%;
}

.btn-express:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
}

/* Voir les idées - Style outline uniforme */
.btn-uniform {
  background: transparent;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.8);
}

.btn-uniform:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: white;
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(255, 255, 255, 0.2);
}



/* Responsive adjustments */
@media (max-width: 768px) {
  .submit-options {
    flex-direction: column;
    align-items: center;
  }

  .btn-featured,
  .btn-express,
  .btn-uniform {
    width: 100%;
    max-width: 280px;
    min-height: 70px;
  }
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.stat-card h3 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.stat-card p {
  color: #7f8c8d;
  font-weight: 500;
}

/* Section header with brain icon */
.section-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.section-header i {
  font-size: 2rem;
  color: #667eea;
  display: flex;
  align-items: center;
}

.section-header h2 {
  color: #2c3e50;
  margin: 0;
  font-size: 2rem;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.recent-ideas h2 {
  color: #2c3e50;
  margin-bottom: 2rem;
  text-align: center;
}

.ideas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.idea-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: all 0.3s;
  cursor: pointer;
  position: relative;
}

.idea-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.idea-card h3 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.idea-sector {
  color: #e74c3c;
  font-weight: bold;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.idea-description {
  color: #7f8c8d;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.idea-author {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #7f8c8d;
}

.idea-author i {
  color: #95a5a6;
}

.idea-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #95a5a6;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.idea-meta span {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.idea-actions {
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  margin-top: auto;
}

.vote-btn, .view-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.vote-btn {
  background-color: #f8f9fa;
  color: #667eea;
  border: 1px solid #e9ecef;
}

.vote-btn:hover {
  background-color: #667eea;
  color: white;
}

.vote-btn.voted {
  background-color: #667eea;
  color: white;
}

.view-btn {
  background-color: #e74c3c;
  color: white;
  flex: 1;
}

.view-btn:hover {
  background-color: #c0392b;
  transform: translateY(-1px);
}

.no-ideas {
  text-align: center;
  padding: 3rem;
  color: #7f8c8d;
}

.no-ideas p {
  margin-bottom: 2rem;
  font-size: 1.1rem;
}
</style>
