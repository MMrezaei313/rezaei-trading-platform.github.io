const { Strategy } = require('../models/strategies/strategy.model');
const { BacktestResult } = require('../models/strategies/backtest-result.model');
const { StrategyExecutor } = require('../services/strategies/strategy-executor');
const { AppError } = require('../utils/error-handler');
const logger = require('../utils/logger.service');

class StrategiesController {
    constructor() {
        this.strategyExecutor = new StrategyExecutor();
    }

    /**
     * Get all strategies for user
     */
    async getStrategies(req, res) {
        try {
            const userId = req.user.userId;
            const { type, status, page = 1, limit = 50 } = req.query;

            const filter = { userId };

            if (type) filter.type = type;
            if (status) filter.status = status;

            const strategies = await Strategy.find(filter)
                .sort({ createdAt: -1 })
                .limit(parseInt(limit))
                .skip((parseInt(page) - 1) * parseInt(limit));

            const total = await Strategy.countDocuments(filter);

            res.json({
                success: true,
                strategies: strategies.map(strategy => strategy.toObject()),
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            });

        } catch (error) {
            logger.error('Get strategies error:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در دریافت استراتژی‌ها',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * Get active strategies
     */
    async getActiveStrategies(req, res) {
        try {
            const userId = req.user.userId;

            const strategies = await Strategy.find({
                userId,
                status: 'active'
            }).sort({ createdAt: -1 });

            res.json({
                success: true,
                strategies: strategies.map(strategy => strategy.toObject())
            });

        } catch (error) {
            logger.error('Get active strategies error:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در دریافت استراتژی‌های فعال',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * Create new strategy
     */
    async createStrategy(req, res) {
        try {
            const userId = req.user.userId;
            const strategyData = req.body;

            // Validate strategy data
            const validation = this.validateStrategyData(strategyData);
            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: validation.message,
                    errors: validation.errors
                });
            }

            const strategy = new Strategy({
                userId,
                ...strategyData,
                status: 'inactive',
                createdAt: new Date(),
                updatedAt: new Date()
            });

            await strategy.save();

            logger.info('Strategy created successfully', { 
                strategyId: strategy._id, 
                userId, 
                type: strategy.type 
            });

            res.status(201).json({
                success: true,
                message: 'استراتژی با موفقیت ایجاد شد',
                strategy: strategy.toObject()
            });

        } catch (error) {
            logger.error('Create strategy error:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در ایجاد استراتژی',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * Update strategy
     */
    async updateStrategy(req, res) {
        try {
            const userId = req.user.userId;
            const { strategyId } = req.params;
            const updates = req.body;

            const strategy = await Strategy.findOne({ _id: strategyId, userId });
            if (!strategy) {
                return res.status(404).json({
                    success: false,
                    message: 'استراتژی یافت نشد'
                });
            }

            // Validate updates
            const validation = this.validateStrategyData(updates, true);
            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: validation.message,
                    errors: validation.errors
                });
            }

            // Update strategy
            Object.assign(strategy, updates, { updatedAt: new Date() });
            await strategy.save();

            logger.info('Strategy updated successfully', { strategyId, userId });

            res.json({
                success: true,
                message: 'استراتژی با موفقیت بروزرسانی شد',
                strategy: strategy.toObject()
            });

        } catch (error) {
            logger.error('Update strategy error:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در بروزرسانی استراتژی',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * Delete strategy
     */
    async deleteStrategy(req, res) {
        try {
            const userId = req.user.userId;
            const { strategyId } = req.params;

            const strategy = await Strategy.findOne({ _id: strategyId, userId });
            if (!strategy) {
                return res.status(404).json({
                    success: false,
                    message: 'استراتژی یافت نشد'
                });
            }

            if (strategy.status === 'active') {
                return res.status(400).json({
                    success: false,
                    message: 'امکان حذف استراتژی فعال وجود ندارد'
                });
            }

            await Strategy.findByIdAndDelete(strategyId);

            logger.info('Strategy deleted successfully', { strategyId, userId });

            res.json({
                success: true,
                message: 'استراتژی با موفقیت حذف شد'
            });

        } catch (error) {
            logger.error('Delete strategy error:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در حذف استراتژی',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * Deploy strategy (activate)
     */
    async deployStrategy(req, res) {
        try {
            const userId = req.user.userId;
            const { strategyId } = req.params;

            const strategy = await Strategy.findOne({ _id: strategyId, userId });
            if (!strategy) {
                return res.status(404).json({
                    success: false,
                    message: 'استراتژی یافت نشد'
                });
            }

            if (strategy.status === 'active') {
                return res.status(400).json({
                    success: false,
                    message: 'استراتژی در حال حاضر فعال است'
                });
            }

            // Start strategy execution
            const deploymentResult = await this.strategyExecutor.deployStrategy(strategy);

            if (deploymentResult.success) {
                strategy.status = 'active';
                strategy.deployedAt = new Date();
                strategy.updatedAt = new Date();
                await strategy.save();

                logger.info('Strategy deployed successfully', { strategyId, userId });

                res.json({
                    success: true,
                    message: 'استراتژی با موفقیت فعال شد',
                    strategy: strategy.toObject()
                });

            } else {
                res.status(400).json({
                    success: false,
                    message: deploymentResult.message
                });
            }

        } catch (error) {
            logger.error('Deploy strategy error:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در فعال‌سازی استراتژی',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * Stop strategy
     */
    async stopStrategy(req, res) {
        try {
            const userId = req.user.userId;
            const { strategyId } = req.params;

            const strategy = await Strategy.findOne({ _id: strategyId, userId });
            if (!strategy) {
                return res.status(404).json({
                    success: false,
                    message: 'استراتژی یافت نشد'
                });
            }

            if (strategy.status !== 'active') {
                return res.status(400).json({
                    success: false,
                    message: 'استراتژی فعال نیست'
                });
            }

            // Stop strategy execution
            await this.strategyExecutor.stopStrategy(strategyId);

            strategy.status = 'inactive';
            strategy.updatedAt = new Date();
            await strategy.save();

            logger.info('Strategy stopped successfully', { strategyId, userId });

            res.json({
                success: true,
                message: 'استراتژی با موفقیت متوقف شد',
                strategy: strategy.toObject()
            });

        } catch (error) {
            logger.error('Stop strategy error:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در توقف استراتژی',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * Run backtest for strategy
     */
    async runBacktest(req, res) {
        try {
            const userId = req.user.userId;
            const { strategyId } = req.params;
            const backtestConfig = req.body;

            const strategy = await Strategy.findOne({ _id: strategyId, userId });
            if (!strategy) {
                return res.status(404).json({
                    success: false,
                    message: 'استراتژی یافت نشد'
                });
            }

            // Validate backtest config
            const configValidation = this.validateBacktestConfig(backtestConfig);
            if (!configValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: configValidation.message,
                    errors: configValidation.errors
                });
            }

            // Run backtest
            const backtestResult = await this.strategyExecutor.runBacktest(strategy, backtestConfig);

            // Save backtest result
            const backtestRecord = new BacktestResult({
                strategyId,
                userId,
                config: backtestConfig,
                results: backtestResult,
                executedAt: new Date()
            });

            await backtestRecord.save();

            logger.info('Backtest completed successfully', { 
                strategyId, 
                userId,
                backtestId: backtestRecord._id 
            });

            res.json({
                success: true,
                message: 'بکتست با موفقیت انجام شد',
                results: backtestResult,
                backtestId: backtestRecord._id
            });

        } catch (error) {
            logger.error('Run backtest error:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در اجرای بکتست',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * Get backtest results
     */
    async getBacktestResults(req, res) {
        try {
            const userId = req.user.userId;
            const { strategyId } = req.params;
            const { page = 1, limit = 20 } = req.query;

            const backtests = await BacktestResult.find({ strategyId, userId })
                .sort({ executedAt: -1 })
                .limit(parseInt(limit))
                .skip((parseInt(page) - 1) * parseInt(limit));

            const total = await BacktestResult.countDocuments({ strategyId, userId });

            res.json({
                success: true,
                backtests: backtests.map(backtest => backtest.toObject()),
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            });

        } catch (error) {
            logger.error('Get backtest results error:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در دریافت نتایج بکتست',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * Get specific backtest result
     */
    async getBacktestResult(req, res) {
        try {
            const userId = req.user.userId;
            const { backtestId } = req.params;

            const backtest = await BacktestResult.findOne({ _id: backtestId, userId });
            if (!backtest) {
                return res.status(404).json({
                    success: false,
                    message: 'نتایج بکتست یافت نشد'
                });
            }

            res.json({
                success: true,
                backtest: backtest.toObject()
            });

        } catch (error) {
            logger.error('Get backtest result error:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در دریافت نتیجه بکتست',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * Delete backtest result
     */
    async deleteBacktestResult(req, res) {
        try {
            const userId = req.user.userId;
            const { backtestId } = req.params;

            const backtest = await BacktestResult.findOne({ _id: backtestId, userId });
            if (!backtest) {
                return res.status(404).json({
                    success: false,
                    message: 'نتایج بکتست یافت نشد'
                });
            }

            await BacktestResult.findByIdAndDelete(backtestId);

            logger.info('Backtest result deleted', { backtestId, userId });

            res.json({
                success: true,
                message: 'نتایج بکتست با موفقیت حذف شد'
            });

        } catch (error) {
            logger.error('Delete backtest result error:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در حذف نتایج بکتست',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * Get strategy performance metrics
     */
    async getStrategyPerformance(req, res) {
        try {
            const userId = req.user.userId;
            const { strategyId } = req.params;

            const strategy = await Strategy.findOne({ _id: strategyId, userId });
            if (!strategy) {
                return res.status(404).json({
                    success: false,
                    message: 'استراتژی یافت نشد'
                });
            }

            const performance = await this.strategyExecutor.getStrategyPerformance(strategyId);

            res.json({
                success: true,
                performance
            });

        } catch (error) {
            logger.error('Get strategy performance error:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در دریافت عملکرد استراتژی',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * Clone strategy
     */
    async cloneStrategy(req, res) {
        try {
            const userId = req.user.userId;
            const { strategyId } = req.params;
            const { name, description } = req.body;

            const originalStrategy = await Strategy.findOne({ _id: strategyId, userId });
            if (!originalStrategy) {
                return res.status(404).json({
                    success: false,
                    message: 'استراتژی یافت نشد'
                });
            }

            // Create new strategy based on original
            const clonedStrategy = new Strategy({
                userId,
                name: name || `${originalStrategy.name} (کپی)`,
                description: description || originalStrategy.description,
                type: originalStrategy.type,
                config: originalStrategy.config,
                symbols: originalStrategy.symbols,
                timeframe: originalStrategy.timeframe,
                status: 'inactive',
                createdAt: new Date(),
                updatedAt: new Date()
            });

            await clonedStrategy.save();

            logger.info('Strategy cloned successfully', { 
                originalStrategyId: strategyId, 
                clonedStrategyId: clonedStrategy._id,
                userId 
            });

            res.status(201).json({
                success: true,
                message: 'استراتژی با موفقیت کپی شد',
                strategy: clonedStrategy.toObject()
            });

        } catch (error) {
            logger.error('Clone strategy error:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در کپی استراتژی',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * Validate strategy data
     */
    validateStrategyData(data, isUpdate = false) {
        const errors = {};
        const requiredFields = ['name', 'type', 'symbols', 'timeframe'];

        if (!isUpdate) {
            for (const field of requiredFields) {
                if (!data[field]) {
                    errors[field] = `${field} is required`;
                }
            }
        }

        // Validate symbols array
        if (data.symbols && (!Array.isArray(data.symbols) || data.symbols.length === 0)) {
            errors.symbols = 'حداقل یک نماد معاملاتی باید انتخاب شود';
        }

        // Validate timeframe
        const validTimeframes = ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w'];
        if (data.timeframe && !validTimeframes.includes(data.timeframe)) {
            errors.timeframe = `تایم‌فریم باید یکی از موارد زیر باشد: ${validTimeframes.join(', ')}`;
        }

        // Validate strategy type
        const validTypes = ['technical', 'ai_based', 'custom', 'arbitrage', 'market_making'];
        if (data.type && !validTypes.includes(data.type)) {
            errors.type = `نوع استراتژی باید یکی از موارد زیر باشد: ${validTypes.join(', ')}`;
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors,
            message: Object.keys(errors).length > 0 ? 'داده‌های ورودی نامعتبر هستند' : ''
        };
    }

    /**
     * Validate backtest configuration
     */
    validateBacktestConfig(config) {
        const errors = {};
        const requiredFields = ['startDate', 'endDate', 'initialCapital'];

        for (const field of requiredFields) {
            if (!config[field]) {
                errors[field] = `${field} is required`;
            }
        }

        // Validate dates
        if (config.startDate && config.endDate) {
            const startDate = new Date(config.startDate);
            const endDate = new Date(config.endDate);
            
            if (startDate >= endDate) {
                errors.dateRange = 'تاریخ شروع باید قبل از تاریخ پایان باشد';
            }

            if (endDate > new Date()) {
                errors.endDate = 'تاریخ پایان نمی‌تواند در آینده باشد';
            }
        }

        // Validate initial capital
        if (config.initialCapital && config.initialCapital <= 0) {
            errors.initialCapital = 'سرمایه اولیه باید بزرگتر از صفر باشد';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors,
            message: Object.keys(errors).length > 0 ? 'تنظیمات بکتست نامعتبر هستند' : ''
        };
    }
}

module.exports = { StrategiesController };
