const mongoose = require('mongoose')
const { DOCUMENT_NAME_VOUCHER } = require('./voucher.model')
const { DOCUMENT_NAME_USER } = require('./user.model')

const DOCUMENT_NAME_VOUCHER_USER = 'Voucher_User'
const COLLECTION_NAME_VOUCHER_USER = 'Vouchers_Users'

const voucher_userSchema = new mongoose.Schema({
    voucher_id: {type: mongoose.Types.ObjectId, ref: DOCUMENT_NAME_VOUCHER},
    user_id: {type: mongoose.Types.ObjectId, ref: DOCUMENT_NAME_USER},
    is_used: {type: Boolean, default: false},
    is_active: {type: Boolean, default: true}
}, {
    timestamps: true,
    collection: COLLECTION_NAME_VOUCHER_USER
})

const voucher_userModel = mongoose.model(DOCUMENT_NAME_VOUCHER_USER, voucher_userSchema)

module.exports = {voucher_userModel, DOCUMENT_NAME_VOUCHER_USER, COLLECTION_NAME_VOUCHER_USER}