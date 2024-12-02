const { query } = require("express")
const { ConflictRequestError, NotFoundError } = require("../core/error.reponse")
const { categoryModel, COLLECTION_NAME_CATEGORY } = require("../models/category.model")
const { selectFilesData, convertToObjectId } = require("../utils")
const { COLLECTION_NAME_PRODUCT } = require("../models/product.model")

class CategoryService {

    static getCategories = async ({ query }) => {
        const { parent_id, is_delete } = query
        await this.findByIDParentIDCategory({ parent_id })
        const parent_obId = parent_id ? convertToObjectId(parent_id) : null
        const condition_is_delete = is_delete === 'true' ? true : false
        const categories = await categoryModel.aggregate([
            {
                $match: {
                    is_delete: condition_is_delete,
                    parent_id: parent_obId
                }
            }, {
                $lookup: {
                    from: COLLECTION_NAME_PRODUCT,
                    localField: '_id',
                    foreignField: 'category_id',
                    as: 'products'
                }
            },
            {
                $lookup: {
                    from: COLLECTION_NAME_CATEGORY,
                    localField: '_id',
                    foreignField: 'parent_id',
                    as: 'category_childs'
                }
            },
            {
                $addFields: {
                    can_be_delete: {
                        $cond: {
                            if:
                            {
                                $or: [
                                    { $eq: ['$is_delete', true] },
                                    { $gt: [{ $size: '$products' }, 0] },
                                    { $gt: [{ $size: '$category_childs' }, 0] }
                                ]
                            },
                            then: false,
                            else: true
                        }
                    }
                }
            }, {
                $project: {
                    _id: 1,
                    name_category: 1,
                    parent_id: 1,
                    image_category: 1,
                    depth: 1,
                    can_be_delete: 1,
                    is_delete: 1
                }
            }
        ])
        return { categories }
    }

    static addCategory = async ({ body }) => {
        const { name_category, parent_id, image } = body
        await this.findByIDParentIDCategory({ parent_id })
        let depth = 0
        if (parent_id) depth = await this.getCategoryDepth({ category_id: parent_id })
        const newCategory = await categoryModel.create({
            name_category,
            parent_id: parent_id ? parent_id : null,
            image_category: image,
            depth
        })
        if (!newCategory) throw new ConflictRequestError('Error create category')
        return {
            newCategory: selectFilesData({ fileds: ['name_category', 'parent_id', 'image_category', 'depth'], object: newCategory })
        }
    }

    static getCategoryDepth = async ({ category_id, depth = 0 }) => {
        const category = await categoryModel.findById(category_id).lean()
        console.log('category parent:', category);
        if (!category) {
            return depth
        }
        return await this.getCategoryDepth({ category_id: category.parent_id, depth: depth + 1 })
    }

    static findByIDParentIDCategory = async ({ parent_id }) => {
        if (parent_id) {
            const category = await categoryModel.find({ parent_id, is_delete: false }).lean()
            if (!category) throw new NotFoundError('Not found parent_id')
        }
    }

    static updateCategory = async ({ query, body }) => {
        const { _id } = query
        const { name_category, parent_id, image } = body
        const category = await categoryModel.findById(_id).lean()
        if (!category) throw new NotFoundError('Category not found')
        const updatedCategory = await categoryModel.findByIdAndUpdate(
            _id,
            {
                name_category,
                parent_id,
                image_category: image,
            },
            { new: true }
        ).lean()
        if (!updatedCategory) throw new ConflictRequestError('Error updating category')
        return selectFilesData({ fileds: ['name_category', 'parent_id', 'image_category', 'depth'], object: updatedCategory })
    }


    static toggleDeleteCategory = async ({ query }) => {
        const { _id } = query
        const category = await categoryModel.findById(_id).lean()
        if (!category) throw new NotFoundError('Category not found')
        const deletedCategory = await categoryModel.findByIdAndUpdate(
            _id,
            { is_delete: !category.is_delete },
            { new: true }
        ).lean()
        if (!deletedCategory) throw new ConflictRequestError('Error deleting category')
        return selectFilesData({ fileds: ['name_category', 'parent_id', 'image_category', 'depth'], object: deletedCategory })
    }


}

module.exports = CategoryService