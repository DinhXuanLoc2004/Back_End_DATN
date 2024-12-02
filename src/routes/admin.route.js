const express = require('express')
const { asyncHandler } = require('../utils')
const AdminController = require('../controller/admin.controller')
const router = express.Router()

router.post('/create_admin', asyncHandler(AdminController.createAdmin))
router.post('/login_admin', asyncHandler(AdminController.loginAdmin))
router.put('/toggle_is_active_admin', asyncHandler(AdminController.toggleIsActiveAdmin))
router.put('/set_fcm_admin', asyncHandler(AdminController.setFcmAdmin))

module.exports = router