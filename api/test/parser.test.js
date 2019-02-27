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