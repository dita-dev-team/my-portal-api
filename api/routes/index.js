const express = require('express');
const router = express.Router();
const firebaseAdminController = require('../controller/firebase');
const notificationController = require('../controller/notification');
const userAuth = require('../controller/user-auth');
const { validateFirebaseToken } = require('../auth/auth');
const excelController = require('../controller/excel');
const unitsController = require('../controller/units');
const outlookController = require('../controller/outlook');
const { fileParser } = require('express-multipart-file-parser');
const basicAuth = require('express-basic-auth');
const darajaAuth = require('../auth/daraja/daraja-api-auth');
const darajaController = require('../controller/LipaNaMpesaHandler');
const callBackController = require('../controller/daraja/callback');
const calendarEventsController = require('../controller/events');
const rawBodyOptions = {
  rawBodyOptions: {
    limit: '8mb',
  },
};
router.post('/client/access-token', userAuth.generateAccessToken);

router.post(
  '/send',
  validateFirebaseToken,
  firebaseAdminController.sendNotifications,
);
router.get(
  '/fetch-all',
  validateFirebaseToken,
  notificationController.fetchPushNotifications,
);
router.post(
  '/fetch-by-email',
  validateFirebaseToken,
  notificationController.fetchNotificationByEmailAddress,
);
router.post(
  '/excel/upload',
  validateFirebaseToken,
  fileParser(rawBodyOptions),
  excelController.uploadExcelFile,
);
router.get('/units', unitsController.getUnits);
router.post(
  '/hooks',
  basicAuth({
    users: { admin: 'supersecret' },
  }),
  outlookController.webHook,
);

router.get('/payments/auth', darajaAuth.generateApiAccessToken);

router.post(
  '/process/payment',
  darajaController.initiateRequest,
  darajaAuth.generateApiAccessToken,
  darajaController.processTransaction,
);
router.post('/process/callback', callBackController.loadTransactionCallBack);
router.get(
  '/events',
  validateFirebaseToken,
  calendarEventsController.fetchEvents,
);
router.post(
  '/events/add',
  validateFirebaseToken,
  calendarEventsController.addCalendarEvents,
);
module.exports = router;
