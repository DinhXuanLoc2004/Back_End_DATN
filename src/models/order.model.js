const mongoose = require('mongoose')
const { DOCUMENT_NAME_USER } = require('./user.model')
const { DOCUMENT_NAME_VOUCHER } = require('./voucher.model')
const { DOCUMENT_NAME_VOUCHER_USER } = require('./voucher_user.model')
const { DOCUMENT_NAME_DELIVERY_METHOD } = require('./delivery_method.model')
const { DOCUMENT_NAME_PAYMENT_METHOD } = require('./payment_method.model')

const DOCUMENT_NAME_ORDER = 'Order'
const COLLECTION_NAME_ORDER = 'Orders'

const orderSchema = new mongoose.Schema({
    user_id: { type: mongoose.Types.ObjectId, ref: DOCUMENT_NAME_USER },
    full_name: { type: String, require: true },
    phone: { type: String, require: true },
    province_city: { type: String, require: true },
    district: { type: String, require: true },
    ward_commune: { type: String, require: true },
    specific_address: { type: String, require: true },
    voucher_user_id: { type: mongoose.Types.ObjectId, ref: DOCUMENT_NAME_VOUCHER_USER, default: null },
    type_voucher: { type: String },
    value_voucher: { type: Number },
    delivery_method_id: { type: mongoose.Types.ObjectId, ref: DOCUMENT_NAME_DELIVERY_METHOD },
    delivery_fee: { type: Number },
    payment_method_id: { type: mongoose.Types.ObjectId, ref: DOCUMENT_NAME_PAYMENT_METHOD },
    payment_status: { type: Boolean, require: true, default: false },
    total_amount: { type: Number, require: true },
    order_status: {
        type: String,
        enum: ['confirming', 'confirmed', 'delivering', 
            'delivered_successfully', 'delivery_failed', 'canceled'],
        default: 'confirming'
    }
}, {
    timestamps: true,
    collection: COLLECTION_NAME_ORDER
})

const orderModel = mongoose.model(DOCUMENT_NAME_ORDER, orderSchema)

module.exports = {orderModel, DOCUMENT_NAME_ORDER, COLLECTION_NAME_ORDER}