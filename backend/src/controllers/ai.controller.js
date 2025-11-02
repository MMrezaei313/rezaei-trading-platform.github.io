import { AIService } from '../services/ai.service.js'
import { AppError } from '../utils/AppError.js'

/**
 * AI Controller
 */
class AIController {
  /**
   * Get all AI models for user
   */
  async getModels(req, res, next) {
    try {
      const { userId } = req.user
      const models = await AIService.getUserModels(userId)
      
      res.json({
        success: true,
        models
      })

    } catch (error) {
      next(error)
    }
  }

  /**
   * Create new AI model
   */
  async createModel(req, res, next) {
    try {
      const modelData = {
        ...req.body,
        userId: req.user.userId
      }

      const model = await AIService.createModel(modelData)
      
      res.status(201).json({
        success: true,
        message: 'مدل با موفقیت ایجاد شد',
        model
      })

    } catch (error) {
      next(error)
    }
  }

  /**
   * Train AI model
   */
  async trainModel(req, res, next) {
    try {
      const { id } = req.params
      const { userId } = req.user

      const model = await AIService.trainModel(id, userId)
      
      res.json({
        success: true,
        message: 'آموزش مدل آغاز شد',
        model
      })

    } catch (error) {
      next(error)
    }
  }

  /**
   * Deploy AI model
   */
  async deployModel(req, res, next) {
    try {
      const { id } = req.params
      const { userId } = req.user

      const model = await AIService.deployModel(id, userId)
      
      res.json({
        success: true,
        message: 'مدل با موفقیت فعال شد',
        model
      })

    } catch (error) {
      next(error)
    }
  }

  /**
   * Delete AI model
   */
  async deleteModel(req, res, next) {
    try {
      const { id } = req.params
      const { userId } = req.user

      await AIService.deleteModel(id, userId)
      
      res.json({
        success: true,
        message: 'مدل با موفقیت حذف شد'
      })

    } catch (error) {
      next(error)
    }
  }

  /**
   * Get model predictions
   */
  async getPredictions(req, res, next) {
    try {
      const { userId } = req.user
      const { modelId, symbol, limit = 50 } = req.query
      
      const predictions = await AIService.getPredictions(
        userId, 
        modelId, 
        symbol, 
        parseInt(limit)
      )
      
      res.json({
        success: true,
        predictions
      })

    } catch (error) {
      next(error)
    }
  }

  /**
   * Generate prediction
   */
  async generatePrediction(req, res, next) {
    try {
      const { id } = req.params
      const { userId } = req.user
      const { data } = req.body

      const prediction = await AIService.generatePrediction(id, userId, data)
      
      res.json({
        success: true,
        message: 'پیش‌بینی با موفقیت انجام شد',
        prediction
      })

    } catch (error) {
      next(error)
    }
  }

  /**
   * Get model performance
   */
  async getModelPerformance(req, res, next) {
    try {
      const { id } = req.params
      const { userId } = req.user

      const performance = await AIService.getModelPerformance(id, userId)
      
      res.json({
        success: true,
        performance
      })

    } catch (error) {
      next(error)
    }
  }

  /**
   * Get training jobs
   */
  async getTrainingJobs(req, res, next) {
    try {
      const { userId } = req.user
      const jobs = await AIService.getTrainingJobs(userId)
      
      res.json({
        success: true,
        jobs
      })

    } catch (error) {
      next(error)
    }
  }

  /**
   * Get AI configuration
   */
  async getConfig(req, res, next) {
    try {
      const config = await AIService.getAIConfig()
      
      res.json({
        success: true,
        config
      })

    } catch (error) {
      next(error)
    }
  }

  /**
   * Update AI configuration
   */
  async updateConfig(req, res, next) {
    try {
      const config = req.body
      const updatedConfig = await AIService.updateAIConfig(config)
      
      res.json({
        success: true,
        message: 'تنظیمات با موفقیت بروزرسانی شد',
        config: updatedConfig
      })

    } catch (error) {
      next(error)
    }
  }

  /**
   * Get AI insights and analytics
   */
  async getInsights(req, res, next) {
    try {
      const { userId } = req.user
      const insights = await AIService.getInsights(userId)
      
      res.json({
        success: true,
        insights
      })

    } catch (error) {
      next(error)
    }
  }

  /**
   * Export model data
   */
  async exportModel(req, res, next) {
    try {
      const { id } = req.params
      const { userId } = req.user
      const { format = 'json' } = req.query

      const exportData = await AIService.exportModel(id, userId, format)
      
      // Set appropriate headers for download
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Content-Disposition', `attachment; filename=model-${id}.${format}`)
      
      res.send(exportData)

    } catch (error) {
      next(error)
    }
  }
}

export default new AIController()
