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