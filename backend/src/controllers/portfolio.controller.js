import { Portfolio } from '../models/portfolio/portfolio.model.js'
import { Asset } from '../models/portfolio/asset.model.js'
import { Performance } from '../models/portfolio/performance.model.js'
import { Trade } from '../models/trading/trade.model.js'
import { Position } from '../models/trading/position.model.js'

export class PortfolioController {
  /**
   * Get portfolio overview
   */
  async getPortfolio(req, res) {
    try {
      const userId = req.user.userId

      let portfolio = await Portfolio.findOne({ userId })
      
      // Create portfolio if it doesn't exist
      if (!portfolio) {
        portfolio = new Portfolio({
          userId,
          totalValue: 0,
          cashBalance: 0,
          investedValue: 0,
          totalProfitLoss: 0,
          dailyProfitLoss: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        await portfolio.save()
      }

      // Calculate current portfolio value from positions
      const positions = await Position.find({ userId, status: 'OPEN' })
      const investedValue = positions.reduce((total, position) => {
        return total + (position.quantity * position.costBasis)
      }, 0)

      const totalValue = portfolio.cashBalance + investedValue
      const totalProfitLoss = totalValue - portfolio.totalValue

      // Update portfolio
      portfolio.totalValue = totalValue
      portfolio.investedValue = investedValue
      portfolio.totalProfitLoss = totalProfitLoss
      portfolio.updatedAt = new Date()

      await portfolio.save()

      res.json({
        success: true,
        portfolio: portfolio.toObject()
      })

    } catch (error) {
      console.error('Get portfolio error:', error)
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت اطلاعات پرتفوی',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }

  /**
   * Get portfolio performance
   */
  async getPerformance(req, res) {
    try {
      const userId = req.user.userId
      const { period = '7d' } = req.query

      // Calculate period dates
      const endDate = new Date()
      const startDate = this.calculateStartDate(period, endDate)

      // Get performance records for the period
      const performanceRecords = await Performance.find({
        userId,
        date: { $gte: startDate, $lte: endDate }
      }).sort({ date: 1 })

      // Calculate performance metrics
      const performance = this.calculatePerformanceMetrics(performanceRecords, period)

      res.json({
        success: true,
        performance: {
          period,
          startDate,
          endDate,
          ...performance,
          history: performanceRecords.map(record => ({
            date: record.date,
            value: record.totalValue,
            profitLoss: record.dailyProfitLoss
          }))
        }
      })

    } catch (error) {
      console.error('Get performance error:', error)
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت عملکرد پرتفوی',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }

  /**
   * Get asset allocation
   */
  async getAssetAllocation(req, res) {
    try {
      const userId = req.user.userId

      const positions = await Position.find({ userId, status: 'OPEN' })
      const portfolio = await Portfolio.findOne({ userId })

      if (!portfolio) {
        return res.json({
          success: true,
          allocation: []
        })
      }

      // Group positions by symbol and calculate allocation
      const allocationMap = {}
      let totalInvested = 0

      positions.forEach(position => {
        const symbol = position.symbol
        const value = position.quantity * position.costBasis
        
        if (!allocationMap[symbol]) {
          allocationMap[symbol] = {
            symbol,
            name: this.getAssetName(symbol),
            value: 0,
            quantity: 0,
            costBasis: 0
          }
        }

        allocationMap[symbol].value += value
        allocationMap[symbol].quantity += position.quantity
        allocationMap[symbol].costBasis = position.costBasis
        totalInvested += value
      })

      // Convert to array and calculate percentages
      const allocation = Object.values(allocationMap).map(asset => ({
        ...asset,
        percentage: totalInvested > 0 ? (asset.value / totalInvested) * 100 : 0
      }))

      // Add cash allocation
      if (portfolio.cashBalance > 0) {
        allocation.push({
          symbol: 'CASH',
          name: 'نقد',
          value: portfolio.cashBalance,
          quantity: portfolio.cashBalance,
          costBasis: 1,
          percentage: (portfolio.cashBalance / portfolio.totalValue) * 100
        })
      }

      res.json({
        success: true,
        allocation: allocation.sort((a, b) => b.value - a.value)
      })

    } catch (error) {
      console.error('Get asset allocation error:', error)
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت توزیع دارایی‌ها',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }

  /**
   * Get transaction history
   */
  async getTransactions(req, res) {
    try {
      const userId = req.user.userId
      const { symbol, type, startDate, endDate, page = 1, limit = 50 } = req.query

      const filter = { userId }

      if (symbol) filter.symbol = symbol
      if (type) filter.side = type

      if (startDate || endDate) {
        filter.executedAt = {}
        if (startDate) filter.executedAt.$gte = new Date(startDate)
        if (endDate) filter.executedAt.$lte = new Date(endDate)
      }

      const transactions = await Trade.find(filter)
        .sort({ executedAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))

      const total = await Trade.countDocuments(filter)

      res.json({
        success: true,
        transactions: transactions.map(trade => ({
          id: trade._id,
          type: trade.side,
          symbol: trade.symbol,
          amount: trade.quantity,
          price: trade.price,
          total: trade.total,
          fee: trade.fee,
          timestamp: trade.executedAt
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      })

    } catch (error) {
      console.error('Get transactions error:', error)
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت تاریخچه تراکنش‌ها',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }

  /**
   * Get portfolio analytics
   */
  async getAnalytics(req, res) {
    try {
      const userId = req.user.userId
      const { period = '30d' } = req.query

      const endDate = new Date()
      const startDate = this.calculateStartDate(period, endDate)

      // Get trades for the period
      const trades = await Trade.find({
        userId,
        executedAt: { $gte: startDate, $lte: endDate }
      })

      // Get performance records
      const performanceRecords = await Performance.find({
        userId,
        date: { $gte: startDate, $lte: endDate }
      }).sort({ date: 1 })

      // Calculate analytics
      const analytics = this.calculateAdvancedAnalytics(trades, performanceRecords, period)

      res.json({
        success: true,
        analytics
      })

    } catch (error) {
      console.error('Get analytics error:', error)
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت تحلیل‌های پرتفوی',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }

  /**
   * Calculate start date based on period
   */
  calculateStartDate(period, endDate) {
    const startDate = new Date(endDate)

    switch (period) {
      case '1d':
        startDate.setDate(startDate.getDate() - 1)
        break
      case '7d':
        startDate.setDate(startDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(startDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(startDate.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1)
        break
      default:
        startDate.setDate(startDate.getDate() - 7)
    }

    return startDate
  }

  /**
   * Calculate performance metrics
   */
  calculatePerformanceMetrics(performanceRecords, period) {
    if (performanceRecords.length === 0) {
      return {
        totalReturn: 0,
        dailyReturn: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
        volatility: 0,
        winRate: 0
      }
    }

    const firstRecord = performanceRecords[0]
    const lastRecord = performanceRecords[performanceRecords.length - 1]

    // Total return
    const totalReturn = ((lastRecord.totalValue - firstRecord.totalValue) / firstRecord.totalValue) * 100

    // Daily returns for Sharpe ratio and volatility
    const dailyReturns = []
    for (let i = 1; i < performanceRecords.length; i++) {
      const dailyReturn = (performanceRecords[i].totalValue - performanceRecords[i-1].totalValue) / performanceRecords[i-1].totalValue
      dailyReturns.push(dailyReturn)
    }

    // Average daily return
    const avgDailyReturn = dailyReturns.reduce((sum, ret) => sum + ret, 0) / dailyReturns.length

    // Volatility (standard deviation of daily returns)
    const variance = dailyReturns.reduce((sum, ret) => sum + Math.pow(ret - avgDailyReturn, 2), 0) / dailyReturns.length
    const volatility = Math.sqrt(variance) * Math.sqrt(252) * 100 // Annualized

    // Sharpe ratio (assuming risk-free rate of 0 for simplicity)
    const sharpeRatio = avgDailyReturn > 0 ? (avgDailyReturn / Math.sqrt(variance)) * Math.sqrt(252) : 0

    // Maximum drawdown
    let maxDrawdown = 0
    let peak = firstRecord.totalValue

    performanceRecords.forEach(record => {
      if (record.totalValue > peak) {
        peak = record.totalValue
      }
      const drawdown = ((peak - record.totalValue) / peak) * 100
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown
      }
    })

    return {
      totalReturn: parseFloat(totalReturn.toFixed(2)),
      dailyReturn: parseFloat(avgDailyReturn.toFixed(4)),
      sharpeRatio: parseFloat(sharpeRatio.toFixed(2)),
      maxDrawdown: parseFloat(maxDrawdown.toFixed(2)),
      volatility: parseFloat(volatility.toFixed(2)),
      winRate: 65.5 // This would be calculated from trade history
    }
  }

  /**
   * Get asset name from symbol
   */
  getAssetName(symbol) {
    const assetNames = {
      'BTC-USDT': 'بیت‌کوین',
      'ETH-USDT': 'اتریوم',
      'ADA-USDT': 'کاردانو',
      'DOT-USDT': 'پولکادات',
      'XRP-USDT': 'ریپل',
      'TSETMC.1': 'شاخص کل بورس',
      'FOLD': 'شستا',
      'WKLM': 'ولومکان'
    }

    return assetNames[symbol] || symbol
  }

  /**
   * Calculate advanced analytics
   */
  calculateAdvancedAnalytics(trades, performanceRecords, period) {
    // This would include more sophisticated analytics like:
    // - Alpha and Beta
    // - Sortino ratio
    // - Calmar ratio
    // - Value at Risk (VaR)
    // - Correlation analysis
    // - Risk-adjusted returns

    const winningTrades = trades.filter(trade => {
      // Determine if trade was profitable based on subsequent price movements
      // This is simplified - in reality you'd need actual trade P&L
      return Math.random() > 0.4 // Placeholder
    })

    return {
      totalTrades: trades.length,
      winningTrades: winningTrades.length,
      losingTrades: trades.length - winningTrades.length,
      winRate: trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0,
      avgWin: 2.1, // Placeholder
      avgLoss: -1.4, // Placeholder
      profitFactor: 1.8, // Placeholder
      expectancy: 0.8, // Placeholder
      var95: -8.5 // Value at Risk 95%
    }
  }
}

export default new PortfolioController()
