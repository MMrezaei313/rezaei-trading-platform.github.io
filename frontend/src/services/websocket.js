import io from 'socket.io-client'

class WebSocketService {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.listeners = new Map()
  }

  connect(token) {
    if (this.isConnected) return

    this.socket = io(process.env.VUE_APP_WS_URL || 'http://localhost:3000', {
      auth: {
        token: token
      },
      transports: ['websocket']
    })

    this.socket.on('connect', () => {
      this.isConnected = true
      console.log('WebSocket connected')
    })

    this.socket.on('disconnect', () => {
      this.isConnected = false
      console.log('WebSocket disconnected')
    })

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error)
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)

    if (this.socket) {
      this.socket.on(event, callback)
    }
  }

  off(event, callback) {
    const listeners = this.listeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }

    if (this.socket) {
      this.socket.off(event, callback)
    }
  }

  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data)
    }
  }
}

export const websocketService = new WebSocketService()
