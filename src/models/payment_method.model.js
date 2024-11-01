const mongoose = require('mongoose')

const DOCUMENT_NAME_PAYMENT_METHOD = 'Payment_Method'
const COLLECTION_NAME_PAYMENT_METHOD = 'Payment_Methods'

const payment_methodSchema = new mongoose.Schema({
    name_payment: {type: String, require: true},
    image_payment: {type: Object, default: {}}
}, {
    timestamps: true,
    collection: COLLECTION_NAME_PAYMENT_METHOD
})

const payment_methodModel = mongoose.model(DOCUMENT_NAME_PAYMENT_METHOD, payment_methodSchema)

module.exports = {payment_methodModel, DOCUMENT_NAME_PAYMENT_METHOD, COLLECTION_NAME_PAYMENT_METHOD}