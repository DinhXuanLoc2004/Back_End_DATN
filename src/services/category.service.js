const { ConflictRequestError, NotFoundError } = require("../core/error.reponse")
const { categoryModel } = require("../models/category.model")
const { selectFilesData } = require("../utils")

class CategoryService {

    static getCategories = async ({ parent_id }) => {
        await this.findByIDParentIDCategory({ parent_id })
        const categories = await categoryModel.find({ parent_id: parent_id }).select('_id name_category parent_id image_category depth').lean()
        if (!categories) throw new NotFoundError('Not found categories')
        return { categories }
    }

    static addCategory = async ({ name_category, parent_id, image }) => {
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
        console.log('category parent::', category);
        if (!category) {
            return depth
        }
        return await this.getCategoryDepth({ category_id: category.parent_id, depth: depth + 1 })
    }

    static findByIDParentIDCategory = async ({ parent_id }) => {
        if (parent_id) {
            const category = await categoryModel.findById(parent_id).lean()
            if (!category) throw new NotFoundError('Not found parent_id')
        }
    }
}

module.exports = CategoryService