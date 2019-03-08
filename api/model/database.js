const admin = require('firebase-admin');
const moment = require('moment');
const settings = {timestampsInSnapshots: true}; // Handle issue https://github.com/firebase/firebase-js-sdk/issues/726
const db = admin.firestore();
db.settings(settings);
const messagesCollection = db.collection('messages');
const examCollection = db.collection(process.env.NODE_ENV === 'test' ? 'exam_schedule_test' : 'exam_schedule')

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

exports.clearExamSchedule = () => {
    let batchSize = 100;
    let query = examCollection.orderBy('__name__').limit(batchSize);
    return deleteQueryBatch(db, query, batchSize)
}

exports.setExamSchedule = (units) => {
    let chunks = chunk(units, 100);
    const promises = []
    for (let c of chunks) {
        promises.push(writeToDb(c));
    }
    return Promise.all(promises);
}

exports.getExamSchedule = async (names, shift) => {
    let queries = names.map(name => {
        return examCollection.where('name', '==', name)
                             .where('shift', '==', shift)
                             .limit(1)
                             .get()
    })
    let results = await Promise.all(queries);
    let data = results.filter(result => !result.empty)
                      .map(result => result.docs[0].data())
    for(let item of data) {
        let temp = moment(item.date.toDate());
        item.date = temp.format('YYYY-MM-DD HH:mm:ss')
    }
    return data;
}
  
async function deleteQueryBatch(db, query, batchSize) {
    let snapshot = await query.get();
    if (!snapshot.size || snapshot.size === 0) {
        return 0;
    }

    let batch = db.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });

    snapshot = await batch.commit();
    
    let numDeleted = snapshot.size;
    if (numDeleted === 0) {
        return;
    }

    process.nextTick(() => {
        deleteQueryBatch(db, query, batchSize);
    })
}

function writeToDb(array) {
    console.log(`Writing ${array.length} to firestore`);
    let batch = db.batch();
    for (const item of array) {
        let ref = examCollection.doc();
        batch.set(ref, item);    
    }
    return batch.commit();
}

function chunk(array, size) {
    // To avoid sending too much data to firebase during tests
    if (process.env.NODE_ENV === 'test') {
        return [array.slice(0, 10)]
    }

    const chunked_arr = [];
    let index = 0;
    while (index < array.length) {
      chunked_arr.push(array.slice(index, size + index));
      index += size;
    }

    return chunked_arr;
}