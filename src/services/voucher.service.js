const { ConflictRequestError, NotFoundError } = require("../core/error.reponse")
const { voucherModel } = require("../models/voucher.model")
const { convertToDate } = require("../utils")
const ProductService = require('../services/product.service')

class VoucherService {

    static getProductsWithVoucher = async (body) => {
        const { _id, user_id } = body
        const voucher = await voucherModel.findById(_id).lean()
        if (!voucher || !voucher.voucher_is_active) throw new NotFoundError('Not found voucher!')
        let products
        if (voucher.voucher_applies_to === 'all') {
            products = await ProductService.getAllProducts({user_id})
        }else {
            const products_id = await voucher.product_ids
            products = await ProductService.getAllProducts({user_id, products_id})
        }
        return products
    }

    static getAllVouchers = async () => {
        const vouchers = await voucherModel.find().lean()
        return vouchers
    }

    static createVoucher = async (body) => {
        const { voucher_name, voucher_description,
            voucher_type, voucher_value,
            voucher_code, image, time_start, time_end, quantity,
            voucher_max_uses, voucher_used_count,
            min_order_value, voucher_is_active,
            voucher_applies_to, voucher_users_used, product_ids } = body
        if (convertToDate(time_start) > new Date() || new Date() > convertToDate(time_end)) throw new ConflictRequestError('Voucher has expired!')
        if (convertToDate(time_start) >= convertToDate(time_end)) throw new ConflictRequestError('Start time must be before end time!')
        const voucher = voucherModel.findOne({ voucher_code }).lean()
        if (voucher) throw new ConflictRequestError('Voucher already exists!')
        const newVoucher = await voucherModel.create({
            voucher_name,
            voucher_description,
            voucher_type,
            voucher_value,
            voucher_code,
            image_voucher: image,
            time_start: convertToDate(time_start),
            time_end: convertToDate(time_end),
            quantity,
            voucher_max_uses,
            voucher_used_count,
            min_order_value: min_order_value || 0,
            voucher_is_active,
            voucher_applies_to,
            voucher_users_used,
            product_ids: voucher_applies_to === 'all' ? [] : product_ids
        })
        if (!newVoucher) throw new ConflictRequestError('Error create voucher!')
        return newVoucher
    }
}

module.exports = VoucherService