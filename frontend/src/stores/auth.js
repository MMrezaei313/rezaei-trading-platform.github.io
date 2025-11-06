import { api } from '@/services/api'

const actions = {
  async login({ commit }, credentials) {
    const response = await api.post('/auth/login', credentials)
    // مدیریت token و user از پاسخ سرور
  }
}

const mutations = {
  SET_USER(state, user) {
    state.user = user
  },
  SET_TOKEN(state, token) {
    state.token = token
    state.isAuthenticated = !!token
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
  },
  LOGOUT(state) {
    state.user = null
    state.token = null
    state.isAuthenticated = false
    localStorage.removeItem('token')
  }
}

const actions = {
  async login({ commit }, credentials) {
    try {
      const response = await api.post('/auth/login', credentials)
      const { user, token } = response.data
      
      commit('SET_USER', user)
      commit('SET_TOKEN', token)
      
      return { success: true, user }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'خطا در ورود' 
      }
    }
  },

  async register({ commit }, userData) {
    try {
      const response = await api.post('/auth/register', userData)
      const { user, token } = response.data
      
      commit('SET_USER', user)
      commit('SET_TOKEN', token)
      
      return { success: true, user }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'خطا در ثبت‌نام' 
      }
    }
  },

  async logout({ commit }) {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      commit('LOGOUT')
    }
  },

  async fetchUser({ commit }) {
    try {
      const response = await api.get('/auth/profile')
      commit('SET_USER', response.data.user)
      return { success: true, user: response.data.user }
    } catch (error) {
      commit('LOGOUT')
      return { success: false, error: 'خطا در دریافت اطلاعات کاربر' }
    }
  }
}

const getters = {
  user: state => state.user,
  isAuthenticated: state => state.isAuthenticated,
  token: state => state.token
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
