<template>
  <div class="strategy-builder">
    <div class="builder-header">
      <h1>سازنده استراتژی</h1>
      <p>استراتژی معاملاتی خود را طراحی و تست کنید</p>
    </div>

    <div class="builder-layout">
      <!-- Strategy Configuration -->
      <div class="config-section">
        <div class="section-card">
          <h3>تنظیمات پایه</h3>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">نام استراتژی</label>
              <input
                v-model="strategy.name"
                type="text"
                class="form-input"
                placeholder="My Trading Strategy"
              >
            </div>
            <div class="form-group">
              <label class="form-label">نماد معاملاتی</label>
              <select v-model="strategy.symbol" class="form-input">
                <option v-for="symbol in availableSymbols" :key="symbol" :value="symbol">
                  {{ symbol }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">تایم‌فریم</label>
              <select v-model="strategy.timeframe" class="form-input">
                <option v-for="tf in timeframes" :key="tf" :value="tf">
                  {{ tf }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">نوع استراتژی</label>
              <select v-model="strategy.type" class="form-input">
                <option value="technical">تکنیکال</option>
                <option value="ai">هوش مصنوعی</option>
                <option value="hybrid">هیبرید</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Indicators -->
        <div class="section-card">
          <h3>اندیکاتورها</h3>
          <div class="indicators-list">
            <div
              v-for="indicator in selectedIndicators"
              :key="indicator.id"
              class="indicator-item"
            >
              <div class="indicator-header">
                <span class="indicator-name">{{ indicator.name }}</span>
                <button
                  class="btn btn-sm btn-danger"
                  @click="removeIndicator(indicator.id)"
                >
                  حذف
                </button>
              </div>
              <div class="indicator-params">
                <div
                  v-for="param in indicator.parameters"
                  :key="param.name"
                  class="param-row"
                >
                  <label class="param-label">{{ param.label }}</label>
                  <input
                    v-model="param.value"
                    :type="param.type"
                    class="param-input"
                  >
                </div>
              </div>
            </div>
          </div>
          <button class="btn btn-secondary" @click="showIndicatorModal = true">
            + افزودن اندیکاتور
          </button>
        </div>

        <!-- Entry/Exit Conditions -->
        <div class="section-card">
          <h3>شرایط ورود و خروج</h3>
          <div class="conditions-grid">
            <div class="condition-group">
              <h4>شرایط ورود (Buy)</h4>
              <ConditionBuilder
                v-model="strategy.entryConditions"
                :indicators="selectedIndicators"
              />
            </div>
            <div class="condition-group">
              <h4>شرایط خروج (Sell)</h4>
              <ConditionBuilder
                v-model="strategy.exitConditions"
                :indicators="selectedIndicators"
              />
            </div>
          </div>
        </div>

        <!-- Risk Management -->
        <div class="section-card">
          <h3>مدیریت ریسک</h3>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">حد ضرر (%)</label>
              <input
                v-model.number="strategy.stopLoss"
                type="number"
                step="0.1"
                min="0"
                max="100"
                class="form-input"
              >
            </div>
            <div class="form-group">
              <label class="form-label">حد سود (%)</label>
              <input
                v-model.number="strategy.takeProfit"
                type="number"
                step="0.1"
                min="0"
                max="1000"
                class="form-input"
              >
            </div>
            <div class="form-group">
              <label class="form-label">حداکثر موقعیت (%)</label>
              <input
                v-model.number="strategy.maxPosition"
                type="number"
                step="1"
                min="1"
                max="100"
                class="form-input"
              >
            </div>
            <div class="form-group">
              <label class="form-label">تعداد معاملات روزانه</label>
              <input
                v-model.number="strategy.maxDailyTrades"
                type="number"
                step="1"
                min="1"
                max="100"
                class="form-input"
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Preview and Actions -->
      <div class="preview-section">
        <div class="preview-card">
          <h3>پیش‌نمایش استراتژی</h3>
          <div class="preview-content">
            <StrategyPreview :strategy="strategy" />
          </div>
          <div class="action-buttons">
            <button
              class="btn btn-primary"
              :disabled="!isValidStrategy || testing"
              @click="testStrategy"
            >
              <span v-if="testing" class="loading-spinner"></span>
              تست استراتژی
            </button>
            <button
              class="btn btn-success"
              :disabled="!isValidStrategy || saving"
              @click="saveStrategy"
            >
              <span v-if="saving" class="loading-spinner"></span>
              ذخیره استراتژی
            </button>
            <button class="btn btn-secondary" @click="resetStrategy">
              ریست
            </button>
          </div>
        </div>

        <!-- Test Results -->
        <div v-if="testResults" class="results-card">
          <h3>نتایج تست</h3>
          <BacktestResults :results="testResults" />
        </div>
      </div>
    </div>

    <!-- Indicator Modal -->
    <Modal v-if="showIndicatorModal" @close="showIndicatorModal = false">
      <IndicatorSelector @indicator-selected="addIndicator" />
    </Modal>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useToast } from 'vue-toastification'
import ConditionBuilder from '@/components/strategies/ConditionBuilder.vue'
import StrategyPreview from '@/components/strategies/StrategyPreview.vue'
import BacktestResults from '@/components/backtesting/BacktestResults.vue'
import IndicatorSelector from '@/components/strategies/IndicatorSelector.vue'
import Modal from '@/components/shared/Modal.vue'

export default {
  name: 'StrategyBuilder',
  components: {
    ConditionBuilder,
    StrategyPreview,
    BacktestResults,
    IndicatorSelector,
    Modal
  },
  setup() {
    const store = useStore()
    const toast = useToast()

    const showIndicatorModal = ref(false)
    const testing = ref(false)
    const saving = ref(false)
    const testResults = ref(null)

    const strategy = ref({
      name: '',
      symbol: 'BTC-USDT',
      timeframe: '1h',
      type: 'technical',
      entryConditions: [],
      exitConditions: [],
      indicators: [],
      stopLoss: 2,
      takeProfit: 5,
      maxPosition: 10,
      maxDailyTrades: 5
    })

    const availableSymbols = ref(['BTC-USDT', 'ETH-USDT', 'ADA-USDT', 'DOT-USDT'])
    const timeframes = ref(['1m', '5m', '15m', '1h', '4h', '1d', '1w'])
    const selectedIndicators = ref([])

    // Computed properties
    const isValidStrategy = computed(() => {
      return strategy.value.name &&
        strategy.value.symbol &&
        strategy.value.entryConditions.length > 0 &&
        strategy.value.exitConditions.length > 0
    })

    // Methods
    const addIndicator = (indicator) => {
      const newIndicator = {
        id: Date.now(),
        ...indicator,
        parameters: indicator.parameters.map(p => ({
          ...p,
          value: p.default
        }))
      }
      selectedIndicators.value.push(newIndicator)
      strategy.value.indicators.push(newIndicator)
      showIndicatorModal.value = false
    }

    const removeIndicator = (id) => {
      const index = selectedIndicators.value.findIndex(ind => ind.id === id)
      if (index > -1) {
        selectedIndicators.value.splice(index, 1)
        strategy.value.indicators.splice(index, 1)
      }
    }

    const testStrategy = async () => {
      testing.value = true
      try {
        const result = await store.dispatch('strategies/testStrategy', strategy.value)
        testResults.value = result
        toast.success('تست استراتژی با موفقیت انجام شد')
      } catch (error) {
        toast.error('خطا در تست استراتژی')
      } finally {
        testing.value = false
      }
    }

    const saveStrategy = async () => {
      saving.value = true
      try {
        await store.dispatch('strategies/saveStrategy', strategy.value)
        toast.success('استراتژی با موفقیت ذخیره شد')
        resetStrategy()
      } catch (error) {
        toast.error('خطا در ذخیره استراتژی')
      } finally {
        saving.value = false
      }
    }

    const resetStrategy = () => {
      strategy.value = {
        name: '',
        symbol: 'BTC-USDT',
        timeframe: '1h',
        type: 'technical',
        entryConditions: [],
        exitConditions: [],
        indicators: [],
        stopLoss: 2,
        takeProfit: 5,
        maxPosition: 10,
        maxDailyTrades: 5
      }
      selectedIndicators.value = []
      testResults.value = null
    }

    onMounted(() => {
      store.dispatch('strategies/fetchAvailableIndicators')
    })

    return {
      strategy,
      availableSymbols,
      timeframes,
      selectedIndicators,
      showIndicatorModal,
      testing,
      saving,
      testResults,
      isValidStrategy,
      addIndicator,
      removeIndicator,
      testStrategy,
      saveStrategy,
      resetStrategy
    }
  }
}
</script>

<style scoped>
.strategy-builder {
  padding: var(--spacing-lg);
  height: 100vh;
  overflow-y: auto;
}

.builder-header {
  margin-bottom: var(--spacing-2xl);
  text-align: center;
}

.builder-header h1 {
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.builder-header p {
  color: var(--text-muted);
  font-size: var(--font-size-lg);
}

.builder-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--spacing-lg);
  align-items: start;
}

.config-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.section-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: var(--spacing-lg);
}

.section-card h3 {
  color: var(--text-primary);
  margin-bottom: var(--spacing-lg);
  font-size: var(--font-size-lg);
}

.section-card h4 {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
  font-size: var(--font-size-base);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
}

.indicators-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.indicator-item {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: var(--spacing-md);
}

.indicator-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.indicator-name {
  font-weight: 600;
  color: var(--text-primary);
}

.indicator-params {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-sm);
}

.param-row {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.param-label {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}

.param-input {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: var(--spacing-xs) var(--spacing-sm);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}

.conditions-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
}

.condition-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.preview-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  position: sticky;
  top: var(--spacing-lg);
}

.preview-card,
.results-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: var(--spacing-lg);
}

.preview-content {
  margin-bottom: var(--spacing-lg);
  min-height: 200px;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.loading-spinner {
  width: 16px;
  height: 16px;
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

@media (max-width: 1200px) {
  .builder-layout {
    grid-template-columns: 1fr;
  }
  
  .preview-section {
    position: static;
  }
}

@media (max-width: 768px) {
  .strategy-builder {
    padding: var(--spacing-md);
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .conditions-grid {
    grid-template-columns: 1fr;
  }
  
  .indicator-params {
    grid-template-columns: 1fr;
  }
}
</style>
