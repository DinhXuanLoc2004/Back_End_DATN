const { CREATED, OK } = require('../core/success.response')
const VoucherService = require('../services/voucher.service')

class VoucherController {
    static getAllVouchers = async (req, res, next) => {
        new OK({
            message: 'Get all voucher success',
            metadata: await VoucherService.getAllVouchers()
        }).send(res)
    }

    static getProductsWithVoucher = async (req, res, next) => {
        new OK({
            message: 'Get product with voucher success!',
            metadata: await VoucherService.getProductsWithVoucher(req.body)
        }).send(res)
    }

    static createVoucher = async (req, res, next) => {
        new CREATED({
            message: 'Create voucher success!',
            metadata: await VoucherService.createVoucher(req.body)
        }).send(res)
    }
}

module.exports = VoucherController