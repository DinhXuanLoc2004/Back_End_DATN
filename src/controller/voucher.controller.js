const { CREATED, OK } = require('../core/success.response')
const VoucherService = require('../services/voucher.service')

class VoucherController {
    static getDetailVoucher = async (req, res, next) => {
        new OK({
            message: 'Get detail voucher success!',
            metadata: await VoucherService.getDetailVoucher({ query: req.query })
        }).send(res)
    }

    static getAllVouchers = async (req, res, next) => {
        new OK({
            message: 'Get all voucher success',
            metadata: await VoucherService.getAllVouchers({query: req.query})
        }).send(res)
    }

    static createVoucher = async (req, res, next) => {
        new CREATED({
            message: 'Create voucher success!',
            metadata: await VoucherService.createVoucher({ body: req.body })
        }).send(res)
    }
}

module.exports = VoucherController