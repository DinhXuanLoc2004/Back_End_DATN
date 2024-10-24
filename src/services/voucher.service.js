const { ConflictRequestError, NotFoundError } = require("../core/error.reponse")
const { voucherModel } = require("../models/voucher.model")
const { convertToDate, validateTime, unselectFilesData } = require("../utils")
const ProductService = require('../services/product.service')

class VoucherService {

    static getDetailVoucher = async ({ query }) => {
        const { _id } = query
        const voucher = await voucherModel.findById(_id).lean()
        if (!voucher) throw new NotFoundError('Not found voucher')
        return unselectFilesData({ fields: ['createdAt', 'updatedAt', '__v'], object: voucher })
    }

    static getAllVouchers = async () => {
        const vouchers = await voucherModel.aggregate([{
            $match: {
                is_active: true,
                is_voucher_new_user: false
            }
        }, {
            $project: {
                _id: 1,
                name_voucher: 1,
                voucher_description: 1,
                voucher_type: 1,
                voucher_value: 1,
                voucher_code: 1,
                thumb: '$image_voucher.url',
                time_start: 1,
                time_end: 1,
                quantity: 1,
                min_order_value: 1
            }
        }])
        return vouchers
    }

    static createVoucher = async ({ body }) => {
        const { voucher_name, voucher_description,
            voucher_type, voucher_value,
            voucher_code, image, time_start, time_end, quantity,
            min_order_value, voucher_is_active, is_voucher_new_user } = body
        validateTime(time_start, time_end)
        const voucher = await voucherModel.findOne({ voucher_code }).lean()
        if (voucher) throw new ConflictRequestError('Voucher already exists!')
        const newVoucher = await voucherModel.create({
            voucher_name, voucher_description,
            voucher_type, voucher_value,
            voucher_code, image_voucher: image, time_start, time_end, quantity,
            min_order_value, voucher_is_active, is_voucher_new_user
        })
        if (!newVoucher) throw new ConflictRequestError('Error create voucher!')
        return unselectFilesData({ fields: ['createdAt', 'updatedAt', '__v'], object: newVoucher._doc })
    }
}

module.exports = VoucherService