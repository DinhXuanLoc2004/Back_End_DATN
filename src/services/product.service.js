const { ConflictRequestError, NotFoundError } = require("../core/error.reponse")
const { productModel } = require("../models/product.model")
const { selectFilesData, formatStringToArray } = require("../utils")
const { COLLECTION_NAME_SALE } = require('../models/sale.model')
const { COLLECTION_NAME_BRAND } = require('../models/brand.model')
const { COLLECTION_NAME_CATEGORY } = require('../models/category.model')
const { COLLECTION_NAME_REVIEW } = require('../models/review.model')

class ProductService {

    static getAllProducts = async () => {
        const products = await productModel.aggregate([
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
                $addFields: {
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
                    createdAt: 1
                }
            }
        ])
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