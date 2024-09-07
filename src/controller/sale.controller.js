const { CREATED } = require("../core/success.response")
const SaleService = require("../services/sale.service")

class SaleController {
    static addSale = async (req, res, next) => {
        const { discount, endTime, product_id } = req.body
        new CREATED({
            message: 'Create sale succes!',
            metadata: await SaleService.addSale({discount, endTime, product_id})
        }).send(res)
    }
}

module.exports = SaleController