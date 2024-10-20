const { ConflictRequestError } = require("../core/error.reponse")
const { COLLECTION_NAME_BRAND } = require("../models/brand.model")
const { COLLECTION_NAME_CATEGORY } = require("../models/category.model")
const { COLLECTION_NAME_COLOR } = require("../models/color.model")
const { favoriteModel } = require("../models/favorite.model")
const { COLLECTION_NAME_IMAGE_PRODUCT_COLOR } = require("../models/image_product_color.model")
const { COLLECTION_NAME_PRODUCT } = require("../models/product.model")
const { COLLECTION_NAME_PRODUCT_VARIANT } = require("../models/product_variant.model")
const { COLLECTION_NAME_SIZE } = require("../models/size.model")
const { selectFilesData, convertToObjectId } = require("../utils")

class FavoriteService {

    static getCategoryIdsToFavorites = async ({ query }) => {
        const { user_id } = query
        const user_Obid = convertToObjectId(user_id)

        const categoryIds = await favoriteModel.aggregate([
            {
                $match: {
                    user_id: user_Obid
                }
            }, {
                $lookup: {
                    from: COLLECTION_NAME_PRODUCT,
                    localField: 'product_id',
                    foreignField: '_id',
                    as: 'product'
                }
            }, {
                $lookup: {
                    from: COLLECTION_NAME_CATEGORY,
                    localField: 'product.category_id',
                    foreignField: '_id',
                    as: 'category'
                }
            }, {
                $addFields: {
                    category: { $arrayElemAt: ['$category', 0] }
                }
            }, {
                $project: {
                    _id: 0,
                    category_id: '$category._id',
                    name_category: '$category.name_category'
                }
            }
        ])

        return categoryIds
    }

    static getFavorites = async ({ query }) => {
        const { user_id, category_id } = query
        const user_Obid = convertToObjectId(user_id)

        const pipeline = [
            {
                $match: {
                    user_id: user_Obid
                }
            }, {
                $lookup: {
                    from: COLLECTION_NAME_PRODUCT,
                    localField: 'product_id',
                    foreignField: '_id',
                    as: 'product'
                }
            }, {
                $lookup: {
                    from: COLLECTION_NAME_BRAND,
                    localField: 'product.brand_id',
                    foreignField: '_id',
                    as: 'brand'
                }
            }, {
                $lookup: {
                    from: COLLECTION_NAME_CATEGORY,
                    localField: 'product.category_id',
                    foreignField: '_id',
                    as: 'category'
                }
            }, {
                $lookup: {
                    from: COLLECTION_NAME_PRODUCT_VARIANT,
                    localField: 'product._id',
                    foreignField: 'product_id',
                    as: 'product_variants'
                }
            }, {
                $lookup: {
                    from: COLLECTION_NAME_SIZE,
                    localField: 'product_variants.size_id',
                    foreignField: '_id',
                    as: 'sizes'
                }
            }, {
                $lookup: {
                    from: COLLECTION_NAME_IMAGE_PRODUCT_COLOR,
                    localField: 'product_variants.image_product_color_id',
                    foreignField: '_id',
                    as: 'image_colors'
                }
            }, {
                $lookup: {
                    from: COLLECTION_NAME_COLOR,
                    localField: 'image_colors.color_id',
                    foreignField: '_id',
                    as: 'colors'
                }
            }, {
                $addFields: {
                    product: { $arrayElemAt: ['$product', 0] },
                    brand: { $arrayElemAt: ['$brand', 0] },
                    category: { $arrayElemAt: ['$category', 0] },
                }
            }, {
                $project: {
                    _id: 1,
                    name_product: '$product.name_product',
                    thumb: { $arrayElemAt: ['$product.images_product.url', 0] },
                    name_brand: '$brand.name_brand',
                    name_category: '$category.name_category',
                    category_id: '$category._id',
                    price_min: { $min: '$product_variants.price' },
                    inventory: { $sum: '$product_variants.quantity' },
                    createdAt: '$product.createdAt',
                    product_id: '$product._id'
                }
            }
        ]

        if (category_id) {
            const category_Obid = convertToObjectId(category_id)
            pipeline.push({
                $match: {
                    category_id: category_Obid
                }
            })
        }

        const favorites = await favoriteModel.aggregate(pipeline)

        return favorites
    }

    static addFavorite = async ({ body }) => {
        const { product_id, user_id } = body
        const favoriteExited = await favoriteModel.findOneAndDelete({ product_id, user_id }).lean()
        if (favoriteExited) return false
        const newFavorite = await favoriteModel.create({
            product_id,
            user_id
        })
        if (!newFavorite) throw new ConflictRequestError('Error create favvorite')
        return true
    }
}

module.exports = FavoriteService