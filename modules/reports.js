// *******************************************************************************************************************************************************************************************
// Public functions
function OrdersLocations(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        client.query
        (
          'select ' +
          'o1.id,' +
          'o1.orderno,' +
          'c1.id clientid,' +
          'c1.name clientname,' +
          'o1.shipto_address1 address1,' +
          'o1.shipto_city city,' +
          'o1.shipto_postcode postcode,' +
          'o1.shipto_state state,' +
          'o1.shipto_country country,' +
          'o1.datecreated ' +
          'from ' +
          'orders o1 left join clients c1 on (o1.clients_id=c1.id) ' +
          'where ' +
          'o1.customers_id=$1 ' +
          'and ' +
          'o1.datecreated between $2 and $3 ' +
          'and ' +
          'o1.dateexpired is null',
          [
            world.cn.custid,
            __.sanitiseAsDate(world.datefrom),
            __.sanitiseAsDate(world.dateto)
          ],
          function(err, result)
          {
            done();

            if (!err)
            {
              var calls = [];

              // JS returns date with TZ info/format, need in ISO format...
              result.rows.forEach
              (
                function(o)
                {
                  calls.push
                  (
                    function(callback)
                    {
                      o.datecreated = global.moment(o.datecreated).format('YYYY-MM-DD HH:mm:ss');

                      var fqaddress = __.makeaddress(o);

                      if (!__.isBlank(fqaddress))
                      {
                        global.geocoder.geocode
                        (
                          fqaddress,
                          function(err, res)
                          {
                            if (!err)
                            {
                              if (!__.isNull(res) && (res.length > 0))
                              {
                                o.gpslat = res[0].latitude;
                                o.gpslon = res[0].longitude;
                                o.fqaddress = fqaddress;
                              }
                              callback(null);
                            }
                            else
                              callback(err);
                          }
                        );
                      }
                      else
                        callback(null);
                    }
                  );
                }
              );

              global.async.series
              (
                calls,
                function(err, results)
                {
                  if (!err)
                    world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
                  else
                  {
                    msg += global.text_generalexception + ' ' + err.message;
                    global.log.error({reporderslocations: true}, msg);
                    world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                  }
                }
              );
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({reporderslocations: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({reporderslocations: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function TopXXOrders(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        client.query
        (
          'select ' +
          'o1.id,' +
          'o1.orderno,' +
          'o1.totalprice,' +
          'o1.totalgst,' +
          'c1.id clientid,' +
          'c1.name clientname,' +
          'o1.shipto_address1 address1,' +
          'o1.shipto_city city,' +
          'o1.shipto_postcode postcode,' +
          'o1.shipto_state state,' +
          'o1.shipto_country country,' +
          'o1.datecreated ' +
          'from ' +
          'orders o1 left join clients c1 on (o1.clients_id=c1.id) ' +
          'where ' +
          'o1.customers_id=$1 ' +
          'and ' +
          'o1.datecreated between $2 and $3 ' +
          'and ' +
          'o1.dateexpired is null',
          [
            world.cn.custid,
            __.sanitiseAsDate(world.datefrom),
            __.sanitiseAsDate(world.dateto)
          ],
          function(err, result)
          {
            done();

            if (!err)
            {
              var calls = [];

              // JS returns date with TZ info/format, need in ISO format...
              result.rows.forEach
              (
                function(o)
                {
                  calls.push
                  (
                    function(callback)
                    {
                      o.datecreated = global.moment(o.datecreated).format('YYYY-MM-DD HH:mm:ss');

                      callback(null, o);

                      /*
                      var fqaddress = __.makeaddress(o);
                      global.geocoder.geocode
                      (
                        fqaddress,
                        function(err, res)
                        {
                          if (!err)
                          {
                            if (!__.isNull(res) && (res.length > 0))
                            {
                              o.gpslat = res[0].latitude;
                              o.gpslon = res[0].longitude;
                              o.fqaddress = fqaddress;
                            }
                            callback(null, o);
                          }
                          else
                            callback(err);
                        }
                      );
                      */
                    }
                  );
                }
              );

              global.async.series
              (
                calls,
                function(err, result)
                {
                  if (!err)
                    world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result, pdata: world.pdata});
                  else
                  {
                    msg += global.text_generalexception + ' ' + err.message;
                    global.log.error({reporderslocations: true}, msg);
                    world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                  }
                }
              );
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({reporderslocations: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({reporderslocations: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function TopXXProductsByQty(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        client.query
        (
          'select ' +
          'sum(od1.qty) numsold,' +
          'p1.name productname ' +
          'from ' +
          'orderdetails od1 left join orders o1 on (od1.orders_id=o1.id) ' +
          '                 left join products p1 on (od1.products_id=p1.id) ' +
          'where ' +
          'o1.customers_id=$1 ' +
          'and ' +
          'o1.datecreated between $2 and $3 ' +
          'and ' +
          'od1.dateexpired is null ' +
          'and ' +
          'o1.dateexpired is null ' +
          'and ' +
          'o1.activeversion=od1.version ' +
          'group by ' +
          'od1.products_id,' +
          'p1.name ' +
          'order by ' +
          'numsold desc ' +
          'limit 20',
          [
            world.cn.custid,
            __.sanitiseAsDate(world.datefrom),
            __.sanitiseAsDate(world.dateto)
          ],
          function(err, result)
          {
            done();

            if (!err)
            {
              var calls = [];

              // JS returns date with TZ info/format, need in ISO format...
              result.rows.forEach
              (
                function(o)
                {
                  calls.push
                  (
                    function(callback)
                    {
                      callback(null, o);
                    }
                  );
                }
              );

              global.async.series
              (
                calls,
                function(err, result)
                {
                  if (!err)
                    world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result, pdata: world.pdata});
                  else
                  {
                    msg += global.text_generalexception + ' ' + err.message;
                    global.log.error({reporderslocations: true}, msg);
                    world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                  }
                }
              );
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({reporderslocations: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({reporderslocations: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function TopXXProductsByValue(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        client.query
        (
          'select ' +
          'sum(od1.qty * od1.price) totalprice,' +
          'p1.name productname ' +
          'from ' +
          'orderdetails od1 left join orders o1 on (od1.orders_id=o1.id) ' +
          '                 left join products p1 on (od1.products_id=p1.id) ' +
          'where ' +
          'o1.customers_id=$1 ' +
          'and ' +
          'o1.datecreated between $2 and $3 ' +
          'and ' +
          'od1.dateexpired is null ' +
          'and ' +
          'o1.dateexpired is null ' +
          'and ' +
          'o1.activeversion=od1.version ' +
          'group by ' +
          'od1.products_id,' +
          'p1.name ' +
          'order by ' +
          'totalprice desc ' +
          'limit 20',
          [
            world.cn.custid,
            __.sanitiseAsDate(world.datefrom),
            __.sanitiseAsDate(world.dateto)
          ],
          function(err, result)
          {
            done();

            if (!err)
            {
              var calls = [];

              // JS returns date with TZ info/format, need in ISO format...
              result.rows.forEach
              (
                function(o)
                {
                  calls.push
                  (
                    function(callback)
                    {
                      callback(null, o);
                    }
                  );
                }
              );

              global.async.series
              (
                calls,
                function(err, result)
                {
                  if (!err)
                    world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result, pdata: world.pdata});
                  else
                  {
                    msg += global.text_generalexception + ' ' + err.message;
                    global.log.error({reporderslocations: true}, msg);
                    world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                  }
                }
              );
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({reporderslocations: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({topxxproductsbyvalue: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function TPCCUsedProductCodes(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        client.query
        (
          'select ' +
          'distinct (substr(p1.code, 1, 4)) prefix ' +
          'from ' +
          'products p1 ' +
          'where  ' +
          'p1.customers_id=$1 ' +
          'and ' +
          'substr(p1.code, 1, 1)=\'C\' ' +
          'and ' +
          'substr(p1.code, 2, 1) ~ \'^[0-9]$\' ' +
          'and ' +
          'p1.dateexpired is null ' +
          'order by ' +
          'prefix',
          [
            world.cn.custid
          ],
          function(err, result)
          {
            done();

            if (!err)
            {
              var count = result.rows.length;
              var ll = result.rows[count - 1].prefix;
              var last = ll.substr(1, 3);
              var full = [];
              var n = '';
              var index = 0;

              // Find/mark gaps in code sequence....
              for (var i = 1; i <= parseInt(last); i++)
              {
                n = 'C' + __.lpad(i, 3, '0');
                if (result.rows[index].prefix == n)
                {
                  full.push({used: true, code: n});
                  index++;
                }
                else
                  full.push({used: false, code: n});
              }

              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: full, pdata: world.pdata});
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({tpccusedproductcodes: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({tpccusedproductcodes: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ProductsOrdered(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        var clauses = '';
        var binds =
        [
          world.cn.custid,
          __.sanitiseAsDate(world.datefrom),
          __.sanitiseAsDate(world.dateto)
        ];
        var bindno = binds.length + 1;

        if (!__.isUNB(world.clients)&& (world.clients.length > 0))
          clauses += 'and c1.id in (' + world.clients.toString() + ') ';

        if (!__.isUNB(world.categories) && (world.categories.length > 0))
          clauses += 'and pc1.id in (' + world.categories.toString() + ') ';

        if (!__.isUNB(world.country))
        {
          clauses += 'and o1.shipto_country=$' + bindno++ + ' ';
          binds.push(world.country);
        }

        if (!__.isUNB(world.state))
        {
          clauses += 'and o1.shipto_state=$' + bindno++ + ' ';
          binds.push(world.state);
        }

        client.query
        (
          'select ' +
          'c1.name clientname,' +
          'pc1.name productcategoryname,' +
          'p1.code productcode,' +
          'sum(od1.qty) qty ' +
          'from ' +
          'orders o1 left join orderdetails od1 on (o1.id=od1.orders_id) ' +
          '          left join products p1 on (od1.products_id=p1.id) ' +
          '          left join productcategories pc1 on (p1.productcategories_id=pc1.id) ' +
          '          left join clients c1 on (o1.clients_id=c1.id) ' +
          'where ' +
          'o1.customers_id=$1 ' +
          'and ' +
          'o1.datecreated between $2 and $3 ' +
          'and ' +
          'od1.dateexpired is null ' +
          'and ' +
          'o1.dateexpired is null ' +
          'and ' +
          'o1.activeversion=od1.version ' +
          clauses +
          'group by ' +
          'c1.name,' +
          'pc1.name,' +
          'p1.code',
          binds,
          function(err, result)
          {
            done();

            if (!err)
            {
              var calls = [];

              // JS returns date with TZ info/format, need in ISO format...
              result.rows.forEach
              (
                function(o)
                {
                  calls.push
                  (
                    function(callback)
                    {
                      callback(null, o);
                    }
                  );
                }
              );

              global.async.series
              (
                calls,
                function(err, result)
                {
                  if (!err)
                    world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result, pdata: world.pdata});
                  else
                  {
                    msg += global.text_generalexception + ' ' + err.message;
                    global.log.error({reporderslocations: true}, msg);
                    world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                  }
                }
              );
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({productsordered: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({productsordered: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

// *******************************************************************************************************************************************************************************************
// Public functions
module.exports.OrdersLocations = OrdersLocations;
module.exports.TopXXOrders = TopXXOrders;
module.exports.TopXXProductsByQty = TopXXProductsByQty;
module.exports.TopXXProductsByValue = TopXXProductsByValue;
module.exports.ProductsOrdered = ProductsOrdered;

module.exports.TPCCUsedProductCodes = TPCCUsedProductCodes;
