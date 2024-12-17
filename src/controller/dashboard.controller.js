const { OK, CREATED } = require('../core/success.response')
const DashboardService = require('../services/dashboard.service')

class DashboardController {
    static getOrderStatistics = async (req, res, next) => {
        new OK({
            message: 'Get order statistics success!',
            metadata: await DashboardService.getOrderStatistics({ query: req.query })
        }).send(res);
    };    
}

module.exports = DashboardController