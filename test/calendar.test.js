const fs = require('fs');
const sinon = require('sinon');
const auth = require('../api/auth/auth');
sinon.stub(auth, 'validateFirebaseToken').callsFake((req, res, next) => next());

const request = require('supertest');
const expect = require('expect');
const server = require('../server');
const chai = require('chai');
const proxyquire = require('proxyquire').noCallThru();

const firebase = require('@firebase/testing');

const email = 'test@gmail.com';
const uid = 'test';
const projectId = 'exam-timetable-test';
const rules = fs.readFileSync('firestore.rules', 'utf8');

function authedApp(auth) {
  return firebase.initializeTestApp({ projectId, auth }).firestore();
}

const db = authedApp({ uid: uid, email: email });

proxyquire('../api/model/calendar-events', {
  './abstract.database': db,
  '@global': true,
});

before(async () => {
  await firebase.loadFirestoreRules({ projectId, rules });
});

after(async () => {
  await Promise.all(firebase.apps().map(app => app.delete()));
});

afterEach(() => {
  server.close();
});

const validRequestBody = {
  startDate: 'March 15, 2019 at 12:00:00 AM UTC+3',
  endDate: 'March 15, 2019 at 12:00:00 AM UTC+3',
  description: 'Announcement and installation of ECD',
};

const invalidRequestBody = {
  startDate: 'March 15, 2019 at 12:00:00 AM UTC+3',
  endDate: 'March 15, 2019 at 12:00:00 AM UTC+3',
};

describe('Testing Calendar Events endpoints', () => {
  it('it should return (404) on invalid not found endpoint', done => {
    request(server)
      .get('/api/v1/events/ad')
      .expect(404, done);
  });

  it('it should return (400) Bad Request on invalid request body', done => {
    request(server)
      .post('/api/v1/events/add')
      .send(invalidRequestBody)
      .expect(400, done);
  });
});

describe('Testing endpoints capabilities', () => {
  it('it should return (200) on successful adding of events', done => {
    request(server)
      .post('/api/v1/events/add')
      .send(validRequestBody)
      .expect(200, done);
  });

  it('it should return (200) on successful fetching of events', done => {
    request(server)
      .get('/api/v1/events')
      .expect(200, done);
  });
});

sinon.restore();
