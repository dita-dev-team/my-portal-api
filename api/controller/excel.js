const ExcelParser = require('./parser')

exports.uploadExcelFile = async (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    let file = req.files[0]
    if (file.mimetype !== 'application/vnd.ms-excel' && 
    file.mimetype !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        return res.status(400).send('Invalid file type.');
    }

    let parser = new ExcelParser();
    parser.copyToDb(file.buffer);

    res.status(200).send('Success.')
}

