var m = require('moment');
var dw = require('diceware-password-generator');

__ = require('underscore');
__.str = require('underscore.string');
__.mixin(__.str.exports());

var d1 = m('2016-06-07');
var d2 = m('2016-06-11');
var now = m('2016-06-06');

console.log(now.format('YYYY-MM-DD'));

console.log(now.isBetween(d1, d2));
console.log(now.isSameOrAfter(d1));

//
var pwd = dw({wordcount: 3, format: 'string'});
console.log(pwd);
console.log(__.replaceAll(pwd, ' ', ''));



