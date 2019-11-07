const fs = require('fs');
const request = require('supertest');
const expect = require('expect');
const proxyquire = require('proxyquire').noCallThru();
let assert = require('chai').assert;
const sinon = require('sinon');
const firebase = require('@firebase/testing');

const email = 'test@gmail.com';
const uid = 'test';
const projectId = 'exam-timetable-test';
const rules = fs.readFileSync('firestore.rules', 'utf8');

const auth = { uid: uid, email: email };
firebase.initializeTestApp({ projectId, auth });

// function authedApp(auth) {
//   return firebase.initializeTestApp({ projectId, auth }).firestore();
// }

const messages = [
  {
    email: 'test@gmail.com',
    title: 'test',
    body: 'some test',
    topic: 'some topic',
    status: 'some status',
  },
];

let server;

before(async () => {
  await firebase.loadFirestoreRules({ projectId, rules });
});

afterEach(() => {
  sinon.restore();
  server.close();
});

after(async () => {
  await Promise.all(firebase.apps().map(app => app.delete()));
});

describe('/Testing API Calls', () => {
  it('it should not post data with invalid request body', done => {
    let invalidNotificationBody = {
      messageTopic: 'debug',
      messageTitle: 'test',
      //The Message Body Left Out Intentionally
    };
    const auth = require('../api/auth/auth');
    sinon
      .stub(auth, 'validateFirebaseToken')
      .callsFake((req, res, next) => next());
    server = require('../server');
    request(server)
      .post('/api/v1/send')
      .send(invalidNotificationBody)
      .expect(400, done);
  });
});

describe('/Should Post Correct Data', () => {
  it('it should send notification on valid request body', done => {
    let validRequestBody = {
      messageTopic: 'debug',
      messageTitle: 'test',
      messageBody: 'passed test case',
      emailAddress: 'test@gmail.com',
    };
    const messaging = require('firebase-admin').messaging();
    sinon.stub(messaging, 'send').returns({});
    const auth = require('../api/auth/auth');
    sinon
      .stub(auth, 'validateFirebaseToken')
      .callsFake((req, res, next) => next());
    const db = require('../api/model/database');
    sinon.stub(db, 'saveNotification').returns({ id: '1234' });
    server = require('../server');
    request(server)
      .post('/api/v1/send')
      .send(validRequestBody)
      .expect(200, done);
  });
});

describe('/Non-Existent Endpoints', () => {
  it('it should reject non-existent endpoints', done => {
    request(server)
      .get('/api/v1/send')
      .expect(404, done);
  });
});

describe('/Fetch All Notifications', () => {
  it('it should fetch all push Notifications', done => {
    const auth = require('../api/auth/auth');
    sinon
      .stub(auth, 'validateFirebaseToken')
      .callsFake((req, res, next) => next());
    const db = require('../api/model/database');
    sinon.stub(db, 'fetchAllNotifications').returns(messages);
    server = require('../server');
    request(server)
      .get('/api/v1/fetch-all')
      .expect(200, done);
  });
});

describe('Fetch Notification With Email', () => {
  let requestBody = {
    emailAddress: 'test@gmail.com',
  };
  it('it should fetch all push notifications by email addresses', done => {
    const auth = require('../api/auth/auth');
    sinon
      .stub(auth, 'validateFirebaseToken')
      .callsFake((req, res, next) => next());
    const db = require('../api/model/database');
    sinon.stub(db, 'fetchNotificationsByEmail').returns(messages);
    server = require('../server');
    request(server)
      .post('/api/v1/fetch-by-email')
      .send(requestBody)
      .expect(200, done);
  });
});

describe('Should return null on non-existent email addresses', () => {
  let requestBody = {
    emailAddress: 'kamaubrian@gmail.com',
  };
  it('it should return 404 on null push notifications', done => {
    const auth = require('../api/auth/auth');
    sinon
      .stub(auth, 'validateFirebaseToken')
      .callsFake((req, res, next) => next());
    const db = require('../api/model/database');
    sinon.stub(db, 'fetchNotificationsByEmail').returns([]);
    server = require('../server');
    request(server)
      .post('/api/v1/fetch-by-email')
      .send(requestBody)
      .expect(404, done);
  });
});

describe('should not send on invalid request body ', () => {
  let requestBody = {
    emailAddres: 'mtotodev05@gmail.com',
  };
  it('it should invalid request body error', done => {
    const auth = require('../api/auth/auth');
    sinon
      .stub(auth, 'validateFirebaseToken')
      .callsFake((req, res, next) => next());
    server = require('../server');
    request(server)
      .post('/api/v1/fetch-by-email')
      .send(requestBody)
      .expect(400, done);
  });
});
