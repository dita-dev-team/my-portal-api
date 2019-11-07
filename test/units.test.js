const fs = require('fs');
const request = require('supertest');
const server = require('../server');
const proxyquire = require('proxyquire').noCallThru();
const chai = require('chai');
const expect = chai.expect;

chai.use(require('chai-like'));
chai.should();
chai.use(require('chai-things'));

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

afterEach(() => {
  server.close();
});

after(async () => {
  await Promise.all(firebase.apps().map(app => app.delete()));
});

describe('Test Unit API calls', () => {
  before(async () => {
    units = [
      {
        name: 'AAA-111A',
        shift: 'athi',
        date: new Date(),
        room: 'LR14',
      },
    ];
    await database.setExamSchedule(units);
  });
  it('should return status 400', done => {
    request(server)
      .get('/api/v1/units')
      .expect(400, 'Missing query args.', done);
  });

  it('should return blank results', done => {
    request(server)
      .get('/api/v1/units')
      .query({ shift: 'athi', names: 'a, b, c' })
      .expect(200)
      .end((err, res) => {
        if (err) {
          //
        }
        expect(res.body.results).to.eql([]);
        done();
      });
  });

  it('should return results with data', done => {
    request(server)
      .get('/api/v1/units')
      .query({ shift: 'athi', names: 'AAA-111A' })
      .expect(200)
      .end((err, res) => {
        if (err) {
          //
        }
        // expect(res.body).to.eql([]);
        res.body.results.should.contain.a.thing.with.property(
          'name',
          'AAA-111A',
        );
        done();
      });
  });
});
