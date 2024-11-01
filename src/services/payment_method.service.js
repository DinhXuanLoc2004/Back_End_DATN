const { ConflictRequestError } = require("../core/error.reponse")
const { payment_methodModel } = require("../models/payment_method.model")
const { selectMainFilesData } = require("../utils")

class PaymentMethodService {
    static addPaymentMethod = async ({body}) => {
        const {name_payment, image} = body
        const newPaymentMethod = await payment_methodModel.create({
            name_payment,
            image_payment: image
        })
        if(!newPaymentMethod) throw new ConflictRequestError('Conflict create new payment method!')
        return selectMainFilesData(newPaymentMethod._doc)
    }
}

module.exports = PaymentMethodService