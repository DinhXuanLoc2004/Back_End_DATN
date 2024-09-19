const { CREATED } = require("../core/success.response")
const BrandService = require("../services/brand.service")

class BrandController {
    static addBrand = async (req, res, next) => {
        const { name_brand, image } = req.body
        new CREATED({
            message: 'Create brand success!',
            metadata: await BrandService.addBrand({ name_brand, image })
        }).send(res)
    }
}

module.exports = BrandController