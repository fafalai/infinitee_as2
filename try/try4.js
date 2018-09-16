StringArrayToString = function(a)
{
  var s = '';

  if (a.length > 0)
  {
    s = '\'' + a[0] + '\'';
    for (var i = 1; i < a.length; i++)
      s += ',\'' + a[i] + '\'';
  }

  return s;
};



var f = ['1234', 'abc', 'fred'];

console.log(StringArrayToString(f));