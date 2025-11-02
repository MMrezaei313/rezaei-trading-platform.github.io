<template>
  <div class="ai-model-card" :class="model.status">
    <div class="model-header">
      <div class="model-info">
        <h4 class="model-name">{{ model.name }}</h4>
        <span class="model-type">{{ model.type }}</span>
      </div>
      <div class="model-status" :class="model.status">
        {{ getStatusText(model.status) }}
      </div>
    </div>

    <div class="model-metrics">
      <div class="metric">
        <span class="metric-label">دقت</span>
        <span class="metric-value">{{ model.accuracy }}%</span>
      </div>
      <div class="metric">
        <span class="metric-label">پیش‌بینی‌ها</span>
        <span class="metric-value">{{ model.predictions }}</span>
      </div>
      <div class="metric">
        <span class="metric-label">سود</span>
        <span class="metric-value" :class="model.profit >= 0 ? 'positive' : 'negative'">
          {{ model.profit }}%
        </span>
      </div>
    </div>

    <div class="model-details">
      <div class="detail-item">
        <span class="detail-label">نمادها:</span>
        <span class="detail-value">{{ model.symbols.join(', ') }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">تایم‌فریم:</span>
        <span class="detail-value">{{ model.timeframe }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">آخرین آموزش:</span>
        <span class="detail-value">{{ formatDate(model.lastTrained) }}</span>
      </div>
    </div>

    <div class="model-actions">
      <button
        v-if="model.status === 'idle'"
        class="btn btn-primary btn-sm"
        @click="$emit('train', model.id)"
        :disabled="loading"
      >
        آموزش
      </button>
      <button
        v-if="model.status === 'trained' && !model.deployed"
        class="btn btn-success btn-sm"
        @click="$emit('deploy', model.id)"
        :disabled="loading"
      >
        فعال‌سازی
      </button>
      <button
        v-if="model.deployed"
        class="btn btn-warning btn-sm"
        @click="$emit('deploy', model.id)"
        :disabled="loading"
      >
        غیرفعال
      </button>
      <button
        class="btn btn-danger btn-sm"
        @click="$emit('delete', model.id)"
        :disabled="loading"
      >
        حذف
      </button>
    </div>

    <div v-if="model.status === 'training'" class="training-progress">
      <div class="progress-bar">
        <div
          class="progress-fill"
          :style="{ width: `${model.trainingProgress}%` }"
        ></div>
      </div>
      <span class="progress-text">{{ model.trainingProgress }}%</span>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'AIModelCard',
  props: {
    model: {
      type: Object,
      required: true
    }
  },
  emits: ['train', 'deploy', 'delete'],
  setup(props) {
    const loading = ref(false)

    const getStatusText = (status) => {
      const statusMap = {
        'idle': 'آماده',
        'training': 'در حال آموزش',
        'trained': 'آموزش دیده',
        'deployed': 'فعال',
        'error': 'خطا'
      }
      return statusMap[status] || status
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('fa-IR')
    }

    return {
      loading,
      getStatusText,
      formatDate
    }
  }
}
</script>

<style scoped>
.ai-model-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: var(--spacing-lg);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.ai-model-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.ai-model-card::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 4px;
  height: 100%;
}

.ai-model-card.idle::before {
  background: var(--text-muted);
}

.ai-model-card.training::before {
  background: var(--warning-color);
}

.ai-model-card.trained::before {
  background: var(--success-color);
}

.ai-model-card.deployed::before {
  background: var(--primary-color);
}

.ai-model-card.error::before {
  background: var(--error-color);
}

.model-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-md);
}

.model-info {
  flex: 1;
}

.model-name {
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
  font-size: var(--font-size-base);
}

.model-type {
  color: var(--text-muted);
  font-size: var(--font-size-sm);
  background: var(--bg-secondary);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 4px;
}

.model-status {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 4px;
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-transform: uppercase;
}

.model-status.idle {
  background: rgba(158, 158, 158, 0.2);
  color: var(--text-muted);
}

.model-status.training {
  background: rgba(255, 167, 38, 0.2);
  color: var(--warning-color);
}

.model-status.trained {
  background: rgba(76, 175, 80, 0.2);
  color: var(--success-color);
}

.model-status.deployed {
  background: rgba(44, 90, 160, 0.2);
  color: var(--primary-color);
}

.model-status.error {
  background: rgba(244, 67, 54, 0.2);
  color: var(--error-color);
}

.model-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border-radius: 6px;
}

.metric {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.metric-label {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  margin-bottom: var(--spacing-xs);
}

.metric-value {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--text-primary);
}

.metric-value.positive {
  color: var(--success-color);
}

.metric-value.negative {
  color: var(--error-color);
}

.model-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-sm);
}

.detail-label {
  color: var(--text-muted);
}

.detail-value {
  color: var(--text-primary);
  font-weight: 500;
}

.model-actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.btn-sm {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-xs);
  flex: 1;
  min-width: 60px;
}

.training-progress {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-color);
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: var(--bg-secondary);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--warning-color);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  font-weight: 600;
  min-width: 40px;
}

@media (max-width: 768px) {
  .ai-model-card {
    padding: var(--spacing-md);
  }
  
  .model-header {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .model-metrics {
    grid-template-columns: 1fr;
    gap: var(--spacing-sm);
  }
  
  .model-actions {
    flex-direction: column;
  }
  
  .btn-sm {
    flex: none;
  }
}
</style>
