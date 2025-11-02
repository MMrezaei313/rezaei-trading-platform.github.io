import axios from 'axios'
import { useToast } from 'vue-toastification'

const toast = useToast()

// Create axios instance
const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:3000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    } else if (error.response?.status >= 500) {
      toast.error('خطای سرور. لطفاً稍后再试')
    } else if (error.response?.data?.message) {
      toast.error(error.response.data.message)
    }
    
    return Promise.reject(error)
  }
)

export { api }
