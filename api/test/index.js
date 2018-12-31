const request  = require('supertest');
const expect = require('expect');
const server = require('../../server');
let assert = require('chai').assert;

describe('/Testing API Calls',()=>{
   it('it should not post data with invalid request body',(done)=>{
     setTimeout(done,1000);
     let invalidNotificationBody = {
       messageTopic: 'debug',
       messageTitle: 'test'
       //The Message Body Left Out Intentionally
     };
     request(server)
         .post('/api/v1/send')
         .send(invalidNotificationBody)
         .expect(400)
         .end((err,res)=>{
             if(err){
                  done(err);
             }
             done();
         })
   });
});
describe('/Should Post Correct Data',()=>{
    it('it should send notification on valid request body',(done)=>{
        setTimeout(done,1000);
        let validRequestBody = {
            messageTopic: 'debug',
            messageTitle: 'test',
            messageBody: 'passed test case'
        };
        request(server)
            .post('/api/v1/send')
            .send(validRequestBody)
            .expect(200)
            .end((err,res)=>{
                if(err){
                    done(err);
                }
                res.should.have.status(200);
                done();
            })
    })
});
describe('/Non-Existent Endpoints',()=>{
   it('it should reject non-existent endpoints',(done)=>{
     setTimeout(done,1000);
     request(server)
         .get('/api/v1/send')
         .expect(404)
         .end((err,res)=>{
             if(err){
                 done();
                 throw err;
             }

             done();
         })
   });
});

