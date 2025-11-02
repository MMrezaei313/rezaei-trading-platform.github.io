<template>
  <div class="stats-card" :class="color">
    <div class="stats-icon">
      {{ icon }}
    </div>
    <div class="stats-content">
      <div class="stats-title">{{ title }}</div>
      <div class="stats-value">
        <span v-if="prefix" class="value-prefix">{{ prefix }}</span>
        {{ formattedValue }}
      </div>
      <div v-if="change !== null" class="stats-change" :class="change >= 0 ? 'positive' : 'negative'">
        <span class="change-icon">{{ change >= 0 ? '↗' : '↘' }}</span>
        {{ Math.abs(change) }}%
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'StatsCard',
  props: {
    title: {
      type: String,
      required: true
    },
    value: {
      type: [Number, String],
      required: true
    },
    prefix: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: '📊'
    },
    color: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'success', 'warning', 'error', 'info'].includes(value)
    },
    change: {
      type: Number,
      default: null
    }
  },
  setup(props) {
    const formattedValue = computed(() => {
      if (typeof props.value === 'number') {
        return props.value.toLocaleString('fa-IR')
      }
      return props.value
    })

    return {
      formattedValue
    }
  }
}
</script>

<style scoped>
.stats-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stats-card::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 4px;
  height: 100%;
  transition: width 0.3s ease;
}

.stats-card:hover::before {
  width: 6px;
}

.stats-card.primary::before {
  background: var(--primary-color);
}

.stats-card.success::before {
  background: var(--success-color);
}

.stats-card.warning::before {
  background: var(--warning-color);
}

.stats-card.error::before {
  background: var(--error-color);
}

.stats-card.info::before {
  background: var(--secondary-color);
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--border-light);
}

.stats-icon {
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

.stats-content {
  flex: 1;
}

.stats-title {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  margin-bottom: var(--spacing-xs);
  font-weight: 500;
}

.stats-value {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.value-prefix {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
}

.stats-change {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.stats-change.positive {
  color: var(--success-color);
}

.stats-change.negative {
  color: var(--error-color);
}

.change-icon {
  font-size: var(--font-size-base);
}

@media (max-width: 768px) {
  .stats-card {
    padding: var(--spacing-md);
    gap: var(--spacing-md);
  }
  
  .stats-icon {
    font-size: 2rem;
    width: 50px;
    height: 50px;
  }
  
  .stats-value {
    font-size: var(--font-size-xl);
  }
}
</style>
