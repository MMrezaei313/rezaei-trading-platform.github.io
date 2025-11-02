import { createStore } from 'vuex'
import auth from './auth'
import trading from './trading'
import strategies from './strategies'
import portfolio from './portfolio'
import ai from './ai'
import config from './config'
import notifications from './notifications'

export default createStore({
  state: {
    globalLoading: false,
    appVersion: '1.0.0'
  },
  mutations: {
    SET_GLOBAL_LOADING(state, loading) {
      state.globalLoading = loading
    }
  },
  actions: {
    setGlobalLoading({ commit }, loading) {
      commit('SET_GLOBAL_LOADING', loading)
    }
  },
  modules: {
    auth,
    trading,
    strategies,
    portfolio,
    ai,
    config,
    notifications
  }
})
