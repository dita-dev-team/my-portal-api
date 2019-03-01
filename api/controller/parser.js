module.exports = class ExcelParser {

    constructor() {
        this.shift = ''
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
        //Remove white spaces
        let coursesArray = [];

        let courseCode = text.replace(/\s/g, '');
        let similarDoubleClasses = /[a-zA-Z]{3,4}[\d]{3}[a-zA-Z]\/[a-z]{3,4}[\d]{3}[a-z]{1}/i; // YYY111A/YYY222A

        let lackingClassPrefix = /[a-zA-Z]{3,4}[\d]{3}\/[a-z]{3,4}[\d]{3}[a-z]{1}/i; // YYY111/YYY222A

        let conjoinedClasses = /[a-zA-Z]{3,4}[\d]{3}[a-zA-Z]{1}\/[a-z]{1}(?:[\/]*|.{})/i // YYY111A/B

        let fourJoinedClasses = /[A-Z]{3,4}[\d]{3}(?:\/[\d]{3})*/i //YYY111/222/333/444

        coursesArray.push(courseCode);
        if (courseCode.includes('/')) {
            let courseCodes = [];
            if (courseCode.match(similarDoubleClasses)) { // handle type YYY111A/YYY222A
                courseCodes = courseCode.split('/');
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
                    if (!isNaN(last)) {
                        section = last.toUpperCase();
                    } else {
                        section = this.shift === 'athi' ? 'A' : (this.shift === 'day' ? 'T' : 'X');
                    }
                    courseCodes.push(prefix.concat((code.substr(0, 3)).concat(section)));
                })
            }

            let temp = [];
            courseCodes.forEach(code => {
                if (code.length > 7) {
                    let chunks = this.str_split(code, 7);
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

    str_split(string, splitLength) {
        if (splitLength === null) {
            splitLength = 1
        }
        if (string === null || splitLength < 1) {
            return false
        }

        string += ''
        var chunks = []
        var pos = 0
        var len = string.length

        while (pos < len) {
            chunks.push(string.slice(pos, pos += splitLength))
        }

        return chunks
    }
};