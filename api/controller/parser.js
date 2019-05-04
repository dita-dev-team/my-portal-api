const moment = require('moment');
const XLSX = require('xlsx');

module.exports = class ExcelParser {

    constructor() {
        this.shift = ''
        this.i = 0;
        this.j = 0;
        this.units = [];
    }

    async extractData(data) {
        let workbook = XLSX.read(data, {type:'buffer'});
        for(let s = 0; s < workbook.SheetNames.length; s++) {
            let sheetName = workbook.SheetNames[s];
            let worksheet = workbook.Sheets[sheetName];
            let sheet = XLSX.utils.sheet_to_json(worksheet, {
                header: 1,
                defval: 'empty',
                blankrows: true
            })
            this.i = 0;

            for (let r = 0; r < sheet.length; r++) {
                let row = sheet[r];
                this.j = 0;
                for (let c = 0; c < row.length; c++) {
                    let cell = row[c];
                    cell = cell.trim();

                    if (cell === 'empty' || cell.toLowerCase().includes('semester')) {
                        this.j++;
                        continue;
                    }

                    let pattern = /(?:[a-zA-Z]{3,4}[\d]{3}|[a-zA-Z]{3,4}[\s]+[\d]{3}|[a-zA-Z]{3,4}-[\d]{3})/i
                    if (pattern.test(cell) && this.j > 0) {
                        let details = this.getDetails(sheetName, sheet);
                        let names = this.sanitize(cell);
                        for (let i = 0; i < names.length; i++) {
                            let unit = {
                                'name': this.formatCourseTitle(names[i]),
                                'room': details['room'],
                                'date': details['dateTime'].toDate(),
                                'shift': details['shift']
                            }
                            this.units.push(unit);
                        }
                    }
                    this.printOut = false
                    this.j++;
                }
                this.i++;
            }
        }
    }

    getDetails(sheetName, sheet) {
        this.shift = this.getShift(sheetName);
        let dateTimeDetails = this.getDateTimeDetails(sheet);
        if (this.printOut) {
            console.log(dateTimeDetails);
        }
        dateTimeDetails = this.stringToDate(dateTimeDetails);
        let room = sheet[this.i][0];
        if (room.includes('empty')) {
            room = 'NO ROOM';
        }
        return {
            'dateTime': dateTimeDetails,
            'shift': this.shift,
            'room': room
        }
    }
    
    getDateTimeDetails(sheet) {
        let row = this.i;
        let col = this.j;
        let pattern = /(?:(.*)-([\d]+.[\d]+[apm]+))/i
        for (let i = row; i >= 0; i--) {
            let _row = sheet[i];
            let cell = _row[col];

            if (cell.includes('empty')) {
                continue;
            }

            

            let match;
            if ((match = cell.match(pattern)) !== null) {
                if (this.printOut) {
                    console.log(match)
                }
                let date = this.getDate(sheet, i+1);
                if (date !== null) {
                    let start = match[1];
                    let end = match[2];
                    start = this.fixStartTime(start, end);
                    return `${date} ${start.toLowerCase()}`;
                }
            }
        }

        return null;
    }

    fixStartTime(start, end) {
        if(/[a-zA-Z]{2}/i.test(start)) {
            return start
        }

        let suffix = end.slice(-2);
        let noPattern  = /(^[0-9]+)/
        let startMatch = start.match(noPattern);
        let endMatch = end.match(noPattern);
        let st = parseInt(startMatch[1]);
        let en = parseInt(endMatch[1]);

        if (st < en) {
            return `${start}${suffix}`
        } else {
            if(/[a]/i.test(suffix)) {
                return `${start}pm`
            } else {
                return `${start}am`
            }
        }
    }

    getDate(sheet, row) {
        row -= 2;
        let col = this.j;
        let match;
        let pattern = /[\w]+day[\s]+([\d]+\/[\d]+\/[\d]+)/i;
        
        for (let j = col; j >= 0; j--) {
            let cell = sheet[row][j];
            cell = cell.trim();

            if((match = cell.match(pattern)) !== null) {
                return match[1];
            }
        }

        return null;
    }

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

    formatCourseTitle(text) {
        if (text.includes('-')) {
            return text;
        } else {
            let initLen = /^[a-zA-Z]{3}\d/i.test(text) ? 3 : 4;
            return text.substring(0, initLen) + '-' + text.substring(initLen);
        }
    }

    sanitize(text) {
        let coursesArray = [];
        // Remove white spaces
        let courseCode = text.replace(/\s/g, '');
        // Correct type AAA111B(X)
        let match = courseCode.match(/(.*)([A-Z]\((.)\))/)
        if (match) {
            courseCode = match[1] + match[3]
        }
        let similarDoubleClasses = /[a-z]{3,4}\d{3}[a-z]\/[a-z]{3,4}\d{3}[a-z]*.*/i; // YYY111A/YYY222A

        let lackingClassPrefix = /[a-z]{3,4}[\d]{3}\/[a-z]{3,4}[\d]{3}[a-z]{1}/i; // YYY111/YYY222A

        let conjoinedClasses = /[a-z]{3,4}[\d]{3}[a-z]{1}\/[a-z]{1}(?:[/]*|.{})/i // YYY111A/B

        let fourJoinedClasses = /[A-Z]{3,4}[\d]{3}(?:\/[\d]{3})*/i // YYY111/222/333/444


        coursesArray.push(courseCode);
        if (courseCode.includes('/')) {
            let courseCodes = [];
            if (courseCode.match(similarDoubleClasses)) { // handle type YYY111A/YYY222A/YYY333
                courseCodes = courseCode.split('/').map(code => isNaN(code.substr(-1)) ? code : this.addSection(code));
            } else if (courseCode.match(lackingClassPrefix)) {  // handle type YYY111/YYY222A
                courseCodes = courseCode.split('/');
                courseCodes[0] = courseCodes[0].concat(courseCode.substr(-1));
            } else if (courseCode.match(conjoinedClasses)) { // handle type YYY111A/B
                let prefix = courseCode.substr(0, 6);
                let sections = (courseCode.substr(6)).split('/');

                sections.forEach(section => {
                    courseCodes.push(prefix.concat(section));
                });
            } else if (courseCode.match(fourJoinedClasses)) {  // handle type YYY111/222/333/444
                let prefix = courseCode.substr(0, 3);
                let codes = (courseCode.substr(3)).split('/');
                let last = courseCode.substr(-1);

                codes.forEach(code => {
                    let section;
                    if (isNaN(last)) {
                        section = last.toUpperCase();
                    } else {
                        section = this.shift === 'athi' ? 'A' : (this.shift === 'day' ? 'T' : 'X');
                    }
                    courseCodes.push(prefix.concat((code.substr(0, 3)).concat(section)));
                })
            } else {
                console.log(`Unable to sanitize ${text}`);
            }

            let temp = [];
            courseCodes.forEach(code => {
                if (code.length > 7) {
                    let chunks = this.chunkString(code, 7);
                    temp = temp.concat(chunks);
                } else {
                    temp.push(code);
                }
            });

            return temp;

        } else {
            return coursesArray;
        }

    }

    addSection(code) {
        let section = this.shift === 'athi' ? 'A' : (this.shift === 'day' ? 'T' : 'X');
        return code + section
    }

    stringToDate(text){
        let dateTime = null;
        if (/[\d]+\/[\d]+\/[\d]{2}[\s]+[\d]+:[\d]+[amp]+/i.test(text)) {
            dateTime = moment(text, 'DD/MM/YY hh:mma')
        } else if (/[\d]+\/[\d]+\/[\d]{4}[\s]+[\d]+:[\d]+[amp]+/i.test(text)) {
            dateTime = moment(text, 'DD/MM/YYYY hh:mma')
        } else if (/[\d]+\/[\d]+\/[\d]{2}[\s]+[\d]+\.[\d]+[amp]+/i.test(text)) {
            dateTime = moment(text, 'DD/MM/YY hh.mma')
        } else if (/[\d]+\/[\d]+\/[\d]{4}[\s]+[\d]+\.[\d]+[amp]+/i.test(text)) {
            dateTime = moment(text, 'DD/MM/YYYY hh.mma')
        }

        return dateTime;
    }

    chunkString(str, length) {
        return str.match(new RegExp('.{1,' + length + '}', 'g'));
    }
};