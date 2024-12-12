const { ConflictRequestError, NotFoundError } = require("../core/error.reponse")
const { productModel } = require("../models/product.model")
const { selectFilesData, formatStringToArray, convertToObjectId, convertBoolen } = require("../utils")
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
const { size, get } = require("lodash")
const { COLLECTION_NAME_PRODUCT_SALE } = require("../models/product_sale.model")
const { COLLECTION_NAME_CART } = require("../models/cart.model")
const { COLLECTION_NAME_PRODUCT_ORDER } = require("../models/product_order.model")
const { COLLECTION_NAME_ORDER } = require("../models/order.model")
const { redis_client } = require("../configs/config.redis")
const { ObjectId } = mongoose.Types

class ProductService {
    static togglePublicProduct = async ({ query }) => {
        const { _id } = query
        const product = await productModel.findById(_id).lean()
        const togglePublicProduct = await productModel.findByIdAndUpdate(_id, { is_public: !product.is_public }, { new: true })
        return togglePublicProduct
    }

    static toggleDeleteProduct = async ({ query }) => {
        const { _id } = query
        const product = await productModel.findById(_id).lean()
        const deleteProduct = await productModel.findByIdAndUpdate(_id, { is_delete: !product.is_delete }, { new: true })
        return deleteProduct
    }

    static updateProduct = async ({ query, body }) => {
        const { _id } = query
        const { name_product, description, images, category_id, brand_id, product_variants, is_public } = body
        await this.checkParamsProduct({ body })
        const productUpdated = await productModel.findByIdAndUpdate(_id,
            { name_product, description, images_product: images, category_id, brand_id, is_public },
            { new: true })
        let response = productUpdated
        const arr_product_variants = this.checkParamProductVariants({ product_variants })
        let arr_product_variants_update = []
        for (let index = 0; index < arr_product_variants.length; index++) {
            const element = arr_product_variants[index];
            let updated_product_variant
            if (!element.product_variant_id) {
                updated_product_variant = await product_variantModel.create({
                    price: element.price,
                    quantity: element.quantity,
                    size_id: element.size_id,
                    image_product_color_id: element.image_product_color_id,
                    product_id: _id
                })
            } else {
                updated_product_variant = await product_variantModel.findByIdAndUpdate(element.product_variant_id,
                    {
                        price: element.price,
                        quantity: element.quantity,
                        size_id: element.size_id,
                        image_product_color_id: element.image_product_color_id,
                        is_delete: element.is_delete
                    },
                    { new: true },
                )
                await redis_client.set(element.product_variant_id, 0, { XX: true })
            }
            if (!updated_product_variant) throw new ConflictRequestError('Error conlifct update product variant!')
            arr_product_variants_update.push(updated_product_variant)
        }
        response.arr_product_variants_update = arr_product_variants_update
        return response
    }

    static getDetailProductUpdate = async ({ query }) => {
        const { _id, is_delete_variant } = query
        const _Obid = convertToObjectId(_id)
        const condition_is_delete_variant = is_delete_variant === 'true' ? true : false
        let product = await productModel.aggregate([
            {
                $match: {
                    _id: _Obid
                }
            }, {
                $lookup: {
                    from: COLLECTION_NAME_BRAND,
                    localField: 'brand_id',
                    foreignField: '_id',
                    as: 'brand',
                }
            }, {
                $lookup: {
                    from: COLLECTION_NAME_CATEGORY,
                    localField: 'category_id',
                    foreignField: '_id',
                    as: 'category',
                }
            }, {
                $lookup: {
                    from: COLLECTION_NAME_PRODUCT_VARIANT,
                    localField: '_id',
                    foreignField: 'product_id',
                    as: 'product_variants',
                    pipeline: [
                        {
                            $match: {
                                is_delete: condition_is_delete_variant
                            }
                        }, {
                            $lookup: {
                                from: COLLECTION_NAME_SIZE,
                                localField: 'size_id',
                                foreignField: '_id',
                                as: 'size'
                            }
                        }, {
                            $lookup: {
                                from: COLLECTION_NAME_IMAGE_PRODUCT_COLOR,
                                localField: 'image_product_color_id',
                                foreignField: '_id',
                                as: 'image_color',
                                pipeline: [
                                    {
                                        $lookup: {
                                            from: COLLECTION_NAME_COLOR,
                                            localField: 'color_id',
                                            foreignField: '_id',
                                            as: 'color'
                                        }
                                    }, {
                                        $addFields: {
                                            color: { $arrayElemAt: ['$color', 0] }
                                        }
                                    }
                                ]
                            }
                        }, {
                            $lookup: {
                                from: COLLECTION_NAME_CART,
                                localField: '_id',
                                foreignField: 'product_variant_id',
                                as: 'carts'
                            }
                        }, {
                            $lookup: {
                                from: COLLECTION_NAME_PRODUCT_ORDER,
                                localField: '_id',
                                foreignField: 'product_variant_id',
                                as: 'product_orders'
                            }
                        }, {
                            $addFields: {
                                size: { $arrayElemAt: ['$size', 0] },
                                image_color: { $arrayElemAt: ['$image_color', 0] },
                                can_be_delete: {
                                    $cond: {
                                        if: {
                                            $or: [
                                                { $gt: [{ $size: '$carts' }, 0] },
                                                { $gt: [{ $size: '$product_orders' }, 0] }
                                            ]
                                        },
                                        then: false,
                                        else: true
                                    }
                                }
                            }
                        }, {
                            $project: {
                                _id: 0,
                                product_variant_id: '$_id',
                                size_id: 1,
                                image_product_color_id: 1,
                                size: '$size.size',
                                thumb_product_variant: '$image_color.url',
                                name_color: '$image_color.color.name_color',
                                price: 1,
                                quantity: 1,
                                can_be_delete: 1,
                                is_delete: 1
                            }
                        }
                    ]
                }
            }, {
                $addFields: {
                    brand: { $arrayElemAt: ['$brand', 0] },
                    category: { $arrayElemAt: ['$category', 0] },
                }
            }, {
                $project: {
                    _id: 1,
                    name_product: 1,
                    description: 1,
                    images_product: 1,
                    category_id: 1,
                    name_category: '$category.name_category',
                    brand_id: 1,
                    name_brand: '$brand.name_brand',
                    product_variants: 1
                }
            }
        ])
        const images_colors = await product_variantModel.aggregate([
            {
                $match: {
                    product_id: _Obid,
                    is_delete: condition_is_delete_variant
                }
            }, {
                $unwind: '$image_product_color_id'
            }, {
                $group: {
                    _id: null,
                    image_product_color_id: { $addToSet: '$image_product_color_id' }
                }
            }, {
                $lookup: {
                    from: COLLECTION_NAME_IMAGE_PRODUCT_COLOR,
                    localField: 'image_product_color_id',
                    foreignField: '_id',
                    as: 'image_colors',
                    pipeline: [
                        {
                            $lookup: {
                                from: COLLECTION_NAME_COLOR,
                                localField: 'color_id',
                                foreignField: '_id',
                                as: 'color'
                            }
                        }, {
                            $addFields: {
                                color: { $arrayElemAt: ['$color', 0] }
                            }
                        }, {
                            $project: {
                                _id: 0,
                                image_product_color_id: '$_id',
                                thumb_color: '$url',
                                name_color: '$color.name_color'
                            }
                        }
                    ]
                }
            },
        ])
        const sizes = await product_variantModel.aggregate([
            {
                $match: {
                    product_id: _Obid,
                    is_delete: condition_is_delete_variant
                }
            }, {
                $unwind: '$size_id'
            }, {
                $group: {
                    _id: null,
                    size_id: { $addToSet: '$size_id' }
                }
            }, {
                $lookup: {
                    from: COLLECTION_NAME_SIZE,
                    localField: 'size_id',
                    foreignField: '_id',
                    as: 'sizes',
                    pipeline: [
                        {
                            $project: {
                                _id: 0,
                                size_id: '$_id',
                                name_size: '$size'
                            }
                        }
                    ]
                }
            },
        ])
        product[0].images_colors = images_colors[0].image_colors
        product[0].sizes = sizes[0].sizes
        return product[0]
    }

    static getColorSizeToProduct = async ({ query }) => {
        const { product_id } = query;
        const product = await productModel.findById(product_id).lean()
        const thumb = product.images_product[0].url
        const Ob_product_id = convertToObjectId(product_id)
        const variants = await product_variantModel.aggregate([{
            $match: {
                product_id: Ob_product_id,
                quantity: { $gt: 0 },
                is_delete: false
            }
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
        const date = new Date()
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
                    from: COLLECTION_NAME_PRODUCT_SALE,
                    localField: '_id',
                    foreignField: 'product_id',
                    as: 'product_sale',
                    pipeline: [
                        {
                            $match: {
                                is_active: true
                            }
                        }
                    ]
                }
            }, {
                $lookup: {
                    from: COLLECTION_NAME_SALE,
                    localField: 'product_sale.sale_id',
                    foreignField: '_id',
                    as: 'sales'
                }
            }, {
                $lookup: {
                    from: COLLECTION_NAME_PRODUCT_VARIANT,
                    localField: '_id',
                    foreignField: 'product_id',
                    as: 'variants',
                    pipeline: [
                        {
                            $match: {
                                is_delete: false,
                                quantity: { $gt: 0 }
                            }
                        }, {
                            $lookup: {
                                from: COLLECTION_NAME_PRODUCT_ORDER,
                                localField: '_id',
                                foreignField: 'product_variant_id',
                                as: 'product_orders',
                                pipeline: [
                                    {
                                        $lookup: {
                                            from: COLLECTION_NAME_ORDER,
                                            localField: 'order_id',
                                            foreignField: '_id',
                                            as: 'order'
                                        }
                                    }, {
                                        $addFields: {
                                            order: { $arrayElemAt: ['$order', 0] }
                                        }
                                    }, {
                                        $match: {
                                            'order.payment_status': true
                                        }
                                    },
                                    {
                                        $lookup: {
                                            from: COLLECTION_NAME_REVIEW,
                                            localField: '_id',
                                            foreignField: 'product_order_id',
                                            as: 'review'
                                        }
                                    }, {
                                        $addFields: {
                                            review: { $arrayElemAt: ['$review', 0] }
                                        }
                                    }
                                ]
                            }
                        }, {
                            $addFields: {
                                sum_orders_to_variant: { $sum: '$product_orders.quantity' },
                                avg_ratings_to_variant: { $avg: '$product_orders.review.rating' }
                            }
                        }
                    ]
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
            }, {
                $lookup: {
                    from: COLLECTION_NAME_COLOR,
                    localField: 'image_product_colors.color_id',
                    foreignField: '_id',
                    as: 'colors'
                }
            },
            {
                $addFields: {
                    averageRating: {
                        $cond: {
                            if: {
                                $anyElementTrue: {
                                    $map: {
                                        input: '$variants.avg_ratings_to_variant',
                                        as: 'item',
                                        in: { $ne: ['$$item', null] }
                                    }
                                }
                            },
                            then: { $avg: '$variants.avg_ratings_to_variant' },
                            else: 5
                        }
                    },
                    total_orders: { $sum: '$variants.sum_orders_to_variant' },
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
                    price: { $min: '$variants.price' },
                    sales_active: {
                        $filter: {
                            input: '$sales',
                            as: 'sale',
                            cond: {
                                $and: [
                                    { $eq: ['$$sale.is_active', true] },
                                    { $lte: ['$$sale.time_start', date] },
                                    { $gte: ['$$sale.time_end', date] }
                                ]
                            }
                        }
                    }
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
                    total_orders: 1,
                    discount: { $sum: '$sales_active.discount' },
                    createdAt: 1,
                    'sizes._id': 1,
                    'sizes.size': 1,
                    'colors._id': 1,
                    'colors.name_color': 1,
                    'colors.hex_color': 1,
                    'sales_active.name_sale': 1,
                    'sales_active.discount': 1,
                    'sales_active.time_end': 1,
                    'sales_active.image_sale': { $arrayElemAt: ['$sales_active.image_sale.url', 0] },
                    'sales_active._id': 1,
                }
            }
        ])
        if (!product) throw new ConflictRequestError('Error get detai product')
        return product[0]
    }

    static getAllProducts = async ({ query, body }) => {
        const { user_id, category_id, sort, is_delete = 'false', is_public = 'true',
            page, page_size, sale_id,
            get_top_trendings, get_least_sold_products, get_products_to_favorite } = query
        const { price, colors_id, sizes_id, rating, brands_id, categories_id } = body

        const condition_is_delete = convertBoolen(is_delete)
        const condition_is_public = convertBoolen(is_public)

        const date = new Date()
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

        if (Array.isArray(brands_id) && brands_id.length > 0) {
            const brands_ObId = brands_id.filter(id => id !== '' && ObjectId.isValid(id)).map(id => convertToObjectId(id))
            if (brands_ObId.length > 0) {
                matchCondition.brand_id = { $in: brands_ObId }
            }
        }

        if (Array.isArray(categories_id) && categories_id.length > 0) {
            const categories_Obid = categories_id.filter(id => id !== '' && ObjectId.isValid(id)).map(id => convertToObjectId(id))
            if (categories_Obid.length > 0) {
                matchCondition.category_id = { $in: categories_Obid }
            }
        }

        if (is_delete) {
            matchCondition.is_delete = condition_is_delete
        }

        if (is_public) {
            matchCondition.is_public = condition_is_public
        }

        let pipeline = [
            {
                $match: matchCondition
            }, {
                $lookup: {
                    from: COLLECTION_NAME_CATEGORY,
                    localField: 'category_id',
                    foreignField: '_id',
                    as: 'category'
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
                    from: COLLECTION_NAME_FAVORITE,
                    localField: '_id',
                    foreignField: 'product_id',
                    as: 'favorites'
                }
            }, {
                $lookup: {
                    from: COLLECTION_NAME_PRODUCT_SALE,
                    localField: '_id',
                    foreignField: 'product_id',
                    as: 'product_sale',
                    pipeline: [
                        {
                            $match: {
                                is_active: true
                            }
                        }, {
                            $lookup: {
                                from: COLLECTION_NAME_SALE,
                                localField: 'sale_id',
                                foreignField: '_id',
                                as: 'sale',
                                pipeline: [
                                    {
                                        $match: {
                                            is_active: true,
                                            time_start: { $lte: date },
                                            time_end: { $gte: date }
                                        }
                                    }
                                ]
                            }
                        }, {
                            $addFields: {
                                sale: { $arrayElemAt: ['$sale', 0] }
                            }
                        }
                    ]
                }
            }, {
                $lookup: {
                    from: COLLECTION_NAME_PRODUCT_VARIANT,
                    localField: '_id',
                    foreignField: 'product_id',
                    as: 'variants',
                    pipeline: [
                        {
                            $match: {
                                is_delete: false,
                                quantity: { $gt: 0 }
                            }
                        }, {
                            $lookup: {
                                from: COLLECTION_NAME_SIZE,
                                localField: 'size_id',
                                foreignField: '_id',
                                as: 'size',
                                pipeline: [{
                                    $match: {
                                        is_deleted: false
                                    }
                                }]
                            }
                        }, {
                            $lookup: {
                                from: COLLECTION_NAME_PRODUCT_ORDER,
                                localField: '_id',
                                foreignField: 'product_variant_id',
                                as: 'product_orders',
                                pipeline: [
                                    {
                                        $lookup: {
                                            from: COLLECTION_NAME_ORDER,
                                            localField: 'order_id',
                                            foreignField: '_id',
                                            as: 'order'
                                        }
                                    }, {
                                        $addFields: {
                                            order: { $arrayElemAt: ['$order', 0] }
                                        }
                                    }, {
                                        $match: {
                                            'order.payment_status': true
                                        }
                                    },
                                    {
                                        $lookup: {
                                            from: COLLECTION_NAME_REVIEW,
                                            localField: '_id',
                                            foreignField: 'product_order_id',
                                            as: 'review'
                                        }
                                    }, {
                                        $addFields: {
                                            review: { $arrayElemAt: ['$review', 0] }
                                        }
                                    }
                                ]
                            }
                        }, {
                            $lookup: {
                                from: COLLECTION_NAME_IMAGE_PRODUCT_COLOR,
                                localField: 'image_product_color_id',
                                foreignField: '_id',
                                as: 'image_color',
                                pipeline: [
                                    {
                                        $lookup: {
                                            from: COLLECTION_NAME_COLOR,
                                            localField: 'color_id',
                                            foreignField: '_id',
                                            as: 'color',
                                            pipeline: [{
                                                $match: {
                                                    is_deleted: false
                                                }
                                            }]
                                        }
                                    }, {
                                        $addFields: {
                                            color: { $arrayElemAt: ['$color', 0] }
                                        }
                                    }
                                ]
                            }
                        }, {
                            $addFields: {
                                size: { $arrayElemAt: ['$size', 0] },
                                image_color: { $arrayElemAt: ['$image_color', 0] },
                                sum_orders_to_variant: { $sum: '$product_orders.quantity' },
                                avg_ratings_to_variant: { $avg: '$product_orders.review.rating' }
                            }
                        }
                    ]
                }
            }, {
                $addFields: {
                    product_sale: { $arrayElemAt: ['$product_sale', 0] },
                    name_brand: { $arrayElemAt: ['$brand.name_brand', 0] },
                    name_category: { $arrayElemAt: ['$category.name_category', 0] },
                    price_min: { $min: '$variants.price' },
                    price_max: { $max: '$variants.price' },
                    inventory_quantity: { $sum: '$variants.quantity' },
                    averageRating: {
                        $cond: {
                            if: {
                                $anyElementTrue: {
                                    $map: {
                                        input: '$variants.avg_ratings_to_variant',
                                        as: 'item',
                                        in: { $ne: ['$$item', null] }
                                    }
                                }
                            },
                            then: { $avg: '$variants.avg_ratings_to_variant' },
                            else: 5
                        }
                    },
                    total_orders: { $sum: '$variants.sum_orders_to_variant' },
                    can_be_delete: {
                        $cond: {
                            if: { $gt: [{ $sum: '$variants.sum_orders_to_variant' }, 0] },
                            then: false,
                            else: true
                        }
                    },
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
                    discount: {
                        $cond: {
                            if: { $gt: ['$product_sale.sale', null] },
                            then: { $sum: '$product_sale.sale.discount' },
                            else: 0
                        }
                    },
                    first_image: {
                        $arrayElemAt: [
                            {
                                $filter: {
                                    input: '$images_product',
                                    as: 'image',
                                    cond: { $eq: ['$$image.type', 'image'] }
                                }
                            },
                            0
                        ]
                    }
                }
            }, {
                $project: {
                    _id: 1,
                    name_product: 1,
                    name_brand: 1,
                    name_category: 1,
                    thumb: '$first_image.url',
                    price_min: 1,
                    price_max: 1,
                    inventory_quantity: 1,
                    averageRating: 1,
                    total_orders: 1,
                    can_be_delete: 1,
                    isFavorite: 1,
                    discount: 1,
                    colors: '$variants.image_color.color',
                    sizes: '$variants.size',
                    sale_id: '$product_sale.sale._id',
                    is_delete: 1,
                    is_public: 1,
                    createdAt: 1,
                }
            }
        ]

        if (get_products_to_favorite && user_id) {
            const condition_get_products_to_favorite = convertBoolen(get_products_to_favorite)
            pipeline.push({
                $match: {
                    isFavorite: condition_get_products_to_favorite
                }
            })
        }

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

        if (sale_id) {
            const sale_Obid = convertToObjectId(sale_id)
            pipeline.push({
                $match: {
                    sale_id: sale_Obid
                }
            })
        }

        pipeline.push({
            $match: matchFilter
        }, {
            $project: {
                colors: 0,
                sizes: 0
            }
        })

        if (page && page_size) {
            const skip = (Math.max(1, parseInt(page)) - 1) * Math.max(1, parseInt(page_size));
            const limit = Math.max(1, parseInt(page_size));

            pipeline.push(
                { $skip: skip },
                { $limit: limit }
            );
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

        if (get_top_trendings && !get_least_sold_products) {
            const num_top_trending = Number(get_top_trendings)
            pipeline = [
                ...pipeline,
                {
                    $sort: {
                        total_orders: -1
                    }
                }, {
                    $limit: num_top_trending
                }
            ]
        }

        if (!get_top_trendings && get_least_sold_products) {
            const num_least_sold_products = Number(get_least_sold_products)
            pipeline = [
                ...pipeline,
                {
                    $sort: {
                        total_orders: 1
                    }
                }, {
                    $limit: num_least_sold_products
                }
            ]
        }

        const products = await productModel.aggregate(pipeline)

        if (!products) throw new NotFoundError(`Error get all products`)

        let totalProducts = 0
        let totalPages = 0
        if (page && page_size) {
            totalProducts = await productModel.aggregate([...pipeline.slice(0, -2), { $count: "total" }])
            totalPages = Math.ceil(totalProducts[0]?.total / page_size)
        }

        const response = page && page_size ? {
            products,
            total_products: totalProducts[0]?.total || 0,
            total_pages: totalPages,
            current_page: Number(page)
        } : { products }

        return response
    }

    static getDataFilter = async () => {
        const colors = await colorModel.aggregate([
            {
                $match: {
                    is_deleted: false
                }
            },
            {
                $project: {
                    _id: 1,
                    hex_color: 1,
                    name_color: 1
                }
            }
        ])

        const sizes = await sizeModel.aggregate([
            {
                $match: {
                    is_deleted: false
                }
            },
            {
                $project: {
                    _id: 1,
                    size: 1
                }
            }
        ])

        const brands = await brandModel.aggregate([
            {
                $match: {
                    is_delete: false
                }
            },
            {
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

    static checkParamsProduct = async ({ body }) => {
        const { name_product, description, images, category_id, brand_id, product_variants, is_public } = body
        if (!name_product || !description || !images || !category_id || !brand_id || !product_variants || is_public === undefined || is_public === null)
            throw new ConflictRequestError('Please provide full information!')
        const category = await categoryModel.findById(category_id).lean()
        if (category.depth !== 2) throw new ConflictRequestError('The depth of category must be 2!')
    }

    static checkParamProductVariants = ({ product_variants }) => {
        const arr_product_variants = JSON.parse(product_variants)
        if (arr_product_variants.length === 0) throw new ConflictRequestError('product_variants field cannot be an empty array!')
        return arr_product_variants
    }

    static addProduct = async ({ body }) => {
        const { name_product, description, images, category_id, brand_id, product_variants, is_public } = body;
        await this.checkParamsProduct({ body })
        const arr_product_variants = this.checkParamProductVariants({ product_variants })
        const newProduct = await productModel.create({
            name_product,
            description,
            images_product: images,
            category_id,
            brand_id,
            is_public
        })
        if (!newProduct) throw new ConflictRequestError('Error add new product!')
        let newProductResponse = selectFilesData({
            fileds: ['name_product',
                'description', 'image_product', 'category_id', 'brand_id', '_id'], object: newProduct
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