const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const firebaseAdmin = require('firebase-admin');
const serviceAccount = require('./api/config/service-account');
const app = express();
const firebaseRoutes = require('./api/routes/index');

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization");

    if (req.method === "OPTIONS") {
        res.header('Access-Control-Allow-Methods', 'POST,GET');
        return res.status(200).json({});
    }
    next();
});

firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
    databaseURL: "https://my-portal-e90f4.firebaseio.com"
});
mongoose.connect(process.env.MONGODB_URL,{useNewUrlParser:true},(err)=>{
    if(err){
        console.log('Error Connecting To Database',err.message);
        throw new Error(err.message);
    }
    console.log('MongoDB Connected Successfully');
});

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());
app.use('/api/v1', firebaseRoutes);

app.use(function (req, res, next) {
    const error = new Error('Route Not Found');
    error.status = 404;
    next(error);
    return res.status(404).send({
        message: 'Route Not Found'
    })
});
app.use(function (err, req, res) {
    res.status(err.status || 500);
    res.json({
        err: {
            message: err.message
        }
    })
});

module.exports = app;