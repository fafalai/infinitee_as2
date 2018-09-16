var as = require('async');
var data = ['abc', 'def', '123', 'ghi'];
var found = false;
var idx = 0;

as.whilst
(
  function()
  {
    return (!found && (idx < data.length) && (data[idx] != '123'));
  },
  function(callback)
  {
    var d = data[idx++];
    console.log('Processing ' + d);
    callback(null, d);
  },
  function(err, result)
  {
    if (err)
      console.log(err);
    else
    {
      console.log(result);
    }
  }
);

