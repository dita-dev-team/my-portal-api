const jwt = require('jsonwebtoken');
require('dotenv').config();

let isTokenValid = (req,res,next)=>{
  let token = req.headers['x-access-token'] || req.headers['authorization'];
  if(token.startsWith('Bearer ')){
      token = token.slice(7,token.length);
  }
  if(token){
      jwt.verify(token,process.env.JWT_SECRET,(err,decoded)=>{
          if(err){
              return res.status(401).send({
                  message: 'Invalid Access Token, Unauthorized',
                  success: false
              });
          }
          req.decoded = decoded;
          next();
      });
  }else{
      return res.status(401).send({
          message: 'Action Not Authorized, No Access Token Provided',
          success: false
      });
  }
};
module.exports = {
    isTokenValid: isTokenValid
};