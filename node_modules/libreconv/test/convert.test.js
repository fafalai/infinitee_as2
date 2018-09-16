const assert = require('chai').assert;
const fs = require('fs');
const path = require('path');
const convert = require('..').convert;

describe('convert', function () {
  this.timeout(10000);

  it('should convert a word document to text', function () {
    return convert(path.join(__dirname, '/fixtures/hello.docx'), 'txt')
      .then(result => {
        assert.ok(fs.existsSync(result.output));
        assert.ok(result.stdout.includes('hello.txt'));
      });
  });
});
