const { ConflictRequestError, BadRequestError } = require("../core/error.reponse")
const { userModel } = require("../models/user.model")
const admin = require('../configs/config.firebase_admin')

class NotifycationService {
    static pushNofifySingle = async ({ user_id, title, body, data }) => {
        const user = await userModel.findById(user_id).lean()
        if (!user) throw new BadRequestError('User not found!')
        const fcm_token = user.fcm_token
        if (!fcm_token) throw new ConflictRequestError('fcm_token for user underfine!')
        const message = {
            notification: {
                title,
                body
            },
            token: fcm_token,
            android: {
                priority: 'high'
            },
            data
        }
        admin.messaging().send(message).then((response) => {
            // Response is a message ID string.
            console.log('Successfully sent message:', response);
        })
            .catch((error) => {
                console.log('Error sending message:', error);
            });
    }
}

module.exports = NotifycationService