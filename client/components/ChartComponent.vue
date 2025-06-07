<template>
  <div class="chart-container">
    <canvas :id="chartId" :width="width" :height="height"></canvas>
  </div>
</template>

<script>
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

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
      const ctx = document.getElementById(this.chartId)
      
      const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: 'white',
            bodyColor: 'white',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1
          }
        }
      }

      const mergedOptions = this.mergeDeep(defaultOptions, this.options)

      this.chart = new ChartJS(ctx, {
        type: this.type,
        data: this.data,
        options: mergedOptions
      })
    },
    
    updateChart() {
      if (this.chart) {
        this.chart.data = this.data
        this.chart.update()
      }
    },
    
    mergeDeep(target, source) {
      const output = Object.assign({}, target)
      if (this.isObject(target) && this.isObject(source)) {
        Object.keys(source).forEach(key => {
          if (this.isObject(source[key])) {
            if (!(key in target))
              Object.assign(output, { [key]: source[key] })
            else
              output[key] = this.mergeDeep(target[key], source[key])
          } else {
            Object.assign(output, { [key]: source[key] })
          }
        })
      }
      return output
    },
    
    isObject(item) {
      return item && typeof item === 'object' && !Array.isArray(item)
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
