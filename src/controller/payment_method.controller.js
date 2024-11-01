const { CREATED } = require("../core/success.response")
const PaymentMethodService = require("../services/payment_method.service")

class PaymentMethodController {
    static addPaymentMethod = async (req, res, next) => {
        new CREATED({
            message: 'Add new payment method success!',
            metadata: await PaymentMethodService.addPaymentMethod({body: req.body})
        }).send(res)
    }
}

module.exports = PaymentMethodController