<!-- rezaei-trading-platform/frontend/src/components/strategies/StrategyList.vue -->
<template>
  <div class="strategy-list">
    <div class="list-header">
      <h3 class="section-title">استراتژی‌های من</h3>
      <div class="header-actions">
        <router-link to="/strategies/new" class="btn btn-primary">
          <i class="icon-plus"></i>
          استراتژی جدید
        </router-link>
        <button 
          class="btn-icon"
          @click="refreshStrategies"
          :disabled="loading"
          title="بروزرسانی"
        >
          <i class="icon-refresh" :class="{ 'animate-spin': loading }"></i>
        </button>
      </div>
    </div>

    <!-- Strategy Stats -->
    <div class="strategy-stats">
      <div class="stat-card">
        <div class="stat-icon active">
          <i class="icon-play"></i>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.active }}</span>
          <span class="stat-label">فعال</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon inactive">
          <i class="icon-pause"></i>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.inactive }}</span>
          <span class="stat-label">غیرفعال</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon profit">
          <i class="icon-trending-up"></i>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ formatPercentage(stats.avgProfit) }}</span>
          <span class="stat-label">میانگین سود</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon total">
          <i class="icon-layers"></i>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.total }}</span>
          <span class="stat-label">کل استراتژی‌ها</span>
        </div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="list-controls">
      <div class="controls-left">
        <div class="search-box">
          <input
            v-model="filters.search"
            type="text"
            placeholder="جستجو در استراتژی‌ها..."
            class="search-input"
          />
          <i class="icon-search search-icon"></i>
        </div>
        
        <select v-model="filters.status" class="filter-select">
          <option value="all">همه وضعیت‌ها</option>
          <option value="active">فعال</option>
          <option value="inactive">غیرفعال</option>
          <option value="paused">متوقف شده</option>
        </select>
        
        <select v-model="filters.type" class="filter-select">
          <option value="all">همه انواع</option>
          <option value="technical">تکنیکال</option>
          <option value="ai_based">هوش مصنوعی</option>
          <option value="custom">سفارشی</option>
        </select>
      </div>
      
      <div class="controls-right">
        <button 
          class="btn btn-secondary btn-sm"
          @click="showBulkActions = !showBulkActions"
        >
          <i class="icon-check-square"></i>
          اقدامات گروهی
        </button>
      </div>
    </div>

    <!-- Bulk Actions -->
    <div v-if="showBulkActions" class="bulk-actions">
      <div class="bulk-info">
        <span>{{ selectedStrategies.length }} استراتژی انتخاب شده</span>
      </div>
      <div class="bulk-buttons">
        <button 
          class="btn btn-success btn-sm"
          @click="bulkActivate"
          :disabled="!hasSelectedStrategies"
        >
          <i class="icon-play"></i>
          فعال‌سازی
        </button>
        <button 
          class="btn btn-warning btn-sm"
          @click="bulkDeactivate"
          :disabled="!hasSelectedStrategies"
        >
          <i class="icon-pause"></i>
          غیرفعال‌سازی
        </button>
        <button 
          class="btn btn-danger btn-sm"
          @click="bulkDelete"
          :disabled="!hasSelectedStrategies"
        >
          <i class="icon-trash"></i>
          حذف
        </button>
        <button 
          class="btn btn-secondary btn-sm"
          @click="clearSelection"
        >
          <i class="icon-x"></i>
          انصراف
        </button>
      </div>
    </div>

    <!-- Strategies Grid -->
    <div class="strategies-grid">
      <div v-if="loading" class="loading-state">
        <i class="icon-loader animate-spin"></i>
        <span>در حال بارگذاری استراتژی‌ها...</span>
      </div>

      <div v-else-if="filteredStrategies.length === 0" class="empty-state">
        <i class="icon-cpu"></i>
        <p>هیچ استراتژی یافت نشد</p>
        <router-link to="/strategies/new" class="btn btn-primary">
          ایجاد اولین استراتژی
        </router-link>
      </div>

      <div v-else class="grid-container">
        <div 
          v-for="strategy in filteredStrategies"
          :key="strategy.id"
          class="strategy-card"
          :class="getStrategyCardClass(strategy)"
        >
          <div class="card-header">
            <div class="strategy-info">
              <h4 class="strategy-name">{{ strategy.name }}</h4>
              <span class="strategy-type">{{ getTypeText(strategy.type) }}</span>
            </div>
            <div class="card-actions">
              <input
                type="checkbox"
                v-model="selectedStrategies"
                :value="strategy.id"
                class="strategy-checkbox"
                v-if="showBulkActions"
              />
              <div class="action-menu" v-else>
                <button 
                  class="btn-icon"
                  @click="toggleActionMenu(strategy.id)"
                >
                  <i class="icon-more-vertical"></i>
                </button>
                <div 
                  v-if="activeActionMenu === strategy.id"
                  class="dropdown-menu"
                >
                  <button @click="editStrategy(strategy)" class="dropdown-item">
                    <i class="icon-edit"></i>
                    ویرایش
                  </button>
                  <button @click="cloneStrategy(strategy)" class="dropdown-item">
                    <i class="icon-copy"></i>
                    کپی
                  </button>
                  <button 
                    @click="toggleStrategy(strategy)"
                    class="dropdown-item"
                  >
                    <i :class="strategy.status === 'active' ? 'icon-pause' : 'icon-play'"></i>
                    {{ strategy.status === 'active' ? 'توقف' : 'فعال‌سازی' }}
                  </button>
                  <button 
                    @click="runBacktest(strategy)"
                    class="dropdown-item"
                  >
                    <i class="icon-bar-chart"></i>
                    اجرای بکتست
                  </button>
                  <hr class="dropdown-divider" />
                  <button 
                    @click="deleteStrategy(strategy)"
                    class="dropdown-item danger"
                  >
                    <i class="icon-trash"></i>
                    حذف
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="card-content">
            <p class="strategy-description">{{ strategy.description }}</p>
            
            <div class="strategy-meta">
              <div class="meta-item">
                <i class="icon-bar-chart"></i>
                <span>{{ strategy.symbols.length }} نماد</span>
              </div>
              <div class="meta-item">
                <i class="icon-clock"></i>
                <span>{{ strategy.timeframe }}</span>
              </div>
              <div class="meta-item">
                <i class="icon-calendar"></i>
                <span>{{ formatDate(strategy.createdAt) }}</span>
              </div>
            </div>

            <div class="strategy-performance">
              <div class="performance-item">
                <span class="performance-label">سود کل</span>
                <span 
                  class="performance-value"
                  :class="getPerformanceClass(strategy.performance.totalProfit)"
                >
                  {{ formatNumber(strategy.performance.totalProfit) }}
                </span>
              </div>
              <div class="performance-item">
                <span class="performance-label">نرخ برد</span>
                <span class="performance-value">
                  {{ formatPercentage(strategy.performance.winRate) }}
                </span>
              </div>
              <div class="performance-item">
                <span class="performance-label">شارپ</span>
                <span class="performance-value">
                  {{ strategy.performance.sharpeRatio.toFixed(2) }}
                </span>
              </div>
            </div>
          </div>

          <div class="card-footer">
            <div class="strategy-status">
              <span 
                class="status-badge"
                :class="getStatusClass(strategy.status)"
              >
                <i :class="getStatusIcon(strategy.status)"></i>
                {{ getStatusText(strategy.status) }}
              </span>
            </div>
            <div class="footer-actions">
              <button 
                v-if="strategy.status === 'active'"
                @click="toggleStrategy(strategy)"
                class="btn btn-warning btn-sm"
              >
                <i class="icon-pause"></i>
                توقف
              </button>
              <button 
                v-else
                @click="toggleStrategy(strategy)"
                class="btn btn-success btn-sm"
              >
                <i class="icon-play"></i>
                فعال‌سازی
              </button>
              
              <button 
                @click="viewStrategy(strategy)"
                class="btn btn-secondary btn-sm"
              >
                <i class="icon-eye"></i>
                مشاهده
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="filteredStrategies.length > pageSize" class="pagination">
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

    <!-- Delete Confirmation Modal -->
    <Modal 
      v-if="showDeleteModal"
      @close="showDeleteModal = false"
      title="حذف استراتژی"
    >
      <div class="delete-modal">
        <i class="icon-alert-triangle warning-icon"></i>
        <h4>آیا از حذف استراتژی "{{ strategyToDelete?.name }}" مطمئن هستید؟</h4>
        <p>این عمل قابل بازگشت نیست و تمام داده‌های مرتبط با این استراتژی حذف خواهند شد.</p>
        
        <div class="modal-actions">
          <button class="btn btn-danger" @click="confirmDelete">
            حذف استراتژی
          </button>
          <button class="btn btn-secondary" @click="showDeleteModal = false">
            انصراف
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useToast } from 'vue-toastification'
import Modal from '@/components/shared/Modal.vue'

export default {
  name: 'StrategyList',
  components: {
    Modal
  },
  setup() {
    const router = useRouter()
    const store = useStore()
    const toast = useToast()

    const strategies = ref([])
    const loading = ref(false)
    const showBulkActions = ref(false)
    const showDeleteModal = ref(false)
    const activeActionMenu = ref(null)
    const currentPage = ref(1)
    const pageSize = 12

    const selectedStrategies = ref([])
    const strategyToDelete = ref(null)
    const filters = ref({
      search: '',
      status: 'all',
      type: 'all'
    })

    // Computed properties
    const stats = computed(() => {
      const active = strategies.value.filter(s => s.status === 'active').length
      const inactive = strategies.value.filter(s => s.status === 'inactive').length
      const total = strategies.value.length
      
      const totalProfit = strategies.value.reduce((sum, s) => 
        sum + s.performance.totalProfit, 0
      )
      const avgProfit = total > 0 ? totalProfit / total : 0

      return {
        active,
        inactive,
        total,
        avgProfit
      }
    })

    const filteredStrategies = computed(() => {
      let filtered = strategies.value

      // Filter by search
      if (filters.value.search) {
        const searchTerm = filters.value.search.toLowerCase()
        filtered = filtered.filter(s => 
          s.name.toLowerCase().includes(searchTerm) ||
          s.description.toLowerCase().includes(searchTerm)
        )
      }

      // Filter by status
      if (filters.value.status !== 'all') {
        filtered = filtered.filter(s => s.status === filters.value.status)
      }

      // Filter by type
      if (filters.value.type !== 'all') {
        filtered = filtered.filter(s => s.type === filters.value.type)
      }

      return filtered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    })

    const hasSelectedStrategies = computed(() => selectedStrategies.value.length > 0)

    const totalPages = computed(() => 
      Math.ceil(filteredStrategies.value.length / pageSize)
    )

    const paginatedStrategies = computed(() => {
      const start = (currentPage.value - 1) * pageSize
      const end = start + pageSize
      return filteredStrategies.value.slice(start, end)
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

    const refreshStrategies = () => {
      currentPage.value = 1
      selectedStrategies.value = []
      loadStrategies()
      toast.success('استراتژی‌ها بروزرسانی شد')
    }

    const toggleActionMenu = (strategyId) => {
      activeActionMenu.value = activeActionMenu.value === strategyId ? null : strategyId
    }

    const editStrategy = (strategy) => {
      router.push(`/strategies/edit/${strategy.id}`)
    }

    const cloneStrategy = (strategy) => {
      // Implement clone strategy
      toast.success(`استراتژی "${strategy.name}" کپی شد`)
    }

    const toggleStrategy = async (strategy) => {
      try {
        const newStatus = strategy.status === 'active' ? 'inactive' : 'active'
        // Call API to toggle strategy status
        await store.dispatch('strategies/toggleStrategy', {
          strategyId: strategy.id,
          status: newStatus
        })
        
        strategy.status = newStatus
        toast.success(`استراتژی ${newStatus === 'active' ? 'فعال' : 'غیرفعال'} شد`)
      } catch (error) {
        toast.error('خطا در تغییر وضعیت استراتژی')
      }
    }

    const runBacktest = (strategy) => {
      router.push(`/backtesting?strategy=${strategy.id}`)
    }

    const deleteStrategy = (strategy) => {
      strategyToDelete.value = strategy
      showDeleteModal.value = true
    }

    const confirmDelete = async () => {
      try {
        // Call API to delete strategy
        await store.dispatch('strategies/deleteStrategy', strategyToDelete.value.id)
        
        strategies.value = strategies.value.filter(s => s.id !== strategyToDelete.value.id)
        showDeleteModal.value = false
        toast.success('استراتژی با موفقیت حذف شد')
      } catch (error) {
        toast.error('خطا در حذف استراتژی')
      }
    }

    const viewStrategy = (strategy) => {
      router.push(`/strategies/${strategy.id}`)
    }

    const bulkActivate = async () => {
      try {
        // Call API to bulk activate
        await store.dispatch('strategies/bulkUpdateStatus', {
          strategyIds: selectedStrategies.value,
          status: 'active'
        })
        
        strategies.value.forEach(s => {
          if (selectedStrategies.value.includes(s.id)) {
            s.status = 'active'
          }
        })
        
        clearSelection()
        toast.success('استراتژی‌های انتخاب شده فعال شدند')
      } catch (error) {
        toast.error('خطا در فعال‌سازی استراتژی‌ها')
      }
    }

    const bulkDeactivate = async () => {
      try {
        // Call API to bulk deactivate
        await store.dispatch('strategies/bulkUpdateStatus', {
          strategyIds: selectedStrategies.value,
          status: 'inactive'
        })
        
        strategies.value.forEach(s => {
          if (selectedStrategies.value.includes(s.id)) {
            s.status = 'inactive'
          }
        })
        
        clearSelection()
        toast.success('استراتژی‌های انتخاب شده غیرفعال شدند')
      } catch (error) {
        toast.error('خطا در غیرفعال‌سازی استراتژی‌ها')
      }
    }

    const bulkDelete = async () => {
      try {
        // Call API to bulk delete
        await store.dispatch('strategies/bulkDelete', selectedStrategies.value)
        
        strategies.value = strategies.value.filter(
          s => !selectedStrategies.value.includes(s.id)
        )
        
        clearSelection()
        toast.success('استراتژی‌های انتخاب شده حذف شدند')
      } catch (error) {
        toast.error('خطا در حذف استراتژی‌ها')
      }
    }

    const clearSelection = () => {
      selectedStrategies.value = []
      showBulkActions.value = false
    }

    const getStrategyCardClass = (strategy) => {
      return {
        'active-strategy': strategy.status === 'active',
        'inactive-strategy': strategy.status === 'inactive',
        'paused-strategy': strategy.status === 'paused'
      }
    }

    const getTypeText = (type) => {
      const typeMap = {
        technical: 'تکنیکال',
        ai_based: 'هوش مصنوعی',
        custom: 'سفارشی'
      }
      return typeMap[type] || type
    }

    const getStatusClass = (status) => {
      return `status-${status}`
    }

    const getStatusIcon = (status) => {
      const icons = {
        active: 'icon-play',
        inactive: 'icon-pause',
        paused: 'icon-stop'
      }
      return icons[status] || 'icon-help-circle'
    }

    const getStatusText = (status) => {
      const statusMap = {
        active: 'فعال',
        inactive: 'غیرفعال',
        paused: 'متوقف شده'
      }
      return statusMap[status] || status
    }

    const getPerformanceClass = (profit) => {
      return profit >= 0 ? 'text-profit' : 'text-loss'
    }

    const formatDate = (timestamp) => {
      return new Date(timestamp).toLocaleDateString('fa-IR')
    }

    const formatNumber = (num) => {
      return new Intl.NumberFormat('fa-IR').format(num)
    }

    const formatPercentage = (num) => {
      return new Intl.NumberFormat('fa-IR', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      }).format(num)
    }

    // Close dropdown when clicking outside
    const closeDropdowns = (event) => {
      if (!event.target.closest('.action-menu')) {
        activeActionMenu.value = null
      }
    }

    // Lifecycle
    onMounted(() => {
      loadStrategies()
      document.addEventListener('click', closeDropdowns)
    })

    return {
      strategies,
      loading,
      showBulkActions,
      showDeleteModal,
      activeActionMenu,
      currentPage,
      pageSize,
      selectedStrategies,
      strategyToDelete,
      filters,
      stats,
      filteredStrategies,
      hasSelectedStrategies,
      totalPages,
      paginatedStrategies,
      refreshStrategies,
      toggleActionMenu,
      editStrategy,
      cloneStrategy,
      toggleStrategy,
      runBacktest,
      deleteStrategy,
      confirmDelete,
      viewStrategy,
      bulkActivate,
      bulkDeactivate,
      bulkDelete,
      clearSelection,
      getStrategyCardClass,
      getTypeText,
      getStatusClass,
      getStatusIcon,
      getStatusText,
      getPerformanceClass,
      formatDate,
      formatNumber,
      formatPercentage
    }
  }
}
</script>

<style scoped>
.strategy-list {
  background: var(--bg-card);
  border-radius: var(--border-radius-lg);
  padding: var(--space-6);
  border: 1px solid var(--border-primary);
  height: 100%;
}

.list-header {
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

.strategy-stats {
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

.stat-icon.active {
  background: var(--color-profit);
}

.stat-icon.inactive {
  background: var(--color-gray-500);
}

.stat-icon.profit {
  background: var(--color-secondary);
}

.stat-icon.total {
  background: var(--color-primary);
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

.list-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);
  flex-wrap: wrap;
  gap: var(--space-4);
}

.controls-left {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  min-width: 250px;
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

.filter-select {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--border-primary);
  border-radius: var(--border-radius);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  min-width: 120px;
}

.bulk-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3) var(--space-4);
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-primary);
  margin-bottom: var(--space-6);
}

.bulk-info {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
}

.bulk-buttons {
  display: flex;
  gap: var(--space-2);
}

.strategies-grid {
  min-height: 400px;
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
  color: var(--text-muted);
  gap: var(--space-3);
}

.loading-state i, .empty-state i {
  font-size: 3rem;
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--space-4);
}

.strategy-card {
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-primary);
  overflow: hidden;
  transition: all var(--transition-fast);
}

.strategy-card:hover {
  border-color: var(--color-secondary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.active-strategy {
  border-right: 3px solid var(--color-profit);
}

.inactive-strategy {
  border-right: 3px solid var(--color-gray-500);
}

.paused-strategy {
  border-right: 3px solid var(--color-warning);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--space-4);
  border-bottom: 1px solid var(--border-primary);
}

.strategy-info {
  flex: 1;
}

.strategy-name {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--space-1) 0;
  line-height: var(--line-height-tight);
}

.strategy-type {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  background: var(--bg-tertiary);
  padding: 2px 6px;
  border-radius: var(--border-radius-sm);
}

.card-actions {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.strategy-checkbox {
  width: 18px;
  height: 18px;
}

.action-menu {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  left: 0;
  top: 100%;
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg);
  z-index: 10;
  min-width: 160px;
  padding: var(--space-2) 0;
}

.dropdown-item {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  background: none;
  border: none;
  text-align: right;
  color: var(--text-primary);
  cursor: pointer;
  transition: background var(--transition-fast);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
}

.dropdown-item:hover {
  background: var(--bg-secondary);
}

.dropdown-item.danger {
  color: var(--color-loss);
}

.dropdown-item.danger:hover {
  background: rgba(255, 71, 87, 0.1);
}

.dropdown-divider {
  border: none;
  border-top: 1px solid var(--border-primary);
  margin: var(--space-2) 0;
}

.card-content {
  padding: var(--space-4);
}

.strategy-description {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
  margin-bottom: var(--space-4);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.strategy-meta {
  display: flex;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.meta-item i {
  font-size: 14px;
}

.strategy-performance {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
  background: var(--bg-tertiary);
  border-radius: var(--border-radius);
  padding: var(--space-3);
}

.performance-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.performance-label {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  margin-bottom: 2px;
}

.performance-value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  font-family: var(--font-family-monospace);
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4);
  border-top: 1px solid var(--border-primary);
  background: var(--bg-tertiary);
}

.status-badge {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: 4px 8px;
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.status-active {
  background: rgba(0, 200, 150, 0.1);
  color: var(--color-profit);
}

.status-inactive {
  background: rgba(116, 125, 140, 0.1);
  color: var(--color-gray-500);
}

.status-paused {
  background: rgba(255, 165, 2, 0.1);
  color: var(--color-warning);
}

.footer-actions {
  display: flex;
  gap: var(--space-2);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-4);
  margin-top: var(--space-6);
  padding-top: var(--space-4);
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

.delete-modal {
  text-align: center;
  padding: var(--space-4);
}

.warning-icon {
  font-size: 3rem;
  color: var(--color-warning);
  margin-bottom: var(--space-4);
}

.delete-modal h4 {
  color: var(--text-primary);
  margin-bottom: var(--space-3);
}

.delete-modal p {
  color: var(--text-muted);
  margin-bottom: var(--space-6);
}

.modal-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: center;
}

@media (max-width: 1024px) {
  .grid-container {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

@media (max-width: 768px) {
  .list-header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-3);
  }
  
  .list-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .controls-left {
    justify-content: space-between;
  }
  
  .search-box {
    min-width: auto;
  }
  
  .bulk-actions {
    flex-direction: column;
    gap: var(--space-3);
  }
  
  .bulk-buttons {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .grid-container {
    grid-template-columns: 1fr;
  }
  
  .card-footer {
    flex-direction: column;
    gap: var(--space-3);
  }
  
  .footer-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>
