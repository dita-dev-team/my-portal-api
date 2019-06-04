const request = require('supertest');
const server = require('../server');
const chai = require('chai');
const expect = chai.expect;
const database = require('../api/model/database');
chai.use(require('chai-like'));
chai.should();
chai.use(require('chai-things'));

afterEach(() => {
  server.close();
});

after(async () => {
  await database.clearExamSchedule();
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
