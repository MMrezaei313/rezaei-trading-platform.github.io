import { AIModel } from '../models/ai/ai-model.model.js'
import { TrainingResult } from '../models/ai/training-result.model.js'
import { Prediction } from '../models/ai/prediction.model.js'
import { AITrainingService } from '../services/ai/ai-training.service.js'
import { PredictionService } from '../services/ai/prediction.service.js'

export class AIController {
  constructor() {
    this.trainingService = new AITrainingService()
    this.predictionService = new PredictionService()
  }

  /**
   * Get all AI models for user
   */
  async getModels(req, res) {
    try {
      const userId = req.user.userId
      const { type, status, page = 1, limit = 50 } = req.query

      const filter = { userId }

      if (type) filter.type = type
      if (status) filter.status = status

      const models = await AIModel.find(filter)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))

      const total = await AIModel.countDocuments(filter)

      res.json({
        success: true,
        models: models.map(model => model.toObject()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      })

    } catch (error) {
      console.error('Get AI models error:', error)
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت مدل‌های هوش مصنوعی',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }

  /**
   * Create new AI model
   */
  async createModel(req, res) {
    try {
      const userId = req.user.userId
      const modelData = req.body

      // Validate model data
      const validation = this.validateModelData(modelData)
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: validation.message,
          errors: validation.errors
        })
      }

      const model = new AIModel({
        userId,
        ...modelData,
        status: 'idle',
        accuracy: 0,
        predictions: 0,
        profit: 0,
        deployed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      await model.save()

      res.status(201).json({
        success: true,
        message: 'مدل هوش مصنوعی با موفقیت ایجاد شد',
        model: model.toObject()
      })

    } catch (error) {
      console.error('Create AI model error:', error)
      res.status(500).json({
        success: false,
        message: 'خطا در ایجاد مدل هوش مصنوعی',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }

  /**
   * Update AI model
   */
  async updateModel(req, res) {
    try {
      const userId = req.user.userId
      const { modelId } = req.params
      const updates = req.body

      const model = await AIModel.findOne({ _id: modelId, userId })
      if (!model) {
        return res.status(404).json({
          success: false,
          message: 'مدل یافت نشد'
        })
      }

      // Validate updates
      const validation = this.validateModelData(updates, true)
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: validation.message,
          errors: validation.errors
        })
      }

      // Update model
      Object.assign(model, updates, { updatedAt: new Date() })
      await model.save()

      res.json({
        success: true,
        message: 'مدل با موفقیت بروزرسانی شد',
        model: model.toObject()
      })

    } catch (error) {
      console.error('Update AI model error:', error)
      res.status(500).json({
        success: false,
        message: 'خطا در بروزرسانی مدل',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }

  /**
   * Delete AI model
   */
  async deleteModel(req, res) {
    try {
      const userId = req.user.userId
      const { modelId } = req.params

      const model = await AIModel.findOne({ _id: modelId, userId })
      if (!model) {
        return res.status(404).json({
          success: false,
          message: 'مدل یافت نشد'
        })
      }

      if (model.deployed) {
        return res.status(400).json({
          success: false,
          message: 'امکان حذف مدل فعال وجود ندارد'
        })
      }

      await AIModel.findByIdAndDelete(modelId)

      // Also delete related training results and predictions
      await TrainingResult.deleteMany({ modelId })
      await Prediction.deleteMany({ modelId })

      res.json({
        success: true,
        message: 'مدل با موفقیت حذف شد'
      })

    } catch (error) {
      console.error('Delete AI model error:', error)
      res.status(500).json({
        success: false,
        message: 'خطا در حذف مدل',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }

  /**
   * Train AI model
   */
  async trainModel(req, res) {
    try {
      const userId = req.user.userId
      const { modelId } = req.params

      const model = await AIModel.findOne({ _id: modelId, userId })
      if (!model) {
        return res.status(404).json({
          success: false,
          message: 'مدل یافت نشد'
        })
      }

      if (model.status === 'training') {
        return res.status(400).json({
          success: false,
          message: 'مدل در حال حاضر در حال آموزش است'
        })
      }

      // Start training process
      model.status = 'training'
      model.trainingProgress = 0
      model.updatedAt = new Date()
      await model.save()

      // Start training in background
      this.trainingService.startTraining(model)
        .then(async (trainingResult) => {
          // Update model with training results
          model.status = 'trained'
          model.accuracy = trainingResult.accuracy
          model.trainingProgress = 100
          model.lastTrained = new Date()
          model.updatedAt = new Date()
          await model.save()

          // Save training result
          const trainingRecord = new TrainingResult({
            modelId,
            userId,
            config: model,
            results: trainingResult,
            trainedAt: new Date()
          })
          await trainingRecord.save()
        })
        .catch(async (error) => {
          console.error('Training error:', error)
          model.status = 'error'
          model.errorMessage = error.message
          model.updatedAt = new Date()
          await model.save()
        })

      res.json({
        success: true,
        message: 'آموزش مدل آغاز شد',
        model: model.toObject()
      })

    } catch (error) {
      console.error('Train AI model error:', error)
      res.status(500).json({
        success: false,
        message: 'خطا در شروع آموزش مدل',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }

  /**
   * Deploy AI model
   */
  async deployModel(req, res) {
    try {
      const userId = req.user.userId
      const { modelId } = req.params

      const model = await AIModel.findOne({ _id: modelId, userId })
      if (!model) {
        return res.status(404).json({
          success: false,
          message: 'مدل یافت نشد'
        })
      }

      if (model.status !== 'trained') {
        return res.status(400).json({
          success: false,
          message: 'مدل آموزش دیده نیست'
        })
      }

      if (model.deployed) {
        return res.status(400).json({
          success: false,
          message: 'مدل در حال حاضر فعال است'
        })
      }

      // Deploy model
      model.deployed = true
      model.deployedAt = new Date()
      model.updatedAt = new Date()
      await model.save()

      // Start making predictions with deployed model
      this.predictionService.startPredictions(model)

      res.json({
        success: true,
        message: 'مدل با موفقیت فعال شد',
        model: model.toObject()
      })

    } catch (error) {
      console.error('Deploy AI model error:', error)
      res.status(500).json({
        success: false,
        message: 'خطا در فعال‌سازی مدل',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }

  /**
   * Undeploy AI model
   */
  async undeployModel(req, res) {
    try {
      const userId = req.user.userId
      const { modelId } = req.params

      const model = await AIModel.findOne({ _id: modelId, userId })
      if (!model) {
        return res.status(404).json({
          success: false,
          message: 'مدل یافت نشد'
        })
      }

      if (!model.deployed) {
        return res.status(400).json({
          success: false,
          message: 'مدل فعال نیست'
        })
      }

      // Undeploy model
      model.deployed = false
      model.updatedAt = new Date()
      await model.save()

      // Stop predictions
      this.predictionService.stopPredictions(modelId)

      res.json({
        success: true,
        message: 'مدل با موفقیت غیرفعال شد',
        model: model.toObject()
      })

    } catch (error) {
      console.error('Undeploy AI model error:', error)
      res.status(500).json({
        success: false,
        message: 'خطا در غیرفعال‌سازی مدل',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }

  /**
   * Get predictions for model
   */
  async getPredictions(req, res) {
    try {
      const userId = req.user.userId
      const { modelId } = req.params
      const { page = 1, limit = 50 } = req.query

      const predictions = await Prediction.find({ modelId, userId })
        .sort({ timestamp: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))

      const total = await Prediction.countDocuments({ modelId, userId })

      res.json({
        success: true,
        predictions: predictions.map(prediction => prediction.toObject()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      })

    } catch (error) {
      console.error('Get predictions error:', error)
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت پیش‌بینی‌ها',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }

  /**
   * Get recent predictions
   */
  async getRecentPredictions(req, res) {
    try {
      const userId = req.user.userId
      const { limit = 20 } = req.query

      const predictions = await Prediction.find({ userId })
        .sort({ timestamp: -1 })
        .limit(parseInt(limit))
        .populate('modelId', 'name type')

      res.json({
        success: true,
        predictions: predictions.map(prediction => ({
          ...prediction.toObject(),
          modelName: prediction.modelId?.name
        }))
      })

    } catch (error) {
      console.error('Get recent predictions error:', error)
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت پیش‌بینی‌های اخیر',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }

  /**
   * Get AI configuration
   */
  async getAIConfig(req, res) {
    try {
      const userId = req.user.userId

      // In a real implementation, this would fetch from a config collection
      const config = {
        enabled: true,
        maxConcurrentModels: 5,
        autoRetrain: true,
        retrainInterval: 7, // days
        predictionConfidenceThreshold: 0.7,
        riskLimits: {
          maxPositionSize: 10,
          maxDailyPredictions: 100,
          minConfidence: 0.6
        }
      }

      res.json({
        success: true,
        config
      })

    } catch (error) {
      console.error('Get AI config error:', error)
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت تنظیمات هوش مصنوعی',
        error: process.env.NODE_ENV === 'development'
