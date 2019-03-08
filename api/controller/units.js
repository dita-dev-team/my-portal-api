const database = require('../model/database');

exports.getUnits = async (req, res, next) => {
    if (!req.query || !req.query.shift || !req.query.names) {
        return res.status(400).send('Missing query args.');
    }
    let names = req.query.names.split(',').map(name => name.trim());
    let shift = req.query.shift;

    if (names.length === 0) {
        return res.json([]);
    }
    let data = await database.getExamSchedule(names, shift);
    return res.json(data);
}