const request = require('request');

module.exports = class DarajaHelper {

    httpResponseBodyProcessor(responseData, req, res, next) {
        console.log(JSON.stringify(responseData));
        if (!responseData.body.fault || !responseData.body.errorCode || !responseData.error || !this.isEmpty(responseData.body.status)) {
            req.transactionResponse = responseData.body;
            return res.status(200).send({
                message: 'Transaction sent for processing',
                transactionStatus: 'Processing'
            })
        } else {
            return res.status(500).send({
                message: 'Internal Server Error',
                errorCode: responseData.body.errorCode,
                error: responseData.error
            })
        }
    }

    isEmpty(val) {
        return (val === undefined || val == null || val.length <= 0)
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