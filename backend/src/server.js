import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Load environment variables
dotenv.config()

// Import routes and middleware
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

// Import WebSocket server
import { setupWebSocket } from './websocket/websocket-server.js'

// Import database connection
import { connectDatabase } from './database/connection.js'

// Import job scheduler
import { startScheduler } from './jobs/scheduler.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class TradingServer {
  constructor() {
    this.app = express()
    this.port = process.env.PORT || 3000
    this.isProduction = process.env.NODE_ENV === 'production'
    
    this.initializeMiddlewares()
    this.initializeRoutes()
    this.initializeErrorHandling()
    this.initializeWebSocket()
  }

  initializeMiddlewares() {
    // Security middleware
    this.app.use(helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" }
    }))
    
    // CORS configuration
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:8080',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }))

    // Compression
    this.app.use(compression())

    // Logging
    if (!this.isProduction) {
      this.app.use(morgan('dev'))
    } else {
      this.app.use(morgan('combined'))
    }

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }))
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }))

    // Rate limiting
    this.app.use(rateLimit)

    // Static files
    this.app.use('/uploads', express.static(path.join(__dirname, '../uploads')))
    
    // Health check
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
      })
    })
  }

  initializeRoutes() {
    // API routes
    this.app.use('/api/auth', authRoutes)
    this.app.use('/api/trading', tradingRoutes)
    this.app.use('/api/strategies', strategiesRoutes)
    this.app.use('/api/portfolio', portfolioRoutes)
    this.app.use('/api/ai', aiRoutes)
    this.app.use('/api/data', dataRoutes)
    this.app.use('/api/exchange', exchangeRoutes)
    this.app.use('/api/system', systemRoutes)

    // API documentation
    this.app.get('/api/docs', (req, res) => {
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
        }
      })
    })
  }

  initializeErrorHandling() {
    this.app.use(notFound)
    this.app.use(errorHandler)
  }

  initializeWebSocket() {
    this.server = setupWebSocket(this.app)
  }

  async start() {
    try {
      // Connect to database
      await connectDatabase()
      console.log('✅ Database connected successfully')

      // Start job scheduler
      await startScheduler()
      console.log('✅ Job scheduler started')

      // Start server
      this.server.listen(this.port, () => {
        console.log(`🚀 Server running on port ${this.port}`)
        console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
        console.log(`🔗 API URL: http://localhost:${this.port}/api`)
        console.log(`📚 API Docs: http://localhost:${this.port}/api/docs`)
        console.log(`❤️ Health: http://localhost:${this.port}/health`)
      })

    } catch (error) {
      console.error('❌ Failed to start server:', error)
      process.exit(1)
    }
  }

  async shutdown() {
    console.log('🛑 Shutting down server...')
    
    // Close database connections
    // Close WebSocket connections
    // Stop job scheduler
    
    process.exit(0)
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received')
  server.shutdown()
})

process.on('SIGINT', () => {
  console.log('SIGINT received')
  server.shutdown()
})

// Create and start server
const server = new TradingServer()
server.start()

export default server
