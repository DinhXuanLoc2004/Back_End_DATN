const { CREATED, OK } = require("../core/success.response")
const DeliveryMethodService = require("../services/delivery_method.service")

class DeliveryMethodController {
    static getDetailDeliveryMethod = async (req, res, next) => {
        new OK({
            message: 'Get detail delivery method success!',
            metadata: await DeliveryMethodService.getDetailDeliveryMethod({ query: req.query })
        }).send(res)
    }

    static getAllDeliveryMethod = async (req, res, next) => {
        new OK({
            message: 'Get all delivery method success!',
            metadata: await DeliveryMethodService.getAllDeliveryMethod()
        }).send(res)
    }

    static addDeliveryMethod = async (req, res, next) => {
        new CREATED({
            message: 'Created delivery method success!',
            metadata: await DeliveryMethodService.addDeliveryMethod({ body: req.body })
        }).send(res)
    }
}

module.exports = DeliveryMethodController