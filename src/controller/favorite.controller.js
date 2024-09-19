const { CREATED } = require("../core/success.response")
const FavoriteService = require("../services/favorite.service")

class FavoriteController {
    static addFavorite = async (req, res, next) => {
        const {colors_id, sizes_id, product_id, user_id} = req.body
        new CREATED({
            message: 'Create favorite success!',
            metadata: await FavoriteService.addFavorite({colors_id, sizes_id, product_id, user_id})
        }).send(res)
    }
}

module.exports = FavoriteController