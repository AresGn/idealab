<template>
  <div class="stats-overview">
    <div class="stat-card">
      <div class="stat-icon ideas">
        <i class="fas fa-lightbulb"></i>
      </div>
      <div class="stat-content">
        <h3>{{ stats.ideas_submitted || stats.ideasSubmitted || 0 }}</h3>
        <p>Idées soumises</p>
        <span :class="['stat-change', stats.ideas_growth >= 0 ? 'positive' : 'negative']">
          {{ growthTexts.ideas }}
        </span>
      </div>
    </div>
    
    <div class="stat-card">
      <div class="stat-icon votes">
        <i class="fas fa-thumbs-up"></i>
      </div>
      <div class="stat-content">
        <h3>{{ stats.total_votes || stats.totalVotes || 0 }}</h3>
        <p>Votes reçus</p>
        <span :class="['stat-change', stats.votes_growth >= 0 ? 'positive' : 'negative']">
          {{ growthTexts.votes }}
        </span>
      </div>
    </div>
    
    <div class="stat-card">
      <div class="stat-icon comments">
        <i class="fas fa-comments"></i>
      </div>
      <div class="stat-content">
        <h3>{{ stats.total_comments || stats.totalComments || 0 }}</h3>
        <p>Commentaires reçus</p>
        <span :class="['stat-change', stats.comments_growth >= 0 ? 'positive' : 'negative']">
          {{ growthTexts.comments }}
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
          {{ growthTexts.rank }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { useStatsStore } from '@/store'

export default {
  name: 'StatsOverview',
  props: {
    stats: {
      type: Object,
      required: true,
      default: () => ({
        ideasSubmitted: 0,
        totalVotes: 0,
        totalComments: 0,
        rank: 0
      })
    }
  },
  setup() {
    const statsStore = useStatsStore()
    return { statsStore }
  },
  computed: {
    growthTexts() {
      return this.statsStore.growthTexts
    }
  }
}
</script>

<style scoped>
.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
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

.stat-change.negative {
  background: #fed7d7;
  color: #e53e3e;
}

.stat-change.neutral {
  background: #edf2f7;
  color: #4a5568;
}

@media (max-width: 768px) {
  .stats-overview {
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
  .stats-overview {
    grid-template-columns: 1fr;
  }
}
</style>
