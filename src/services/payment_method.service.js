const { default: axios } = require("axios");
const { ConflictRequestError } = require("../core/error.reponse")
const { selectMainFilesData, createdSignatueMomo, convertTimestampToDate } = require("../utils")
const CryptoJS = require('crypto-js');
const moment = require('moment');
const { orderModel } = require("../models/order.model");
const { redis_client } = require("../configs/config.redis");
const StatusOrderService = require("./status_order.service");
const DurationsConstants = require("../constants/durations.constants");
const ShippingAddressService = require("./shipping_address.service");
const { voucher_userModel } = require("../models/voucher_user.model");
require('dotenv').config()

class PaymentMethodService {

    static payment_paypal = async ({ amount }) => {
        const access_token = await this.get_token_paypal()

        const response = await axios({
            url: `${process.env.BASE_URL_PAYPAL}/v2/checkout/orders`,
            method: 'post',
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                intent: 'CAPTURE',
                purchase_units: [
                    {
                        amount: {
                            currency_code: 'USD',
                            value: `${amount}`,
                        }
                    }
                ],
                application_context: {
                    return_url: 'https://backenddatn-production.up.railway.app/v1/api/payment_method/return_url_paypal',
                    cancel_url: 'https://backenddatn-production.up.railway.app/v1/api/payment_method/cancel_url_paypal'
                }
            })
        })

        return response.data
    }

    static refund_paypal = async ({ query }) => {
        const { order_id } = query
        const order = await orderModel.findById(order_id).lean()
        const capture_id = order.capture_id
        console.log(capture_id);
        const access_token = await this.get_token_paypal()
        const response = await axios.post(
            `${process.env.BASE_URL_PAYPAL}/v2/payments/captures/${capture_id}/refund`, null, {
            headers: {
                'Authorization': `Bearer ${access_token}`,
                "Content-Type": 'application/json'
            }
        }
        )
        console.log(response.data);
        return response.data
    }

    static return_url_paypal = async ({ query }) => {
        const { token, PayerID } = query
        const capture = await this.capture_payment({ id_order_paypal: token })
        console.log(capture);
        const status_capture = capture.status
        let orderUpdated
        if (status_capture === 'COMPLETED') {
            const order = await orderModel.findOne({ paypal_id: token }).lean()
            const delivery = await ShippingAddressService.get_delivery_fee({
                query: {
                    to_district_id: order.district_id,
                    to_ward_code: order.ward_code
                }
            })
            if (order.voucher_user_id) {
                await voucher_userModel.findByIdAndUpdate(order.voucher_user_id, { is_used: true })
            }
            orderUpdated = await orderModel.findOneAndUpdate({ paypal_id: token },
                {
                    payment_status: true, delivery_fee: delivery.delivery_fee,
                    leadtime: convertTimestampToDate(delivery.leadtime),
                    order_date: new Date(),
                    capture_id: capture.purchase_units[0].payments.captures[0].id
                },
                { new: true })
            if (!orderUpdated) throw new ConflictRequestError('Conflict upate order!')
            await redis_client.del(orderUpdated._id.toString())
            await StatusOrderService.createStatusOrder({ order_id: orderUpdated._id.toString(), status: 'Confirming' })
        }
        return orderUpdated
    }

    static cancel_url_paypal = async () => {
        return true
    }

    static async capture_payment({ id_order_paypal }) {
        const access_token = await this.get_token_paypal();

        const response = await axios({
            url: `${process.env.BASE_URL_PAYPAL}/v2/checkout/orders/${id_order_paypal}/capture`,
            method: 'post',
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data;
    }

    static get_token_paypal = async () => {
        const response = await axios({
            url: `${process.env.BASE_URL_PAYPAL}/v1/oauth2/token`,
            method: 'post',
            data: 'grant_type=client_credentials',
            auth: {
                username: process.env.PAYPAL_CLIENT_ID,
                password: process.env.PAYPAL_SECRET_KEY
            }
        })
        return response.data.access_token
    }

    static payment_zalopay = async ({ order_id, total_amount, phone, email, address, items }) => {
        console.log(`${moment().format('YYMMDD')}_${order_id}`.length);
        const config = {
            app_id: process.env.APP_ID_ZALO_PAY,
            key1: process.env.KEY_1_ZALO_PAY,
            key2: process.env.KEY_2_ZALO_PAY,
            endpoint: `${process.env.BASE_URL_ZALO_PAY}/v2/create`
        };
        const embed_data = {
            redirecturl: "t-shop-deeplink://app"
        };
        const order = {
            app_id: config.app_id,
            app_trans_id: `${moment().format('YYMMDD')}_${order_id}`, // translation missing: vi.docs.shared.sample_code.comments.app_trans_id
            app_user: email,
            app_time: Date.now(),
            expire_duration_seconds: DurationsConstants.DURATION_ZALO_PAY,
            amount: total_amount,
            item: JSON.stringify(items),
            embed_data: JSON.stringify(embed_data),
            description: `T-Shop - Payment for the order`,
            bank_code: "zalopayapp",
            callback_url: `https://backenddatn-production.up.railway.app/v1/api/payment_method/call_back_zalo_pay`,
            phone,
            email,
            address
        };

        const data = config.app_id + "|" + order.app_trans_id + "|" + order.app_user + "|" + order.amount + "|" + order.app_time + "|" + order.embed_data + "|" + order.item;
        order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();
        const result = await axios.post(config.endpoint, null, { params: order })
        return result.data
    }

    static paymet_zalopay_callback = async ({ body }) => {
        const { data, mac, type } = body
        const config = {
            key2: process.env.KEY_2_ZALO_PAY
        }
        const macHoder = CryptoJS.HmacSHA256(data, config.key2).toString()
        if (mac !== macHoder) {
            return {
                return_code: -1,
                return_message: "mac not equal"
            }
        } else {
            const dataJson = JSON.parse(data, config.key2)
            const order_id = dataJson["app_trans_id"].split('_')[1]
            const order = await orderModel.findById(order_id).lean()
            const delivery = await ShippingAddressService.get_delivery_fee({
                query: {
                    to_district_id: order.district_id,
                    to_ward_code: order.ward_code
                }
            })
            const orderUpdate = await orderModel.findByIdAndUpdate(order_id, {
                payment_status: true,
                delivery_fee: delivery.delivery_fee,
                leadtime: convertTimestampToDate(delivery.leadtime), order_date: new Date()
            }, { new: true })
            if (order.voucher_user_id) {
                await voucher_userModel.findByIdAndUpdate(order.voucher_user_id, { is_used: true })
            }
            await redis_client.del(order_id)
            await StatusOrderService.createStatusOrder({ order_id, status: 'Confirming' })
            if (!orderUpdate) throw new ConflictRequestError('Error update payment status with callback zalo pay!')
            return {
                return_code: 1,
                return_message: 'success'
            }
        }
    }
}

module.exports = PaymentMethodService