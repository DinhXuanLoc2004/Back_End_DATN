const { ConflictRequestError } = require("../core/error.reponse")
const { favoriteModel } = require("../models/favorite.model")

class FavoriteService {
    static addFavorite = async ({ body }) => {
        const {product_variant_id, user_id} = body
        const newFavorite = await favoriteModel.create({
            product_variant_id,
            user_id
        })
        if (!newFavorite) throw new ConflictRequestError('Error create favvorite')
        return {
            newFavorite
        }
    }
}

module.exports = FavoriteService