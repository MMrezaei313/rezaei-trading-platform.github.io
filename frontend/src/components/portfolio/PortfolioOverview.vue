<template>
  <div class="portfolio-overview">
    <div class="overview-header">
      <h2>نمای کلی پرتفوی</h2>
      <div class="portfolio-stats">
        <div class="stat">
          <span class="label">ارزش کل:</span>
          <span class="value">{{ formatCurrency(totalValue) }}</span>
        </div>
        <div class="stat">
          <span class="label">سود/زیان:</span>
          <span class="value" :class="totalProfitLoss >= 0 ? 'positive' : 'negative'">
            {{ formatCurrency(totalProfitLoss) }}
          </span>
        </div>
      </div>
    </div>

    <div class="portfolio-content">
      <!-- Asset Allocation -->
      <div class="allocation-section">
        <h3>توزیع دارایی‌ها</h3>
        <div class="allocation-chart">
          <div ref="pieChart" class="pie-chart"></div>
          <div class="allocation-list">
            <div
              v-for="asset in assetAllocation"
              :key="asset.symbol"
              class="allocation-item"
            >
              <div class="asset-info">
                <span class="asset-symbol">{{ asset.symbol }}</span>
                <span class="asset-name">{{ asset.name }}</span>
              </div>
              <div class="allocation-details">
                <span class="allocation-percent">{{ asset.percentage }}%</span>
                <span class="allocation-value">{{ formatCurrency(asset.value) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Performance Metrics -->
      <div class="metrics-section">
        <h3>معیارهای عملکرد</h3>
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon">📈</div>
            <div class="metric-content">
              <div class="metric-value">{{ dailyReturn.toFixed(2) }}%</div>
              <div class="metric-label">بازده روزانه</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">⚡</div>
            <div class="metric-content">
              <div class="metric-value">{{ sharpeRatio.toFixed(2) }}</div>
              <div class="metric-label">نسبت شارپ</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">📉</div>
            <div class="metric-content">
              <div class="metric-value" :class="maxDrawdown <= 10 ? 'positive' : 'negative'">
                {{ maxDrawdown.toFixed(2) }}%
              </div>
              <div class="metric-label">حداکثر Drawdown</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">🔄</div>
            <div class="metric-content">
              <div class="metric-value">{{ volatility.toFixed(2) }}%</div>
              <div class="metric-label">نوسان</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Transactions -->
      <div class="transactions-section">
        <h3>تراکنش‌های اخیر</h3>
        <div class="transactions-list">
          <div
            v-for="transaction in recentTransactions"
            :key="transaction.id"
            class="transaction-item"
          >
            <div class="transaction-main">
              <div class="transaction-type" :class="transaction.type">
                {{ transaction.type === 'BUY' ? 'خرید' : 'فروش' }}
              </div>
              <div class="transaction-symbol">{{ transaction.symbol }}</div>
              <div class="transaction-amount">{{ transaction.amount }}</div>
              <div class="transaction-price">{{ formatCurrency(transaction.price) }}</div>
            </div>
            <div class="transaction-meta">
              <span class="transaction-date">{{ formatDate(transaction.timestamp) }}</span>
              <span class="transaction-total">{{ formatCurrency(transaction.total) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'PortfolioOverview',
  setup() {
    const store = useStore()
    const pieChart = ref(null)

    const totalValue = ref(0)
    const totalProfitLoss = ref(0)
    const assetAllocation = ref([])
    const dailyReturn = ref(0)
    const sharpeRatio = ref(0)
    const maxDrawdown = ref(0)
    const volatility = ref(0)
    const recentTransactions = ref([])

    const loadPortfolioData = async () => {
      try {
        const portfolio = await store.dispatch('portfolio/fetchOverview')
        
        totalValue.value = portfolio.totalValue
        totalProfitLoss.value = portfolio.totalProfitLoss
        assetAllocation.value = portfolio.assetAllocation
        dailyReturn.value = portfolio.dailyReturn
        sharpeRatio.value = portfolio.sharpeRatio
        maxDrawdown.value = portfolio.maxDrawdown
        volatility.value = portfolio.volatility
        recentTransactions.value = portfolio.recentTransactions

        renderPieChart()
      } catch (error) {
        console.error('Error loading portfolio data:', error)
      }
    }

    const renderPieChart = () => {
      if (!pieChart.value) return

      // Simple SVG pie chart implementation
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      svg.setAttribute('width', '200')
      svg.setAttribute('height', '200')
      svg.setAttribute('viewBox', '0 0 200 200')

      pieChart.value.innerHTML = ''
      pieChart.value.appendChild(svg)

      let currentAngle = 0
      const colors = ['#2c5aa0', '#00d4aa', '#ff6b35', '#ffa726', '#9c27b0']

      assetAllocation.value.forEach((asset, index) => {
        const angle = (asset.percentage / 100) * 360
        const radians = (currentAngle - 90) * Math.PI / 180
        const x = 100 + 80 * Math.cos(radians)
        const y = 100 + 80 * Math.sin(radians)

        const largeArc = angle > 180 ? 1 : 0
        const pathData = `
          M 100 100
          L ${100 + 80 * Math.cos((currentAngle - 90) * Math.PI / 180)} ${100 + 80 * Math.sin((currentAngle - 90) * Math.PI / 180)}
          A 80 80 0 ${largeArc} 1 ${x} ${y}
          Z
        `

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        path.setAttribute('d', pathData)
        path.setAttribute('fill', colors[index % colors.length])
        svg.appendChild(path)

        currentAngle += angle
      })
    }

    const formatCurrency = (value) => {
      return new Intl.NumberFormat('fa-IR', {
        style: 'currency',
        currency: 'IRR'
      }).format(value)
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('fa-IR')
    }

    onMounted(loadPortfolioData)

    return {
      pieChart,
      totalValue,
      totalProfitLoss,
      assetAllocation,
      dailyReturn,
      sharpeRatio,
      maxDrawdown,
      volatility,
      recentTransactions,
      formatCurrency,
      formatDate
    }
  }
}
</script>

<style scoped>
.portfolio-overview {
  padding: var(--spacing-lg);
}

.overview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-2xl);
  flex-wrap: wrap;
  gap: var(--spacing-lg);
}

.overview-header h2 {
  color: var(--text-primary);
  margin: 0;
}

.portfolio-stats {
  display: flex;
  gap: var(--spacing-2xl);
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat .label {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  margin-bottom: var(--spacing-xs);
}

.stat .value {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--text-primary);
}

.stat .value.positive {
  color: var(--success-color);
}

.stat .value.negative {
  color: var(--error-color);
}

.portfolio-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xl);
}

.allocation-section,
.metrics-section,
.transactions-section {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: var(--spacing-lg);
}

.allocation-section h3,
.metrics-section h3,
.transactions-section h3 {
  color: var(--text-primary);
  margin-bottom: var(--spacing-lg);
}

.allocation-chart {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: var(--spacing-lg);
  align-items: start;
}

.pie-chart {
  width: 200px;
  height: 200px;
}

.allocation-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.allocation-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border-radius: 6px;
}

.asset-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.asset-symbol {
  font-weight: 600;
  color: var(--text-primary);
}

.asset-name {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}

.allocation-details {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--spacing-xs);
}

.allocation-percent {
  font-weight: 600;
  color: var(--text-primary);
}

.allocation-value {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-lg);
}

.metric-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--bg-secondary);
  border-radius: 8px;
}

.metric-icon {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  flex-shrink: 0;
}

.metric-content {
  flex: 1;
}

.metric-value {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.metric-value.positive {
  color: var(--success-color);
}

.metric-value.negative {
  color: var(--error-color);
}

.metric-label {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}

.transactions-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border-radius: 6px;
  transition: all 0.2s ease;
}

.transaction-item:hover {
  background: var(--bg-tertiary);
}

.transaction-main {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  flex: 1;
}

.transaction-type {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 4px;
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-transform: uppercase;
  min-width: 50px;
  text-align: center;
}

.transaction-type.BUY {
  background: rgba(76, 175, 80, 0.2);
  color: var(--success-color);
}

.transaction-type.SELL {
  background: rgba(244, 67, 54, 0.2);
  color: var(--error-color);
}

.transaction-symbol {
  font-weight: 600;
  color: var(--text-primary);
  min-width: 80px;
}

.transaction-amount {
  color: var(--text-primary);
  min-width: 60px;
}

.transaction-price {
  color: var(--text-primary);
  font-weight: 600;
  min-width: 100px;
}

.transaction-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--spacing-xs);
}

.transaction-date {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}

.transaction-total {
  font-weight: 600;
  color: var(--text-primary);
}

@media (max-width: 1200px) {
  .allocation-chart {
    grid-template-columns: 1fr;
  }
  
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .portfolio-overview {
    padding: var(--spacing-md);
  }
  
  .overview-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .portfolio-stats {
    width: 100%;
    justify-content: space-between;
  }
  
  .transaction-main {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
}
</style>
