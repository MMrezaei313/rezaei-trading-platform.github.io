<template>
  <div class="quick-actions">
    <h3 class="section-title">عملیات سریع</h3>
    
    <div class="actions-grid">
      <!-- Trading Actions -->
      <div class="action-group">
        <h4 class="group-title">معاملات</h4>
        <div class="action-items">
          <button 
            v-for="action in tradingActions" 
            :key="action.id"
            class="action-button"
            :class="{ 'disabled': action.disabled }"
            @click="handleAction(action)"
          >
            <i :class="action.icon"></i>
            <span class="action-label">{{ action.label }}</span>
          </button>
        </div>
      </div>

      <!-- Strategy Actions -->
      <div class="action-group">
        <h4 class="group-title">استراتژی‌ها</h4>
        <div class="action-items">
          <button 
            v-for="action in strategyActions" 
            :key="action.id"
            class="action-button"
            @click="handleAction(action)"
          >
            <i :class="action.icon"></i>
            <span class="action-label">{{ action.label }}</span>
          </button>
        </div>
      </div>

      <!-- Portfolio Actions -->
      <div class="action-group">
        <h4 class="group-title">سبد سهام</h4>
        <div class="action-items">
          <button 
            v-for="action in portfolioActions" 
            :key="action.id"
            class="action-button"
            @click="handleAction(action)"
          >
            <i :class="action.icon"></i>
            <span class="action-label">{{ action.label }}</span>
          </button>
        </div>
      </div>

      <!-- AI Actions -->
      <div class="action-group">
        <h4 class="group-title">هوش مصنوعی</h4>
        <div class="action-items">
          <button 
            v-for="action in aiActions" 
            :key="action.id"
            class="action-button"
            @click="handleAction(action)"
          >
            <i :class="action.icon"></i>
            <span class="action-label">{{ action.label }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Recent Actions -->
    <div class="recent-actions" v-if="recentActions.length > 0">
      <h4 class="recent-title">عملیات اخیر</h4>
      <div class="recent-list">
        <div 
          v-for="action in recentActions" 
          :key="action.id"
          class="recent-item"
        >
          <i :class="action.icon"></i>
          <div class="recent-info">
            <span class="recent-label">{{ action.label }}</span>
            <span class="recent-time">{{ action.time }}</span>
          </div>
          <button 
            class="recent-repeat"
            @click="repeatAction(action)"
            title="تکرار عملیات"
          >
            <i class="icon-repeat"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useToast } from 'vue-toastification'

export default {
  name: 'QuickActions',
  setup() {
    const router = useRouter()
    const store = useStore()
    const toast = useToast()

    const recentActions = ref([])

    const tradingActions = ref([
      {
        id: 'new-order',
        label: 'سفارش جدید',
        icon: 'icon-plus',
        route: '/trading',
        disabled: false
      },
      {
        id: 'market-buy',
        label: 'خرید بازار',
        icon: 'icon-trending-up',
        action: 'quickMarketBuy',
        disabled: false
      },
      {
        id: 'market-sell',
        label: 'فروش بازار',
        icon: 'icon-trending-down',
        action: 'quickMarketSell',
        disabled: false
      },
      {
        id: 'cancel-all',
        label: 'لغو همه سفارشات',
        icon: 'icon-x',
        action: 'cancelAllOrders',
        disabled: false
      }
    ])

    const strategyActions = ref([
      {
        id: 'create-strategy',
        label: 'استراتژی جدید',
        icon: 'icon-plus-circle',
        route: '/strategies'
      },
      {
        id: 'backtest',
        label: 'اجرای بکتست',
        icon: 'icon-bar-chart',
        route: '/backtesting'
      },
      {
        id: 'deploy-strategy',
        label: 'فعال‌سازی استراتژی',
        icon: 'icon-play',
        action: 'deployStrategy'
      },
      {
        id: 'stop-strategy',
        label: 'توقف استراتژی',
        icon: 'icon-stop',
        action: 'stopStrategy'
      }
    ])

    const portfolioActions = ref([
      {
        id: 'portfolio-analysis',
        label: 'تحلیل سبد',
        icon: 'icon-pie-chart',
        route: '/portfolio'
      },
      {
        id: 'risk-analysis',
        label: 'تحلیل ریسک',
        icon: 'icon-alert-triangle',
        route: '/portfolio#risk'
      },
      {
        id: 'rebalance',
        label: 'بازتعادل‌سازی',
        icon: 'icon-refresh',
        action: 'rebalancePortfolio'
      },
      {
        id: 'performance',
        label: 'عملکرد',
        icon: 'icon-activity',
        route: '/portfolio#performance'
      }
    ])

    const aiActions = ref([
      {
        id: 'ai-analysis',
        label: 'تحلیل هوش مصنوعی',
        icon: 'icon-brain',
        route: '/ai'
      },
      {
        id: 'train-model',
        label: 'آموزش مدل',
        icon: 'icon-cpu',
        route: '/ai#training'
      },
      {
        id: 'ai-predictions',
        label: 'پیش‌بینی‌ها',
        icon: 'icon-zap',
        route: '/ai#predictions'
      },
      {
        id: 'market-insights',
        label: 'بینش بازار',
        icon: 'icon-eye',
        route: '/ai#insights'
      }
    ])

    const handleAction = async (action) => {
      if (action.disabled) return

      // Add to recent actions
      addToRecentActions(action)

      if (action.route) {
        router.push(action.route)
      } else if (action.action) {
        await executeAction(action.action, action)
      }
    }

    const executeAction = async (actionType, action) => {
      try {
        switch (actionType) {
          case 'quickMarketBuy':
            await api.post با endpoint واقعی)
            toast.success('درخواست خرید بازار ثبت شد')
            break
            
          case 'quickMarketSell':
            await store.dispatch('trading/quickMarketSell')
            toast.success('درخواست فروش بازار ثبت شد')
            break
            
          case 'cancelAllOrders':
            await store.dispatch('trading/cancelAllOrders')
            toast.success('همه سفارشات لغو شد')
            break
            
          case 'deployStrategy':
            // Open strategy deployment modal
            store.commit('strategies/SET_DEPLOYMENT_MODAL', true)
            break
            
          case 'stopStrategy':
            await store.dispatch('strategies/stopActiveStrategy')
            toast.success('استراتژی متوقف شد')
            break
            
          case 'rebalancePortfolio':
            await store.dispatch('portfolio/rebalancePortfolio')
            toast.success('سبد سهام بازتعادل‌سازی شد')
            break
        }
      } catch (error) {
        toast.error('خطا در اجرای عملیات')
        console.error('Action execution error:', error)
      }
    }

    const addToRecentActions = (action) => {
      const recentAction = {
        ...action,
        id: Date.now(),
        time: new Date().toLocaleTimeString('fa-IR')
      }
      
      recentActions.value.unshift(recentAction)
      
      // Keep only last 5 actions
      if (recentActions.value.length > 5) {
        recentActions.value = recentActions.value.slice(0, 5)
      }
      
      // Save to localStorage
      localStorage.setItem('recentActions', JSON.stringify(recentActions.value))
    }

    const repeatAction = (action) => {
      handleAction(action)
    }

    const loadRecentActions = () => {
      const saved = localStorage.getItem('recentActions')
      if (saved) {
        recentActions.value = JSON.parse(saved)
      }
    }

    onMounted(() => {
      loadRecentActions()
      
      // Check if trading is available
      store.dispatch('trading/checkTradingStatus').then(status => {
        tradingActions.value.forEach(action => {
          if (action.action && action.action.includes('Market')) {
            action.disabled = !status.connected
          }
        })
      })
    })

    return {
      tradingActions,
      strategyActions,
      portfolioActions,
      aiActions,
      recentActions,
      handleAction,
      repeatAction
    }
  }
}
</script>

<style scoped>
.quick-actions {
  background: var(--bg-card);
  border-radius: var(--border-radius-lg);
  padding: var(--space-6);
  border: 1px solid var(--border-primary);
  height: 100%;
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-6);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--border-primary);
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-6);
  margin-bottom: var(--space-8);
}

.action-group {
  display: flex;
  flex-direction: column;
}

.group-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  margin-bottom: var(--space-3);
  padding-right: var(--space-2);
}

.action-items {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-2);
}

.action-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3);
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--border-radius);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: center;
}

.action-button:hover:not(.disabled) {
  background: var(--color-primary-light);
  border-color: var(--color-secondary);
  color: var(--text-primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.action-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-button i {
  font-size: 20px;
}

.action-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-tight);
}

.recent-actions {
  border-top: 1px solid var(--border-primary);
  padding-top: var(--space-6);
}

.recent-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  margin-bottom: var(--space-3);
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.recent-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  transition: background var(--transition-fast);
}

.recent-item:hover {
  background: var(--bg-tertiary);
}

.recent-item i {
  color: var(--color-secondary);
  font-size: 16px;
}

.recent-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.recent-label {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
}

.recent-time {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.recent-repeat {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: var(--space-1);
  border-radius: var(--border-radius-sm);
  transition: all var(--transition-fast);
}

.recent-repeat:hover {
  background: var(--bg-tertiary);
  color: var(--color-secondary);
}

@media (max-width: 1024px) {
  .actions-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 768px) {
  .actions-grid {
    grid-template-columns: 1fr;
  }
  
  .action-items {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 480px) {
  .action-items {
    grid-template-columns: 1fr 1fr;
  }
  
  .quick-actions {
    padding: var(--space-4);
  }
}
</style>
