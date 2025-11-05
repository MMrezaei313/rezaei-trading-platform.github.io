import { AIModel } from '../models/ai/ai-model.model.js';
import { TrainingResult } from '../models/ai/training-result.model.js';
import { Prediction } from '../models/ai/prediction.model.js';
import { AITrainingService } from '../services/ai/ai-training.service.js';
import { PredictionService } from '../services/ai/prediction.service.js';

const STATUS = Object.freeze({
  IDLE: 'idle',
  TRAINING: 'training',
  TRAINED: 'trained',
  ERROR: 'error',
  DEPLOYED: 'deployed',
});

function handleError(res, error, message = 'خطایی رخ داده است', statusCode = 500) {
  console.error(message, error);
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { error: error.message }),
  });
}

export class AIController {
  constructor() {
    this.trainingService = new AITrainingService();
    this.predictionService = new PredictionService();
  }

  async validateAndGetModel(modelId, userId) {
    const model = await AIModel.findOne({ _id: modelId, userId });
    if (!model) {
      throw new Error('مدل یافت نشد');
    }
    return model;
  }

  async getModels(req, res) {
    try {
      const userId = req.user.userId;
      const { type, status, page = 1, limit = 50 } = req.query;

      const filter = { userId, ...(type && { type }), ...(status && { status }) };

      const [models, total] = await Promise.all([
        AIModel.find(filter)
          .sort({ createdAt: -1 })
          .limit(parseInt(limit))
          .skip((page - 1) * parseInt(limit)),
        AIModel.countDocuments(filter),
      ]);

      res.json({
        success: true,
        models: models.map((model) => model.toObject()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (error) {
      handleError(res, error, 'خطا در دریافت مدل‌های هوش مصنوعی');
    }
  }

  async createModel(req, res) {
    try {
      const userId = req.user.userId;
      const modelData = req.body;

      const model = new AIModel({
        userId,
        ...modelData,
        status: STATUS.IDLE,
        accuracy: 0,
        predictions: 0,
        profit: 0,
        deployed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await model.save();

      res.status(201).json({
        success: true,
        message: 'مدل هوش مصنوعی با موفقیت ایجاد شد',
        model: model.toObject(),
      });
    } catch (error) {
      handleError(res, error, 'خطا در ایجاد مدل هوش مصنوعی');
    }
  }

  async updateModel(req, res) {
    try {
      const userId = req.user.userId;
      const { modelId } = req.params;
      const updates = req.body;

      const model = await this.validateAndGetModel(modelId, userId);

      Object.assign(model, updates, { updatedAt: new Date() });
      await model.save();

      res.json({
        success: true,
        message: 'مدل با موفقیت بروزرسانی شد',
        model: model.toObject(),
      });
    } catch (error) {
      handleError(res, error, 'خطا در بروزرسانی مدل');
    }
  }

  async deleteModel(req, res) {
    try {
      const userId = req.user.userId;
      const { modelId } = req.params;

      const model = await this.validateAndGetModel(modelId, userId);

      if (model.deployed) {
        return handleError(res, null, 'امکان حذف مدل فعال وجود ندارد', 400);
      }

      await Promise.all([
        AIModel.findByIdAndDelete(modelId),
        TrainingResult.deleteMany({ modelId }),
        Prediction.deleteMany({ modelId }),
      ]);

      res.json({
        success: true,
        message: 'مدل با موفقیت حذف شد',
      });
    } catch (error) {
      handleError(res, error, 'خطا در حذف مدل');
    }
  }

  async trainModel(req, res) {
    try {
      const userId = req.user.userId;
      const { modelId } = req.params;

      const model = await this.validateAndGetModel(modelId, userId);

      if (model.status === STATUS.TRAINING) {
        return handleError(res, null, 'مدل در حال حاضر در حال آموزش است', 400);
      }

      model.status = STATUS.TRAINING;
      model.trainingProgress = 0;
      model.updatedAt = new Date();
      await model.save();

      this.trainingService
        .startTraining(model)
        .then(async (trainingResult) => {
          Object.assign(model, {
            status: STATUS.TRAINED,
            accuracy: trainingResult.accuracy,
            trainingProgress: 100,
            lastTrained: new Date(),
            updatedAt: new Date(),
          });
          await model.save();

          const trainingRecord = new TrainingResult({
            modelId,
            userId,
            config: model,
            results: trainingResult,
            trainedAt: new Date(),
          });
          await trainingRecord.save();
        })
        .catch(async (error) => {
          Object.assign(model, {
            status: STATUS.ERROR,
            errorMessage: error.message,
            updatedAt: new Date(),
          });
          await model.save();
        });

      res.json({
        success: true,
        message: 'آموزش مدل آغاز شد',
        model: model.toObject(),
      });
    } catch (error) {
      handleError(res, error, 'خطا در شروع آموزش مدل');
    }
  }
}