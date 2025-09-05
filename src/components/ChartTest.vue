<template>
  <div class="chart-test">
    <h2>Test des Graphiques Chart.js</h2>
    
    <div class="test-section">
      <h3>Graphique en Barres</h3>
      <div class="chart-wrapper">
        <ChartComponent
          type="bar"
          :data="barData"
          :height="300"
        />
      </div>
    </div>
    
    <div class="test-section">
      <h3>Graphique en Ligne</h3>
      <div class="chart-wrapper">
        <ChartComponent
          type="line"
          :data="lineData"
          :height="300"
        />
      </div>
    </div>
    
    <div class="test-section">
      <h3>Graphique en Doughnut</h3>
      <div class="chart-wrapper">
        <ChartComponent
          type="doughnut"
          :data="doughnutData"
          :height="300"
        />
      </div>
    </div>
  </div>
</template>

<script>
import ChartComponent from './ChartComponent.vue'

export default {
  name: 'ChartTest',
  components: {
    ChartComponent
  },
  data() {
    return {
      barData: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
        datasets: [{
          label: 'Votes',
          data: [12, 19, 8, 15, 22, 18],
          backgroundColor: 'rgba(102, 126, 234, 0.8)',
          borderColor: 'rgba(102, 126, 234, 1)',
          borderWidth: 2
        }]
      },
      lineData: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
        datasets: [{
          label: 'Commentaires',
          data: [5, 8, 3, 7, 12, 9],
          backgroundColor: 'rgba(118, 75, 162, 0.2)',
          borderColor: 'rgba(118, 75, 162, 1)',
          borderWidth: 2,
          fill: true
        }]
      },
      doughnutData: {
        labels: ['Transport', 'Éducation', 'Agriculture', 'Santé'],
        datasets: [{
          data: [23, 18, 15, 12],
          backgroundColor: [
            '#667eea',
            '#764ba2',
            '#f093fb',
            '#f5576c'
          ],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      }
    }
  }
}
</script>

<style scoped>
.chart-test {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.test-section {
  margin-bottom: 3rem;
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.test-section h3 {
  margin-bottom: 1rem;
  color: #2d3748;
}

.chart-wrapper {
  height: 300px;
}
</style>
