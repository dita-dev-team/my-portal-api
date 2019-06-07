const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
require('dotenv').config();

let JWT_SECRET;
try {
  const functions = require('firebase-functions');
  JWT_SECRET = functions.config().jwt.key;
} catch (e) {
  JWT_SECRET = process.env.JWT_SECRET;
}

let isTokenValid = (req, res, next) => {
  let token = req.headers['x-access-token'] || req.headers['authorization'];
  if (token === undefined) {
    return res.status(401).send({
      message: 'Action Not Authorized, No Access Token Provided',
      success: false,
    });
  }
  if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length);
  }
  if (token) {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).send({
          message: 'Invalid Access Token, Unauthorized',
          success: false,
        });
      }
      req.decoded = decoded;
      next();
    });
  } else {
    return res.status(401).send({
      message: 'Action Not Authorized, No Access Token Provided',
      success: false,
    });
  }
};

const authFailedRes = {
  message: 'Authentication failed',
  success: false,
};

let validateFirebaseToken = async (req, res, next) => {
  console.log('Check if request is authorized with Firebase ID token');

  if (
    (!req.headers.authorization ||
      !req.headers.authorization.startsWith('Bearer ')) &&
    !(req.cookies && req.cookies.__session)
  ) {
    console.error(
      'No Firebase ID token was passed as a Bearer token in the Authorization header.',
      'Make sure you authorize your request by providing the following HTTP header:',
      'Authorization: Bearer <Firebase ID Token>',
      'or by passing a "__session" cookie.',
    );
    res.status(401).send(authFailedRes);
    return;
  }

  let idToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    console.log('Found "Authorization" header');
    // Read the ID Token from the Authorization header.
    idToken = req.headers.authorization.split('Bearer ')[1];
  } else if (req.cookies) {
    console.log('Found "__session" cookie');
    // Read the ID Token from cookie.
    idToken = req.cookies.__session;
  } else {
    // No cookie
    res.status(401).send(authFailedRes);
    return;
  }

  try {
    const decodedIdToken = await admin.auth().verifyIdToken(idToken);
    console.log('ID Token correctly decoded', decodedIdToken);
    req.user = decodedIdToken;
    next();
    return;
  } catch (error) {
    console.error('Error while verifying Firebase ID token:', error);
    res.status(401).send(authFailedRes);
    return;
  }
};

module.exports = {
  isTokenValid: isTokenValid,
  validateFirebaseToken: validateFirebaseToken,
};
