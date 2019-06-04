const jwt = require('jsonwebtoken');

let JWT_SECRET;
try {
  const functions = require('firebase-functions');
  JWT_SECRET = functions.config().jwt.key;
} catch (e) {
  JWT_SECRET = process.env.JWT_SECRET;
}

exports.generateAccessToken = async function(req, res, next) {
  try {
    let _this = req.body;
    let accessToken = await jwt.sign(
      {
        email: _this.email,
        uid: _this.uid,
      },
      JWT_SECRET,
      {
        expiresIn: '1h',
      },
    );
    return res.status(200).send({
      message: 'Access Token Created Successfully',
      token: {
        accessToken,
        expiresIn: '1 Hour',
      },
    });
  } catch (e) {
    console.log(e.message);
    return res.status(500).send({
      message: 'Error Occurred Generating Access Token',
      error: e.message,
    });
  }
};
