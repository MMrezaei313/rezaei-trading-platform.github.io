<template>
  <div class="orderbook">
    <div class="orderbook-header">
      <h3>دفتر سفارشات</h3>
      <span class="symbol">{{ symbol }}</span>
    </div>

    <div class="orderbook-content">
      <!-- Asks (Sell Orders) -->
      <div class="order-side asks">
        <div class="side-header">
          <span>فروش</span>
          <span>مقدار</span>
          <span>جمع</span>
        </div>
        <div class="orders-list">
          <div
            v-for="(ask, index) in asks"
            :key="`ask-${index}`"
            class="order-row ask"
            :style="{
              '--depth': `${(ask.total / maxTotal) * 100}%`
            }"
          >
            <span class="price">{{ formatPrice(ask.price) }}</span>
            <span class="amount">{{ formatAmount(ask.amount) }}</span>
            <span class="total">{{ formatAmount(ask.total) }}</span>
          </div>
        </div>
      </div>

      <!-- Spread -->
      <div class="spread">
        <div class="spread-value">
          Spread: {{ spread }}
        </div>
      </div>

      <!-- Bids (Buy Orders) -->
      <div class="order-side bids">
        <div class="side-header">
          <span>خرید</span>
          <span>مقدار</span>
          <span>جمع</span>
        </div>
        <div class="orders-list">
          <div
            v-for="(bid, index) in bids"
            :key="`bid-${index}`"
            class="order-row bid"
            :style="{
              '--depth': `${(bid.total / maxTotal) * 100}%`
            }"
          >
            <span class="price">{{ formatPrice(bid.price) }}</span>
            <span class="amount">{{ formatAmount(bid.amount) }}</span>
            <span class="total">{{ formatAmount(bid.total) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'OrderBook',
  props: {
    symbol: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const store = useStore()

    const orderbook = ref({
      bids: [],
      asks: []
    })

    // Computed properties
    const bids = computed(() => {
      return orderbook.value.bids
        .slice(0, 15)
        .sort((a, b) => b.price - a.price)
    })

    const asks = computed(() => {
      return orderbook.value.asks
        .slice(0, 15)
        .sort((a, b) => a.price - b.price)
    })

    const maxTotal = computed(() => {
      const bidTotals = bids.value.map(b => b.total)
      const askTotals = asks.value.map(a => a.total)
      return Math.max(...bidTotals, ...askTotals)
    })

    const spread = computed(() => {
      if (asks.value.length === 0 || bids.value.length === 0) return '0.00'
      const bestAsk = asks.value[0]?.price
      const bestBid = bids.value[0]?.price
      return (bestAsk - bestBid).toFixed(2)
    })

    // Methods
    const formatPrice = (price) => {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6
      }).format(price)
    }

    const formatAmount = (amount) => {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 4,
        maximumFractionDigits: 8
      }).format(amount)
    }

    const updateOrderbook = (data) => {
      if (data.symbol === props.symbol) {
        orderbook.value = data
      }
    }

    // Lifecycle
    onMounted(() => {
      store.dispatch('trading/subscribeOrderbook', props.symbol)
      // In real app, this would be through WebSocket
      // For now, we'll simulate with static data
      simulateOrderbookData()
    })

    onUnmounted(() => {
      store.dispatch('trading/unsubscribeOrderbook', props.symbol)
    })

    // Simulate orderbook data (replace with real WebSocket)
    const simulateOrderbookData = () => {
      const basePrice = 50000
      const newBids = []
      const newAsks = []

      for (let i = 0; i < 20; i++) {
        const bidPrice = basePrice - (i * 10)
        const bidAmount = Math.random() * 2
        newBids.push({
          price: bidPrice,
          amount: bidAmount,
          total: newBids.reduce((sum, b) => sum + b.amount, 0) + bidAmount
        })

        const askPrice = basePrice + (i * 10)
        const askAmount = Math.random() * 2
        newAsks.push({
          price: askPrice,
          amount: askAmount,
          total: newAsks.reduce((sum, a) => sum + a.amount, 0) + askAmount
        })
      }

      orderbook.value = {
        bids: newBids,
        asks: newAsks
      }
    }

    return {
      bids,
      asks,
      maxTotal,
      spread,
      formatPrice,
      formatAmount
    }
  }
}
</script>

<style scoped>
.orderbook {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-card);
}

.orderbook-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.orderbook-header h3 {
  margin-bottom: 0;
  color: var(--text-primary);
  font-size: var(--font-size-base);
}

.symbol {
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}

.orderbook-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.order-side {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.side-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  font-weight: 600;
}

.orders-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.order-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  padding: var(--spacing-xs) var(--spacing-md);
  font-size: var(--font-size-xs);
  font-family: 'Courier New', monospace;
  position: relative;
  transition: background-color 0.2s ease;
}

.order-row:hover {
  background: rgba(255, 255, 255, 0.05);
}

.order-row::before {
  content: '';
  position: absolute;
  top: 0;
  height: 100%;
  opacity: 0.1;
  transition: opacity 0.2s ease;
}

.order-row.ask::before {
  right: 0;
  width: var(--depth);
  background: var(--error-color);
}

.order-row.bid::before {
  left: 0;
  width: var(--depth);
  background: var(--success-color);
}

.order-row:hover::before {
  opacity: 0.2;
}

.order-row.ask .price {
  color: var(--error-color);
}

.order-row.bid .price {
  color: var(--success-color);
}

.order-row .amount,
.order-row .total {
  color: var(--text-secondary);
  text-align: center;
}

.spread {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  text-align: center;
}

.spread-value {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  font-weight: 600;
}

/* Custom scrollbar for orderbook */
.orders-list::-webkit-scrollbar {
  width: 4px;
}

.orders-list::-webkit-scrollbar-track {
  background: transparent;
}

.orders-list::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 2px;
}

.orders-list::-webkit-scrollbar-thumb:hover {
  background: var(--border-light);
}

@media (max-width: 768px) {
  .orderbook-header {
    padding: var(--spacing-sm);
  }
  
  .side-header,
  .order-row {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: 0.7rem;
  }
  
  .spread {
    padding: var(--spacing-xs) var(--spacing-sm);
  }
}
</style>
