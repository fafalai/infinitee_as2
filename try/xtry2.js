var fs = require('fs');
var xl = require('node-xlsx');

var data = xl.parse(fs.readFileSync('./Accounts.xlsx'));

data.forEach
(
  function(d)
  {
    console.log(d);
  }
);

