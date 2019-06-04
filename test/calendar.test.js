const request = require('supertest');
const expect = require('expect');
const server = require('../server');
const chai = require('chai');
const calendarEventsModel = require('../api/model/calendar-events');
const connectFirebase = require('./firebase');
const firebase = require('firebase');

afterEach(() => {
  server.close();
});

after(async () => {
  await calendarEventsModel.clearCalendarEvents();
});

let accessToken = null;

before(async () => {
  let email = process.env.TEST_EMAIL;
  let password = process.env.TEST_PASSWORD;
  connectFirebase();
  try {
    await firebase.auth().signInWithEmailAndPassword(email, password);
    accessToken = await firebase.auth().currentUser.getIdToken();
  } catch (error) {
    console.log(error);
  }
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
      .set('Authorization', 'Bearer ' + accessToken)
      .expect(404, done);
  });

  it('It should return (401) on missing access-token', done => {
    request(server)
      .post('/api/v1/events/add')
      .expect(401, done);
  });

  it('it should return (400) Bad Request on invalid request body', done => {
    request(server)
      .post('/api/v1/events/add')
      .set('Authorization', 'Bearer ' + accessToken)
      .send(invalidRequestBody)
      .expect(400, done);
  });
});

describe('Testing endpoints capabilities', () => {
  it('it should return (200) on successful adding of events', done => {
    request(server)
      .post('/api/v1/events/add')
      .set('Authorization', 'Bearer ' + accessToken)
      .send(validRequestBody)
      .expect(200, done);
  });

  it('it should return (200) on successful fetching of events', done => {
    request(server)
      .get('/api/v1/events')
      .set('Authorization', 'Bearer ' + accessToken)
      .expect(200, done);
  });
});
