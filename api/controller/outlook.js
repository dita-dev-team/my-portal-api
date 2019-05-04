exports.webHook = async (req, res, next) => {
    console.log('hook request received');
    console.log(req.body);
    console.log(req.files);
    res.json({'message': 'Success'});
};