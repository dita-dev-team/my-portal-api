const fs = require('fs');
const sinon = require('sinon');
const auth = require('../api/auth/auth');
sinon.stub(auth, 'validateFirebaseToken').callsFake((req, res, next) => next());

const request = require('supertest');
const proxyquire = require('proxyquire').noCallThru();
const server = require('../server');

const firebase = require('@firebase/testing');

const email = 'test@gmail.com';
const uid = 'test';
const projectId = 'exam-timetable-test';
const rules = fs.readFileSync('firestore.rules', 'utf8');

function authedApp(auth) {
  return firebase.initializeTestApp({ projectId, auth }).firestore();
}

const database = proxyquire('../api/model/database', {
  '../api/model/abstract.database': authedApp({ uid: uid, email: email }),
  '@global': true,
});

before(async () => {
  await firebase.loadFirestoreRules({ projectId, rules });
});

after(async () => {
  await Promise.all(firebase.apps().map(app => app.delete()));
});

afterEach(() => {
  sinon.restore();
  server.close();
});

after(async () => {
  await database.clearExamSchedule();
});

describe('Test Excel API calls', () => {
  it('a file must be uploaded', done => {
    request(server)
      .post('/api/v1/excel/upload')
      .expect(400, 'No files were uploaded.', done);
  });

  it('should not accept non excel files', done => {
    request(server)
      .post('/api/v1/excel/upload')
      .attach('excel', 'test/files/image.jpg')
      .expect(400, 'Invalid file type.', done);
  });

  it('should upload excel file successfully (xlsx)', done => {
    request(server)
      .post('/api/v1/excel/upload')
      .attach('excel', 'test/files/excel-new.xlsx')
      .expect(200, 'Success.', done);
  });

  it('should upload excel file successfully (xls)', done => {
    request(server)
      .post('/api/v1/excel/upload')
      .attach('excel', 'test/files/excel-new1.xls')
      .expect(200, 'Success.', done);
  });
});

sinon.restore();
