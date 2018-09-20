// *******************************************************************************************************************************************************************************************
// Internal functions
function doGetCustIdFromOrderNo(orderno)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      global.pg.connect
      (
        global.cs,
        function(err, client, done)
        {
          if (!err)
          {
            client.query
            (
              'select o1.customers_id customerid from orders o1 where o1.orderno=$1 and o1.dateexpired is null',
              [
                orderno
              ],
              function(err, result)
              {
                done();

                if (!err)
                  resolve({customerid: result.rows[0].customerid});
                else
                {
                  global.log.error({dogetcustidfrominvoiceno: true}, err.message);
                  reject(err);
                }
              }
            );
          }
          else
          {
            global.log.error({dogetcustidfrominvoiceno: true}, global.text_nodbconnection);
            reject(err);
          }
        }
      );
    }
  );
  return promise;
}

function doNewJobSheet(tx, custid, userid, jobsheetno, orderid, orderdetailid, buildtemplateheaderid)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'insert into jobsheets (customers_id,jobsheetno,orders_id,orderdetails_id,buildtemplateheaders_id,userscreated_id) values ($1,$2,$3,$4,$5,$6)',
        [
          custid,
          __.sanitiseAsString(jobsheetno),
          __.sanitiseAsBigInt(orderid),
          __.sanitiseAsBigInt(orderdetailid),
          __.sanitiseAsBigInt(buildtemplateheaderid),
          __.sanitiseAsBigInt(userid)
        ],
        function(err, result)
        {
          if (!err)
            resolve(undefined);
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doExpireJobSheet(tx, custid, userid, orderid, orderdetailid)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'update jobsheets set dateexpired=now(),usersexpired_id=$1 where customers_id=$2 and orders_id=$3 and orderdetails_id=$4 returning jobsheetno',
        [
          __.sanitiseAsBigInt(userid),
          __.sanitiseAsBigInt(custid),
          __.sanitiseAsBigInt(orderid),
          __.sanitiseAsBigInt(orderdetailid)
        ],
        function(err, result)
        {
          if (!err)
            resolve({jobsheetno: result.rows[0].jobsheetno});
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doSaveInvoice(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'update orders set invoiceno=$1,invoicedate=now(),userinvoiced_id=$2 where customers_id=$3 and id=$4',
        [
          world.invoiceno,
          world.cn.userid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.orderid)
        ],
        function(err, result)
        {
          if (!err)
            resolve(undefined);
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doCommitOrderInventory(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      if (!__.isUN(world.commitstatus))
      {
        tx.query
        (
          'update orders set inventorycommitted=1 where customers_id=$1 and id=$2',
          [
            world.cn.custid,
            __.sanitiseAsBigInt(world.orderid)
          ],
          function(err, result)
          {
            if (!err)
              resolve(undefined);
            else
              reject(err);
          }
        );
      }
      else
        resolve(undefined);
    }
  );

  return promise;
}

function doInventoryAdjust(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      if (!__.isUN(world.commitstatus))
      {
        // Get products used in this order...
        // Make sure it's latest (active) order version
        tx.query
        (
          'select ' +
          'od1.products_id productid,' +
          'od1.qty,' +
          'od1.price,' +
          'od1.gst,' +
          'p1.costofgoodsaccounts_id,' +
          'p1.incomeaccounts_id,' +
          'p1.assetaccounts_id,' +
          'p1.buytaxcodes_id,' +
          'p1.selltaxcodes_id,' +
          'p1.uom,' +
          'p1.uomsize,' +
          'o1.orderno ' +
          'from ' +
          'orderdetails od1 left join orders o1 on (od1.orders_id=o1.id and od1.version=o1.activeversion) ' +
          '                 left join products p1 on (od1.products_id=p1.id) ' +
          'where ' +
          'od1.customers_id=$1 ' +
          'and ' +
          'o1.id=$2 ' +
          'and ' +
          'od1.dateexpired is null',
          [
            world.cn.custid,
            __.sanitiseAsBigInt(world.orderid)
          ],
          function(err, result)
          {
            if (!err && (result.rows.length > 0))
            {
              var calls = [];

              result.rows.forEach
              (
                function(r)
                {
                  calls.push
                  (
                    function(callback)
                    {
                      var uomsize = __.isUN(r.uomsize) ? 1 : __.sanitiseAsPrice(r.uomsize);
                      // TODO: if using UOM for orders, then qty = uom * qty ie. __.formatnumber(-r.qty * uomsize, 4)
                      tx.query
                      (
                        'insert into inventory (customers_id,locations_id,products_id,qty,type,other_id,userscreated_id) values ($1,$2,$3,$4,$5,$6,$7) returning id',
                        [
                          world.cn.custid,
                          __.sanitiseAsBigInt(world.custconfig.defaultinventorylocationid),
                          __.sanitiseAsBigInt(r.productid),
                          __.formatnumber(-r.qty, 4),
                          global.itype_inventory_order,
                          __.sanitiseAsBigInt(world.orderid),
                          world.cn.userid
                        ],
                        function(err, result)
                        {
                          if (!err)
                          {
                            var invresult = result;
                            var assetaccountid = r.assetaccounts_id;
                            var selltaxcodeid = r.selltaxcodes_id;

                            if (__.isUN(assetaccountid))
                              assetaccountid = world.custconfig.productassetaccountid;

                            if (__.isUN(selltaxcodeid))
                              selltaxcodeid = world.custconfig.productselltaxcodeid;

                            global.modjournals.doAddJournalEntry
                            (
                              tx,
                              {
                                custid: world.cn.custid,
                                userid: world.cn.userid,
                                type: global.itype_journal_inventory_sale,
                                refno: r.orderno,
                                comments: null,
                                entries:
                                [
                                  {
                                    debitaccountid: world.custconfig.inventoryadjustaccountid,
                                    creditaccountid: assetaccountid,
                                    taxcodeid: selltaxcodeid,
                                    amount: r.price * r.qty
                                  }
                                ]
                              }
                            ).then
                            (
                              function(result)
                              {
                                callback(null, invresult.rows[0].id);
                              }
                            ).then
                            (
                              null,
                              function(err)
                              {
                                callback(err);
                              }
                            );
                          }
                          else
                            callback(err);
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
                    resolve(results);
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
      else
        resolve(undefined);
    }
  );

  return promise;
}

function doCheckStatusForInventoryAdjust(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      global.customers.get
      (
        global.config.redis.custconfig + world.cn.custid,
        function(err, configobj)
        {
          if (!err)
          {
            global.safejsonparse
            (
              configobj,
              function(err, co)
              {
                if (!err)
                {
                  // Trigger status?
                  if (co.statusid == world.status)
                  {
                    // Now check if this order has been commmitted already...
                    tx.query
                    (
                      'select o1.inventorycommitted from orders o1 where o1.customers_id=$1 and o1.id=$2',
                      [
                        world.cn.custid,
                        __.sanitiseAsBigInt(world.orderid)
                      ],
                      function(err, result)
                      {
                        if (!err)
                        {
                          if ((result.rows.length == 1) && (result.rows[0].inventorycommitted == 0))
                            resolve({commitstatus: co.statusid});
                          else
                            resolve(null);
                        }
                        else
                          reject(err);
                      }
                    );
                  }
                  else
                    resolve(null);
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

function doSendStatusAlerts(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'select osa1.users_id,osa1.email,osa1.mobile,u1.uuid,o1.orderno from orderstatusalerts osa1 left join users u1 on (osa1.users_id=u1.id),orders o1 where osa1.customers_id=$1 and osa1.status=$2 and osa1.dateexpired is null and o1.id=$3',
        [
          world.cn.custid,
          world.status,
          __.sanitiseAsBigInt(world.orderid)
        ],
        function(err, result)
        {
          if (!err)
          {
            result.rows.forEach
            (
              function(a)
              {
                global.users.get
                (
                  global.config.redis.prefix + a.uuid,
                  function(err, uuidobj)
                  {
                    if (!err)
                    {
                      global.safejsonparse
                      (
                        uuidobj,
                        function(err, uo)
                        {
                          if (!err)
                          {
                            tx.query
                            (
                              'insert into alerts (customers_id,users_id,orderno,status,userscreated_id) values ($1,$2,$3,$4,$5)',
                              [
                                world.cn.custid,
                                uo.userid,
                                a.orderno,
                                world.status,
                                world.cn.userid
                              ],
                              function(err, result)
                              {
                                if (!err)
                                {
                                  // Is user logged in?
                                  // And don't send to ourself...
                                  if (!__.isUN(uo.sparkid) && (uo.userid != world.cn.userid))
                                  {
                                    var spark = global.pr.spark(uo.sparkid);
                                    spark.emit('orderstatusalert', {orderid: world.orderid, orderno: a.orderno, status: world.status, by: world.cn.uname});
                                  }
                                }
                              }
                            );
                          }
                        }
                      );
                    }
                  }
                );
              }
            )
          }
          // Doesn't really matter if we succeed or fail to send notifications out, we always resolve to caller...
          resolve(null);
        }
      );
    }
  );
  return promise;
}

function existingOrderAttachment(args, callback)
{
  // We need user id and customer id to validate request
  // Find user in cache...
  global.users.get
  (
    global.config.redis.prefix + args.uuid,
    function(err, uuidobj)
    {
      if (!err)
      {
        global.safejsonparse
        (
          uuidobj,
          function(err, uo)
          {
            if (!err)
            {
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
                      'o1.orders_id orderid,' +
                      'o1.name,' +
                      'o1.size ' +
                      'from ' +
                      'orderattachments o1 ' +
                      'where ' +
                      'o1.customers_id=$1 ' +
                      'and ' +
                      'o1.id=$2',
                      [
                        uo.custid,
                        args.orderattachmentid
                      ],
                      function(err, result)
                      {
                        done();

                        if (!err)
                          callback(null, {orderid: result.rows[0].orderid, name: result.rows[0].name, size: result.rows[0].size});
                        else
                        {
                          global.log.error({existingorderattachment: true}, global.text_generalexception + ' ' + err.message);
                          callback(err, null);
                        }
                      }
                    );
                  }
                  else
                  {
                    global.log.error({existingorderattachment: true}, global.text_nodbconnection);
                    callback(err, null);
                  }
                }
              );
            }
            else
              callback(err, null);
          }
        );
      }
      else
        callback(err, null);
    }
  );
}

function newOrderAttachment(args, callback)
{
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
              // We need user id and customer id to insert new entry...
              // Find user in cache...
              global.users.get
              (
                global.config.redis.prefix + args.uuid,
                function(err, uuidobj)
                {
                  if (!err)
                  {
                    global.safejsonparse
                    (
                      uuidobj,
                      function(err, uo)
                      {
                        if (!err)
                        {
                          tx.query
                          (
                            'insert into orderattachments (customers_id,orders_id,name,description,mimetype,size,isthumbnail,userscreated_id) values ($1,$2,$3,$4,$5,$6,$7,$8) returning id',
                            [
                              uo.custid,
                              args.orderid,
                              args.filename,
                              args.description,
                              args.mimetype,
                              args.size,
                              args.isthumbnail,
                              uo.userid
                            ],
                            function(err, result)
                            {
                              if (!err)
                              {
                                tx.commit
                                (
                                  function(err, ret)
                                  {
                                    if (!err)
                                    {
                                      done();

                                      if (result.rows.length == 1)
                                      {
                                        var orderattachmentid = result.rows[0].id;
                                        //
                                        callback(null, orderattachmentid);
                                        global.pr.sendToRoom(global.custchannelprefix + uo.custid, 'orderattachmentcreated', {orderid: args.orderid, orderattachmentid: orderattachmentid});
                                      }
                                    }
                                    else
                                    {
                                      tx.rollback
                                      (
                                        function(ignore)
                                        {
                                          done();
                                          global.log.error({neworderattachment: true}, global.text_committx + ' ' + err.message);
                                          callback(err, null);
                                        }
                                      );
                                    }
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
                                    global.log.error({neworderattachment: true}, global.text_dbexception + ' ' + err.message);
                                    callback(err, null);
                                  }
                                );
                              }
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
                              global.log.error({neworderattachment: true}, global.text_unablegetidfromuuid + ' ' + err.message);
                              callback(err, null);
                            }
                          );
                        }
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
                        global.log.error({neworderattachment: true}, global.text_unablegetidfromuuid + ' ' + err.message);
                        callback(err, null);
                      }
                    );
                  }
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({neworderattachment: true}, msg);
            }
          }
        );
      }
      else
        global.log.error({neworderattachment: true}, global.text_nodbconnection);
    }
  );
}

function doNewOrderClient(tx, world)
{
  global.ConsoleLog("do new order client");
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      // Note: trigger will:
      //   insert an order status entry for us...
      //   fill in default addresses fields
      //   fill in default order/invoice templates...
      tx.query
      (
        'insert into orders (customers_id,orderno,name,pono,clients_id,invoiceto_name,invoiceto_address1,invoiceto_address2,invoiceto_address3,invoiceto_address4,invoiceto_city,invoiceto_postcode,invoiceto_country,invoiceto_state,shipto_name,shipto_address1,shipto_address2,shipto_address3,shipto_address4,shipto_city,shipto_postcode,shipto_country,shipto_state,shipto_notes,invoicetemplates_id,ordertemplates_id,quotetemplates_id,startdate,enddate,freightprice,freightgst,userscreated_id) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32) returning id',
        [
          world.cn.custid,
          __.sanitiseAsString(world.orderno),
          __.sanitiseAsString(world.name),
          __.sanitiseAsString(world.pono),
          __.sanitiseAsBigInt(world.clientid),

          __.sanitiseAsString(world.invoicetoname),
          __.sanitiseAsString(world.address1),
          __.sanitiseAsString(world.address2),
          __.sanitiseAsString(world.address3),
          __.sanitiseAsString(world.address4),
          __.sanitiseAsString(world.city),
          __.sanitiseAsString(world.postcode),
          __.sanitiseAsString(world.country),
          __.sanitiseAsString(world.state),

          __.sanitiseAsString(world.shiptoname),
          __.sanitiseAsString(world.shiptoaddress1),
          __.sanitiseAsString(world.shiptoaddress2),
          __.sanitiseAsString(world.shiptoaddress3),
          __.sanitiseAsString(world.shiptoaddress4),
          __.sanitiseAsString(world.shiptocity),
          __.sanitiseAsString(world.shiptopostcode),
          __.sanitiseAsString(world.shiptocountry),
          __.sanitiseAsString(world.shiptostate),
          __.sanitiseAsString(world.shiptonote),

          __.sanitiseAsBigInt(world.invoicetemplateid),
          __.sanitiseAsBigInt(world.ordertemplateid),
          __.sanitiseAsBigInt(world.quotetemplateid),

          __.sanitiseAsDate(world.startdate),
          __.sanitiseAsDate(world.enddate),

          __.sanitiseAsPrice(world.freightprice, 4),
          __.sanitiseAsPrice(0.0, 4),

          world.cn.userid
        ],
        function(err, result)
        {
          if (!err)
          {
            var orderid = result.rows[0].id;
            global.ConsoleLog("order id");
            global.ConsoleLog(orderid);

            if(newOrderNote_List.length !=0)
            {
              newOrderNote_List.forEach((note) => {
                tx.query('insert into ordernotes (customers_id,orders_id,userscreated_id,notes,datecreated) values ($1,$2,$3,$4,$5)',
                [
                  note.custid,
                  __.sanitiseAsBigInt(orderid),
                  note.userid,
                  note.notes,
                  note.datecreated
                ],
                function (err,result) {
                  if(err)
                    reject(err);
                });
              });
            }

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
                  global.ConsoleLog(o);
                  global.ConsoleLog(world.products.length);

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

                            doNewOrderDetail(tx, world.cn.custid, world.cn.userid, orderid, version, p.productid, p.qty, p.price, p.discount, p.expressfee).then
                            (
                              function(result)
                              {
                                od = result;

                                // If this is a built product, we need to create a jobsheet for it...
                                if (!__.isNull(od.buildtemplateheaderid))
                                {
                                  global.ConsoleLog("this is a built product, we need to create a jobsheet for it");
                                  global.modconfig.doNextJobSheetNo(tx, world).then
                                  (
                                    function(result)
                                    {
                                      return doNewJobSheet(tx, world.cn.custid, world.cn.userid, result.jobsheetno, orderid, od.orderdetailid, od.buildtemplateheaderid);
                                    }
                                  ).then
                                  (
                                    function(result)
                                    {
                                      // Now it's all done...
                                      callback(null, {orderdetailid: od.orderdetailid});
                                    }
                                  ).then
                                  (
                                    null,
                                    function(err)
                                    {
                                      callback(err);
                                    }
                                  );
                                }
                                else
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

function doSaveOrder(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'update '+
        'orders ' +
        'set ' +
        'clients_id=$1,' +
        'pono=$2,' +
        'name=$3,' +
        'activeversion=$4,' +
        'startdate=$5,' +
        'enddate=$6,' +
        'invoiceto_name=$7,' +
        'invoiceto_address1=$8,' +
        'invoiceto_address2=$9,' +
        'invoiceto_address3=$10,' +
        'invoiceto_address4=$11,' +
        'invoiceto_city=$12,' +
        'invoiceto_state=$13,' +
        'invoiceto_postcode=$14,' +
        'invoiceto_country=$15,' +
        'shipto_name=$16,' +
        'shipto_address1=$17,' +
        'shipto_address2=$18,' +
        'shipto_address3=$19,' +
        'shipto_address4=$20,' +
        'shipto_city=$21,' +
        'shipto_state=$22,' +
        'shipto_postcode=$23,' +
        'shipto_country=$24,' +
        'shipto_notes=$25,' +
        'invoicetemplates_id=$26,' +
        'ordertemplates_id=$27,' +
        'quotetemplates_id=$28,' +
        'freightprice=$29,' +
        'freightgst=$30,' +
        'datemodified=now(),' +
        'usersmodified_id=$31 ' +
        'where ' +
        'customers_id=$32 ' +
        'and ' +
        'id=$33 ' +
        'and ' +
        'dateexpired is null',
        [
          __.sanitiseAsBigInt(world.clientid),
          __.sanitiseAsString(world.pono),
          __.sanitiseAsString(world.name),
          world.activeversion,
          __.sanitiseAsDate(world.startdate),
          __.sanitiseAsDate(world.enddate),

          __.sanitiseAsString(world.invoicetoname),
          __.sanitiseAsString(world.address1),
          __.sanitiseAsString(world.address2),
          __.sanitiseAsString(world.address3),
          __.sanitiseAsString(world.address4),
          __.sanitiseAsString(world.city),
          __.sanitiseAsString(world.state),
          __.sanitiseAsString(world.postcode),
          __.sanitiseAsString(world.country),

          __.sanitiseAsString(world.shiptoname),
          __.sanitiseAsString(world.shiptoaddress1),
          __.sanitiseAsString(world.shiptoaddress2),
          __.sanitiseAsString(world.shiptoaddress3),
          __.sanitiseAsString(world.shiptoaddress4),
          __.sanitiseAsString(world.shiptocity),
          __.sanitiseAsString(world.shiptostate),
          __.sanitiseAsString(world.shiptopostcode),
          __.sanitiseAsString(world.shiptocountry),
          __.sanitiseAsString(world.shiptonote),

          __.sanitiseAsBigInt(world.invoicetemplateid),
          __.sanitiseAsBigInt(world.ordertemplateid),
          __.sanitiseAsBigInt(world.quotetemplateid),

          __.sanitiseAsPrice(world.freightprice, 4),
          __.sanitiseAsPrice(0.0, 4),

          world.cn.userid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.orderid)
        ],
        function(err, result)
        {
          if (!err)
          {
            tx.query
            (
              'select o1.datemodified,u1.name from orders o1 left join users u1 on (o1.usersmodified_id=u1.id) where o1.customers_id=$1 and o1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(world.orderid)
              ],
              function(err, result)
              {
                if (!err)
                  resolve({datemodified: global.moment(result.rows[0].datemodified).format('YYYY-MM-DD HH:mm:ss'), usermodified: result.rows[0].name});
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

function doDuplicateOrder(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'insert into ' +
        'orders ' +
        '(' +
        'customers_id,' +
        'orders_id,' +
        'clients_id,' +
        'shipto_clients_id,' +
        'invoiceto_clients_id,' +
        'name,' +
        'invoiceto_name,' +
        'invoiceto_address1,' +
        'invoiceto_address2,' +
        'invoiceto_city,' +
        'invoiceto_state,' +
        'invoiceto_postcode,' +
        'invoiceto_country,' +
        'shipto_name,' +
        'shipto_address1,' +
        'shipto_address2,' +
        'shipto_city,' +
        'shipto_state,' +
        'shipto_postcode,' +
        'shipto_country,' +
        'shipto_notes,' +
        'path,' +
        'activeversion,' +
        'numversions,' +
        'startdate,' +
        'enddate,' +
        'orderno,' +
        'totalprice,' +
        'totalgst,' +
        'totalqty,' +
        'invoicetemplates_id,' +
        'ordertemplates_id,' +
        'quotetemplates_id,' +
        'isrepeat,' +
        'isnewartwork,' +
        'freightprice,' +
        'freightgst,' +
        'userscreated_id' +
        ') ' +
        'select ' +
        'o1.customers_id,' +
        'o1.orders_id,' +
        'o1.clients_id,' +
        'o1.shipto_clients_id,' +
        'o1.invoiceto_clients_id,' +
        'o1.name,' +
        'o1.invoiceto_name,' +
        'o1.invoiceto_address1,' +
        'o1.invoiceto_address2,' +
        'o1.invoiceto_city,' +
        'o1.invoiceto_state,' +
        'o1.invoiceto_postcode,' +
        'o1.invoiceto_country,' +
        'o1.shipto_name,' +
        'o1.shipto_address1,' +
        'o1.shipto_address2,' +
        'o1.shipto_city,' +
        'o1.shipto_state,' +
        'o1.shipto_postcode,' +
        'o1.shipto_country,' +
        'o1.shipto_notes,' +
        'o1.path,' +
        'o1.activeversion,' +
        'o1.numversions,' +
        'o1.startdate,' +
        'o1.enddate,' +
        '$1,' +
        'o1.totalprice,' +
        'o1.totalgst,' +
        'o1.totalqty,' +
        'o1.invoicetemplates_id,' +
        'o1.ordertemplates_id,' +
        'o1.quotetemplates_id,' +
        '1,' +
        '0,' +
        'o1.freightprice,' +
        'o1.freightgst,' +
        '$2 ' +
        'from ' +
        'orders o1 ' +
        'where ' +
        'o1.customers_id=$3 ' +
        'and ' +
        'o1.id=$4 ' +
        'returning id',
        [
          __.sanitiseAsString(world.orderno),
          world.cn.userid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.orderid)
        ],
        function(err, result)
        {
          if (!err)
          {
            var orderid = result.rows[0].id;
            // Now do order details...
            tx.query
            (
              'insert into ' +
              'orderdetails ' +
              '(' +
              'customers_id,' +
              'orders_id,' +
              'version,' +
              'products_id,' +
              'price,' +
              'gst,' +
              'qty,' +
              'userscreated_id' +
              ') ' +
              'select ' +
              'od1.customers_id,' +
              '$1,' +
              'od1.version,' +
              'od1.products_id,' +
              'od1.price,' +
              'od1.gst,' +
              'od1.qty,' +
              '$2 ' +
              'from ' +
              'orderdetails od1 ' +
              'where ' +
              'od1.customers_id=$3 ' +
              'and ' +
              'od1.orders_id=$4',
              [
                __.sanitiseAsBigInt(orderid),
                world.cn.userid,
                world.cn.custid,
                __.sanitiseAsBigInt(world.orderid)
              ],
              function(err, result)
              {
                if (!err)
                {
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

                        resolve
                        (
                          {
                            orderid: orderid,
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

function doNewOrderDetail(tx, custid, userid, orderid, version, productid, qty, price, discount, expressfee)
{
  global.ConsoleLog("do new order detail");
  global.ConsoleLog('custid ' + custid);
  global.ConsoleLog('userid ' + userid);
  global.ConsoleLog('orderid ' + orderid);
  global.ConsoleLog('version ' + version);
  global.ConsoleLog('productid ' + productid);
  global.ConsoleLog('qty ' + qty);
  global.ConsoleLog('price ' + price);
  global.ConsoleLog('discount ' + discount);
  global.ConsoleLog('expressfee ' + expressfee);

  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'insert into orderdetails (customers_id,orders_id,version,products_id,qty,price,discount,expressfee,userscreated_id) values ($1,$2,$3,$4,$5,$6,$7,$8,$9) returning id',
        [
          custid,
          __.sanitiseAsBigInt(orderid),
          version,
          __.sanitiseAsBigInt(productid),
          __.sanitiseAsPrice(qty, 4),
          __.sanitiseAsPrice(price, 4),
          __.formatnumber(discount, 2),
          __.formatnumber(expressfee, 2),
          userid
        ],
        function(err, result)
        {
          if (!err)
          {
            var orderdetailid = result.rows[0].id;

            tx.query
            (
              'select od1.datecreated,u1.name usercreated,p1.id productid,p1.buildtemplateheaders_id buildtemplateheaderid from orderdetails od1 left join products p1 on (od1.products_id=p1.id) left join users u1 on (od1.userscreated_id=u1.id) where od1.customers_id=$1 and od1.id=$2',
              [
                custid,
                __.sanitiseAsBigInt(orderdetailid)
              ],
              function(err, result)
              {
                if (!err)
                {
                  var d = result.rows[0];
                  global.ConsoleLog(d);

                  resolve
                  (
                    {
                      orderdetailid: orderdetailid,
                      productid: d.productid,
                      buildtemplateheaderid: d.buildtemplateheaderid,
                      datecreated: global.moment(d.datecreated).format('YYYY-MM-DD HH:mm:ss'),
                      usercreated: d.usercreated
                    }
                  );
                }
                else
                {
                  global.ConsoleLog("reject " + global.text_unableneworderdetail);
                  reject({message: global.text_unableneworderdetail});
                }
                  
              }
            );
          }
          else
          {
            global.ConsoleLog(err);
            reject(err);
          }
            
        }
      );
    }
  );
  return promise;
}

var newOrderNote_List = [];
var ordernote_id = 0;
function NewOrderNote_NoOrderID(world){
    newOrderNote_List.push({
      id: ++ordernote_id,
      custid:world.cn.custid,
      notes :"",
      datecreated:global.moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      userid:world.cn.userid,
      usercreated:world.cn.uname
    });
    
    world.spark.emit
    (
      'listordernotes',
      {
        rc: global.errcode_none,
        msg: global.text_success,
        rs: newOrderNote_List,
        pdata: world.pdata
      }
    );
}

 function CleanOrderNoteLocally(){
  newOrderNote_List = [];
  ordernote_id=0;
}

 function SaveOrderNote_NewOrder(world){
  newOrderNote_List[world.ordernoteid-1].notes = world.notes;
  
  world.spark.emit
    (
      'listordernotes',
      {
        rc: global.errcode_none,
        msg: global.text_success,
        rs: newOrderNote_List,
        pdata: world.pdata
      }
    );
}

function doNewOrderNote(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'insert into ordernotes (customers_id,orders_id,userscreated_id) values ($1,$2,$3) returning id',
        [
          world.cn.custid,
          __.sanitiseAsBigInt(world.orderid),
          world.cn.userid
        ],
        function(err, result)
        {
          if (!err)
          {
            var ordernoteid = result.rows[0].id;

            tx.query
            (
              'select on1.datecreated,u1.name usercreated from ordernotes on1 left join users u1 on (on1.userscreated_id=u1.id) where on1.customers_id=$1 and on1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(ordernoteid)
              ],
              function(err, result)
              {
                if (!err)
                {
                  var on = result.rows[0];

                  resolve
                  (
                    {
                      ordernoteid: ordernoteid,
                      datecreated: global.moment(on.datecreated).format('YYYY-MM-DD HH:mm:ss'),
                      usercreated: on.usercreated
                    }
                  );
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

function doSaveOrderNote(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'update ordernotes set notes=$1,datemodified=now(),usersmodified_id=$2 where customers_id=$3 and id=$4 and dateexpired is null',
        [
          __.sanitiseAsComment(world.notes),
          world.cn.userid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.ordernoteid)
        ],
        function(err, result)
        {
          if (!err)
          {
            tx.query
            (
              'select on1.orders_id orderid,on1.datemodified,u1.name from ordernotes on1 left join users u1 on (on1.usersmodified_id=u1.id) where on1.customers_id=$1 and on1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(world.ordernoteid)
              ],
              function(err, result)
              {
                if (!err)
                  resolve({orderid: result.rows[0].orderid, datemodified: global.moment(result.rows[0].datemodified).format('YYYY-MM-DD HH:mm:ss'), usermodified: result.rows[0].name});
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

function doNewOrderStatus(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'insert into orderstatuses (customers_id,orders_id,status,connote,carriername,comments,batchno,userscreated_id) values ($1,$2,$3,$4,$5,$6,$7,$8) returning id',
        [
          world.cn.custid,
          __.sanitiseAsBigInt(world.orderid),
          world.status,
          __.sanitiseAsString(world.connote),
          __.sanitiseAsString(world.carrier),
          __.sanitiseAsString(world.comment),
          __.sanitiseAsString(world.batchno),
          world.cn.userid
        ],
        function(err, result)
        {
          if (!err)
          {
            var orderstatusid = result.rows[0].id;

            tx.query
            (
              'select os1.datecreated,u1.name usercreated from orderstatuses os1 left join users u1 on (os1.userscreated_id=u1.id) where os1.customers_id=$1 and os1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(orderstatusid)
              ],
              function(err, result)
              {
                if (!err)
                {
                  var os = result.rows[0];

                  resolve
                  (
                    {
                      orderstatusid: orderstatusid,
                      datecreated: global.moment(os.datecreated).format('YYYY-MM-DD HH:mm:ss'),
                      usercreated: os.usercreated
                    }
                  );
                }
                else
                  reject({message: global.text_unableneworderstatus});
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

function doSaveOrderDetail(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'update orderdetails set products_id=$1,price=$2,qty=$3,version=$4,discount=$5,expressfee=$6,isrepeat=$7,isnewartwork=$8,datemodified=now(),usersmodified_id=$9 where customers_id=$10 and id=$11 and dateexpired is null',
        [
          __.sanitiseAsBigInt(world.productid),
          __.formatnumber(world.price, 4),
          __.formatnumber(world.qty, 4),
          world.version,
          __.formatnumber(world.discount, 2),
          __.formatnumber(world.expressfee, 2),
          __.sanitiseAsBool(world.isrepeat),
          __.sanitiseAsBool(world.isnewartwork),
          world.cn.userid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.orderdetailid)
        ],
        function(err, result)
        {
          if (!err)
          {
            tx.query
            (
              'select od1.orders_id orderid,od1.datemodified,u1.name from orderdetails od1 left join users u1 on (od1.usersmodified_id=u1.id) where od1.customers_id=$1 and od1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(world.orderdetailid)
              ],
              function(err, result)
              {
                if (!err)
                  resolve({orderid: result.rows[0].orderid, datemodified: global.moment(result.rows[0].datemodified).format('YYYY-MM-DD HH:mm:ss'), usermodified: result.rows[0].name});
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

function doExpireOrderDetail(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      // Need some more info about this order detail for later...
      tx.query
      (
        'select o1.orders_id orderid,o1.version from orderdetails o1 where o1.customers_id=$1 and id=$2 and o1.dateexpired is null',
        [
          world.cn.custid,
          __.sanitiseAsBigInt(world.orderdetailid)
        ],
        function(err, result)
        {
          if (!err)
          {
            if (result.rows.length == 1)
            {
              var orderid = result.rows[0].orderid;
              var version = result.rows[0].version;
              //
              tx.query
              (
                'update orderdetails set dateexpired=now(),usersexpired_id=$1 where customers_id=$2 and id=$3 and dateexpired is null',
                [
                  world.cn.userid,
                  world.cn.custid,
                  __.sanitiseAsBigInt(world.orderdetailid)
                ],
                function(err, result)
                {
                  if (!err)
                    resolve({orderid: orderid, orderdetailid: world.orderdetailid, version: version});
                  else
                    reject(err);
                }
              );
            }
            else
              reject({message: global.text_unablefetchorderdetail});
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doSaveOrderAttachment(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'update orderattachments set description=$1,isthumbnail=$2,datemodified=now(),usersmodified_id=$3 where customers_id=$4 and id=$5 and dateexpired is null',
        [
          __.sanitiseAsString(world.description),
          world.isthumbnail,
          world.cn.userid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.orderattachmentid)
        ],
        function(err, result)
        {
          if (!err)
          {
            tx.query
            (
              'select a1.orders_id orderid,a1.datemodified,u1.name usermodified from orderattachments a1 left join users u1 on (a1.usersmodified_id=u1.id) where a1.customers_id=$1 and a1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(world.orderattachmentid)
              ],
              function(err, result)
              {
                if (!err)
                  resolve({orderid: result.rows[0].orderid, datemodified: global.moment(result.rows[0].datemodified).format('YYYY-MM-DD HH:mm:ss'), usermodified: result.rows[0].name});
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

function doExpireOrderAttachment(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'update orderattachments set dateexpired=now(),usersexpired_id=$1 where customers_id=$2 and id=$3 and dateexpired is null',
        [
          world.cn.userid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.orderattachmentid)
        ],
        function(err, result)
        {
          if (!err)
          {
            tx.query
            (
              'select a1.orders_id orderid,a1.dateexpired,u1.name userexpired from orderattachments a1 left join users u1 on (a1.usersexpired_id=u1.id) where a1.customers_id=$1 and a1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(world.orderattachmentid)
              ],
              function(err, result)
              {
                if (!err)
                  resolve({orderid: result.rows[0].orderid, dateexpired: global.moment(result.rows[0].dateexpired).format('YYYY-MM-DD HH:mm:ss'), userexpired: result.rows[0].name});
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

function doNewVersionOrder(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'select o1.numversions from orders o1 where o1.customers_id=$1 and o1.id=$2',
        [
          world.cn.custid,
          __.sanitiseAsBigInt(world.orderid)
        ],
        function(err, result)
        {
          if (!err)
          {
            if (result.rows.length == 1)
            {
              var newversion = result.rows[0].numversions + 1;
              //
              tx.query
              (
                'insert into orderdetails(customers_id,orders_id,products_id,version,price,gst,qty,userscreated_id) select $1,$2,od1.products_id,$3,od1.price,od1.gst,od1.qty,$4 from orderdetails od1 where od1.customers_id=$5 and od1.orders_id=$6 and version=$7 and od1.dateexpired is null',
                [
                  world.cn.custid,
                  __.sanitiseAsBigInt(world.orderid),
                  newversion,
                  world.cn.userid,
                  world.cn.custid,
                  __.sanitiseAsBigInt(world.orderid),
                  world.version
                ],
                function(err, result)
                {
                  if (!err)
                  {
                    // Update count of versions for this order, but leave active version alone...
                    tx.query
                    (
                      'update orders set numversions=$1,datemodified=now(),usersmodified_id=$2 where customers_id=$3 and id=$4',
                      [
                        newversion,
                        world.cn.userid,
                        world.cn.custid,
                        __.sanitiseAsBigInt(world.orderid)
                      ],
                      function(err, result)
                      {
                        if (!err)
                          resolve({orderid: world.orderid, newversion: newversion});
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
            else
              reject({message: global.text_unablegetorderversion});
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doExpireOrder(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'update orders set dateexpired=now(),usersexpired_id=$1 where customers_id=$2 and id=$3 and dateexpired is null',
        [
          world.cn.userid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.orderid)
        ],
        function(err, result)
        {
          if (!err)
            resolve({orderid: world.orderid});
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
function ListOrders(world)
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
        var maxhistory = __.isUN(world.maxhistory) ? 200 : world.maxhistory;

        client.query
        (
          'select ' +
          'o1.id,' +
          'o1.clients_id clientid,' +
          'o1.orderno,' +
          'o1.invoiceno,' +
          'o1.pono,' +
          'o1.name,' +
          'o1.numversions,' +
          'o1.activeversion,' +
          'o1.startdate,' +
          'o1.enddate,' +
          'o1.accounts_id accountid,' +
          'o1.totalprice,' +
          'o1.totalqty,' +
          'o1.invoicetemplates_id invoicetemplateid,' +
          'o1.ordertemplates_id ordertemplateid,' +
          'o1.quotetemplates_id quotetemplateid,' +
          'o1.shipto_clients_id shiptoclientid,' +
          'o1.invoiceto_clients_id invoicetoclientid,' +
          'o1.invoiceto_name invoicetoname,' +
          'o1.invoiceto_address1 invoicetoaddress1,' +
          'o1.invoiceto_address2 invoicetoaddress2,' +
          'o1.invoiceto_address3 invoicetoaddress3,' +
          'o1.invoiceto_address4 invoicetoaddress4,' +
          'o1.invoiceto_city invoicetocity,' +
          'o1.invoiceto_state invoicetostate,' +
          'o1.invoiceto_postcode invoicetopostcode,' +
          'o1.invoiceto_country invoicetocountry,' +
          'o1.shipto_name shiptoname,' +
          'o1.shipto_address1 shiptoaddress1,' +
          'o1.shipto_address2 shiptoaddress2,' +
          'o1.shipto_address3 shiptoaddress3,' +
          'o1.shipto_address4 shiptoaddress4,' +
          'o1.shipto_city shiptocity,' +
          'o1.shipto_state shiptostate,' +
          'o1.shipto_postcode shiptopostcode,' +
          'o1.shipto_country shiptocountry,' +
          'o1.shipto_notes shiptonote,' +
          'o1.inventorycommitted,' +
          'o1.isrepeat,' +
          'o1.isnewartwork,' +
          'o1.freightprice,' +
          'o1.freightgst,' +
          'p1 paid,' +
          '(o1.totalprice + o1.totalgst - p1) balance,' +
          'c1.name clientname,' +
          'o2.id parentid,' +
          'o2.name parentname,' +
          'o1.datecreated,' +
          'o1.datemodified,' +
        'u1.name usercreated,' +
          'u2.name usermodified,' +
          'g2.status,' +
          'g3.status majorstatus,' +
          'oad1.orderdetails_id attachmentid,' +
          'oad1.name attachmentname,' +
          'oad1.mimetype attachmentmimetype ' +
          'from ' +
          'orders o1 left join orders o2 on (o1.orders_id=o2.id) ' +
          '          left join clients c1 on (o1.clients_id=c1.id) ' +
          '          left join users u1 on (o1.userscreated_id=u1.id) ' +
          '          left join users u2 on (o1.usersmodified_id=u2.id) ' +
          '          left join getlatestorderstatus($1,o1.id) g2 on (1=1) ' +
          '          left join getordermajorstatus($2,o1.id) g3 on (1=1) ' +
          '          left join getorderattachmentthumbnail($3,o1.id) oad1 on (1=1) ' +
          '          left join getinvoicetotalpayments($4,o1.id) p1 on (1=1) ' +
          'where ' +
          'o1.customers_id=$5 ' +
          'and ' +
          '(g3.status!=$6 and g3.status!=$7) ' +
          'and ' +
          'o1.datecompleted is null ' +
          'and ' +
          'o1.dateexpired is null ' +
          'order by ' +
          'o1.datecreated ' +
          'limit $8',
          [
            world.cn.custid,
            world.cn.custid,
            world.cn.custid,
            world.cn.custid,
            world.cn.custid,
            global.itype_os_completed,
            global.itype_os_invoiced,
            maxhistory
          ],
          function(err, result)
          {
            done();

            if (!err)
            {
              // JS returns date with TZ info/format, need in ISO format...
              result.rows.forEach
              (
                function(p)
                {
                  if (!__.isUN(p.startdate))
                    p.startdate = global.moment(p.startdate).format('YYYY-MM-DD HH:mm:ss');

                  if (!__.isUN(p.enddate))
                    p.enddate = global.moment(p.enddate).format('YYYY-MM-DD HH:mm:ss');

                  if (!__.isUN(p.datecompleted))
                    p.datecompleted = global.moment(p.datecompleted).format('YYYY-MM-DD HH:mm:ss');

                  if (!__.isUN(p.datemodified))
                    p.datemodified = global.moment(p.datemodified).format('YYYY-MM-DD HH:mm:ss');

                  p.datecreated = global.moment(p.datecreated).format('YYYY-MM-DD HH:mm:ss');

                  if (!__.isUN(p.attachmentid))
                    p.attachmentimage = global.doAttachmentImageURL(p.id, p.attachmentid, p.attachmentname, p.attachmentmimetype);
                }
              );

              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({listorders: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({listorders: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function LoadOrder(world)
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
        var maxhistory = __.isUN(world.maxhistory) ? 200 : world.maxhistory;

        client.query
        (
          'select ' +
          'o1.id,' +
          'o1.clients_id clientid,' +
          'o1.orderno,' +
          'o1.invoiceno,' +
          'o1.pono,' +
          'o1.name,' +
          'o1.numversions,' +
          'o1.activeversion,' +
          'o1.startdate,' +
          'o1.enddate,' +
          'o1.accounts_id accountid,' +
          'o1.totalprice,' +
          'o1.totalqty,' +
          'o1.invoicetemplates_id invoicetemplateid,' +
          'o1.ordertemplates_id ordertemplateid,' +
          'o1.quotetemplates_id quotetemplateid,' +
          'o1.shipto_clients_id shiptoclientid,' +
          'o1.invoiceto_clients_id invoicetoclientid,' +
          'o1.invoiceto_name invoicetoname,' +
          'o1.invoiceto_address1 invoicetoaddress1,' +
          'o1.invoiceto_address2 invoicetoaddress2,' +
          'o1.invoiceto_address3 invoicetoaddress3,' +
          'o1.invoiceto_address4 invoicetoaddress4,' +
          'o1.invoiceto_city invoicetocity,' +
          'o1.invoiceto_state invoicetostate,' +
          'o1.invoiceto_postcode invoicetopostcode,' +
          'o1.invoiceto_country invoicetocountry,' +
          'o1.shipto_name shiptoname,' +
          'o1.shipto_address1 shiptoaddress1,' +
          'o1.shipto_address2 shiptoaddress2,' +
          'o1.shipto_address3 shiptoaddress3,' +
          'o1.shipto_address4 shiptoaddress4,' +
          'o1.shipto_city shiptocity,' +
          'o1.shipto_state shiptostate,' +
          'o1.shipto_postcode shiptopostcode,' +
          'o1.shipto_country shiptocountry,' +
          'o1.shipto_notes shiptonote,' +
          'o1.inventorycommitted,' +
          'o1.isrepeat,' +
          'o1.isnewartwork,' +
          'o1.freightprice,' +
          'o1.freightgst,' +
          'c1.name clientname,' +
          'o2.id parentid,' +
          'o2.name parentname,' +
          'o1.datecreated,' +
          'o1.datemodified,' +
          'u1.name usercreated,' +
          'u2.name usermodified,' +
          'g2.status,' +
          'g3.status majorstatus ' +
          'from ' +
          'orders o1 left join orders o2 on (o1.orders_id=o2.id) ' +
          '          left join clients c1 on (o1.clients_id=c1.id) ' +
          '          left join users u1 on (o1.userscreated_id=u1.id) ' +
          '          left join users u2 on (o1.usersmodified_id=u2.id) ' +
          '          left join getlatestorderstatus($1,o1.id) g2 on (1=1) ' +
          '          left join getordermajorstatus($2,o1.id) g3 on (1=1) ' +
          'where ' +
          'o1.customers_id=$3 ' +
          'and ' +
          'o1.id=$4 ' +
          'and ' +
          'o1.dateexpired is null',
          [
            world.cn.custid,
            world.cn.custid,
            world.cn.custid,
            __.sanitiseAsBigInt(world.orderid)
          ],
          function(err, result)
          {
            done();

            if (!err)
            {
              // JS returns date with TZ info/format, need in ISO format...
              result.rows.forEach
              (
                function(p)
                {
                  if (!__.isUN(p.startdate))
                    p.startdate = global.moment(p.startdate).format('YYYY-MM-DD HH:mm:ss');

                  if (!__.isUN(p.enddate))
                    p.enddate = global.moment(p.enddate).format('YYYY-MM-DD HH:mm:ss');

                  if (!__.isUN(p.datecompleted))
                    p.datecompleted = global.moment(p.datecompleted).format('YYYY-MM-DD HH:mm:ss');

                  if (!__.isUN(p.datemodified))
                    p.datemodified = global.moment(p.datemodified).format('YYYY-MM-DD HH:mm:ss');

                  p.datecreated = global.moment(p.datecreated).format('YYYY-MM-DD HH:mm:ss');
                }
              );

              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, order: result.rows[0], pdata: world.pdata});
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({loadorder: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({loadorder: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function NewOrderClient(world)
{
  var msg = '[' + world.eventname + '] ';
  global.ConsoleLog(world.eventname);
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
              global.modconfig.doNextOrderNo(tx, world).then
              (
                function(result)
                {
                  world.orderno = result.orderno;
                  //
                  return doNewOrderClient(tx, world);
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
                            orderid: result.orderid,
                            orderno: result.orderno,
                            datecreated: result.datecreated,
                            usercreated: result.usercreated,
                            pdata: world.pdata
                          }
                        );
                        global.pr.sendToRoomExcept
                        (
                          global.custchannelprefix + world.cn.custid,
                          'ordercreated',
                          {
                            orderid: result.orderid,
                            orderno: result.orderno,
                            datecreated: result.datecreated,
                            usercreated: result.usercreated
                          },
                          world.spark.id
                        );
                        // We also updated config (with new orderno and possibly jobsheet) so let everyone know that too...
                        global.pr.sendToRoom(global.custchannelprefix + world.cn.custid, 'configsaved', {});
                        global.pr.sendToRoom(global.custchannelprefix + world.cn.custid, 'tpccjobsheetcreated', {});
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({neworderclient: true}, msg);
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
                      global.log.error({neworderclient: true}, msg);
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
              global.log.error({neworderclient: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({neworderclient: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function SaveOrder(world)
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
              doSaveOrder(tx, world).then
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
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, orderid: world.orderid, datemodified: result.datemodified, usermodified: result.usermodified, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'ordersaved', {orderid: world.orderid, datemodified: result.datemodified, usermodified: result.usermodified}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({saveorder: true}, msg);
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
                      global.log.error({saveorder: true}, msg);
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
              global.log.error({saveorder: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({saveorder: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ExpireOrder(world)
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
              doExpireOrder(tx, world).then
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
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, pdata: world.pdata});
                        global.pr.sendToRoom(global.custchannelprefix + world.cn.custid, 'orderexpired', {orderid: result.orderid});
                        global.pr.sendToRoom(global.custchannelprefix + world.cn.custid, 'tpccjobsheetexpired', {});
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({expireorder: true}, msg);
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
                      global.log.error({expireorder: true}, msg);
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
              global.log.error({expireorder: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({expireorder: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function DuplicateOrder(world)
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
              global.modconfig.doNextOrderNo(tx, world).then
              (
                function(result)
                {
                  world.orderno = result.orderno;
                  return doDuplicateOrder(tx, world);
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
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, orderid: result.orderid, orderno: world.orderno, datecreated: result.datecreated, usercreated: result.usercreated, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'orderduplicated', {orderid: result.orderid, datecreated: result.datecreated, usercreated: result.usercreated}, world.spark.id);
                        // Since we updated order number...
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
                            global.log.error({duplicateorder: true}, msg);
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
                      global.log.error({duplicateorder: true}, msg);
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
              global.log.error({duplicateorder: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({duplicateorder: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function NewVersionOrder(world)
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
              doNewVersionOrder(tx, world).then
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
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, orderid: world.orderid, newversion: result.newversion, datemodified: result.datemodified, usermodified: result.usermodified, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'ordernewversion', {orderid: world.orderid, newversion: result.newversion, datemodified: result.datemodified, usermodified: result.usermodified}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({newversionorder: true}, msg);
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
                      global.log.error({newversionorder: true}, msg);
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
              global.log.error({newversionorder: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({newversionorder: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function CreateInvoice(world)
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
              // 1. Set order status to approved or whatever system config says (may already be there)...
              // 2. Commit to inventory
              // 3. Set order status to invoiced
              // 4. Assign invoice no...
              var os = null;

              // Find which status triggers a stock commit and use that to set order status...
              global.customers.get
              (
                global.config.redis.custconfig + world.cn.custid,
                function(err, configobj)
                {
                  if (!err)
                  {
                    global.safejsonparse
                    (
                      configobj,
                      function(err, co)
                      {
                        if (!err)
                        {
                          // Trigger status?
                          world.status = co.statusid;

                          doNewOrderStatus(tx, world).then
                          (
                            function(result)
                            {
                              os = result;
                              // Check if this order status triggers an inventory adjustment...
                              return doCheckStatusForInventoryAdjust(tx, world);
                            }
                          ).then
                          (
                            function(result)
                            {
                              world.commitstatus = __.isNull(result) ? null : result.commitstatus;
                              return doInventoryAdjust(tx, world);
                            }
                          ).then
                          (
                            function(ignore)
                            {
                              // If we previously adjusted inventory, flag order that we've committed it in case same status recorded again...
                              return doCommitOrderInventory(tx, world);
                            }
                          ).then
                          (
                            function(ignore)
                            {
                              return global.modconfig.doNextInvoiceNo(tx, world);
                            }
                          ).then
                          (
                            function(result)
                            {
                              world.invoiceno = __.isUndefined(result) ? null : result.invoiceno;
                              //
                              return doSaveInvoice(tx, world);
                            }
                          ).then
                          (
                            function(ignore)
                            {
                              // Send alert last after all db functions have succeeded, otherwise we send an alert for a failed status update...
                              return doSendStatusAlerts(tx, world);
                            }
                          ).then
                          (
                            function(ignore)
                            {
                              world.status = global.itype_os_invoiced;
                              return doNewOrderStatus(tx, world);
                            }
                          ).then
                          (
                            function(result)
                            {
                              return doSendStatusAlerts(tx, world);
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
                                    world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, pdata: world.pdata});
                                    global.pr.sendToRoom(global.custchannelprefix + world.cn.custid, 'invoicecreated', {orderid: world.orderid, invoiceno: world.invoiceno});
                                    // Updated invoice number...
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
                                        global.log.error({createinvoics: true}, msg);
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
                                  global.log.error({createinvoics: true}, msg);
                                  world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                                }
                              );
                            }
                          );
                        }
                        else
                        {
                          done();
                          msg += global.text_nunablegetcommitstatuscode + ' ' + err.message;
                          global.log.error({createinvoics: true}, msg);
                          world.spark.emit(global.eventerror, {rc: global.errcode_unablegetcommitstatuscode, msg: msg, pdata: world.pdata});
                        }
                      }
                    );
                  }
                  else
                  {
                    done();
                    msg += global.text_nunablegetcommitstatuscode + ' ' + err.message;
                    global.log.error({createinvoics: true}, msg);
                    world.spark.emit(global.eventerror, {rc: global.errcode_unablegetcommitstatuscode, msg: msg, pdata: world.pdata});
                  }
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({createinvoics: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({createinvoics: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function SearchOrders(world)
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
        var maxhistory = __.isUN(world.maxhistory) ? 200 : world.maxhistory;
        var clauses = '';
        var binds =
        [
          world.cn.custid,
          world.cn.custid,
          world.cn.custid
        ];
        var bindno = binds.length + 1;

        if (!__.isUNB(world.orderno))
        {
          clauses += '(upper(o1.orderno) like upper($' + bindno++ + ')) and ';
          binds.push('%' + world.orderno + '%');
        }

        if (!__.isUNB(world.pono))
        {
          clauses += '(upper(o1.pono) like upper($' + bindno++ + ')) and ';
          binds.push('%' + world.pono + '%');
        }

        if (!__.isUNB(world.name))
        {
          clauses += '(upper(o1.name) like upper($' + bindno++ + ')) and ';
          binds.push('%' + world.name + '%');
        }

        if (!__.isUNB(world.version))
        {
          clauses += '(o1.activeversion=$' + bindno++ + ') and ';
          binds.push(world.version);
        }

        if (!__.isUNB(world.shippostcode))
        {
          clauses += '(o1.shipto_postcode like $' + bindno++ + ') and ';
          binds.push('%' + world.shippostcode + '%');
        }

        if (!__.isUNB(world.shipcity))
        {
          clauses += '(upper(o1.shipto_city) like upper($' + bindno++ + ')) and ';
          binds.push('%' + world.shipcity + '%');
        }

        if (!__.isUNB(world.shipcountry))
        {
          clauses += '(upper(o1.shipto_country) like upper($' + bindno++ + ')) and ';
          binds.push('%' + world.shipcountry + '%');
        }

        if (!__.isUNB(world.shipstate))
        {
          clauses += '(upper(o1.shipto_state) like upper($' + bindno++ + ')) and ';
          binds.push('%' + world.shipstate + '%');
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

        if (!__.isUN(world.clients) && (world.clients.length > 0))
        {
          if (__.isArray(world.clients))
          {
            clauses += '(o1.clients_id in (';

            world.clients.forEach
            (
              function(c, idx)
              {
                if (idx > 0)
                  clauses += ',';
                clauses += '$' + bindno++;
                binds.push(c);
              }
            );

            clauses += ')) and ';
          }
        }

        // Any search criteria?
        if (bindno > 3)
        {
          // Lastly, make sure we don't end up with too many rows...
          binds.push(maxhistory);

          client.query
          (
            'select ' +
            'o1.id,' +
            'o1.clients_id clientid,' +
            'o1.orderno,' +
            'o1.invoiceno,' +
            'o1.pono,' +
            'o1.name,' +
            'o1.numversions,' +
            'o1.activeversion,' +
            'o1.startdate,' +
            'o1.enddate,' +
            'o1.accounts_id accountid,' +
            'o1.totalprice,' +
            'o1.totalqty,' +
            'o1.invoicetemplates_id invoicetemplateid,' +
            'o1.ordertemplates_id ordertemplateid,' +
            'o1.quotetemplates_id quotetemplateid,' +
            'o1.shipto_clients_id shiptoclientid,' +
            'o1.invoiceto_clients_id invoicetoclientid,' +
            'o1.invoiceto_name invoicetoname,' +
            'o1.invoiceto_address1 invoicetoaddress1,' +
            'o1.invoiceto_address2 invoicetoaddress2,' +
            'o1.invoiceto_city invoicetocity,' +
            'o1.invoiceto_state invoicetostate,' +
            'o1.invoiceto_postcode invoicetopostcode,' +
            'o1.invoiceto_country invoicetocountry,' +
            'o1.shipto_name shiptoname,' +
            'o1.shipto_address1 shiptoaddress1,' +
            'o1.shipto_address2 shiptoaddress2,' +
            'o1.shipto_city shiptocity,' +
            'o1.shipto_state shiptostate,' +
            'o1.shipto_postcode shiptopostcode,' +
            'o1.shipto_country shiptocountry,' +
            'o1.inventorycommitted,' +
            'c1.name clientname,' +
            'o2.id parentid,' +
            'o2.name parentname,' +
            'o1.datecreated,' +
            'o1.datemodified,' +
            'u1.name usercreated,' +
            'u2.name usermodified,' +
            'g2.status,' +
            'g3.status majorstatus,' +
            'oad1.orderdetails_id attachmentid,' +
            'oad1.name attachmentname,' +
            'oad1.mimetype attachmentmimetype ' +
            'from ' +
            'orders o1 left join orders o2 on (o1.orders_id=o2.id) ' +
            '          left join clients c1 on (o1.clients_id=c1.id) ' +
            '          left join users u1 on (o1.userscreated_id=u1.id) ' +
            '          left join users u2 on (o1.usersmodified_id=u2.id) ' +
            '          left join getlatestorderstatus($1,o1.id) g2 on (1=1) ' +
            '          left join getordermajorstatus($2,o1.id) g3 on (1=1) ' +
            '          left join getorderattachmentthumbnail($3,o1.id) oad1 on (1=1) ' +
            'where ' +
            'o1.customers_id=$3 ' +
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
                // JS returns date with TZ info/format, need in ISO format...
                result.rows.forEach
                (
                  function(p)
                  {
                    if (!__.isUN(p.startdate))
                      p.startdate = global.moment(p.startdate).format('YYYY-MM-DD HH:mm:ss');

                    if (!__.isUN(p.enddate))
                      p.enddate = global.moment(p.enddate).format('YYYY-MM-DD HH:mm:ss');

                    if (!__.isUN(p.datecompleted))
                      p.datecompleted = global.moment(p.datecompleted).format('YYYY-MM-DD HH:mm:ss');

                    if (!__.isUN(p.datemodified))
                      p.datemodified = global.moment(p.datemodified).format('YYYY-MM-DD HH:mm:ss');

                    p.datecreated = global.moment(p.datecreated).format('YYYY-MM-DD HH:mm:ss');
                  }
                );

                world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
              }
              else
              {
                msg += global.text_generalexception + ' ' + err.message;
                global.log.error({searchorders: true}, msg);
                world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
              }
            }
          );
        }
        else
        {
          msg += global.text_nodata;
          global.log.error({searchorders: true}, msg);
          world.spark.emit(global.eventerror, {rc: global.errcode_nodata, msg: msg, pdata: world.pdata});
        }
      }
      else
      {
        global.log.error({searchorders: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function NewOrderNote(world)
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
              doNewOrderNote(tx, world).then
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
                            orderid: world.orderid,
                            ordernoteid: result.ordernoteid,
                            datecreated: result.datecreated,
                            usercreated: result.usercreated,
                            pdata: world.pdata
                          }
                        );
                        global.pr.sendToRoomExcept
                        (
                          global.custchannelprefix + world.cn.custid,
                          'ordernotecreated',
                          {
                            orderid: world.orderid,
                            ordernoteid: result.ordernoteid,
                            datecreated: result.datecreated,
                            usercreated: result.usercreated
                          },
                          world.spark.id
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
                            global.log.error({newordernote: true}, msg);
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
                      global.log.error({newordernote: true}, msg);
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
              global.log.error({newordernote: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({newordernote: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function SaveOrderNote(world)
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
              doSaveOrderNote(tx, world).then
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
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, orderid: result.orderid, ordernoteid: world.ordernoteid, datemodified: result.datemodified, usermodified: result.usermodified, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'ordernotesaved', {orderid: result.orderid, ordernoteid: world.ordernoteid, datemodified: result.datemodified, usermodified: result.usermodified}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({saveordernote: true}, msg);
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
                      global.log.error({saveordernote: true}, msg);
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
              global.log.error({saveordernote: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({saveordernote: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function SaveOrderDetail(world)
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
              doSaveOrderDetail(tx, world).then
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
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, orderdetailid: world.orderdetailid, orderid: result.orderid, version: world.version, datecreated: result.datecreated, usercreated: result.usercreated, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'orderdetailsaved', {orderdetailid: world.orderdetailid, orderid: result.orderid, version: world.version, datecreated: result.datecreated, usercreated: result.usercreated}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({saveorderdetail: true}, msg);
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
                      global.log.error({saveorderdetail: true}, msg);
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
              global.log.error({saveorderdetail: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({saveorderdetail: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ExpireOrderDetail(world)
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
              doExpireOrderDetail(tx, world).then
              (
                function(result)
                {
                  return doExpireJobSheet(tx, world.cn.custid, world.cn.userid, result.orderid, result.orderdetailid);
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
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, pdata: world.pdata});
                        global.pr.sendToRoom(global.custchannelprefix + world.cn.custid, 'orderdetailexpired', {orderid: result.orderid, orderdetailid: result.orderdetailid, version: result.version});
                        global.pr.sendToRoom(global.custchannelprefix + world.cn.custid, 'tpccjobsheetexpired', {jobsheetno: result.jobsheetno});
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({expireorderdetail: true}, msg);
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
                      global.log.error({expireorderdetail: true}, msg);
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
              global.log.error({expireorderdetail: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({expireorderdetail: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ListOrderNotes(world)
{
  if(world.orderid == null) {
    world.spark.emit
    (
      'listordernote_newOrder',
      {
        rc: global.errcode_none,
        msg: global.text_success,
        rs: newOrderNote_List,
        pdata: world.pdata
      }
    );
  }
  else
  {
    var msg = '[' + world.eventname + '] ';
    //
    if(world.orderid == null) {
      ListOrderNote_NewOrder(world);
    }
    else
    {
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
              'on1.id,' +
              'on1.notes,' +
              'on1.datecreated,' +
              'on1.datemodified,' +
              'u1.name usercreated,' +
              'u2.name usermodified ' +
              'from ' +
              'ordernotes on1 left join users u1 on (on1.userscreated_id=u1.id) ' +
              '               left join users u2 on (on1.usersmodified_id=u2.id) ' +
              'where ' +
              'on1.customers_id=$1 ' +
              'and ' +
              'on1.orders_id=$2 ' +
              'and ' +
              'on1.dateexpired is null ' +
              'order by ' +
              'on1.datecreated desc',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(world.orderid)
              ],
              function(err, result)
              {
                done();

                if (!err)
                {
                  // JS returns date with TZ info/format, need in ISO format...
                  result.rows.forEach
                  (
                    function(p)
                    {
                      if (!__.isUN(p.notes))
                        p.notes = __.unescapeHTML(p.notes);

                      if (!__.isUN(p.datemodified))
                        p.datemodified = global.moment(p.datemodified).format('YYYY-MM-DD HH:mm:ss');

                      p.datecreated = global.moment(p.datecreated).format('YYYY-MM-DD HH:mm:ss');
                    }
                  );

                  world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
                }
                else
                {
                  msg += global.text_generalexception + ' ' + err.message;
                  global.log.error({listordernotes: true}, msg);
                  world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                }
              }
            );
          }
          else
          {
            global.log.error({listordernotes: true}, global.text_nodbconnection);
            world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
          }
        }
      );
    }
  }
}

function ListOrderStatuses(world)
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
          'os1.id,' +
          'os1.status,' +
          'os1.connote,' +
          'os1.carriername,' +
          'os1.comments,' +
          'os1.batchno,' +
          'os1.datecreated,' +
          'os1.datemodified,' +
          'u1.name usercreated,' +
          'u2.name usermodified ' +
          'from ' +
          'orderstatuses os1 left join users u1 on (os1.userscreated_id=u1.id) ' +
          '                  left join users u2 on (os1.usersmodified_id=u2.id) ' +
          'where ' +
          'os1.customers_id=$1 ' +
          'and ' +
          'os1.orders_id=$2 ' +
          'and ' +
          'os1.dateexpired is null ' +
          'order by ' +
          'os1.datecreated desc',
          [
            world.cn.custid,
            __.sanitiseAsBigInt(world.orderid)
          ],
          function(err, result)
          {
            done();

            if (!err)
            {
              // JS returns date with TZ info/format, need in ISO format...
              result.rows.forEach
              (
                function(p)
                {
                  if (!__.isUN(p.datemodified))
                    p.datemodified = global.moment(p.datemodified).format('YYYY-MM-DD HH:mm:ss');

                  p.datecreated = global.moment(p.datecreated).format('YYYY-MM-DD HH:mm:ss');
                }
              );

              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({listorderstatuses: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({listorderstatuses: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function NewOrderStatus(world)
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
              var os = null;

              doNewOrderStatus(tx, world).then
              (
                function(result)
                {
                  os = result;
                  // Check if this order status triggers an inventory adjustment...
                  return doCheckStatusForInventoryAdjust(tx, world);
                }
              ).then
              (
                function(result)
                {
                  world.commitstatus = __.isNull(result) ? null : result.commitstatus;
                  return global.modconfig.doGetDefaultWarehouse(world);
                }
              ).then
              (
                function(result)
                {
                  world.locationid = __.isNull(result) ? null : result.defaultlocationid;
                  return doInventoryAdjust(tx, world);
                }
              ).then
              (
                function(ignore)
                {
                  // If we previously adjusted inventory, flag order that we've committed it in case same status recorded again...
                  return doCommitOrderInventory(tx, world);
                }
              ).then
              (
                function(ignore)
                {
                  // Send alert last after all db functions have succeeded, otherwise we send an alert for a failed status update...
                  return doSendStatusAlerts(tx, world);
                }
              ).then
              (
                function(ignore)
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
                            orderstatusid: os.orderstatusid,
                            orderid: world.orderid,
                            datecreated: os.datecreated,
                            usercreated: os.usercreated,
                            pdata: world.pdata
                          }
                        );
                        global.pr.sendToRoomExcept
                        (
                          global.custchannelprefix + world.cn.custid,
                          'orderstatuscreated',
                          {
                            orderstatusid: os.orderstatusid,
                            orderid: world.orderid,
                            datecreated: os.datecreated,
                            usercreated: os.usercreated
                          },
                          world.spark.id
                        );

                        // Inventory updated? Inform everyone to refresh...
                        if (!__.isUN(world.commitstatus))
                          global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'inventoryadded', {datecreated: os.datecreated, usercreated: os.usercreated});
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({neworderstatus: true}, msg);
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
                      global.log.error({neworderstatus: true}, msg);
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
              global.log.error({neworderstatus: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({neworderstatus: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ListOrderAttachments(world)
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
          'oa1.id,' +
          'oa1.name,' +
          'oa1.description,' +
          'oa1.mimetype,' +
          'oa1.size,' +
          'oa1.isthumbnail,' +
          'oa1.datecreated,' +
          'oa1.datemodified,' +
          'u1.name usercreated,' +
          'u2.name usermodified ' +
          'from ' +
          'orderattachments oa1 left join users u1 on (oa1.userscreated_id=u1.id) ' +
          '                     left join users u2 on (oa1.usersmodified_id=u2.id) ' +
          'where ' +
          'oa1.customers_id=$1 ' +
          'and ' +
          'oa1.orders_id=$2 ' +
          'and ' +
          'oa1.dateexpired is null ' +
          'order by ' +
          'oa1.datecreated desc',
          [
            world.cn.custid,
            __.sanitiseAsBigInt(world.orderid)
          ],
          function(err, result)
          {
            done();

            if (!err)
            {
              // JS returns date with TZ info/format, need in ISO format...
              result.rows.forEach
              (
                function(p)
                {
                  if (!__.isUN(p.datemodified))
                    p.datemodified = global.moment(p.datemodified).format('YYYY-MM-DD HH:mm:ss');

                  p.datecreated = global.moment(p.datecreated).format('YYYY-MM-DD HH:mm:ss');

                  if (global.isMimeTypeImage(p.mimetype))
                    p.image = global.config.folders.orderattachments + p.id + '_' + world.orderid + '_' + p.name;
                }
              );

              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({listorderattachments: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({listorderattachments: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function SaveOrderAttachment(world)
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
              doSaveOrderAttachment(tx, world).then
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
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, orderid: result.orderid, orderattachmentid: world.orderattachmentid, datemodified: result.datemodified, usermodified: result.usermodified, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'orderattachmentsaved', {orderid: result.orderid, orderattachmentid: world.orderattachmentid, dateexpired: result.dateexpired, userexpired: result.userexpired}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({saveorderattachment: true}, msg);
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
                      global.log.error({saveorderattachment: true}, msg);
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
              global.log.error({saveorderattachment: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({saveorderattachment: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ExpireOrderAttachment(world)
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
              doExpireOrderAttachment(tx, world).then
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
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, orderid: result.orderid, orderattachmentid: world.orderattachmentid, dateexpired: result.dateexpired, userexpired: result.userexpired, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'orderattachmentexpired', {orderid: result.orderid, orderattachmentid: world.orderattachmentid, dateexpired: result.dateexpired, userexpired: result.userexpired}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({expireorderattachment: true}, msg);
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
                      global.log.error({expireorderattachment: true}, msg);
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
              global.log.error({expireorderattachment: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({expireorderattachment: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function GetOrderThumbnail(world)
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
          'oa1.id ' +
          'from ' +
          'orderattachments oa1 ' +
          'where ' +
          'oa1.customers_id=$1 ' +
          'and ' +
          'oa1.orders_id=$2 ' +
          'and ' +
          'oa1.isthumbnail=1',
          [
            world.cn.custid,
            __.sanitiseAsBigInt(world.orderid)
          ],
          function(err, result)
          {
            done();

            if (!err)
              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, orderattachmentid: result.rows[0].id, pdata: world.pdata});
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({getorderthumbnail: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({getorderthumbnail: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ListOrderDetails(world)
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
          'o1.products_id productid,' +
          'o1.version,' +
          'o1.price,' +
          'o1.gst,' +
          'o1.qty,' +
          'o1.discount,' +
          'o1.expressfee,' +
          'o1.isrepeat,' +
          'o1.isnewartwork,' +
          'p1.name productname,' +
          'o1.datecreated,' +
          'o1.datemodified,' +
          'u1.name usercreated,' +
          'u2.name usermodified ' +
          'from ' +
          'orderdetails o1 left join products p1 on (o1.products_id=p1.id) ' +
          '                left join users u1 on (o1.userscreated_id=u1.id) ' +
          '                left join users u2 on (o1.usersmodified_id=u2.id) ' +
          'where ' +
          'o1.customers_id=$1 ' +
          'and ' +
          'o1.orders_id=$2 ' +
          'and ' +
          'o1.version=$3 ' +
          'and ' +
          'o1.dateexpired is null ' +
          'order by ' +
          'o1.datecreated desc',
          [
            world.cn.custid,
            __.sanitiseAsBigInt(world.orderid),
            world.version
          ],
          function(err, result)
          {
            done();

            if (!err)
            {
              // JS returns date with TZ info/format, need in ISO format...
              result.rows.forEach
              (
                function(p)
                {
                  if (!__.isUN(p.datemodified))
                    p.datemodified = global.moment(p.datemodified).format('YYYY-MM-DD HH:mm:ss');

                  p.datecreated = global.moment(p.datecreated).format('YYYY-MM-DD HH:mm:ss');
                }
              );

              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({listorderdetails: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({listorderdetails: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function NewOrderDetail(world)
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
              var od = null;

              doNewOrderDetail(tx, world.cn.custid, world.cn.userid, world.orderid, world.version, world.productid, world.qty, world.price, world.discount, world.expressfee).then
              (
                function(result)
                {
                  od = result;

                  // If this is a built product, we need to create a jobsheet for it...
                  if (!__.isNull(od.buildtemplateheaderid))
                  {
                    global.modconfig.doNextJobSheetNo(tx, world).then
                    (
                      function(result)
                      {
                        return doNewJobSheet(tx, world.cn.custid, world.cn.userid, result.jobsheetno, world.orderid, od.orderdetailid, od.buildtemplateheaderid);
                      }
                    ).then
                    (
                      function(result)
                      {
                        // Now it's all done...
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
                                  orderdetailid: od.orderdetailid,
                                  orderid: world.orderid,
                                  version: world.version,
                                  datecreated: od.datecreated,
                                  usercreated: od.usercreated,
                                  pdata: world.pdata
                                }
                              );
                              global.pr.sendToRoomExcept
                              (
                                global.custchannelprefix + world.cn.custid,
                                'orderdetailcreated',
                                {
                                  orderdetailid: od.orderdetailid,
                                  orderid: world.orderid,
                                  version: world.version,
                                  datecreated: od.datecreated,
                                  usercreated: od.usercreated
                                },
                                world.spark.id
                              );
                              // We also updated config (with new orderno and possibly jobsheet) so let everyone know that too...
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
                                  global.log.error({neworderdetail: true}, msg);
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
                            global.log.error({neworderdetail: true}, msg);
                            world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                          }
                        );
                      }
                    );
                  }
                  else
                  {
                    // All done...
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
                              orderdetailid: od.orderdetailid,
                              orderid: world.orderid,
                              version: world.version,
                              datecreated: od.datecreated,
                              usercreated: od.usercreated,
                              pdata: world.pdata
                            }
                          );
                          global.pr.sendToRoomExcept
                          (
                            global.custchannelprefix + world.cn.custid,
                            'orderdetailcreated',
                            {
                              orderdetailid: od.orderdetailid,
                              orderid: world.orderid,
                              version: world.version,
                              datecreated: od.datecreated,
                              usercreated: od.usercreated
                            },
                            world.spark.id
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
                              global.log.error({neworderdetail: true}, msg);
                              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
                            }
                          );
                        }
                      }
                    );
                  }
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
                      global.log.error({neworderdetail: true}, msg);
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
              global.log.error({neworderdetail: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({neworderdetail: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function OrderPay(world)
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
              world.status = global.itype_os_depositpaid;
              world.connote = '';
              world.comment = "Payment made in amount: $" + __.sanitiseAsPrice(world.amount, 2);

              doNewOrderStatus(tx, world).then
              (
                function(result)
                {
                  return doSendStatusAlerts(tx, world);
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
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, pdata: world.pdata});
                        global.pr.sendToRoom(global.custchannelprefix + world.cn.custid, 'orderpaid', {});
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({orderpay: true}, msg);
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
                      global.log.error({orderpay: true}, msg);
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
              global.log.error({orderpay: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({orderpay: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function CheckPONo(world)
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
        var binds = [world.cn.custid, world.pono];
        var clause = '';

        if (!__.isNull(world.orderid))
        {
          clause = ' and o1.id!=$3';
          binds.push(world.orderid);
        }

        client.query
        (
          'select ' +
          'o1.id,' +
          'o1.pono,' +
          'o1.orderno,' +
          'o1.name ordername,' +
          'c1.name clientname ' +
          'from ' +
          'orders o1 left join clients c1 on (o1.clients_id=c1.id) ' +
          'where ' +
          'o1.customers_id=$1 ' +
          'and ' +
          'o1.dateexpired is null ' +
          'and ' +
          'upper(o1.pono)=upper($2) ' +
          clause,
          binds,
          function(err, result)
          {
            done();

            if (!err)
              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({checkpono: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({checkpono: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function SearchOrderNote(world)
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
        var words =  world.words.replace(/\s+/g, ' & ');
        client.query
        (
          'select ' +
          'on1.id,' +
          'on1.notes,' +
          'on1.datecreated,' +
          'on1.datemodified,' +
          'u1.name usercreated,' +
          'u2.name usermodified ' +
          'from ' +
          'ordernotes on1 left join users u1 on (on1.userscreated_id=u1.id) ' +
          '               left join users u2 on (on1.usersmodified_id=u2.id) ' +
          'where ' +
          'on1.customers_id=$1 ' +
          'and ' +
          'on1.orders_id=$2 ' +
          'and ' +
          'on1.dateexpired is null ' +
          'and ' +
          'to_tsvector(\'english\', on1.notes) @@ to_tsquery(\'english\', $3) ' +
          'order by ' +
          'on1.datecreated desc',
          [
            world.cn.custid,
            __.sanitiseAsBigInt(world.orderid),
            __.sanitiseAsString(words)
          ],
          function(err, result)
          {
            done();

            if (!err)
            {
              result.rows.forEach
              (
                function(p)
                {
                  if (!__.isUN(p.notes))
                    p.notes = __.unescapeHTML(p.notes);

                  if (!__.isUN(p.datemodified))
                    p.datemodified = global.moment(p.datemodified).format('YYYY-MM-DD HH:mm:ss');

                  p.datecreated = global.moment(p.datecreated).format('YYYY-MM-DD HH:mm:ss');
                }
              );

              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({searchordernote: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({searchordernote: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

// *******************************************************************************************************************************************************************************************
// Internal functions
module.exports.doGetCustIdFromOrderNo = doGetCustIdFromOrderNo;
module.exports.doNewOrderDetail = doNewOrderDetail;

module.exports.newOrderAttachment = newOrderAttachment;
module.exports.existingOrderAttachment = existingOrderAttachment;

module.exports.doNewOrderStatus = doNewOrderStatus;
module.exports.doCheckStatusForInventoryAdjust = doCheckStatusForInventoryAdjust;
module.exports.doInventoryAdjust = doInventoryAdjust;
module.exports.doCommitOrderInventory = doCommitOrderInventory;
module.exports.doSendStatusAlerts = doSendStatusAlerts;

// *******************************************************************************************************************************************************************************************
// Public functions
module.exports.ListOrders = ListOrders;
module.exports.LoadOrder = LoadOrder;
module.exports.NewOrderClient = NewOrderClient;
module.exports.SaveOrder = SaveOrder;
module.exports.NewVersionOrder = NewVersionOrder;
module.exports.ExpireOrder = ExpireOrder;
module.exports.DuplicateOrder = DuplicateOrder;
module.exports.SearchOrders = SearchOrders;
module.exports.CreateInvoice = CreateInvoice;
module.exports.OrderPay = OrderPay;
module.exports.CheckPONo = CheckPONo;

module.exports.SaveOrderNote_NewOrder = SaveOrderNote_NewOrder;
module.exports.CleanOrderNoteLocally = CleanOrderNoteLocally;
module.exports.NewOrderNote_NoOrderID = NewOrderNote_NoOrderID;

module.exports.ListOrderNotes = ListOrderNotes;
module.exports.NewOrderNote = NewOrderNote;
module.exports.SaveOrderNote = SaveOrderNote;
module.exports.SearchOrderNote = SearchOrderNote;

module.exports.ListOrderStatuses = ListOrderStatuses;
module.exports.NewOrderStatus = NewOrderStatus;

module.exports.ListOrderDetails = ListOrderDetails;
module.exports.NewOrderDetail = NewOrderDetail;
module.exports.SaveOrderDetail = SaveOrderDetail;
module.exports.ExpireOrderDetail = ExpireOrderDetail;

module.exports.ListOrderAttachments = ListOrderAttachments;
module.exports.SaveOrderAttachment = SaveOrderAttachment;
module.exports.ExpireOrderAttachment = ExpireOrderAttachment;
module.exports.GetOrderThumbnail = GetOrderThumbnail;


