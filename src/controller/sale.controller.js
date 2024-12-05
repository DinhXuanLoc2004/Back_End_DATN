const { CREATED, OK } = require("../core/success.response")
const SaleService = require("../services/sale.service")

class SaleController {
    static getProductsSale = async (req, res, next) => {
        new OK({
            message: 'Get products sale success!',
            metadata: await SaleService.getProductsSale({ query: req.query })
        }).send(res)
    }

    static getCategoriesSale = async (req, res, next) => {
        new OK({
            message: 'Get categories sale success!',
            metadata: await SaleService.getCategoriesSale({ query: req.query })
        }).send(res)
    }

    static getDetailSale = async (req, res, next) => {
        new OK({
            message: 'Get detail sale success!',
            metadata: await SaleService.getDetailSale({ query: req.query })
        }).send(res)
    }

    static updateSale = async (req, res, next) => {
        new OK({
            message: 'Update sale success!',
            metadata: await SaleService.updateSale({ query: req.query, body: req.body })
        }).send(res)
    }

    static deteleSale = async (req, res, next) => {
        new OK({
            message: 'Delete sale success!',
            metadata: await SaleService.deteleSale({ query: req.query })
        }).send(res)
    }

    static changeIsActiveSale = async (req, res, next) => {
        new OK({
            message: 'Change status active sale success!',
            metadata: await SaleService.changeIsActivesale({ query: req.query })
        }).send(res)
    }

    static getSalesActive = async (req, res, next) => {
        new OK({
            message: 'Get sales active success!',
            metadata: await SaleService.getSalesActive({query: req.query})
        }).send(res)
    }

    static addSale = async (req, res, next) => {
        new CREATED({
            message: 'Create sale succes!',
            metadata: await SaleService.addSale({ body: req.body })
        }).send(res)
    }
}

module.exports = SaleController