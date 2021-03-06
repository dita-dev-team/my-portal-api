const moment = require('moment');
const db = require('./abstract.database');

const messagesCollection = db.collection('messages');
const examCollection = db.collection('exam_schedule');
const Utils = require('./utils/utils');

exports.saveNotification = async (email, title, body, topic, status) => {
  return await messagesCollection.add({
    email: email,
    title: title,
    body: body,
    topic: topic,
    status: status,
  });
};

exports.clearMessagesDatabase = () => {
  let utils = new Utils();
  let batchSize = 100;
  let query = messagesCollection.orderBy('email').limit(batchSize);
  return utils.deleteQueryBatch(db, query, batchSize);
};

exports.fetchAllNotifications = async () => {
  return (await messagesCollection.get().docs) || [];
};

exports.fetchNotificationsByEmail = async email => {
  return (
    (await messagesCollection.where('email', '==', email).get().docs) || []
  );
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
    return (
      examCollection
        .where('name', '==', name)
        // .limit(1)
        .get()
    );
  });
  let data = [];
  let results = await Promise.all(queries);
  results = results.filter(result => !result.empty);
  for (let result of results) {
    result.forEach(doc => {
      let item = doc.data();
      let temp = moment(item.date.toDate());
      item.date = temp.format('YYYY-MM-DD HH:mm:ss');
      data.push(item);
    });
  }
  // let data = results
  //   .filter(result => !result.empty)
  //   .map(result => result.docs[0].data());
  // for (let item of data) {
  //   let temp = moment(item.date.toDate());
  //   item.date = temp.format('YYYY-MM-DD HH:mm:ss');
  // }
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
