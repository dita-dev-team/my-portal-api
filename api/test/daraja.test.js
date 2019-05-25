const request = require('supertest');
const expect = require('expect');
const server = require('../../server');
const chai = require('chai');
const assert = chai.expect;

chai.use(require('chai-like'));
chai.should();
chai.use(require('chai-things'));

afterEach(() => {
    server.close();
})

const validRequestBody = {
    amount: "200",
    accountReference: "Foca Dinner 2020",
    callBackURL: "https://security-node.herokuapp.com/api/v1/client/callback",
    description: "test",
    phoneNumber: "254718532419"
};

const invalidRequestBody = {
    amount: "200",
    accountReference: "Foca Dinner 2020",
    callBackURL: "https://security-node.herokuapp.com/api/v1/client/callback",
    description: "test",
};

const invalidRequestParameters = {
    amount: "200",
    accountReference: "Foca Dinner 2020",
    callBackURL: "https://security-node.herokuapp.com/api/v1/client/callback",
    description: "test",
    phoneNumber: "2547185319"

};

describe('Testing endpoints', () => {
    it('it should return (404) on invalid endpoints', (done) => {
        request(server)
            .get('/api/v1/process/payment')
            .expect(404, done);
    });

    it('it should return (400) on invalid/Bad request', (done) => {
        request(server)
            .post('/api/v1/process/payment')
            .send(invalidRequestBody)
            .expect(400)
            .end((err, res) => {
                if(err){
                    throw err;
                }
                assert(res.body.message).to.eql('Invalid Request Body');
                done();
            })

    });

    it('it should return (500) on invalid parameters -> invalid Phonenumber', (done) => {
        request(server)
            .post('/api/v1/process/payment')
            .send(invalidRequestParameters)
            .expect(500)
            .end((err, res) => {
                if (err) {
                    throw err;
                }
                assert(res.body.message).to.eql('Internal Server Error');
                assert(res.body.errorMessage).to.eql('Bad Request - Invalid PhoneNumer');
                assert(res.body.errorCode).to.eql("400.002.02");
                done();
            })
    });


    /*
    @Params
    * Note: This test will occasionally fail, and return 500 error code instead of 200. This is because of the highly unstable status
    * of the Daraja Sandbox API. If Travis CI fails, rebuild tests from the travis Dashboard.
    * */
    it('it should return (200) on successful transaction processing', (done) => {
        request(server)
            .post('/api/v1/process/payment')
            .send(validRequestBody)
            .expect(200)
            .end((err, res) => {
                if(err){
                    throw err;
                }
                assert(res.body.responseCode).to.eql("0");
                assert(res.body.transactionStatus).to.eql("Success. Request accepted for processing");
                done();
            })
    })
});

