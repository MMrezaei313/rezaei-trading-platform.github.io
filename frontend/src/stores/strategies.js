import { api } from '@/services/api'

const state = {
  strategies: [],
  activeStrategies: [],
  backtestResults: {},
  availableIndicators: [],
  strategyTemplates: []
}

const mutations = {
  SET_STRATEGIES(state, strategies) {
    state.strategies = strategies
  },
  SET_ACTIVE_STRATEGIES(state, strategies) {
    state.activeStrategies = strategies
  },
  SET_BACKTEST_RESULTS(state, { strategyId, results }) {
    state.backtestResults[strategyId] = results
  },
  SET_AVAILABLE_INDICATORS(state, indicators) {
    state.availableIndicators = indicators
  },
  SET_STRATEGY_TEMPLATES(state, templates) {
    state.strategyTemplates = templates
  },
  ADD_STRATEGY(state, strategy) {
    state.strategies.push(strategy)
  },
  UPDATE_STRATEGY(state, updatedStrategy) {
    const index = state.strategies.findIndex(s => s.id === updatedStrategy.id)
    if (index > -1) {
      state.strategies.splice(index, 1, updatedStrategy)
    }
  },
  REMOVE_STRATEGY(state, strategyId) {
    state.strategies = state.strategies.filter(s => s.id !== strategyId)
    state.activeStrategies = state.activeStrategies.filter(s => s.id !== strategyId)
  }
}

const actions = {
  async fetchStrategies({ commit }) {
    try {
      const response = await api.get('/strategies')
      commit('SET_STRATEGIES', response.data.strategies)
      return response.data.strategies
    } catch (error) {
      console.error('Error fetching strategies:', error)
      throw error
    }
  },

  async fetchActiveStrategies({ commit }) {
    try {
      const response = await api.get('/strategies/active')
      commit('SET_ACTIVE_STRATEGIES', response.data.strategies)
      return response.data.strategies
    } catch (error) {
      console.error('Error fetching active strategies:', error)
      throw error
    }
  },

  async fetchAvailableIndicators({ commit }) {
    try {
      const response = await api.get('/strategies/indicators')
      commit('SET_AVAILABLE_INDICATORS', response.data.indicators)
      return response.data.indicators
    } catch (error) {
      console.error('Error fetching indicators:', error)
      throw error
    }
  },

  async fetchStrategyTemplates({ commit }) {
    try {
      const response = await api.get('/strategies/templates')
      commit('SET_STRATEGY_TEMPLATES', response.data.templates)
      return response.data.templates
    } catch (error) {
      console.error('Error fetching templates:', error)
      throw error
    }
  },

  async testStrategy({ commit }, strategyConfig) {
    try {
      const response = await api.post('/strategies/backtest', strategyConfig)
      commit('SET_BACKTEST_RESULTS', {
        strategyId: strategyConfig.id || 'temp',
        results: response.data.results
      })
      return response.data.results
    } catch (error) {
      console.error('Error testing strategy:', error)
      throw error
    }
  },

  async saveStrategy({ commit }, strategy) {
    try {
      const response = await api.post('/strategies', strategy)
      commit('ADD_STRATEGY', response.data.strategy)
      return { success: true, strategy: response.data.strategy }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'خطا در ذخیره استراتژی' 
      }
    }
  },

  async updateStrategy({ commit }, { id, updates }) {
    try {
      const response = await api.put(`/strategies/${id}`, updates)
      commit('UPDATE_STRATEGY', response.data.strategy)
      return { success: true, strategy: response.data.strategy }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'خطا در بروزرسانی استراتژی' 
      }
    }
  },

  async deleteStrategy({ commit }, strategyId) {
    try {
      await api.delete(`/strategies/${strategyId}`)
      commit('REMOVE_STRATEGY', strategyId)
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'خطا در حذف استراتژی' 
      }
    }
  },

  async deployStrategy({ commit }, strategyId) {
    try {
      const response = await api.post(`/strategies/${strategyId}/deploy`)
      commit('UPDATE_STRATEGY', response.data.strategy)
      return { success: true, strategy: response.data.strategy }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'خطا در فعال‌سازی استراتژی' 
      }
    }
  },

  async stopStrategy({ commit }, strategyId) {
    try {
      const response = await api.post(`/strategies/${strategyId}/stop`)
      commit('UPDATE_STRATEGY', response.data.strategy)
      return { success: true, strategy: response.data.strategy }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'خطا در توقف استراتژی' 
      }
    }
  }
}

const getters = {
  strategies: state => state.strategies,
  activeStrategies: state => state.activeStrategies,
  availableIndicators: state => state.availableIndicators,
  strategyTemplates: state => state.strategyTemplates,
  activeCount: state => state.activeStrategies.length,
  
  backtestResults: state => (strategyId) => {
    return state.backtestResults[strategyId] || null
  },
  
  strategyById: state => (id) => {
    return state.strategies.find(s => s.id === id) || null
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
