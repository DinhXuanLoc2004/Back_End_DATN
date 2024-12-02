const { CREATED, OK } = require("../core/success.response")
const CategoryService = require("../services/category.service")

class CategoryController {

    static getCategories = async (req, res, next) => {
        new OK({
            message: 'Get categories success',
            metadata: await CategoryService.getCategories({ query: req.query })
        }).send(res)
    }

    static addCategory = async (req, res, next) => {
        new CREATED({
            message: 'Create category success!',
            metadata: await CategoryService.addCategory({ body: req.body })
        }).send(res)
    }

    static updateCategory = async (req, res, next) => {
        new OK({
            message: 'Update category success!',
            metadata: await CategoryService.updateCategory({ query: req.query, body: req.body })
        }).send(res)
    }


    static toggleDeleteCategory = async (req, res, next) => {
        new OK({
            message: 'Delete category success!',
            metadata: await CategoryService.toggleDeleteCategory({ query: req.query })
        }).send(res)
    }


}

module.exports = CategoryController