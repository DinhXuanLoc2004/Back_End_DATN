const { CREATED, OK } = require("../core/success.response")
const CategoryService = require("../services/category.service")

class CategoryController {

    static getCategories = async (req, res, next) => {
        const parent_id = req.params.parent_id ?? null
        new OK({
            message: 'Get categories success',
            metadata: await CategoryService.getCategories({parent_id})
        }).send(res)
    }

    static addCategory = async (req, res, next) => {
        const { name_category, parent_id, image } = req.body
        new CREATED({
            message: 'Create category success!',
            metadata: await CategoryService.addCategory({ name_category, parent_id, image })
        }).send(res)
    }
}

module.exports = CategoryController