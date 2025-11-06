const { v4: uuidv4 } = require('uuid');
const { Order, Trade, Position } = require('../../models/trading');
const ExchangeManager = require('../exchange/exchange-manager.service');
const RiskService = require('../trading/risk.service');
const NotificationService = require('../notifications/notification.service');
const { OrderStatus, OrderType, OrderSide, TimeInForce } = require('../../utils/constants');
const { AppError } = require('../../utils/error-handler');
const logger = require('../../utils/logger.service');

class OrderService {
    constructor() {
        this.exchangeManager = new ExchangeManager();
        this.riskService = new RiskService();
        this.notificationService = new NotificationService();
        this.pendingOrders = new Map();
    }

    /**
     * ایجاد سفارش جدید
     */
    async createOrder(orderData) {
        try {
            const {
                userId,
                strategyId,
                symbol,
                side,
                type,
                quantity,
                price,
                stopPrice,
                timeInForce = TimeInForce.GTC,
                leverage = 1,
                options = {}
            } = orderData;

            // اعتبارسنجی داده‌های ورودی
            this.validateOrderData(orderData);

            // بررسی ریسک و محدودیت‌ها
            await this.riskService.validateOrderRisk(userId, orderData);

            // ایجاد شیء سفارش
            const order = new Order({
                orderId: uuidv4(),
                userId,
                strategyId,
                symbol,
                side,
                type,
                quantity: parseFloat(quantity),
                price: price ? parseFloat(price) : null,
                stopPrice: stopPrice ? parseFloat(stopPrice) : null,
                timeInForce,
                leverage: parseInt(leverage),
                status: OrderStatus.PENDING,
                filledQuantity: 0,
                averagePrice: 0,
                commission: 0,
                options,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            // ذخیره سفارش در دیتابیس
            await order.save();

            // ارسال سفارش به صرافی
            const exchangeOrder = await this.submitToExchange(order);

            // به‌روزرسانی سفارش با اطلاعات صرافی
            order.exchangeOrderId = exchangeOrder.id;
            order.status = exchangeOrder.status;
            order.updatedAt = new Date();
            await order.save();

            // ثبت در حافظه موقت
            this.pendingOrders.set(order.orderId, order);

            // ارسال نوتیفیکیشن
            await this.notificationService.sendOrderNotification(userId, {
                type: 'ORDER_CREATED',
                orderId: order.orderId,
                symbol,
                side,
                type,
                quantity,
                price
            });

            logger.info(`Order created successfully`, { 
                orderId: order.orderId, 
                userId, 
                symbol, 
                side, 
                type 
            });

            return order;

        } catch (error) {
            logger.error('Error creating order', { 
                error: error.message, 
                orderData 
            });
            throw new AppError(`Failed to create order: ${error.message}`, 500);
        }
    }

    /**
     * ارسال سفارش به صرافی
     */
    async submitToExchange(order) {
        try {
            const exchange = this.exchangeManager.getExchange(order.symbol);
            
            const orderParams = {
                symbol: order.symbol,
                side: order.side,
                type: order.type,
                quantity: order.quantity,
                price: order.price,
                stopPrice: order.stopPrice,
                timeInForce: order.timeInForce,
                leverage: order.leverage,
                clientOrderId: order.orderId
            };

            const exchangeOrder = await exchange.createOrder(orderParams);

            logger.info(`Order submitted to exchange`, {
                orderId: order.orderId,
                exchangeOrderId: exchangeOrder.id,
                symbol: order.symbol
            });

            return exchangeOrder;

        } catch (error) {
            logger.error('Error submitting order to exchange', {
                orderId: order.orderId,
                error: error.message
            });

            // به‌روزرسانی وضعیت سفارش به FAILED
            await this.updateOrderStatus(order.orderId, OrderStatus.FAILED, {
                error: error.message
            });

            throw error;
        }
    }

    /**
     * لغو سفارش
     */
    async cancelOrder(orderId, userId) {
        try {
            const order = await Order.findOne({ orderId, userId });
            
            if (!order) {
                throw new AppError('Order not found', 404);
            }

            if (!this.isCancelable(order.status)) {
                throw new AppError(`Order cannot be canceled in current status: ${order.status}`, 400);
            }

            // لغو سفارش در صرافی
            const exchange = this.exchangeManager.getExchange(order.symbol);
            await exchange.cancelOrder(order.exchangeOrderId, order.symbol);

            // به‌روزرسانی وضعیت سفارش
            order.status = OrderStatus.CANCELLED;
            order.updatedAt = new Date();
            await order.save();

            // حذف از حافظه موقت
            this.pendingOrders.delete(orderId);

            // ارسال نوتیفیکیشن
            await this.notificationService.sendOrderNotification(userId, {
                type: 'ORDER_CANCELLED',
                orderId: order.orderId,
                symbol: order.symbol
            });

            logger.info(`Order cancelled successfully`, { orderId, userId });

            return order;

        } catch (error) {
            logger.error('Error cancelling order', { 
                orderId, 
                userId, 
                error: error.message 
            });
            throw new AppError(`Failed to cancel order: ${error.message}`, 500);
        }
    }

    /**
     * به‌روزرسانی وضعیت سفارش
     */
    async updateOrderStatus(orderId, status, updateData = {}) {
        try {
            const order = await Order.findOne({ orderId });
            
            if (!order) {
                throw new AppError('Order not found', 404);
            }

            const updates = {
                status,
                updatedAt: new Date(),
                ...updateData
            };

            // اگر سفارش کامل شده باشد
            if (status === OrderStatus.FILLED) {
                updates.filledQuantity = order.quantity;
                updates.averagePrice = updateData.averagePrice || order.price;
                
                // ایجاد ترید
                await this.createTradeFromOrder(order, updateData);
            }

            // اگر سفارش部分 پر شده باشد
            if (status === OrderStatus.PARTIALLY_FILLED) {
                updates.filledQuantity = updateData.filledQuantity;
                updates.averagePrice = updateData.averagePrice;
            }

            const updatedOrder = await Order.findOneAndUpdate(
                { orderId },
                { $set: updates },
                { new: true }
            );

            // به‌روزرسانی پوزیشن
            if ([OrderStatus.FILLED, OrderStatus.PARTIALLY_FILLED].includes(status)) {
                await this.updatePosition(order.userId, order.symbol, order.side, order.quantity, order.averagePrice);
            }

            logger.info(`Order status updated`, { 
                orderId, 
                oldStatus: order.status, 
                newStatus: status 
            });

            return updatedOrder;

        } catch (error) {
            logger.error('Error updating order status', {
                orderId,
                status,
                error: error.message
            });
            throw error;
        }
    }

    /**
     * ایجاد ترید از سفارش
     */
    async createTradeFromOrder(order, tradeData) {
        try {
            const trade = new Trade({
                tradeId: uuidv4(),
                orderId: order.orderId,
                userId: order.userId,
                strategyId: order.strategyId,
                symbol: order.symbol,
                side: order.side,
                quantity: order.filledQuantity,
                price: order.averagePrice,
                commission: tradeData.commission || 0,
                tradeTime: new Date(),
                exchange: tradeData.exchange,
                leverage: order.leverage
            });

            await trade.save();

            logger.info(`Trade created from order`, {
                tradeId: trade.tradeId,
                orderId: order.orderId,
                symbol: order.symbol
            });

            return trade;

        } catch (error) {
            logger.error('Error creating trade from order', {
                orderId: order.orderId,
                error: error.message
            });
            throw error;
        }
    }

    /**
     * به‌روزرسانی پوزیشن
     */
    async updatePosition(userId, symbol, side, quantity, price) {
        try {
            let position = await Position.findOne({ userId, symbol });

            if (!position) {
                position = new Position({
                    positionId: uuidv4(),
                    userId,
                    symbol,
                    quantity: 0,
                    averagePrice: 0,
                    unrealizedPnl: 0,
                    realizedPnl: 0,
                    margin: 0,
                    leverage: 1
                });
            }

            const positionUpdate = this.calculatePositionUpdate(
                position, side, quantity, price
            );

            Object.assign(position, positionUpdate);
            position.updatedAt = new Date();

            await position.save();

            logger.debug(`Position updated`, { 
                userId, 
                symbol, 
                side, 
                quantity 
            });

        } catch (error) {
            logger.error('Error updating position', {
                userId,
                symbol,
                error: error.message
            });
            throw error;
        }
    }

    /**
     * محاسبه به‌روزرسانی پوزیشن
     */
    calculatePositionUpdate(position, side, quantity, price) {
        const update = {
            quantity: position.quantity,
            averagePrice: position.averagePrice,
            unrealizedPnl: position.unrealizedPnl,
            realizedPnl: position.realizedPnl
        };

        if (side === OrderSide.BUY) {
            const totalCost = (position.quantity * position.averagePrice) + (quantity * price);
            update.quantity = position.quantity + quantity;
            update.averagePrice = totalCost / update.quantity;
        } else if (side === OrderSide.SELL) {
            const soldValue = quantity * price;
            const costBasis = quantity * position.averagePrice;
            const pnl = soldValue - costBasis;

            update.quantity = position.quantity - quantity;
            update.realizedPnl = position.realizedPnl + pnl;

            if (update.quantity === 0) {
                update.averagePrice = 0;
            }
        }

        return update;
    }

    /**
     * دریافت سفارشات کاربر
     */
    async getUserOrders(userId, filters = {}) {
        try {
            const {
                symbol,
                status,
                side,
                type,
                startDate,
                endDate,
                page = 1,
                limit = 50
            } = filters;

            const query = { userId };
            
            if (symbol) query.symbol = symbol;
            if (status) query.status = status;
            if (side) query.side = side;
            if (type) query.type = type;
            if (startDate || endDate) {
                query.createdAt = {};
                if (startDate) query.createdAt.$gte = new Date(startDate);
                if (endDate) query.createdAt.$lte = new Date(endDate);
            }

            const orders = await Order.find(query)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean();

            const total = await Order.countDocuments(query);

            return {
                orders,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };

        } catch (error) {
            logger.error('Error getting user orders', {
                userId,
                filters,
                error: error.message
            });
            throw new AppError(`Failed to get user orders: ${error.message}`, 500);
        }
    }

    /**
     * دریافت سفارش بر اساس ID
     */
    async getOrderById(orderId, userId) {
        try {
            const order = await Order.findOne({ orderId, userId });
            
            if (!order) {
                throw new AppError('Order not found', 404);
            }

            return order;

        } catch (error) {
            logger.error('Error getting order by ID', {
                orderId,
                userId,
                error: error.message
            });
            throw error;
        }
    }

    /**
     * اعتبارسنجی داده‌های سفارش
     */
    validateOrderData(orderData) {
        const { symbol, side, type, quantity, price, stopPrice } = orderData;

        if (!symbol || !side || !type || !quantity) {
            throw new AppError('Missing required order fields', 400);
        }

        if (quantity <= 0) {
            throw new AppError('Quantity must be positive', 400);
        }

        if ([OrderType.LIMIT, OrderType.STOP_LIMIT].includes(type) && !price) {
            throw new AppError('Price is required for limit orders', 400);
        }

        if ([OrderType.STOP, OrderType.STOP_LIMIT].includes(type) && !stopPrice) {
            throw new AppError('Stop price is required for stop orders', 400);
        }

        if (price && price <= 0) {
            throw new AppError('Price must be positive', 400);
        }

        if (stopPrice && stopPrice <= 0) {
            throw new AppError('Stop price must be positive', 400);
        }
    }

    /**
     * بررسی امکان لغو سفارش
     */
    isCancelable(status) {
        const cancelableStatuses = [
            OrderStatus.PENDING,
            OrderStatus.NEW,
            OrderStatus.PARTIALLY_FILLED
        ];
        return cancelableStatuses.includes(status);
    }

    /**
     * سینک وضعیت سفارشات با صرافی
     */
    async syncOrdersWithExchange(userId) {
        try {
            const pendingOrders = await Order.find({
                userId,
                status: { 
                    $in: [OrderStatus.PENDING, OrderStatus.NEW, OrderStatus.PARTIALLY_FILLED] 
                }
            });

            for (const order of pendingOrders) {
                try {
                    const exchange = this.exchangeManager.getExchange(order.symbol);
                    const exchangeOrder = await exchange.getOrder(order.exchangeOrderId, order.symbol);

                    if (exchangeOrder.status !== order.status) {
                        await this.updateOrderStatus(
                            order.orderId, 
                            exchangeOrder.status, 
                            {
                                filledQuantity: exchangeOrder.filledQuantity,
                                averagePrice: exchangeOrder.averagePrice,
                                commission: exchangeOrder.commission
                            }
                        );
                    }
                } catch (error) {
                    logger.warn('Error syncing order with exchange', {
                        orderId: order.orderId,
                        error: error.message
                    });
                }
            }

            logger.info('Order sync with exchange completed', { userId });

        } catch (error) {
            logger.error('Error syncing orders with exchange', {
                userId,
                error: error.message
            });
            throw error;
        }
    }

    /**
     * پاک‌سازی سفارشات قدیمی
     */
    async cleanupOldOrders(days = 30) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);

            const result = await Order.deleteMany({
                status: { 
                    $in: [OrderStatus.FILLED, OrderStatus.CANCELLED, OrderStatus.FAILED] 
                },
                updatedAt: { $lt: cutoffDate }
            });

            logger.info('Old orders cleanup completed', {
                deletedCount: result.deletedCount,
                cutoffDate
            });

            return result;

        } catch (error) {
            logger.error('Error cleaning up old orders', {
                error: error.message
            });
            throw error;
        }
    }
}

module.exports = OrderService;
