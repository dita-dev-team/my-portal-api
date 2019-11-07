const database = require('./abstract.database');
let parentCollection = database.collection('calendar');
const Utils = require('./utils/utils');

exports.fetchCalendarEvents = async () => {
  try {
    const parentDoc = parentCollection.doc('eventspath');
    if (parentDoc === undefined) {
      return [];
    }
    return await parentDoc.collection('events').get();
  } catch (e) {
    console.error('Error Fetching Calendar Events', e.message);
  }
};

exports.addCalendarEvents = async (description, startDate, endDate) => {
  try {
    return await parentCollection
      .doc('eventspath')
      .collection('events')
      .add({
        description: description,
        start_date: startDate,
        end_date: endDate,
      });
  } catch (e) {
    console.error('Error Adding Calendar Events', e.message);
  }
};

exports.clearCalendarEvents = () => {
  let utils = new Utils();
  let batchSize = 100;
  let query = parentCollection
    .doc('eventspath')
    .collection('events')
    .orderBy('start_date')
    .limit(batchSize);
  return utils.deleteQueryBatch(database, query, batchSize);
};
