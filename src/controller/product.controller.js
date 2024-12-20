const { CREATED, OK } = require("../core/success.response")
const ProductService = require("../services/product.service")

class ProductController {
    static togglePublicProduct = async (req, res, next) => {
        new OK({
            message: 'Toggle public product success!',
            metadata: await ProductService.togglePublicProduct({ query: req.query })
        }).send(res)
    }

    static toggleDeleteProduct = async (req, res, next) => {
        new OK({
            message: 'Toggle delete product success!',
            metadata: await ProductService.toggleDeleteProduct({ query: req.query })
        }).send(res)
    }

    static updateProduct = async (req, res, next) => {
        new OK({
            message: 'Update product success!',
            metadata: await ProductService.updateProduct({ query: req.query, body: req.body })
        }).send(res)
    }

    static getDetailProductUpdate = async (req, res, next) => {
        new OK({
            message: 'Get product detail update success!',
            metadata: await ProductService.getDetailProductUpdate({ query: req.query })
        }).send(res)
    }

    static getColorSizeToProduct = async (req, res, next) => {
        new OK({
            message: 'Get data colors and sizes to product success',
            metadata: await ProductService.getColorSizeToProduct({ query: req.query })
        }).send(res)
    }

    static getProductDetail = async (req, res, next) => {
        const { product_id, user_id } = req.query
        new OK({
            message: 'Get detail product success!',
            metadata: await ProductService.getProductDetail({ product_id, user_id })
        }).send(res)
    }

    static getDataFilter = async (req, res, next) => {
        new OK({
            message: 'Get data filter success!',
            metadata: await ProductService.getDataFilter()
        }).send(res)
    }

    static getAllProducts = async (req, res, next) => {
        new OK({
            message: 'Get all products success!',
            metadata: await ProductService.getAllProducts({ query: req.query, body: req.body })
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
        new CREATED({
            message: 'Created Product Success!',
            metadata: await ProductService.addProduct({ body: req.body })
        }).send(res)
    }
}

module.exports = ProductController