<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>داشبورد معاملاتی</h1>
      <p>خلاصه عملکرد و آمار معاملات</p>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <StatsCard
        title="موجودی کل"
        :value="portfolioBalance"
        prefix="₮"
        icon="💰"
        color="success"
        :change="portfolioChange"
      />
      <StatsCard
        title="سود/زیان امروز"
        :value="todayProfit"
        prefix="₮"
        icon="📈"
        :color="todayProfit >= 0 ? 'success' : 'error'"
        :change="todayProfitPercent"
      />
      <StatsCard
        title="تعداد معاملات فعال"
        :value="activeTrades"
        icon="⚡"
        color="warning"
      />
      <StatsCard
        title="استراتژی‌های فعال"
        :value="activeStrategies"
        icon="🤖"
        color="primary"
      />
    </div>

    <!-- Charts and Data Grid -->
    <div class="dashboard-content">
      <div class="content-grid">
        <!-- Portfolio Chart -->
        <div class="chart-section">
          <div class="section-header">
            <h3>عملکرد پرتفوی</h3>
            <div class="time-filters">
              <button 
                v-for="period in timePeriods" 
                :key="period.value"
                :class="['time-filter', { active: selectedPeriod === period.value }]"
                @click="selectedPeriod = period.value"
              >
                {{ period.label }}
              </button>
            </div>
          </div>
          <div class="chart-container">
            <PortfolioChart :period="selectedPeriod" />
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="activity-section">
          <div class="section-header">
            <h3>فعالیت‌های اخیر</h3>
            <router-link to="/trading" class="view-all">مشاهده همه</router-link>
          </div>
          <RecentActivity :activities="recentActivities" />
        </div>

        <!-- Market Overview -->
        <div class="market-section">
          <div class="section-header">
            <h3>نمای بازار</h3>
            <div class="market-filters">
              <select v-model="selectedMarket" class="market-select">
                <option value="tsetmc">بورس تهران</option>
                <option value="farabours">فرابورس</option>
                <option value="crypto">ارز دیجیتال</option>
                <option value="gold">طلا و سکه</option>
              </select>
            </div>
          </div>
          <MarketOverview :market="selectedMarket" />
        </div>

        <!-- AI Signals -->
        <div class="signals-section">
          <div class="section-header">
            <h3>سیگنال‌های هوش مصنوعی</h3>
            <span class="badge" :class="aiStatus.class">
              {{ aiStatus.text }}
            </span>
          </div>
          <AISignals :signals="aiSignals" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import StatsCard from '@/components/dashboard/StatsCards.vue'
import PortfolioChart from '@/components/charts/PortfolioChart.vue'
import RecentActivity from '@/components/dashboard/RecentActivity.vue'
import MarketOverview from '@/components/trading/MarketOverview.vue'
import AISignals from '@/components/ai/AISignals.vue'

export default {
  name: 'Dashboard',
  components: {
    StatsCard,
    PortfolioChart,
    RecentActivity,
    MarketOverview,
    AISignals
  },
  setup() {
    const store = useStore()
    
    const selectedPeriod = ref('7d')
    const selectedMarket = ref('tsetmc')
    
    const timePeriods = [
      { label: '24h', value: '1d' },
      { label: '7d', value: '7d' },
      { label: '1m', value: '1m' },
      { label: '3m', value: '3m' },
      { label: '1y', value: '1y' }
    ]

    // Computed properties
    const portfolioBalance = computed(() => store.getters['portfolio/totalBalance'])
    const portfolioChange = computed(() => store.getters['portfolio/dailyChange'])
    const todayProfit = computed(() => store.getters['portfolio/todayProfit'])
    const todayProfitPercent = computed(() => store.getters['portfolio/todayProfitPercent'])
    const activeTrades = computed(() => store.getters['trading/activeTradesCount'])
    const activeStrategies = computed(() => store.getters['strategies/activeCount'])
    const recentActivities = computed(() => store.getters['trading/recentActivities'])
    const aiSignals = computed(() => store.getters['ai/currentSignals'])
    
    const aiStatus = computed(() => {
      const signals = aiSignals.value
      if (signals.length === 0) return { text: 'غیرفعال', class: 'inactive' }
      const buySignals = signals.filter(s => s.signal === 'BUY').length
      if (buySignals > 3) return { text: 'قوی', class: 'strong' }
      if (buySignals > 0) return { text: 'متوسط', class: 'medium' }
      return { text: 'ضعیف', class: 'weak' }
    })

    onMounted(async () => {
      await Promise.all([
        store.dispatch('portfolio/fetchPortfolio'),
        store.dispatch('trading/fetchActiveTrades'),
        store.dispatch('strategies/fetchActiveStrategies'),
        store.dispatch('ai/fetchSignals')
      ])
    })

    return {
      selectedPeriod,
      selectedMarket,
      timePeriods,
      portfolioBalance,
      portfolioChange,
      todayProfit,
      todayProfitPercent,
      activeTrades,
      activeStrategies,
      recentActivities,
      aiSignals,
      aiStatus
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding: var(--spacing-lg);
}

.dashboard-header {
  margin-bottom: var(--spacing-2xl);
}

.dashboard-header h1 {
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.dashboard-header p {
  color: var(--text-muted);
  font-size: var(--font-size-lg);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);
}

.dashboard-content {
  margin-top: var(--spacing-2xl);
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: auto auto;
  gap: var(--spacing-lg);
  grid-template-areas: 
    "chart activity"
    "market signals";
}

.chart-section {
  grid-area: chart;
}

.activity-section {
  grid-area: activity;
}

.market-section {
  grid-area: market;
}

.signals-section {
  grid-area: signals;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
}

.section-header h3 {
  margin-bottom: 0;
  color: var(--text-primary);
}

.time-filters {
  display: flex;
  gap: var(--spacing-sm);
}

.time-filter {
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: var(--font-size-sm);
}

.time-filter:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.time-filter.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.view-all {
  color: var(--primary-color);
  text-decoration: none;
  font-size: var(--font-size-sm);
  transition: color 0.2s ease;
}

.view-all:hover {
  color: var(--primary-light);
}

.market-select {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: var(--spacing-xs) var(--spacing-sm);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}

.badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 20px;
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-transform: uppercase;
}

.badge.strong {
  background: var(--success-color);
  color: white;
}

.badge.medium {
  background: var(--warning-color);
  color: white;
}

.badge.weak {
  background: var(--error-color);
  color: white;
}

.badge.inactive {
  background: var(--text-muted);
  color: white;
}

.chart-container {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: var(--spacing-lg);
  height: 300px;
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
    grid-template-areas: 
      "chart"
      "activity"
      "market"
      "signals";
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: var(--spacing-md);
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }
  
  .time-filters {
    width: 100%;
    justify-content: space-between;
  }
  
  .time-filter {
    flex: 1;
    text-align: center;
  }
}
</style>
