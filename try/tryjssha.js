var jssha = require('jssha');

var sha512 = new jssha('SHA-512', 'TEXT');

sha512.update('letmein' + '98a289662ca34194e92928c01bc23460');
console.log(sha512.getHash('HEX'));
