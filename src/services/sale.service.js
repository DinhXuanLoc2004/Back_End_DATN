const { ConflictRequestError } = require("../core/error.reponse")
const { saleModel } = require("../models/sale.model")
const { selectFilesData } = require("../utils")

class SaleService {
    static addSale = async ({ discount, endTime, product_id }) => {
        const newSale = await saleModel.create({
            discount,
            endTime,
            product_id
        })
        if (!newSale) throw new ConflictRequestError('Error create sale')
        return {
            newSale: selectFilesData({ fileds: ['discount', 'endTime', 'product_id', 'createAt'], object: newSale })
        }
    }
}

module.exports = SaleService