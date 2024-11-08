const { CREATED } = require("../core/success.response")
const BrandService = require("../services/brand.service")

class BrandController {
    static addBrand = async (req, res, next) => {
        const { name_brand, image } = req.body;
        new CREATED({
            message: 'Create brand success!',
            metadata: await BrandService.addBrand({ name_brand, image })
        }).send(res);
    };

    static deleteBrand = async (req, res, next) => {
        const { id } = req.query;
        const result = await BrandService.deleteBrand(id);
        res.json(result);
    };

    static getAllBrands = async (req, res, next) => {
        const brands = await BrandService.getAllBrands();
        res.json({ message: 'Brands fetched successfully', brands });
    };

    static updateBrand = async (req, res, next) => {
        const { id } = req.query;
        const updateData = req.body;
        const result = await BrandService.updateBrand(id, updateData);
        res.json(result);
    };
}

module.exports = BrandController;
