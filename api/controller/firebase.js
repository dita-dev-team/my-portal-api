const messaging = require('firebase-admin').messaging();
const database = require('../model/database');

exports.sendNotifications = async (req, res, next) => {
  let payload = req.body;

  if (!(payload.messageBody && payload.messageTitle && payload.messageTopic)) {
    return res.status(400).send({
      message: 'Invalid Request Body',
    });
  }

  let messageTitle, messageBody, messageTopic;
  messageTitle = payload.messageTitle;
  messageBody = payload.messageBody;
  messageTopic = payload.messageTopic;

  let androidNotification = {
    android: {
      ttl: 3600 * 1000,
      priority: 'normal',
      notification: {
        title: messageTitle,
        body: messageBody,
        icon: 'stock_ticker_update',
        color: '#1D1124',
      },
      data: {
        title: messageTitle,
        body: messageBody,
      },
    },
    topic: messageTopic,
  };

  let logNotification = async function(email, title, body, topic, status) {
    // This function does nothing special, It just saves a notification to the db. This is just to avoid
    // nested try..catch statements
    try {
      let result = await database.saveNotification(
        email,
        title,
        body,
        topic,
        status,
      );
      console.log('Saved id: ', result.id);
    } catch (e) {
      console.log('Error Saving Records: ', e.message);
    }
  };

  try {
    let response = await messaging.send(androidNotification);
    // Save successful notification
    await logNotification(
      payload.emailAddress,
      messageTitle,
      messageBody,
      messageTopic,
      'success',
    );
    return res.status(200).send({
      message: 'Message Sent Successfully',
      messageBody: androidNotification,
      response,
    });
  } catch (e) {
    console.log(e.message);
    // Save failed notification
    await logNotification(
      payload.emailAddress,
      messageTitle,
      messageBody,
      messageTopic,
      'failed',
    );
    return res.status(500).send({
      message: 'Error Occurred While Sending Message',
      error: e.message,
    });
  }
};
