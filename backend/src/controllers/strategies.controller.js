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
