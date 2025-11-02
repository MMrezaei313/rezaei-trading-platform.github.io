import { api } from '@/services/api'
import { websocketService } from '@/services/websocket'

const state = {
  notifications: [],
  unreadCount: 0,
  settings: {
    email: true,
    push: true,
    sound: false,
    tradingAlerts: true,
    systemAlerts: true
  }
}

const mutations = {
  SET_NOTIFICATIONS(state, notifications) {
    state.notifications = notifications
  },
  SET_UNREAD_COUNT(state, count) {
    state.unreadCount = count
  },
  SET_SETTINGS(state, settings) {
    state.settings = { ...state.settings, ...settings }
  },
  ADD_NOTIFICATION(state, notification) {
    state.notifications.unshift(notification)
    if (!notification.read) {
      state.unreadCount++
    }
  },
  MARK_AS_READ(state, notificationId) {
    const notification = state.notifications.find(n => n.id === notificationId)
    if (notification && !notification.read) {
      notification.read = true
      state.unreadCount--
    }
  },
  MARK_ALL_AS_READ(state) {
    state.notifications.forEach(notification => {
      notification.read = true
    })
    state.unreadCount = 0
  },
  REMOVE_NOTIFICATION(state, notificationId) {
    const notification = state.notifications.find(n => n.id === notificationId)
    if (notification && !notification.read) {
      state.unreadCount--
    }
    state.notifications = state.notifications.filter(n => n.id !== notificationId)
  }
}

const actions = {
  async fetchNotifications({ commit }) {
    try {
      const response = await api.get('/notifications')
      commit('SET_NOTIFICATIONS', response.data.notifications)
      
      const unreadCount = response.data.notifications.filter(n => !n.read).length
      commit('SET_UNREAD_COUNT', unreadCount)
      
      return response.data.notifications
    } catch (error) {
      console.error('Error fetching notifications:', error)
      throw error
    }
  },

  async markAsRead({ commit }, notificationId) {
    try {
      await api.put(`/notifications/${notificationId}/read`)
      commit('MARK_AS_READ', notificationId)
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'خطا در علامت‌گذاری اعلان' 
      }
    }
  },

  async markAllAsRead({ commit }) {
    try {
      await api.put('/notifications/read-all')
      commit('MARK_ALL_AS_READ')
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'خطا در علامت‌گذاری همه اعلان‌ها' 
      }
    }
  },

  async deleteNotification({ commit }, notificationId) {
    try {
      await api.delete(`/notifications/${notificationId}`)
      commit('REMOVE_NOTIFICATION', notificationId)
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'خطا در حذف اعلان' 
      }
    }
  },

  async updateSettings({ commit }, settings) {
    try {
      const response = await api.put('/notifications/settings', settings)
      commit('SET_SETTINGS', response.data.settings)
      return { success: true, settings: response.data.settings }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'خطا در بروزرسانی تنظیمات' 
      }
    }
  },

  initializeWebSocket({ commit }) {
    // Listen for real-time notifications
    websocketService.on('notification', (notification) => {
      commit('ADD_NOTIFICATION', notification)
      
      // Show browser notification if enabled
      if (state.settings.push && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico'
        })
      }
    })
  }
}

const getters = {
  notifications: state => state.notifications,
  unreadCount: state => state.unreadCount,
  settings: state => state.settings,
  
  recent: state => {
    return state.notifications.slice(0, 10)
  },
  
  unread: state => {
    return state.notifications.filter(notification => !notification.read)
  },
  
  byType: state => (type) => {
    return state.notifications.filter(notification => notification.type === type)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
