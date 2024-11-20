const { CREATED, OK } = require("../core/success.response")
const OrderService = require("../services/order.service")

class OrderController {
    static findOrderIdByZpTransToken = async (req, res, next) => {
        new OK({
            message: 'Find order_id by zp_trans_token success!',
            metadata: await OrderService.findOrderIdByZpTransToken({ query: req.query })
        }).send(res)
    }

    static findOrderIdByPaypalId = async (req, res, next) => {
        new OK({
            message: 'Find order_id by paypal_id success!',
            metadata: await OrderService.findOrderIdByPaypalId({ query: req.query })
        }).send(res)
    }

    static getProductsContinueOrder = async (req, res, next) => {
        new OK({
            message: 'Get products continue order',
            metadata: await OrderService.getProductsContinueOrder({ query: req.query })
        }).send(res)
    }

    static continueOrder = async (req, res, next) => {
        new OK({
            message: 'Continue order success!',
            metadata: await OrderService.continueOrder({ query: req.query, body: req.body })
        }).send(res)
    }

    static updateStatusOrder = async (req, res, next) => {
        new OK({
            message: 'Update status order success!',
            metadata: await OrderService.updateStatusOrder({ body: req.body })
        }).send(res)
    }

    static getOrderDetail = async (req, res, next) => {
        new OK({
            message: 'Get order detail success!',
            metadata: await OrderService.getOrderDetail({ query: req.query })
        }).send(res)
    }

    static getAllOrder = async (req, res, next) => {
        new OK({
            message: 'Get all order success!',
            metadata: await OrderService.getAllOrder({ query: req.query })
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