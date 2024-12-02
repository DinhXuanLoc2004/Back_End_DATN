const { CREATED, OK } = require("../core/success.response")
const BrandService = require("../services/brand.service")

class BrandController {
    static addBrand = async (req, res, next) => {
        const { name_brand, image } = req.body;
        new CREATED({
            message: 'Create brand success!',
            metadata: await BrandService.addBrand({ name_brand, image })
        }).send(res);
    };

    static toggleDeleteBrand = async (req, res, next) => {
        new OK({
            message: 'Delete brand success!',
            metadata: await BrandService.toggleDeleteBrand({ query: req.query })
        }).send(res)
    };

    static getAllBrands = async (req, res, next) => {
        new OK({
            message: 'Get all brands success!',
            metadata: await BrandService.getAllBrands({query: req.query})
        }).send(res)
    };

    static updateBrand = async (req, res, next) => {
        new OK({
            message: 'Update brand success!',
            metadata: await BrandService.updateBrand({ query: req.query, body: req.body })
        }).send(res)
    };
}

module.exports = BrandController;
