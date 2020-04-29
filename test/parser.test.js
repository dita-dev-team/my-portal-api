const fs = require('fs');
const moment = require('moment/moment');
const XLSX = require('xlsx');
const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
const ExcelParser = require('../api/controller/parser');

chai.use(require('chai-like'));
chai.use(require('chai-things'));

describe('Test ExcelParser split()', () => {
  it('should return array of 2 (AAA-111)', () => {
    let parser = new ExcelParser();
    let result = parser.split('ACS-113');
    expect(result).to.eql(['ACS', '113']);
  });

  it('should return array of 2 (AAA 111)', () => {
    let parser = new ExcelParser();
    let result = parser.split('ACS 113');
    expect(result).to.eql(['ACS', '113']);
  });

  it('should return array of 2 (AAA111)', () => {
    let parser = new ExcelParser();
    let result = parser.split('ACS113');
    expect(result).to.eql(['ACS', '113']);
  });

  it('should return array of 2 (AAAA111)', () => {
    let parser = new ExcelParser();
    let result = parser.split('DICT114');
    expect(result).to.eql(['DICT', '114']);
  });
});

describe('Test ExcelParser getShift()', () => {
  it('should return "athi"', () => {
    let parser = new ExcelParser();
    let result = parser.getShift('Athi-River Day');
    assert.equal(result, 'athi');
  });

  it('should return array "evening"', () => {
    let parser = new ExcelParser();
    let result = parser.getShift('Nairobi Evening');
    assert.equal(result, 'evening');
  });

  it('should return "day"', () => {
    let parser = new ExcelParser();
    let result = parser.getShift('Nairobi Day');
    assert.equal(result, 'day');
  });
});

describe('Test ExcelParser formatCourseTitle()', () => {
  it('should return "ACS-113"', () => {
    let parser = new ExcelParser();
    let result = parser.formatCourseTitle('ACS-113');
    assert.equal(result, 'ACS-113');
  });

  it('should return "ACS-113" (no hyphen)', () => {
    let parser = new ExcelParser();
    let result = parser.formatCourseTitle('ACS113');
    assert.equal(result, 'ACS-113');
  });

  it('should return "DICT-114" (no hyphen)', () => {
    let parser = new ExcelParser();
    let result = parser.formatCourseTitle('DICT114');
    assert.equal(result, 'DICT-114');
  });
});

describe('Test ExcelParser fixStartTime()', () => {
  it('should return "8:45am" with suffix', () => {
    let parser = new ExcelParser();
    let result = parser.fixStartTime('8:45am', '11:45am');
    assert.equal(result, '8:45am');
  });

  it('should return "8:45am" missing suffix', () => {
    let parser = new ExcelParser();
    let result = parser.fixStartTime('8:45', '11:45am');
    assert.equal(result, '8:45am');
  });

  it('should return "11:45am" missing suffix (crossover)', () => {
    let parser = new ExcelParser();
    let result = parser.fixStartTime('11:45', '1:45pm');
    assert.equal(result, '11:45am');
  });

  it('should return "11:45pm" missing suffix (crossover)', () => {
    let parser = new ExcelParser();
    let result = parser.fixStartTime('11:45', '1:45am');
    assert.equal(result, '11:45pm');
  });
});

describe('Test ExcelParser sanitize Course Codes', () => {
  it('it should return an array length of (1) given ACS101A', () => {
    let excelParser = new ExcelParser();
    let result = excelParser.sanitize('ACS101A');
    expect(result).to.have.members(['ACS101A']);
  });

  it('it should return an array length of (2) given ACS101A/B', () => {
    let excelParser = new ExcelParser();
    let result = excelParser.sanitize('ACS101A/B');
    expect(result).to.have.members(['ACS101A', 'ACS101B']);
  });

  it('it should return an array length of (2) given ACS101A/ACS101B', () => {
    let excelParser = new ExcelParser();
    let result = excelParser.sanitize('ACS101A/ACS101B');
    expect(result).to.have.members(['ACS101A', 'ACS101B']);
  });

  it('it should return an array length of (2) given ACS101A/ACS201A/ACS102', () => {
    let excelParser = new ExcelParser();
    excelParser.shift = 'athi';
    let result = excelParser.sanitize('ACS101A/ACS201A/ACS102');
    assert.equal(result.length, 3);
    expect(result).to.have.members(['ACS101A', 'ACS201A', 'ACS102A']);
  });

  it('it should return an array length of (2) given ACS101/ACS101B', () => {
    let excelParser = new ExcelParser();
    let result = excelParser.sanitize('ACS101/ACS101B');
    expect(result).to.have.members(['ACS101B', 'ACS101B']);
  });

  it('it should return an array length of (4) given ACS111/219/319/419', () => {
    let excelParser = new ExcelParser();
    excelParser.shift = 'athi';
    let result = excelParser.sanitize('ACS111/219/319/419');
    expect(result).to.have.members([
      'ACS111A',
      'ACS219A',
      'ACS319A',
      'ACS419A',
    ]);
  });

  it('it should return an array length of (4) given ACS111/219/319/419A', () => {
    let excelParser = new ExcelParser();
    let result = excelParser.sanitize('ACS111/219/319/419A');
    expect(result).to.have.members([
      'ACS111A',
      'ACS219A',
      'ACS319A',
      'ACS419A',
    ]);
  });

  it('it should return an array with length of (2) given ACS261/MIS224B', () => {
    let excelParser = new ExcelParser();
    let result = excelParser.sanitize('ACS261/MIS224B');
    expect(result).to.have.members(['ACS261B', 'MIS224B']);
  });
});

describe('Test Reading & Parsing getDate()', () => {
  it('valid date is returned', () => {
    let data = fs.readFileSync('test/files/excel-new.xlsx');
    let workbook = XLSX.read(data, { type: 'buffer' });
    let sheetName = workbook.SheetNames[0];
    let worksheet = workbook.Sheets[sheetName];
    let sheet = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: 'empty',
      blankrows: true,
    });

    let excelParser = new ExcelParser();
    excelParser.j = 3;
    let date = excelParser.getDate(sheet, 3);
    assert.isNotNull(date);
    assert.isNotEmpty(date);
    expect(date).to.match(/[\d]+\/[\d]+\/[\d]+/);
  });
});

describe('Test Reading & Parsing getDateTimeDetails()', () => {
  it('valid datetime is returned', () => {
    let data = fs.readFileSync('test/files/excel-new.xlsx');
    let workbook = XLSX.read(data, { type: 'buffer' });
    let sheetName = workbook.SheetNames[0];
    let worksheet = workbook.Sheets[sheetName];
    let sheet = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: 'empty',
      blankrows: true,
    });

    let excelParser = new ExcelParser();
    excelParser.i = 7;
    excelParser.j = 2;
    let dateTime = excelParser.getDateTimeDetails(sheet);
    assert.isNotNull(dateTime);
    assert.isNotEmpty(dateTime);
    expect(dateTime).to.match(
      /[\d]+\/[\d]+\/[\d]+\s[\d]+(?:\\.|:)[\d]+[apm]+/i,
    );
  });
});

describe('Test Reading & Parsing stringToDate()', () => {
  it('null is returned for invalid format', () => {
    let excelParser = new ExcelParser();
    let dateTime = excelParser.stringToDate('ksdfdsf');
    assert.isNull(dateTime);
  });
  it('moment object is returned (1/10/19 1:30pm)', () => {
    let excelParser = new ExcelParser();
    let dateTime = excelParser.stringToDate('1/10/19 1:30pm');
    expect(dateTime).to.be.instanceOf(moment);
  });
  it('moment object is returned (1/10/2019 1:30pm)', () => {
    let excelParser = new ExcelParser();
    let dateTime = excelParser.stringToDate('1/10/2019 1:30pm');
    expect(dateTime).to.be.instanceOf(moment);
  });
  it('moment object is returned (1/10/19 1.30pm)', () => {
    let excelParser = new ExcelParser();
    let dateTime = excelParser.stringToDate('1/10/19 1.30pm');
    expect(dateTime).to.be.instanceOf(moment);
  });
  it('moment object is returned (1/10/2019 1.30pm)', () => {
    let excelParser = new ExcelParser();
    let dateTime = excelParser.stringToDate('1/10/2019 1.30pm');
    expect(dateTime).to.be.instanceOf(moment);
  });
});

describe('Test Reading & Parsing stringToDate()', () => {
  it('valid details are returned', () => {
    let data = fs.readFileSync('test/files/excel-new.xlsx');
    let workbook = XLSX.read(data, { type: 'buffer' });
    let sheetName = workbook.SheetNames[0];
    let worksheet = workbook.Sheets[sheetName];
    let sheet = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: 'empty',
      blankrows: true,
    });

    let excelParser = new ExcelParser();
    excelParser.i = 7;
    excelParser.j = 2;
    let details = excelParser.getDetails(sheetName, sheet);
    assert.isNotNull(details);
    assert.isNotEmpty(details);
    expect(details).to.contain.keys('shift', 'room', 'dateTime');
    expect(details['room']).to.equal('LR14');
  });
});

describe('Test Reading & Parsing extractData()', () => {
  function hasNames(arr, ...names) {
    let size = names.length;
    let set = new Set(names);
    let counter = 0;
    for (let i = 0; i < arr.length; i++) {
      let unit = arr[i];
      if (set.has(unit['name'])) {
        counter++;
      }
      if (counter === size) {
        break;
      }
    }
    return counter === size;
  }

  it('August 2017 is parsed successfully', () => {
    let data = fs.readFileSync('test/files/excel-new1.xls');
    let excelParser = new ExcelParser();
    excelParser.extractData(data);
    assert.isNotNull(excelParser.units);
    assert.isNotEmpty(excelParser.units);
    assert.isTrue(
      hasNames(
        excelParser.units,
        'ACS-354A',
        'ICO-018T',
        'PSY-414T',
        'COM-264B',
        'PSY-211P',
        'DEV-111X',
        'HRM-611X',
        'MME-614X',
      ),
    );
  });

  it('January 2018 is parsed successfully', () => {
    let data = fs.readFileSync('test/files/excel-new3.xls');
    let excelParser = new ExcelParser();
    excelParser.extractData(data);
    assert.isNotNull(excelParser.units);
    assert.isNotEmpty(excelParser.units);
    assert.isTrue(
      hasNames(
        excelParser.units,
        'ACS-404A',
        'ACS-454A',
        'ACS-451A',
        'ENG-214T',
        'PGM-614X',
        'PEA-141T',
        'MCD-619X',
      ),
    );
  });

  it('June 2018 is parsed successfully', () => {
    let data = fs.readFileSync('test/files/excel-new4.xls');
    let excelParser = new ExcelParser();
    excelParser.extractData(data);
    assert.isNotNull(excelParser.units);
    assert.isNotEmpty(excelParser.units);
    assert.isTrue(
      hasNames(
        excelParser.units,
        'MAT-313A',
        'MUS-496A',
        'BMS-402A',
        'ICO-094T',
        'DICT-224',
        'GRA-613X',
        'SOC-314X',
        'DICT-211T',
      ),
    );
  });

  it('August 2018 is parsed successfully', () => {
    let data = fs.readFileSync('test/files/excel-new5.xls');
    let excelParser = new ExcelParser();
    excelParser.extractData(data);
    assert.isNotNull(excelParser.units);
    assert.isNotEmpty(excelParser.units);
    assert.isTrue(
      hasNames(
        excelParser.units,
        'ACS-401A',
        'PSY-211A',
        'MUS-115A',
        'CHD-642X',
        'DICT-105T',
        'MAK-317T',
        'ICO-056U',
        'MUS-113A',
        'COM-445B',
        'ACS-261A',
      ),
    );
  });

  it('January 2019 is parsed successfully', () => {
    let data = fs.readFileSync('test/files/excel-new6.xlsx');
    let excelParser = new ExcelParser();
    excelParser.extractData(data);
    assert.isNotNull(excelParser.units);
    assert.isNotEmpty(excelParser.units);
    assert.isTrue(
      hasNames(
        excelParser.units,
        'SWK-317A',
        'MIS-313A',
        'MUS-419A',
        'PSY-408T',
        'MAK-423T',
        'ICO-049T',
        'COM-422T',
        'GRA-613Z',
        'MCD-606X',
        'MCD-612X',
        'COM-408X',
        'COM-408A',
      ),
    );
  });

  it('May 2019 is parsed successfully', () => {
    let data = fs.readFileSync('test/files/excel-new7.xls');
    let excelParser = new ExcelParser();
    excelParser.extractData(data);
    assert.isNotNull(excelParser.units);
    assert.isNotEmpty(excelParser.units);
    assert.isTrue(
      hasNames(
        excelParser.units,
        'ENH-227A',
        'MUS-419A',
        'MIS-414A',
        'COM-321T',
        'DICT-109T',
        'DBM-021T',
        'COM-099T',
        'DGE-109U',
        'GRW-611X',
        'CHD-644X',
        'MME-609X',
        'GRA-610Z',
      ),
    );
  });

  it('August 2019 is parsed successfully', () => {
    let data = fs.readFileSync('test/files/excel-new8.xls');
    let excelParser = new ExcelParser();
    excelParser.extractData(data);
    assert.isNotNull(excelParser.units);
    assert.isNotEmpty(excelParser.units);
    assert.isTrue(
      hasNames(
        excelParser.units,
        'COM-624Y',
        'MUS-319B',
        'ACS-332A',
        'ICC-09U',
        'DICT-107T',
        'PSY-211T',
        'PSY-408T',
        'DHR-100T',
        'GRW-611X',
        'GRA-614X',
        'MME-610X',
        'MAK-423X',
      ),
    );
  });

  it('January 2020 is parsed successfully', () => {
    let data = fs.readFileSync('test/files/excel-new9.xlsx');
    let excelParser = new ExcelParser();
    excelParser.extractData(data);
    assert.isNotNull(excelParser.units);
    assert.isNotEmpty(excelParser.units);
    assert.isTrue(
      hasNames(
        excelParser.units,
        'MIS-113B',
        'PSY-408A',
        'MUS-318A',
        'IMU-075T',
        'ICO-013T',
        'DICT-226T',
        'PSY-211X',
        'COM-408X',
        'CHD-642X',
      ),
    );
  });
});
