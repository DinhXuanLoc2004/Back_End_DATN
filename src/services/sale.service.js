const { ConflictRequestError, NotFoundError } = require("../core/error.reponse")
const { productModel, COLLECTION_NAME_PRODUCT } = require("../models/product.model")
const { COLLECTION_NAME_PRODUCT_SALE, product_saleModel } = require("../models/product_sale.model")
const { saleModel, COLLECTION_NAME_SALE } = require("../models/sale.model")
const { selectFilesData, convertToObjectId, convertToDate, deleteImage, validateTime, formatStringToArray, unselectFilesData, convertBoolen } = require("../utils")
const cloudinary = require('../configs/config.cloudinary')
const { COLLECTION_NAME_CATEGORY } = require("../models/category.model")
const { COLLECTION_NAME_PRODUCT_VARIANT } = require("../models/product_variant.model")
const { COLLECTION_NAME_BRAND } = require("../models/brand.model")
const { COLLECTION_NAME_FAVORITE } = require("../models/favorite.model")

class SaleService {
    static getProductsSale = async ({ query }) => {
        const { sale_id, category_id, user_id } = query
        const sale_Obid = convertToObjectId(sale_id)
        const date = new Date()
        let pipeline = [
            {
                $match: {
                    sale_id: sale_Obid,
                    is_active: true
                }
            }, {
                $lookup: {
                    from: COLLECTION_NAME_PRODUCT,
                    localField: 'product_id',
                    foreignField: '_id',
                    as: 'product',
                    pipeline: [
                        {
                            $lookup: {
                                from: COLLECTION_NAME_PRODUCT_SALE,
                                localField: '_id',
                                foreignField: 'product_id',
                                as: 'product_sale'
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
                                as: 'product_variants'
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
                                category: { $arrayElemAt: ['$category', 0] },
                                brand: { $arrayElemAt: ['$brand', 0] },
                                price_min: { $min: '$product_variants.price' },
                                inventory: { $sum: '$product_variants.quantity' },
                                thumb: { $arrayElemAt: ['$images_product.url', 0] },
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
                                averageRating: 0,
                                countReview: 0,
                            }
                        }, {
                            $project: {
                                _id: 1,
                                name_product: 1,
                                price_min: 1,
                                inventory: 1,
                                name_brand: '$brand.name_brand',
                                name_category: '$category.name_category',
                                category_id: '$category._id',
                                thumb: 1,
                                discount: { $sum: '$sales_active.discount' },
                                isFavorite: 1,
                                createdAt: 1,
                                averageRating: 1,
                                countReview: 1,
                            }
                        }
                    ]
                }
            }, {
                $addFields: {
                    product: { $arrayElemAt: ['$product', 0] }
                }
            }, {
                $project: {
                    _id: 0,
                    _id: '$product._id',
                    name_product: '$product.name_product',
                    price_min: '$product.price_min',
                    inventory: '$product.inventory',
                    name_brand: '$product.name_brand',
                    name_category: '$product.name_category',
                    category_id: '$product.category_id',
                    thumb: '$product.thumb',
                    discount: '$product.discount',
                    isFavorite: '$product.isFavorite',
                    createdAt: '$product.createdAt',
                    averageRating: '$product.averageRating',
                    countReview: '$product.countReview',
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
        const products = await product_saleModel.aggregate(pipeline)
        return products
    }

    static getCategoriesSale = async ({ query }) => {
        const { sale_id } = query
        const sale_Obid = convertToObjectId(sale_id)
        const categories = await product_saleModel.aggregate([
            {
                $match: {
                    sale_id: sale_Obid
                }
            }, {
                $lookup: {
                    from: COLLECTION_NAME_PRODUCT,
                    localField: 'product_id',
                    foreignField: '_id',
                    as: 'categories',
                    pipeline: [
                        {
                            $lookup: {
                                from: COLLECTION_NAME_CATEGORY,
                                localField: 'category_id',
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
                    ]
                }
            }, {
                $addFields: {
                    categories: { $arrayElemAt: ['$categories', 0] }
                }
            }, {
                $project: {
                    _id: 0,
                    categories: 1
                }
            }, {
                $group: {
                    _id: null,
                    categories: { $addToSet: '$categories' }
                }
            }, {
                $project: {
                    _id: 0,
                    categories: 1
                }
            }
        ])

        return categories[0].categories
    }

    static getDetailSale = async ({ query }) => {
        const { _id } = query
        const sale = await saleModel.findById(_id).lean()
        return unselectFilesData({ fields: ['createdAt', 'updatedAt', '__v'], object: sale })
    }

    static updateSale = async ({ query, body }) => {
        const { _id } = query
        const { discount, time_start, time_end, product_ids, image, is_active, name_sale } = body
        const arr_product_ids = JSON.parse(product_ids)
        const date = new Date()
        if ((convertToDate(time_start) >= convertToDate(time_end)) || date > convertToDate(time_end)) throw new ConflictRequestError('Invalid time!')
        const old_sale = await saleModel.findById(_id)
        if (old_sale.image_sale.public_id !== image.public_id) deleteImage(old_sale.image_sale.public_id)
        const product_Obids = arr_product_ids.map(product_id => convertToObjectId(product_id))
        const discountProducts = await productModel.aggregate([
            {
                $match: {
                    _id: { $in: product_Obids }
                }
            }, {
                $lookup: {
                    from: COLLECTION_NAME_PRODUCT_SALE,
                    localField: '_id',
                    foreignField: 'product_id',
                    as: 'product_sale'
                }
            }, {
                $lookup: {
                    from: COLLECTION_NAME_SALE,
                    localField: 'product_sale.sale_id',
                    foreignField: '_id',
                    as: 'sale'
                }
            }, {
                $match: {
                    'sale._id': { $ne: old_sale._id }
                }
            }, {
                $project: {
                    _id: 0,
                    sum_discount: { $sum: '$sale.discount' }
                }
            }
        ])
        discountProducts.filter(item => {
            if (discount > (100 - item.sum_discount)) {
                throw new ConflictRequestError('Discount is greater than the remaining discount percentage!')
            }
        })
        const old_product_sale = await product_saleModel.find({ sale_id: _id }).lean()
        const old_product_ids = old_product_sale.map(sale => sale.product_id)
        const diff1 = old_product_ids.filter(product_id => !arr_product_ids.includes(product_id))
        if (diff1) {
            diff1.forEach(async product_id => {
                const deleteProductSale = await product_saleModel.findOneAndDelete({ product_id, sale_id: _id })
                if (!deleteProductSale) throw new ConflictRequestError('Error delete product sale')
            });
        }
        const diff2 = arr_product_ids.filter(product_id => !old_product_ids.includes(product_id))
        if (diff2) {
            diff2.forEach(async product_id => {
                const newProductSale = await product_saleModel.create({
                    product_id,
                    sale_id: _id
                })
                if (!newProductSale) throw new ConflictRequestError('Error created product sale!')
            })
        }
        const updatedSale = await saleModel.findByIdAndUpdate(_id, {
            $set: {
                discount,
                time_start,
                time_end,
                is_active,
                image_sale: image,
                name_sale
            }
        }, {
            new: true
        })
        if (!updatedSale) throw new ConflictRequestError('Error update sale!')
        return selectFilesData({ fileds: ['_id', 'discount', 'time_start', 'time_end', 'is_active', 'image_sale'], object: updatedSale })
    }

    static changeIsActivesale = async ({ query }) => {
        const { _id } = query
        const sale = await saleModel.findById(_id)
        if (!sale) throw new NotFoundError('Not found sale')
        const updatedSale = await saleModel.findByIdAndUpdate({ _id }, { $set: { is_active: !sale.is_active } }, { new: true })
        if (!updatedSale) throw new ConflictRequestError('Error change is active sale!')
        return updatedSale
    }

    static deteleSale = async ({ query }) => {
        const { _id } = query
        const deleteSale = await saleModel.findByIdAndDelete(_id)
        if (!deleteSale) throw new ConflictRequestError('Error delete sale!')
        await product_saleModel.deleteMany({ sale_id: _id })
        cloudinary.uploader.destroy(deleteSale.image_sale.public_id)
        return deleteSale
    }

    static getSalesActive = async ({ query }) => {
        const { active = 'true' } = query
        let pipeline = [{
            $project: {
                name_sale: 1,
                discount: 1,
                time_start: 1,
                time_end: 1,
                thumb: '$image_sale.url',
                is_active: 1
            }
        }]
        const date = new Date()
        const condition = convertBoolen(active)
        if (condition) {
            pipeline = [
                {
                    $match: {
                        is_active: true,
                        time_start: { $lte: date },
                        time_end: { $gte: date }
                    }
                },
                ...pipeline
            ]
        } else {
            pipeline = [
                {
                    $match: {
                        $or: [
                            { is_active: false },
                            { time_end: { $lte: date } }
                        ]
                    }
                },
                ...pipeline
            ]
        }
        const sales = await saleModel.aggregate(pipeline)
        return sales
    }

    static addSale = async ({ body }) => {
        const { discount, time_start, time_end, product_ids, image, name_sale } = body
        const arr_product_ids = JSON.parse(product_ids)
        validateTime(time_start, time_end)
        const newSale = await saleModel.create({
            discount,
            time_start,
            time_end,
            image_sale: image,
            name_sale
        })
        if (!newSale) throw new ConflictRequestError('Error created new sale!')
        let listNewProductSales = []
        for (const product_id of arr_product_ids) {
            await product_saleModel.updateMany({ product_id }, { is_active: false })
            const newProductSale = await product_saleModel.create({
                product_id,
                sale_id: newSale._id
            })
            listNewProductSales = [...listNewProductSales, newProductSale]
        }
        if (listNewProductSales.length < arr_product_ids.length) throw new ConflictRequestError('Error created product sale')
        return selectFilesData({ fileds: ['_id', 'discount', 'time_start', 'time_end', 'name_sale', 'image_sale'], object: newSale })
    }
}

module.exports = SaleService