<template>
  <aside class="sidebar" :class="{ collapsed: isCollapsed }">
    <div class="sidebar-header">
      <button class="toggle-btn" @click="toggleSidebar">
        <span class="toggle-icon">{{ isCollapsed ? '→' : '←' }}</span>
      </button>
    </div>

    <nav class="sidebar-nav">
      <div class="nav-section">
        <div class="section-label" v-if="!isCollapsed">اصلی</div>
        <router-link to="/" class="nav-item" :class="{ active: $route.path === '/' }">
          <span class="nav-icon">📊</span>
          <span class="nav-text" v-if="!isCollapsed">داشبورد</span>
        </router-link>
        <router-link to="/trading" class="nav-item" :class="{ active: $route.path === '/trading' }">
          <span class="nav-icon">💰</span>
          <span class="nav-text" v-if="!isCollapsed">معاملات</span>
        </router-link>
        <router-link to="/strategies" class="nav-item" :class="{ active: $route.path.includes('/strategies') }">
          <span class="nav-icon">🤖</span>
          <span class="nav-text" v-if="!isCollapsed">استراتژی‌ها</span>
        </router-link>
        <router-link to="/backtesting" class="nav-item" :class="{ active: $route.path === '/backtesting' }">
          <span class="nav-icon">📈</span>
          <span class="nav-text" v-if="!isCollapsed">بکتست</span>
        </router-link>
      </div>

      <div class="nav-section">
        <div class="section-label" v-if="!isCollapsed">تحلیل</div>
        <router-link to="/portfolio" class="nav-item" :class="{ active: $route.path === '/portfolio' }">
          <span class="nav-icon">💼</span>
          <span class="nav-text" v-if="!isCollapsed">پرتفوی</span>
        </router-link>
        <router-link to="/analytics" class="nav-item" :class="{ active: $route.path === '/analytics' }">
          <span class="nav-icon">📉</span>
          <span class="nav-text" v-if="!isCollapsed">تحلیل‌ها</span>
        </router-link>
        <router-link to="/ai" class="nav-item" :class="{ active: $route.path === '/ai' }">
          <span class="nav-icon">🧠</span>
          <span class="nav-text" v-if="!isCollapsed">هوش مصنوعی</span>
        </router-link>
      </div>

      <div class="nav-section">
        <div class="section-label" v-if="!isCollapsed">بازارها</div>
        <div class="market-items">
          <div
            v-for="market in markets"
            :key="market.id"
            class="market-item"
            :class="{ active: activeMarket === market.id }"
            @click="setActiveMarket(market.id)"
          >
            <span class="market-icon">{{ market.icon }}</span>
            <span class="market-text" v-if="!isCollapsed">{{ market.name }}</span>
            <span class="market-change" v-if="!isCollapsed" :class="market.change >= 0 ? 'positive' : 'negative'">
              {{ market.change }}%
            </span>
          </div>
        </div>
      </div>

      <div class="nav-section">
        <div class="section-label" v-if="!isCollapsed">سیستم</div>
        <router-link to="/settings" class="nav-item" :class="{ active: $route.path === '/settings' }">
          <span class="nav-icon">⚙️</span>
          <span class="nav-text" v-if="!isCollapsed">تنظیمات</span>
        </router-link>
        <router-link to="/help" class="nav-item" :class="{ active: $route.path === '/help' }">
          <span class="nav-icon">❓</span>
          <span class="nav-text" v-if="!isCollapsed">راهنما</span>
        </router-link>
      </div>
    </nav>

    <div class="sidebar-footer">
      <div class="system-status">
        <div class="status-item">
          <span class="status-dot" :class="tradingStatus"></span>
          <span class="status-text" v-if="!isCollapsed">
            {{ tradingStatus === 'active' ? 'معاملات فعال' : 'معاملات غیرفعال' }}
          </span>
        </div>
        <div class="status-item">
          <span class="status-dot" :class="connectionStatus"></span>
          <span class="status-text" v-if="!isCollapsed">
            {{ connectionStatus === 'connected' ? 'متصل' : 'قطع' }}
          </span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'Sidebar',
  setup() {
    const store = useStore()
    
    const isCollapsed = ref(false)
    const activeMarket = ref('crypto')
    const tradingStatus = ref('active')
    const connectionStatus = ref('connected')

    const markets = ref([
      { id: 'tsetmc', name: 'بورس تهران', icon: '🏛️', change: 1.2 },
      { id: 'farabours', name: 'فرابورس', icon: '📊', change: 0.8 },
      { id: 'crypto', name: 'ارز دیجیتال', icon: '₿', change: -2.1 },
      { id: 'gold', name: 'طلا و سکه', icon: '🥇', change: 0.5 }
    ])

    const toggleSidebar = () => {
      isCollapsed.value = !isCollapsed.value
      // Save preference to localStorage
      localStorage.setItem('sidebarCollapsed', isCollapsed.value)
    }

    const setActiveMarket = (marketId) => {
      activeMarket.value = marketId
      store.dispatch('trading/setActiveMarket', marketId)
    }

    // Load sidebar state from localStorage
    onMounted(() => {
      const savedState = localStorage.getItem('sidebarCollapsed')
      if (savedState !== null) {
        isCollapsed.value = JSON.parse(savedState)
      }

      // Listen for trading status updates
      // This would be connected to WebSocket in real implementation
    })

    return {
      isCollapsed,
      activeMarket,
      tradingStatus,
      connectionStatus,
      markets,
      toggleSidebar,
      setActiveMarket
    }
  }
}
</script>

<style scoped>
.sidebar {
  width: 250px;
  height: 100vh;
  background: var(--bg-card);
  border-left: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
}

.sidebar.collapsed {
  width: 60px;
}

.sidebar-header {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
}

.toggle-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-btn:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.toggle-icon {
  font-size: 1.2rem;
  font-weight: bold;
}

.sidebar-nav {
  flex: 1;
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  overflow-y: auto;
}

.nav-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.section-label {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: var(--spacing-sm);
  padding: 0 var(--spacing-sm);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-sm);
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.2s ease;
  position: relative;
}

.nav-item:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.nav-item.active {
  background: var(--primary-color);
  color: white;
}

.nav-item.active::before {
  content: '';
  position: absolute;
  right: -16px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 20px;
  background: var(--primary-color);
  border-radius: 2px;
}

.nav-icon {
  font-size: 1.2rem;
  width: 20px;
  text-align: center;
  flex-shrink: 0;
}

.nav-text {
  font-weight: 500;
  flex: 1;
}

.market-items {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.market-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-sm);
  color: var(--text-secondary);
  border-radius: 6px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.market-item:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.market-item.active {
  background: rgba(44, 90, 160, 0.1);
  color: var(--primary-color);
}

.market-icon {
  font-size: 1.2rem;
  width: 20px;
  text-align: center;
  flex-shrink: 0;
}

.market-text {
  font-weight: 500;
  flex: 1;
}

.market-change {
  font-size: var(--font-size-xs);
  font-weight: 600;
}

.market-change.positive {
  color: var(--success-color);
}

.market-change.negative {
  color: var(--error-color);
}

.sidebar-footer {
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-color);
}

.system-status {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.status-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-dot.active {
  background: var(--success-color);
}

.status-dot.inactive {
  background: var(--error-color);
}

.status-dot.connected {
  background: var(--success-color);
}

.status-dot.disconnected {
  background: var(--error-color);
}

.status-text {
  color: var(--text-muted);
}

/* Scrollbar styling */
.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 2px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: var(--border-light);
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    width: 280px;
  }
  
  .sidebar.collapsed {
    transform: translateX(0);
    width: 60px;
  }
  
  .sidebar:not(.collapsed) {
    transform: translateX(0);
  }
}
</style>
