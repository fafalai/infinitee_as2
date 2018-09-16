__ = require('underscore');
__.str = require('underscore.string');
__.mixin(__.str.exports());

var prices =
[
  {clientid: null, price: 3.4, min: null, max: null},
  {clientid: null, price: 5.1, min: 20.0, max: 45.0},
  {clientid: 19,   price: 5.7, min: null, max: null},
  {clientid: 19,   price: 6.3, min: 10.0, max: null}
];


var price = 0.0;
var clientid = null;
var qty = 42.0;

prices.forEach
(
  function(p)
  {
    function checkRange()
    {
      var tmpqty = null;

      // Do qty range check ...
      if (!__.isNull(qty))
      {
        // We have a qty range...
        if (!__.isNull(p.min) && !__.isNull(p.max))
        {
          if ((qty >= p.min) && (qty <= p.max))
            tmpqty = p.price;
        }
        else if (!__.isNull(p.min))
        {
          // Only have a min qty...
          if (qty >= p.min)
            tmpqty = p.price;
        }
        else if (!__.isNull(p.max))
        {
          // Only have max qty...
          if (qty <= p.max)
            tmpqty = p.price;
        }
        else
        {
          // No min or max qty in entry
          tmpqty = p.price;
        }
      }
      return tmpqty;
    }

    // Entry is not client specific...
    if (__.isNull(p.clientid))
    {
      var q = checkRange();
      if (!__.isNull(q))
        price = p.price;
    }
    else
    {
      // Entry contains client specific pricing...
      // If no client supplied, then we ignore this entry
      // If client supplied, then has to match this entry...
      if (!__.isNull(clientid) && (clientid == p.clientid))
      {
        var q = checkRange();
        if (!__.isNull(q))
          price = p.price;
      }
    }
  }
);

console.log(price);