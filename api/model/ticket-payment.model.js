const database = require('./abstract.database');
const paymentsCollection = database.collection(process.env.NODE_ENV === 'test' ? 'events_payments_test' : 'events_payments');
const moment = require('moment');
const Utils = require('./utils/utils');
const failedTransactions = database.collection(process.env.NODE_ENV === 'test' ? 'failed_events_payments_test' : 'failed_event_payments')

exports.savePaymentTransaction = async (studentAdmissionNumber, eventId, transactionCode, transactionAmount, transactionStatus, transactionTimestamp, transactionPhoneNumber) => {
    /*
    * @Params transactionStatus,
    *         Successful -> Green
    *         Cancelled -> Orange
    *         Failed -> Red
    * */
    return await paymentsCollection.add({
        studentAdmissionNumber: studentAdmissionNumber,
        eventId: eventId,
        transactionCode: transactionCode,
        transactionAmount: transactionAmount,
        transactionPhoneNumber: transactionPhoneNumber,
        transactionStatus: transactionStatus,
        transactionTimestamp: transactionTimestamp
    });

};

exports.recordFailedTransaction = async (studentAdmissionNumber, eventId, failureQuery) => {
    return await failedTransactions.add({

        studentAdmissionNumber: studentAdmissionNumber,
        eventId: eventId,
        transactionStatus: "failed",
        failureQuery: failureQuery,
        transactionTimestamp: moment().format()
    })
};

exports.fetchAllSuccessfulTransactions = async () => {
    return await paymentsCollection.get();
};

exports.fetchFailedTransactions = async () => {
    return await failedTransactions.get();
};

exports.fetchTransactionByAdmissionNumber = async (admissionNumber) => {
    return await paymentsCollection.where('studentAdmissionNumber', '==', studentAdmissionNumber).get();
};

exports.fetchFailedTransactionsByAdmisionNumber = async (admissionNumber) => {
    return await failedTransactions.where('studentAdmissionNumber', '==', admissionNumber).get();
};

exports.clearPaymentsCollection = () => {
    let utils = new Utils();
    let batchSize = 100;
    let query = paymentsCollection.orderBy('studentAdmissionNumber').limit(batchSize);
    return utils.deleteQueryBatch(database, query, batchSize)
};

exports.clearFailedPaymentsCollection = () => {
    let utils = new Utils();
    let batchSize = 100;
    let query = failedTransactions.orderBy('studentAdmissionNumber').limit(batchSize);
    return utils.deleteQueryBatch(database, query, batchSize)
};