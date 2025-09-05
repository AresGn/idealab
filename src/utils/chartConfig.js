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
  Filler,
  BarController,
  LineController,
  DoughnutController,
  PieController
} from 'chart.js'

// Enregistrer tous les composants Chart.js nécessaires une seule fois
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
  Filler,
  BarController,
  LineController,
  DoughnutController,
  PieController
)

// Configuration par défaut pour tous les graphiques
export const defaultChartOptions = {
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

// Options spécifiques pour les graphiques en barres
export const barChartOptions = {
  ...defaultChartOptions,
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.1)'
      }
    },
    x: {
      grid: {
        color: 'rgba(0, 0, 0, 0.1)'
      }
    }
  }
}

// Options spécifiques pour les graphiques en ligne
export const lineChartOptions = {
  ...defaultChartOptions,
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.1)'
      }
    },
    x: {
      grid: {
        color: 'rgba(0, 0, 0, 0.1)'
      }
    }
  },
  elements: {
    line: {
      tension: 0.4
    }
  }
}

// Options spécifiques pour les graphiques en doughnut/pie
export const doughnutChartOptions = {
  ...defaultChartOptions,
  plugins: {
    ...defaultChartOptions.plugins,
    legend: {
      position: 'bottom',
    }
  }
}

// Fonction utilitaire pour fusionner les options
export function mergeChartOptions(defaultOptions, customOptions) {
  return mergeDeep(defaultOptions, customOptions)
}

// Fonction utilitaire pour fusionner profondément les objets
function mergeDeep(target, source) {
  const output = Object.assign({}, target)
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target))
          Object.assign(output, { [key]: source[key] })
        else
          output[key] = mergeDeep(target[key], source[key])
      } else {
        Object.assign(output, { [key]: source[key] })
      }
    })
  }
  return output
}

function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item)
}

export { ChartJS }
