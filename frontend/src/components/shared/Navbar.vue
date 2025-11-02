<template>
  <nav class="navbar">
    <div class="navbar-brand">
      <router-link to="/" class="brand-link">
        <div class="brand-logo">📊</div>
        <span class="brand-text">پلتفرم رضایی</span>
      </router-link>
    </div>

    <div class="navbar-content">
      <!-- Quick Stats -->
      <div class="quick-stats">
        <div class="stat">
          <span class="stat-label">موجودی:</span>
          <span class="stat-value">{{ formatCurrency(balance) }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">سود امروز:</span>
          <span class="stat-value" :class="todayProfit >= 0 ? 'positive' : 'negative'">
            {{ formatCurrency(todayProfit) }}
          </span>
        </div>
      </div>

      <!-- Notifications -->
      <div class="navbar-actions">
        <div class="notification-bell" @click="toggleNotifications">
          <span class="bell-icon">🔔</span>
          <span v-if="unreadCount > 0" class="notification-badge">
            {{ unreadCount }}
          </span>
        </div>

        <!-- User Menu -->
        <div class="user-menu" @click="toggleUserMenu">
          <div class="user-avatar">
            {{ userInitials }}
          </div>
          <span class="user-name">{{ userName }}</span>
          <span class="dropdown-arrow">▼</span>

          <div v-if="showUserMenu" class="user-dropdown">
            <router-link to="/profile" class="dropdown-item">
              <span class="item-icon">👤</span>
              پروفایل
            </router-link>
            <router-link to="/settings" class="dropdown-item">
              <span class="item-icon">⚙️</span>
              تنظیمات
            </router-link>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item logout-btn" @click="handleLogout">
              <span class="item-icon">🚪</span>
              خروج
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Notifications Panel -->
    <div v-if="showNotifications" class="notifications-panel">
      <div class="panel-header">
        <h3>اعلان‌ها</h3>
        <button class="close-btn" @click="showNotifications = false">×</button>
      </div>
      <div class="notifications-list">
        <div
          v-for="notification in recentNotifications"
          :key="notification.id"
          :class="['notification-item', { unread: !notification.read }]"
        >
          <div class="notification-icon">
            {{ getNotificationIcon(notification.type) }}
          </div>
          <div class="notification-content">
            <div class="notification-title">{{ notification.title }}</div>
            <div class="notification-message">{{ notification.message }}</div>
            <div class="notification-time">{{ formatTime(notification.timestamp) }}</div>
          </div>
        </div>
      </div>
      <div class="panel-footer">
        <router-link to="/notifications" class="view-all-link">
          مشاهده همه اعلان‌ها
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'Navbar',
  setup() {
    const store = useStore()
    const router = useRouter()

    const showUserMenu = ref(false)
    const showNotifications = ref(false)

    // Computed properties
    const balance = computed(() => store.getters['portfolio/totalBalance'])
    const todayProfit = computed(() => store.getters['portfolio/todayProfit'])
    const userName = computed(() => store.getters['auth/user']?.name || 'کاربر')
    const userInitials = computed(() => {
      const name = userName.value
      return name.split(' ').map(n => n[0]).join('').toUpperCase()
    })
    const recentNotifications = computed(() => store.getters['notifications/recent'])
    const unreadCount = computed(() => store.getters['notifications/unreadCount'])

    // Methods
    const toggleUserMenu = () => {
      showUserMenu.value = !showUserMenu.value
    }

    const toggleNotifications = () => {
      showNotifications.value = !showNotifications.value
      if (showNotifications.value) {
        store.dispatch('notifications/markAllAsRead')
      }
    }

    const handleLogout = async () => {
      try {
        await store.dispatch('auth/logout')
        router.push('/login')
      } catch (error) {
        console.error('Logout error:', error)
      }
    }

    const formatCurrency = (value) => {
      return new Intl.NumberFormat('fa-IR', {
        style: 'currency',
        currency: 'IRR'
      }).format(value)
    }

    const formatTime = (timestamp) => {
      return new Date(timestamp).toLocaleTimeString('fa-IR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const getNotificationIcon = (type) => {
      const icons = {
        'trade': '💰',
        'alert': '⚠️',
        'system': '⚙️',
        'info': 'ℹ️'
      }
      return icons[type] || '🔔'
    }

    // Close dropdowns when clicking outside
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-menu')) {
        showUserMenu.value = false
      }
      if (!event.target.closest('.notification-bell') && 
          !event.target.closest('.notifications-panel')) {
        showNotifications.value = false
      }
    }

    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
      // Load initial data
      store.dispatch('portfolio/fetchBalance')
      store.dispatch('notifications/fetchNotifications')
    })

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
    })

    return {
      showUserMenu,
      showNotifications,
      balance,
      todayProfit,
      userName,
      userInitials,
      recentNotifications,
      unreadCount,
      toggleUserMenu,
      toggleNotifications,
      handleLogout,
      formatCurrency,
      formatTime,
      getNotificationIcon
    }
  }
}
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 var(--spacing-lg);
  height: 60px;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar-brand {
  display: flex;
  align-items: center;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  text-decoration: none;
  color: var(--text-primary);
  font-weight: 700;
  font-size: var(--font-size-lg);
}

.brand-logo {
  font-size: 1.5rem;
}

.brand-text {
  color: var(--primary-color);
}

.navbar-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-2xl);
}

.quick-stats {
  display: flex;
  gap: var(--spacing-xl);
}

.stat {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
}

.stat-label {
  color: var(--text-muted);
}

.stat-value {
  font-weight: 600;
  color: var(--text-primary);
}

.stat-value.positive {
  color: var(--success-color);
}

.stat-value.negative {
  color: var(--error-color);
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.notification-bell {
  position: relative;
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.notification-bell:hover {
  background: var(--bg-secondary);
}

.bell-icon {
  font-size: 1.2rem;
}

.notification-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: var(--error-color);
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: 6px;
  transition: background-color 0.2s ease;
  position: relative;
}

.user-menu:hover {
  background: var(--bg-secondary);
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.user-name {
  color: var(--text-primary);
  font-weight: 500;
}

.dropdown-arrow {
  color: var(--text-muted);
  font-size: 0.8rem;
  transition: transform 0.2s ease;
}

.user-menu:hover .dropdown-arrow {
  transform: rotate(180deg);
}

.user-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: var(--spacing-sm);
  min-width: 200px;
  box-shadow: var(--shadow-lg);
  z-index: 1001;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--text-primary);
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  width: 100%;
  border: none;
  background: none;
  cursor: pointer;
  font-size: var(--font-size-sm);
}

.dropdown-item:hover {
  background: var(--bg-secondary);
}

.logout-btn {
  color: var(--error-color);
}

.dropdown-divider {
  height: 1px;
  background: var(--border-color);
  margin: var(--spacing-sm) 0;
}

.notifications-panel {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  width: 400px;
  max-height: 500px;
  box-shadow: var(--shadow-lg);
  z-index: 1001;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
}

.panel-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--font-size-base);
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: var(--text-primary);
}

.notifications-list {
  max-height: 400px;
  overflow-y: auto;
  padding: var(--spacing-sm);
}

.notification-item {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.notification-item:hover {
  background: var(--bg-secondary);
}

.notification-item.unread {
  background: rgba(44, 90, 160, 0.1);
}

.notification-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.notification-message {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-xs);
  line-height: 1.4;
}

.notification-time {
  color: var(--text-muted);
  font-size: var(--font-size-xs);
}

.panel-footer {
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  text-align: center;
}

.view-all-link {
  color: var(--primary-color);
  text-decoration: none;
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.view-all-link:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .navbar {
    padding: 0 var(--spacing-md);
  }
  
  .quick-stats {
    display: none;
  }
  
  .navbar-content {
    gap: var(--spacing-md);
  }
  
  .user-name {
    display: none;
  }
  
  .notifications-panel {
    width: 300px;
    left: 20px;
    transform: none;
  }
}
</style>
