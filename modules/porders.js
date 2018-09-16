// *******************************************************************************************************************************************************************************************
// Internal functions
function doGompletePOrder(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'update porders set datecompleted=now(),userscompleted_id=$1 where customers_id=$2 and id=$3',
        [
          world.cn.userid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.porderid)
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

function doInventoryAdjust(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      // Get products used in this order...
      // Make sure it's latest (active) order version
      tx.query
      (
        'select ' +
        'pod1.qty,' +
        'rp1.id productid,' +
        'rp1.costofgoodsaccounts_id,' +
        'rp1.incomeaccounts_id,' +
        'rp1.assetaccounts_id,' +
        'rp1.buytaxcodes_id,' +
        'rp1.uom,' +
        'rp1.uomsize,' +
        'pod1.price,' +
        'po1.porderno ' +
        'from ' +
        'porderdetails pod1 left join porders po1 on (pod1.porders_id=po1.id) ' +
        '                   left join getrealproduct($1,pod1.products_id) rp1 on (1=1) ' +
        'where ' +
        'pod1.customers_id=$2 ' +
        'and ' +
        'po1.id=$3 ' +
        'and ' +
        'pod1.dateexpired is null',
        [
          world.cn.custid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.porderid)
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
                        __.formatnumber(r.qty, 4),
                        global.itype_inventory_porder,
                        __.sanitiseAsBigInt(world.porderid),
                        world.cn.userid
                      ],
                      function(err, result)
                      {
                        if (!err)
                        {
                          var invresult = result;

                          global.modjournals.doAddJournalEntry
                          (
                            tx,
                            {
                              custid: world.cn.custid,
                              userid: world.cn.userid,
                              type: global.itype_journal_inventory_purchase,
                              refno: r.porderno,
                              comments: null,
                              entries:
                              [
                                {
                                  debitaccountid: r.assetaccounts_id,
                                  creditaccountid: world.custconfig.inventoryadjustaccountid,
                                  taxcodeid: r.buytaxcodes_id,
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
  );

  return promise;
}

function doNewPOrderSupplier(tx, world)
{
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
        'insert into porders (customers_id,porderno,name,invoiceno,refno,clients_id,invoiceto_name,invoiceto_address1,invoiceto_address2,invoiceto_address3,invoiceto_address4,invoiceto_city,invoiceto_state,invoiceto_postcode,invoiceto_country,shipto_name,shipto_address1,shipto_address2,shipto_address3,shipto_address4,shipto_city,shipto_state,shipto_postcode,shipto_country,userscreated_id) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25) returning id',
        [
          world.cn.custid,
          __.sanitiseAsString(world.porderno),
          __.sanitiseAsString(world.name),
          __.sanitiseAsString(world.invoiceno),
          __.sanitiseAsString(world.refno),
          __.sanitiseAsBigInt(world.supplierid),

          __.sanitiseAsString(world.name),
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

          world.cn.userid
        ],
        function(err, result)
        {
          if (!err)
          {
            var porderid = result.rows[0].id;

            tx.query
            (
              'select po1.datecreated,u1.name usercreated from porders po1 left join users u1 on (po1.userscreated_id=u1.id) where po1.customers_id=$1 and po1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(porderid)
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
                        calls.push
                        (
                          function (callback)
                          {
                            tx.query
                            (
                              'insert into porderdetails (customers_id,porders_id,products_id,qty,price,userscreated_id) values ($1,$2,$3,$4,$5,$6) returning id',
                              [
                                world.cn.custid,
                                __.sanitiseAsBigInt(porderid),
                                __.sanitiseAsBigInt(p.productid),
                                __.sanitiseAsPrice(p.qty, 4),
                                __.sanitiseAsPrice(p.price, 4),
                                world.cn.userid
                              ],
                              function(err, result)
                              {
                                if (!err)
                                {
                                  if (!err)
                                    callback(null, {porderdetailid: result.rows[0].id});
                                  else
                                    callback(err);
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
                        {
                          resolve
                          (
                            {
                              porderid: porderid,
                              porderno: world.porderno,
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
                        porderid: porderid,
                        porderno: world.porderno,
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

function doSavePOrderSupplier(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'update ' +
        'porders ' +
        'set ' +
        'name=$1,' +
        'invoiceno=$2,' +
        'refno=$3,' +
        'invoiceto_address1=$4,' +
        'invoiceto_address2=$5,' +
        'invoiceto_address3=$6,' +
        'invoiceto_address4=$7,' +
        'invoiceto_city=$8,' +
        'invoiceto_state=$9,' +
        'invoiceto_postcode=$10,' +
        'invoiceto_country=$11,' +
        'shipto_address1=$12,' +
        'shipto_address2=$13,' +
        'shipto_address3=$14,' +
        'shipto_address4=$15,' +
        'shipto_city=$16,' +
        'shipto_state=$17,' +
        'shipto_postcode=$18,' +
        'shipto_country=$19,' +
        'datemodified=now(),' +
        'usersmodified_id=$20 ' +
        'where ' +
        'customers_id=$21 ' +
        'and ' +
        'id=$22',
        [
          __.sanitiseAsString(world.name),
          __.sanitiseAsString(world.invoiceno),
          __.sanitiseAsString(world.refno),

          __.sanitiseAsString(world.address1),
          __.sanitiseAsString(world.address2),
          __.sanitiseAsString(world.address3),
          __.sanitiseAsString(world.address4),
          __.sanitiseAsString(world.city),
          __.sanitiseAsString(world.postcode),
          __.sanitiseAsString(world.country),
          __.sanitiseAsString(world.state),

          __.sanitiseAsString(world.shiptoaddress1),
          __.sanitiseAsString(world.shiptoaddress2),
          __.sanitiseAsString(world.shiptoaddress3),
          __.sanitiseAsString(world.shiptoaddress4),
          __.sanitiseAsString(world.shiptocity),
          __.sanitiseAsString(world.shiptopostcode),
          __.sanitiseAsString(world.shiptocountry),
          __.sanitiseAsString(world.shiptostate),

          world.cn.userid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.porderid)
        ],
        function(err, result)
        {
          if (!err)
          {
            tx.query
            (
              'select po1.porderno,po1.datemodified,u1.name usermodified from porders po1 left join users u1 on (po1.usersmodified_id=u1.id) where po1.customers_id=$1 and po1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(world.porderid)
              ],
              function(err, result)
              {
                if (!err)
                {
                  var po = result.rows[0];

                  // Expire previous entries - easier than trying to figure out what to remove/update/insert...
                  tx.query
                  (
                    'update porderdetails set dateexpired=now(),usersexpired_id=$1 where customers_id=$2 and porders_id=$3',
                    [
                      world.cn.userid,
                      world.cn.custid,
                      __.sanitiseAsBigInt(world.porderid)
                    ],
                    function(err, result)
                    {
                      if (!err)
                      {
                        if (!__.isNull(world.products) && (world.products.length > 0))
                        {
                          var calls = [];
                          world.products.forEach
                          (
                            function(p)
                            {
                              calls.push
                              (
                                function (callback)
                                {
                                  tx.query
                                  (
                                    'insert into porderdetails (customers_id,porders_id,products_id,qty,price,userscreated_id) values ($1,$2,$3,$4,$5,$6) returning id',
                                    [
                                      world.cn.custid,
                                      __.sanitiseAsBigInt(world.porderid),
                                      __.sanitiseAsBigInt(p.productid),
                                      __.sanitiseAsPrice(p.qty, 4),
                                      __.sanitiseAsPrice(p.price, 4),
                                      world.cn.userid
                                    ],
                                    function(err, result)
                                    {
                                      if (!err)
                                      {
                                        if (!err)
                                          callback(null, {porderdetailid: result.rows[0].id});
                                        else
                                          callback(err);
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
                              {
                                resolve
                                (
                                  {
                                    porderid: world.porderid,
                                    porderno: po.porderno,
                                    datemodified: global.moment(po.datemodified).format('YYYY-MM-DD HH:mm:ss'),
                                    usermodified: po.usermodified
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
                              porderid: porderid,
                              porderno: world.porderno,
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
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doExpirePOrder(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'update porders set dateexpired=now(),usersexpired_id=$1 where customers_id=$2 and id=$3 and dateexpired is null',
        [
          world.cn.userid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.porderid)
        ],
        function(err, result)
        {
          if (!err)
            resolve({porderid: world.porderid});
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
function ListPOrders(world)
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
          'po1.id,' +
          'po1.clients_id clientid,' +
          'po1.porderno,' +
          'po1.name,' +
          'po1.invoiceno,' +
          'po1.refno,' +
          'po1.accounts_id accountid,' +
          'po1.totalprice,' +
          'po1.totalqty,' +
          'po1.invoiceto_name invoicetoname,' +
          'po1.invoiceto_address1 invoicetoaddress1,' +
          'po1.invoiceto_address2 invoicetoaddress2,' +
          'po1.invoiceto_city invoicetocity,' +
          'po1.invoiceto_state invoicetostate,' +
          'po1.invoiceto_postcode invoicetopostcode,' +
          'po1.invoiceto_country invoicetocountry,' +
          'po1.shipto_name shiptoname,' +
          'po1.shipto_address1 shiptoaddress1,' +
          'po1.shipto_address2 shiptoaddress2,' +
          'po1.shipto_city shiptocity,' +
          'po1.shipto_state shiptostate,' +
          'po1.shipto_postcode shiptopostcode,' +
          'po1.shipto_country shiptocountry,' +
          'po1.datecompleted,' +
          'c1.name suppliername,' +
          'po2.id parentid,' +
          'po2.name parentname,' +
          'po1.dateinvoicedue,' +
          'po1.datecreated,' +
          'po1.datemodified,' +
          'p1 paid,' +
          '(po1.totalprice + po1.totalgst - p1) balance,' +
          'u1.name usercreated,' +
          'u2.name usermodified,' +
          'u2.name usercompleted ' +
          'from ' +
          'porders po1 left join porders po2 on (po1.porders_id=po2.id) ' +
          '            left join clients c1 on (po1.clients_id=c1.id) ' +
          '            left join users u1 on (po1.userscreated_id=u1.id) ' +
          '            left join users u2 on (po1.usersmodified_id=u2.id) ' +
          '            left join users u3 on (po1.userscompleted_id=u3.id) ' +
          '            left join getpototalpayments($1,po1.id) p1 on (1=1) ' +
          'where ' +
          'po1.customers_id=$2 ' +
          'and ' +
          'po1.dateexpired is null ' +
          'order by ' +
          'po1.datecreated ' +
          'limit $3',
          [
            world.cn.custid,
            world.cn.custid,
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
                  if (!__.isUN(p.datecompleted))
                    p.datecompleted = global.moment(p.datecompleted).format('YYYY-MM-DD HH:mm:ss');

                  if (!__.isUN(p.dateinvoicedue))
                    p.dateinvoicedue = global.moment(p.dateinvoicedue).format('YYYY-MM-DD HH:mm:ss');

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
              global.log.error({listporders: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({listporders: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function LoadPOrder(world)
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
          'po1.id,' +
          'po1.clients_id clientid,' +
          'po1.porderno,' +
          'po1.name,' +
          'po1.invoiceno,' +
          'po1.refno,' +
          'po1.accounts_id accountid,' +
          'po1.totalprice,' +
          'po1.totalqty,' +
          'po1.invoiceto_name invoicetoname,' +
          'po1.invoiceto_address1 invoicetoaddress1,' +
          'po1.invoiceto_address2 invoicetoaddress2,' +
          'po1.invoiceto_address2 invoicetoaddress3,' +
          'po1.invoiceto_address2 invoicetoaddress4,' +
          'po1.invoiceto_city invoicetocity,' +
          'po1.invoiceto_state invoicetostate,' +
          'po1.invoiceto_postcode invoicetopostcode,' +
          'po1.invoiceto_country invoicetocountry,' +
          'po1.shipto_name shiptoname,' +
          'po1.shipto_address1 shiptoaddress1,' +
          'po1.shipto_address2 shiptoaddress2,' +
          'po1.shipto_address1 shiptoaddress3,' +
          'po1.shipto_address1 shiptoaddress4,' +
          'po1.shipto_city shiptocity,' +
          'po1.shipto_state shiptostate,' +
          'po1.shipto_postcode shiptopostcode,' +
          'po1.shipto_country shiptocountry,' +
          'po1.datecompleted,' +
          'c1.name suppliername,' +
          'po2.id parentid,' +
          'po2.name parentname,' +
          'po1.dateinvoicedue,' +
          'po1.datecreated,' +
          'po1.datemodified,' +
          'u1.name usercreated,' +
          'u2.name usermodified,' +
          'u2.name usercompleted ' +
          'from ' +
          'porders po1 left join porders po2 on (po1.porders_id=po2.id) ' +
          '            left join clients c1 on (po1.clients_id=c1.id) ' +
          '            left join users u1 on (po1.userscreated_id=u1.id) ' +
          '            left join users u2 on (po1.usersmodified_id=u2.id) ' +
          '            left join users u3 on (po1.userscompleted_id=u3.id) ' +
          'where ' +
          'po1.customers_id=$1 ' +
          'and ' +
          'po1.id=$2',
          [
            world.cn.custid,
            __.sanitiseAsBigInt(world.porderid)
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
                  if (!__.isUN(p.datecompleted))
                    p.datecompleted = global.moment(p.datecompleted).format('YYYY-MM-DD HH:mm:ss');

                  if (!__.isUN(p.dateinvoicedue))
                    p.dateinvoicedue = global.moment(p.dateinvoicedue).format('YYYY-MM-DD HH:mm:ss');

                  if (!__.isUN(p.datemodified))
                    p.datemodified = global.moment(p.datemodified).format('YYYY-MM-DD HH:mm:ss');

                  p.datecreated = global.moment(p.datecreated).format('YYYY-MM-DD HH:mm:ss');
                }
              );

              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, porder: result.rows[0], pdata: world.pdata});
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({loadporder: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({loadporder: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function NewPOrderSupplier(world)
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
              global.modconfig.doNextPOrderNo(tx, world).then
              (
                function(result)
                {
                  world.porderno = result.porderno;
                  //
                  return doNewPOrderSupplier(tx, world);
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
                            porderid: result.porderid,
                            porderno: result.porderno,
                            datecreated: result.datecreated,
                            usercreated: result.usercreated,
                            pdata: world.pdata
                          }
                        );
                        global.pr.sendToRoomExcept
                        (
                          global.custchannelprefix + world.cn.custid,
                          'pordercreated',
                          {
                            porderid: result.porderid,
                            porderno: result.porderno,
                            datecreated: result.datecreated,
                            usercreated: result.usercreated
                          },
                          world.spark.id
                        );
                        // We also updated config (with new porderno) so let everyone know that too...
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
                            global.log.error({newpordersupplier: true}, msg);
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
                      global.log.error({newpordersupplier: true}, msg);
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
              global.log.error({newpordersupplier: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({newpordersupplier: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function SavePOrderSupplier(world)
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
              doSavePOrderSupplier(tx, world).then
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
                            porderid: result.porderid,
                            porderno: result.porderno,
                            datemodified: result.datemodified,
                            usermodifid: result.usermodifid,
                            pdata: world.pdata
                          }
                        );
                        global.pr.sendToRoomExcept
                        (
                          global.custchannelprefix + world.cn.custid,
                          'pordersaved',
                          {
                            porderid: world.porderid,
                            porderno: result.porderno,
                            datemodified: result.datemodified,
                            usermodifid: result.usermodified
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
                            global.log.error({savepordersupplier: true}, msg);
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
                      global.log.error({savepordersupplier: true}, msg);
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
              global.log.error({savepordersupplier: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({savepordersupplier: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ExpirePOrder(world)
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
              doExpirePOrder(tx, world).then
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
                        global.pr.sendToRoom(global.custchannelprefix + world.cn.custid, 'porderexpired', {porderid: result.porderid});
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({expireporder: true}, msg);
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
                      global.log.error({expireporder: true}, msg);
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
              global.log.error({expireporder: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({expireporder: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function CompletePOrder(world)
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
              doGompletePOrder(tx, world).then
              (
                function(result)
                {
                  return doInventoryAdjust(tx, world);
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
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, pdata: world.pdata});
                        global.pr.sendToRoom(global.custchannelprefix + world.cn.custid, 'pordercompleted', {porderid: world.porderid});
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({completeporder: true}, msg);
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
                      global.log.error({completeporder: true}, msg);
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
              global.log.error({completeporder: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({completeporder: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function SearchPOrders(world)
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
        var maxhistory = __.isUN(world.maxhistory)  ? 200 : world.maxhistory;
        var clauses = '';
        var binds =
        [
          world.cn.custid
        ];
        var bindno = binds.length + 1;

        if (!__.isUNB(world.porderno))
        {
          clauses += '(upper(po1.porderno) like upper($' + bindno++ + ')) and ';
          binds.push('%' + world.porderno + '%');
        }

        if (!__.isUNB(world.name))
        {
          clauses += '(upper(po1.name) like upper($' + bindno++ + ')) and ';
          binds.push('%' + world.name + '%');
        }

        if (!__.isUNB(world.postcode))
        {
          clauses += '(po1.invoiceto_postcode like $' + bindno++ + ') and ';
          binds.push('%' + world.postcode + '%');
        }

        if (!__.isUNB(world.city))
        {
          clauses += '(upper(po1.invoiceto_city) like upper($' + bindno++ + ')) and ';
          binds.push('%' + world.city + '%');
        }

        if (!__.isUNB(world.country))
        {
          clauses += '(upper(po1.invoiceto_country) like upper($' + bindno++ + ')) and ';
          binds.push('%' + world.country + '%');
        }

        if (!__.isUNB(world.state))
        {
          clauses += '(upper(po1.invoiceto_state) like upper($' + bindno++ + ')) and ';
          binds.push('%' + world.state + '%');
        }

        if (!__.isUNB(world.datefrom))
        {
          var df = global.moment(world.datefrom).format('YYYY-MM-DD 00:00:00');

          if (!__.isUNB(world.dateto))
          {
            var dt = global.moment(world.dateto).format('YYYY-MM-DD 23:59:59');

            // Search between datefrom and dateto
            clauses += '(po1.datecreated between $' + bindno++ + ' and $' + bindno++ + ') and ';
            binds.push(df);
            binds.push(dt);
          }
          else
          {
            // Search between datefrom and now
            clauses += '(po1.datecreated between $' + bindno++ + ' and now()) and ';
            binds.push(df);
          }
        }
        else
        {
          if (!__.isUNB(world.dateto))
          {
            var dt = global.moment(world.dateto).format('YYYY-MM-DD 23:59:59');

            // Search between beginning and dateto
            clauses += '(po1.datecreated <= $' + bindno++ + ') and ';
            binds.push(df);
          }
        }

        if (!__.isUN(world.suppliers) && (world.suppliers.length > 0))
        {
          if (__.isArray(world.suppliers))
          {
            clauses += '(po1.suppliers_id in (';

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
        if (bindno > 1)
        {
          // Lastly, make sure we don't end up with too many rows...
          binds.push(maxhistory);

          client.query
          (
            'select ' +
            'po1.id,' +
            'po1.clients_id supplierid,' +
            'po1.porderno,' +
            'po1.name,' +
            'po1.accounts_id accountid,' +
            'po1.totalprice,' +
            'po1.totalqty,' +
            'po1.invoiceto_name invoicetoname,' +
            'po1.invoiceto_address1 invoicetoaddress1,' +
            'po1.invoiceto_address2 invoicetoaddress2,' +
            'po1.invoiceto_city invoicetocity,' +
            'po1.invoiceto_state invoicetostate,' +
            'po1.invoiceto_postcode invoicetopostcode,' +
            'po1.invoiceto_country invoicetocountry,' +
            'po1.shipto_name shiptoname,' +
            'po1.shipto_address1 shiptoaddress1,' +
            'po1.shipto_address2 shiptoaddress2,' +
            'po1.shipto_city shiptocity,' +
            'po1.shipto_state shiptostate,' +
            'po1.shipto_postcode shiptopostcode,' +
            'po1.shipto_country shiptocountry,' +
            'po1.inventorycommitted,' +
            'c1.name suppliername,' +
            'po2.id parentid,' +
            'po2.name parentname,' +
            'po1.dateinvoicedue,' +
            'po1.datecreated,' +
            'po1.datemodified,' +
            'u1.name usercreated,' +
            'u2.name usermodified ' +
            'from ' +
            'porders po1 left join porders po2 on (po1.porders_id=po2.id) ' +
            '            left join clients c1 on (po1.clients_id=c1.id) ' +
            '            left join users u1 on (po1.userscreated_id=u1.id) ' +
            '            left join users u2 on (po1.usersmodified_id=u2.id) ' +
            'where ' +
            'po1.customers_id=$1 ' +
            'and ' +
            clauses +
            'po1.dateexpired is null ' +
            'order by ' +
            'po1.datecreated desc ' +
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
                    if (!__.isUN(p.datecompleted))
                      p.datecompleted = global.moment(p.datecompleted).format('YYYY-MM-DD HH:mm:ss');

                    if (!__.isUN(p.dateinvoicedue))
                      p.dateinvoicedue = global.moment(p.dateinvoicedue).format('YYYY-MM-DD HH:mm:ss');
  
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
                global.log.error({searchporders: true}, msg);
                world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
              }
            }
          );
        }
        else
        {
          msg += global.text_nodata;
          global.log.error({searchporders: true}, msg);
          world.spark.emit(global.eventerror, {rc: global.errcode_nodata, msg: msg, pdata: world.pdata});
        }
      }
      else
      {
        global.log.error({searchporders: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ListPOrderDetails(world)
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
          'po1.id,' +
          'po1.products_id productid,' +
          'po1.price,' +
          'po1.gst,' +
          'po1.qty,' +
          'p1.name productname,' +
          'po1.datecreated,' +
          'po1.datemodified,' +
          'u1.name usercreated,' +
          'u2.name usermodified ' +
          'from ' +
          'porderdetails po1 left join products p1 on (po1.products_id=p1.id) ' +
          '                  left join users u1 on (po1.userscreated_id=u1.id) ' +
          '                  left join users u2 on (po1.usersmodified_id=u2.id) ' +
          'where ' +
          'po1.customers_id=$1 ' +
          'and ' +
          'po1.porders_id=$2 ' +
          'and ' +
          'po1.dateexpired is null ' +
          'order by ' +
          'po1.datecreated desc',
          [
            world.cn.custid,
            __.sanitiseAsBigInt(world.porderid)
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
              global.log.error({listporderdetails: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({listporderdetails: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

// *******************************************************************************************************************************************************************************************
// Public functions
module.exports.ListPOrders = ListPOrders;
module.exports.LoadPOrder = LoadPOrder;
module.exports.ExpirePOrder = ExpirePOrder;
module.exports.NewPOrderSupplier = NewPOrderSupplier;
module.exports.SavePOrderSupplier = SavePOrderSupplier;
module.exports.SearchPOrders = SearchPOrders;
module.exports.CompletePOrder = CompletePOrder;

module.exports.ListPOrderDetails = ListPOrderDetails;
