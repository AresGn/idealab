<template>
  <div class="charts-section">
    <div class="chart-card">
      <div class="chart-header">
        <h3>
          <i class="fas fa-chart-bar"></i>
          Performance de mes idées
        </h3>
      </div>
      <div class="chart-content">
        <ChartComponent
          type="bar"
          :data="performanceData"
          :options="chartOptions.bar"
          :height="300"
        />
      </div>
    </div>
    
    <div class="chart-card">
      <div class="chart-header">
        <h3>
          <i class="fas fa-chart-pie"></i>
          Répartition par secteur
        </h3>
      </div>
      <div class="chart-content">
        <ChartComponent
          type="doughnut"
          :data="sectorData"
          :options="chartOptions.doughnut"
          :height="300"
        />
      </div>
    </div>
  </div>
</template>

<script>
import ChartComponent from '../ChartComponent.vue'

export default {
  name: 'ChartsSection',
  components: {
    ChartComponent
  },
  props: {
    performanceData: {
      type: Object,
      required: true
    },
    sectorData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      chartOptions: {
        bar: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        },
        doughnut: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom',
            },
            title: {
              display: false
            }
          }
        }
      }
    }
  }
}
</script>

<style scoped>
.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.chart-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.chart-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.chart-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.chart-content {
  padding: 1.5rem;
}

@media (max-width: 1024px) {
  .charts-section {
    grid-template-columns: 1fr;
  }
}
</style>
