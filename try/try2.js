var bn = require('decimal.js');

bn.config({precision: 20, rounding: bn.ROUND_HALF_UP});

var p  = bn(62.457);
var q = bn(11000);
var u = 605;
var qu = q.dividedBy(u);
var n1 = p.times(qu);

console.log(p.toFixed(4));
console.log(q.toFixed(4));
console.log(u.toFixed(4));
console.log(qu.toFixed(4));
console.log(n1.toFixed(4));
