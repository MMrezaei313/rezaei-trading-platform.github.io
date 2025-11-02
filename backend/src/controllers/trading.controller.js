import { TradingService } from '../services/trading.service.js'
import { AppError } from '../utils/AppError.js'

/**
 * Trading Controller
 */
class TradingController {
  /**
   * Get available symbols
   */
  async getSymbols(req, res, next) {
    try {
      const { market } = req.query
      const symbols = await TradingService.getAvailableSymbols(market)
      
      res.json({
        success: true,
        symbols
      })

    } catch (error) {
      next(error)
    }
  }

  /**
   * Get market data for symbol
   */
  async getMarketData(req, res, next) {
    try {
      const { symbol } = req.params
      const marketData = await TradingService.getMarketData(symbol)
      
      res.json({
        success: true,
        marketData
      })

    } catch (error) {
      next(error)
    }
  }

  /**
   * Place new order
   */
  async placeOrder(req, res, next) {
    try {
      const orderData = {
        ...req.body,
        userId: req.user.userId
      }

      const order = await TradingService.placeOrder(orderData)
      
      res.status(201).json({
        success: true,
        message: 'سفارش با موفقیت ثبت شد',
        order
      })

    } catch (error) {
      next(error)
    }
  }

  /**
   * Get active orders
   */
  async getActiveOrders(req, res, next) {
    try {
      const { userId } = req.user
      const orders = await TradingService.getActiveOrders(userId)
      
      res.json({
        success: true,
        orders
      })

    } catch (error) {
      next(error)
    }
  }

  /**
   * Get order history
   */
  async getOrderHistory(req, res, next) {
    try {
      const { userId } = req.user
      const { limit = 50, offset = 0 } = req.query
      
      const orders = await TradingService.getOrderHistory(userId, parseInt(limit), parseInt(offset))
      
      res.json({
        success: true,
        orders
      })

    } catch (error) {
      next(error)
    }
  }

  /**
   * Cancel order
   */
  async cancelOrder(req, res, next) {
    try {
      const { orderId } = req.params
      const { userId } = req.user

      await TradingService.cancelOrder(orderId, userId)
      
      res.json({
        success: true,
        message: 'سفارش با موفقیت لغو شد'
      })

    } catch (error) {
      next(error)
    }
  }

  /**
   * Get open positions
   */
  async getOpenPositions(req, res, next) {
    try {
      const { userId } = req.user
      const positions = await TradingService.getOpenPositions(userId)
      
      res.json({
        success: true,
        positions
      })

    } catch (error) {
      next(error)
    }
  }

  /**
   * Get trading statistics
   */
  async getTradingStats(req, res, next) {
    try {
      const { userId } = req.user
      const stats = await TradingService.getTradingStats(userId)
      
      res.json({
        success: true,
        stats
      })

    } catch (error) {
      next(error)
    }
  }

  /**
   * Start automated trading
   */
  async startTrading(req, res, next) {
    try {
      const { userId } = req.user
      await TradingService.startAutomatedTrading(userId)
      
      res.json({
        success: true,
        message: 'معاملات خودکار آغاز شد'
      })

    } catch (error) {
      next(error)
    }
  }

  /**
   * Stop automated trading
   */
  async stopTrading(req, res, next) {
    try {
      const { userId } = req.user
      await TradingService.stopAutomatedTrading(userId)
      
      res.json({
        success: true,
        message: 'معاملات خودکار متوقف شد'
      })

    } catch (error) {
      next(error)
    }
  }

  /**
   * Get orderbook for symbol
   */
  async getOrderbook(req, res, next) {
    try {
      const { symbol } = req.params
      const orderbook = await TradingService.getOrderbook(symbol)
      
      res.json({
        success: true,
        orderbook
      })

    } catch (error) {
      next(error)
    }
  }

  /**
   * Get recent trades
   */
  async getRecentTrades(req, res, next) {
    try {
      const { symbol } = req.params
      const { limit = 100 } = req.query
      
      const trades = await TradingService.getRecentTrades(symbol, parseInt(limit))
      
      res.json({
        success: true,
        trades
      })

    } catch (error) {
      next(error)
    }
  }
}

export default new TradingController()
