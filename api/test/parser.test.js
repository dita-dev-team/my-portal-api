const expect = require('chai').expect;
let assert = require('chai').assert;
const ExcelParser = require('../controller/parser')

describe('Test ExcelParser split()', () => {
    it('should return array of 2 (AAA-111)', () => {
        let parser = new ExcelParser();
        let result = parser.split('ACS-113')
        expect(result).to.eql(['ACS', '113'])
    });

    it('should return array of 2 (AAA 111)', () => {
        let parser = new ExcelParser();
        let result = parser.split('ACS 113')
        expect(result).to.eql(['ACS', '113'])
    });

    it('should return array of 2 (AAA111)', () => {
        let parser = new ExcelParser();
        let result = parser.split('ACS113')
        expect(result).to.eql(['ACS', '113'])
    });

    it('should return array of 2 (AAAA111)', () => {
        let parser = new ExcelParser();
        let result = parser.split('DICT114')
        expect(result).to.eql(['DICT', '114'])
    });
});

describe('Test ExcelParser getShift()', () => {
    it('should return "athi"', () => {
        let parser = new ExcelParser();
        let result = parser.getShift('Athi-River Day')
        assert.equal(result, 'athi')
    });

    it('should return array "evening"', () => {
        let parser = new ExcelParser();
        let result = parser.getShift('Nairobi Evening')
        assert.equal(result, 'evening')
    });

    it('should return "day"', () => {
        let parser = new ExcelParser();
        let result = parser.getShift('Nairobi Day')
        assert.equal(result, 'day')
    });
});

describe('Test ExcelParser formatCourseTitle()', () => {
    it('should return "ACS-113"', () => {
        let parser = new ExcelParser();
        let result = parser.formatCourseTitle('ACS-113')
        assert.equal(result, 'ACS-113')
    });

    it('should return "ACS-113" (no hyphen)', () => {
        let parser = new ExcelParser();
        let result = parser.formatCourseTitle('ACS113')
        assert.equal(result, 'ACS-113')
    });

    it('should return "DICT-114" (no hyphen)', () => {
        let parser = new ExcelParser();
        let result = parser.formatCourseTitle('DICT114')
        assert.equal(result, 'DICT-114')
    });
});

describe('Test ExcelParser sanitize Course Codes', () => {

    it('it should return an array length of (1) given ACS101A', () => {
        let excelParser = new ExcelParser();
        let result = excelParser.sanitize('ACS101A');
        assert.equal(result.length, 1);
    });

    it('it should return an array length of (2) given ACS101A/B', () => {
        let excelParser = new ExcelParser();
        let result = excelParser.sanitize('ACS101A/B');
        assert.equal(result.length, 2);
    });

    it('it should return an array length of (2) given ACS101A/ACS101B', () => {
        let excelParser = new ExcelParser();
        let result = excelParser.sanitize('ACS101A/ACS101B');
        assert.equal(result.length, 2);
    });

    it('it should return an array length of (2) given ACS101/ACS101B', () => {
        let excelParser = new ExcelParser();
        let result = excelParser.sanitize('ACS101/ACS101B');
        assert.equal(result.length, 2);
    });

    it('it should return an array length of (4) given ACS111/219/319/419', () => {
        let excelParser = new ExcelParser();
        let result = excelParser.sanitize('ACS111/219/319/419');
        assert.equal(result.length, 4);
    });

    it('it should return an array length of (4) given ACS111/219/319/419A', () => {
        let excelParser = new ExcelParser();
        let result = excelParser.sanitize('ACS111/219/319/419A');
        assert.equal(result.length, 4);
    });

    it('it should return an array with length of (2) given ACS261/MIS224B', () => {
        let excelParser = new ExcelParser();
        let result = excelParser.sanitize('ACS261/MIS224B');
        assert.equal(result.length, 2);
    })

});