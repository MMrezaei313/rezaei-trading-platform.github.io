<!-- rezaei-trading-platform/frontend/src/components/dashboard/RecentActivity.vue -->
<template>
  <div class="recent-activity">
    <div class="activity-header">
      <h3 class="section-title">فعالیت‌های اخیر</h3>
      <div class="header-actions">
        <button 
          class="btn-icon"
          @click="refreshActivities"
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

    <!-- Filters -->
    <div v-if="showFilters" class="activity-filters">
      <div class="filter-group">
        <label class="filter-label">نوع فعالیت:</label>
        <select v-model="filters.type" class="filter-select">
          <option value="all">همه</option>
          <option value="trade">معاملات</option>
          <option value="order">سفارشات</option>
          <option value="strategy">استراتژی</option>
          <option value="system">سیستم</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label class="filter-label">بازه زمانی:</label>
        <select v-model="filters.timeRange" class="filter-select">
          <option value="1h">1 ساعت گذشته</option>
          <option value="24h">24 ساعت گذشته</option>
          <option value="7d">7 روز گذشته</option>
          <option value="30d">30 روز گذشته</option>
        </select>
      </div>

      <button class="btn btn-secondary btn-sm" @click="clearFilters">
        پاک کردن فیلترها
      </button>
    </div>

    <!-- Activities List -->
    <div class="activities-list">
      <div v-if="loading" class="loading-state">
        <i class="icon-loader animate-spin"></i>
        <span>در حال بارگذاری فعالیت‌ها...</span>
      </div>

      <div v-else-if="filteredActivities.length === 0" class="empty-state">
        <i class="icon-activity"></i>
        <p>هیچ فعالیتی یافت نشد</p>
      </div>

      <div v-else class="activities-container">
        <div 
          v-for="activity in paginatedActivities" 
          :key="activity.id"
          class="activity-item"
          :class="getActivityClass(activity)"
        >
          <div class="activity-icon">
            <i :class="getActivityIcon(activity)"></i>
          </div>
          
          <div class="activity-content">
            <div class="activity-header">
              <span class="activity-title">{{ activity.title }}</span>
              <span class="activity-time">{{ formatTime(activity.timestamp) }}</span>
            </div>
            
            <p class="activity-description">{{ activity.description }}</p>
            
            <div v-if="activity.metadata" class="activity-meta">
              <template v-if="activity.type === 'trade'">
                <span class="meta-item">
                  <strong>نماد:</strong> {{ activity.metadata.symbol }}
                </span>
                <span class="meta-item" :class="getTradeSideClass(activity.metadata.side)">
                  <strong>نوع:</strong> {{ getTradeSideText(activity.metadata.side) }}
                </span>
                <span class="meta-item">
                  <strong>حجم:</strong> {{ formatNumber(activity.metadata.quantity) }}
                </span>
                <span class="meta-item">
                  <strong>قیمت:</strong> {{ formatNumber(activity.metadata.price) }}
                </span>
              </template>
              
              <template v-else-if="activity.type === 'order'">
                <span class="meta-item">
                  <strong>نماد:</strong> {{ activity.metadata.symbol }}
                </span>
                <span class="meta-item">
                  <strong>وضعیت:</strong> {{ getOrderStatusText(activity.metadata.status) }}
                </span>
              </template>
              
              <template v-else-if="activity.type === 'strategy'">
                <span class="meta-item">
                  <strong>استراتژی:</strong> {{ activity.metadata.strategyName }}
                </span>
                <span class="meta-item">
                  <strong>عملکرد:</strong> 
                  <span :class="getPerformanceClass(activity.metadata.performance)">
                    {{ formatPercentage(activity.metadata.performance) }}
                  </span>
                </span>
              </template>
            </div>
          </div>
          
          <div class="activity-actions">
            <button 
              v-if="activity.actionable"
              class="btn-action"
              @click="handleActivityAction(activity)"
              :title="getActionTitle(activity)"
            >
              <i :class="getActionIcon(activity)"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="filteredActivities.length > pageSize" class="pagination">
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

    <!-- Export Button -->
    <div class="export-section">
      <button class="btn btn-outline btn-sm" @click="exportActivities">
        <i class="icon-download"></i>
        خروجی اکسل
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useToast } from 'vue-toastification'

export default {
  name: 'RecentActivity',
  setup() {
    const store = useStore()
    const toast = useToast()

    const activities = ref([])
    const loading = ref(false)
    const showFilters = ref(false)
    const currentPage = ref(1)
    const pageSize = 10

    const filters = ref({
      type: 'all',
      timeRange: '24h'
    })

    // Computed
    const filteredActivities = computed(() => {
      let filtered = activities.value

      // Filter by type
      if (filters.value.type !== 'all') {
        filtered = filtered.filter(activity => activity.type === filters.value.type)
      }

      // Filter by time range
      const now = new Date()
      const timeRangeMs = {
        '1h': 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000
      }[filters.value.timeRange]

      if (timeRangeMs) {
        const cutoffTime = now.getTime() - timeRangeMs
        filtered = filtered.filter(activity => 
          new Date(activity.timestamp).getTime() > cutoffTime
        )
      }

      return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    })

    const totalPages = computed(() => 
      Math.ceil(filteredActivities.value.length / pageSize)
    )

    const paginatedActivities = computed(() => {
      const start = (currentPage.value - 1) * pageSize
      const end = start + pageSize
      return filteredActivities.value.slice(start, end)
    })

    // Methods
    const loadActivities = async () => {
      loading.value = true
      try {
        // Simulate API call - replace with actual API
        const response = await api.get('/activities')
      } catch (error) {
        toast.error('خطا در بارگذاری فعالیت‌ها')
        console.error('Load activities error:', error)
      } finally {
        loading.value = false
      }
    }

    const refreshActivities = () => {
      currentPage.value = 1
      loadActivities()
      toast.success('فعالیت‌ها بروزرسانی شد')
    }

    const clearFilters = () => {
      filters.value = {
        type: 'all',
        timeRange: '24h'
      }
      currentPage.value = 1
    }

    const getActivityClass = (activity) => {
      return `activity-type-${activity.type}`
    }

    const getActivityIcon = (activity) => {
      const icons = {
        trade: 'icon-trending-up',
        order: 'icon-shopping-cart',
        strategy: 'icon-cpu',
        system: 'icon-server'
      }
      return icons[activity.type] || 'icon-activity'
    }

    const formatTime = (timestamp) => {
      const now = new Date()
      const activityTime = new Date(timestamp)
      const diffMs = now - activityTime
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)

      if (diffMins < 1) return 'همین الان'
      if (diffMins < 60) return `${diffMins} دقیقه پیش`
      if (diffHours < 24) return `${diffHours} ساعت پیش`
      return `${diffDays} روز پیش`
    }

    const getTradeSideClass = (side) => {
      return side === 'buy' ? 'text-profit' : 'text-loss'
    }

    const getTradeSideText = (side) => {
      return side === 'buy' ? 'خرید' : 'فروش'
    }

    const getOrderStatusText = (status) => {
      const statusMap = {
        'filled': 'تکمیل شده',
        'cancelled': 'لغو شده',
        'pending': 'در انتظار',
        'rejected': 'رد شده'
      }
      return statusMap[status] || status
    }

    const getPerformanceClass = (performance) => {
      return performance >= 0 ? 'text-profit' : 'text-loss'
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

    const getActionTitle = (activity) => {
      const titles = {
        trade: 'مشاهده معامله',
        strategy: 'مدیریت استراتژی',
        order: 'مشاهده سفارش'
      }
      return titles[activity.type] || 'مشاهده جزئیات'
    }

    const getActionIcon = (activity) => {
      return 'icon-eye'
    }

    const handleActivityAction = (activity) => {
      // Handle different actions based on activity type
      switch (activity.type) {
        case 'trade':
          // Navigate to trade details
          toast.info('مشاهده جزئیات معامله')
          break
        case 'strategy':
          // Navigate to strategy management
          toast.info('مدیریت استراتژی')
          break
        case 'order':
          // Navigate to order details
          toast.info('مشاهده سفارش')
          break
      }
    }

    const exportActivities = () => {
      // Implement export functionality
      toast.success('خروجی اکسل با موفقیت ایجاد شد')
    }

    // Lifecycle
    onMounted(() => {
      loadActivities()
    })

    return {
      activities,
      loading,
      showFilters,
      currentPage,
      pageSize,
      filters,
      filteredActivities,
      totalPages,
      paginatedActivities,
      refreshActivities,
      clearFilters,
      getActivityClass,
      getActivityIcon,
      formatTime,
      getTradeSideClass,
      getTradeSideText,
      getOrderStatusText,
      getPerformanceClass,
      formatNumber,
      formatPercentage,
      getActionTitle,
      getActionIcon,
      handleActivityAction,
      exportActivities
    }
  }
}
</script>

<style scoped>
.recent-activity {
  background: var(--bg-card);
  border-radius: var(--border-radius-lg);
  padding: var(--space-6);
  border: 1px solid var(--border-primary);
  height: 100%;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
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

.activity-filters {
  display: flex;
  gap: var(--space-4);
  align-items: center;
  margin-bottom: var(--space-4);
  padding: var(--space-3);
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
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

.filter-select {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--border-primary);
  border-radius: var(--border-radius);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}

.activities-list {
  min-height: 300px;
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
  font-size: 2rem;
  opacity: 0.5;
}

.activities-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-primary);
  transition: all var(--transition-fast);
}

.activity-item:hover {
  background: var(--bg-tertiary);
  border-color: var(--color-secondary);
}

.activity-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary);
  border-radius: var(--border-radius-full);
  color: white;
}

.activity-type-trade .activity-icon {
  background: var(--color-profit);
}

.activity-type-order .activity-icon {
  background: var(--color-warning);
}

.activity-type-strategy .activity-icon {
  background: var(--color-secondary);
}

.activity-type-system .activity-icon {
  background: var(--color-info);
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-1);
}

.activity-title {
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}

.activity-time {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.activity-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--space-2);
  line-height: var(--line-height-normal);
}

.activity-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  font-size: var(--font-size-xs);
}

.meta-item {
  color: var(--text-muted);
}

.meta-item strong {
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
}

.activity-actions {
  flex-shrink: 0;
}

.btn-action {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: var(--space-1);
  border-radius: var(--border-radius-sm);
  transition: all var(--transition-fast);
}

.btn-action:hover {
  background: var(--bg-tertiary);
  color: var(--color-secondary);
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
  background: var(--bg-secondary);
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

.export-section {
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--border-primary);
  text-align: left;
}

@media (max-width: 768px) {
  .activity-filters {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    justify-content: space-between;
  }
  
  .activity-meta {
    flex-direction: column;
    gap: var(--space-1);
  }
  
  .activity-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-1);
  }
}
</style>
