const request = require('supertest');
const server = require('../server');
const database = require('../api/model/database');

let accessToken = null;

beforeEach(done => {
  let tokenRequestBody = {
    emailAddress: 'mtotodev05@gmail.com',
    uid: '885ffefef',
  };
  request(server)
    .post('/api/v1/client/access-token')
    .send(tokenRequestBody)
    .end((err, res) => {
      if (!err) {
        accessToken = res.body.token.accessToken;
        done();
      }
    });
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
