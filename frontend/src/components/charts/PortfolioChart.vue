<template>
  <div class="portfolio-chart">
    <div class="chart-header">
      <h3>عملکرد پرتفوی</h3>
      <div class="chart-legend">
        <div class="legend-item">
          <span class="legend-color initial"></span>
          <span>سرمایه اولیه</span>
        </div>
        <div class="legend-item">
          <span class="legend-color current"></span>
          <span>ارزش فعلی</span>
        </div>
      </div>
    </div>
    <div ref="chartCanvas" class="chart-canvas"></div>
    <div class="chart-stats">
      <div class="stat">
        <span class="label">سود/زیان کل:</span>
        <span class="value" :class="totalProfitLoss >= 0 ? 'positive' : 'negative'">
          {{ formatCurrency(totalProfitLoss) }}
        </span>
      </div>
      <div class="stat">
        <span class="label">درصد سود:</span>
        <span class="value" :class="profitPercent >= 0 ? 'positive' : 'negative'">
          {{ profitPercent.toFixed(2) }}%
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'PortfolioChart',
  props: {
    period: {
      type: String,
      default: '7d'
    }
  },
  setup(props) {
    const store = useStore()
    const chartCanvas = ref(null)
    const chart = ref(null)
    
    const portfolioData = ref([])
    const totalProfitLoss = ref(0)
    const profitPercent = ref(0)

    const loadPortfolioData = async () => {
      try {
        const data = await store.dispatch('portfolio/fetchPerformance', props.period)
        portfolioData.value = data.history
        totalProfitLoss.value = data.totalProfitLoss
        profitPercent.value = data.profitPercent
        renderChart()
      } catch (error) {
        console.error('Error loading portfolio data:', error)
      }
    }

    const renderChart = () => {
      if (!chartCanvas.value) return
      
      // In real implementation, this would use Chart.js or similar
      // For now, we'll create a simple SVG chart
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      svg.setAttribute('width', '100%')
      svg.setAttribute('height', '100%')
      svg.setAttribute('viewBox', '0 0 400 200')
      
      // Clear previous chart
      chartCanvas.value.innerHTML = ''
      chartCanvas.value.appendChild(svg)
      
      // Create sample chart (simplified)
      if (portfolioData.value.length > 0) {
        createLineChart(svg)
      }
    }

    const createLineChart = (svg) => {
      const data = portfolioData.value
      const width = 400
      const height = 200
      const padding = 40
      
      const xScale = (index) => padding + (index * (width - 2 * padding) / (data.length - 1))
      const yScale = (value) => {
        const min = Math.min(...data.map(d => d.value))
        const max = Math.max(...data.map(d => d.value))
        return height - padding - ((value - min) / (max - min)) * (height - 2 * padding)
      }
      
      // Create path for line
      let pathData = `M ${xScale(0)} ${yScale(data[0].value)}`
      for (let i = 1; i < data.length; i++) {
        pathData += ` L ${xScale(i)} ${yScale(data[i].value)}`
      }
      
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      path.setAttribute('d', pathData)
      path.setAttribute('fill', 'none')
      path.setAttribute('stroke', '#2c5aa0')
      path.setAttribute('stroke-width', '2')
      svg.appendChild(path)
      
      // Add initial and final points
      addPoint(svg, xScale(0), yScale(data[0].value), '#94a3b8')
      addPoint(svg, xScale(data.length - 1), yScale(data[data.length - 1].value), '#2c5aa0')
    }

    const addPoint = (svg, x, y, color) => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      circle.setAttribute('cx', x)
      circle.setAttribute('cy', y)
      circle.setAttribute('r', '4')
      circle.setAttribute('fill', color)
      svg.appendChild(circle)
    }

    const formatCurrency = (value) => {
      return new Intl.NumberFormat('fa-IR', {
        style: 'currency',
        currency: 'IRR'
      }).format(value)
    }

    watch(() => props.period, loadPortfolioData)

    onMounted(loadPortfolioData)

    return {
      chartCanvas,
      totalProfitLoss,
      profitPercent,
      formatCurrency
    }
  }
}
</script>

<style scoped>
.portfolio-chart {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-card);
  border-radius: 8px;
  overflow: hidden;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.chart-header h3 {
  margin: 0;
  color: var(--text-primary);
}

.chart-legend {
  display: flex;
  gap: var(--spacing-lg);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.legend-color.initial {
  background: #94a3b8;
}

.legend-color.current {
  background: #2c5aa0;
}

.chart-canvas {
  flex: 1;
  padding: var(--spacing-md);
  min-height: 200px;
}

.chart-stats {
  display: flex;
  justify-content: space-around;
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
}

.stat .label {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}

.stat .value {
  font-size: var(--font-size-lg);
  font-weight: 700;
}

.stat .value.positive {
  color: var(--success-color);
}

.stat .value.negative {
  color: var(--error-color);
}
</style>
