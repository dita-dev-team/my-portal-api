const admin = require('firebase-admin');
const settings = {timestampsInSnapshots: true}; // Handle issue https://github.com/firebase/firebase-js-sdk/issues/726
const db = admin.firestore();
db.settings(settings);
const messagesCollection = db.collection('messages');

exports.saveNotification = (email, title, body, topic, status) => {
    return messagesCollection.add({
        email: email,
        title: title,
        body: body, 
        topic: topic,
        status: status
    })
};

exports.fetchAllNotifications = () => {
    return messagesCollection.get()
};

exports.fetchNotificationsByEmail = (email) => {
    return messagesCollection.where('email', '==', email).get()
};