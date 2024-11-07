const { default: axios } = require("axios");
const { ConflictRequestError } = require("../core/error.reponse")
const { payment_methodModel } = require("../models/payment_method.model")
const { selectMainFilesData, createdSignatueMomo } = require("../utils")
const CryptoJS = require('crypto-js');
const moment = require('moment');
const { orderModel } = require("../models/order.model");
require('dotenv').config()

class PaymentMethodService {

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

    static payment_momo = async ({ order_id, total_amout }) => {
        
        var accessKey = 'F8BBA842ECF85';
        var secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
        var orderInfo = 'pay with MoMo';
        var partnerCode = 'MOMO';
        var redirectUrl = 'https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b';
        var ipnUrl = 'https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b';
        var requestType = "captureWallet";
        var amount = '50000';
        var orderId = partnerCode + new Date().getTime();
        var requestId = orderId;
        var extraData = '';
        var paymentCode = 'T8Qii53fAXyUftPV3m9ysyRhEanUs9KlOPfHgpMR0ON50U10Bh+vZdpJU7VY4z+Z2y77fJHkoDc69scwwzLuW5MzeUKTwPo3ZMaB29imm6YulqnWfTkgzqRaion+EuD7FN9wZ4aXE1+mRt0gHsU193y+yxtRgpmY7SDMU9hCKoQtYyHsfFR5FUAOAKMdw2fzQqpToei3rnaYvZuYaxolprm9+/+WIETnPUDlxCYOiw7vPeaaYQQH0BF0TxyU3zu36ODx980rJvPAgtJzH1gUrlxcSS1HQeQ9ZaVM1eOK/jl8KJm6ijOwErHGbgf/hVymUQG65rHU2MWz9U8QUjvDWA==';
        var orderGroupId = '';
        var autoCapture = true;
        var lang = 'vi';

        const signature = createdSignatueMomo({
            accessKey, secretKey, amount, extraData,
            ipnUrl, orderId, orderInfo, partnerCode, redirectUrl, requestId, requestType
        })

        const requestBody = JSON.stringify({
            partnerCode: partnerCode,
            partnerName: "Test",
            storeId: "MomoTestStore",
            requestId: requestId,
            amount: amount,
            orderId: orderId,
            orderInfo: orderInfo,
            redirectUrl: redirectUrl,
            ipnUrl: ipnUrl,
            lang: lang,
            requestType: requestType,
            autoCapture: autoCapture,
            extraData: extraData,
            orderGroupId: orderGroupId,
            signature: signature
        });

        const options = {
            url: 'https://test-payment.momo.vn/v2/gateway/api/create',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(requestBody)
            },
            data: requestBody
        }

        return (await axios(options)).data
    }

    static getAllPaymentMethod = async () => {
        const payment_methods = await payment_methodModel.aggregate([
            {
                $project: {
                    createdAt: 0,
                    updatedAt: 0,
                    __v: 0
                }
            }
        ])
        return payment_methods
    }

    static addPaymentMethod = async ({ body }) => {
        const { name_payment, image } = body
        const newPaymentMethod = await payment_methodModel.create({
            name_payment,
            image_payment: image
        })
        if (!newPaymentMethod) throw new ConflictRequestError('Conflict create new payment method!')
        return selectMainFilesData(newPaymentMethod._doc)
    }
}

module.exports = PaymentMethodService