<template>
  <div class="candle-stick-chart">
    <div class="chart-header">
      <div class="chart-info">
        <h3>{{ symbol }} - {{ timeframe }}</h3>
        <div class="price-info">
          <span class="current-price">{{ currentPrice }}</span>
          <span class="price-change" :class="changeClass">{{ priceChange }} ({{ priceChangePercent }}%)</span>
        </div>
      </div>
      <div class="chart-controls">
        <button
          v-for="indicator in availableIndicators"
          :key="indicator"
          :class="['indicator-btn', { active: activeIndicators.includes(indicator) }]"
          @click="toggleIndicator(indicator)"
        >
          {{ indicator }}
        </button>
      </div>
    </div>
    <div ref="chartContainer" class="chart-container"></div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'CandleStickChart',
  props: {
    symbol: {
      type: String,
      required: true
    },
    timeframe: {
      type: String,
      default: '1h'
    }
  },
  emits: ['chart-ready'],
  setup(props, { emit }) {
    const store = useStore()
    const chartContainer = ref(null)
    const chart = ref(null)
    
    const currentPrice = ref(0)
    const priceChange = ref(0)
    const priceChangePercent = ref(0)
    const activeIndicators = ref(['MA', 'Volume'])
    
    const availableIndicators = ['MA', 'EMA', 'BB', 'RSI', 'MACD', 'Volume']
    const changeClass = ref('positive')

    // Initialize chart
    const initChart = async () => {
      if (!chartContainer.value) return
      
      // Load chart data
      const chartData = await store.dispatch('trading/fetchChartData', {
        symbol: props.symbol,
        timeframe: props.timeframe
      })
      
      // Initialize trading view chart
      // This would integrate with TradingView widget or Chart.js in real implementation
      console.log('Initializing chart with data:', chartData)
      
      currentPrice.value = chartData.currentPrice
      priceChange.value = chartData.priceChange
      priceChangePercent.value = chartData.priceChangePercent
      changeClass.value = priceChange.value >= 0 ? 'positive' : 'negative'
      
      emit('chart-ready', chart.value)
    }

    const toggleIndicator = (indicator) => {
      const index = activeIndicators.value.indexOf(indicator)
      if (index > -1) {
        activeIndicators.value.splice(index, 1)
      } else {
        activeIndicators.value.push(indicator)
      }
      updateChart()
    }

    const updateChart = () => {
      if (chart.value) {
        // Update chart with new indicators
        console.log('Updating chart with indicators:', activeIndicators.value)
      }
    }

    // Watchers
    watch(() => props.symbol, initChart)
    watch(() => props.timeframe, initChart)

    // Lifecycle
    onMounted(initChart)
    onUnmounted(() => {
      if (chart.value) {
        // Cleanup chart
      }
    })

    return {
      chartContainer,
      currentPrice,
      priceChange,
      priceChangePercent,
      changeClass,
      activeIndicators,
      availableIndicators,
      toggleIndicator
    }
  }
}
</script>

<style scoped>
.candle-stick-chart {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-card);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.chart-info h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--font-size-lg);
}

.price-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xs);
}

.current-price {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--text-primary);
}

.price-change {
  font-size: var(--font-size-sm);
  font-weight: 600;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 4px;
}

.price-change.positive {
  background: rgba(76, 175, 80, 0.2);
  color: var(--success-color);
}

.price-change.negative {
  background: rgba(244, 67, 54, 0.2);
  color: var(--error-color);
}

.chart-controls {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.indicator-btn {
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-secondary);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: var(--font-size-xs);
}

.indicator-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.indicator-btn.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.chart-container {
  flex: 1;
  min-height: 400px;
  position: relative;
}
</style>
