const { CREATED, OK } = require("../core/success.response")
const PaymentMethodService = require("../services/payment_method.service")

class PaymentMethodController {
    static paymentZaloPay = async (req, res, next) => {
        new OK({
            message: 'created link payment zalo pay success!',
            metadata: await PaymentMethodService.payment_zalopay()
        }).send(res)
    }

    static callbackZaloPay = async (req, res, next) => {
        new OK({
            message: 'Callback zalo pay success!',
            metadata: await PaymentMethodService.paymet_zalopay_callback({body: req.body})
        }).send(res)
    }

    static paymentMomo = async (req, res, next) => {
        new OK({
            message: 'created link payment momo success!',
            metadata: await PaymentMethodService.payment_momo({ order_id: '', total_amout: 0 })
        }).send(res)
    }

    static addPaymentMethod = async (req, res, next) => {
        new CREATED({
            message: 'Add new payment method success!',
            metadata: await PaymentMethodService.addPaymentMethod({ body: req.body })
        }).send(res)
    }
}

module.exports = PaymentMethodController