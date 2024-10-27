const { ConflictRequestError, NotFoundError } = require("../core/error.reponse")
const { productModel } = require("../models/product.model")
const { COLLECTION_NAME_PRODUCT_SALE, product_saleModel } = require("../models/product_sale.model")
const { saleModel, COLLECTION_NAME_SALE } = require("../models/sale.model")
const { selectFilesData, convertToObjectId, convertToDate, deleteImage, validateTime, formatStringToArray, unselectFilesData } = require("../utils")
const cloudinary = require('../configs/config.cloudinary')

class SaleService {
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

    static getSalesActive = async () => {
        const date = new Date()
        const sales = await saleModel.aggregate([{
            $match: {
                is_active: true,
                time_end: { $gt: date }
            }
        }, {
            $project: {
                name_sale: 1,
                discount: 1,
                time_start: 1,
                time_end: 1,
                thumb: '$image_sale.url'
            }
        }])
        return sales
    }

    static addSale = async ({ body }) => {
        const { discount, time_start, time_end, product_ids, image, name_sale } = body
        const arr_product_ids = JSON.parse(product_ids)
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