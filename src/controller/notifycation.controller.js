const { OK } = require('../core/success.response')
const NotifycationService = require('../services/notifycation.service')

class NotifycationController {
    static testSendNotify = async (req, res, next) => {
        const { user_id, title, body, data } = req.body
        console.log(body);
        new OK({
            message: 'Send notify success!',
            metadata: await NotifycationService.pushNofifySingle({ user_id, title, body, data })
        }).send(res)
    }
}

module.exports = NotifycationController