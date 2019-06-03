const moment = require('moment');
const db = require('./abstract.database');

const messagesCollection = db.collection('messages');
const examCollection = db.collection(
  process.env.NODE_ENV === 'test' ? 'exam_schedule_test' : 'exam_schedule',
);
const Utils = require('./utils/utils');

exports.saveNotification = (email, title, body, topic, status) => {
  return messagesCollection.add({
    email: email,
    title: title,
    body: body,
    topic: topic,
    status: status,
  });
};

exports.fetchAllNotifications = () => {
  return messagesCollection.get();
};

exports.fetchNotificationsByEmail = email => {
  return messagesCollection.where('email', '==', email).get();
};

exports.clearExamSchedule = () => {
  let utils = new Utils();
  let batchSize = 100;
  let query = examCollection.orderBy('__name__').limit(batchSize);
  return utils.deleteQueryBatch(db, query, batchSize);
};

exports.setExamSchedule = units => {
  let utils = new Utils();
  let chunks = utils.chunk(units, 100);
  const promises = [];
  for (let c of chunks) {
    promises.push(writeToDb(c));
  }
  return Promise.all(promises);
};

exports.getExamSchedule = async names => {
  let queries = names.map(name => {
    return examCollection
      .where('name', '==', name)
      .limit(1)
      .get();
  });
  let results = await Promise.all(queries);
  let data = results
    .filter(result => !result.empty)
    .map(result => result.docs[0].data());
  for (let item of data) {
    let temp = moment(item.date.toDate());
    item.date = temp.format('YYYY-MM-DD HH:mm:ss');
  }
  return data;
};

function writeToDb(array) {
  console.log(`Writing ${array.length} to firestore`);
  let batch = db.batch();
  for (const item of array) {
    let ref = examCollection.doc();
    batch.set(ref, item);
  }
  return batch.commit();
}
