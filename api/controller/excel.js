const ExcelParser = require('./parser')
const database = require('../model/database');

exports.uploadExcelFile = async (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        console.error('No files were received.');
        return res.status(400).send('No files were uploaded.');
    }

    let file = req.files[0]
    const mimetypes = new Set([
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/wps-office.xls',
        'application/wps-office.xlsx'
    ])
    if (!mimetypes.has(file.mimetype)) {
        console.error('Received invalid file type.')
        return res.status(400).send('Invalid file type.');
    }

    let parser = new ExcelParser();
    console.log('Extracting data from excel');
    parser.extractData(file.buffer);
    console.log('Done extracting data');
    if (parser.units.length > 0) {
        console.log('Clearing existing data');
        await database.clearExamSchedule();
        console.log('Saving data');
        await database.setExamSchedule(parser.units);
    } else {
        console.log('No units found');
     }
    console.log('Done.');
    res.status(200).send('Success.')
}

