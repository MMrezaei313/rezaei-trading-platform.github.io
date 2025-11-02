import { api } from '@/services/api'

const state = {
  models: [],
  predictions: [],
  trainingJobs: [],
  aiConfig: {}
}

const mutations = {
  SET_MODELS(state, models) {
    state.models = models
  },
  SET_PREDICTIONS(state, predictions) {
    state.predictions = predictions
  },
  SET_TRAINING_JOBS(state, jobs) {
    state.trainingJobs = jobs
  },
  SET_AI_CONFIG(state, config) {
    state.aiConfig = config
  },
  ADD_MODEL(state, model) {
    state.models.push(model)
  },
  UPDATE_MODEL(state, updatedModel) {
    const index = state.models.findIndex(m => m.id === updatedModel.id)
    if (index > -1) {
      state.models.splice(index, 1, updatedModel)
    }
  },
  REMOVE_MODEL(state, modelId) {
    state.models = state.models.filter(m => m.id !== modelId)
  },
  ADD_PREDICTION(state, prediction) {
    state.predictions.unshift(prediction)
  }
}

const actions = {
  async fetchModels({ commit }) {
    try {
      const response = await api.get('/ai/models')
      commit('SET_MODELS', response.data.models)
      return response.data.models
    } catch (error) {
      console.error('Error fetching AI models:', error)
      throw error
    }
  },

  async fetchPredictions({ commit }) {
    try {
      const response = await api.get('/ai/predictions')
      commit('SET_PREDICTIONS', response.data.predictions)
      return response.data.predictions
    } catch (error) {
      console.error('Error fetching predictions:', error)
      throw error
    }
  },

  async fetchTrainingJobs({ commit }) {
    try {
      const response = await api.get('/ai/training-jobs')
      commit('SET_TRAINING_JOBS', response.data.jobs)
      return response.data.jobs
    } catch (error) {
      console.error('Error fetching training jobs:', error)
      throw error
    }
  },

  async fetchAIConfig({ commit }) {
    try {
      const response = await api.get('/ai/config')
      commit('SET_AI_CONFIG', response.data.config)
      return response.data.config
    } catch (error) {
      console.error('Error fetching AI config:', error)
      throw error
    }
  },

  async trainModel({ commit }, modelId) {
    try {
      const response = await api.post(`/ai/models/${modelId}/train`)
      commit('UPDATE_MODEL', response.data.model)
      return { success: true, model: response.data.model }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'خطا در آموزش مدل' 
      }
    }
  },

  async deployModel({ commit }, modelId) {
    try {
      const response = await api.post(`/ai/models/${modelId}/deploy`)
      commit('UPDATE_MODEL', response.data.model)
      return { success: true, model: response.data.model }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'خطا در فعال‌سازی مدل' 
      }
    }
  },

  async deleteModel({ commit }, modelId) {
    try {
      await api.delete(`/ai/models/${modelId}`)
      commit('REMOVE_MODEL', modelId)
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'خطا در حذف مدل' 
      }
    }
  },

  async saveModel({ commit }, model) {
    try {
      const response = await api.post('/ai/models', model)
      commit('ADD_MODEL', response.data.model)
      return { success: true, model: response.data.model }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'خطا در ذخیره مدل' 
      }
    }
  },

  async generatePrediction({ commit }, { modelId, data }) {
    try {
      const response = await api.post(`/ai/models/${modelId}/predict`, data)
      commit('ADD_PREDICTION', response.data.prediction)
      return { success: true, prediction: response.data.prediction }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'خطا در تولید پیش‌بینی' 
      }
    }
  }
}

const getters = {
  models: state => state.models,
  predictions: state => state.predictions,
  trainingJobs: state => state.trainingJobs,
  aiConfig: state => state.aiConfig,
  
  activeModels: state => state.models.filter(model => model.deployed),
  recentPredictions: state => state.predictions.slice(0, 10),
  
  averageAccuracy: state => {
    const activeModels = state.models.filter(model => model.deployed)
    if (activeModels.length === 0) return 0
    const totalAccuracy = activeModels.reduce((sum, model) => sum + model.accuracy, 0)
    return Math.round(totalAccuracy / activeModels.length)
  },
  
  todayPredictionsCount: state => {
    const today = new Date().toDateString()
    return state.predictions.filter(p => 
      new Date(p.timestamp).toDateString() === today
    ).length
  },
  
  profitPercentage: state => {
    // Calculate AI-driven profit percentage
    const aiTrades = state.predictions.filter(p => p.actualProfit !== undefined)
    if (aiTrades.length === 0) return 0
    const totalProfit = aiTrades.reduce((sum, trade) => sum + trade.actualProfit, 0)
    return parseFloat((totalProfit / aiTrades.length).toFixed(2))
  },
  
  currentSignals: state => {
    return state.predictions
      .filter(p => new Date(p.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000))
      .slice(0, 5)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
