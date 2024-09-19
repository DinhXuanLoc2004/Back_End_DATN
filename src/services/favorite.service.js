const { ConflictRequestError } = require("../core/error.reponse")
const { favoriteModel } = require("../models/favorite.model")

class FavoriteService {
    static addFavorite = async ({ colors_id, sizes_id, product_id, user_id }) => {
        const newFavorite = await favoriteModel.create({
            colors_id,
            sizes_id,
            product_id,
            user_id
        })
        if (!newFavorite) throw new ConflictRequestError('Error create favvorite')
        return {
            newFavorite
        }
    }
}

module.exports = FavoriteService