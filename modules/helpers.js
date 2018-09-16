// *******************************************************************************************************************************************************************************************
// Public functions
function CalcRemoveTaxCodeComponent(tx, custid, cost, taxcodeid)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      var tax = 0.0;

      if ((cost > 0) && !__.isNull(taxcodeid))
      {
        // Get the tax code details...
        tx.query
        (
          'select t1.percentage from taxcodes t1 where t1.customers_id=$1 and t1.id = $2',
          [
            custid,
            taxcodeid
          ],
          function(err, result)
          {
            if (!err && !__.isUndefined(result.rows) && (result.rows.length > 0))
            {
              var percent = result.rows[0].percentage;

              if (!__.isBlank(cost) && (cost != 0) && (percent != 0))
              {
                // To remove TAX:
                // (100% + TAX) / x = TAX
                // Therefore x = (100 + TAX) / TAX
                // Therefore to retrieve original value minus TAX component = (total_inc_tax / x)
                // e.g. TAX=10%, total = $4309.31
                // Just divide by 11 - reason - the price equals 100%, the TAX is 10% therefore the total is 110%
                // To get the TAX divide by 11 (i.e. 110% divided by 11 = 10%)
                // So, if $4309.31 is the total, $391.75 is TAX

                divisor = (100.0 + percent) / percent;
                tax = cost / divisor;
              }
            }
            resolve(tax);
          }
        );
      }
      else
        resolve(tax);
    }
  );
  return promise;
}

function CalcTaxCodeComponent(tx, custid, cost, taxcodeid)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      var tax = 0.0;

      if ((cost > 0) && !__.isNull(taxcodeid))
      {
        // Get the tax code details...
        tx.query
        (
          'select t1.percentage from taxcodes t1 where t1.customers_id=$1 and t1.id = $2',
          [
            custid,
            taxcodeid
          ],
          function(err, result)
          {
            if (!err && !__.isUndefined(result.rows) && (result.rows.length > 0))
            {
              var percent = result.rows[0].percentage;

              if (!_.isBlank(cost) && (cost != 0) && (percent != 0))
                tax = (cost * percent) / 100.0;
            }
            resolve(tax);
          }
        );
      }
      else
        resolve(tax);
    }
  );
  return promise;
}

function NewUniqueCode(tx, custid, prefix)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      if (__.isUNB(prefix))
        prefix = global.text_newcode;
      tx.query
      (
        'insert into codesequences (customers_id) values ($1) returning id',
        custid,
        function(err, result)
        {
          if (!err)
          {
            var newcode = prefix + result.rows[0].id;
            resolve(newcode.toString());
          }
          else
            reject(err)
        }
      );
    }
  );
  return promise;
}

// *******************************************************************************************************************************************************************************************
// Public functions
module.exports.CalcRemoveTaxCodeComponent = CalcRemoveTaxCodeComponent;
module.exports.CalcTaxCodeComponent = CalcTaxCodeComponent;
module.exports.NewUniqueCode = NewUniqueCode;
