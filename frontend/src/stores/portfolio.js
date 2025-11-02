import { api } from '@/services/api'

const state = {
  portfolio: {},
  performance: {},
  transactions: [],
  assetAllocation: []
}

const mutations = {
  SET_PORTFOLIO(state, portfolio) {
    state.portfolio = portfolio
  },
  SET_PERFORMANCE(state, performance) {
    state.performance = performance
  },
  SET_TRANSACTIONS(state, transactions) {
    state.transactions = transactions
  },
  SET_ASSET_ALLOCATION(state, allocation) {
    state.assetAllocation = allocation
  },
  ADD_TRANSACTION(state, transaction) {
    state.transactions.unshift(transaction)
  },
  UPDATE_PORTFOLIO_VALUE(state, { totalValue, totalProfitLoss }) {
    state.portfolio.totalValue = totalValue
    state.portfolio.totalProfitLoss = totalProfitLoss
  }
}

const actions = {
  async fetchPortfolio({ commit }) {
    try {
      const response = await api.get('/portfolio')
      commit('SET_PORTFOLIO', response.data.portfolio)
      return response.data.portfolio
    } catch (error) {
      console.error('Error fetching portfolio:', error)
      throw error
    }
  },

  async fetchPerformance({ commit }, period = '7d') {
    try {
      const response = await api.get(`/portfolio/performance?period=${period}`)
      commit('SET_PERFORMANCE', response.data.performance)
      return response.data.performance
    } catch (error) {
      console.error('Error fetching performance:', error)
      throw error
    }
  },

  async fetchTransactions({ commit }) {
    try {
      const response = await api.get('/portfolio/transactions')
      commit('SET_TRANSACTIONS', response.data.transactions)
      return response.data.transactions
    } catch (error) {
      console.error('Error fetching transactions:', error)
      throw error
    }
  },

  async fetchAssetAllocation({ commit }) {
    try {
      const response = await api.get('/portfolio/allocation')
      commit('SET_ASSET_ALLOCATION', response.data.allocation)
      return response.data.allocation
    } catch (error) {
      console.error('Error fetching allocation:', error)
      throw error
    }
  },

  async fetchOverview({ commit }) {
    try {
      const [portfolio, performance, allocation, transactions] = await Promise.all([
        api.get('/portfolio'),
        api.get('/portfolio/performance?period=7d'),
        api.get('/portfolio/allocation'),
        api.get('/portfolio/transactions?limit=10')
      ])

      commit('SET_PORTFOLIO', portfolio.data.portfolio)
      commit('SET_PERFORMANCE', performance.data.performance)
      commit('SET_ASSET_ALLOCATION', allocation.data.allocation)
      commit('SET_TRANSACTIONS', transactions.data.transactions)

      return {
        ...portfolio.data.portfolio,
        ...performance.data.performance,
        assetAllocation: allocation.data.allocation,
        recentTransactions: transactions.data.transactions
      }
    } catch (error) {
      console.error('Error fetching overview:', error)
      throw error
    }
  }
}

const getters = {
  portfolio: state => state.portfolio,
  performance: state => state.performance,
  transactions: state => state.transactions,
  assetAllocation: state => state.assetAllocation,
  
  totalBalance: state => state.portfolio.totalValue || 0,
  totalProfitLoss: state => state.portfolio.totalProfitLoss || 0,
  todayProfit: state => state.performance.todayProfit || 0,
  todayProfitPercent: state => state.performance.todayProfitPercent || 0,
  dailyChange: state => state.performance.dailyChange || 0,
  
  recentTransactions: state => {
    return state.transactions.slice(0, 5)
  },
  
  portfolioHistory: state => {
    return state.performance.history || []
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
