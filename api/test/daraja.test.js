const request = require('supertest');
const expect = require('expect');
const server = require('../../server');
const chai = require('chai');
const ticketModel = require('../model/ticket-payment.model');
const assert = chai.expect;

chai.use(require('chai-like'));
chai.should();
chai.use(require('chai-things'));

afterEach(() => {
    server.close();
});

after(async () => {
    await ticketModel.clearPaymentsCollection();
    await ticketModel.clearFailedPaymentsCollection();
});

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

let successfulTransactionRequestBody = {
    Body: {
        stkCallback: {
            MerchantRequestID: "25594-4987038-1",
            CheckoutRequestID: "ws_CO_DMZ_357868396_26052019204024858",
            ResultCode: 0,
            ResultDesc: "The service request is processed successfully.",
            CallbackMetadata: {
                Item: [
                    {
                        Name: "Amount",
                        Value: 1
                    },
                    {
                        Name: "MpesaReceiptNumber",
                        Value: "NEQ36SSCL3"
                    },
                    {
                        Name: "Balance"
                    },
                    {
                        Name: "TransactionDate",
                        Value: 20190526204034
                    },
                    {
                        Name: "PhoneNumber",
                        Value: 254718532419
                    }
                ]
            }
        }
    }
};

let insufficientBalanceRequestBody = {
    Body: {
        stkCallback: {
            MerchantRequestID: "15093-2263932-1",
            CheckoutRequestID: "ws_CO_DMZ_357874748_26052019204553539",
            ResultCode: 1,
            ResultDesc: "[MpesaCB - ]The balance is insufficient for the transaction."
        }
    }
};

let cancelledTransactionRequestBody = {
    Body: {
        stkCallback: {
            MerchantRequestID: "18131-4426383-1",
            CheckoutRequestID: "ws_CO_DMZ_496331003_26052019204908097",
            ResultCode: 1032,
            ResultDesc: "[STK_CB - ]Request cancelled by user"
        }
    }
};

describe('Testing Daraja Api endpoints', () => {
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
                if (err) {
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
                if (err) {
                    throw err;
                }
                assert(res.body.responseCode).to.eql("0");
                assert(res.body.transactionStatus).to.eql("Success. Request accepted for processing");
                done();
            })
    });

});

describe('Testing Daraja\'s Callback Endpoint', () => {

    it('it should return (400) Bad request on missing query params', (done) => {
        request(server)
            .post('/api/v1/process/callback')
            .send(successfulTransactionRequestBody)
            .expect(400, done);

    });

    it('it should return (200) on valid, successful transaction', (done) => {
        request(server)
            .post('/api/v1/process/callback')
            .query({deviceId: '5cd8182wfh', eventId: '3ds8798ewf', admissionNumber: '15-1005'})
            .send(successfulTransactionRequestBody)
            .expect(200, done);
    });

    it('it should return (200) on valid, unsuccessful transaction(Insufficient Balance)', (done) => {
        request(server)
            .post('/api/v1/process/callback')
            .query({deviceId: '5cd8182wfh', eventId: '3ds8798ewf', admissionNumber: '15-1005'})
            .send(insufficientBalanceRequestBody)
            .expect(200, done);
    });

    it('it should return (200) on valid, unsuccessful transaction(Cancelled Transaction)', (done) => {
        request(server)
            .post('/api/v1/process/callback')
            .query({deviceId: '5cd8182wfh', eventId: '3ds8798ewf', admissionNumber: '15-1005'})
            .send(cancelledTransactionRequestBody)
            .expect(200, done);
    });

})

