const database = require('../model/database');

exports.fetchPushNotifications = async (req, res, nex) => {
  try {
    const pushNotifications = await database.fetchAllNotifications();
    const messages = pushNotifications.map(message => {
      return {
        emailAddress: message.email,
        messageTitle: message.title,
        messageBody: message.body,
        messageTopic: message.topic,
        messageStatus: message.status,
        // createdAt: message.createdAt
      };
    });
    res.status(200).send({
      message: 'Sent Notifications',
      pushNotifications: messages,
    });
  } catch (e) {
    console.log(e.message);
    return res.status(500).send({
      message: 'Error Fetching Notification',
      error: e.message,
    });
  }
};
exports.fetchNotificationByEmailAddress = async (req, res, next) => {
  try {
    let _this = req.body;
    let emailAddress = _this.emailAddress;
    if (!_this.emailAddress) {
      return res.status(400).send({
        message: 'Invalid Request Body',
        error: 'Please Provide Valid Email Address',
      });
    }

    const fetchedMessages = await database.fetchNotificationsByEmail(
      emailAddress,
    );
    const messages = await fetchedMessages.map(message => {
      return {
        emailAddress: message.email,
        messageTitle: message.title,
        messageBody: message.body,
        messageTopic: message.topic,
        messageStatus: message.status,
        // createdAt: message.createdAt
      };
    });
    res.status(200).send({
      message: 'Sent Notifications',
      pushNotifications: messages,
    });
  } catch (e) {
    console.log(e.message);
    res.status(500).send({
      message: 'Error Fetching Messages',
      error: e.message,
    });
  }
};
