const express = require('express')
const { asyncHandler } = require('../utils')
const FavoriteController = require('../controller/favorite.controller')
const router = express.Router()

router.post('/add_favorite', asyncHandler(FavoriteController.addFavorite))
router.get('/get_all_favorites', asyncHandler(FavoriteController.getFavorites))
router.get('/get_category_ids_to_favorites', asyncHandler(FavoriteController.getCategoryIdsToFavorites))

module.exports = router