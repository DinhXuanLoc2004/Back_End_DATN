const { CREATED, OK } = require("../core/success.response")
const PaymentMethodService = require("../services/payment_method.service")

class PaymentMethodController {
    static returnURLPaypal = async (req, res, next) => {
        new OK({
            message: 'cc',
            metadata: await PaymentMethodService.return_url_paypal({body: req.body})
        }).send(res)
    }

    static paymentPaypal = async (req, res, next) => {
        new OK({
            message: 'cc 123',
            metadata: await PaymentMethodService.payment_paypal()
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