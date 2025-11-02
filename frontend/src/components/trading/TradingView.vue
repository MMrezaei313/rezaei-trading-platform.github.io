<template>
  <div class="trading-view">
    <div class="view-header">
      <h1>نمای معاملاتی</h1>
      <div class="market-selector">
        <select v-model="selectedSymbol" class="symbol-select">
          <option v-for="symbol in availableSymbols" :key="symbol" :value="symbol">
            {{ symbol }}
          </option>
        </select>
        <select v-model="selectedTimeframe" class="timeframe-select">
          <option v-for="tf in timeframes" :key="tf" :value="tf">
            {{ tf }}
          </option>
        </select>
      </div>
    </div>

    <div class="trading-layout">
      <!-- Chart Section -->
      <div class="chart-section">
        <CandleStickChart 
          :symbol="selectedSymbol"
          :timeframe="selectedTimeframe"
          @chart-ready="onChartReady"
        />
      </div>

      <!-- Order Panel -->
      <div class="order-panel">
        <div class="price-info">
          <div class="current-price">
            <span class="price">{{ currentPrice }}</span>
            <span class="change" :class="priceChange >= 0 ? 'positive' : 'negative'">
              {{ priceChange }} ({{ priceChangePercent }}%)
            </span>
          </div>
          <div class="market-stats">
            <div class="stat">
              <span>بالاترین:</span>
              <span class="value">{{ marketData.high }}</span>
            </div>
            <div class="stat">
              <span>پایین‌ترین:</span>
              <span class="value">{{ marketData.low }}</span>
            </div>
            <div class="stat">
              <span>حجم:</span>
              <span class="value">{{ marketData.volume }}</span>
            </div>
          </div>
        </div>

        <QuickOrderForm 
          :symbol="selectedSymbol"
          :current-price="currentPrice"
          @order-created="onOrderCreated"
        />
      </div>

      <!-- Order Book -->
      <div class="orderbook-section">
        <OrderBook :symbol="selectedSymbol" />
      </div>

      <!-- Recent Trades -->
      <div class="trades-section">
        <TradeHistory :symbol="selectedSymbol" />
      </div>
    </div>

    <!-- Trading Terminal -->
    <div class="terminal-section">
      <TradingTerminal 
        :symbol="selectedSymbol"
        :orders="activeOrders"
        @order-updated="refreshOrders"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import { useToast } from 'vue-toastification'
import CandleStickChart from '@/components/charts/CandleStickChart.vue'
import QuickOrderForm from '@/components/trading/QuickOrderForm.vue'
import OrderBook from '@/components/trading/OrderBook.vue'
import TradeHistory from '@/components/trading/TradeHistory.vue'
import TradingTerminal from '@/components/trading/TradingTerminal.vue'

export default {
  name: 'TradingView',
  components: {
    CandleStickChart,
    QuickOrderForm,
    OrderBook,
    TradeHistory,
    TradingTerminal
  },
  setup() {
    const store = useStore()
    const toast = useToast()

    const selectedSymbol = ref('BTC-USDT')
    const selectedTimeframe = ref('1h')
    const currentPrice = ref(0)
    const priceChange = ref(0)
    const priceChangePercent = ref(0)

    const timeframes = ['1m', '5m', '15m', '1h', '4h', '1d', '1w']

    // Computed properties
    const availableSymbols = computed(() => store.getters['trading/availableSymbols'])
    const activeOrders = computed(() => store.getters['trading/activeOrders'])
    const marketData = computed(() => store.getters['trading/marketData'](selectedSymbol.value))

    // Methods
    const onChartReady = (chart) => {
      console.log('Chart ready:', chart)
    }

    const onOrderCreated = (order) => {
      toast.success(`سفارش ${order.side === 'BUY' ? 'خرید' : 'فروش'} ثبت شد`)
      refreshOrders()
    }

    const refreshOrders = async () => {
      try {
        await store.dispatch('trading/fetchActiveOrders')
      } catch (error) {
        toast.error('خطا در بروزرسانی سفارشات')
      }
    }

    // Watch for symbol changes
    watch(selectedSymbol, async (newSymbol) => {
      try {
        await store.dispatch('trading/fetchMarketData', newSymbol)
        const data = marketData.value
        currentPrice.value = data.lastPrice
        priceChange.value = data.change
        priceChangePercent.value = data.changePercent
      } catch (error) {
        toast.error('خطا در دریافت اطلاعات بازار')
      }
    })

    onMounted(async () => {
      await Promise.all([
        store.dispatch('trading/fetchAvailableSymbols'),
        store.dispatch('trading/fetchMarketData', selectedSymbol.value),
        refreshOrders()
      ])
    })

    return {
      selectedSymbol,
      selectedTimeframe,
      currentPrice,
      priceChange,
      priceChangePercent,
      timeframes,
      availableSymbols,
      activeOrders,
      marketData,
      onChartReady,
      onOrderCreated,
      refreshOrders
    }
  }
}
</script>

<style scoped>
.trading-view {
  padding: var(--spacing-lg);
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.view-header h1 {
  color: var(--text-primary);
  margin-bottom: 0;
}

.market-selector {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
}

.symbol-select,
.timeframe-select {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  min-width: 120px;
}

.trading-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  grid-template-rows: 1fr 200px;
  gap: var(--spacing-lg);
  grid-template-areas: 
    "chart order"
    "orderbook trades";
  flex: 1;
  min-height: 0;
}

.chart-section {
  grid-area: chart;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

.order-panel {
  grid-area: order;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
}

.orderbook-section {
  grid-area: orderbook;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

.trades-section {
  grid-area: trades;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

.terminal-section {
  margin-top: var(--spacing-lg);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

.price-info {
  margin-bottom: var(--spacing-lg);
}

.current-price {
  text-align: center;
  margin-bottom: var(--spacing-md);
}

.price {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--text-primary);
  display: block;
}

.change {
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.change.positive {
  color: var(--success-color);
}

.change.negative {
  color: var(--error-color);
}

.market-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-sm);
}

.stat {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}

.stat .value {
  color: var(--text-primary);
  font-weight: 600;
}

@media (max-width: 1200px) {
  .trading-layout {
    grid-template-columns: 1fr;
    grid-template-rows: 400px 300px 200px 200px;
    grid-template-areas: 
      "chart"
      "order"
      "orderbook"
      "trades";
  }
}

@media (max-width: 768px) {
  .trading-view {
    padding: var(--spacing-md);
  }
  
  .view-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .market-selector {
    width: 100%;
    justify-content: space-between;
  }
  
  .symbol-select,
  .timeframe-select {
    flex: 1;
  }
}
</style>
