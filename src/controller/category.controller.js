const { CREATED } = require("../core/success.response")
const CategoryService = require("../services/category.service")

class CategoryController {
    static addCategory = async (req, res, next) => {
        const {name_category, parent_id} = req.body
        new CREATED({
            message: 'Create category success!',
            metadata: await CategoryService.addCategory({name_category, parent_id})
        }).send(res)
    }
}

module.exports = CategoryController