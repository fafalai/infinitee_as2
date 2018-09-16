// Underscore stuff...
__ = require('underscore');
__.str = require('underscore.string');
__.mixin(__.str.exports());


console.log(__.prune('my string is here', 6));
console.log(__.truncate('my string is here', 6));
console.log(('my string is here').substring(0, 6));



var d = new Date();
var s = d.toISOString();
console.log(s);

var x = Date.parse(s);
console.log(new Date().toString());
