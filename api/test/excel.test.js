const request = require('supertest');
const expect = require('expect');
const server = require('../../server');
const assert = require('chai').assert;



afterEach(() => {
    server.close();
});

describe('Test Excel API calls', () => {
    it('should not accept non excel files', (done) => {
        assert.isTrue(false);
        done();
    });

    it('should upload excel file successfully', (done) => {
        assert.isTrue(false);
        done();
    });
});