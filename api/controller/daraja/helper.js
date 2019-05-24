const request = require('request');

module.exports = class DarajaHelper {

    httpResponseBodyProcessor(responseData, req, res, next) {
        if (!responseData.body.fault && !responseData.body.errorCode && !responseData.error) {
            req.transactionResponse = responseData.body;
            return res.status(200).send({
                message: 'Transaction sent for processing',
                transactionStatus: responseData.body.ResponseDescription,
                responseCode: responseData.body.ResponseCode,
                merchantRequestId: responseData.body.MerchantRequestID,
                checkoutRequestId: responseData.body.CheckoutRequestID
            })
        } else {
            return res.status(500).send({
                message: 'Internal Server Error',
                requestId:responseData.body.requestId,
                errorCode: responseData.body.errorCode,
                errorMessage: responseData.body.errorMessage,
            })
        }
    }

    isEmpty(val) {
        return (val === undefined || val === null || val.length <= 0)
    }

    sendTransactionToDaraja(transactionDetails, req, res, next) {
        request({
            method: 'POST',
            url: transactionDetails.url,
            headers: {
                'Authorization': transactionDetails.auth
            },
            json: transactionDetails.transaction
        }, function (error, response, body) {
            let helper = new DarajaHelper();
            helper.httpResponseBodyProcessor({
                body: body,
                error: error
            }, req, res, next)
        })
    }
}