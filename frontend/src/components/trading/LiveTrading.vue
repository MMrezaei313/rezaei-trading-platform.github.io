<template>
  <div class="live-trading">
    <div class="trading-header">
      <h1>معاملات زنده</h1>
      <div class="trading-controls">
        <button 
          class="btn"
          :class="isTradingActive ? 'btn-danger' : 'btn-success'"
          @click="toggleTrading"
          :disabled="toggleLoading"
        >
          <span v-if="toggleLoading" class="loading-spinner small"></span>
          {{ isTradingActive ? 'توقف معاملات' : 'شروع معاملات' }}
        </button>
        <button class="btn btn-secondary" @click="showNewOrderModal = true">
          سفارش جدید
        </button>
      </div>
    </div>

    <!-- Trading Stats -->
    <div class="trading-stats">
      <div class="stat-item">
        <span class="stat-label">وضعیت:</span>
        <span class="stat-value" :class="isTradingActive ? 'active' : 'inactive'">
          {{ isTradingActive ? 'فعال' : 'غیرفعال' }}
        </span>
      </div>
      <div class="stat-item">
        <span class="stat-label">سفارشات فعال:</span>
        <span class="stat-value">{{ activeOrders.length }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">سود/زیان امروز:</span>
        <span class="stat-value" :class="todayPL >= 0 ? 'positive' : 'negative'">
          {{ formatCurrency(todayPL) }}
        </span>
      </div>
    </div>

    <!-- Orders Table -->
    <div class="orders-section">
      <div class="section-header">
        <h3>سفارشات فعال</h3>
        <div class="table-actions">
          <button class="btn btn-sm btn-secondary" @click="refreshOrders">
            بروزرسانی
          </button>
        </div>
      </div>
      
      <div class="table-container">
        <table class="orders-table">
          <thead>
            <tr>
              <th>نماد</th>
              <th>نوع</th>
              <th>حجم</th>
              <th>قیمت</th>
              <th>وضعیت</th>
              <th>زمان</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in activeOrders" :key="order.id">
              <td class="symbol-cell">
                <span class="symbol">{{ order.symbol }}</span>
                <span class="exchange">{{ order.exchange }}</span>
              </td>
              <td>
                <span :class="['order-type', order.side.toLowerCase()]">
                  {{ order.side === 'BUY' ? 'خرید' : 'فروش' }}
                </span>
              </td>
              <td>{{ order.quantity }}</td>
              <td>{{ formatCurrency(order.price) }}</td>
              <td>
                <span :class="['status-badge', order.status]">
                  {{ getStatusText(order.status) }}
                </span>
              </td>
              <td>{{ formatTime(order.timestamp) }}</td>
              <td>
                <button 
                  v-if="order.status === 'OPEN'"
                  class="btn btn-sm btn-danger"
                  @click="cancelOrder(order.id)"
                  :disabled="cancelLoading === order.id"
                >
                  <span v-if="cancelLoading === order.id" class="loading-spinner small"></span>
                  لغو
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div v-if="activeOrders.length === 0" class="empty-state">
          <p>هیچ سفارش فعالی وجود ندارد</p>
        </div>
      </div>
    </div>

    <!-- Positions -->
    <div class="positions-section">
      <div class="section-header">
        <h3>پوزیشن‌های باز</h3>
      </div>
      <PositionsList :positions="openPositions" />
    </div>

    <!-- New Order Modal -->
    <Modal v-if="showNewOrderModal" @close="showNewOrderModal = false">
      <NewOrderForm @order-placed="handleOrderPlaced" />
    </Modal>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useToast } from 'vue-toastification'
import Modal from '@/components/shared/Modal.vue'
import NewOrderForm from '@/components/trading/NewOrderForm.vue'
import PositionsList from '@/components/trading/PositionsList.vue'

export default {
  name: 'LiveTrading',
  components: {
    Modal,
    NewOrderForm,
    PositionsList
  },
  setup() {
    const store = useStore()
    const toast = useToast()

    const showNewOrderModal = ref(false)
    const toggleLoading = ref(false)
    const cancelLoading = ref(null)

    // Computed properties
    const isTradingActive = computed(() => store.getters['trading/isActive'])
    const activeOrders = computed(() => store.getters['trading/activeOrders'])
    const openPositions = computed(() => store.getters['trading/openPositions'])
    const todayPL = computed(() => store.getters['trading/todayProfitLoss'])

    // Methods
    const toggleTrading = async () => {
      toggleLoading.value = true
      try {
        if (isTradingActive.value) {
          await store.dispatch('trading/stopTrading')
          toast.success('معاملات متوقف شد')
        } else {
          await store.dispatch('trading/startTrading')
          toast.success('معاملات آغاز شد')
        }
      } catch (error) {
        toast.error('خطا در تغییر وضعیت معاملات')
      } finally {
        toggleLoading.value = false
      }
    }

    const cancelOrder = async (orderId) => {
      cancelLoading.value = orderId
      try {
        await store.dispatch('trading/cancelOrder', orderId)
        toast.success('سفارش با موفقیت لغو شد')
      } catch (error) {
        toast.error('خطا در لغو سفارش')
      } finally {
        cancelLoading.value = null
      }
    }

    const refreshOrders = async () => {
      try {
        await store.dispatch('trading/fetchActiveOrders')
        toast.success('سفارشات بروزرسانی شد')
      } catch (error) {
        toast.error('خطا در بروزرسانی سفارشات')
      }
    }

    const handleOrderPlaced = () => {
      showNewOrderModal.value = false
      refreshOrders()
    }

    const formatCurrency = (value) => {
      return new Intl.NumberFormat('fa-IR', {
        style: 'currency',
        currency: 'IRR'
      }).format(value)
    }

    const formatTime = (timestamp) => {
      return new Date(timestamp).toLocaleTimeString('fa-IR')
    }

    const getStatusText = (status) => {
      const statusMap = {
        'OPEN': 'باز',
        'FILLED': 'تکمیل شده',
        'CANCELLED': 'لغو شده',
        'REJECTED': 'رد شده',
        'PARTIAL': 'جزئی'
      }
      return statusMap[status] || status
    }

    onMounted(() => {
      refreshOrders()
      store.dispatch('trading/fetchOpenPositions')
    })

    return {
      showNewOrderModal,
      toggleLoading,
      cancelLoading,
      isTradingActive,
      activeOrders,
      openPositions,
      todayPL,
      toggleTrading,
      cancelOrder,
      refreshOrders,
      handleOrderPlaced,
      formatCurrency,
      formatTime,
      getStatusText
    }
  }
}
</script>

<style scoped>
.live-trading {
  padding: var(--spacing-lg);
}

.trading-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-2xl);
  flex-wrap: wrap;
  gap: var(--spacing-lg);
}

.trading-header h1 {
  color: var(--text-primary);
  margin-bottom: 0;
}

.trading-controls {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.trading-stats {
  display: flex;
  gap: var(--spacing-2xl);
  margin-bottom: var(--spacing-2xl);
  padding: var(--spacing-lg);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}

.stat-value {
  font-size: var(--font-size-lg);
  font-weight: 600;
}

.stat-value.active {
  color: var(--success-color);
}

.stat-value.inactive {
  color: var(--error-color);
}

.stat-value.positive {
  color: var(--success-color);
}

.stat-value.negative {
  color: var(--error-color);
}

.orders-section {
  margin-bottom: var(--spacing-2xl);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.section-header h3 {
  margin-bottom: 0;
  color: var(--text-primary);
}

.table-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.table-container {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
}

.orders-table th {
  background: var(--bg-secondary);
  padding: var(--spacing-md);
  text-align: right;
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color);
}

.orders-table td {
  padding: var(--spacing-md);
  text-align: right;
  border-bottom: 1px solid var(--border-color);
}

.orders-table tr:last-child td {
  border-bottom: none;
}

.orders-table tr:hover {
  background: var(--bg-secondary);
}

.symbol-cell {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.symbol {
  font-weight: 600;
  color: var(--text-primary);
}

.exchange {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.order-type {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 4px;
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-transform: uppercase;
}

.order-type.buy {
  background: rgba(76, 175, 80, 0.2);
  color: var(--success-color);
}

.order-type.sell {
  background: rgba(244, 67, 54, 0.2);
  color: var(--error-color);
}

.status-badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 4px;
  font-size: var(--font-size-xs);
  font-weight: 600;
}

.status-badge.OPEN {
  background: rgba(255, 167, 38, 0.2);
  color: var(--warning-color);
}

.status-badge.FILLED {
  background: rgba(76, 175, 80, 0.2);
  color: var(--success-color);
}

.status-badge.CANCELLED {
  background: rgba(158, 158, 158, 0.2);
  color: var(--text-muted);
}

.status-badge.REJECTED {
  background: rgba(244, 67, 54, 0.2);
  color: var(--error-color);
}

.empty-state {
  padding: var(--spacing-2xl);
  text-align: center;
  color: var(--text-muted);
}

.positions-section {
  margin-bottom: var(--spacing-2xl);
}

.loading-spinner.small {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.btn-sm {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-xs);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .live-trading {
    padding: var(--spacing-md);
  }
  
  .trading-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .trading-stats {
    gap: var(--spacing-lg);
  }
  
  .stat-item {
    flex: 1;
    min-width: 120px;
  }
  
  .orders-table {
    display: block;
    overflow-x: auto;
  }
  
  .table-actions {
    flex-direction: column;
  }
}
</style>
