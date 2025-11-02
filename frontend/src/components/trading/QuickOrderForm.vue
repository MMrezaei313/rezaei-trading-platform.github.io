<template>
  <div class="quick-order-form">
    <div class="form-header">
      <h3>سفارش سریع</h3>
    </div>

    <form @submit.prevent="placeOrder" class="order-form">
      <!-- Order Type -->
      <div class="form-group">
        <label class="form-label">نوع سفارش</label>
        <div class="order-type-buttons">
          <button
            type="button"
            :class="['type-btn', { active: orderType === 'MARKET' }]"
            @click="orderType = 'MARKET'"
          >
            بازار
          </button>
          <button
            type="button"
            :class="['type-btn', { active: orderType === 'LIMIT' }]"
            @click="orderType = 'LIMIT'"
          >
            محدود
          </button>
        </div>
      </div>

      <!-- Side Selection -->
      <div class="form-group">
        <label class="form-label">نوع معامله</label>
        <div class="side-buttons">
          <button
            type="button"
            :class="['side-btn', 'buy', { active: side === 'BUY' }]"
            @click="side = 'BUY'"
          >
            خرید
          </button>
          <button
            type="button"
            :class="['side-btn', 'sell', { active: side === 'SELL' }]"
            @click="side = 'SELL'"
          >
            فروش
          </button>
        </div>
      </div>

      <!-- Quantity -->
      <div class="form-group">
        <label for="quantity" class="form-label">مقدار</label>
        <input
          id="quantity"
          v-model.number="quantity"
          type="number"
          step="0.001"
          min="0"
          class="form-input"
          placeholder="0.00"
          required
        >
        <div class="quantity-buttons">
          <button 
            type="button" 
            v-for="percent in [25, 50, 75, 100]" 
            :key="percent"
            class="percent-btn"
            @click="setQuantityPercent(percent)"
          >
            {{ percent }}%
          </button>
        </div>
      </div>

      <!-- Price (for limit orders) -->
      <div v-if="orderType === 'LIMIT'" class="form-group">
        <label for="price" class="form-label">قیمت</label>
        <input
          id="price"
          v-model.number="price"
          type="number"
          step="0.01"
          min="0"
          class="form-input"
          placeholder="0.00"
          required
        >
        <div class="price-buttons">
          <button 
            type="button" 
            class="price-btn"
            @click="price = currentPrice * 0.99"
          >
            -1%
          </button>
          <button 
            type="button" 
            class="price-btn"
            @click="price = currentPrice"
          >
            بازار
          </button>
          <button 
            type="button" 
            class="price-btn"
            @click="price = currentPrice * 1.01"
          >
            +1%
          </button>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="order-summary">
        <div class="summary-item">
          <span>هزینه کل:</span>
          <span class="value">{{ totalCost }} ₮</span>
        </div>
        <div v-if="orderType === 'MARKET'" class="summary-item">
          <span>تخمین قیمت:</span>
          <span class="value">{{ estimatedPrice }} ₮</span>
        </div>
        <div class="summary-item fee">
          <span>کارمزد:</span>
          <span class="value">{{ fee }} ₮</span>
        </div>
      </div>

      <!-- Submit Button -->
      <button 
        type="submit" 
        class="submit-btn"
        :class="side.toLowerCase()"
        :disabled="!canSubmit || loading"
      >
        <span v-if="loading" class="loading-spinner"></span>
        {{ submitButtonText }}
      </button>
    </form>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { useToast } from 'vue-toastification'

export default {
  name: 'QuickOrderForm',
  props: {
    symbol: {
      type: String,
      required: true
    },
    currentPrice: {
      type: Number,
      required: true
    }
  },
  emits: ['order-created'],
  setup(props, { emit }) {
    const store = useStore()
    const toast = useToast()

    const orderType = ref('MARKET')
    const side = ref('BUY')
    const quantity = ref(0)
    const price = ref(0)
    const loading = ref(false)

    // Computed properties
    const totalCost = computed(() => {
      if (orderType.value === 'MARKET') {
        return (quantity.value * props.currentPrice).toFixed(2)
      }
      return (quantity.value * price.value).toFixed(2)
    })

    const estimatedPrice = computed(() => {
      return props.currentPrice.toFixed(2)
    })

    const fee = computed(() => {
      const cost = parseFloat(totalCost.value)
      return (cost * 0.001).toFixed(4) // 0.1% fee
    })

    const canSubmit = computed(() => {
      if (quantity.value <= 0) return false
      if (orderType.value === 'LIMIT' && price.value <= 0) return false
      return true
    })

    const submitButtonText = computed(() => {
      if (loading.value) {
        return 'در حال ثبت...'
      }
      const sideText = side.value === 'BUY' ? 'خرید' : 'فروش'
      const typeText = orderType.value === 'MARKET' ? 'بازار' : 'محدود'
      return `${sideText} ${typeText}`
    })

    // Methods
    const setQuantityPercent = (percent) => {
      // This would typically use available balance
      const maxQuantity = 1000 / props.currentPrice // Example max
      quantity.value = (maxQuantity * percent / 100).toFixed(4)
    }

    const placeOrder = async () => {
      if (!canSubmit.value) return

      loading.value = true

      try {
        const orderData = {
          symbol: props.symbol,
          side: side.value,
          type: orderType.value,
          quantity: parseFloat(quantity.value),
          price: orderType.value === 'LIMIT' ? parseFloat(price.value) : undefined
        }

        const result = await store.dispatch('trading/placeOrder', orderData)

        if (result.success) {
          toast.success('سفارش با موفقیت ثبت شد')
          emit('order-created', result.order)
          resetForm()
        } else {
          toast.error(result.error)
        }
      } catch (error) {
        toast.error('خطا در ثبت سفارش')
      } finally {
        loading.value = false
      }
    }

    const resetForm = () => {
      quantity.value = 0
      price.value = 0
    }

    // Watch current price for limit orders
    watch(() => props.currentPrice, (newPrice) => {
      if (orderType.value === 'LIMIT' && price.value === 0) {
        price.value = newPrice
      }
    })

    return {
      orderType,
      side,
      quantity,
      price,
      loading,
      totalCost,
      estimatedPrice,
      fee,
      canSubmit,
      submitButtonText,
      setQuantityPercent,
      placeOrder
    }
  }
}
</script>

<style scoped>
.quick-order-form {
  background: var(--bg-card);
  border-radius: 8px;
  padding: var(--spacing-lg);
}

.form-header {
  margin-bottom: var(--spacing-lg);
  text-align: center;
}

.form-header h3 {
  color: var(--text-primary);
  margin-bottom: 0;
}

.order-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.order-type-buttons,
.side-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-sm);
}

.type-btn,
.side-btn {
  padding: var(--spacing-sm);
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.type-btn.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.side-btn.buy.active {
  background: var(--success-color);
  border-color: var(--success-color);
  color: white;
}

.side-btn.sell.active {
  background: var(--error-color);
  border-color: var(--error-color);
  color: white;
}

.side-btn.buy:not(.active):hover {
  border-color: var(--success-color);
  color: var(--success-color);
}

.side-btn.sell:not(.active):hover {
  border-color: var(--error-color);
  color: var(--error-color);
}

.quantity-buttons,
.price-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-xs);
}

.percent-btn,
.price-btn {
  padding: var(--spacing-xs);
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: var(--font-size-xs);
}

.percent-btn:hover,
.price-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.order-summary {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.summary-item {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-sm);
}

.summary-item .value {
  font-weight: 600;
  color: var(--text-primary);
}

.summary-item.fee {
  color: var(--text-muted);
  font-size: var(--font-size-xs);
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--border-color);
}

.submit-btn {
  padding: var(--spacing-lg);
  border: none;
  border-radius: 8px;
  font-size: var(--font-size-base);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.submit-btn.buy {
  background: var(--success-color);
  color: white;
}

.submit-btn.buy:not(:disabled):hover {
  background: #45a049;
}

.submit-btn.sell {
  background: var(--error-color);
  color: white;
}

.submit-btn.sell:not(:disabled):hover {
  background: #da190b;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .quick-order-form {
    padding: var(--spacing-md);
  }
  
  .order-type-buttons,
  .side-buttons {
    grid-template-columns: 1fr;
  }
  
  .quantity-buttons,
  .price-buttons {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
