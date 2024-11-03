const mongoose = require('mongoose')
const { DOCUMENT_NAME_ORDER } = require('./order.model')
const { DOCUMENT_NAME_PRODUCT_VARIANT } = require('./product_variant.model')
const { DOCUMENT_NAME_PRODUCT_SALE } = require('./product_sale.model')

const DOCUMENT_NAME_PRODUCT_ORDER = 'Product_Order'
const COLLECTION_NAME_PRODUCT_ORDER = 'Products_Orders'

const product_orderSchema = new mongoose.Schema({
    order_id: { type: mongoose.Types.ObjectId, ref: DOCUMENT_NAME_ORDER },
    product_variant_id: { type: mongoose.Types.ObjectId, ref: DOCUMENT_NAME_PRODUCT_VARIANT },
    quantity: { type: Number, require: true },
    price: { type: Number, require: true },
    discount: { type: Number },
}, {
    timestamps: true,
    collection: COLLECTION_NAME_PRODUCT_ORDER
})

const product_orderModel = mongoose.model(DOCUMENT_NAME_PRODUCT_ORDER, product_orderSchema)

module.exports = { product_orderModel, DOCUMENT_NAME_PRODUCT_ORDER, COLLECTION_NAME_PRODUCT_ORDER }