<!-- rezaei-trading-platform/frontend/src/components/trading/PositionManager.vue -->
<template>
  <div class="position-manager">
    <div class="manager-header">
      <h3 class="section-title">مدیریت پوزیشن‌ها</h3>
      <div class="header-actions">
        <button 
          class="btn btn-primary btn-sm"
          @click="showCloseAllModal = true"
          :disabled="!hasOpenPositions"
        >
          <i class="icon-x"></i>
          بستن همه پوزیشن‌ها
        </button>
        <button 
          class="btn-icon"
          @click="refreshPositions"
          :disabled="loading"
          title="بروزرسانی"
        >
          <i class="icon-refresh" :class="{ 'animate-spin': loading }"></i>
        </button>
      </div>
    </div>

    <!-- Statistics -->
    <div class="position-stats">
      <div class="stat-card">
        <div class="stat-icon profit">
          <i class="icon-trending-up"></i>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ formatNumber(stats.totalProfit) }}</span>
          <span class="stat-label">سود کل</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon loss">
          <i class="icon-trending-down"></i>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ formatNumber(stats.totalLoss) }}</span>
          <span class="stat-label">ضرر کل</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon primary">
          <i class="icon-layers"></i>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.openPositions }}</span>
          <span class="stat-label">پوزیشن‌های باز</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon warning">
          <i class="icon-alert-triangle"></i>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.atRiskPositions }}</span>
          <span class="stat-label">در معرض ریسک</span>
        </div>
      </div>
    </div>

    <!-- Positions Table -->
    <div class="positions-table-container">
      <div class="table-header">
        <div class="table-filters">
          <select v-model="filters.status" class="filter-select">
            <option value="all">همه پوزیشن‌ها</option>
            <option value="open">پوزیشن‌های باز</option>
            <option value="closed">پوزیشن‌های بسته</option>
          </select>
          
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
        
        <div class="table-search">
          <input
            v-model="filters.search"
            type="text"
            placeholder="جستجو در پوزیشن‌ها..."
            class="search-input"
          />
          <i class="icon-search search-icon"></i>
        </div>
      </div>

      <div class="table-wrapper">
        <table class="positions-table">
          <thead>
            <tr>
              <th>نماد</th>
              <th>نوع</th>
              <th>حجم</th>
              <th>قیمت ورود</th>
              <th>قیمت فعلی</th>
              <th>سود/ضرر</th>
              <th>سود/ضرر (%)</th>
              <th>لوریج</th>
              <th>استراتژی</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="10" class="loading-row">
                <i class="icon-loader animate-spin"></i>
                <span>در حال بارگذاری پوزیشن‌ها...</span>
              </td>
            </tr>
            
            <tr v-else-if="filteredPositions.length === 0">
              <td colspan="10" class="empty-row">
                <i class="icon-layers"></i>
                <span>هیچ پوزیشنی یافت نشد</span>
              </td>
            </tr>
            
            <tr 
              v-else
              v-for="position in paginatedPositions"
              :key="position.id"
              class="position-row"
              :class="getPositionRowClass(position)"
            >
              <td class="symbol-cell">
                <div class="symbol-info">
                  <span class="symbol-name">{{ position.symbol }}</span>
                  <span class="exchange-badge">{{ position.exchange }}</span>
                </div>
              </td>
              
              <td>
                <span class="position-side" :class="getSideClass(position.side)">
                  {{ getSideText(position.side) }}
                </span>
              </td>
              
              <td class="quantity-cell">
                {{ formatNumber(position.quantity) }}
              </td>
              
              <td class="price-cell">
                {{ formatNumber(position.entryPrice) }}
              </td>
              
              <td class="price-cell">
                {{ formatNumber(position.currentPrice) }}
                <div class="price-change" :class="getPriceChangeClass(position.priceChange)">
                  {{ formatPercentage(position.priceChange) }}
                </div>
              </td>
              
              <td class="pnl-cell">
                <span :class="getPnlClass(position.unrealizedPnl)">
                  {{ formatNumber(position.unrealizedPnl) }}
                </span>
              </td>
              
              <td class="pnl-percent-cell">
                <span :class="getPnlClass(position.unrealizedPnlPercent)">
                  {{ formatPercentage(position.unrealizedPnlPercent) }}
                </span>
              </td>
              
              <td>
                <span class="leverage-badge">×{{ position.leverage }}</span>
              </td>
              
              <td class="strategy-cell">
                <span v-if="position.strategy" class="strategy-name">
                  {{ position.strategy }}
                </span>
                <span v-else class="no-strategy">دستی</span>
              </td>
              
              <td class="actions-cell">
                <div class="action-buttons">
                  <button 
                    v-if="position.status === 'open'"
                    class="btn-action close"
                    @click="openClosePositionModal(position)"
                    title="بستن پوزیشن"
                  >
                    <i class="icon-x"></i>
                  </button>
                  
                  <button 
                    class="btn-action edit"
                    @click="openEditPositionModal(position)"
                    title="ویرایش پوزیشن"
                  >
                    <i class="icon-edit"></i>
                  </button>
                  
                  <button 
                    class="btn-action chart"
                    @click="viewPositionChart(position)"
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
      <div v-if="filteredPositions.length > pageSize" class="pagination">
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

    <!-- Modals -->
    <Modal 
      v-if="showCloseModal"
      @close="showCloseModal = false"
      title="بستن پوزیشن"
    >
      <ClosePositionModal
        :position="selectedPosition"
        @close="handleClosePosition"
        @cancel="showCloseModal = false"
      />
    </Modal>

    <Modal 
      v-if="showEditModal"
      @close="showEditModal = false"
      title="ویرایش پوزیشن"
    >
      <EditPositionModal
        :position="selectedPosition"
        @save="handleEditPosition"
        @cancel="showEditModal = false"
      />
    </Modal>

    <Modal 
      v-if="showCloseAllModal"
      @close="showCloseAllModal = false"
      title="بستن همه پوزیشن‌ها"
    >
      <div class="close-all-modal">
        <i class="icon-alert-triangle warning-icon"></i>
        <h4>آیا از بستن همه پوزیشن‌ها مطمئن هستید؟</h4>
        <p>این عمل تمام پوزیشن‌های باز شما را خواهد بست.</p>
        
        <div class="modal-actions">
          <button class="btn btn-danger" @click="closeAllPositions">
            بستن همه پوزیشن‌ها
          </button>
          <button class="btn btn-secondary" @click="showCloseAllModal = false">
            انصراف
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useToast } from 'vue-toastification'
import Modal from '@/components/shared/Modal.vue'
import ClosePositionModal from '@/components/trading/ClosePositionModal.vue'
import EditPositionModal from '@/components/trading/EditPositionModal.vue'

export default {
  name: 'PositionManager',
  components: {
    Modal,
    ClosePositionModal,
    EditPositionModal
  },
  setup() {
    const store = useStore()
    const toast = useToast()

    const positions = ref([])
    const loading = ref(false)
    const currentPage = ref(1)
    const pageSize = 10

    const showCloseModal = ref(false)
    const showEditModal = ref(false)
    const showCloseAllModal = ref(false)
    const selectedPosition = ref(null)

    const filters = ref({
      status: 'all',
      symbol: 'all',
      search: ''
    })

    // Computed properties
    const stats = computed(() => {
      const openPositions = positions.value.filter(p => p.status === 'open')
      const totalProfit = openPositions
        .filter(p => p.unrealizedPnl > 0)
        .reduce((sum, p) => sum + p.unrealizedPnl, 0)
      
      const totalLoss = openPositions
        .filter(p => p.unrealizedPnl < 0)
        .reduce((sum, p) => sum + p.unrealizedPnl, 0)
      
      const atRiskPositions = openPositions
        .filter(p => p.unrealizedPnlPercent < -0.05) // 5% loss
        .length

      return {
        totalProfit,
        totalLoss: Math.abs(totalLoss),
        openPositions: openPositions.length,
        atRiskPositions
      }
    })

    const availableSymbols = computed(() => {
      return [...new Set(positions.value.map(p => p.symbol))]
    })

    const filteredPositions = computed(() => {
      let filtered = positions.value

      // Filter by status
      if (filters.value.status !== 'all') {
        filtered = filtered.filter(p => p.status === filters.value.status)
      }

      // Filter by symbol
      if (filters.value.symbol !== 'all') {
        filtered = filtered.filter(p => p.symbol === filters.value.symbol)
      }

      // Filter by search
      if (filters.value.search) {
        const searchTerm = filters.value.search.toLowerCase()
        filtered = filtered.filter(p => 
          p.symbol.toLowerCase().includes(searchTerm) ||
          (p.strategy && p.strategy.toLowerCase().includes(searchTerm))
        )
      }

      return filtered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    })

    const hasOpenPositions = computed(() => 
      positions.value.some(p => p.status === 'open')
    )

    const totalPages = computed(() => 
      Math.ceil(filteredPositions.value.length / pageSize)
    )

    const paginatedPositions = computed(() => {
      const start = (currentPage.value - 1) * pageSize
      const end = start + pageSize
      return filteredPositions.value.slice(start, end)
    })

    // Methods
    const loadPositions = async () => {
      loading.value = true
      try {
        // Simulate API call - replace with actual API
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Mock data - replace with actual data from store/API
        positions.value = [
          {
            id: 1,
            symbol: 'فولاد',
            exchange: 'TSETMC',
            side: 'buy',
            quantity: 1000,
            entryPrice: 14500,
            currentPrice: 15200,
            priceChange: 0.048,
            unrealizedPnl: 700000,
            unrealizedPnlPercent: 0.048,
            leverage: 1,
            strategy: 'میانگین متحرک',
            status: 'open',
            updatedAt: new Date()
          },
          {
            id: 2,
            symbol: 'خودرو',
            exchange: 'TSETMC',
            side: 'sell',
            quantity: 500,
            entryPrice: 32000,
            currentPrice: 31500,
            priceChange: -0.015,
            unrealizedPnl: -250000,
            unrealizedPnlPercent: -0.015,
            leverage: 1,
            strategy: null,
            status: 'open',
            updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
          },
          {
            id: 3,
            symbol: 'BTC/USDT',
            exchange: 'Nobitex',
            side: 'buy',
            quantity: 0.1,
            entryPrice: 250000000,
            currentPrice: 255000000,
            priceChange: 0.02,
            unrealizedPnl: 500000,
            unrealizedPnlPercent: 0.02,
            leverage: 3,
            strategy: 'AI Prediction',
            status: 'open',
            updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        ]
      } catch (error) {
        toast.error('خطا در بارگذاری پوزیشن‌ها')
        console.error('Load positions error:', error)
      } finally {
        loading.value = false
      }
    }

    const refreshPositions = () => {
      currentPage.value = 1
      loadPositions()
      toast.success('پوزیشن‌ها بروزرسانی شد')
    }

    const openClosePositionModal = (position) => {
      selectedPosition.value = position
      showCloseModal.value = true
    }

    const openEditPositionModal = (position) => {
      selectedPosition.value = position
      showEditModal.value = true
    }

    const handleClosePosition = async (closeData) => {
      try {
        // Call API to close position
        await store.dispatch('trading/closePosition', {
          positionId: selectedPosition.value.id,
          ...closeData
        })
        
        toast.success('پوزیشن با موفقیت بسته شد')
        showCloseModal.value = false
        refreshPositions()
      } catch (error) {
        toast.error('خطا در بستن پوزیشن')
      }
    }

    const handleEditPosition = async (editData) => {
      try {
        // Call API to edit position
        await store.dispatch('trading/updatePosition', {
          positionId: selectedPosition.value.id,
          ...editData
        })
        
        toast.success('پوزیشن با موفقیت ویرایش شد')
        showEditModal.value = false
        refreshPositions()
      } catch (error) {
        toast.error('خطا در ویرایش پوزیشن')
      }
    }

    const closeAllPositions = async () => {
      try {
        // Call API to close all positions
        await store.dispatch('trading/closeAllPositions')
        
        toast.success('همه پوزیشن‌ها بسته شدند')
        showCloseAllModal.value = false
        refreshPositions()
      } catch (error) {
        toast.error('خطا در بستن پوزیشن‌ها')
      }
    }

    const viewPositionChart = (position) => {
      // Navigate to chart view for this symbol
      toast.info(`نمایش نمودار ${position.symbol}`)
    }

    const getPositionRowClass = (position) => {
      return {
        'profit-row': position.unrealizedPnl > 0,
        'loss-row': position.unrealizedPnl < 0,
        'at-risk': position.unrealizedPnlPercent < -0.05
      }
    }

    const getSideClass = (side) => {
      return side === 'buy' ? 'side-buy' : 'side-sell'
    }

    const getSideText = (side) => {
      return side === 'buy' ? 'خرید' : 'فروش'
    }

    const getPriceChangeClass = (change) => {
      return change >= 0 ? 'positive' : 'negative'
    }

    const getPnlClass = (pnl) => {
      return pnl >= 0 ? 'text-profit' : 'text-loss'
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
      loadPositions()
    })

    return {
      positions,
      loading,
      currentPage,
      pageSize,
      showCloseModal,
      showEditModal,
      showCloseAllModal,
      selectedPosition,
      filters,
      stats,
      availableSymbols,
      filteredPositions,
      hasOpenPositions,
      totalPages,
      paginatedPositions,
      refreshPositions,
      openClosePositionModal,
      openEditPositionModal,
      handleClosePosition,
      handleEditPosition,
      closeAllPositions,
      viewPositionChart,
      getPositionRowClass,
      getSideClass,
      getSideText,
      getPriceChangeClass,
      getPnlClass,
      formatNumber,
      formatPercentage
    }
  }
}
</script>

<style scoped>
.position-manager {
  background: var(--bg-card);
  border-radius: var(--border-radius-lg);
  padding: var(--space-6);
  border: 1px solid var(--border-primary);
  height: 100%;
}

.manager-header {
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

.position-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-primary);
}

.stat-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius);
  color: white;
}

.stat-icon.profit {
  background: var(--color-profit);
}

.stat-icon.loss {
  background: var(--color-loss);
}

.stat-icon.primary {
  background: var(--color-primary);
}

.stat-icon.warning {
  background: var(--color-warning);
}

.stat-icon i {
  font-size: 1.5rem;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  line-height: 1;
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  margin-top: var(--space-1);
}

.positions-table-container {
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-primary);
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4);
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-primary);
  flex-wrap: wrap;
  gap: var(--space-4);
}

.table-filters {
  display: flex;
  gap: var(--space-3);
}

.filter-select {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--border-primary);
  border-radius: var(--border-radius);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  min-width: 120px;
}

.table-search {
  position: relative;
  min-width: 200px;
}

.search-input {
  width: 100%;
  padding: var(--space-2) var(--space-3) var(--space-2) var(--space-8);
  border: 1px solid var(--border-primary);
  border-radius: var(--border-radius);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}

.search-icon {
  position: absolute;
  left: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
}

.table-wrapper {
  overflow-x: auto;
}

.positions-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

.positions-table th {
  background: var(--bg-tertiary);
  padding: var(--space-3) var(--space-2);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-secondary);
  text-align: right;
  border-bottom: 1px solid var(--border-primary);
  white-space: nowrap;
}

.positions-table td {
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

.position-row:hover {
  background: var(--bg-tertiary);
}

.position-row.profit-row {
  border-right: 3px solid var(--color-profit);
}

.position-row.loss-row {
  border-right: 3px solid var(--color-loss);
}

.position-row.at-risk {
  background: rgba(255, 71, 87, 0.05) !important;
}

.symbol-cell {
  font-weight: var(--font-weight-semibold);
}

.symbol-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.exchange-badge {
  font-size: var(--font-size-xs);
  background: var(--color-primary);
  color: white;
  padding: 2px 6px;
  border-radius: var(--border-radius-sm);
  align-self: flex-start;
}

.position-side {
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

.quantity-cell, .price-cell {
  font-family: var(--font-family-monospace);
  font-weight: var(--font-weight-medium);
}

.price-change {
  font-size: var(--font-size-xs);
  margin-top: 2px;
}

.price-change.positive {
  color: var(--color-profit);
}

.price-change.negative {
  color: var(--color-loss);
}

.pnl-cell, .pnl-percent-cell {
  font-family: var(--font-family-monospace);
  font-weight: var(--font-weight-semibold);
}

.leverage-badge {
  background: var(--color-warning);
  color: white;
  padding: 4px 8px;
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
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

.btn-action.close {
  background: rgba(255, 71, 87, 0.1);
}

.btn-action.close:hover {
  background: var(--color-loss);
  color: white;
}

.btn-action.edit {
  background: rgba(255, 107, 53, 0.1);
}

.btn-action.edit:hover {
  background: var(--color-accent);
  color: white;
}

.btn-action.chart {
  background: rgba(41, 128, 185, 0.1);
}

.btn-action.chart:hover {
  background: #2980b9;
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

.close-all-modal {
  text-align: center;
  padding: var(--space-4);
}

.warning-icon {
  font-size: 3rem;
  color: var(--color-warning);
  margin-bottom: var(--space-4);
}

.close-all-modal h4 {
  color: var(--text-primary);
  margin-bottom: var(--space-3);
}

.close-all-modal p {
  color: var(--text-muted);
  margin-bottom: var(--space-6);
}

.modal-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: center;
}

@media (max-width: 1024px) {
  .position-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .manager-header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-3);
  }
  
  .header-actions {
    justify-content: space-between;
  }
  
  .table-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .table-filters {
    justify-content: space-between;
  }
  
  .position-stats {
    grid-template-columns: 1fr;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>
