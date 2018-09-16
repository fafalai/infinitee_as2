// *******************************************************************************************************************************************************************************************
// Internal functions
function doGetProductInventoryInfo(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      // Need current cost price and UOM details of product...
      tx.query
      (
        'select p1.costprice,p1.costgst,p1.uom,p1.uomsize from products p1 where p1.customers_id=$1 and p1.id=$2',
        [
          world.cn.custid,
          __.sanitiseAsBigInt(world.productid)
        ],
        function(err, result)
        {
          if (!err)
          {
            if (result.rows.length == 1)
            {
              var uom = (__.isUN(result.rows[0].uom)) ? '' : result.rows[0].uom;
              var uomsize = (__.isUN(result.rows[0].uomsize)) ? 1 : __.sanitiseAsPrice(result.rows[0].uomsize);

              resolve({costprice: result.rows[0].costprice, costgst: result.rows[0].costgst, uom: uom, uomsize: uomsize});
            }
            else
              reject(err);
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

// When qty is negative, need to:
// 1. Call doGetInventoryAvail() to get list of avail stock for given location/product...
// 2. Call doRemoveFromAvail() to remove FIFO
function doGetInventoryAvail(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'select ' +
        'i1.id,' +
        'i1.avail,' +
        'i1.batchno,' +
        'i1.dateexpiry ' +
        'from ' +
        'inventory i1 ' +
        'where ' +
        'i1.customers_id=$1 ' +
        'and ' +
        'i1.locations_id=$2 ' +
        'and ' +
        'i1.products_id=$3 ' +
        'and ' +
        '(avail is not null and avail > 0) ' +
        'order by ' +
        'i1.dateexpiry asc,' +
        'i1.datecreated asc',
        [
          world.cn.custid,
          __.sanitiseAsBigInt(world.locationid),
          __.sanitiseAsBigInt(world.productid)
        ],
        function(err, result)
        {
          if (!err)
            resolve(result.rows);
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doRemoveFromAvail(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      var idx = 0;
      var qtyremain = world.qty;

      // First, simple loop to subtract available stock...

      if (!__.isUndefined(world.avail) && (world.avail.length > 0))
      {
        for (var i = 0; (qtyremain > 0) && (i < world.avail.length); i++)
        {
          var av = world.avail[i];

          if (av.qty >= qtyremain)
          {
            // This entry has more than enough stock..
            av.qty -= qtyremain;
            av.changed = true;
            qtyremain = 0;
          }
          else
          {
            // This entry doesn't have enough stock, we take all of it...
            qtyremain -= av.qty;
            av.qty = 0;
            av.changed = true;
          }
        }

        var calls = [];

        for (var i = 0; i < world.avail; i++)
        {
          // Ok now update all the entries to reflect new avail qty...
        }
      }
      else
      {
        // We actually don't have any stock - need to just record -ve qty against original inventory entry...
      }
    }
  );
  return promise;
}

function doProductsAtLocation(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      var location = ' and i1.locations_id is null';
      var binds =
      [
        world.cn.custid,
        __.sanitiseAsBigInt(world.productid)
      ];

      if (!__.isBlank(world.srclocationid))
      {
        location = ' and i1.locations_id=$3';
        binds.push(__.sanitiseAsBigInt(world.srclocationid));
      }

      if (!__.isBlank(world.batchno) && !__.isNull(world.batchno))
      {
        binds.push(world.batchno);
        tx.query
        (
          'select sum(i1.qty) qty,i1.batchno,i1.dateexpiry,i1.dateproduction from inventory i1 where i1.customers_id=$1 and i1.products_id=$2' + location + ' and i1.batchno=$' + binds.length + ' group by i1.batchno,i1.dateexpiry,i1.dateproduction',
          binds,
          function(err, result)
          {
            if (!err)
            {
              if (result.rows.length == 1)
                resolve({qty: result.rows[0].qty, batchno: result.rows[0].batchno,  dateexpiry: result.rows[0].dateexpiry, dateproduction: result.rows[0].dateproduction});
              else
                reject({message: 'No stock at FROM location'});
            }
            else
              reject(err);
          }
        );
      }
      else
      {
        tx.query
        (
          'select sum(i1.qty) qty from inventory i1 where i1.customers_id=$1 and i1.products_id=$2' + location,
          binds,
          function(err, result)
          {
            if (!err)
            {
              if (result.rows.length == 1)
                resolve({qty: result.rows[0].qty, batchno: null, dateexpiry: null, dateproduction: null});
              else
                reject({message: 'No stock at FROM location'});
            }
            else
              reject(err);
          }
        );
      }
    }
  );
  return promise;
}

function doAddInventory(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      // Need current price of product...
      tx.query
      (
        'insert into inventory (customers_id,locations_id,products_id,costprice,costgst,qty,type,batchno,dateexpiry,dateproduction,other_id,comments,userscreated_id) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) returning id',
        [
          world.cn.custid,
          __.sanitiseAsBigInt(world.locationid),
          __.sanitiseAsBigInt(world.productid),
          __.formatnumber(world.costprice, 4),
          __.formatnumber(world.costgst, 4),
          __.formatnumber(world.qty, 4),
          __.sanitiseAsBigInt(world.type),
          __.sanitiseAsString(world.batchno),
          __.sanitiseAsDate(world.dateexpiry),
          __.sanitiseAsDate(world.dateproduction),
          __.sanitiseAsBigInt(world.otherid),
          __.sanitiseAsString(__.escapeHTML(world.comments)),
          world.cn.userid
        ],
        function(err, result)
        {
          if (!err)
          {
            var inventoryid = result.rows[0].id;

            tx.query
            (
              'select i1.datecreated,u1.name from inventory i1 left join users u1 on (i1.userscreated_id=u1.id) where i1.customers_id=$1 and i1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(inventoryid)
              ],
              function(err, result)
              {
                if (!err)
                {
                  // Special case if inventory negative, need to remove stock via FIFO
                  if (__.toBigNum(world.qty).isNegative())
                  {
                    doGetInventoryAvail(tx, world).then
                    (
                      function(result)
                      {
                        // We now have rows that are +ve avail qty for this product
                        world.avail = result;
                      }
                    ).then
                    (
                      function(result)
                      {
                        ;
                      }
                    ).then
                    (
                      null,
                      function(err)
                      {
                        reject(err);
                      }
                    )
                  }
                  else
                    resolve({inventoryid: inventoryid, datecreated: global.moment(result.rows[0].datecreated).format('YYYY-MM-DD HH:mm:ss'), usercreated: result.rows[0].name});
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

function doTransferStep1(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      var avail = __.toBigNum(world.srcqty);
      var required = __.toBigNum(world.qty);

      if (avail.greaterThanOrEqualTo(required))
        resolve(null);
      else
        reject({message: 'Not enough stock to transfer'});
    }
  );
  return promise;
}

function doBuildHeader(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'insert into buildheaders (customers_id,buildtemplateheaders_id,orders_id,products_id,qty,userscreated_id) values ($1,$2,$3,$4,$5,$6) returning id',
        [
          world.cn.custid,
          __.sanitiseAsBigInt(world.buildtemplateid),
          __.sanitiseAsBigInt(world.orderid),
          __.sanitiseAsBigInt(world.productid),
          __.sanitiseAsPrice(world.qty, 4),
          world.cn.userid
        ],
        function(err, result)
        {
          if (!err)
          {
            var buildid = result.rows[0].id;

            tx.query
            (
              'select b1.datecreated,u1.name usercreated from buildheaders b1 left join users u1 on (b1.userscreated_id=u1.id) where b1.customers_id=$1 and b1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(buildid)
              ],
              function(err, result)
              {
                if (!err)
                {
                  var b = result.rows[0];

                  resolve
                  (
                    {
                      buildid: buildid,
                      datecreated: global.moment(b.datecreated).format('YYYY-MM-DD HH:mm:ss'),
                      usercreated: b.usercreated
                    }
                  );
                }
                else
                  reject({message: global.text_unablenewbuildheader});
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

function doOrderBuild(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'insert into orderbuilds (customers_id,orders_id,products_id,qty,userscreated_id) values ($1,$2,$3,$4,$5) returning id',
        [
          world.cn.custid,
          __.sanitiseAsBigInt(world.orderid),
          __.sanitiseAsBigInt(world.productid),
          __.sanitiseAsPrice(world.qty, 4),
          world.cn.userid
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

function doBuildGetTemplateHeaderDetails(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'select ' +
        'p1.qty ' +
        'from ' +
        'buildtemplateheaders p1 ' +
        'where ' +
        'p1.customers_id=$1 ' +
        'and ' +
        'p1.dateexpired is null ' +
        'and ' +
        'p1.id=$2',
        [
          world.cn.custid,
          __.sanitiseAsBigInt(world.buildtemplateid)
        ],
        function(err, result)
        {
          if (!err)
          {
            if (!__.isUndefined(result.rows) && (result.rows.length == 1))
              resolve(result.rows[0]);
            else
              reject({message: global.text_unablegetbuildtemplateheader});
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doBuildGetTemplateProductDetails(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      // Get component products for template...
      tx.query
      (
        'select ' +
        'p1.products_id id,' +
        'p1.qty,' +
        'p2.uom,' +
        'p2.uomsize,' +
        'p1.pertemplateqty ' +
        'from ' +
        'buildtemplatedetails p1 left join products p2 on (p1.products_id=p2.id) ' +
        'where ' +
        'p1.customers_id=$1 ' +
        'and ' +
        'p1.dateexpired is null ' +
        'and ' +
        'p1.buildtemplateheaders_id=$2',
        [
          world.cn.custid,
          __.sanitiseAsBigInt(world.buildtemplateid)
        ],
        function(err, result)
        {
          if (!err)
            resolve(result.rows);
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doBuildGetInventory(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      var calls = [];

      world.products.forEach
      (
        function(p)
        {
          calls.push
          (
            function(callback)
            {
              tx.query
              (
                'select sum(i1.qty) qty from inventory i1 where i1.customers_id=$1 and i1.products_id=$2 group by i1.products_id',
                [
                  world.cn.custid,
                  __.sanitiseAsBigInt(p.id)
                ],
                function(err, result)
                {
                  if (!err)
                  {
                    var qty = !__.isUndefined(result.rows) && (result.rows.length > 0) && !__.isUndefined(result.rows[0].qty) ? result.rows[0].qty : 0;

                    p.stockqty = __.toBigNum(qty);
                    callback(null, __.toBigNum(qty));
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
            // At this point, we have an array of current stock qty for each product
            // e.g. [20.0000, 14.0000, 18.0000]
            resolve(results);
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doBuildCheckInventory(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      var calls = [];

      world.products.forEach
      (
        function(p)
        {
          calls.push
          (
            function(callback)
            {
              var pqty = __.toBigNum(p.qty);
              var qty = p.stockqty;

              if (qty.lessThan(pqty))
              {
                var topupqty = pqty.minus(qty);
                //console.log('Product: ' + p.name + ' requires extra ' + topupqty + ' stock to satisfy required ' + pqty.toFixed(4));

                // TODO: Add stock to top up amount...
                p.topupqty = topupqty;
              }

              callback(null, topupqty);
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
            // At this point, we have an array of required stock qty for each product, knowing that's it's available...
            // e.g. [20.0000, 14.0000, 18.0000]
            resolve(results);
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doBuildInventoryComponents(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      var calls = [];
      // Template specifies a base qty
      // Build specifies a given qty
      // We need a ratio so (required qty / base qty)
      var ratio = __.toBigNum(world.qty).dividedBy(world.header.qty);

      world.products.forEach
      (
        function(p)
        {
          calls.push
          (
            function(callback)
            {
              var qty = __.toBigNum(p.qty).times(ratio);

              // Products marked as pertemplateqty are usually packaging, so needs to be rounded up per ratio) - no decimal qty...
              if (p.pertemplateqty == 1)
                qty = qty.ceil();

              // We're removing from inventory...
              qty = qty.neg();

              tx.query
              (
                'insert into inventory (customers_id,locations_id,products_id,costprice,costgst,qty,type,batchno,dateexpiry,dateproduction,other_id,userscreated_id) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) returning id',
                [
                  world.cn.custid,
                  __.sanitiseAsBigInt(world.custconfig.defaultinventorylocationid),
                  __.sanitiseAsBigInt(p.id),
                  0.0000,
                  0.0000,
                  __.formatnumber(qty, 4),
                  global.itype_inventory_build,
                  null,
                  null,
                  null,
                  __.sanitiseAsBigInt(world.otherid),
                  world.cn.userid
                ],
                function(err, result)
                {
                  if (!err)
                  {
                    var inventoryid = result.rows[0].id;

                    callback(null, inventoryid);
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
            resolve(undefined);
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doReverseBuild(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'insert into ' +
        'inventory ' +
        '(' +
        'customers_id,' +
        'locations_id,' +
        'products_id,' +
        'qty,' +
        'type,' +
        'other_id,' +
        'userscreated_id ' +
        ') ' +
        'select ' +
        '$1,' +
        'i1.locations_id,' +
        'i1.products_id,' +
        '-(i1.qty),' +
        'i1.type,' +
        'i1.other_id,' +
        '$2 ' +
        'from ' +
        'inventory i1 ' +
        'where ' +
        'i1.customers_id=$3 ' +
        'and ' +
        'other_id=$4 ' +
        'order by ' +
        'i1.datecreated',
        [
          world.cn.custid,
          world.cn.userid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.buildid)
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

function doExpireBuild(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'update buildheaders set dateexpired=now(),usersexpired_id=$1 where customers_id=$2 and id=$3 and dateexpired is null',
        [
          world.cn.userid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.buildid)
        ],
        function(err, result)
        {
          if (!err)
          {
            tx.query
            (
              'select b1.dateexpired,u1.name from buildheaders b1 left join users u1 on (b1.usersexpired_id=u1.id) where b1.customers_id=$1 and b1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(world.buildid)
              ],
              function(err, result)
              {
                if (!err)
                  resolve({dateexpired: global.moment(result.rows[0].dateexpired).format('YYYY-MM-DD HH:mm:ss'), userexpired: result.rows[0].name});
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
function ListStock(world)
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
          'getproductinventorytotalforlocation($1,l1.id,p1.id) qty,' +
          'l1.name locationname,' +
          'p1.id,' +
          'p1.code,' +
          'p1.name,' +
          'getproductcountinopenorders($2,p1.id) orderqty ' +
          'from ' +
          'inventory i1 left join locations l1 on (i1.locations_id=l1.id) ' +
          '             left join products p1 on (i1.products_id=p1.id) ' +
          'where ' +
          'i1.customers_id=$3 ' +
          'group by ' +
          'l1.id,' +
          'l1.name,' +
          'p1.id,' +
          'p1.code,' +
          'p1.name ' +
          'order by ' +
          'l1.name,' +
          'p1.code,' +
          'p1.name ' +
          'limit $4',
          [
            world.cn.custid,
            world.cn.custid,
            world.cn.custid,
            maxhistory
          ],
          function(err, result)
          {
            done();

            if (!err)
              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({liststock: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({liststock: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function InventoryJournal(world)
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
          'i1.id,' +
          'i1.costprice,' +
          'i1.costgst,' +
          'i1.qty,' +
          'i1.type,' +
          'i1.batchno,' +
          'i1.dateexpiry,' +
          'i1.dateproduction,' +
          'i1.locations_id locationid,' +
          'l1.name locationname,' +
          'i1.products_id productid,' +
          'i1.comments,' +
          'p1.code productcode,' +
          'p1.name productname,' +
          'i1.datecreated,' +
          'u1.name usercreated ' +
          'from ' +
          'inventory i1 left join locations l1 on (i1.locations_id=l1.id) ' +
          '             left join products p1 on (i1.products_id=p1.id) ' +
          '             left join users u1 on (i1.userscreated_id=u1.id) ' +
          'where ' +
          'i1.customers_id=$1 ' +
          'order by ' +
          'i1.datecreated ' +
          'limit $2',
          [
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
                  p.comments = __.unescapeHTML(p.comments);

                  if (!__.isUN(p.dateexpiry))
                    p.dateexpiry = global.moment(p.dateexpiry).format('YYYY-MM-DD HH:mm:ss');

                  p.datecreated = global.moment(p.datecreated).format('YYYY-MM-DD HH:mm:ss');
                }
              );

              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({inventoryjournal: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({inventoryjournal: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function AddInventory(world)
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
              doGetProductInventoryInfo(tx, world).then
              (
                function(result)
                {
                  world.costprice = result.costprice;
                  world.costgst = result.costgst;
                  world.uom = result.uom;
                  // For transfers/updates we use actual qty, not the UOM size...
                  world.uomsize = 1;

                  return doAddInventory(tx, world);
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
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, inventoryid: result.inventoryid, datecreated: result.datecreated, usercreated: result.usercreated, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'inventoryadded', {inventoryid: result.inventoryid, datecreated: result.datecreated, usercreated: result.usercreated}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({addinventory: true}, msg);
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
                      global.log.error({addinventory: true}, msg);
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
              global.log.error({addinventory: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({addinventory: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function TransferInventory(world)
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
              doProductsAtLocation(tx, world).then
              (
                function(result)
                {
                  world.srcqty = result.qty;
                  world.batchno = result.batchno;
                  world.dateexpiry = result.dateexpiry;
                  world.dateproduction = result.dateproduction;

                  return doTransferStep1(tx, world);
                }
              ).then
              (
                function(ignore)
                {
                  return doGetProductInventoryInfo(tx, world);
                }
              ).then
              (
                function(result)
                {
                  world.costprice = result.costprice;
                  world.costgst = result.costgst;
                  world.uom = result.uom;
                  // For transfers/updates we use actual qty, not the UOM size...
                  world.uomsize = 1;

                  // Remove from source...
                  world.locationid = world.srclocationid;
                  world.qty = -world.qty;
                  world.type = global.itype_inventory_xfer;
                  return doAddInventory(tx, world);
                }
              ).then
              (
                function(result)
                {
                  // Add to destination location...
                  world.locationid = world.dstlocationid;
                  world.qty = -world.qty;
                  return doAddInventory(tx, world);
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
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, inventoryid: result.inventoryid, datecreated: result.datecreated, usercreated: result.usercreated, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'inventoryadded', {inventoryid: result.inventoryid, datecreated: result.datecreated, usercreated: result.usercreated}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({transferinventory: true}, msg);
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
                      global.log.error({transferinventory: true}, msg);
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
              global.log.error({transferinventory: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({transferinventory: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function GetInventoryProductTotals(world)
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
          'getinventoryproducttotal($1,$2) qty,' +
          '$3 productid',
          [
            world.cn.custid,
            __.sanitiseAsBigInt(world.productid),
            __.sanitiseAsBigInt(world.productid)
          ],
          function(err, result)
          {
            done();

            if (!err)
              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, total: result.rows[0], pdata: world.pdata});
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({getinventoryproducttotals: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({getinventoryproducttotals: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function GetInventoryProductLocationTotals(world)
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
          'i1.locations_id locationid,' +
          'l1.name locationname ' +
          'i1.products_id productid,' +
          'getinventoryproducttotalforlocation($1,l1.id,i1.product_id) qty ' +
          'from ' +
          'inventory i1 left join locations l1 on (i1.locations_id=l1.id) ' +
          'where ' +
          'i1.customers_id=$2 ' +
          'and ' +
          'i1.products_id=$3 ' +
          'group by ' +
          'i1.locations_id,' +
          'l1.name,' +
          'i1.products_id',
          [
            world.cn.custid,
            world.cn.custid,
            __.sanitiseAsBigInt(world.productid)
          ],
          function(err, result)
          {
            done();

            if (!err)
              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({getinventoryproductlocationtotals: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({getinventoryproductlocationtotals: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function BuildInventory(world)
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
              doBuildHeader(tx, world).then
              (
                function(result)
                {
                  world.otherid = result.buildid;
                  world.datecreated = result.datecreated;
                  world.usercreated = result.usercreated;

                  return doBuildGetTemplateHeaderDetails(tx, world);
                }
              ).then
              (
                function(header)
                {
                  world.header = header;
                  return doBuildGetTemplateProductDetails(tx, world);
                }
              ).then
              (
                function(products)
                {
                  world.products = products;
                  return doBuildGetInventory(tx, world);
                }
              ).then
              (
                function(ignore)
                {
                  return doBuildCheckInventory(tx, world);
                }
              ).then
              (
                function(result)
                {
                  return doBuildInventoryComponents(tx, world);
                }
              ).then
              (
                function(ignore)
                {
                  // Fill out required fields for inventory add method...
                  world.costprice = 0.0000;
                  world.costgst = 0.0000;
                  world.type = global.itype_inventory_stock;
                  world.batchno = null;
                  world.dateexpiry = null;
                  world.dateproduction = null;

                  return doAddInventory(tx, world);
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
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, buildid: world.otherid, productid: world.productid, datecreated: world.datecreated, usercreated: world.usercreated, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'inventorybuilt', {buildid: world.otherid, datecreated: world.datecreated, usercreated: world.usercreated}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({buildinventory: true}, msg);
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
                      global.log.error({buildinventory: true}, msg);
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
              global.log.error({buildinventory: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({buildinventory: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ListBuilds(world)
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
          'b1.id,' +
          'o1.id orderid,' +
          'o1.orderno,' +
          'p1.code productcode,' +
          'p1.name productname,' +
          't1.name templatename,' +
          'b1.qty,' +
          'b1.datecreated,' +
          'u1.name usercreated ' +
          'from ' +
          'buildheaders b1 left join orders o1 on (b1.orders_id=o1.id) ' +
          '                left join products p1 on (b1.products_id=p1.id) ' +
          '                left join buildtemplateheaders t1 on (b1.buildtemplateheaders_id=t1.id) ' +
          '                left join users u1 on (b1.userscreated_id=u1.id) ' +
          'where ' +
          'b1.customers_id=$1 ' +
          'and ' +
          'b1.dateexpired is null ' +
          'order by ' +
          'b1.datecreated desc,' +
          'p1.code',
          [
            world.cn.custid
          ],
          function(err, result)
          {
            done();

            if (!err)
            {
              // JS returns date with TZ info/format, need in ISO format...
              result.rows.forEach
              (
                function(b)
                {
                  b.datecreated = global.moment(b.datecreated).format('YYYY-MM-DD HH:mm:ss');
                }
              );

              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({listbuilds: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({listbuilds: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ExpireBuild(world)
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
              doReverseBuild(tx, world).then
              (
                function(ignore)
                {
                  return doExpireBuild(tx, world);
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
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, buildid: world.buildid, dateexpired: result.dateexpired, userexpired: result.userexpired, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'buildexpired', {buildid: world.buildid, dateexpired: result.dateexpired, userexpired: result.userexpired}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({expirebuild: true}, msg);
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
                      global.log.error({expirebuild: true}, msg);
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
              global.log.error({expirebuild: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({expirebuild: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ListOrderBuilds(world)
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
          'o1.id orderid,' +
          'o1.orderno,' +
          'o1.isrepeat,' +
          'p1.id productid,' +
          'p1.code productcode,' +
          'p1.buildtemplateheaders_id buildtemplateid,' +
          'bh1.id orderbuildid,' +
          'bh1.qty qtyinbuild,' +
          'bh1.datecreated datebuilt,' +
          'od1.qty qtyordered,' +
          'getproductsqtyfromorderbuilds(2,o1.id,p1.id) qtybuilt,' +
          'o1.datecreated dateordered,' +
          'u1.name userordered,' +
          'u2.name userbuilt ' +
          'from ' +
          'orders o1 left join orderdetails od1 on (o1.id=od1.orders_id) ' +
          '          left join products p1 on (od1.products_id=p1.id) ' +
          '          left join buildheaders bh1 on (o1.id=bh1.orders_id) ' +
          '          left join users u1 on (o1.userscreated_id=u1.id) ' +
          '          left join users u2 on (bh1.userscreated_id=u2.id) ' +
          'where ' +
          'o1.customers_id=$1 ' +
          'and ' +
          'getproductsqtyfromorderbuilds($2,o1.id,p1.id) < od1.qty ' +
          'and ' +
          'o1.invoiceno is null ' +
          'and ' +
          'o1.dateexpired is null ' +
          'and ' +
          'od1.dateexpired is null ' +
          'and ' +
          'bh1.dateexpired is null ' +
          'order by ' +
          'bh1.datecreated desc',
          [
            world.cn.custid,
            world.cn.custid
          ],
          function(err, result)
          {
            done();

            if (!err)
            {
              // JS returns date with TZ info/format, need in ISO format...
              result.rows.forEach
              (
                function(b)
                {
                  if (!__.isUN(b.datebuilt))
                    b.datebuilt = global.moment(b.datebuilt).format('YYYY-MM-DD HH:mm:ss');

                  b.datecreated = global.moment(b.datecreated).format('YYYY-MM-DD HH:mm:ss');
                }
              );

              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({listorderbuilds: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({listorderbuilds: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

// *******************************************************************************************************************************************************************************************
// Internal functions
module.exports.doBuildHeader = doBuildHeader;
module.exports.doBuildGetTemplateHeaderDetails = doBuildGetTemplateHeaderDetails;
module.exports.doBuildGetTemplateProductDetails = doBuildGetTemplateProductDetails;
module.exports.doBuildGetInventory = doBuildGetInventory;
module.exports.doBuildCheckInventory = doBuildCheckInventory;
module.exports.doBuildInventoryComponents = doBuildInventoryComponents;
module.exports.doAddInventory = doAddInventory;
module.exports.doOrderBuild = doOrderBuild;

// *******************************************************************************************************************************************************************************************
// Public functions
module.exports.ListStock = ListStock;
module.exports.InventoryJournal = InventoryJournal;
module.exports.AddInventory = AddInventory;
module.exports.TransferInventory = TransferInventory;

module.exports.GetInventoryProductTotals = GetInventoryProductTotals;
module.exports.GetInventoryProductLocationTotals = GetInventoryProductLocationTotals;

module.exports.ListBuilds = ListBuilds;
module.exports.ExpireBuild = ExpireBuild;
module.exports.BuildInventory = BuildInventory;

module.exports.ListOrderBuilds = ListOrderBuilds;

