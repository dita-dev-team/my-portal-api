const moment = require('moment');
const DarajaHelper = require('../controller/daraja/helper');
require('dotenv').config();

exports.initiateRequest = async (req, res, next) => {
  let _this = req.body;
  if (
    !_this.amount ||
    !_this.phoneNumber ||
    !_this.callBackURL ||
    !_this.accountReference ||
    !_this.description
  ) {
    return res.status(400).send({
      message: 'Invalid Request Body',
      requestBody: {
        amount: 'Amount you wish to transact',
        phoneNumber: 'Phonenumber of the Customer',
        callBackURL: 'Endpoint to which to dump the transaction result',
        accountReference: 'Paybill Account Reference',
        description: 'Transaction Description',
      },
    });
  }
  let BusinessShortCode = await process.env.PAYBILL_SHORTCODE;
  let timeStamp = await moment().format('YYYYMMDDHHmmss');
  let rawPassword =
    BusinessShortCode + process.env.AUTHENTICATION_KEY + timeStamp;

  req.mpesaTransaction = {
    BusinessShortCode: BusinessShortCode,
    Password: Buffer.from(rawPassword).toString('base64'),
    Timestamp: timeStamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: _this.amount,
    PartyA: _this.phoneNumber,
    PartyB: BusinessShortCode,
    PhoneNumber: _this.phoneNumber,
    CallBackURL: _this.callBackURL,
    AccountReference: _this.accountReference,
    TransactionDesc: _this.description,
  };
  next();
};

exports.processTransaction = async (req, res, next) => {
  let darajaHelper = new DarajaHelper();
  darajaHelper.sendTransactionToDaraja(
    {
      url: process.env.SAFARICOM_DARAJA_PROCESS_REQUEST_STK,
      auth: 'Bearer ' + req.accessToken,
      transaction: req.mpesaTransaction,
    },
    req,
    res,
    next,
  );
};
