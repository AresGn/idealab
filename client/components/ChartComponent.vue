<template>
  <div class="chart-container">
    <canvas :id="chartId" :width="width" :height="height"></canvas>
  </div>
</template>

<script>
import {
  ChartJS,
  defaultChartOptions,
  barChartOptions,
  lineChartOptions,
  doughnutChartOptions,
  mergeChartOptions
} from '../utils/chartConfig.js'

export default {
  name: 'ChartComponent',
  props: {
    type: {
      type: String,
      required: true,
      validator: (value) => ['bar', 'line', 'doughnut', 'pie'].includes(value)
    },
    data: {
      type: Object,
      required: true
    },
    options: {
      type: Object,
      default: () => ({})
    },
    width: {
      type: Number,
      default: 400
    },
    height: {
      type: Number,
      default: 200
    }
  },
  data() {
    return {
      chart: null,
      chartId: `chart-${Math.random().toString(36).substr(2, 9)}`
    }
  },
  mounted() {
    this.createChart()
  },
  beforeUnmount() {
    if (this.chart) {
      this.chart.destroy()
    }
  },
  watch: {
    data: {
      handler() {
        this.updateChart()
      },
      deep: true
    }
  },
  methods: {
    createChart() {
      try {
        const ctx = document.getElementById(this.chartId)

        if (!ctx) {
          console.error('Canvas element not found:', this.chartId)
          return
        }

        // Sélectionner les options par défaut selon le type de graphique
        let baseOptions = defaultChartOptions
        switch (this.type) {
          case 'bar':
            baseOptions = barChartOptions
            break
          case 'line':
            baseOptions = lineChartOptions
            break
          case 'doughnut':
          case 'pie':
            baseOptions = doughnutChartOptions
            break
          default:
            baseOptions = defaultChartOptions
        }

        const mergedOptions = mergeChartOptions(baseOptions, this.options)

        this.chart = new ChartJS(ctx, {
          type: this.type,
          data: this.data,
          options: mergedOptions
        })

        console.log(`Chart created successfully: ${this.type}`)
      } catch (error) {
        console.error('Error creating chart:', error)
        console.error('Chart type:', this.type)
        console.error('Chart data:', this.data)
      }
    },
    
    updateChart() {
      try {
        if (this.chart) {
          this.chart.data = this.data
          this.chart.update()
        }
      } catch (error) {
        console.error('Error updating chart:', error)
      }
    }
  }
}
</script>

<style scoped>
.chart-container {
  position: relative;
  width: 100%;
  height: 100%;
}

canvas {
  max-width: 100%;
  height: auto;
}
</style>
