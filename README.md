[![Build Status](https://travis-ci.org/dita-dev-team/my-portal-api.svg?branch=master)](https://travis-ci.org/dita-dev-team/my-portal-api)

**Setup Instructions**

```
1. Under Folder api, Create a subdirectory named config

2. Download the json api key file from firebase and 
   place it in the above created subdirectory

3. npm install

4. Run npm start   
```
**Available Endpoints**
```
/api/v1/client/access-token - Generates AccessToken

/api/v1/send - Sends FCM Message


```

**Sample Request Body**
```
  
  
  api/v1/send
   
 {
   "messageTopic": "debug",
   "messageBody":"Test",
   "messageTitle": "Still a Test"
 } 
 ```
 
 **Running Tests**
```
npm test
```
To run all tests
```
npm run test-single test/parser.test.js
```
To run a single test.
