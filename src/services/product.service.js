const { ConflictRequestError, NotFoundError } = require("../core/error.reponse")
const { productModel } = require("../models/product.model")
const { selectFilesData, formatStringToArray, convertToObjectId } = require("../utils")
const { COLLECTION_NAME_SALE } = require('../models/sale.model')
const { COLLECTION_NAME_BRAND, brandModel } = require('../models/brand.model')
const { COLLECTION_NAME_CATEGORY, categoryModel } = require('../models/category.model')
const { COLLECTION_NAME_REVIEW } = require('../models/review.model')
const { COLLECTION_NAME_FAVORITE } = require("../models/favorite.model")
const { default: mongoose } = require("mongoose")
const { colorModel, COLLECTION_NAME_COLOR } = require("../models/color.model")
const { sizeModel, COLLECTION_NAME_SIZE } = require("../models/size.model")
const { product_variantModel, COLLECTION_NAME_PRODUCT_VARIANT } = require("../models/product_variant.model")
const { COLLECTION_NAME_USER } = require("../models/user.model")
const { COLLECTION_NAME_IMAGE_PRODUCT_COLOR } = require("../models/image_product_color.model")
const { size } = require("lodash")
const { ObjectId } = mongoose.Types

class ProductService {

    static getColorSizeToProduct = async ({ query }) => {
        const { product_id } = query;
        const product = await productModel.findById(product_id).lean()
        const thumb = product.images_product[0].url
        const Ob_product_id = convertToObjectId(product_id)
        const variants = await product_variantModel.aggregate([{
            $match: { product_id: Ob_product_id }
        }, {
            $group: {
                _id: null,
                image_product_color_ids: { $addToSet: '$image_product_color_id' },
                size_ids: { $addToSet: '$size_id' },
                quantity_default: { $sum: '$quantity' },
                price_min: { $min: '$price' },
                price_max: { $max: '$price' }
            }
        }, {
            $lookup: {
                from: COLLECTION_NAME_SIZE,
                localField: 'size_ids',
                foreignField: '_id',
                as: 'sizes'
            }
        }, {
            $lookup: {
                from: COLLECTION_NAME_IMAGE_PRODUCT_COLOR,
                localField: 'image_product_color_ids',
                foreignField: '_id',
                as: 'image_colors'
            }
        }, {
            $unwind: '$image_colors'
        }, {
            $lookup: {
                from: COLLECTION_NAME_COLOR,
                localField: 'image_colors.color_id',
                foreignField: '_id',
                as: 'colors_info'
            }
        }, {
            $unwind: '$colors_info'
        }, {
            $addFields: {
                'image_colors.name_color': '$colors_info.name_color',
                'image_colors.hex_color': '$colors_info.hex_color'
            }
        }, {
            $group: {
                _id: null,
                sizes: { $first: '$sizes' },
                quantity_default: { $first: '$quantity_default' },
                price_min: { $first: '$price_min' },
                image_colors: { $push: '$image_colors' },
                price_max: { $first: '$price_max' }
            }
        }, {
            $project: {
                'sizes._id': 1,
                'sizes.size': 1,
                quantity_default: 1,
                price_min: 1,
                'image_colors._id': 1,
                'image_colors.url': 1,
                'image_colors.name_color': 1,
                'image_colors.hex_color': 1,
                'price_max': 1
            }
        }])

        const data_response = { thumb, variant: variants[0] }

        return data_response
    }

    static getProductDetail = async ({ product_id, user_id }) => {
        if (!product_id) throw new NotFoundError('Not found product_id')
        const product_ObId = convertToObjectId(product_id)
        const product = await productModel.aggregate([
            { $match: { _id: product_ObId } },
            {
                $lookup: {
                    from: COLLECTION_NAME_BRAND,
                    localField: 'brand_id',
                    foreignField: '_id',
                    as: 'brand'
                }
            },
            {
                $lookup: {
                    from: COLLECTION_NAME_CATEGORY,
                    localField: 'category_id',
                    foreignField: '_id',
                    as: 'category'
                }
            }, {
                $lookup: {
                    from: COLLECTION_NAME_FAVORITE,
                    localField: '_id',
                    foreignField: 'product_id',
                    as: 'favorites'
                }
            }, {
                $lookup: {
                    from: COLLECTION_NAME_SALE,
                    localField: 'sale_id',
                    foreignField: '_id',
                    as: 'sale'
                }
            }, {
                $lookup: {
                    from: COLLECTION_NAME_PRODUCT_VARIANT,
                    localField: '_id',
                    foreignField: 'product_id',
                    as: 'variants'
                }
            },
            {
                $lookup: {
                    from: COLLECTION_NAME_REVIEW,
                    localField: 'variants._id',
                    foreignField: 'product_variant_id',
                    as: 'reviews'
                }
            }, {
                $lookup: {
                    from: COLLECTION_NAME_SIZE,
                    localField: 'variants.size_id',
                    foreignField: '_id',
                    as: 'sizes'
                }
            }, {
                $lookup: {
                    from: COLLECTION_NAME_IMAGE_PRODUCT_COLOR,
                    localField: 'variants.image_product_color_id',
                    foreignField: '_id',
                    as: 'image_product_colors'
                }
            },{
                $lookup: {
                    from: COLLECTION_NAME_COLOR,
                    localField: 'image_product_colors.color_id',
                    foreignField: '_id',
                    as: 'colors'
                }
            },
            {
                $addFields: {
                    isFavorite: {
                        $cond: {
                            if: {
                                $and: [{ $gt: [user_id, null] }, {
                                    $anyElementTrue: {
                                        $map: {
                                            input: "$favorites",
                                            as: "favorite",
                                            in: { $eq: ["$$favorite.user_id", { $toObjectId: user_id }] }
                                        }
                                    }
                                }]
                            },
                            then: true,
                            else: false
                        }
                    },
                    name_brand: { $arrayElemAt: ["$brand.name_brand", 0] },
                    name_category: { $arrayElemAt: ["$category.name_category", 0] },
                    category_id: { $arrayElemAt: ["$category._id", 0] },
                    averageRating: {
                        $cond: {
                            if: { $gt: [{ $size: "$reviews" }, 0] },
                            then: { $avg: "$reviews.rating" },
                            else: 0
                        }
                    },
                    countReview: { $size: "$reviews" },
                    discount: {
                        $cond: {
                            if: {
                                $and: [
                                    { $gt: [{ $size: "$sale" }, 0] },
                                    { $lt: [{ $arrayElemAt: ['$sale.time_start', 0] }, new Date()] },
                                    { $lt: [new Date(), { $arrayElemAt: ['$sale.time_end', 0] }] },
                                    { $eq: [{ $arrayElemAt: ['$sale.is_active', 0] }, true] }
                                ]
                            },
                            then: { $arrayElemAt: ["$sale.discount", 0] },
                            else: 0
                        }
                    },
                    endTimeSale: {
                        $cond: {
                            if: {
                                $and: [
                                    { $gt: [{ $size: "$sale" }, 0] },
                                    { $lt: [{ $arrayElemAt: ['$sale.time_start', 0] }, new Date()] },
                                    { $lt: [new Date(), { $arrayElemAt: ['$sale.time_end', 0] }] },
                                    { $eq: [{ $arrayElemAt: ['$sale.is_active', 0] }, true] }
                                ]
                            },
                            then: { $arrayElemAt: ["$sale.time_end", 0] },
                            else: ''
                        }
                    },
                    price: { $min: '$variants.price' }
                }
            }, {
                $project: {
                    name_product: 1,
                    price: 1,
                    inventory_quantity: 1,
                    description: 1,
                    images_product: 1,
                    isFavorite: 1,
                    name_brand: 1,
                    name_category: 1,
                    category_id: 1,
                    averageRating: 1,
                    countReview: 1,
                    discount: 1,
                    endTimeSale: 1,
                    createdAt: 1,
                    'sizes._id': 1,
                    'sizes.size': 1,
                    'colors._id': 1,
                    'colors.name_color': 1,
                    'colors.hex_color': 1
                }
            }
        ])
        if (!product) throw new ConflictRequestError('Error get detai product')
        return product[0]
    }

    static getAllProducts = async ({ user_id, products_id, category_id, sort, price, colors_id, sizes_id, rating, brands_id }) => {
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

        // if (Array.isArray(products_id) && products_id.length > 0) {
        //     const products_ObId = products_id.filter(id => id !== '' && ObjectId.isValid(id)).map(id => convertToObjectId(id))
        //     if (products_ObId.length > 0) {
        //         matchCondition._id = { $in: products_ObId }
        //     }
        // }

        if (Array.isArray(brands_id) && brands_id.length > 0) {
            const brands_ObId = brands_id.filter(id => id !== '' && ObjectId.isValid(id)).map(id => convertToObjectId(id))
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
                    localField: 'sale_id',
                    foreignField: '_id',
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
                    from: COLLECTION_NAME_PRODUCT_VARIANT,
                    localField: '_id',
                    foreignField: 'product_id',
                    as: 'variants'
                }
            }, {
                $lookup: {
                    from: COLLECTION_NAME_FAVORITE,
                    localField: '_id',
                    foreignField: 'product_id',
                    as: 'favorites'
                }
            }, {
                $unwind: '$variants'
            },
            {
                $lookup: {
                    from: COLLECTION_NAME_REVIEW,
                    localField: 'variants._id',
                    foreignField: 'product_variant_id',
                    as: 'reviews'
                }
            }, {
                $lookup: {
                    from: COLLECTION_NAME_COLOR,
                    localField: 'variants.color_id',
                    foreignField: '_id',
                    as: 'colors'
                }
            }, {
                $lookup: {
                    from: COLLECTION_NAME_SIZE,
                    localField: 'variants.size_id',
                    foreignField: '_id',
                    as: 'sizes'
                }
            }, {
                $addFields: {
                    avgRatingVariant: {
                        $avg: '$reviews.rating'
                    },
                    countReviewsVariant: { $size: '$reviews' },
                    colors: { $arrayElemAt: ['$colors', 0] },
                    sizes: { $arrayElemAt: ['$sizes', 0] }
                }
            }, {
                $group: {
                    _id: '$_id',
                    name_product: { $first: '$name_product' },
                    sale: { $first: '$sale' },
                    brand: { $first: '$brand' },
                    category: { $first: '$category' },
                    images_product: { $first: '$images_product' },
                    averageRatingOrNull: { $avg: '$avgRatingVariant' },
                    countReview: { $sum: '$countReviewsVariant' },
                    favorites: { $first: '$favorites' },
                    price_min: { $min: '$variants.price' },
                    price_max: { $max: '$variants.price' },
                    inventory_quantity: { $sum: '$variants.quantity' },
                    createdAt: { $first: '$createdAt' },
                    is_trending: { $first: '$is_trending' },
                    variants: { $push: '$variants' },
                    colors: { $addToSet: '$colors' },
                    sizes: { $addToSet: '$sizes' },
                }
            }, {
                $addFields: {
                    isFavorite: {
                        $cond: {
                            if: {
                                $and: [{ $gt: [user_id, null] }, {
                                    $anyElementTrue: {
                                        $map: {
                                            input: "$favorites",
                                            as: "favorite",
                                            in: { $eq: ['$$favorite.user_id', { $toObjectId: user_id }] }
                                        }
                                    }
                                }]
                            },
                            then: true,
                            else: false
                        }
                    },
                    averageRating: {
                        $cond: {
                            if: { $gt: ['$averageRatingOrNull', null] },
                            then: '$averageRatingOrNull',
                            else: 0
                        }
                    },
                    thumb: { $arrayElemAt: ['$images_product.url', 0] },
                    discount: {
                        $cond: {
                            if: {
                                $and: [
                                    { $gt: [{ $size: "$sale" }, 0] },
                                    { $lt: [{ $arrayElemAt: ['$sale.time_start', 0] }, new Date()] },
                                    { $lt: [new Date(), { $arrayElemAt: ['$sale.time_end', 0] }] },
                                    { $eq: [{ $arrayElemAt: ['$sale.is_active', 0] }, true] }
                                ]
                            },
                            then: { $arrayElemAt: ["$sale.discount", 0] },
                            else: 0
                        }
                    },
                    name_brand: { $arrayElemAt: ['$brand.name_brand', 0] },
                    name_category: { $arrayElemAt: ['$category.name_category', 0] }
                }
            }, {
                $project: {
                    name_product: 1,
                    discount: 1,
                    name_brand: 1,
                    name_category: 1,
                    reviews: 1,
                    averageRating: 1,
                    countReview: 1,
                    thumb: 1,
                    createdAt: 1,
                    isFavorite: 1,
                    price_min: 1,
                    price_max: 1,
                    inventory_quantity: 1,
                    createdAt: 1,
                    is_trending: 1,
                    'colors._id': 1,
                    'colors.hex_color': 1,
                    'colors.name_color': 1,
                    'sizes._id': 1,
                    'sizes.size': 1,
                }
            }
        ]

        const matchFilter = {}

        if (Array.isArray(price) && price.length === 2 && price[1] > 0) {
            matchFilter.$or = [
                { price_min: { $gte: price[0] } },
                { price_max: { $lte: price[1] } }
            ]
        }

        if (Array.isArray(colors_id) && colors_id.length > 0) {
            const colors_ObId = colors_id.filter(id => id !== '' && ObjectId.isValid(id)).map(id => convertToObjectId(id))
            if (colors_ObId.length > 0) {
                matchFilter['colors._id'] = { $in: colors_ObId }
            }
        }

        if (Array.isArray(sizes_id) && sizes_id.length > 0) {
            const sizes_Obid = sizes_id.filter(id => id !== '' && ObjectId.isValid(id)).map(id => convertToObjectId(id))
            if (sizes_Obid.length > 0) {
                matchFilter['sizes._id'] = { $in: sizes_Obid }
            }
        }

        if (rating) {
            matchFilter.averageRating = { $gte: rating }
        }
        pipeline.push({
            $match: matchFilter
        }, {
            $project: {
                colors: 0,
                sizes: 0
            }
        })
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

    static getDataFilter = async () => {
        const colors = await colorModel.aggregate([{ $project: { _id: 1, hex_color: 1, name_color: 1 } }])
        const sizes = await sizeModel.aggregate([{ $project: { _id: 1, size: 1 } }])
        const brands = await brandModel.aggregate([{
            $addFields: { thumb_brand: '$image_brand.url' }
        },
        { $project: { _id: 1, name_brand: 1, thumb_brand: 1 } }])
        const price = await product_variantModel.aggregate([
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

    static addProduct = async ({ body }) => {
        const { name_product, description, images, category_id, brand_id, product_variants } = body;
        if (!name_product || !description || !images || !category_id || !brand_id || !product_variants)
            throw new ConflictRequestError('Please provide full information!')
        const category = await categoryModel.findById(category_id).lean()
        if (category.depth !== 2) throw new ConflictRequestError('The depth of category must be 2!')
        const arr_product_variants = JSON.parse(product_variants)
        if (arr_product_variants.length === 0) throw new ConflictRequestError('product_variants field cannot be an empty array!')
        const newProduct = await productModel.create({
            name_product,
            description,
            images_product: images,
            category_id,
            brand_id,
            sale_id: null
        })
        if (!newProduct) throw new ConflictRequestError('Error add new product!')
        let newProductResponse = selectFilesData({
            fileds: ['name_product',
                'description', 'image_product', 'category_id', 'brand_id', 'is_trending'], object: newProduct
        })
        let new_product_variants = [];
        for (let index = 0; index < arr_product_variants.length; index++) {
            const element = arr_product_variants[index];
            const new_product_variant = await product_variantModel.create({
                quantity: element.quantity,
                price: element.price,
                product_id: newProduct._id,
                size_id: element.size_id,
                image_product_color_id: element.image_product_color_id
            })
            if (!new_product_variant) throw new ConflictRequestError('Error create product_variant!')
            new_product_variants.push(selectFilesData({ fileds: ['quantity', 'price', 'product_id', 'size_id', 'image_product_color_id'], object: new_product_variant }));
        }
        newProductResponse.product_variants = new_product_variants
        return newProductResponse
    }
    
}

module.exports = ProductService