import { api } from '@/services/api'

const state = {
  exchangeConfigs: {},
  tradingConfig: {},
  riskConfig: {},
  aiConfig: {},
  systemConfig: {}
}

const mutations = {
  SET_EXCHANGE_CONFIGS(state, configs) {
    state.exchangeConfigs = configs
  },
  SET_TRADING_CONFIG(state, config) {
    state.tradingConfig = config
  },
  SET_RISK_CONFIG(state, config) {
    state.riskConfig = config
  },
  SET_AI_CONFIG(state, config) {
    state.aiConfig = config
  },
  SET_SYSTEM_CONFIG(state, config) {
    state.systemConfig = config
  },
  UPDATE_EXCHANGE_CONFIG(state, { exchange, config }) {
    state.exchangeConfigs[exchange] = { ...state.exchangeConfigs[exchange], ...config }
  }
}

const actions = {
  async fetchAllConfigs({ commit }) {
    try {
      const [exchange, trading, risk, ai, system] = await Promise.all([
        api.get('/config/exchanges'),
        api.get('/config/trading'),
        api.get('/config/risk'),
        api.get('/config/ai'),
        api.get('/config/system')
      ])

      commit('SET_EXCHANGE_CONFIGS', exchange.data.configs)
      commit('SET_TRADING_CONFIG', trading.data.config)
      commit('SET_RISK_CONFIG', risk.data.config)
      commit('SET_AI_CONFIG', ai.data.config)
      commit('SET_SYSTEM_CONFIG', system.data.config)

      return {
        exchange: exchange.data.configs,
        trading: trading.data.config,
        risk: risk.data.config,
        ai: ai.data.config,
        system: system.data.config
      }
    } catch (error) {
      console.error('Error fetching configs:', error)
      throw error
    }
  },

  async updateExchangeConfig({ commit }, { exchange, config }) {
    try {
      const response = await api.put(`/config/exchanges/${exchange}`, config)
      commit('UPDATE_EXCHANGE_CONFIG', { exchange, config: response.data.config })
      return { success: true, config: response.data.config }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'خطا در بروزرسانی تنظیمات صرافی' 
      }
    }
  },

  async updateTradingConfig({ commit }, config) {
    try {
      const response = await api.put('/config/trading', config)
      commit('SET_TRADING_CONFIG', response.data.config)
      return { success: true, config: response.data.config }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'خطا در بروزرسانی تنظیمات معاملاتی' 
      }
    }
  },

  async updateRiskConfig({ commit }, config) {
    try {
      const response = await api.put('/config/risk', config)
      commit('SET_RISK_CONFIG', response.data.config)
      return { success: true, config: response.data.config }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'خطا در بروزرسانی تنظیمات ریسک' 
      }
    }
  },

  async updateAIConfig({ commit }, config) {
    try {
      const response = await api.put('/config/ai', config)
      commit('SET_AI_CONFIG', response.data.config)
      return { success: true, config: response.data.config }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'خطا در بروزرسانی تنظیمات هوش مصنوعی' 
      }
    }
  }
}

const getters = {
  exchangeConfigs: state => state.exchangeConfigs,
  tradingConfig: state => state.tradingConfig,
  riskConfig: state => state.riskConfig,
  aiConfig: state => state.aiConfig,
  systemConfig: state => state.systemConfig,
  
  exchangeConfig: state => (exchange) => {
    return state.exchangeConfigs[exchange] || {}
  },
  
  isExchangeConnected: state => (exchange) => {
    const config = state.exchangeConfigs[exchange]
    return config ? config.connected : false
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
