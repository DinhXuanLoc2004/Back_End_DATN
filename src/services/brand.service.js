const { ConflictRequestError } = require("../core/error.reponse")
const { brandModel } = require("../models/brand.model")
const { selectFilesData } = require("../utils")

class BrandService {
    static addBrand = async ({ name_brand, image }) => {
        const newBrand = await brandModel.create({ name_brand, image_brand: image });
        if (!newBrand) throw new ConflictRequestError('Error create brand');
        return {
            newBrand: selectFilesData({ fileds: ['name_brand', 'image_brand'], object: newBrand })
        };
    };

    static deleteBrand = async (brandId) => {
        const deletedBrand = await brandModel.findByIdAndUpdate(
            brandId,
            { is_deleted: true },
            { new: true }
        );
        if (!deletedBrand) throw new Error('Brand not found or already deleted');
        return {
            message: 'Brand deleted successfully!',
            brand: selectFilesData({ fileds: ['name_brand', 'image_brand', 'is_deleted'], object: deletedBrand })
        };
    };

    static getAllBrands = async () => {
        const brands = await brandModel.find({ is_deleted: false });
        return brands.map((brand) => selectFilesData({ fileds: ['_id', 'name_brand', 'image_brand'], object: brand }));
    };

    static updateBrand = async (brandId, updateData) => {
        const updatedBrand = await brandModel.findByIdAndUpdate(
            brandId,
            updateData,
            { new: true }
        );
        if (!updatedBrand) throw new Error('Brand not found');
        return {
            message: 'Brand updated successfully!',
            brand: selectFilesData({ fileds: ['name_brand', 'image_brand'], object: updatedBrand })
        };
    };
}

module.exports = BrandService;
