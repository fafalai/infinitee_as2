// *******************************************************************************************************************************************************************************************
// Internal functions
function doNewPOSOrder(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      var clientid = __.isUN(world.clientid) ? world.custconfig.posclientid : world.clientid;

      // Note: trigger will:
      //   insert an order status entry for us...
      //   fill in default addresses fields
      //   fill in default order/invoice templates...
      tx.query
      (
        'insert into orders (customers_id,orderno,clients_id,mobileno,email,userscreated_id) values ($1,$2,$3,$4,$5,$6) returning id',
        [
          world.cn.custid,
          __.sanitiseAsString(world.orderno),
          __.sanitiseAsBigInt(clientid),
          __.makeisomobile(__.sanitiseAsString(world.mobileno)),
          __.sanitiseAsString(world.email),

          world.cn.userid
        ],
        function(err, result)
        {
          if (!err)
          {
            var orderid = result.rows[0].id;

            tx.query
            (
              'select o1.datecreated,u1.name usercreated from orders o1 left join users u1 on (o1.userscreated_id=u1.id) where o1.customers_id=$1 and o1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(orderid)
              ],
              function(err, result)
              {
                if (!err)
                {
                  var o = result.rows[0];

                  if (!__.isNull(world.products) && (world.products.length > 0))
                  {
                    var calls = [];

                    world.products.forEach
                    (
                      function(p)
                      {
                        world.version = 1;

                        calls.push
                        (
                          function(callback)
                          {
                            var od = null;
                            var version = 1;

                            global.modorders.doNewOrderDetail(tx, world.cn.custid, world.cn.userid, orderid, version, p.id, p.qty, p.exgst, p.discount, null).then
                            (
                              function(result)
                              {
                                od = result;

                                callback(null, {orderdetailid: od.orderdetailid});
                              }
                            );
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
                        {
                          resolve
                          (
                            {
                              orderid: orderid,
                              orderno: world.orderno,
                              datecreated: global.moment(o.datecreated).format('YYYY-MM-DD HH:mm:ss'),
                              usercreated: o.usercreated
                            }
                          );
                        }
                        else
                          reject(err);
                      }
                    );
                  }
                  else
                  {
                    resolve
                    (
                      {
                        orderid: orderid,
                        orderno: world.orderno,
                        datecreated: global.moment(o.datecreated).format('YYYY-MM-DD HH:mm:ss'),
                        usercreated: o.usercreated
                      }
                    );
                  }
                }
                else
                  reject(err);
              }
            );
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

// *******************************************************************************************************************************************************************************************
// Public functions
function POSGetProduct(world)
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
        var code = __.sanitiseAsString(world.code);

        // Check if barcode prefix is one of ours... (the country/company fixed portion of the barcode)
        if (!__.isBlank(world.custconfig.currentbarcodeno))
        {
          if (code.substring(0, global.config.barcodes.prefixlength) == world.custconfig.currentbarcodeno.substring(0, global.config.barcodes.prefixlength))
          {
            // Barcode reader adds check digit to end of the keyboard buffer...
            // On the other hand, if barcode is entered manuallu, might not have the check digit...
            if (code.length > global.config.barcodes.length)
              code = code.substring(0, code.length - 1);
          }
        }

        client.query
        (
          'select ' +
          'p1.id,' +
          'p1.code,' +
          'p1.name,' +
          'p1.barcode,' +
          'p1.costprice,' +
          'pc1.price exgst,' +
          'pc1.gst,' +
          'pc1.price + pc1.gst price,' +
          'p1.uomsize,' +
          'getproductinventorytotalforlocation($1,$2,p1.id) stockqty ' +
          'from ' +
          'products p1 left join pricing pc1 on (p1.id=pc1.products_id) ' +
          '            left join productcodes c1 on (p1.id=c1.products_id) ' +
          'where ' +
          'p1.customers_id=$3 ' +
          'and ' +
          'p1.dateexpired is null ' +
          'and ' +
          '(' +
          'upper(p1.code)=upper($4) ' +
          'or ' +
          'upper(p1.barcode)=upper($5) ' +
          'or ' +
          'upper(c1.code)=upper($6) ' +
          'or ' +
          'upper(c1.barcode)=upper($7) ' +
          'or ' +
          'p1.name ilike $8' +
          ') ' +
          'order by ' +
          'p1.name,' +
          'p1.code',
          [
            world.cn.custid,
            global.config.pos.locationid_warehouse,
            world.cn.custid,
            code,
            code,
            code,
            code,
            '%' + code + '%'
          ],
          function(err, result)
          {
            done();

            if (!err)
              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({posgetproduct: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({posgetproduct: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function POSGenBarcode(world)
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
        var tx = new global.pgtx(client);
        tx.begin
        (
          function(err)
          {
            if (!err)
            {
              global.modconfig.doNextBarcodeNo(tx, world).then
              (
                function(result)
                {
                  tx.commit
                  (
                    function(err)
                    {
                      if (!err)
                      {
                        done();

                        world.spark.emit
                        (
                          world.eventname,
                          {
                            rc: global.errcode_none,
                            msg: global.text_success,
                            barcodeno: result.barcodeno,
                            pdata: world.pdata
                          }
                        );
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({posgenbarcode: true}, msg);
                            world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
                          }
                        );
                      }
                    }
                  );
                }
              ).then
              (
                null,
                function(err)
                {
                  tx.rollback
                  (
                    function(ignore)
                    {
                      done();

                      msg += global.text_generalexception + ' ' + err.message;
                      global.log.error({posgenbarcode: true}, msg);
                      world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                    }
                  );
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({posgenbarcode: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
        }
        );
      }
      else
      {
        global.log.error({posgenbarcode: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function POSQuote(world)
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
        var tx = new global.pgtx(client);
        tx.begin
        (
          function(err)
          {
            var order = null;

            if (!err)
            {
              global.modconfig.doNextOrderNo(tx, world).then
              (
                function(result)
                {
                  world.orderno = result.orderno;
                  //
                  return doNewPOSOrder(tx, world);
                }
              ).then
              (
                function(result)
                {
                  order = result;
                  total = __.toBigNum(world.total);
                  cash = __.toBigNum(world.cash);

                  world.locationid = global.config.pos.locationid_warehouse;
                  return global.modinvoices.doPayment(tx, world);
                }
              ).then
              (
                function(result)
                {
                  order = result;

                  tx.commit
                  (
                    function(err)
                    {
                      if (!err)
                      {
                        done();
                        world.spark.emit
                        (
                          world.eventname,
                          {
                            rc: global.errcode_none,
                            msg: global.text_success,
                            orderid: order.orderid,
                            orderno: order.orderno,
                            datecreated: order.datecreated,
                            usercreated: order.usercreated,
                            pdata: world.pdata
                          }
                        );
                        global.pr.sendToRoomExcept
                        (
                          global.custchannelprefix + world.cn.custid,
                          'ordercreated',
                          {
                            orderid: order.orderid,
                            orderno: order.orderno,
                            datecreated: order.datecreated,
                            usercreated: order.usercreated
                          },
                          world.spark.id
                        );
                        // We also updated config (with new orderno) so let everyone know that too...
                        global.pr.sendToRoom(global.custchannelprefix + world.cn.custid, 'configsaved', {});
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({posquote: true}, msg);
                            world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
                          }
                        );
                      }
                    }
                  );
                }
              ).then
              (
                null,
                function(err)
                {
                  tx.rollback
                  (
                    function(ignore)
                    {
                      done();

                      msg += global.text_generalexception + ' ' + err.message;
                      global.log.error({posquote: true}, msg);
                      world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                    }
                  );
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({posquote: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({posquote: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function POSCashSale(world)
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
        var tx = new global.pgtx(client);
        tx.begin
        (
          function(err)
          {
            var order = null;
            var cash = null;
            var total = null;
            var tendered = null;
            var change = null;

            if (!err)
            {
              global.modconfig.doNextOrderNo(tx, world).then
              (
                function(result)
                {
                  world.orderno = result.orderno;
                  //
                  return doNewPOSOrder(tx, world);
                }
              ).then
              (
                function(result)
                {
                  order = result;
                  total = __.toBigNum(world.total);
                  cash = __.toBigNum(world.cash);

                  if (cash.greaterThan(total))
                  {
                    tendered = cash;
                    change = cash.minus(total);
                    cash = total;
                  }

                  world.invoices =
                  [
                    {
                      orderid: order.orderid,
                      type: global.itype_paymenttype_cash,
                      reason: global.itype_paymentreason_pos,
                      amount: __.sanitiseAsPrice(cash, 2),
                      tendered: __.sanitiseAsPrice(tendered, 2),
                      change: __.sanitiseAsPrice(change, 2)
                    }
                  ];

                  world.locationid = global.config.pos.locationid_warehouse;
                  return global.modinvoices.doPayment(tx, world);
                }
              ).then
              (
                function(result)
                {
                  tx.commit
                  (
                    function(err)
                    {
                      if (!err)
                      {
                        done();
                        world.spark.emit
                        (
                          world.eventname,
                          {
                            rc: global.errcode_none,
                            msg: global.text_success,
                            orderid: order.orderid,
                            orderno: order.orderno,
                            total: __.sanitiseAsPrice(total, 2),
                            cash: __.sanitiseAsPrice(cash, 2),
                            tendered: __.sanitiseAsPrice(tendered, 2),
                            change: __.sanitiseAsPrice(change, 2),
                            datecreated: order.datecreated,
                            usercreated: order.usercreated,
                            pdata: world.pdata
                          }
                        );
                        global.pr.sendToRoomExcept
                        (
                          global.custchannelprefix + world.cn.custid,
                          'ordercreated',
                          {
                            orderid: order.orderid,
                            orderno: order.orderno,
                            total: __.sanitiseAsPrice(total, 2),
                            cash: __.sanitiseAsPrice(cash, 2),
                            tendered: __.sanitiseAsPrice(tendered, 2),
                            change: __.sanitiseAsPrice(change, 2),
                            datecreated: order.datecreated,
                            usercreated: order.usercreated
                          },
                          world.spark.id
                        );
                        // We also updated config (with new orderno) so let everyone know that too...
                        global.pr.sendToRoom(global.custchannelprefix + world.cn.custid, 'configsaved', {});
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({poscashsale: true}, msg);
                            world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
                          }
                        );
                      }
                    }
                  );
                }
              ).then
              (
                null,
                function(err)
                {
                  tx.rollback
                  (
                    function(ignore)
                    {
                      done();

                      msg += global.text_generalexception + ' ' + err.message;
                      global.log.error({poscashsale: true}, msg);
                      world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                    }
                  );
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({poscashsale: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({poscashsale: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function POSCreditSale(world)
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
        var tx = new global.pgtx(client);
        tx.begin
        (
          function(err)
          {
            var order = null;

            if (!err)
            {
              global.modconfig.doNextOrderNo(tx, world).then
              (
                function(result)
                {
                  world.orderno = result.orderno;
                  //
                  return doNewPOSOrder(tx, world);
                }
              ).then
              (
                function(result)
                {
                  order = result;

                  world.invoices =
                  [
                    {
                      orderid: order.orderid,
                      type: global.itype_paymenttype_cc,
                      reason: global.itype_paymentreason_pos,
                      amount: world.credit,
                      tendered: null,
                      change: null
                    }
                  ];

                  world.locationid = global.config.pos.locationid_warehouse;
                  return global.modinvoices.doPayment(tx, world);
                }
              ).then
              (
                function(result)
                {
                  tx.commit
                  (
                    function(err)
                    {
                      if (!err)
                      {
                        done();
                        world.spark.emit
                        (
                          world.eventname,
                          {
                            rc: global.errcode_none,
                            msg: global.text_success,
                            orderid: order.orderid,
                            orderno: order.orderno,
                            total: world.total,
                            credit: world.credit,
                            datecreated: order.datecreated,
                            usercreated: order.usercreated,
                            pdata: world.pdata
                          }
                        );
                        global.pr.sendToRoomExcept
                        (
                          global.custchannelprefix + world.cn.custid,
                          'ordercreated',
                          {
                            orderid: order.orderid,
                            orderno: order.orderno,
                            total: world.total,
                            credit: world.credit,
                            datecreated: order.datecreated,
                            usercreated: order.usercreated
                          },
                          world.spark.id
                        );
                        // We also updated config (with new orderno) so let everyone know that too...
                        global.pr.sendToRoom(global.custchannelprefix + world.cn.custid, 'configsaved', {});
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({poscreditsale: true}, msg);
                            world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
                          }
                        );
                      }
                    }
                  );
                }
              ).then
              (
                null,
                function(err)
                {
                  tx.rollback
                  (
                    function(ignore)
                    {
                      done();

                      msg += global.text_generalexception + ' ' + err.message;
                      global.log.error({poscreditsale: true}, msg);
                      world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                    }
                  );
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({poscreditsale: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({poscreditsale: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function POSSplitSale(world)
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
        var tx = new global.pgtx(client);
        tx.begin
        (
          function(err)
          {
            var order = null;

            if (!err)
            {
              global.modconfig.doNextOrderNo(tx, world).then
              (
                function(result)
                {
                  world.orderno = result.orderno;
                  //
                  return doNewPOSOrder(tx, world);
                }
              ).then
              (
                function(result)
                {
                  order = result;
                  world.invoices =
                  [
                    {
                      orderid: order.orderid,
                      type: global.itype_paymenttype_cash,
                      reason: global.itype_paymentreason_pos,
                      amount: world.cash,
                      tendered: world.cash,
                      change: null
                    },
                    {
                      orderid: order.orderid,
                      type: global.itype_paymenttype_cc,
                      reason: global.itype_paymentreason_pos,
                      amount: world.credit,
                      tendered: null,
                      change: null
                    }
                  ];
                  return global.modinvoices.doPayment(tx, world);
                }
              ).then
              (
                function(result)
                {
                  tx.commit
                  (
                    function(err)
                    {
                      if (!err)
                      {
                        done();
                        world.spark.emit
                        (
                          world.eventname,
                          {
                            rc: global.errcode_none,
                            msg: global.text_success,
                            orderid: order.orderid,
                            orderno: order.orderno,
                            total: world.total,
                            cash: world.cash,
                            credit: world.credit,
                            datecreated: order.datecreated,
                            usercreated: order.usercreated,
                            pdata: world.pdata
                          }
                        );
                        global.pr.sendToRoomExcept
                        (
                          global.custchannelprefix + world.cn.custid,
                          'ordercreated',
                          {
                            orderid: order.orderid,
                            orderno: order.orderno,
                            total: world.total,
                            cash: world.cash,
                            credit: world.credit,
                            datecreated: order.datecreated,
                            usercreated: order.usercreated
                          },
                          world.spark.id
                        );
                        // We also updated config (with new orderno) so let everyone know that too...
                        global.pr.sendToRoom(global.custchannelprefix + world.cn.custid, 'configsaved', {});
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({possplitsale: true}, msg);
                            world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
                          }
                        );
                      }
                    }
                  );
                }
              ).then
              (
                null,
                function(err)
                {
                  tx.rollback
                  (
                    function(ignore)
                    {
                      done();

                      msg += global.text_generalexception + ' ' + err.message;
                      global.log.error({possplitsale: true}, msg);
                      world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                    }
                  );
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({possplitsale: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({possplitsale: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function POSSearchSale(world)
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
        var maxhistory = __.isUN(world.maxhistory) ? 50 : world.maxhistory;
        var clauses = '';
        var binds = [world.cn.custid];
        var bindno = binds.length + 1;

        if (!__.isUNB(world.orderno))
        {
          clauses += '(upper(o1.orderno) like upper($' + bindno++ + ')) and ';
          binds.push('%' + world.orderno + '%');
        }

        if (!__.isUNB(world.datefrom))
        {
          var df = global.moment(world.datefrom).format('YYYY-MM-DD 00:00:00');

          if (!__.isUNB(world.dateto))
          {
            var dt = global.moment(world.dateto).format('YYYY-MM-DD 23:59:59');

            // Search between datefrom and dateto
            clauses += '(o1.datecreated between $' + bindno++ + ' and $' + bindno++ + ') and ';
            binds.push(df);
            binds.push(dt);
          }
          else
          {
            // Search between datefrom and now
            clauses += '(o1.datecreated between $' + bindno++ + ' and now()) and ';
            binds.push(df);
          }
        }
        else
        {
          if (!__.isUNB(world.dateto))
          {
            var dt = global.moment(world.dateto).format('YYYY-MM-DD 23:59:59');

            // Search between beginning and dateto
            clauses += '(o1.datecreated <= $' + bindno++ + ') and ';
            binds.push(df);
          }
        }

        // Lastly, make sure we don't end up with too many rows...
        binds.push(maxhistory);

        client.query
        (
          'select ' +
          'o1.id,' +
          'o1.orderno,' +
          'o1.datecreated,' +
          'o1.totalprice,' +
          'o1.totalgst,' +
          'o1.totalprice + o1.totalgst total,' +
          'o1.mobileno,' +
          'o1.email,' +
          'o1.datecreated,' +
          'u1.name usercreated ' +
          'from ' +
          'orders o1 left join users u1 on (o1.userscreated_id=u1.id) ' +
          'where ' +
          'o1.customers_id=$1 ' +
          'and ' +
          clauses +
          'o1.dateexpired is null ' +
          'order by ' +
          'o1.datecreated desc ' +
          'limit $' + bindno,
          binds,
          function(err, result)
          {
            done();

            if (!err)
            {
              result.rows.forEach
              (
                function(o)
                {
                  o.datecreated = global.moment(o.datecreated).format('YYYY-MM-DD HH:mm:ss');
                }
              );

              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({possearchsale: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({possearchsale: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function POSLoadSale(world)
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
        var order = {};

        // Order header first...
        client.query
        (
          'select ' +
          'o1.id,' +
          'o1.orderno,' +
          'o1.datecreated,' +
          'o1.totalprice,' +
          'o1.totalgst,' +
          'o1.totalprice + o1.totalgst total,' +
          'o1.mobileno,' +
          'o1.email,' +
          'o1.datecreated,' +
          'y1.tendered,' +
          'y1.change,' +
          'y1.paymenttype,' +
          'u1.name usercreated ' +
          'from ' +
          'orders o1 left join payments y1 on (o1.id=y1.orders_id) ' +
          '          left join users u1 on (o1.userscreated_id=u1.id) ' +
          'where ' +
          'o1.customers_id=$1 ' +
          'and ' +
          'o1.dateexpired is null ' +
          'and ' +
          'upper(o1.orderno)=upper($2)',
          [
            world.cn.custid,
            __.sanitiseAsString(world.orderno)
          ],
          function(err, result)
          {
            if (!err)
            {
              order = result.rows[0];
              order.datecreated = global.moment(order.datecreated).format('YYYY-MM-DD HH:mm:ss');

              client.query
              (
                'select ' +
                'od1.products_id productid,' +
                'od1.qty,' +
                'od1.price exgst,' +
                'od1.gst,' +
                'od1.price + od1.gst price,' +
                'od1.discount,' +
                'p1.code,' +
                'p1.name,' +
                'p1.uomsize ' +
                'from ' +
                'orderdetails od1 left join products p1 on (od1.products_id=p1.id) ' +
                'where ' +
                'od1.customers_id=$1 ' +
                'and ' +
                'od1.orders_id=$2',
                [
                  world.cn.custid,
                  __.sanitiseAsBigInt(order.id)
                ],
                function(err, result)
                {
                  done();

                  if (!err)
                    world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, order: order, products: result.rows, pdata: world.pdata});
                  else
                  {
                    msg += global.text_generalexception + ' ' + err.message;
                    global.log.error({posloadsale: true}, msg);
                    world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                  }
                }
              );
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({posloadsale: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({posloadsale: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function POSNewCust(world)
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
        var tx = new global.pgtx(client);
        tx.begin
        (
          function(err)
          {
            var order = null;

            if (!err)
            {
              global.modconfig.doNextClientNo(tx, world).then
              (
                function(result)
                {
                  world.code = result.clientno;
                  world.issupplier = false;
                  world.isclient = true;
                  world.isactive = true;
                  world.country = global.config.defaults.defaultcountry;
                  return global.modclients.doNewClient(tx, world);
                }
              ).then
              (
                function(result)
                {
                  tx.commit
                  (
                    function(err)
                    {
                      if (!err)
                      {
                        done();
                        world.spark.emit
                        (
                          world.eventname,
                          {
                            rc: global.errcode_none,
                            msg: global.text_success,
                            clientid: result.clientid,
                            code: world.code,
                            datecreated: result.datecreated,
                            usercreated: result.usercreated,
                            pdata: world.pdata
                          }
                        );
                        global.pr.sendToRoomExcept
                        (
                          global.custchannelprefix + world.cn.custid,
                          'poscustcreated',
                          {
                            clientid: result.clientid,
                            code: world.code,
                            datecreated: result.datecreated,
                            usercreated: result.usercreated
                          },
                          world.spark.id
                        );
                        // We also updated config (with new orderno) so let everyone know that too...
                        global.pr.sendToRoom(global.custchannelprefix + world.cn.custid, 'configsaved', {});
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({posnewcust: true}, msg);
                            world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
                          }
                        );
                      }
                    }
                  );
                }
              ).then
              (
                null,
                function(err)
                {
                  tx.rollback
                  (
                    function(ignore)
                    {
                      done();

                      msg += global.text_generalexception + ' ' + err.message;
                      global.log.error({posnewcust: true}, msg);
                      world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                    }
                  );
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({posnewcust: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({posnewcust: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function POSSalesTotal(world)
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
          'sum(p1.amount) total,' +
          'p1.paymenttype ' +
          'from ' +
          'payments p1 ' +
          'where ' +
          'p1.customers_id=$1 ' +
          'and ' +
          'p1.locations_id=$2 ' +
          'and ' +
          'p1.datecreated between $3 and $4 ' +
          'group by ' +
          'p1.paymenttype',
          [
            world.cn.custid,
            __.sanitiseAsBigInt(global.config.pos.locationid_warehouse),
            __.sanitiseAsDate(world.datefrom),
            __.sanitiseAsDate(world.dateto)
          ],
          function(err, result)
          {
            done();

            if (!err)
              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({possalestotal: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({possalestotal: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

// *******************************************************************************************************************************************************************************************
// Public functions
module.exports.POSGetProduct = POSGetProduct;
module.exports.POSGenBarcode = POSGenBarcode;
module.exports.POSQuote = POSQuote;
module.exports.POSCashSale = POSCashSale;
module.exports.POSCreditSale = POSCreditSale;
module.exports.POSSplitSale = POSSplitSale;
module.exports.POSSearchSale = POSSearchSale;
module.exports.POSLoadSale = POSLoadSale;
module.exports.POSNewCust = POSNewCust;
module.exports.POSSalesTotal = POSSalesTotal;
