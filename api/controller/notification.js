const mongoose = require('mongoose');
const Message = require('../model/message');

exports.fetchPushNotifications = async (req, res, nex) => {
    try {
        const pushNotifications = await Message.find();
        if (pushNotifications.length < 0) {
            return res.status(404).send({
                message: 'No notifications found'
            })
        }
        const messages = await pushNotifications.map(message => {
            return {
                emailAddress: message.emailAddress,
                messageTitle: message.messageTitle,
                messageBody: message.messageBody,
                messageTopic: message.messageTopic,
                messageStatus: message.messageStatus,
                createdAt: message.createdAt
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

        const fetchedMessages = await Message.find({emailAddress: emailAddress});

        if (fetchedMessages.length<=0) {
            return res.status(404).send({
                message: 'No Notifications Sent By that Email'
            });
        }
        const messages = await fetchedMessages.map(message => {
            return {
                emailAddress: message.emailAddress,
                messageTitle: message.messageTitle,
                messageBody: message.messageBody,
                messageTopic: message.messageTopic,
                messageStatus: message.messageStatus,
                createdAt: message.createdAt
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