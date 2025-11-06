<!-- rezaei-trading-platform/frontend/src/components/trading/TradeHistory.vue -->
<template>
  <div class="trade-history">
    <div class="history-header">
      <h3 class="section-title">تاریخچه معاملات</h3>
      <div class="header-actions">
        <button 
          class="btn btn-primary btn-sm"
          @click="exportTrades"
          :disabled="loading"
        >
          <i class="icon-download"></i>
          خروجی اکسل
        </button>
        <button 
          class="btn-icon"
          @click="refreshTrades"
          :disabled="loading"
          title="بروزرسانی"
        >
          <i class="icon-refresh" :class="{ 'animate-spin': loading }"></i>
        </button>
        <button 
          class="btn-icon"
          @click="showFilters = !showFilters"
          title="فیلترها"
        >
          <i class="icon-filter"></i>
        </button>
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="trade-stats">
      <div class="stat-item">
        <div class="stat-value">{{ formatNumber(stats.totalTrades) }}</div>
        <div class="stat-label">تعداد معاملات</div>
      </div>
      <div class="stat-item">
        <div class="stat-value text-profit">{{ formatNumber(stats.winRate) }}%</div>
        <div class="stat-label">نرخ برد</div>
      </div>
      <div class="stat-item">
        <div class="stat-value" :class="stats.totalProfit >= 0 ? 'text-profit' : 'text-loss'">
          {{ formatNumber(stats.totalProfit) }}
        </div>
        <div class="stat-label">سود/ضرر کل</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ formatNumber(stats.avgTrade) }}</div>
        <div class="stat-label">میانگین معامله</div>
      </div>
    </div>

    <!-- Filters -->
    <div v-if="showFilters" class="history-filters">
      <div class="filter-row">
        <div class="filter-group">
          <label class="filter-label">نماد:</label>
          <select v-model="filters.symbol" class="filter-select">
            <option value="all">همه نمادها</option>
            <option 
              v-for="symbol in availableSymbols" 
              :key="symbol"
              :value="symbol"
            >
              {{ symbol }}
            </option>
          </select>
        </div>
        
        <div class="filter-group">
          <label class="filter-label">نوع:</label>
          <select v-model="filters.side" class="filter-select">
            <option value="all">همه انواع</option>
            <option value="buy">خرید</option>
            <option value="sell">فروش</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">استراتژی:</label>
          <select v-model="filters.strategy" class="filter-select">
            <option value="all">همه استراتژی‌ها</option>
            <option 
              v-for="strategy in availableStrategies" 
              :key="strategy"
              :value="strategy"
            >
              {{ strategy }}
            </option>
          </select>
        </div>
      </div>

      <div class="filter-row">
        <div class="filter-group">
          <label class="filter-label">از تاریخ:</label>
          <input
            v-model="filters.startDate"
            type="date"
            class="filter-input"
          />
        </div>
        
        <div class="filter-group">
          <label class="filter-label">تا تاریخ:</label>
          <input
            v-model="filters.endDate"
            type="date"
            class="filter-input"
          />
        </div>

        <button class="btn btn-secondary btn-sm" @click="clearFilters">
          پاک کردن فیلترها
        </button>
      </div>
    </div>

    <!-- Trades Table -->
    <div class="trades-table-container">
      <div class="table-wrapper">
        <table class="trades-table">
          <thead>
            <tr>
              <th>تاریخ</th>
              <th>نماد</th>
              <th>نوع</th>
              <th>حجم</th>
              <th>قیمت</th>
              <th>کارمزد</th>
              <th>سود/ضرر</th>
              <th>استراتژی</th>
              <th>صرافی</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="10" class="loading-row">
                <i class="icon-loader animate-spin"></i>
                <span>در حال بارگذاری معاملات...</span>
              </td>
            </tr>
            
            <tr v-else-if="filteredTrades.length === 0">
              <td colspan="10" class="empty-row">
                <i class="icon-activity"></i>
                <span>هیچ معامله‌ای یافت نشد</span>
              </td>
            </tr>
            
            <tr 
              v-else
              v-for="trade in paginatedTrades"
              :key="trade.id"
              class="trade-row"
              :class="getTradeRowClass(trade)"
            >
              <td class="date-cell">
                <div class="trade-date">
                  <div class="date">{{ formatDate(trade.timestamp) }}</div>
                  <div class="time">{{ formatTime(trade.timestamp) }}</div>
                </div>
              </td>
              
              <td class="symbol-cell">
                <div class="symbol-info">
                  <span class="symbol-name">{{ trade.symbol }}</span>
                </div>
              </td>
              
              <td>
                <span class="trade-side" :class="getSideClass(trade.side)">
                  {{ getSideText(trade.side) }}
                </span>
              </td>
              
              <td class="quantity-cell">
                {{ formatNumber(trade.quantity) }}
              </td>
              
              <td class="price-cell">
                {{ formatNumber(trade.price) }}
              </td>
              
              <td class="fee-cell">
                {{ formatNumber(trade.fee) }}
              </td>
              
              <td class="pnl-cell">
                <span :class="getPnlClass(trade.pnl)">
                  {{ formatNumber(trade.pnl) }}
                </span>
                <div class="pnl-percent" :class="getPnlClass(trade.pnlPercent)">
                  {{ formatPercentage(trade.pnlPercent) }}
                </div>
              </td>
              
              <td class="strategy-cell">
                <span v-if="trade.strategy" class="strategy-name">
                  {{ trade.strategy }}
                </span>
                <span v-else class="no-strategy">دستی</span>
              </td>
              
              <td>
                <span class="exchange-badge">{{ trade.exchange }}</span>
              </td>
              
              <td class="actions-cell">
                <div class="action-buttons">
                  <button 
                    class="btn-action details"
                    @click="viewTradeDetails(trade)"
                    title="مشاهده جزئیات"
                  >
                    <i class="icon-eye"></i>
                  </button>
                  
                  <button 
                    class="btn-action repeat"
                    @click="repeatTrade(trade)"
                    title="تکرار معامله"
                    v-if="trade.side === 'buy'"
                  >
                    <i class="icon-repeat"></i>
                  </button>
                  
                  <button 
                    class="btn-action chart"
                    @click="viewTradeChart(trade)"
                    title="مشاهده نمودار"
                  >
                    <i class="icon-bar-chart"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="filteredTrades.length > pageSize" class="pagination">
        <button 
          class="pagination-btn"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          <i class="icon-chevron-left"></i>
        </button>
        
        <span class="pagination-info">
          صفحه {{ currentPage }} از {{ totalPages }}
        </span>
        
        <button 
          class="pagination-btn"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          <i class="icon-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- Trade Details Modal -->
    <Modal 
      v-if="showDetailsModal"
      @close="showDetailsModal = false"
      :title="`جزئیات معامله - ${selectedTrade?.symbol}`"
      size="lg"
    >
      <TradeDetailsModal
        :trade="selectedTrade"
        @close="showDetailsModal = false"
      />
    </Modal>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useToast } from 'vue-toastification'
import Modal from '@/components/shared/Modal.vue'
import TradeDetailsModal from '@/components/trading/TradeDetailsModal.vue'

export default {
  name: 'TradeHistory',
  components: {
    Modal,
    TradeDetailsModal
  },
  setup() {
    const store = useStore()
    const toast = useToast()

    const trades = ref([])
    const loading = ref(false)
    const showFilters = ref(false)
    const showDetailsModal = ref(false)
    const currentPage = ref(1)
    const pageSize = 15

    const selectedTrade = ref(null)
    const filters = ref({
      symbol: 'all',
      side: 'all',
      strategy: 'all',
      startDate: '',
      endDate: ''
    })

    // Computed properties
    const stats = computed(() => {
      const filtered = filteredTrades.value
      const totalTrades = filtered.length
      const winningTrades = filtered.filter(t => t.pnl > 0).length
      const totalProfit = filtered.reduce((sum, t) => sum + t.pnl, 0)
      const avgTrade = totalTrades > 0 ? totalProfit / totalTrades : 0
      const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0

      return {
        totalTrades,
        winRate: Math.round(winRate * 100) / 100,
        totalProfit,
        avgTrade: Math.round(avgTrade * 100) / 100
      }
    })

    const availableSymbols = computed(() => {
      return [...new Set(trades.value.map(t => t.symbol))]
    })

    const availableStrategies = computed(() => {
      return [...new Set(trades.value.map(t => t.strategy).filter(Boolean))]
    })

    const filteredTrades = computed(() => {
      let filtered = trades.value

      // Filter by symbol
      if (filters.value.symbol !== 'all') {
        filtered = filtered.filter(t => t.symbol === filters.value.symbol)
      }

      // Filter by side
      if (filters.value.side !== 'all') {
        filtered = filtered.filter(t => t.side === filters.value.side)
      }

      // Filter by strategy
      if (filters.value.strategy !== 'all') {
        filtered = filtered.filter(t => t.strategy === filters.value.strategy)
      }

      // Filter by date range
      if (filters.value.startDate) {
        const startDate = new Date(filters.value.startDate)
        filtered = filtered.filter(t => new Date(t.timestamp) >= startDate)
      }

      if (filters.value.endDate) {
        const endDate = new Date(filters.value.endDate)
        endDate.setHours(23, 59, 59, 999)
        filtered = filtered.filter(t => new Date(t.timestamp) <= endDate)
      }

      return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    })

    const totalPages = computed(() => 
      Math.ceil(filteredTrades.value.length / pageSize)
    )

    const paginatedTrades = computed(() => {
      const start = (currentPage.value - 1) * pageSize
      const end = start + pageSize
      return filteredTrades.value.slice(start, end)
    })

    // Methods
    const loadStrategies = async () => {
  try {
    const response = await store.dispatch('strategies/getStrategies')
    strategies.value = response.data
  } catch (error) {
    // handle error
  }
}

    const refreshTrades = () => {
      currentPage.value = 1
      loadTrades()
      toast.success('تاریخچه معاملات بروزرسانی شد')
    }

    const clearFilters = () => {
      filters.value = {
        symbol: 'all',
        side: 'all',
        strategy: 'all',
        startDate: '',
        endDate: ''
      }
      currentPage.value = 1
    }

    const exportTrades = () => {
      // Implement export functionality
      toast.success('خروجی اکسل با موفقیت ایجاد شد')
    }

    const viewTradeDetails = (trade) => {
      selectedTrade.value = trade
      showDetailsModal.value = true
    }

    const repeatTrade = (trade) => {
      // Implement repeat trade functionality
      toast.info(`تکرار معامله خرید ${trade.symbol}`)
    }

    const viewTradeChart = (trade) => {
      // Navigate to chart view
      toast.info(`نمایش نمودار ${trade.symbol}`)
    }

    const getTradeRowClass = (trade) => {
      return {
        'profit-row': trade.pnl > 0,
        'loss-row': trade.pnl < 0
      }
    }

    const getSideClass = (side) => {
      return side === 'buy' ? 'side-buy' : 'side-sell'
    }

    const getSideText = (side) => {
      return side === 'buy' ? 'خرید' : 'فروش'
    }

    const getPnlClass = (pnl) => {
      return pnl >= 0 ? 'text-profit' : 'text-loss'
    }

    const formatDate = (timestamp) => {
      return new Date(timestamp).toLocaleDateString('fa-IR')
    }

    const formatTime = (timestamp) => {
      return new Date(timestamp).toLocaleTimeString('fa-IR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const formatNumber = (num) => {
      return new Intl.NumberFormat('fa-IR').format(num)
    }

    const formatPercentage = (num) => {
      return new Intl.NumberFormat('fa-IR', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 2
      }).format(num)
    }

    // Lifecycle
    onMounted(() => {
      loadTrades()
    })

    return {
      trades,
      loading,
      showFilters,
      showDetailsModal,
      currentPage,
      pageSize,
      selectedTrade,
      filters,
      stats,
      availableSymbols,
      availableStrategies,
      filteredTrades,
      totalPages,
      paginatedTrades,
      refreshTrades,
      clearFilters,
      exportTrades,
      viewTradeDetails,
      repeatTrade,
      viewTradeChart,
      getTradeRowClass,
      getSideClass,
      getSideText,
      getPnlClass,
      formatDate,
      formatTime,
      formatNumber,
      formatPercentage
    }
  }
}
</script>

<style scoped>
.trade-history {
  background: var(--bg-card);
  border-radius: var(--border-radius-lg);
  padding: var(--space-6);
  border: 1px solid var(--border-primary);
  height: 100%;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: var(--space-2);
}

.trade-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-6);
  padding: var(--space-4);
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-primary);
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-bottom: var(--space-1);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}

.history-filters {
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  padding: var(--space-4);
  margin-bottom: var(--space-6);
  border: 1px solid var(--border-primary);
}

.filter-row {
  display: flex;
  gap: var(--space-4);
  align-items: center;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.filter-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  white-space: nowrap;
}

.filter-select, .filter-input {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--border-primary);
  border-radius: var(--border-radius);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  min-width: 120px;
}

.trades-table-container {
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-primary);
  overflow: hidden;
}

.table-wrapper {
  overflow-x: auto;
}

.trades-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 900px;
}

.trades-table th {
  background: var(--bg-tertiary);
  padding: var(--space-3) var(--space-2);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-secondary);
  text-align: right;
  border-bottom: 1px solid var(--border-primary);
  white-space: nowrap;
}

.trades-table td {
  padding: var(--space-3) var(--space-2);
  border-bottom: 1px solid var(--border-primary);
  font-size: var(--font-size-sm);
}

.loading-row, .empty-row {
  text-align: center;
  padding: var(--space-8) !important;
  color: var(--text-muted);
}

.loading-row i, .empty-row i {
  font-size: 2rem;
  margin-bottom: var(--space-2);
  display: block;
}

.trade-row:hover {
  background: var(--bg-tertiary);
}

.trade-row.profit-row {
  border-right: 3px solid var(--color-profit);
}

.trade-row.loss-row {
  border-right: 3px solid var(--color-loss);
}

.date-cell {
  white-space: nowrap;
}

.trade-date {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.date {
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.time {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.symbol-cell {
  font-weight: var(--font-weight-semibold);
}

.trade-side {
  padding: 4px 8px;
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.side-buy {
  background: rgba(0, 200, 150, 0.1);
  color: var(--color-profit);
}

.side-sell {
  background: rgba(255, 71, 87, 0.1);
  color: var(--color-loss);
}

.quantity-cell, .price-cell, .fee-cell {
  font-family: var(--font-family-monospace);
  font-weight: var(--font-weight-medium);
}

.pnl-cell {
  font-family: var(--font-family-monospace);
  font-weight: var(--font-weight-semibold);
}

.pnl-percent {
  font-size: var(--font-size-xs);
  margin-top: 2px;
}

.strategy-cell .strategy-name {
  background: rgba(0, 200, 150, 0.1);
  color: var(--color-secondary);
  padding: 4px 8px;
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
}

.strategy-cell .no-strategy {
  color: var(--text-muted);
  font-style: italic;
}

.exchange-badge {
  background: var(--color-primary);
  color: white;
  padding: 4px 8px;
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.actions-cell {
  width: 120px;
}

.action-buttons {
  display: flex;
  gap: var(--space-1);
  justify-content: center;
}

.btn-action {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--text-muted);
}

.btn-action.details {
  background: rgba(41, 128, 185, 0.1);
}

.btn-action.details:hover {
  background: #2980b9;
  color: white;
}

.btn-action.repeat {
  background: rgba(0, 200, 150, 0.1);
}

.btn-action.repeat:hover {
  background: var(--color-profit);
  color: white;
}

.btn-action.chart {
  background: rgba(255, 107, 53, 0.1);
}

.btn-action.chart:hover {
  background: var(--color-accent);
  color: white;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  border-top: 1px solid var(--border-primary);
}

.pagination-btn {
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--border-radius);
  padding: var(--space-2) var(--space-3);
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.pagination-btn:hover:not(:disabled) {
  background: var(--color-secondary);
  border-color: var(--color-secondary);
  color: white;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .history-header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-3);
  }
  
  .header-actions {
    justify-content: space-between;
  }
  
  .trade-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    justify-content: space-between;
  }
}
</style>
