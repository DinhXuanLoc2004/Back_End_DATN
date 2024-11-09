const { CREATED, OK } = require("../core/success.response")
const ProductService = require("../services/product.service")

class ProductController {
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
        try {
            const productData = await ProductService.addProduct({ body: req.body });
            new CREATED({
                message: 'Created Product Success!',
                metadata: productData
            }).send(res);
        } catch (error) {
            console.error('Error adding product:', error);
            res.status(500).send({ message: 'Error adding product', error: error.message });
        }
    }

    static updateProduct = async (req, res, next) => {
        const { product_id } = req.query;
        try {
            const updatedProductData = await ProductService.updateProduct({ body: req.body, product_id });
            new OK({
                message: 'Product updated successfully!',
                metadata: updatedProductData
            }).send(res);
        } catch (error) {
            console.error('Error updating product:', error);
            res.status(500).send({ message: 'Error updating product', error: error.message });
        }
    };
    

    static deleteProduct = async (req, res, next) => {
        const { product_id } = req.query;
        new OK({
            message: 'Product deleted successfully!',
            metadata: await ProductService.deleteProduct({ product_id })
        }).send(res);
    };
}

module.exports = ProductController