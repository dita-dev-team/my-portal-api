// const Busboy = require('busboy');
const asyncBusboy = require('./async-busybox');

exports.webHook = async (req, res, next) => {
    if (req.method !== 'POST') {
        return res.status(405).end();
    }
    console.log('hook request received');
    const {files, fields} = await asyncBusboy(req);
    const data = JSON.parse(fields['data']);
    console.log(data);
    console.log(files);
    // TODO Do data processing...
    res.json({'message': 'Success'});
};