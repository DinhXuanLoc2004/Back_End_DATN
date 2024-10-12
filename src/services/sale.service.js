const { ConflictRequestError } = require("../core/error.reponse")
const { productModel } = require("../models/product.model")
const { saleModel } = require("../models/sale.model")
const { selectFilesData } = require("../utils")

class SaleService {
    static addSale = async ({ body }) => {
        const { discount, time_start, time_end, product_ids } = body
        console.log('product_ids::', product_ids);
        const newSale = await saleModel.create({
            discount,
            time_start,
            time_end
        })
        if (!newSale) throw new ConflictRequestError('Error create sale')
        const resultUpdateProduct = await productModel.updateMany({
            _id: { $in: product_ids }
        }, {
            $set: {sale_id: newSale._id}
        })
        console.log(resultUpdateProduct.acknowledged);
        if(!resultUpdateProduct.acknowledged) throw new ConflictRequestError('Error update filed sale_id in document product!')
        return {
            newSale: selectFilesData({ fileds: ['discount', 'time_start', 'time_end', 'product_ids'], object: newSale })
        }
    }
}

module.exports = SaleService