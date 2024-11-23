const mongosee = require('mongoose')
const { DOCUMENT_NAME_ORDER } = require('./order.model')

const DOCUMENT_NAME_STATUS_ORDER = 'Status_Order'
const COLLECTION_NAME_STATUS_ORDER = 'Status_Orders'

const status_orderSchema = new mongosee.Schema({
    order_id: { type: mongosee.Types.ObjectId, require: true, ref: DOCUMENT_NAME_ORDER },
    status: {
        type: String,
        enum: ['Confirming', 'Confirmed', 'Delivering',
            'Delivered Successfully', 'Delivery Failed', 'Canceled', "Unpaid"],
        default: 'Unpaid'
    },
    province_name: { type: String, default: "" },
    district_name: { type: String, default: "" },
    ward_name: { type: String, default: "" },
    specific_address: { type: String, default: "" },
    cancellation_reason: { type: String, default: "" }
}, {
    timestamps: true,
    collection: COLLECTION_NAME_STATUS_ORDER
})

const status_orderModel = mongosee.model(DOCUMENT_NAME_STATUS_ORDER, status_orderSchema)

module.exports = { status_orderModel, DOCUMENT_NAME_STATUS_ORDER, COLLECTION_NAME_STATUS_ORDER }