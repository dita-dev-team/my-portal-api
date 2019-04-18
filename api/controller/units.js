const database = require('../model/database');

function getSection(shift) {
    switch(shift) {
        case 'athi':
            return 'A'
        case 'day':
            return 'T'
        case 'evening':
            return 'X'
    }
}

exports.getUnits = async (req, res, next) => {
    if (!req.query || !req.query.shift || !req.query.names) {
        return res.status(400).send('Missing query args.');
    }
    let names = req.query.names.split(',').map(name => name.trim());
    let shift = req.query.shift;

    for (let i = 0; i < names.length; i++) {
        let name  = names[i];
        if (!/[a-zA-Z]/.test(name.slice(-1))) {
            names[i] = name + getSection(shift);
        }
    }

    if (names.length === 0) {
        return res.json([]);
    }
    let data = await database.getExamSchedule(names);
    let result = {
        'results': data
    }
    return res.json(result);
}