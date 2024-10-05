const { CREATED } = require("../core/success.response")
const FavoriteService = require("../services/favorite.service")

class FavoriteController {
    static addFavorite = async (req, res, next) => {
        new CREATED({
            message: 'Create favorite success!',
            metadata: await FavoriteService.addFavorite({body: req.body})
        }).send(res)
    }
}

module.exports = FavoriteController