const { ConflictRequestError, NotFoundError } = require("../core/error.reponse")
const { productModel } = require("../models/product.model")
const { selectFilesData, formatStringToArray } = require("../utils")
const { COLLECTION_NAME_SALE } = require('../models/sale.model')
const { COLLECTION_NAME_BRAND, brandModel } = require('../models/brand.model')
const { COLLECTION_NAME_CATEGORY, categoryModel } = require('../models/category.model')
const { COLLECTION_NAME_REVIEW } = require('../models/review.model')
const { COLLECTION_NAME_FAVORITE } = require("../models/favorite.model")
const { default: mongoose } = require("mongoose")
const { colorModel } = require("../models/color.model")
const { sizeModel } = require("../models/size.model")
const { ObjectId } = mongoose.Types

class ProductService {

    static getDataFilter = async () => {
        const colors = await colorModel.aggregate([{ $project: { _id: 1, hex_color: 1, name_color: 1 } }])
        const sizes = await sizeModel.aggregate([{ $project: { _id: 1, size: 1 } }])
        const brands = await brandModel.aggregate([{
            $addFields: { thumb_brand: '$image_brand.url' }
        },
        { $project: { _id: 1, name_brand: 1, thumb_brand: 1 } }])
        const price = await productModel.aggregate([
            {
                $group: {
                    _id: null,
                    maxPrice: { $max: "$price" },
                    minPrice: { $min: "$price" },
                }
            }, {
                $project: { _id: 0, maxPrice: 1, minPrice: 1 }
            }])
        return {
            dataFilter: {
                colors,
                sizes,
                brands,
                price
            }
        }
    }

    static getAllProducts = async ({ user_id, category_id, sort, price, colors_id, sizes_id, rating, brands_id }) => {
        let parent_id
        if (category_id && ObjectId.isValid(category_id)) {
            const category = await categoryModel.findById(category_id).lean()
            const depth_category = category.depth
            if (depth_category === 1) {
                const list_categories_id = await categoryModel.find({ parent_id: category._id })
                parent_id = list_categories_id.map(cate => cate._id)
            } if (depth_category === 2) {
                parent_id = [category._id]
            }
        }

        const matchCondition = {};

        if (parent_id) {
            matchCondition.category_id = { $in: parent_id }
        }

        if (Array.isArray(price) && price.length === 2 && price[1] > 0) {
            matchCondition.price = { $gte: price[0], $lte: price[1] }
        }

        if (Array.isArray(colors_id) && colors_id.length > 0) {
            const colors_ObId = colors_id.filter(id => id !== '' && ObjectId.isValid(id)).map(id => new ObjectId(id))
            if (colors_ObId.length > 0) {
                matchCondition.colors_id = { $in: colors_ObId }
            }
        }

        if (Array.isArray(sizes_id) && sizes_id.length > 0) {
            const sizes_Obid = sizes_id.filter(id => id !== '' && ObjectId.isValid(id)).map(id => new mongoose.Types.ObjectId(id))
            if (sizes_Obid.length > 0) {
                matchCondition.sizes_id = { $in: sizes_Obid }
            }
        }

        if (Array.isArray(brands_id) && brands_id.length > 0) {
            const brands_ObId = brands_id.filter(id => id !== '' && ObjectId.isValid(id)).map(id => new mongoose.Types.ObjectId(id))
            if (brands_ObId.length > 0) {
                matchCondition.brand_id = { $in: brands_ObId }
            }
        }

        const pipeline = [
            {
                $match: matchCondition
            },
            {
                $lookup: {
                    from: COLLECTION_NAME_SALE,
                    localField: '_id',
                    foreignField: 'product_id',
                    as: 'sale'
                }
            }, {
                $lookup: {
                    from: COLLECTION_NAME_BRAND,
                    localField: 'brand_id',
                    foreignField: '_id',
                    as: 'brand'
                }
            }, {
                $lookup: {
                    from: COLLECTION_NAME_CATEGORY,
                    localField: 'category_id',
                    foreignField: '_id',
                    as: 'category'
                }
            }, {
                $lookup: {
                    from: COLLECTION_NAME_REVIEW,
                    localField: '_id',
                    foreignField: 'product_id',
                    as: 'reviews'
                }
            }, {
                $lookup: {
                    from: COLLECTION_NAME_FAVORITE,
                    localField: '_id',
                    foreignField: 'product_id',
                    as: 'favorites'
                }
            }, {
                $addFields: {
                    isFavorite: {
                        $cond: {
                            if: { $and: [{ $gt: [user_id, null] }, { $gt: [{ $size: '$favorites' }, 0] }] },
                            then: {
                                $gt: [
                                    {
                                        $size: {
                                            $filter: {
                                                input: '$favorites',
                                                as: 'favorite',
                                                cond: { $eq: ['$$favorite.user_id', { $toObjectId: user_id }] }
                                            }
                                        }
                                    },
                                    0
                                ]
                            },
                            else: false
                        }
                    },
                    averageRating: {
                        $cond: {
                            if: { $gt: [{ $size: '$reviews' }, 0] },
                            then: { $avg: '$reviews.rating' },
                            else: 0
                        }
                    },
                    countReview: {
                        $cond: {
                            if: { $gt: [{ $size: '$reviews' }, 0] },
                            then: { $size: '$reviews' },
                            else: 0
                        }
                    },
                    thumb: { $arrayElemAt: ['$images_product.url', 0] },
                    discount: {
                        $cond: {
                            if: { $gt: [{ $size: '$sale' }, 0] },
                            then: { $arrayElemAt: ['$sale.discount', 0] },
                            else: 0
                        }
                    },
                    name_brand: { $arrayElemAt: ['$brand.name_brand', 0] },
                    name_category: { $arrayElemAt: ['$category.name_category', 0] }
                }
            }, {
                $project: {
                    name_product: 1,
                    price: 1,
                    inventory_quantity: 1,
                    description: 1,
                    discount: 1,
                    name_brand: 1,
                    name_category: 1,
                    averageRating: 1,
                    countReview: 1,
                    thumb: 1,
                    createdAt: 1,
                    isFavorite: 1
                }
            }
        ]

        if (rating) {
            pipeline.push({
                $match: { averageRating: { $gte: rating } }
            })
        }

        if (sort) {
            const [key, value] = sort.split(':').map(str => str.trim())
            const sortObj = {
                [key]: Number(value)
            }
            pipeline.push({
                $sort: sortObj
            });
        }

        const products = await productModel.aggregate(pipeline)
        if (!products) throw new NotFoundError(`Error get all products`)
        return {
            products
        }
    }

    static getproducts = async ({ page, limit }) => {
        const products = await productModel.find().lean().limit(limit * 1).skip((page - 1) * limit).exec()
        if (!products) throw new NotFoundError(`Error get product of page ${page}`)
        const totalPage = Math.ceil(await productModel.countDocuments() / limit)
        if (!totalPage) throw new NotFoundError(`Error get totalPage`)
        return {
            products,
            totalPage,
            currentPage: page
        }
    }

    static addProduct = async ({ name_product, price, description, inventory_quantity, images, colors_id, sizes_id, category_id, brand_id }) => {
        if (!name_product || !price || !description || !inventory_quantity || !images || !colors_id || !sizes_id || !category_id || !brand_id)
            throw new ConflictRequestError('Please provide full information!')
        const category = await categoryModel.findById(category_id).lean()
        if (category.depth !== 2) throw new ConflictRequestError('The depth of category must be 2!')
        const newProduct = await productModel.create({
            name_product,
            price,
            inventory_quantity,
            description,
            images_product: images,
            colors_id: formatStringToArray(colors_id),
            sizes_id: formatStringToArray(sizes_id),
            category_id,
            brand_id
        })
        if (!newProduct) throw new ConflictRequestError('Error add new product!')
        return {
            newProduct: selectFilesData({
                fileds: ['name_product', 'price', 'inventory_quantity',
                    'description', 'image_product', 'colors_id', 'sizes_id', 'category_id', 'brand_id'], object: newProduct
            })
        }
    }
}

module.exports = ProductService