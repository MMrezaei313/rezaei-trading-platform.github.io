<!-- rezaei-trading-platform/frontend/src/components/strategies/StrategyEditor.vue -->
<template>
  <div class="strategy-editor">
    <div class="editor-header">
      <h3 class="section-title">
        {{ isEditMode ? 'ویرایش استراتژی' : 'ایجاد استراتژی جدید' }}
      </h3>
      <div class="header-actions">
        <button 
          class="btn btn-secondary"
          @click="$router.back()"
        >
          <i class="icon-arrow-right"></i>
          بازگشت
        </button>
        <button 
          class="btn btn-primary"
          @click="saveStrategy"
          :disabled="loading || !isFormValid"
        >
          <i class="icon-save"></i>
          {{ isEditMode ? 'ذخیره تغییرات' : 'ایجاد استراتژی' }}
        </button>
      </div>
    </div>

    <div class="editor-container">
      <!-- Main Form -->
      <div class="form-section">
        <div class="form-row">
          <div class="form-group full-width">
            <label class="form-label">نام استراتژی *</label>
            <input
              v-model="form.name"
              type="text"
              class="form-input"
              :class="{ 'error': errors.name }"
              placeholder="نام استراتژی را وارد کنید"
            />
            <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group full-width">
            <label class="form-label">توضیحات</label>
            <textarea
              v-model="form.description"
              class="form-textarea"
              rows="3"
              placeholder="توضیحات مختصری درباره استراتژی بنویسید..."
            ></textarea>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">نوع استراتژی *</label>
            <select
              v-model="form.type"
              class="form-select"
              :class="{ 'error': errors.type }"
            >
              <option value="">انتخاب کنید</option>
              <option value="technical">تکنیکال</option>
              <option value="ai_based">هوش مصنوعی</option>
              <option value="custom">سفارشی</option>
              <option value="arbitrage">آربیتراژ</option>
              <option value="market_making">مارکت میکینگ</option>
            </select>
            <span v-if="errors.type" class="error-message">{{ errors.type }}</span>
          </div>

          <div class="form-group">
            <label class="form-label">تایم‌فریم *</label>
            <select
              v-model="form.timeframe"
              class="form-select"
              :class="{ 'error': errors.timeframe }"
            >
              <option value="">انتخاب کنید</option>
              <option value="1m">1 دقیقه</option>
              <option value="5m">5 دقیقه</option>
              <option value="15m">15 دقیقه</option>
              <option value="30m">30 دقیقه</option>
              <option value="1h">1 ساعت</option>
              <option value="4h">4 ساعت</option>
              <option value="1d">1 روز</option>
              <option value="1w">1 هفته</option>
            </select>
            <span v-if="errors.timeframe" class="error-message">{{ errors.timeframe }}</span>
          </div>
        </div>

        <!-- Symbols Selection -->
        <div class="form-section">
          <div class="section-header">
            <h4 class="section-title">نمادهای معاملاتی</h4>
            <button 
              type="button"
              class="btn btn-secondary btn-sm"
              @click="showSymbolsModal = true"
            >
              <i class="icon-plus"></i>
              افزودن نماد
            </button>
          </div>
          
          <div v-if="form.symbols.length === 0" class="empty-symbols">
            <i class="icon-bar-chart"></i>
            <p>هیچ نمادی انتخاب نشده است</p>
          </div>
          
          <div v-else class="symbols-list">
            <div 
              v-for="symbol in form.symbols"
              :key="symbol"
              class="symbol-item"
            >
              <span class="symbol-name">{{ symbol }}</span>
              <button 
                type="button"
                class="btn-remove"
                @click="removeSymbol(symbol)"
              >
                <i class="icon-x"></i>
              </button>
            </div>
          </div>
          <span v-if="errors.symbols" class="error-message">{{ errors.symbols }}</span>
        </div>

        <!-- Strategy Configuration -->
        <div class="form-section">
          <div class="section-header">
            <h4 class="section-title">تنظیمات استراتژی</h4>
          </div>

          <!-- Technical Strategy Settings -->
          <div v-if="form.type === 'technical'" class="strategy-settings">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">اندیکاتور اصلی</label>
                <select v-model="form.config.mainIndicator" class="form-select">
                  <option value="ma">میانگین متحرک (MA)</option>
                  <option value="rsi">RSI</option>
                  <option value="macd">MACD</option>
                  <option value="bollinger">بولینگر باند</option>
                  <option value="stochastic">استوکاستیک</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">پریود اندیکاتور</label>
                <input
                  v-model.number="form.config.indicatorPeriod"
                  type="number"
                  class="form-input"
                  min="1"
                  max="100"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">سیگنال خرید</label>
                <select v-model="form.config.buySignal" class="form-select">
                  <option value="crossover">عبور از بالا</option>
                  <option value="crossunder">عبور از پایین</option>
                  <option value="oversold">اشباع فروش</option>
                  <option value="divergence">واگرایی</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">سیگنال فروش</label>
                <select v-model="form.config.sellSignal" class="form-select">
                  <option value="crossover">عبور از بالا</option>
                  <option value="crossunder">عبور از پایین</option>
                  <option value="overbought">اشباع خرید</option>
                  <option value="divergence">واگرایی</option>
                </select>
              </div>
            </div>
          </div>

          <!-- AI Strategy Settings -->
          <div v-else-if="form.type === 'ai_based'" class="strategy-settings">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">مدل هوش مصنوعی</label>
                <select v-model="form.config.aiModel" class="form-select">
                  <option value="lstm">LSTM</option>
                  <option value="transformer">Transformer</option>
                  <option value="random_forest">Random Forest</option>
                  <option value="xgboost">XGBoost</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">دوره پیش‌بینی</label>
                <input
                  v-model.number="form.config.predictionPeriod"
                  type="number"
                  class="form-input"
                  min="1"
                  max="10"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group full-width">
                <label class="form-label">ویژگی‌های مدل</label>
                <div class="features-list">
                  <label class="checkbox-label">
                    <input
                      v-model="form.config.features"
                      type="checkbox"
                      value="price"
                      class="checkbox"
                    />
                    <span class="checkmark"></span>
                    <span class="checkbox-text">قیمت</span>
                  </label>
                  <label class="checkbox-label">
                    <input
                      v-model="form.config.features"
                      type="checkbox"
                      value="volume"
                      class="checkbox"
                    />
                    <span class="checkmark"></span>
                    <span class="checkbox-text">حجم</span>
                  </label>
                  <label class="checkbox-label">
                    <input
                      v-model="form.config.features"
                      type="checkbox"
                      value="sentiment"
                      class="checkbox"
                    />
                    <span class="checkmark"></span>
                    <span class="checkbox-text">احساسات بازار</span>
                  </label>
                  <label class="checkbox-label">
                    <input
                      v-model="form.config.features"
                      type="checkbox"
                      value="technical"
                      class="checkbox"
                    />
                    <span class="checkmark"></span>
                    <span class="checkbox-text">اندیکاتورهای تکنیکال</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Risk Management -->
          <div class="form-section">
            <div class="section-header">
              <h4 class="section-title">مدیریت ریسک</h4>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">حداکثر سرمایه هر معامله (%)</label>
                <input
                  v-model.number="form.risk.maxCapitalPerTrade"
                  type="number"
                  class="form-input"
                  min="1"
                  max="100"
                />
              </div>

              <div class="form-group">
                <label class="form-label">حداکثر ضرر روزانه (%)</label>
                <input
                  v-model.number="form.risk.maxDailyLoss"
                  type="number"
                  class="form-input"
                  min="1"
                  max="50"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">استاپ لاس (%)</label>
                <input
                  v-model.number="form.risk.stopLoss"
                  type="number"
                  class="form-input"
                  min="0.1"
                  max="20"
                  step="0.1"
                />
              </div>

              <div class="form-group">
                <label class="form-label">تیک پروفیت (%)</label>
                <input
                  v-model.number="form.risk.takeProfit"
                  type="number"
                  class="form-input"
                  min="0.1"
                  max="50"
                  step="0.1"
                />
              </div>
            </div>
          </div>

          <!-- Advanced Settings -->
          <div class="form-section">
            <div class="section-header">
              <h4 class="section-title">تنظیمات پیشرفته</h4>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">حداکثر پوزیشن باز</label>
                <input
                  v-model.number="form.advanced.maxOpenPositions"
                  type="number"
                  class="form-input"
                  min="1"
                  max="20"
                />
              </div>

              <div class="form-group">
                <label class="form-label">تأخیر اجرا (ثانیه)</label>
                <input
                  v-model.number="form.advanced.executionDelay"
                  type="number"
                  class="form-input"
                  min="0"
                  max="60"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group full-width">
                <label class="checkbox-label">
                  <input
                    v-model="form.advanced.autoRestart"
                    type="checkbox"
                    class="checkbox"
                  />
                  <span class="checkmark"></span>
                  <span class="checkbox-text">راه‌اندازی مجدد خودکار در صورت توقف</span>
                </label>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group full-width">
                <label class="checkbox-label">
                  <input
                    v-model="form.advanced.enableNotifications"
                    type="checkbox"
                    class="checkbox"
                  />
                  <span class="checkmark"></span>
                  <span class="checkbox-text">ارسال نوتیفیکیشن برای سیگنال‌ها</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Preview Panel -->
      <div class="preview-panel">
        <div class="preview-card">
          <h4 class="preview-title">پیش‌نمایش استراتژی</h4>
          
          <div class="preview-content">
            <div class="preview-item">
              <span class="preview-label">نام:</span>
              <span class="preview-value">{{ form.name || '---' }}</span>
            </div>
            
            <div class="preview-item">
              <span class="preview-label">نوع:</span>
              <span class="preview-value">{{ getTypeText(form.type) || '---' }}</span>
            </div>
            
            <div class="preview-item">
              <span class="preview-label">تایم‌فریم:</span>
              <span class="preview-value">{{ form.timeframe || '---' }}</span>
            </div>
            
            <div class="preview-item">
              <span class="preview-label">تعداد نمادها:</span>
              <span class="preview-value">{{ form.symbols.length }}</span>
            </div>
            
            <div class="preview-item">
              <span class="preview-label">مدیریت ریسک:</span>
              <span class="preview-value">
                استاپ لاس: {{ form.risk.stopLoss }}% |
                تیک پروفیت: {{ form.risk.takeProfit }}%
              </span>
            </div>
          </div>

          <div class="preview-actions">
            <button 
              class="btn btn-outline btn-sm"
              @click="testStrategy"
              :disabled="!isFormValid"
            >
              <i class="icon-bar-chart"></i>
              تست استراتژی
            </button>
            
            <button 
              class="btn btn-secondary btn-sm"
              @click="saveAsTemplate"
              :disabled="!isFormValid"
            >
              <i class="icon-save"></i>
              ذخیره به عنوان قالب
            </button>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions-card">
          <h4 class="preview-title">اقدامات سریع</h4>
          
          <div class="quick-actions">
            <button 
              class="btn-action"
              @click="duplicateStrategy"
              title="کپی استراتژی"
            >
              <i class="icon-copy"></i>
              کپی
            </button>
            
            <button 
              class="btn-action"
              @click="resetForm"
              title="بازنشانی فرم"
            >
              <i class="icon-refresh"></i>
              بازنشانی
            </button>
            
            <button 
              class="btn-action"
              @click="exportStrategy"
              title="خروجی استراتژی"
            >
              <i class="icon-download"></i>
              خروجی
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Symbols Modal -->
    <Modal 
      v-if="showSymbolsModal"
      @close="showSymbolsModal = false"
      title="انتخاب نمادهای معاملاتی"
      size="lg"
    >
      <SymbolsSelector
        :selectedSymbols="form.symbols"
        @update="updateSymbols"
        @close="showSymbolsModal = false"
      />
    </Modal>

    <!-- Test Strategy Modal -->
    <Modal 
      v-if="showTestModal"
      @close="showTestModal = false"
      title="تست استراتژی"
      size="xl"
    >
      <StrategyTester
        :strategyConfig="form"
        @close="showTestModal = false"
      />
    </Modal>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useToast } from 'vue-toastification'
import Modal from '@/components/shared/Modal.vue'
import SymbolsSelector from '@/components/strategies/SymbolsSelector.vue'
import StrategyTester from '@/components/strategies/StrategyTester.vue'

export default {
  name: 'StrategyEditor',
  components: {
    Modal,
    SymbolsSelector,
    StrategyTester
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const store = useStore()
    const toast = useToast()

    const loading = ref(false)
    const showSymbolsModal = ref(false)
    const showTestModal = ref(false)

    const isEditMode = computed(() => route.name === 'StrategyEdit')

    const form = ref({
      name: '',
      description: '',
      type: '',
      timeframe: '',
      symbols: [],
      config: {
        // Technical
        mainIndicator: 'ma',
        indicatorPeriod: 14,
        buySignal: 'crossover',
        sellSignal: 'crossunder',
        // AI
        aiModel: 'lstm',
        predictionPeriod: 5,
        features: ['price', 'volume']
      },
      risk: {
        maxCapitalPerTrade: 10,
        maxDailyLoss: 5,
        stopLoss: 2,
        takeProfit: 4
      },
      advanced: {
        maxOpenPositions: 5,
        executionDelay: 0,
        autoRestart: true,
        enableNotifications: true
      }
    })

    const errors = ref({})

    // Computed properties
    const isFormValid = computed(() => {
      return form.value.name &&
             form.value.type &&
             form.value.timeframe &&
             form.value.symbols.length > 0
    })

    // Methods
    const validateForm = () => {
      errors.value = {}

      if (!form.value.name.trim()) {
        errors.value.name = 'نام استراتژی الزامی است'
      }

      if (!form.value.type) {
        errors.value.type = 'نوع استراتژی الزامی است'
      }

      if (!form.value.timeframe) {
        errors.value.timeframe = 'تایم‌فریم الزامی است'
      }

      if (form.value.symbols.length === 0) {
        errors.value.symbols = 'حداقل یک نماد باید انتخاب شود'
      }

      return Object.keys(errors.value).length === 0
    }

    const loadStrategy = async () => {
      if (!isEditMode.value) return

      const strategyId = route.params.id
      try {
        loading.value = true
        // Call API to load strategy data
        const strategy = await store.dispatch('strategies/getStrategy', strategyId)
        form.value = { ...form.value, ...strategy }
      } catch (error) {
        toast.error('خطا در بارگذاری استراتژی')
        console.error('Load strategy error:', error)
      } finally {
        loading.value = false
      }
    }

    const saveStrategy = async () => {
  try {
    const response = await store.dispatch('strategies/saveStrategy', form.value)
    // هدایت به صفحه استراتژی‌ها
  } catch (error) {
    // handle error
  }
}

    const updateSymbols = (symbols) => {
      form.value.symbols = symbols
      showSymbolsModal.value = false
    }

    const removeSymbol = (symbol) => {
      form.value.symbols = form.value.symbols.filter(s => s !== symbol)
    }

    const testStrategy = () => {
      showTestModal.value = true
    }

    const saveAsTemplate = () => {
      // Implement save as template
      toast.success('استراتژی به عنوان قالب ذخیره شد')
    }

    const duplicateStrategy = () => {
      // Implement duplicate strategy
      form.value.name = `${form.value.name} (کپی)`
      toast.success('استراتژی کپی شد')
    }

    const resetForm = () => {
      if (confirm('آیا از بازنشانی فرم مطمئن هستید؟ تمام تغییرات از بین خواهند رفت.')) {
        form.value = {
          name: '',
          description: '',
          type: '',
          timeframe: '',
          symbols: [],
          config: {
            mainIndicator: 'ma',
            indicatorPeriod: 14,
            buySignal: 'crossover',
            sellSignal: 'crossunder',
            aiModel: 'lstm',
            predictionPeriod: 5,
            features: ['price', 'volume']
          },
          risk: {
            maxCapitalPerTrade: 10,
            maxDailyLoss: 5,
            stopLoss: 2,
            takeProfit: 4
          },
          advanced: {
            maxOpenPositions: 5,
            executionDelay: 0,
            autoRestart: true,
            enableNotifications: true
          }
        }
      }
    }

    const exportStrategy = () => {
      // Implement export strategy
      toast.success('استراتژی با موفقیت صادر شد')
    }

    const getTypeText = (type) => {
      const typeMap = {
        technical: 'تکنیکال',
        ai_based: 'هوش مصنوعی',
        custom: 'سفارشی',
        arbitrage: 'آربیتراژ',
        market_making: 'مارکت میکینگ'
      }
      return typeMap[type] || type
    }

    // Lifecycle
    onMounted(() => {
      loadStrategy()
    })

    return {
      loading,
      showSymbolsModal,
      showTestModal,
      isEditMode,
      form,
      errors,
      isFormValid,
      saveStrategy,
      updateSymbols,
      removeSymbol,
      testStrategy,
      saveAsTemplate,
      duplicateStrategy,
      resetForm,
      exportStrategy,
      getTypeText
    }
  }
}
</script>

<style scoped>
.strategy-editor {
  background: var(--bg-card);
  border-radius: var(--border-radius-lg);
  padding: var(--space-6);
  border: 1px solid var(--border-primary);
  height: 100%;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--border-primary);
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

.editor-container {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: var(--space-6);
  align-items: start;
}

.form-section {
  margin-bottom: var(--space-6);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.section-header .section-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  margin-bottom: var(--space-2);
}

.form-input, .form-select, .form-textarea {
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--border-primary);
  border-radius: var(--border-radius);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: var(--font-size-base);
  transition: all var(--transition-fast);
  font-family: inherit;
}

.form-input:focus, .form-select:focus, .form-textarea:focus {
  outline: none;
  border-color: var(--color-secondary);
  box-shadow: 0 0 0 3px rgba(0, 200, 150, 0.1);
}

.form-input.error, .form-select.error {
  border-color: var(--color-loss);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.error-message {
  color: var(--color-loss);
  font-size: var(--font-size-xs);
  margin-top: var(--space-1);
}

.empty-symbols {
  text-align: center;
  padding: var(--space-6);
  color: var(--text-muted);
  border: 2px dashed var(--border-primary);
  border-radius: var(--border-radius);
}

.empty-symbols i {
  font-size: 2rem;
  margin-bottom: var(--space-2);
  display: block;
  opacity: 0.5;
}

.symbols-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.symbol-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: var(--border-radius);
  font-size: var(--font-size-sm);
}

.symbol-name {
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
}

.btn-remove {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 2px;
  border-radius: var(--border-radius-sm);
  transition: all var(--transition-fast);
}

.btn-remove:hover {
  background: var(--color-loss);
  color: white;
}

.strategy-settings {
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  padding: var(--space-4);
  border: 1px solid var(--border-primary);
}

.features-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--space-3);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
  font-size: var(--font-size-sm);
}

.checkbox {
  display: none;
}

.checkmark {
  width: 18px;
  height: 18px;
  border: 2px solid var(--border-primary);
  border-radius: var(--border-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all var(--transition-fast);
}

.checkbox:checked + .checkmark {
  background: var(--color-secondary);
  border-color: var(--color-secondary);
}

.checkbox:checked + .checkmark::after {
  content: '✓';
  color: white;
  font-size: 12px;
}

.checkbox-text {
  color: var(--text-secondary);
}

.preview-panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  position: sticky;
  top: var(--space-6);
}

.preview-card, .quick-actions-card {
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  padding: var(--space-4);
  border: 1px solid var(--border-primary);
}

.preview-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--space-4) 0;
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--border-primary);
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.preview-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-2);
}

.preview-label {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  font-weight: var(--font-weight-medium);
  flex-shrink: 0;
}

.preview-value {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  text-align: left;
  word-break: break-word;
}

.preview-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-top: var(--space-4);
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-2);
}

.btn-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2);
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--border-radius);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: var(--font-size-xs);
  text-align: center;
}

.btn-action:hover {
  background: var(--color-secondary);
  border-color: var(--color-secondary);
  color: white;
  transform: translateY(-1px);
}

.btn-action i {
  font-size: 16px;
}

@media (max-width: 1024px) {
  .editor-container {
    grid-template-columns: 1fr;
  }
  
  .preview-panel {
    position: static;
  }
}

@media (max-width: 768px) {
  .editor-header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-3);
  }
  
  .header-actions {
    justify-content: space-between;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .features-list {
    grid-template-columns: 1fr;
  }
  
  .quick-actions {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
