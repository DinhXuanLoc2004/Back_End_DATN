const { ConflictRequestError } = require("../core/error.reponse")
const { categoryModel } = require("../models/category.model")
const { selectFilesData } = require("../utils")

class CategoryService {
    static addCategory = async ({ name_category, parent_id }) => {
        const newCategory = await categoryModel.create({
            name_category,
            parent_id: parent_id ? parent_id : null
        })
        if (!newCategory) throw new ConflictRequestError('Error create category')
        return {
            newCategory: selectFilesData({ fileds: ['name_category', 'parent_id'], object: newCategory })
        }
    }
}

module.exports = CategoryService