const { CREATED } = require("../core/success.response")
const OrderService = require("../services/order.service")

class OrderController {
    static createOrder = async (req, res, next) => {
        new CREATED({
            message: 'Created new order success!',
            metadata: await OrderService.createdOrder({body: req.body})
        }).send(res)
    }
}

module.exports = OrderController