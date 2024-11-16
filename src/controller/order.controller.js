const { CREATED, OK } = require("../core/success.response")
const OrderService = require("../services/order.service")

class OrderController {
    static getOrderDetail = async (req, res, next) => {
        new OK({
            message: 'Get order detail success!',
            metadata: await OrderService.getOrderDetail({ query: req.query })
        }).send(res)
    }

    static getAllOrder = async (req, res, next) => {
        new OK({
            message: 'Get all order success!',
            metadata: await OrderService.getAllOrder()
        }).send(res)
    }

    static getOrdersForUser = async (req, res, next) => {
        new OK({
            message: 'Get orders for user success!',
            metadata: await OrderService.getOrdersForUser({ query: req.query })
        }).send(res)
    }

    static findOrderIdByPaypalId = async (req, res, next) => {
        new OK({
            message: 'find order id by paypal id success!',
            metadata: await OrderService.findOrderIdByPaypalId({ query: req.query })
        }).send(res)
    }

    static createOrder = async (req, res, next) => {
        new CREATED({
            message: 'Created new order success!',
            metadata: await OrderService.createdOrder({ body: req.body })
        }).send(res)
    }
}

module.exports = OrderController