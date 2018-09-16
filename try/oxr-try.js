
var oxr = require('open-exchange-rates');
var fx = require('money');

__ = require('underscore');
__.str = require('underscore.string');
__.mixin(__.str.exports());

oxr.set({app_id: '7af5f4439c4f4b5ab53375bcea47435d'});

oxr.latest
(
  function()
  {
    console.log(oxr.rates.USD);
    console.log(oxr.rates.AUD);
    var relative = oxr.rates.AUD;

    __.each
    (
      oxr.rates,
      function(v, k)
      {
        oxr.rates[k] = v / relative;
        //console.log(k + '  ' + v );
      }
    );



    fx.rates = oxr.rates;
    fx.base = 'AUD';//oxr.base;

    //console.log(fx.convert(1.0, {from: 'USD', to: 'AUD'}));
    //console.log(fx.convert(1.0, {from: 'AUD', to: 'USD'}));

    console.log(fx(1.0).from('USD').to('AUD'));
    console.log(fx(1.0).from('AUD').to('USD'));

    /*
    console.log('==============================');
    __.each
    (
      oxr.rates,
      function(v, k)
      {
        console.log(k + '  ' + v );
      }
    );
    */
  }
);



