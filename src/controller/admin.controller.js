const { OK, CREATED } = require('../core/success.response')
const AdminService = require('../services/admin.service')

class AdminController {
    static setFcmAdmin = async (req, res, next) => {
        new OK({
            message: 'Set fcm admin success!',
            metadata: await AdminService.setFcmAdmin({ body: req.body })
        }).send(res)
    }

    static toggleIsActiveAdmin = async (req, res, next) => {
        new OK({
            message: 'Toggle is active admin success!',
            metadata: await AdminService.togleIsActiveAdmin({ query: req.query })
        }).send(res)
    }

    static loginAdmin = async (req, res, next) => {
        new OK({
            message: 'Login admin success!',
            metadata: await AdminService.loginAdmin({ body: req.body })
        }).send(res)
    }

    static createAdmin = async (req, res, next) => {
        new CREATED({
            message: 'Created admin success!',
            metadata: await AdminService.createAdmin({ body: req.body })
        }).send(res)
    }
}

module.exports = AdminController