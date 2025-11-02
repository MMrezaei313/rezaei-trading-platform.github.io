<template>
  <div class="model-trainer">
    <div class="trainer-header">
      <h2>آموزش مدل جدید</h2>
      <p>پارامترهای آموزش مدل هوش مصنوعی را تنظیم کنید</p>
    </div>

    <form @submit.prevent="startTraining" class="trainer-form">
      <!-- Model Configuration -->
      <div class="form-section">
        <h3>تنظیمات مدل</h3>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">نام مدل</label>
            <input
              v-model="config.name"
              type="text"
              class="form-input"
              placeholder="My AI Model"
              required
            >
          </div>
          <div class="form-group">
            <label class="form-label">نوع مدل</label>
            <select v-model="config.modelType" class="form-input" required>
              <option value="transformer">Transformer مالی</option>
              <option value="lstm">LSTM</option>
              <option value="cnn">CNN</option>
              <option value="ensemble">Ensemble</option>
              <option value="rl">یادگیری تقویتی</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">نمادها</label>
            <Multiselect
              v-model="config.symbols"
              :options="availableSymbols"
              :multiple="true"
              placeholder="انتخاب نمادها"
            />
          </div>
          <div class="form-group">
            <label class="form-label">تایم‌فریم</label>
            <select v-model="config.timeframe" class="form-input" required>
              <option value="1m">1 دقیقه</option>
              <option value="5m">5 دقیقه</option>
              <option value="15m">15 دقیقه</option>
              <option value="1h">1 ساعت</option>
              <option value="4h">4 ساعت</option>
              <option value="1d">1 روز</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Training Parameters -->
      <div class="form-section">
        <h3>پارامترهای آموزش</h3>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">دوره‌های آموزش (Epochs)</label>
            <input
              v-model.number="config.epochs"
              type="number"
              min="1"
              max="1000"
              class="form-input"
              required
            >
          </div>
          <div class="form-group">
            <label class="form-label">اندازه دسته (Batch Size)</label>
            <input
              v-model.number="config.batchSize"
              type="number"
              min="1"
              max="1024"
              class="form-input"
              required
            >
          </div>
          <div class="form-group">
            <label class="form-label">نرخ یادگیری</label>
            <input
              v-model.number="config.learningRate"
              type="number"
              step="0.0001"
              min="0.0001"
              max="0.1"
              class="form-input"
              required
            >
          </div>
          <div class="form-group">
            <label class="form-label">داده‌های آموزشی (%)</label>
            <input
              v-model.number="config.trainSplit"
              type="number"
              min="50"
              max="90"
              class="form-input"
              required
            >
          </div>
        </div>
      </div>

      <!-- Features -->
      <div class="form-section">
        <h3>ویژگی‌های مدل</h3>
        <div class="features-grid">
          <label
            v-for="feature in availableFeatures"
            :key="feature.id"
            class="feature-checkbox"
          >
            <input
              type="checkbox"
              :value="feature.id"
              v-model="config.features"
            >
            <span class="checkmark"></span>
            <span class="feature-label">{{ feature.label }}</span>
            <span class="feature-description">{{ feature.description }}</span>
          </label>
        </div>
      </div>

      <!-- Advanced Settings -->
      <div class="form-section">
        <h3>تنظیمات پیشرفته</h3>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">تابع loss</label>
            <select v-model="config.lossFunction" class="form-input">
              <option value="mse">MSE</option>
              <option value="mae">MAE</option>
              <option value="huber">Huber</option>
              <option value="custom">سفارشی</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">بهینه‌ساز</label>
            <select v-model="config.optimizer" class="form-input">
              <option value="adam">Adam</option>
              <option value="rmsprop">RMSprop</option>
              <option value="sgd">SGD</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">منظم‌سازی (Regularization)</label>
            <input
              v-model.number="config.regularization"
              type="number"
              step="0.001"
              min="0"
              max="0.1"
              class="form-input"
            >
          </div>
          <div class="form-group">
            <label class="form-label">Dropout Rate</label>
            <input
              v-model.number="config.dropout"
              type="number"
              step="0.1"
              min="0"
              max="0.5"
              class="form-input"
            >
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="form-actions">
        <button
          type="button"
          class="btn btn-secondary"
          @click="$emit('close')"
          :disabled="training"
        >
          انصراف
        </button>
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="!canTrain || training"
        >
          <span v-if="training" class="loading-spinner"></span>
          {{ training ? 'در حال آموزش...' : 'شروع آموزش' }}
        </button>
      </div>
    </form>

    <!-- Training Progress -->
    <div v-if="training" class="training-progress">
      <h4>پیشرفت آموزش</h4>
      <div class="progress-container">
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: `${trainingProgress}%` }"
          ></div>
        </div>
        <span class="progress-text">{{ trainingProgress }}%</span>
      </div>
      <div class="training-metrics">
        <div class="metric">
          <span>Loss:</span>
          <span class="value">{{ currentLoss.toFixed(4) }}</span>
        </div>
        <div class="metric">
          <span>Accuracy:</span>
          <span class="value">{{ currentAccuracy }}%</span>
        </div>
        <div class="metric">
          <span>Epoch:</span>
          <span class="value">{{ currentEpoch }}/{{ config.epochs }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useToast } from 'vue-toastification'

export default {
  name: 'ModelTrainer',
  emits: ['close', 'model-trained'],
  setup(props, { emit }) {
    const store = useStore()
    const toast = useToast()

    const training = ref(false)
    const trainingProgress = ref(0)
    const currentLoss = ref(0)
    const currentAccuracy = ref(0)
    const currentEpoch = ref(0)

    const config = ref({
      name: '',
      modelType: 'transformer',
      symbols: [],
      timeframe: '1h',
      epochs: 100,
      batchSize: 32,
      learningRate: 0.001,
      trainSplit: 80,
      features: ['price', 'volume', 'technical'],
      lossFunction: 'mse',
      optimizer: 'adam',
      regularization: 0.01,
      dropout: 0.2
    })

    const availableSymbols = ref(['BTC-USDT', 'ETH-USDT', 'ADA-USDT', 'DOT-USDT', 'XRP-USDT'])
    const availableFeatures = ref([
      { id: 'price', label: 'داده‌های قیمتی', description: 'Open, High, Low, Close' },
      { id: 'volume', label: 'حجم معاملات', description: 'Volume, OBV' },
      { id: 'technical', label: 'اندیکاتورهای تکنیکال', description: 'RSI, MACD, Moving Averages' },
      { id: 'sentiment', label: 'تحلیل احساسات', description: 'اخبار و شبکه‌های اجتماعی' },
      { id: 'orderbook', label: 'داده‌های Orderbook', description: 'عمق بازار' },
      { id: 'market', label: 'داده‌های بازار', description: 'Volatility, Spread' }
    ])

    // Computed properties
    const canTrain = computed(() => {
      return config.value.name &&
        config.value.symbols.length > 0 &&
        config.value.epochs > 0 &&
        config.value.features.length > 0
    })

    // Methods
    const startTraining = async () => {
      training.value = true
      
      try {
        // Simulate training progress
        const interval = setInterval(() => {
          trainingProgress.value += 1
          currentLoss.value = Math.max(0.001, currentLoss.value - 0.0005)
          currentAccuracy.value = Math.min(95, currentAccuracy.value + 0.5)
          currentEpoch.value = Math.floor((trainingProgress.value / 100) * config.value.epochs)
          
          if (trainingProgress.value >= 100) {
            clearInterval(interval)
            completeTraining()
          }
        }, 100)
        
      } catch (error) {
        toast.error('خطا در شروع آموزش مدل')
        training.value = false
      }
    }

    const completeTraining = async () => {
      try {
        const model = {
          id: Date.now(),
          ...config.value,
          accuracy: Math.round(currentAccuracy.value),
          status: 'trained',
          lastTrained: new Date().toISOString(),
          predictions: 0,
          profit: 0,
          deployed: false
        }
        
        await store.dispatch('ai/saveModel', model)
        emit('model-trained', model)
        toast.success('آموزش مدل با موفقیت завер شد')
        
      } catch (error) {
        toast.error('خطا در ذخیره مدل')
      } finally {
        training.value = false
      }
    }

    onMounted(() => {
      // Load available symbols
      store.dispatch('trading/fetchAvailableSymbols').then(symbols => {
        availableSymbols.value = symbols
      })
    })

    return {
      config,
      training,
      trainingProgress,
      currentLoss,
      currentAccuracy,
      currentEpoch,
      availableSymbols,
      availableFeatures,
      canTrain,
      startTraining
    }
  }
}
</script>

<style scoped>
.model-trainer {
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  padding: var(--spacing-lg);
}

.trainer-header {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
}

.trainer-header h2 {
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.trainer-header p {
  color: var(--text-muted);
}

.trainer-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xl);
}

.form-section {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: var(--spacing-lg);
}

.form-section h3 {
  color: var(--text-primary);
  margin-bottom: var(--spacing-lg);
  font-size: var(--font-size-lg);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
}

.features-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
}

.feature-checkbox {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.feature-checkbox:hover {
  border-color: var(--primary-color);
}

.feature-checkbox input[type="checkbox"] {
  opacity: 0;
  position: absolute;
}

.checkmark {
  width: 18px;
  height: 18px;
  border: 2px solid var(--border-color);
  border-radius: 4px;
  position: relative;
  flex-shrink: 0;
  margin-top: 2px;
  transition: all 0.2s ease;
}

.feature-checkbox input[type="checkbox"]:checked + .checkmark {
  background: var(--primary-color);
  border-color: var(--primary-color);
}

.feature-checkbox input[type="checkbox"]:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.feature-content {
  flex: 1;
}

.feature-label {
  display: block;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.feature-description {
  display: block;
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  line-height: 1.4;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-color);
}

.training-progress {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: var(--spacing-lg);
  margin-top: var(--spacing-lg);
}

.training-progress h4 {
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}

.progress-container {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: var(--bg-primary);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary-color);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-weight: 600;
  color: var(--text-primary);
  min-width: 40px;
}

.training-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
}

.metric {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm);
  background: var(--bg-card);
  border-radius: 4px;
  font-size: var(--font-size-sm);
}

.metric .value {
  font-weight: 600;
  color: var(--text-primary);
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

@media (max-width: 768px) {
  .model-trainer {
    padding: var(--spacing-md);
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .training-metrics {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>
