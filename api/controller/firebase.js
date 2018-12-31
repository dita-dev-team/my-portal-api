const firebaseAdmin = require('firebase-admin');

exports.sendNotifications = function (req, res, next) {
    let _this = req.body;

    if (!(_this.messageBody && _this.messageTitle && _this.messageTopic)) {
        return res.status(400).send({
            message: 'Invalid Request Body'
        })
    }

    let messageTitle, messageBody, messageTopic;
    messageTitle = _this.messageTitle;
    messageBody = _this.messageBody;
    messageTopic = _this.messageTopic;

    let androidNotification = {
        android: {
            ttl: 3600 * 1000,
            priority: 'normal',
            notification: {
                title: messageTitle,
                body: messageBody,
                icon: 'stock_ticker_update',
                color: '#1D1124'
            }
        },
        topic: messageTopic
    };
    firebaseAdmin.messaging().send(androidNotification)
        .then(response => {
            return res.status(200).send({
                message: 'Message Sent Successfully',
                messageBody: androidNotification,
                response
            })
        })
        .catch(error => {
            console.log(error.message);
            return res.status(500)
                .send({
                    message: 'Error Occurred While Sending Message',
                    error: error.message
                })
        });
};