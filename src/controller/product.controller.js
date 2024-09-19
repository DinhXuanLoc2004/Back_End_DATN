const { CREATED, OK } = require("../core/success.response")
const ProductService = require("../services/product.service")

class ProductController {
    static getDataFilter = async (req, res, next) => {
        new OK({
            message: 'Get data filter success!',
            metadata: await ProductService.getDataFilter()
        }).send(res)
    }
    static getAllProducts = async (req, res, next) => {
        const { user_id, category_id, sort } = req.query
        const { price, colors_id, sizes_id, rating, brands_id } = req.body
        new OK({
            message: 'Get all products success!',
            metadata: await ProductService.getAllProducts({ user_id, category_id, sort, price, colors_id, sizes_id, rating, brands_id })
        }).send(res)
    }
    static getProducts = async (req, res, next) => {
        const { page = 1, limit = 10 } = req.query
        new OK({
            message: `Get products of page ${page} success!`,
            metadata: await ProductService.getproducts({ page, limit })
        }).send(res)
    }
    static addProduct = async (req, res, next) => {
        const { name_product, price, description, inventory_quantity, images,
            colors_id, sizes_id, category_id, brand_id } = req.body
        new CREATED({
            message: 'Created Product Success!',
            metadata: await ProductService.addProduct({ name_product, price, description, inventory_quantity, images, colors_id, sizes_id, category_id, brand_id })
        }).send(res)
    }
}

module.exports = ProductController