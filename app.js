const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const { fileParser } = require('express-multipart-file-parser')
const cors = require('cors')({origin: true});
require('dotenv').config();
const firebaseAdmin = require('firebase-admin');
const serviceAccount = require('./api/config/service-account');

firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
    databaseURL: "https://my-portal-e90f4.firebaseio.com"
});

const app = express();
const routes = require('./api/routes/index');

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(fileParser({
    rawBodyOptions: {
      limit: '8mb',
    }
  })
);
app.use(cors);
app.use('/api/v1', routes);
app.use((req, res, next) => {
    const error = new Error('Route Not Found');
    error.status = 404;
    next(error);
    return res.status(404).send({
        message: 'Route Not Found'
    })
});
app.use((err, req, res) => {
    res.status(err.status || 500);
    res.json({
        err: {
            message: err.message
        }
    })
});

module.exports = app;