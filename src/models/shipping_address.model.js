const mongoose = require('mongoose')
const { DOCUMENT_NAME_USER } = require('./user.model')

const DOCUMENT_NAME_SHIPPING_ADDRESS = 'Shipping_Address'
const COLLECTION_NAME_SHIPPING_ADDRESS = 'Shipping_Addresses'

const shipping_addressSchema = new mongoose.Schema({
    full_name: {type: String, require: true},
    phone: {type: Number, require: true},
    province_name: {type: String, require: true},
    province_id: {type: Number, require: true},
    district_name: {type: String, require: true},
    district_id: {type: Number, require: true},
    ward_name: {type: String, require: true},
    ward_code: {type: String, require: true},
    specific_address: {type: String, require: true},
    is_default: {type: Boolean, require: true, default: false},
    user_id: {type: mongoose.Types.ObjectId, ref: DOCUMENT_NAME_USER}
}, {
    timestamps: true,
    collection: COLLECTION_NAME_SHIPPING_ADDRESS
})

const shipping_addressModel = mongoose.model(DOCUMENT_NAME_SHIPPING_ADDRESS, shipping_addressSchema)

module.exports = {shipping_addressModel, DOCUMENT_NAME_SHIPPING_ADDRESS, COLLECTION_NAME_SHIPPING_ADDRESS}