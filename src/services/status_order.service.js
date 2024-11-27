const { ConflictRequestError } = require("../core/error.reponse")
const { status_orderModel } = require("../models/status_order.model")

class StatusOrderService {
    static createStatusOrder = async ({ order_id, status, province_name,
        district_name, ward_name, specific_address, cancellation_reason }) => {
        const orderStatus = await status_orderModel.create({
            order_id,
            status,
            province_name: province_name ?? '',
            district_name: district_name ?? '',
            ward_name: ward_name ?? '',
            specific_address: specific_address ?? '',
            cancellation_reason: cancellation_reason ?? ''
        })
        if(!orderStatus) throw new ConflictRequestError('Conflict create order status!')
        return orderStatus
    }
}

module.exports = StatusOrderService