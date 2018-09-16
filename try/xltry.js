var xl = require('hd-xlsx');
var wb = xl.readFile('./Accounts.xlsx');

var sheetname = wb.SheetNames[0];
var ws = wb.Sheets[sheetname];

var cell1 = ws['A1'];
var cell2 = ws['A2'];

console.log('=========================');
console.log(cell1);
console.log(cell2);

