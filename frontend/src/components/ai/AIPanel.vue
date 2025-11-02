<template>
  <div class="ai-panel">
    <div class="panel-header">
      <h1>پنل هوش مصنوعی</h1>
      <p>مدیریت و آموزش مدل‌های هوش مصنوعی</p>
    </div>

    <div class="ai-dashboard">
      <!-- Model Status -->
      <div class="status-cards">
        <div class="status-card">
          <div class="status-icon">🧠</div>
          <div class="status-content">
            <div class="status-title">مدل‌های فعال</div>
            <div class="status-value">{{ activeModels.length }}</div>
          </div>
        </div>
        <div class="status-card">
          <div class="status-icon">📊</div>
          <div class="status-content">
            <div class="status-title">دقت متوسط</div>
            <div class="status-value">{{ averageAccuracy }}%</div>
          </div>
        </div>
        <div class="status-card">
          <div class="status-icon">⚡</div>
          <div class="status-content">
            <div class="status-title">پیش‌بینی‌های امروز</div>
            <div class="status-value">{{ todayPredictions }}</div>
          </div>
        </div>
        <div class="status-card">
          <div class="status-icon">💰</div>
          <div class="status-content">
            <div class="status-title">سود AI</div>
            <div class="status-value" :class="aiProfit >= 0 ? 'positive' : 'negative'">
              {{ aiProfit }}%
            </div>
          </div>
        </div>
      </div>

      <!-- Model Management -->
      <div class="management-section">
        <div class="section-header">
          <h3>مدیریت مدل‌ها</h3>
          <button class="btn btn-primary" @click="showModelTrainer = true">
            آموزش مدل جدید
          </button>
        </div>

        <div class="models-grid">
          <AIModelCard
            v-for="model in aiModels"
            :key="model.id"
            :model="model"
            @train="onModelTrain"
            @deploy="onModelDeploy"
            @delete="onModelDelete"
          />
        </div>
      </div>

      <!-- Predictions -->
      <div class="predictions-section">
        <div class="section-header">
          <h3>پیش‌بینی‌های اخیر</h3>
          <button class="btn btn-secondary" @click="refreshPredictions">
            بروزرسانی
          </button>
        </div>
        <AIPredictions :predictions="recentPredictions" />
      </div>

      <!-- Performance Analytics -->
      <div class="analytics-section">
        <div class="section-header">
          <h3>تحلیل عملکرد</h3>
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
        <ModelPerformance :period="selectedPeriod" />
      </div>
    </div>

    <!-- Model Trainer Modal -->
    <Modal v-if="showModelTrainer" @close="showModelTrainer = false">
      <ModelTrainer @model-trained="onModelTrained" />
    </Modal>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useToast } from 'vue-toastification'
import AIModelCard from '@/components/ai/AIModelCard.vue'
import AIPredictions from '@/components/ai/AIPredictions.vue'
import ModelPerformance from '@/components/ai/ModelPerformance.vue'
import ModelTrainer from '@/components/ai/ModelTrainer.vue'
import Modal from '@/components/shared/Modal.vue'

export default {
  name: 'AIPanel',
  components: {
    AIModelCard,
    AIPredictions,
    ModelPerformance,
    ModelTrainer,
    Modal
  },
  setup() {
    const store = useStore()
    const toast = useToast()

    const showModelTrainer = ref(false)
    const selectedPeriod = ref('7d')

    const timePeriods = [
      { label: '24h', value: '1d' },
      { label: '7d', value: '7d' },
      { label: '1m', value: '1m' },
      { label: '3m', value: '3m' }
    ]

    // Computed properties
    const aiModels = computed(() => store.getters['ai/models'])
    const activeModels = computed(() => store.getters['ai/activeModels'])
    const recentPredictions = computed(() => store.getters['ai/recentPredictions'])
    const averageAccuracy = computed(() => store.getters['ai/averageAccuracy'])
    const todayPredictions = computed(() => store.getters['ai/todayPredictionsCount'])
    const aiProfit = computed(() => store.getters['ai/profitPercentage'])

    // Methods
    const onModelTrain = async (modelId) => {
      try {
        await store.dispatch('ai/trainModel', modelId)
        toast.success('آموزش مدل با موفقیت آغاز شد')
      } catch (error) {
        toast.error('خطا در آموزش مدل')
      }
    }

    const onModelDeploy = async (modelId) => {
      try {
        await store.dispatch('ai/deployModel', modelId)
        toast.success('مدل با موفقیت فعال شد')
      } catch (error) {
        toast.error('خطا در فعال‌سازی مدل')
      }
    }

    const onModelDelete = async (modelId) => {
      if (confirm('آیا از حذف این مدل اطمینان دارید؟')) {
        try {
          await store.dispatch('ai/deleteModel', modelId)
          toast.success('مدل با موفقیت حذف شد')
        } catch (error) {
          toast.error('خطا در حذف مدل')
        }
      }
    }

    const onModelTrained = (model) => {
      showModelTrainer.value = false
      toast.success(`مدل ${model.name} با موفقیت آموزش داده شد`)
    }

    const refreshPredictions = async () => {
      try {
        await store.dispatch('ai/fetchPredictions')
        toast.success('پیش‌بینی‌ها بروزرسانی شدند')
      } catch (error) {
        toast.error('خطا در بروزرسانی پیش‌بینی‌ها')
      }
    }

    onMounted(() => {
      store.dispatch('ai/fetchModels')
      store.dispatch('ai/fetchPredictions')
    })

    return {
      showModelTrainer,
      selectedPeriod,
      timePeriods,
      aiModels,
      activeModels,
      recentPredictions,
      averageAccuracy,
      todayPredictions,
      aiProfit,
      onModelTrain,
      onModelDeploy,
      onModelDelete,
      onModelTrained,
      refreshPredictions
    }
  }
}
</script>

<style scoped>
.ai-panel {
  padding: var(--spacing-lg);
}

.panel-header {
  margin-bottom: var(--spacing-2xl);
  text-align: center;
}

.panel-header h1 {
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.panel-header p {
  color: var(--text-muted);
  font-size: var(--font-size-lg);
}

.ai-dashboard {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xl);
}

.status-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
}

.status-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  transition: all 0.3s ease;
}

.status-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.status-icon {
  font-size: 2.5rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  flex-shrink: 0;
}

.status-content {
  flex: 1;
}

.status-title {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  margin-bottom: var(--spacing-xs);
}

.status-value {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--text-primary);
}

.status-value.positive {
  color: var(--success-color);
}

.status-value.negative {
  color: var(--error-color);
}

.management-section,
.predictions-section,
.analytics-section {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: var(--spacing-lg);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.section-header h3 {
  color: var(--text-primary);
  margin-bottom: 0;
}

.models-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-lg);
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

@media (max-width: 768px) {
  .ai-panel {
    padding: var(--spacing-md);
  }
  
  .status-cards {
    grid-template-columns: 1fr 1fr;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .models-grid {
    grid-template-columns: 1fr;
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
