import { Order } from '../models/order.model.js'
import { Position } from '../models/position.model.js'
import { ExchangeService } from './exchange.service.js'
import { RiskService } from './risk.service.js'
import { AppError } from '../utils/AppError.js'

/**
 * Trading Service - Handles all trading operations
 */
class TradingService {
  /**
   * Get available trading symbols
   */
  async getAvailableSymbols(market = null) {
    try {
      const exchangeService = ExchangeService.getInstance()
      return await exchangeService.getSymbols(market)
    } catch (error) {
      throw new AppError(`خطا در دریافت نمادها: ${error.message}`, 500)
    }
  }

  /**
   * Get market data for symbol
   */
  async getMarketData(symbol) {
    try {
      const exchangeService = ExchangeService.getInstance()
      return await exchangeService.getMarketData(symbol)
    } catch (error) {
      throw new AppError(`خطا در دریافت اطلاعات بازار: ${error.message}`, 500)
    }
  }

  /**
   * Place new order
   */
  async placeOrder(orderData) {
    const session = await Order.startSession()
    session.startTransaction()

    try {
      const { userId, symbol, side, type, quantity, price, stopPrice } = orderData

      // Validate order with risk service
      await RiskService.validateOrder(userId, orderData)

      // Get exchange service
      const exchangeService = ExchangeService.getInstance()

      // Place order on exchange
      const exchangeOrder = await exchangeService.placeOrder({
        symbol,
        side,
        type,
        quantity,
        price,
        stopPrice
      })

      // Create order record in database
      const order = new Order({
        userId,
        symbol,
        side,
        type,
        quantity,
        price,
        stopPrice,
        status: 'OPEN',
        exchangeOrderId: exchangeOrder.id,
        exchange: exchangeOrder.exchange,
        timestamp: new Date()
      })

      await order.save({ session })

      // Update risk limits
      await RiskService.updateRiskLimits(userId, order, session)

      await session.commitTransaction()

      return order

    } catch (error) {
      await session.abortTransaction()
      throw new AppError(`خطا در ثبت سفارش: ${error.message}`, 500)
    } finally {
      session.endSession()
    }
  }

  /**
   * Get active orders for user
   */
  async getActiveOrders(userId) {
    try {
      return await Order.find({
        userId,
        status: { $in: ['OPEN', 'PARTIAL'] }
      }).sort({ timestamp: -1 })
    } catch (error) {
      throw new AppError(`خطا در دریافت سفارشات فعال: ${error.message}`, 500)
    }
  }

  /**
   * Get order history for user
   */
  async getOrderHistory(userId, limit = 50, offset = 0) {
    try {
      return await Order.find({ userId })
        .sort({ timestamp: -1 })
        .skip(offset)
        .limit(limit)
    } catch (error) {
      throw new AppError(`خطا در دریافت تاریخچه سفارشات: ${error.message}`, 500)
    }
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId, userId) {
    const session = await Order.startSession()
    session.startTransaction()

    try {
      // Find order
      const order = await Order.findOne({ _id: orderId, userId })
      if (!order) {
        throw new AppError('سفارش یافت نشد', 404)
      }

      if (!['OPEN', 'PARTIAL'].includes(order.status)) {
        throw new AppError('امکان لغو این سفارش وجود ندارد', 400)
      }

      // Cancel order on exchange
      const exchangeService = ExchangeService.getInstance()
      await exchangeService.cancelOrder(order.exchangeOrderId, order.symbol)

      // Update order status
      order.status = 'CANCELLED'
      order.updatedAt = new Date()
      await order.save({ session })

      // Update risk limits
      await RiskService.updateRiskLimitsAfterCancel(userId, order, session)

      await session.commitTransaction()

    } catch (error) {
      await session.abortTransaction()
      throw new AppError(`خطا در لغو سفارش: ${error.message}`, 500)
    } finally {
      session.endSession()
    }
  }

  /**
   * Get open positions for user
   */
  async getOpenPositions(userId) {
    try {
      return await Position.find({ userId, status: 'OPEN' })
    } catch (error) {
      throw new AppError(`خطا در دریافت پوزیشن‌های باز: ${error.message}`, 500)
    }
  }

  /**
   * Get trading statistics for user
   */
  async getTradingStats(userId) {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const stats = await Order.aggregate([
        {
          $match: {
            userId,
            timestamp: { $gte: today },
            status: 'FILLED'
          }
        },
        {
          $group: {
            _id: null,
            totalTrades: { $sum: 1 },
            totalVolume: { $sum: '$quantity' },
            totalProfit: {
              $sum: {
                $cond: [
                  { $eq: ['$side', 'BUY'] },
                  { $multiply: ['$quantity', '$price', -1] },
                  { $multiply: ['$quantity', '$price'] }
                ]
              }
            }
          }
        }
      ])

      return stats[0] || {
        totalTrades: 0,
        totalVolume: 0,
        totalProfit: 0
      }

    } catch (error) {
      throw new AppError(`خطا در دریافت آمار معاملاتی: ${error.message}`, 500)
    }
  }

  /**
   * Start automated trading for user
   */
  async startAutomatedTrading(userId) {
    try {
      // Implementation for starting automated trading
      // This would integrate with the strategy execution engine
      console.log(`Starting automated trading for user: ${userId}`)
      
      // TODO: Implement automated trading logic
      return { success: true }

    } catch (error) {
      throw new AppError(`خطا در شروع معاملات خودکار: ${error.message}`, 500)
    }
  }

  /**
   * Stop automated trading for user
   */
  async stopAutomatedTrading(userId) {
    try {
      // Implementation for stopping automated trading
      console.log(`Stopping automated trading for user: ${userId}`)
      
      // TODO: Implement stop trading logic
      return { success: true }

    } catch (error) {
      throw new AppError(`خطا در توقف معاملات خودکار: ${error.message}`, 500)
    }
  }

  /**
   * Get orderbook for symbol
   */
  async getOrderbook(symbol) {
    try {
      const exchangeService = ExchangeService.getInstance()
      return await exchangeService.getOrderbook(symbol)
    } catch (error) {
      throw new AppError(`خطا در دریافت دفتر سفارشات: ${error.message}`, 500)
    }
  }

  /**
   * Get recent trades for symbol
   */
  async getRecentTrades(symbol, limit = 100) {
    try {
      const exchangeService = ExchangeService.getInstance()
      return await exchangeService.getRecentTrades(symbol, limit)
    } catch (error) {
      throw new AppError(`خطا در دریافت معاملات اخیر: ${error.message}`, 500)
    }
  }

  /**
   * Update order status from exchange
   */
  async updateOrderStatus(orderId, newStatus) {
    try {
      const order = await Order.findById(orderId)
      if (!order) return

      order.status = newStatus
      order.updatedAt = new Date()
      await order.save()

      // If order is filled, update position
      if (newStatus === 'FILLED') {
        await this.updatePosition(order)
      }

    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  /**
   * Update position based on filled order
   */
  async updatePosition(order) {
    try {
      const { userId, symbol, side, quantity, price } = order

      let position = await Position.findOne({ userId, symbol, status: 'OPEN' })

      if (!position) {
        position = new Position({
          userId,
          symbol,
          quantity: 0,
          averagePrice: 0,
          status: 'OPEN'
        })
      }

      if (side === 'BUY') {
        const totalValue = position.quantity * position.averagePrice + quantity * price
        position.quantity += quantity
        position.averagePrice = totalValue / position.quantity
      } else {
        position.quantity -= quantity
        if (position.quantity <= 0) {
          position.status = 'CLOSED'
          position.closedAt = new Date()
        }
      }

      await position.save()

    } catch (error) {
      console.error('Error updating position:', error)
    }
  }
}

export const tradingService = new TradingService()
