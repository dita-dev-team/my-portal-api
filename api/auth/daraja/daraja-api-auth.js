require('dotenv').config();
const axios = require('axios');

exports.generateApiAccessToken = async (req, res, next) => {
    let consumerSecret = process.env.CONSUMER_KEY_SECRET || '';
    let consumerKey = process.env.CONSUMER_KEY || '';
    let authenticationUrl = process.env.AUTHENTICATION_URL || '';
    try {
        if (consumerKey === '' || consumerSecret === '' || authenticationUrl === '') {
            return res.status(400).send({
                message: 'Please Ensure that all Daraja credentials are provided',
                requestBody: {
                    consumerKey: '<Fetched from Daraja Api Portal>',
                    consumerSecret: '<Fetched from Daraja Api Portal>',
                    authenticationUrl: '<https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials>'
                }
            })
        }
        let authenticationPassword = 'Basic ' + Buffer.from(consumerKey + ':' + consumerSecret).toString('base64');
        let response = await axios.get(process.env.AUTHENTICATION_URL, {
            headers: {
                'Authorization': authenticationPassword
            }
        });

        //let accessTokenResponse = JSON.parse(response.data);
        req.accessToken = response.data.access_token;
        next();
    } catch (e) {
        console.log("Error Generating Access Token", e.message);
        return res.status(500).send({
            message: 'Error Encountered Generating Access Token',
            error: e.message
        })
    }
};