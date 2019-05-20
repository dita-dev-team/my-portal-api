const express = require('express');
const router = express.Router();
const firebaseAdminController = require('../controller/firebase');
const notificationController = require('../controller/notification');
const userAuth = require('../controller/user-auth');
const {isTokenValid} = require('../auth/auth');
const excelController = require('../controller/excel');
const unitsController = require('../controller/units');
const outlookController = require('../controller/outlook');
const { fileParser } = require('express-multipart-file-parser')
const basicAuth = require('express-basic-auth');
const darajaAuth = require('../auth/daraja/daraja-api-auth');
const rawBodyOptions = {
    rawBodyOptions: {
      limit: '8mb',
    }
}
router.post('/client/access-token', userAuth.generateAccessToken);

router.post('/send', isTokenValid, firebaseAdminController.sendNotifications);
router.get('/fetch-all', isTokenValid, notificationController.fetchPushNotifications);
router.post('/fetch-by-email', isTokenValid, notificationController.fetchNotificationByEmailAddress);
router.post('/excel/upload', isTokenValid, fileParser(rawBodyOptions), excelController.uploadExcelFile);
router.get('/units', unitsController.getUnits);
router.post('/hooks', basicAuth({
    users: { 'admin': 'supersecret' }
}), outlookController.webHook);


router.get('/payments/auth',darajaAuth.generateApiAccessToken);
module.exports = router;