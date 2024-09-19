const express = require('express')
const { asyncHandler } = require('../utils')
const FavoriteController = require('../controller/favorite.controller')
const router = express.Router()

router.post('/add_favorite', asyncHandler(FavoriteController.addFavorite))

module.exports = router