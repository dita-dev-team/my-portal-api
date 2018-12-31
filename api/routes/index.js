const express = require('express');
const router = express.Router();
const firebaseAdminController = require('../controller/firebase');
const userAuth = require('../controller/user-auth');
const {isTokenValid} = require('../auth/auth');

router.post('/client/access-token',userAuth.generateAccessToken);

router.post('/send',isTokenValid,firebaseAdminController.sendNotifications);

module.exports = router;