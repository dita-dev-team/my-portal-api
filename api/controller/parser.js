module.exports = class ExcelParser {

    split(text) {
        if (text.includes('-')) {
            return text.split('-')
        } else if (text.includes(' ')) {
            return text.split(' ')
        } else {
            let initLen = /^[a-zA-Z]{3}\d/i.test(text) ? 3 : 4;
            return [text.substring(0, initLen), text.substring(initLen)]
        }
    }

    getShift(text) {
        let shift = text.toLowerCase();
        if (shift.includes('athi')) {
            return 'athi'
        } else if (shift.includes('evening')) {
            return 'evening'
        } else {
            return 'day'
        }
    }
}