function foo(input)
{
  var alphabet = 'abcdefghijklmnopqrstuvwxyz';
  var length = alphabet.length;
  var result = input;
  var i = input.length;

  while (i >= 0)
  {
    var last = input.charAt(--i);
    var next = '';
    var carry = false;

    if (isNaN(last))
    {
      index = alphabet.indexOf(last.toLowerCase());

      if (index === -1)
      {
        next = last;
        carry = true;
      }
      else
      {
        var isUpperCase = last === last.toUpperCase();

        next = alphabet.charAt((index + 1) % length);
        if (isUpperCase)
          next = next.toUpperCase();

        carry = index + 1 >= length;

        if (carry && (i === 0))
        {
          var added = isUpperCase ? 'A' : 'a';

          result = added + next + result.slice(1);
          break;
        }
      }
    }
    else
    {
      next = +last + 1;
      if (next > 9)
      {
        next = 0;
        carry = true
      }

      if (carry && (i === 0))
      {
        result = '1' + next + result.slice(1);
        break;
      }
    }

    result = result.slice(0, i) + next + result.slice(i + 1);
    if (!carry)
      break;
  }
  return result;
}

console.log(foo('CODE-001'));

