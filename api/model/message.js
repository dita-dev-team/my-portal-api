const mongoose = require('mongoose');
const messageSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    emailAddress: {type: String, required: true},
    messageTitle: {type: String, required: true},
    messageBody: {type: String, required: true},
    messageTopic: {type: String, required: true},
    messageStatus: {type: String, required: true}
}, {timestamps: true});

module.exports = mongoose.model('Message', messageSchema);