const mongoose = require('mongoose')

const DOCUMENT_NAME_VOUCHER = 'Voucher'
const COLLECTION_NAME_VOUCHER = 'Vouchers'

const voucherSchema = new mongoose.Schema({
    voucher_name: { type: String, require: true },
    voucher_description: { type: String, require: true },
    voucher_type: { type: String, enum: ['deduct_money', 'percent','complete_coin'], default: 'deduct_money' },
    voucher_value: { type: Number, require: true },
    voucher_code: { type: String, require: true, unique: true },
    image_voucher: {type: Object, require: true, default: {}},
    time_start: { type: Date, require: true },
    time_end: { type: Date, require: true },
    quantity: { type: mongoose.Schema.Types.Mixed, require: true },
    min_order_value: { type: Number, require: true },
    is_active: { type: Boolean, require: true },
    is_voucher_new_user: {type: Boolean, default: false}
}, {
    timestamps: true,
    collection: COLLECTION_NAME_VOUCHER
})

const voucherModel = mongoose.model(DOCUMENT_NAME_VOUCHER, voucherSchema)

module.exports = { voucherModel, DOCUMENT_NAME_VOUCHER, COLLECTION_NAME_VOUCHER }