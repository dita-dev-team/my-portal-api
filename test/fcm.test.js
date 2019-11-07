const fs = require('fs');
const sinon = require('sinon');
const auth = require('../api/auth/auth');
sinon.stub(auth, 'validateFirebaseToken').callsFake((req, res, next) => next());
const request = require('supertest');
const server = require('../server');
const expect = require('expect');
const proxyquire = require('proxyquire').noCallThru();
let assert = require('chai').assert;
const firebase = require('@firebase/testing');

const email = 'test@gmail.com';
const uid = 'test';
const projectId = 'exam-timetable-test';
const rules = fs.readFileSync('firestore.rules', 'utf8');

function authedApp(auth) {
  return firebase.initializeTestApp({ projectId, auth }).firestore();
}

proxyquire('../api/model/database', {
  './abstract.database': authedApp({ uid: uid, email: email }),
  '@global': true,
});

const messages = [
  {
    email: 'test@gmail.com',
    title: 'test',
    body: 'some test',
    topic: 'some topic',
    status: 'some status',
  },
];

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
    request(server)
      .post('/api/v1/send')
      .send(invalidNotificationBody)
      .expect(400, done);
  });

  it('it should send notification on valid request body', done => {
    let validRequestBody = {
      messageTopic: 'debug',
      messageTitle: 'test',
      messageBody: 'passed test case',
      emailAddress: 'test@gmail.com',
    };
    const messaging = require('firebase-admin').messaging();
    sinon.stub(messaging, 'send').returns('Notification sent');
    request(server)
      .post('/api/v1/send')
      .send(validRequestBody)
      .expect(200, done);
  });

  it('it should reject non-existent endpoints', done => {
    request(server)
      .get('/api/v1/send')
      .expect(404, done);
  });

  it('it should fetch all push Notifications', done => {
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
    request(server)
      .post('/api/v1/fetch-by-email')
      .send(requestBody)
      .expect(200, done);
  });
});

describe('should not send on invalid request body ', () => {
  let requestBody = {
    emailAddres: 'mtotodev05@gmail.com',
  };
  it('it should invalid request body error', done => {
    request(server)
      .post('/api/v1/fetch-by-email')
      .send(requestBody)
      .expect(400, done);
  });
});

sinon.restore();
