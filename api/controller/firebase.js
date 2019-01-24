const firebaseAdmin = require('firebase-admin');
const Message = require('../model/message');
const mongoose = require('mongoose');

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
        topic: 'debug'
    };
    firebaseAdmin.messaging().send(androidNotification)
        .then(response => {
            let message = new Message({
                _id: new mongoose.Types.ObjectId(),
                emailAddress: _this.emailAddress,
                messageTitle: messageTitle,
                messageBody: messageBody,
                messageTopic: messageTopic,
                messageStatus: 'success'
            });
            message.save()
                .then(result=>{
                    console.log(result);
                })
                .catch(error=>{
                   console.log('Error Saving Records',error.message);
                });

            return res.status(200).send({
                message: 'Message Sent Successfully',
                messageBody: androidNotification,
                response
            })
        })
        .catch(error => {
            console.log(error.message);
            let message = new Message({
                _id: new mongoose.Types.ObjectId(),
                emailAddress: _this.emailAddress,
                messageTitle: messageTitle,
                messageBody: messageBody,
                messageTopic: messageTopic,
                messageStatus: 'failed'
            });
            message.save()
                .exec()
                .then(result=>{
                    console.log(result);
                })
                .catch(error=>{
                    console.log('Error Saving Records',error.message);
                });

            return res.status(500)
                .send({
                    message: 'Error Occurred While Sending Message',
                    error: error.message
                })
        });
};