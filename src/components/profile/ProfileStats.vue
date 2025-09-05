<template>
  <div class="profile-stats">
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon ideas">
          <i class="fas fa-lightbulb"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.ideas_count || 0 }}</h3>
          <p>Idées soumises</p>
          <span class="stat-change positive" v-if="stats.ideas_growth > 0">
            +{{ stats.ideas_growth }} ce mois
          </span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon votes">
          <i class="fas fa-thumbs-up"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.total_votes || 0 }}</h3>
          <p>Votes reçus</p>
          <span class="stat-change positive" v-if="stats.votes_growth > 0">
            +{{ stats.votes_growth }} cette semaine
          </span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon comments">
          <i class="fas fa-comments"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.total_comments || 0 }}</h3>
          <p>Commentaires reçus</p>
          <span class="stat-change positive" v-if="stats.comments_growth > 0">
            +{{ stats.comments_growth }} cette semaine
          </span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon rank">
          <i class="fas fa-trophy"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.rank > 0 ? `#${stats.rank}` : 'N/A' }}</h3>
          <p>Classement</p>
          <span class="stat-change neutral">
            {{ getRankText(stats.rank) }}
          </span>
        </div>
      </div>
    </div>
    
    <!-- Graphique de performance -->
    <div class="performance-chart" v-if="chartData.labels.length > 0">
      <h3>
        <i class="fas fa-chart-line"></i>
        Performance mensuelle
      </h3>
      <div class="chart-placeholder">
        <p>📊 Graphique de performance (Chart.js sera intégré prochainement)</p>
      </div>
    </div>

    <!-- Répartition par secteur -->
    <div class="sector-distribution" v-if="sectorData.labels.length > 0">
      <h3>
        <i class="fas fa-chart-pie"></i>
        Répartition par secteur
      </h3>
      <div class="chart-placeholder">
        <p>📊 Graphique de répartition (Chart.js sera intégré prochainement)</p>
      </div>
    </div>
  </div>
</template>

<script>
// import ChartComponent from '../ChartComponent.vue'

export default {
  name: 'ProfileStats',
  components: {
    // ChartComponent
  },
  props: {
    stats: {
      type: Object,
      default: () => ({
        ideas_count: 0,
        total_votes: 0,
        total_comments: 0,
        rank: 0,
        ideas_growth: 0,
        votes_growth: 0,
        comments_growth: 0,
        monthly_trends: []
      })
    },
    userIdeas: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    chartData() {
      if (!this.stats.monthly_trends || this.stats.monthly_trends.length === 0) {
        return { labels: [], datasets: [] }
      }
      
      return {
        labels: this.stats.monthly_trends.map(trend => {
          const date = new Date(trend.month)
          return date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
        }).reverse(),
        datasets: [{
          label: 'Votes reçus',
          data: this.stats.monthly_trends.map(trend => parseInt(trend.votes_received) || 0).reverse(),
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          borderColor: 'rgba(102, 126, 234, 1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4
        }, {
          label: 'Commentaires',
          data: this.stats.monthly_trends.map(trend => parseInt(trend.comments_received) || 0).reverse(),
          backgroundColor: 'rgba(118, 75, 162, 0.1)',
          borderColor: 'rgba(118, 75, 162, 1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4
        }]
      }
    },
    
    sectorData() {
      if (!this.userIdeas || this.userIdeas.length === 0) {
        return { labels: [], datasets: [] }
      }
      
      const sectorCounts = {}
      this.userIdeas.forEach(idea => {
        sectorCounts[idea.sector] = (sectorCounts[idea.sector] || 0) + 1
      })
      
      return {
        labels: Object.keys(sectorCounts),
        datasets: [{
          data: Object.values(sectorCounts),
          backgroundColor: [
            '#667eea', '#764ba2', '#f093fb', '#f5576c',
            '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
            '#ffecd2', '#fcb69f', '#a8edea', '#fed6e3'
          ]
        }]
      }
    }
  },
  methods: {
    getRankText(rank) {
      if (rank === 0) return 'Non classé'
      if (rank <= 10) return 'Top 10'
      if (rank <= 50) return 'Top 50'
      return `Position ${rank}`
    }
  }
}
</script>

<style scoped>
.profile-stats {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  flex-shrink: 0;
}

.stat-icon.ideas {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.stat-icon.votes {
  background: linear-gradient(135deg, #f093fb, #f5576c);
}

.stat-icon.comments {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
}

.stat-icon.rank {
  background: linear-gradient(135deg, #43e97b, #38f9d7);
}

.stat-content h3 {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.25rem;
}

.stat-content p {
  color: #718096;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.stat-change {
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
}

.stat-change.positive {
  background: #f0fff4;
  color: #38a169;
}

.stat-change.neutral {
  background: #edf2f7;
  color: #4a5568;
}

.performance-chart,
.sector-distribution {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
}

.performance-chart h3,
.sector-distribution h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.chart-placeholder {
  padding: 3rem 2rem;
  text-align: center;
  background: #f7fafc;
  border-radius: 8px;
  border: 2px dashed #e2e8f0;
}

.chart-placeholder p {
  color: #718096;
  font-size: 1.125rem;
  margin: 0;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
  
  .stat-card {
    padding: 1rem;
  }
  
  .stat-icon {
    width: 50px;
    height: 50px;
    font-size: 1.25rem;
  }
  
  .stat-content h3 {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
