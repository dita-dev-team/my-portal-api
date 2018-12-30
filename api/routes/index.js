const express = require('express');
const router = express.Router();
const firebaseAdminController = require('../controller/firebase');

router.post('/send',firebaseAdminController.sendNotifications);

module.exports = router;