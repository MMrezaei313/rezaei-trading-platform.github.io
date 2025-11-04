import { StrategyService } from '../services/strategy.service.js'
import { AppError } from '../utils/AppError.js'

/**
 * Strategies Controller
 */
class StrategiesController {
  /**
   * Get all strategies for user
   */
  async getStrategies(req, res, next) {
    try {
      const { userId } = req.user
      const strategies = await StrategyService.getUserStrategies(userId)
      
      res.json({
        success: true,
        strategies
      })

    } catch (error) {
      next(error)
    }
  }

  /**
   * Get active strategies
   */
  async getActiveStrategies(req, res, next) {
    try {
      const { userId } = req.user
      const strategies = await StrategyService.getActiveStrategies(userId)
      
      res.json({
        success: true,
        strategies
      })

    } catch (error) {
      next(error)
    }
  }

  /**
   * Create new strategy
   */
  async createStrategy(req, res, next) {
    try {
      const strategyData = {
        ...req.body,
        userId: req.user.userId
      }

      const strategy = await StrategyService.createStrategy(strategyData)
      
      res.status(201).json({
        success: true,
        message: 'استراتژی با موفقیت ایجاد شد',
        strategy
      })

    } catch (error) {
      next(error)
    }
  }

  /**
   * Update strategy
   */
  async updateStrategy(req, res, next) {
    try {
      const { id } = req.params
      const { userId } = req.user
      const updates = req.body

      const strategy = await StrategyService.updateStrategy(id, userId, updates)
      
      res.json({
        success: true,
        message: 'استراتژی با موفقیت بروزرسانی شد',
        strategy
      })

    } catch (error) {
      next(error)
    }
  }

  /**
   * Delete strategy
   */
  async deleteStrategy(req, res, next) {
    try {
      const { id } = req.params
      const { userId } = req.user

      await StrategyService.deleteStrategy(id, userId)
      
      res.json({
        success: true,
        message: 'استراتژی با موفقیت حذف شد'
      })

    } catch (error) {
      next(error)
    }
  }

  /**
   * Run backtest for strategy
   */
  async runBacktest(req, res, next) {
    try {
      const { userId } = req.user
      const strategyConfig = req.body

      const results = await StrategyService.runBacktest(userId, strategyConfig)
      
      res.json({
        success: true,
        message: 'بکتست با موفقیت انجام شد',
        results
      })

    } catch (error) {
      next(error)
    }
  }

  /**
   * Deploy strategy
   */
  async deployStrategy(req, res, next) {
    try {
      const { id } = req.params
      const { userId } = req.user

      const strategy = await StrategyService.deployStrategy(id, userId)
      
      res.json({
        success: true,
        message: 'استراتژی با موفقیت فعال شد',
        strategy
      })

    } catch (error) {
      next(error)
    }
  }

  /**
   * Stop strategy
   */
  async stopStrategy(req, res, next) {
    try {
      const { id } = req.params
      const { userId } = req.user

      const strategy = await StrategyService.stopStrategy(id, userId)
      
      res.json({
        success: true,
        message: 'استراتژی با موفقیت متوقف شد',
        strategy
      })

    } catch (error) {
      next(error)
    }
  }

  /**
   * Get strategy performance
   */
  async getStrategyPerformance(req, res, next) {
    try {
      const { id } = req.params
      const { userId } = req.user

      const performance = await StrategyService.getStrategyPerformance(id, userId)
      
      res.json({
        success: true,
        performance
      })

    } catch (error) {
      next(error)
    }
  }

  /**
   * Get available indicators
   */
  async getIndicators(req, res, next) {
    try {
      const indicators = await StrategyService.getAvailableIndicators()
      
      res.json({
        success: true,
        indicators
      })

    } catch (error) {
      next(error)
    }
  }

  /**
   * Get strategy templates
   */
  async getTemplates(req, res, next) {
    try {
      const templates = await StrategyService.getStrategyTemplates()
      
      res.json({
        success: true,
        templates
      })

    } catch (error) {
      next(error)
    }
  }

  /**
   * Optimize strategy parameters
   */
  async optimizeStrategy(req, res, next) {
    try {
      const { userId } = req.user
      const { strategyId, parameters, optimizationConfig } = req.body

      const results = await StrategyService.optimizeStrategy(
        strategyId, 
        userId, 
        parameters, 
        optimizationConfig
      )
      
      res.json({
        success: true,
        message: 'بهینه‌سازی با موفقیت انجام شد',
        results
      })

    } catch (error) {
      next(error)
    }
  }
}

export default new StrategiesController()
    } catch (error) {
      console.error('Get backtest results error:', error)
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت نتایج بکتست',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }

  /**
   * Get available indicators
   */
  async getIndicators(req, res) {
    try {
      const indicators = [
        {
          id: 'rsi',
          name: 'RSI',
          description: 'شاخص قدرت نسبی',
          parameters: [
            { name: 'period', label: 'دوره', type: 'number', default: 14, min: 2, max: 50 }
          ]
        },
        {
          id: 'macd',
          name: 'MACD',
          description: 'میانگین متحرک همگرایی-واگرایی',
          parameters: [
            { name: 'fastPeriod', label: 'دوره سریع', type: 'number', default: 12, min: 2, max: 50 },
            { name: 'slowPeriod', label: 'دوره کند', type: 'number', default: 26, min: 2, max: 50 },
            { name: 'signalPeriod', label: 'دوره سیگنال', type: 'number', default: 9, min: 2, max: 50 }
          ]
        },
        {
          id: 'sma',
          name: 'SMA',
          description: 'میانگین متحرک ساده',
          parameters: [
            { name: 'period', label: 'دوره', type: 'number', default: 20, min: 2, max: 200 }
          ]
        },
        {
          id: 'ema',
          name: 'EMA',
          description: 'میانگین متحرک نمایی',
          parameters: [
            { name: 'period', label: 'دوره', type: 'number', default: 20, min: 2, max: 200 }
          ]
        },
        {
          id: 'bb',
          name: 'Bollinger Bands',
          description: 'باندهای بولینگر',
          parameters: [
            { name: 'period', label: 'دوره', type: 'number', default: 20, min: 2, max: 50 },
            { name: 'stdDev', label: 'انحراف معیار', type: 'number', default: 2, min: 1, max: 3, step: 0.1 }
          ]
        },
        {
          id: 'stoch',
          name: 'Stochastic',
          description: 'استوکستیک',
          parameters: [
            { name: 'kPeriod', label: 'دوره K', type: 'number', default: 14, min: 2, max: 50 },
            { name: 'dPeriod', label: 'دوره D', type: 'number', default: 3, min: 2, max: 20 }
          ]
        },
        {
          id: 'atr',
          name: 'ATR',
          description: 'محدوده واقعی متوسط',
          parameters: [
            { name: 'period', label: 'دوره', type: 'number', default: 14, min: 2, max: 50 }
          ]
        }
      ]

      res.json({
        success: true,
        indicators
      })

    } catch (error) {
      console.error('Get indicators error:', error)
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت اندیکاتورها',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }

  /**
   * Get strategy templates
   */
  async getTemplates(req, res) {
    try {
      const templates = [
        {
          id: 'mean_reversion',
          name: 'بازگشت به میانگین',
          description: 'استراتژی بازگشت به میانگین با استفاده از بولینگر باند',
          type: 'technical',
          config: {
            entryConditions: [
              {
                indicator: 'bb_lower',
                operator: '<=',
                value: 0,
                timeframe: 'current'
              }
            ],
            exitConditions: [
              {
                indicator: 'bb_upper',
                operator: '>=',
                value: 0,
                timeframe: 'current'
              }
            ],
            indicators: [
              {
                id: 'bb',
                name: 'Bollinger Bands',
                parameters: [
                  { name: 'period', value: 20 },
                  { name: 'stdDev', value: 2 }
                ]
              }
            ],
            riskManagement: {
              stopLoss: 2,
              takeProfit: 4,
              maxPosition: 10,
              maxDailyTrades: 10
            }
          }
        },
        {
          id: 'trend_following',
          name: 'پیروی از روند',
          description: 'استراتژی پیروی از روند با استفاده از میانگین متحرک',
          type: 'technical',
          config: {
            entryConditions: [
              {
                indicator: 'sma_fast',
                operator: 'crossover',
                value: 'sma_slow',
                timeframe: 'current'
              }
            ],
            exitConditions: [
              {
                indicator: 'sma_fast',
                operator: 'crossunder',
                value: 'sma_slow',
                timeframe: 'current'
              }
            ],
            indicators: [
              {
                id: 'sma_fast',
                name: 'SMA Fast',
                parameters: [
                  { name: 'period', value: 9 }
                ]
              },
              {
                id: 'sma_slow',
                name: 'SMA Slow',
                parameters: [
                  { name: 'period', value: 21 }
                ]
              }
            ],
            riskManagement: {
              stopLoss: 3,
              takeProfit: 6,
              maxPosition: 15,
              maxDailyTrades: 5
            }
          }
        },
        {
          id: 'rsi_momentum',
          name: 'مومنتوم RSI',
          description: 'استراتژی مومنتوم با استفاده از RSI',
          type: 'technical',
          config: {
            entryConditions: [
              {
                indicator: 'rsi',
                operator: '<=',
                value: 30,
                timeframe: 'current'
              }
            ],
            exitConditions: [
              {
                indicator: 'rsi',
                operator: '>=',
                value: 70,
                timeframe: 'current'
              }
            ],
            indicators: [
              {
                id: 'rsi',
                name: 'RSI',
                parameters: [
                  { name: 'period', value: 14 }
                ]
              }
            ],
            riskManagement: {
              stopLoss: 2.5,
              takeProfit: 5,
              maxPosition: 12,
              maxDailyTrades: 8
            }
          }
        }
      ]

      res.json({
        success: true,
        templates
      })

    } catch (error) {
      console.error('Get templates error:', error)
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت قالب‌های استراتژی',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }

  /**
   * Validate strategy data
   */
  validateStrategyData(data, isUpdate = false) {
    const errors = {}

    if (!isUpdate) {
      if (!data.name || data.name.trim().length === 0) {
        errors.name = 'نام استراتژی الزامی است'
      }

      if (!data.symbol) {
        errors.symbol = 'نماد معاملاتی الزامی است'
      }

      if (!data.timeframe) {
        errors.timeframe = 'تایم‌فریم الزامی است'
      }
    }

    if (data.name && data.name.length > 50) {
      errors.name = 'نام استراتژی نمی‌تواند بیشتر از 50 کاراکتر باشد'
    }

    if (data.entryConditions && (!Array.isArray(data.entryConditions) || data.entryConditions.length === 0)) {
      errors.entryConditions = 'حداقل یک شرط ورود باید تعریف شود'
    }

    if (data.exitConditions && (!Array.isArray(data.exitConditions) || data.exitConditions.length === 0)) {
      errors.exitConditions = 'حداقل یک شرط خروج باید تعریف شود'
    }

    if (data.riskManagement) {
      if (data.riskManagement.stopLoss && (data.riskManagement.stopLoss < 0 || data.riskManagement.stopLoss > 50)) {
        errors.stopLoss = 'حد ضرر باید بین 0 تا 50 درصد باشد'
      }

      if (data.riskManagement.takeProfit && (data.riskManagement.takeProfit < 0 || data.riskManagement.takeProfit > 1000)) {
        errors.takeProfit = 'حد سود باید بین 0 تا 1000 درصد باشد'
      }

      if (data.riskManagement.maxPosition && (data.riskManagement.maxPosition < 1 || data.riskManagement.maxPosition > 100)) {
        errors.maxPosition = 'حداکثر موقعیت باید بین 1 تا 100 درصد باشد'
      }

      if (data.riskManagement.maxDailyTrades && (data.riskManagement.maxDailyTrades < 1 || data.riskManagement.maxDailyTrades > 100)) {
        errors.maxDailyTrades = 'حداکثر معاملات روزانه باید بین 1 تا 100 باشد'
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      message: Object.keys(errors).length > 0 ? 'داده‌های ورودی نامعتبر هستند' : '',
      errors
    }
  }
}

export default new StrategiesController()
