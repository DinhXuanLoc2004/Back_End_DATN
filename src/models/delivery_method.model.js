const mongoose = require('mongoose')

const DOCUMENT_NAME_DELIVERY_METHOD = 'Delivery_Method'
const COLLECTION_NAME_DELIVERY_METHOD = 'Delivery_Methods'

const delivery_methodSchema = new mongoose.Schema({
    name_delivery: { type: String, require: true },
    delivery_fee: { type: Number, require: true }
}, {
    timestamps: true,
    collection: COLLECTION_NAME_DELIVERY_METHOD
})

const delivery_methodModel = mongoose.model(DOCUMENT_NAME_DELIVERY_METHOD, delivery_methodSchema)

module.exports = { delivery_methodModel, DOCUMENT_NAME_DELIVERY_METHOD, COLLECTION_NAME_DELIVERY_METHOD }