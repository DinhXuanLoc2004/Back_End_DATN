const { CREATED } = require("../core/success.response")
const SaleService = require("../services/sale.service")

class SaleController {
    static addSale = async (req, res, next) => {
        new CREATED({
            message: 'Create sale succes!',
            metadata: await SaleService.addSale({body: req.body})
        }).send(res)
    }
}

module.exports = SaleController