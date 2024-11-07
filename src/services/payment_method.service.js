const { default: axios } = require("axios");
const { ConflictRequestError } = require("../core/error.reponse")
const { selectMainFilesData, createdSignatueMomo } = require("../utils")
const CryptoJS = require('crypto-js');
const moment = require('moment');
const { orderModel } = require("../models/order.model");
require('dotenv').config()

class PaymentMethodService {
    static payment_paypal = async ({ amount }) => {
        const access_token = await this.get_token_paypal()

        const response = await axios({
            url: 'https://api-m.sandbox.paypal.com/v2/checkout/orders',
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
                applition_context: {
                    return_url: 'https://backenddatn-production.up.railway.app/v1/api/payment_method/return_url_paypal',
                    cancel_url: 'https://example.cancel.com'
                }
            })
        })

        return response.data
    }

    static return_url_paypal = async ({body}) => {
        console.log('body return url:: ', body);
        return 'concac 123'
    }

    static async capture_payment({ id_order_paypal, order_id }) {
        const access_token = await this.get_token_paypal();

        const response = await axios({
            url: `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`,
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
            url: 'https://api-m.sandbox.paypal.com/v1/oauth2/token',
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
        const config = {
            app_id: process.env.APP_ID_ZALO_PAY,
            key1: process.env.KEY_1_ZALO_PAY,
            key2: process.env.KEY_2_ZALO_PAY,
            endpoint: "https://sb-openapi.zalopay.vn/v2/create"
        };
        const embed_data = {
            redirecturl: "t-shop-deeplink://app"
        };
        const order = {
            app_id: config.app_id,
            app_trans_id: `${moment().format('YYMMDD')}_${order_id}`, // translation missing: vi.docs.shared.sample_code.comments.app_trans_id
            app_user: email,
            app_time: Date.now(),
            expire_duration_seconds: 900,
            amount: total_amount,
            item: JSON.stringify(items),
            embed_data: JSON.stringify(embed_data),
            amount: total_amount,
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
            const orderUpdate = await orderModel.findByIdAndUpdate(order_id, { payment_status: true }, { new: true })
            if (!orderUpdate) throw new ConflictRequestError('Error update payment status with callback zalo pay!')
            return {
                return_code: 1,
                return_message: 'success'
            }
        }
    }
}

module.exports = PaymentMethodService