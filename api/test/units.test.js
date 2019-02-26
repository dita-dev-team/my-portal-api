const request = require('supertest');
const expect = require('expect');
const server = require('../../server');
let assert = require('chai').assert;



afterEach(() => {
    server.close();
});

describe('Test Unit API calls', () => {
    it('should return blank results', (done) => {
        assert.isTrue(false);
        done();
    });

    it('should return results with data', (done) => {
        assert.isTrue(false);
        done();
    });
});