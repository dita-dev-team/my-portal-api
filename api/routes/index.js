const express = require('express');
const router = express.Router();
const firebaseAdminController = require('../controller/firebase');
const notificationController = require('../controller/notification');
const userAuth = require('../controller/user-auth');
const {isTokenValid} = require('../auth/auth');

router.post('/client/access-token', userAuth.generateAccessToken);

router.post('/send', isTokenValid, firebaseAdminController.sendNotifications);
router.get('/fetch-all', isTokenValid, notificationController.fetchPushNotifications);
router.post('/fetch-by-email', isTokenValid, notificationController.fetchNotificationByEmailAddress);

module.exports = router;