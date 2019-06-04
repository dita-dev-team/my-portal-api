const request = require('supertest');
const expect = require('expect');
const server = require('../server');
let assert = require('chai').assert;
let messagesModel = require('../api/model/database');
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
    await messagesModel.clearMessagesDatabase();
})

describe('/Testing API Calls', () => {
    it('it should not post data with invalid request body', done => {
        let invalidNotificationBody = {
            messageTopic: 'debug',
            messageTitle: 'test',
            //The Message Body Left Out Intentionally
        };
        request(server)
            .post('/api/v1/send')
            .set('Authorization', 'Bearer ' + accessToken)
            .send(invalidNotificationBody)
            .expect(400, done);
    });
});

describe('/Should Post Correct Data', () => {
    it('it should send notification on valid request body', done => {
        let validRequestBody = {
            messageTopic: 'debug',
            messageTitle: 'test',
            messageBody: 'passed test case',
            emailAddress: 'test@gmail.com',
        };
        request(server)
            .post('/api/v1/send')
            .set('Authorization', 'Bearer ' + accessToken)
            .send(validRequestBody)
            .expect(200, done);
    });
});

describe('/Non-Existent Endpoints', () => {
    it('it should reject non-existent endpoints', done => {
        request(server)
            .get('/api/v1/send')
            .expect(404, done);
    });
});

describe('/Fetch All Notifications', () => {
    it('it should fetch all push Notifications', done => {
        request(server)
            .get('/api/v1/fetch-all')
            .set('Authorization', 'Bearer ' + accessToken)
            .expect(200, done);
    });
});

describe('Fetch Notification With Email', () => {
    let requestBody = {
        emailAddress: 'test@gmail.com',
    };
    it('it should fetch all push notifications by email addresses', done => {
        request(server)
            .post('/api/v1/fetch-by-email')
            .set('Authorization', 'Bearer ' + accessToken)
            .send(requestBody)
            .expect(200, done);
    });
});

describe('Should return null on non-existent email addresses', () => {
    let requestBody = {
        emailAddress: 'kamaubrian@gmail.com',
    };
    it('it should return 404 on null push notifications', done => {
        request(server)
            .post('/api/v1/fetch-by-email')
            .set('Authorization', 'Bearer ' + accessToken)
            .send(requestBody)
            .expect(404, done);
    });
});

describe('should not send on invalid request body ', () => {
    let requestBody = {
        emailAddres: 'mtotodev05@gmail.com',
    };
    it('it should invalid request body error', done => {
        request(server)
            .post('/api/v1/fetch-by-email')
            .set('Authorization', 'Bearer ' + accessToken)
            .send(requestBody)
            .expect(401, done);
    });
});
describe('should not send without valid accessToken', () => {
    let requestBody = {
        emailAddress: 'mtotodev05@gmail.com',
    };
    let invalidAccessToken = 'avsdeg';

    it('should reject request', done => {
        request(server)
            .post('/api/v1/fetch-by-email')
            .set('Authorization', 'Bearer ' + invalidAccessToken)
            .send(requestBody)
            .expect(401, done);
    });
});
