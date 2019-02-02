const database = require('../model/database');

exports.fetchPushNotifications = async (req, res, nex) => {
    try {
        const pushNotifications = await database.fetchAllNotifications();
        if (pushNotifications.empty) {
            return res.status(404).send({
                message: 'No notifications found'
            })
        }
        const messages = await pushNotifications.docs.map(message => {
            return {
                emailAddress: message.email,
                messageTitle: message.title,
                messageBody: message.body,
                messageTopic: message.topic,
                messageStatus: message.status,
                // createdAt: message.createdAt
            }
        });
        res.status(200).send({
            message: 'Sent Notifications',
            pushNotifications: messages
        });
    } catch (e) {
        console.log(e.message);
        return res.status(500).send({
            message: 'Error Fetching Notification',
            error: e.message
        })
    }
};
exports.fetchNotificationByEmailAddress = async (req, res, next) => {
    try {
        let _this = req.body;
        let emailAddress = _this.emailAddress;
        if (!_this.emailAddress) {
            return res.status(401).send({
                message: 'Invalid Request Body',
                error: 'Please Provide Valid Email Address'
            })
        }

        const fetchedMessages = await database.fetchNotificationsByEmail(emailAddress);

        if (fetchedMessages.empty) {
            return res.status(404).send({
                message: 'No Notifications Sent By that Email'
            });
        }
        const messages = await fetchedMessages.docs.map(message => {
            return {
                emailAddress: message.email,
                messageTitle: message.title,
                messageBody: message.body,
                messageTopic: message.topic,
                messageStatus: message.status,
                // createdAt: message.createdAt
            }
        });
        res.status(200).send({
            message: 'Sent Notifications',
            pushNotifications: messages
        });
    } catch (e) {
        console.log(e.message);
        res.status(500).send({
            message: 'Error Fetching Messages',
            error: e.message
        })

    }
};