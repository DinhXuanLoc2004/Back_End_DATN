const { CREATED, OK } = require("../core/success.response")
const PaymentMethodService = require("../services/payment_method.service")

class PaymentMethodController {
    static cancelURLPaypal = async (req, res, next) => {
        new OK({
            message: 'Cancel url success!',
            metadata: await PaymentMethodService.cancel_url_paypal()
        }).send(res)
    }

    static refundPayPal = async (req, res, next) => {
        new OK({
            message: 'Refund paypal success!',
            metadata: await PaymentMethodService.refund_paypal({ query: req.query })
        }).send(res)
    }

    static returnURLPaypal = async (req, res, next) => {
        new OK({
            message: 'Return url success!',
            metadata: await PaymentMethodService.return_url_paypal({ query: req.query })
        }).send(res)
    }

    static refundZaloPay = async (req, res, next) => {
        new OK({
            message: 'Refund paypal success!',
            metadata: await PaymentMethodService.refund_zalopay({ query: req.query })
        }).send(res)
    }

    static paymentZaloPay = async (req, res, next) => {
        new OK({
            message: 'created link payment zalo pay success!',
            metadata: await PaymentMethodService.payment_zalopay()
        }).send(res)
    }

    static callbackZaloPay = async (req, res, next) => {
        new OK({
            message: 'Callback zalo pay success!',
            metadata: await PaymentMethodService.paymet_zalopay_callback({ body: req.body })
        }).send(res)
    }
}

module.exports = PaymentMethodController