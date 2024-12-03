const { ConflictRequestError } = require("../core/error.reponse")
const { brandModel } = require("../models/brand.model");
const { COLLECTION_NAME_PRODUCT } = require("../models/product.model");
const { selectFilesData } = require("../utils")

class BrandService {
    static addBrand = async ({ name_brand, image }) => {
        const newBrand = await brandModel.create({ name_brand, image_brand: image });
        if (!newBrand) throw new ConflictRequestError('Error create brand');
        return {
            newBrand: selectFilesData({ fileds: ['name_brand', 'image_brand'], object: newBrand })
        };
    };

    static toggleDeleteBrand = async ({query}) => {
        const { _id } = query
        const brand = await brandModel.findById(_id).lean()
        const deletedBrand = await brandModel.findByIdAndUpdate(_id, { is_delete: !brand.is_delete }, { new: true })
        return deletedBrand
    };

    static getAllBrands = async ({ query }) => {
        const { is_delete } = query
        const condition_is_delete = is_delete === 'true' ? true : false
        const brands = await brandModel.aggregate([
            {
                $match: {
                    is_delete: condition_is_delete
                }
            }, {
                $lookup: {
                    from: COLLECTION_NAME_PRODUCT,
                    localField: '_id',
                    foreignField: 'brand_id',
                    as: 'products'
                }
            }, {
                $addFields: {
                    can_be_delete: {
                        $cond: {
                            if: { $gt: [{ $size: '$products' }, 0] },
                            then: false,
                            else: true
                        }
                    }
                }
            }, {
                $project: {
                    _id: 1,
                    name_brand: 1,
                    image_brand: 1,
                    can_be_delete: 1,
                    is_delete: 1
                }
            }
        ])
        return brands
    };

    static updateBrand = async ({ query, body }) => {
        const { _id } = query
        const { image, name_brand } = body
        const updatedBrand = await brandModel.findByIdAndUpdate(_id, {
            image_brand: image,
            name_brand
        }, {
            new: true
        })
        return updatedBrand
    };
}

module.exports = BrandService;
