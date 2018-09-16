__ = require('underscore');
__.str = require('underscore.string');
__.mixin(__.str.exports());

var m = require('moment');

console.log('Week #: ' + m().week());
console.log('Start of week: ' + m().startOf('week').format('YYYY-MM-DD HH:mm:ss'));
