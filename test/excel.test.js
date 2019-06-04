const request = require('supertest');
const server = require('../server');
const database = require('../api/model/database');
const connectFirebase = require('./firebase');
const firebase = require('firebase');

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

afterEach(() => {
  server.close();
});

after(async () => {
  await database.clearExamSchedule();
});

describe('Test Excel API calls', () => {
  it('a file must be uploaded', done => {
    request(server)
      .post('/api/v1/excel/upload')
      .set('Authorization', 'Bearer ' + accessToken)
      .expect(400, 'No files were uploaded.', done);
  });

  it('should not accept non excel files', done => {
    request(server)
      .post('/api/v1/excel/upload')
      .set('Authorization', 'Bearer ' + accessToken)
      .attach('excel', 'test/files/image.jpg')
      .expect(400, 'Invalid file type.', done);
  });

  it('should upload excel file successfully (xlsx)', done => {
    request(server)
      .post('/api/v1/excel/upload')
      .set('Authorization', 'Bearer ' + accessToken)
      .attach('excel', 'test/files/excel-new.xlsx')
      .expect(200, 'Success.', done);
  });

  it('should upload excel file successfully (xls)', done => {
    request(server)
      .post('/api/v1/excel/upload')
      .set('Authorization', 'Bearer ' + accessToken)
      .attach('excel', 'test/files/excel-new1.xls')
      .expect(200, 'Success.', done);
  });
});
