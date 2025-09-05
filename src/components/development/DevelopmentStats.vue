<template>
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
        <p>Temps moyen</p>
      </div>
    </div>
    
    <div class="stat-card">
      <div class="stat-icon">
        <i class="fas fa-users"></i>
      </div>
      <div class="stat-content">
        <h3>{{ totalDevelopers }}</h3>
        <p>Développeurs impliqués</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DevelopmentStats',
  props: {
    developmentIdeas: {
      type: Array,
      default: () => []
    },
    completedIdeas: {
      type: Array,
      default: () => []
    },
    averageDevelopmentTime: {
      type: String,
      default: '0 mois'
    },
    totalDevelopers: {
      type: Number,
      default: 0
    }
  }
}
</script>

<style scoped>
.development-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
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

.stat-card:nth-child(1) .stat-icon {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.stat-card:nth-child(2) .stat-icon {
  background: linear-gradient(135deg, #43e97b, #38f9d7);
}

.stat-card:nth-child(3) .stat-icon {
  background: linear-gradient(135deg, #f093fb, #f5576c);
}

.stat-card:nth-child(4) .stat-icon {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
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
}

@media (max-width: 768px) {
  .development-stats {
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
</style>
