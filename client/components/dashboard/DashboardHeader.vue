<template>
  <div class="dashboard-header">
    <div class="header-content">
      <div class="header-text">
        <h1>
          <i class="fas fa-chart-line"></i>
          Tableau de Bord
        </h1>
        <p>Gérez vos idées et suivez vos performances</p>
      </div>
      <div class="header-actions">
        <router-link to="/submit" class="btn btn-primary">
          <i class="fas fa-plus"></i>
          Nouvelle idée
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DashboardHeader'
}
</script>

<style scoped>
.dashboard-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 16px;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.header-text h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-text p {
  opacity: 0.9;
  font-size: 1.1rem;
}

.header-actions .btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.header-actions .btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .dashboard-header {
    padding: 1.5rem;
  }
  
  .header-text h1 {
    font-size: 1.5rem;
  }
}
</style>
