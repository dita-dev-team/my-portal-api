const database = require('./abstract.database');
const paymentsCollection = database.collection(process.env.NODE_ENV === 'test' ? 'tickets_payments_test' : 'ticket_payments');

exports.savePaymentTransaction = async (studentAdmissionNumber, eventId, transactionCode, transactionAmount, transactionStatus, transactionTimestamp) => {
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
        transactionStatus: transactionStatus,
        transactionTimestamp: transactionTimestamp
    });

}