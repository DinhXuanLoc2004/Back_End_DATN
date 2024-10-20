const { CREATED, OK } = require("../core/success.response")
const FavoriteService = require("../services/favorite.service")

class FavoriteController {
    static getCategoryIdsToFavorites = async (req, res, next) => {
        new OK({
            message: 'Get list category ids to favorite success!',
            metadata: await FavoriteService.getCategoryIdsToFavorites({ query: req.query })
        }).send(res)
    }
    static getFavorites = async (req, res, next) => {
        new OK({
            message: 'Get favorites success!',
            metadata: await FavoriteService.getFavorites({ query: req.query })
        }).send(res)
    }
    static addFavorite = async (req, res, next) => {
        new CREATED({
            message: 'Create favorite success!',
            metadata: await FavoriteService.addFavorite({ body: req.body })
        }).send(res)
    }
}

module.exports = FavoriteController