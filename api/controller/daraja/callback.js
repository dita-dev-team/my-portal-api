const moment = require('moment');
const paymentModel = require('../../model/ticket-payment.model');

exports.loadTransactionCallBack = async (req, res, next) => {
    /*
       * Result Code Meaning
       *  0 - Success
       * 1032 - Transaction Cancelled by User
       * 1 - Insufficient Balance.
       * @params- username (student name)
       * @params- eventId
       * @params-
       * */
    try {
        console.log(JSON.stringify(req.body));
        let transactionStatusCode = req.body.Body.stkCallback.ResultCode;
        switch (transactionStatusCode) {
            case 0:
                console.log("Transaction successful");
                paymentModel.savePaymentTransaction(
                    "15-1659",
                    "3a-457ib",
                    "NB5FE875FE",
                    "200",
                    "Success",
                    moment().format()
                );
                break;

            case 1032:
                console.log("Transaction cancelled by the user");
                break;

            case 1:
                console.log("Insufficient balance");
                break;

            default:
                console.log("Transaction processing");
                break;
        }
        console.log(transactionStatusCode);
        var message = {
            "ResponseCode": "00000000",
            "ResponseDesc": "success"
        };

        res.json(message);
    } catch (e) {
        console.error(e.message);
        res.status(500).send({
            message: 'Internal Server Error',
            error: e.message
        })
    }
}