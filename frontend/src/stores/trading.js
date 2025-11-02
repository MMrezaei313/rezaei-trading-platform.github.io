import { api } from '@/services/api'
import { websocketService } from '@/services/websocket'

const state = {
  activeMarket: 'crypto',
  availableSymbols: [],
  activeOrders: [],
  openPositions: [],
  marketData: {},
  orderbooks: {},
  isTradingActive: false,
  todayProfitLoss: 0
}

const mutations = {
  SET_ACTIVE_MARKET(state, market) {
    state.activeMarket = market
  },
  SET_AVAILABLE_SYMBOLS(state, symbols) {
    state.availableSymbols = symbols
  },
  SET_ACTIVE_ORDERS(state, orders) {
    state.activeOrders = orders
  },
  SET_OPEN_POSITIONS(state, positions) {
    state.openPositions = positions
  },
  SET_MARKET_DATA(state, { symbol, data }) {
    state.marketData[symbol] = data
  },
  SET_ORDERBOOK(state, { symbol, orderbook }) {
    state.orderbooks[symbol] = orderbook
  },
  SET_TRADING_STATUS(state, status) {
    state.isTradingActive = status
  },
  SET_TODAY_PROFIT_LOSS(state, pnl) {
    state.todayProfitLoss = pnl
  },
  ADD_ORDER(state, order) {
    state.activeOrders.push(order)
  },
  UPDATE_ORDER(state, updatedOrder) {
    const index = state.activeOrders.findIndex(order => order.id === updatedOrder.id)
    if (index > -1) {
      state.activeOrders.splice(index, 1, updatedOrder)
    }
  },
  REMOVE_ORDER(state, orderId) {
    state.activeOrders = state.activeOrders.filter(order => order.id !== orderId)
  }
}

const actions = {
  async setActiveMarket({ commit }, market) {
    commit('SET_ACTIVE_MARKET', market)
  },

  async fetchAvailableSymbols({ commit }) {
    try {
      const response = await api.get('/trading/symbols')
      commit('SET_AVAILABLE_SYMBOLS', response.data.symbols)
      return response.data.symbols
    } catch (error) {
      console.error('Error fetching symbols:', error)
      throw error
    }
  },

  async fetchActiveOrders({ commit }) {
    try {
      const response = await api.get('/trading/orders/active')
      commit('SET_ACTIVE_ORDERS', response.data.orders)
      return response.data.orders
    } catch (error) {
      console.error('Error fetching active orders:', error)
      throw error
    }
  },

  async fetchOpenPositions({ commit }) {
    try {
      const response = await api.get('/trading/positions')
      commit('SET_OPEN_POSITIONS', response.data.positions)
      return response.data.positions
    } catch (error) {
      console.error('Error fetching positions:', error)
      throw error
    }
  },

  async fetchMarketData({ commit }, symbol) {
    try {
      const response = await api.get(`/trading/market-data/${symbol}`)
      commit('SET_MARKET_DATA', { symbol, data: response.data })
      return response.data
    } catch (error) {
      console.error('Error fetching market data:', error)
      throw error
    }
  },

  async placeOrder({ commit }, orderData) {
    try {
      const response = await api.post('/trading/orders', orderData)
      commit('ADD_ORDER', response.data.order)
      
      // Subscribe to order updates via WebSocket
      websocketService.emit('subscribe_order', response.data.order.id)
      
      return { success: true, order: response.data.order }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'خطا در ثبت سفارش' 
      }
    }
  },

  async cancelOrder({ commit }, orderId) {
    try {
      await api.delete(`/trading/orders/${orderId}`)
      commit('REMOVE_ORDER', orderId)
      
      // Unsubscribe from order updates
      websocketService.emit('unsubscribe_order', orderId)
      
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'خطا در لغو سفارش' 
      }
    }
  },

  async startTrading({ commit }) {
    try {
      await api.post('/trading/start')
      commit('SET_TRADING_STATUS', true)
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'خطا در شروع معاملات' 
      }
    }
  },

  async stopTrading({ commit }) {
    try {
      await api.post('/trading/stop')
      commit('SET_TRADING_STATUS', false)
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'خطا در توقف معاملات' 
      }
    }
  },

  subscribeOrderbook({ commit }, symbol) {
    websocketService.emit('subscribe_orderbook', symbol)
    
    // Listen for orderbook updates
    websocketService.on(`orderbook_${symbol}`, (data) => {
      commit('SET_ORDERBOOK', { symbol, orderbook: data })
    })
  },

  unsubscribeOrderbook({ commit }, symbol) {
    websocketService.emit('unsubscribe_orderbook', symbol)
    websocketService.off(`orderbook_${symbol}`)
  }
}

const getters = {
  activeMarket: state => state.activeMarket,
  availableSymbols: state => state.availableSymbols,
  activeOrders: state => state.activeOrders,
  openPositions: state => state.openPositions,
  isActive: state => state.isTradingActive,
  todayProfitLoss: state => state.todayProfitLoss,
  activeOrdersCount: state => state.activeOrders.length,
  
  marketData: state => (symbol) => {
    return state.marketData[symbol] || {}
  },
  
  orderbook: state => (symbol) => {
    return state.orderbooks[symbol] || { bids: [], asks: [] }
  },
  
  recentActivities: state => {
    const orders = state.activeOrders.map(order => ({
      type: 'order',
      id: order.id,
      symbol: order.symbol,
      side: order.side,
      amount: order.quantity,
      price: order.price,
      status: order.status,
      timestamp: order.timestamp
    }))
    
    // Sort by timestamp descending
    return orders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
