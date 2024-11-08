const { CREATED } = require("../core/success.response")
const OrderService = require("../services/order.service")

class OrderController {
    static createOrder = async (req, res, next) => {
        new CREATED({
            message: 'Created new order success!',
            metadata: await OrderService.createdOrder({body: req.body})
        }).send(res)
    }

    static getAllOrders = async (req, res, next) => {
        new CREATED({
            message: 'Fetched all orders successfully!',
            metadata: await OrderService.getAllOrders()
        }).send(res);
    }

    static getOrderById = async (req, res, next) => {
        const { orderId } = req.query;
        if (!orderId) throw new BadRequestError("Order ID is required");

        new CREATED({
            message: `Fetched order with ID ${orderId} successfully!`,
            metadata: await OrderService.getOrderById(orderId)
        }).send(res);
    }

}

module.exports = OrderController