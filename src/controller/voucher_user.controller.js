const { CREATED, OK } = require("../core/success.response")
const VoucherUserService = require("../services/voucher_user.service")

class VoucherUserController {
    static getValidVoucher = async (req, res, next) => {
        new OK({
            message: 'Get voucher user success!',
            metadata: await VoucherUserService.getValidVoucher({ query: req.query })
        }).send(res)
    }

    static saveVoucher = async (req, res, next) => {
        new CREATED({
            message: 'Save voucher to user success!',
            metadata: await VoucherUserService.saveVoucher({ body: req.body })
        }).send(res)
    }
}

module.exports = VoucherUserController