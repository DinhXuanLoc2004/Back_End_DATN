const express = require('express')
const { asyncHandler } = require('../utils')
const NotifycationController = require('../controller/notifycation.controller')
const router = express.Router()

router.post('/test_notify', asyncHandler(NotifycationController.testSendNotify))

module.exports = router