const firebase = require('firebase');
const _env = require('./env');

const connectFirebase = function() {
  if (!firebase.apps.length) {
    firebase.initializeApp({
      apiKey: _env.apiKey,
      authDomain: _env.authDomain,
      databaseURL: _env.databaseURL,
      projectId: _env.projectId,
      storageBucket: _env.storageBucket,
      messagingSenderId: _env.messagingSenderId,
    });
  }
};

module.exports = connectFirebase;
