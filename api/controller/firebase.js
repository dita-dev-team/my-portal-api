const firebaseAdmin = require('firebase-admin');

exports.sendNotifications = function(req,res,next){
    let _this = req.body;

    if(!(_this.messageBody && _this.messageTitle && _this.messageTopic)){
        return res.status(400).send({
            message: 'Invalid Request Body'
        })
    }

    let messageTitle, messageBody, messageTopic;
    messageTitle = _this.messageTitle;
    messageBody = _this.messageBody;
    messageTopic = _this.messageTopic;

  let messageNotification = {
      data:{
          score: messageTitle,
          time: messageBody
      },
      topic: messageTopic
  };
  firebaseAdmin.messaging().send(messageNotification)
      .then(response=>{
          return res.status(200).send({
              message:'Message Sent Successfully',
              messageBody:messageNotification,
              response
          })
      })
      .catch(error=>{
          console.log(error.message);
         return res.status(500)
             .send({
                 message:'Error Occured While Sending Message',
                 error: error.message
             })
      });
};