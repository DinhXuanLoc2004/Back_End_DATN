const { ConflictRequestError } = require("../core/error.reponse")
const { brandModel } = require("../models/brand.model")
const { selectFilesData } = require("../utils")

class BrandService {
    static addBrand = async ({ name_brand }) => {
        const newBrand = await brandModel.create({ name_brand })
        if (!newBrand) throw new ConflictRequestError('Error create brand')
        return {
            newBrand: selectFilesData({ fileds: ['name_brand'], object: newBrand })
        }
    }
}

module.exports = BrandService