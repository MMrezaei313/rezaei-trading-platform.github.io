<template>
  <div class="condition-builder">
    <div class="condition-list">
      <div
        v-for="(condition, index) in modelValue"
        :key="condition.id"
        class="condition-item"
      >
        <div class="condition-header">
          <span>شرط {{ index + 1 }}</span>
          <button
            class="btn btn-sm btn-danger"
            @click="removeCondition(condition.id)"
          >
            حذف
          </button>
        </div>
        
        <div class="condition-content">
          <!-- Indicator Selection -->
          <select
            v-model="condition.indicator"
            class="condition-select"
            @change="onIndicatorChange(condition)"
          >
            <option value="">انتخاب اندیکاتور</option>
            <option
              v-for="indicator in availableIndicators"
              :key="indicator.name"
              :value="indicator.name"
            >
              {{ indicator.label }}
            </option>
          </select>

          <!-- Operator -->
          <select v-model="condition.operator" class="condition-select">
            <option value=">">بزرگتر از</option>
            <option value="<">کوچکتر از</option>
            <option value=">="">بزرگتر یا مساوی</option>
            <option value="<="">کوچکتر یا مساوی</option>
            <option value="=="">مساوی</option>
            <option value="!="">مخالف</option>
            <option value="crossover">قطع از بالا</option>
            <option value="crossunder">قطع از پایین</option>
          </select>

          <!-- Value -->
          <input
            v-model="condition.value"
            type="number"
            step="0.001"
            class="condition-input"
            placeholder="مقدار"
          >

          <!-- Timeframe for indicator -->
          <select v-model="condition.timeframe" class="condition-select">
            <option value="current">تایم‌فریم جاری</option>
            <option value="1m">1 دقیقه</option>
            <option value="5m">5 دقیقه</option>
            <option value="15m">15 دقیقه</option>
            <option value="1h">1 ساعت</option>
            <option value="4h">4 ساعت</option>
          </select>
        </div>

        <!-- Logical Operator -->
        <div class="logical-operator" v-if="index < modelValue.length - 1">
          <select v-model="condition.logicalOperator" class="logic-select">
            <option value="AND">و</option>
            <option value="OR">یا</option>
          </select>
        </div>
      </div>
    </div>

    <button class="btn btn-secondary add-condition" @click="addCondition">
      + افزودن شرط
    </button>

    <!-- Condition Preview -->
    <div v-if="modelValue.length > 0" class="condition-preview">
      <h4>پیش‌نمایش شرط:</h4>
      <code class="preview-code">{{ conditionPreview }}</code>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'

export default {
  name: 'ConditionBuilder',
  props: {
    modelValue: {
      type: Array,
      required: true
    },
    indicators: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const availableIndicators = ref([
      { name: 'rsi', label: 'RSI' },
      { name: 'macd', label: 'MACD' },
      { name: 'sma', label: 'SMA' },
      { name: 'ema', label: 'EMA' },
      { name: 'bb_upper', label: 'بولینگر بالا' },
      { name: 'bb_lower', label: 'بولینگر پایین' },
      { name: 'stoch_k', label: 'استوکستیک K' },
      { name: 'stoch_d', label: 'استوکستیک D' },
      { name: 'volume', label: 'حجم' },
      { name: 'atr', label: 'ATR' }
    ])

    // Computed
    const conditionPreview = computed(() => {
      return props.modelValue.map(condition => {
        let conditionText = ''
        
        if (condition.indicator) {
          conditionText += `${condition.indicator} `
        }
        
        if (condition.operator) {
          const operatorMap = {
            '>': '>',
            '<': '<',
            '>=': '≥',
            '<=': '≤',
            '==': '=',
            '!=': '≠',
            'crossover': 'قطع کند از بالا',
            'crossunder': 'قطع کند از پایین'
          }
          conditionText += `${operatorMap[condition.operator] || condition.operator} `
        }
        
        if (condition.value !== undefined) {
          conditionText += condition.value
        }
        
        if (condition.logicalOperator && condition !== props.modelValue[props.modelValue.length - 1]) {
          conditionText += ` ${condition.logicalOperator}`
        }
        
        return conditionText
      }).join(' ')
    })

    // Methods
    const addCondition = () => {
      const newCondition = {
        id: Date.now() + Math.random(),
        indicator: '',
        operator: '>',
        value: 0,
        timeframe: 'current',
        logicalOperator: 'AND'
      }
      emit('update:modelValue', [...props.modelValue, newCondition])
    }

    const removeCondition = (id) => {
      const newConditions = props.modelValue.filter(condition => condition.id !== id)
      emit('update:modelValue', newConditions)
    }

    const onIndicatorChange = (condition) => {
      // Set default values based on indicator
      const indicator = availableIndicators.value.find(ind => ind.name === condition.indicator)
      if (indicator) {
        switch (indicator.name) {
          case 'rsi':
            condition.value = 30
            condition.operator = '<'
            break
          case 'macd':
            condition.value = 0
            condition.operator = '>'
            break
          case 'sma':
          case 'ema':
            condition.operator = 'crossover'
            condition.value = 0
            break
          default:
            condition.value = 0
        }
      }
    }

    // Watch for changes in indicators prop
    watch(() => props.indicators, (newIndicators) => {
      if (newIndicators.length > 0) {
        availableIndicators.value = [
          ...availableIndicators.value,
          ...newIndicators.map(ind => ({
            name: ind.name,
            label: ind.name
          }))
        ]
      }
    }, { immediate: true })

    return {
      availableIndicators,
      conditionPreview,
      addCondition,
      removeCondition,
      onIndicatorChange
    }
  }
}
</script>

<style scoped>
.condition-builder {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.condition-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.condition-item {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: var(--spacing-md);
}

.condition-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
  font-weight: 600;
  color: var(--text-primary);
}

.condition-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-sm);
}

.condition-select,
.condition-input {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: var(--spacing-sm);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}

.condition-input {
  text-align: center;
}

.logical-operator {
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  text-align: center;
}

.logic-select {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: var(--spacing-xs) var(--spacing-sm);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.add-condition {
  align-self: flex-start;
}

.condition-preview {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: var(--spacing-md);
}

.condition-preview h4 {
  margin-bottom: var(--spacing-sm);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}

.preview-code {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: var(--spacing-sm);
  font-family: 'Courier New', monospace;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  display: block;
  white-space: pre-wrap;
}

@media (max-width: 768px) {
  .condition-content {
    grid-template-columns: 1fr;
  }
  
  .condition-header {
    flex-direction: column;
    gap: var(--spacing-sm);
    align-items: flex-start;
  }
}
</style>
