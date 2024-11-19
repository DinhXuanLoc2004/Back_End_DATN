const mongoose = require('mongoose')
const { DOCUMENT_NAME_USER } = require('./user.model')
const { DOCUMENT_NAME_VOUCHER } = require('./voucher.model')
const { DOCUMENT_NAME_VOUCHER_USER } = require('./voucher_user.model')

const DOCUMENT_NAME_ORDER = 'Order'
const COLLECTION_NAME_ORDER = 'Orders'

const orderSchema = new mongoose.Schema({
    user_id: { type: mongoose.Types.ObjectId, ref: DOCUMENT_NAME_USER },
    full_name: { type: String, require: true },
    phone: { type: String, require: true },
    province_id: { type: Number, require: true },
    province_name: { type: String, require: true },
    district_id: { type: Number, require: true },
    district_name: { type: String, require: true },
    ward_code: { type: String, require: true },
    ward_name: { type: String, require: true },
    specific_address: { type: String, require: true },
    voucher_user_id: { type: mongoose.Types.ObjectId, ref: DOCUMENT_NAME_VOUCHER_USER, default: null },
    type_voucher: { type: String },
    value_voucher: { type: Number },
    delivery_fee: { type: Number, default: null },
    leadtime: { type: Date, default: null },
    payment_method: { type: String, enum: ['COD', 'Zalo Pay', 'PayPal'] },
    payment_status: { type: Boolean, require: true, default: false },
    total_amount: { type: Number, require: true },
    paypal_id: { type: String, default: '' },
    zp_trans_token: { type: String, default: '' },
    order_date: {type: Date, default: null}
}, {
    timestamps: true,
    collection: COLLECTION_NAME_ORDER
})

const orderModel = mongoose.model(DOCUMENT_NAME_ORDER, orderSchema)

module.exports = { orderModel, DOCUMENT_NAME_ORDER, COLLECTION_NAME_ORDER }