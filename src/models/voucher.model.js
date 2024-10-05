const mongoose = require('mongoose')
const { DOCUMENT_NAME_USER } = require('./user.model')
const { DOCUMENT_NAME_PRODUCT } = require('./product.model')

const DOCUMENT_NAME_VOUCHER = 'Voucher'
const COLLECTION_NAME_VOUCHER = 'Vouchers'

const voucherSchema = new mongoose.Schema({
    voucher_name: { type: String, require: true },
    voucher_description: { type: String, require: true },
    voucher_type: { type: String, enum: ['deduct_money', 'percent','complete_coin'], default: 'deduct_money' },
    voucher_value: { type: String, require: true },
    voucher_code: { type: String, require: true, unique: true },
    image_voucher: {type: Object, require: true, default: {}},
    time_start: { type: Date, require: true },
    time_end: { type: Date, require: true },
    quantity: { type: Number, require: true },
    voucher_max_uses: { type: Number, require: true }, //số lần tối đa được sử dụng voucher của user
    voucher_used_count: { type: Number, require: true }, // số voucher đã sử dụng,
    min_order_value: { type: Number, require: true },
    voucher_is_active: { type: Boolean, require: true },
    voucher_applies_to: { type: String, require: true, enum: ['all', 'specific'], default: 'all' },
    voucher_users_used: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: DOCUMENT_NAME_USER }], default: [] }, 
    product_ids: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: DOCUMENT_NAME_PRODUCT }], default: [] }
}, {
    timestamps: true,
    collection: COLLECTION_NAME_VOUCHER
})

const voucherModel = mongoose.model(DOCUMENT_NAME_VOUCHER, voucherSchema)

module.exports = { voucherModel, DOCUMENT_NAME_VOUCHER, COLLECTION_NAME_VOUCHER }