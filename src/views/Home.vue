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
        >
          <h3>{{ idea.title }}</h3>
          <p class="idea-sector">{{ idea.sector }}</p>
          <p class="idea-description">{{ idea.description }}</p>
          <div class="idea-meta">
            <span class="votes">
              <i class="fas fa-thumbs-up"></i>
              {{ idea.votes }}
            </span>
            <span class="comments">
              <i class="fas fa-comments"></i>
              {{ idea.comments }}
            </span>
            <span class="date">
              <i class="fas fa-calendar-alt"></i>
              {{ formatDate(idea.createdAt) }}
            </span>
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
  methods: {
    scrollToIdeas() {
      this.$refs.ideasSection.scrollIntoView({ behavior: 'smooth' })
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('fr-FR')
    },
    async loadStats() {
      try {
        // TODO: Remplacer par un appel API réel
        this.stats = {
          totalIdeas: 12,
          totalUsers: 45,
          totalVotes: 89
        }
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error)
      }
    },
    async loadRecentIdeas() {
      try {
        // TODO: Remplacer par un appel API réel
        this.recentIdeas = [
          {
            id: 1,
            title: "Application de covoiturage pour zones rurales",
            sector: "Transport",
            description: "Une solution de transport partagé adaptée aux routes africaines...",
            votes: 15,
            comments: 3,
            createdAt: new Date().toISOString()
          },
          {
            id: 2,
            title: "Plateforme d'éducation en langues locales",
            sector: "Éducation",
            description: "Système d'apprentissage utilisant les langues vernaculaires...",
            votes: 23,
            comments: 7,
            createdAt: new Date(Date.now() - 86400000).toISOString()
          }
        ]
      } catch (error) {
        console.error('Erreur lors du chargement des idées:', error)
      }
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
  transition: transform 0.3s;
}

.idea-card:hover {
  transform: translateY(-4px);
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

.idea-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #95a5a6;
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
