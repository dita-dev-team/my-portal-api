const firebaseAdmin = require('firebase-admin');
const databaseSettings = { timestampsInSnapshots: true };
const database = firebaseAdmin.firestore();
database.settings(databaseSettings);

module.exports = database;
