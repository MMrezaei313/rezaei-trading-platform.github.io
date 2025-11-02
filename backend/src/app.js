import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Import routes
import authRoutes from './routes/auth.routes.js'
import tradingRoutes from './routes/trading.routes.js'
import strategiesRoutes from './routes/strategies.routes.js'
import portfolioRoutes from './routes/portfolio.routes.js'
import aiRoutes from './routes/ai.routes.js'
import dataRoutes from './routes/data.routes.js'
import exchangeRoutes from './routes/exchange.routes.js'
import systemRoutes from './routes/system.routes.js'

// Import middleware
import { errorHandler } from './middleware/error-handler.js'
import { notFound } from './middleware/not-found.js'
import { rateLimit } from './middleware/rate-limit.js'
import { authenticate } from './middleware/auth.js'

const app = express()

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}))

// Compression
app.use(compression())

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'))
} else {
  app.use(morgan('combined'))
}

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Rate limiting
app.use(rateLimit)

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  })
})

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/trading', authenticate, tradingRoutes)
app.use('/api/strategies', authenticate, strategiesRoutes)
app.use('/api/portfolio', authenticate, portfolioRoutes)
app.use('/api/ai', authenticate, aiRoutes)
app.use('/api/data', authenticate, dataRoutes)
app.use('/api/exchange', authenticate, exchangeRoutes)
app.use('/api/system', authenticate, systemRoutes)

// API documentation
app.get('/api/docs', (req, res) => {
  res.json({
    message: 'Rezaei Trading Platform API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      trading: '/api/trading',
      strategies: '/api/strategies',
      portfolio: '/api/portfolio',
      ai: '/api/ai',
      data: '/api/data',
      exchange: '/api/exchange',
      system: '/api/system'
    },
    documentation: 'https://github.com/MMrezaei313/rezaei-trading-platform/docs'
  })
})

// 404 handler
app.use(notFound)

// Error handler
app.use(errorHandler)

export default app
