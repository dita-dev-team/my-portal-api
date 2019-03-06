const express = require('express');
const router = express.Router();
const multer  = require('multer')
const firebaseAdminController = require('../controller/firebase');
const notificationController = require('../controller/notification');
const userAuth = require('../controller/user-auth');
const {isTokenValid} = require('../auth/auth');
const excelController = require('../controller/excel');
const unitsController = require('../controller/units');

const upload = multer({ storage: multer.memoryStorage() })

router.post('/client/access-token', userAuth.generateAccessToken);

router.post('/send', isTokenValid, firebaseAdminController.sendNotifications);
router.get('/fetch-all', isTokenValid, notificationController.fetchPushNotifications);
router.post('/fetch-by-email', isTokenValid, notificationController.fetchNotificationByEmailAddress);
router.post('/excel/upload', isTokenValid, upload.any(), excelController.uploadExcelFile);
router.get('/units', unitsController.getUnits);

module.exports = router;