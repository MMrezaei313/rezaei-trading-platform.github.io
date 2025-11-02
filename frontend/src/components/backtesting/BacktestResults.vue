<template>
  <div class="backtest-results">
    <div class="results-header">
      <h3>نتایج بکتست</h3>
      <div class="result-status" :class="results.status">
        {{ getStatusText(results.status) }}
      </div>
    </div>

    <div class="results-grid">
      <div class="result-card">
        <div class="result-value" :class="results.totalReturn >= 0 ? 'positive' : 'negative'">
          {{ results.totalReturn.toFixed(2) }}%
        </div>
        <div class="result-label">سود کل</div>
      </div>
      
      <div class="result-card">
        <div class="result-value">{{ results.sharpeRatio.toFixed(2) }}</div>
        <div class="result-label">نسبت شارپ</div>
      </div>
      
      <div class="result-card">
        <div class="result-value" :class="results.maxDrawdown <= 20 ? 'positive' : 'negative'">
          {{ results.maxDrawdown.toFixed(2) }}%
        </div>
        <div class="result-label">حداکثر drawdown</div>
      </div>
      
      <div class="result-card">
        <div class="result-value">{{ results.winRate.toFixed(1) }}%</div>
        <div class="result-label">نرخ برد</div>
      </div>
    </div>

    <div class="results-details">
      <div class="detail-section">
        <h4>معاملات</h4>
        <div class="detail-grid">
          <div class="detail-item">
            <span>تعداد معاملات:</span>
            <span>{{ results.totalTrades }}</span>
          </div>
          <div class="detail-item">
            <span>معاملات سودده:</span>
            <span>{{ results.winningTrades }}</span>
          </div>
          <div class="detail-item">
            <span>معاملات ضررده:</span>
            <span>{{ results.losingTrades }}</span>
          </div>
          <div class="detail-item">
            <span>میانگین سود:</span>
            <span>{{ results.avgWin.toFixed(2) }}%</span>
          </div>
          <div class="detail-item">
            <span>میانگین ضرر:</span>
            <span>{{ results.avgLoss.toFixed(2) }}%</span>
          </div>
          <div class="detail-item">
            <span>نسبت سود به ضرر:</span>
            <span>{{ results.profitLossRatio.toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <div class="detail-section">
        <h4>ریسک و بازده</h4>
        <div class="detail-grid">
          <div class="detail-item">
            <span>Volatility:</span>
            <span>{{ results.volatility.toFixed(2) }}%</span>
          </div>
          <div class="detail-item">
            <span>Value at Risk (95%):</span>
            <span>{{ results.var.toFixed(2) }}%</span>
          </div>
          <div class="detail-item">
            <span>Expected Return:</span>
            <span>{{ results.expectedReturn.toFixed(2) }}%</span>
          </div>
          <div class="detail-item">
            <span>Sortino Ratio:</span>
            <span>{{ results.sortinoRatio.toFixed(2) }}</span>
          </div>
          <div class="detail-item">
            <span>Calmar Ratio:</span>
            <span>{{ results.calmarRatio.toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="results-actions">
      <button class="btn btn-primary" @click="$emit('save-strategy')">
        ذخیره استراتژی
      </button>
      <button class="btn btn-secondary" @click="$emit('export-results')">
        خروجی نتایج
      </button>
      <button class="btn btn-outline" @click="$emit('run-again')">
        اجرای مجدد
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BacktestResults',
  props: {
    results: {
      type: Object,
      required: true,
      default: () => ({
        status: 'completed',
        totalReturn: 15.5,
        sharpeRatio: 1.8,
        maxDrawdown: 12.3,
        winRate: 65.5,
        totalTrades: 142,
        winningTrades: 93,
        losingTrades: 49,
        avgWin: 2.1,
        avgLoss: -1.4,
        profitLossRatio: 1.5,
        volatility: 18.2,
        var: -8.5,
        expectedReturn: 12.3,
        sortinoRatio: 2.1,
        calmarRatio: 1.26
      })
    }
  },
  emits: ['save-strategy', 'export-results', 'run-again'],
  setup() {
    const getStatusText = (status) => {
      const statusMap = {
        'running': 'در حال اجرا',
        'completed': 'تکمیل شده',
        'failed': 'ناموفق',
        'cancelled': 'لغو شده'
      }
      return statusMap[status] || status
    }

    return {
      getStatusText
    }
  }
}
</script>

<style scoped>
.backtest-results {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: var(--spacing-lg);
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
}

.results-header h3 {
  margin: 0;
  color: var(--text-primary);
}

.result-status {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 4px;
  font-size: var(--font-size-sm);
  font-weight: 600;
  text-transform: uppercase;
}

.result-status.completed {
  background: rgba(76, 175, 80, 0.2);
  color: var(--success-color);
}

.result-status.running {
  background: rgba(255, 167, 38, 0.2);
  color: var(--warning-color);
}

.result-status.failed {
  background: rgba(244, 67, 54, 0.2);
  color: var(--error-color);
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.result-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: var(--spacing-md);
  text-align: center;
}

.result-value {
  font-size: var(--font-size-xl);
  font-weight: 700;
  margin-bottom: var(--spacing-xs);
}

.result-value.positive {
  color: var(--success-color);
}

.result-value.negative {
  color: var(--error-color);
}

.result-label {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}

.results-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.detail-section h4 {
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
  font-size: var(--font-size-base);
}

.detail-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm);
  background: var(--bg-secondary);
  border-radius: 4px;
  font-size: var(--font-size-sm);
}

.detail-item span:first-child {
  color: var(--text-muted);
}

.detail-item span:last-child {
  color: var(--text-primary);
  font-weight: 600;
}

.results-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-color);
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-primary);
}

.btn-outline:hover {
  background: var(--bg-secondary);
}

@media (max-width: 768px) {
  .results-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .results-details {
    grid-template-columns: 1fr;
  }
  
  .results-actions {
    flex-direction: column;
  }
}
</style>
