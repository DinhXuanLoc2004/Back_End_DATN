const { CREATED, OK } = require('../core/success.response')
const VoucherService = require('../services/voucher.service')

class VoucherController {
    static getAllVoucherToAdmin = async (req, res, next) => {
        new OK({
            message: 'get all voucher to admin!',
            metadata: await VoucherService.getAllVoucherToAdmin()
        }).send(res)
    }

    static getDetailVoucherUpdate = async (req, res, next) => {
        new OK({
            message: 'Get voucher detail update success!',
            metadata: await VoucherService.getVoucherDetailUpdate({ query: req.query })
        }).send(res)
    }

    static updateVoucher = async (req, res, next) => {
        new OK({
            message: 'Update voucher success!',
            metadata: await VoucherService.updateVoucher({ query: req.query, body: req.body })
        }).send(res)
    }

    static getDetailVoucher = async (req, res, next) => {
        new OK({
            message: 'Get detail voucher success!',
            metadata: await VoucherService.getDetailVoucher({ query: req.query })
        }).send(res)
    }

    static getAllVouchers = async (req, res, next) => {
        new OK({
            message: 'Get all voucher success',
            metadata: await VoucherService.getAllVouchers({ query: req.query })
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