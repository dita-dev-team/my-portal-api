<br>
<div style="box-shadow: 0 12px 15px 0 rgba(0,0,0,0.24),0 17px 50px 0 rgba(0,0,0,0.19);"><c enter><img src="https://travis-ci.org/LearninNodeJs/Web-Server.svg?branch=master" alt="Form" /></center></a></div>
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
  ````
  
  
  api/v1/send
   
 {
   "messageTopic": "debug",
   "messageBody":"Test",
   "messageTitle": "Still a Test"
 } 
      
  