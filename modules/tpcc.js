// *******************************************************************************************************************************************************************************************
// Internal functions
function doGetJobSheetDetails(tx, custid, jobsheetid)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      // First find product category - based on client code...
      tx.query
      (
        'select ' +
        'jsd1.itype,' +
        'jsd1.num1,' +
        'jsd1.num2,' +
        'jsd1.batchno,' +
        'jsd1.machines_id machineid,' +
        'jsd1.employees_id employeeid,' +
        'e1.firstname,' +
        'e1.lastname,' +
        'm1.code machinecode ' +
        'from ' +
        'jobsheetdetails jsd1 left join employees e1 on (jsd1.employees_id=e1.id) ' +
        '                     left join machines m1 on (jsd1.machines_id=m1.id) ' +
        'where ' +
        'jsd1.customers_id=$1 ' +
        'and ' +
        'jsd1.jobsheets_id=$2',
        [
          custid,
          __.sanitiseAsBigInt(jobsheetid)
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


function doGetCustIdFromJobSheetNo(jobsheetno)
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
              'select j1.customers_id customerid from jobsheets j1 where j1.jobsheetno=$1 and j1.dateexpired is null',
              [
                jobsheetno
              ],
              function(err, result)
              {
                done();

                if (!err)
                  resolve({customerid: result.rows[0].customerid});
                else
                {
                  global.log.error({dogetcustidfromjobsheetno: true}, err.message);
                  reject(err);
                }
              }
            );
          }
          else
          {
            global.log.error({dogetcustidfromjobsheetno: true}, global.text_nodbconnection);
            reject(err);
          }
        }
      );
    }
  );
  return promise;
}

function updateJobSheetImage(args, callback)
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
                      'update jobsheets set imagename=$1,imagemimetype=$2,imagesize=$3,datemodified=now(),usersmodified_id=$4 where customers_id=$5 and id=$6',
                      [
                        args.filename,
                        args.mimetype,
                        args.size,
                        uo.userid,
                        uo.custid,
                        args.jobsheetid
                      ],
                      function(err, result)
                      {
                        done();

                        if (!err)
                        {
                          callback(null, null);
                          global.pr.sendToRoom
                          (
                            global.custchannelprefix + uo.custid,
                            'tpccjobsheetimagecreated',
                            {
                              jobsheetid: args.jobsheetid,
                              imagename: global.config.folders.jobsheetimages + args.jobsheetid + '_' + args.filename
                            }
                          );
                        }
                        else
                        {
                          global.log.error({updatejobsheetimage: true}, global.text_generalexception + ' ' + err.message);
                          callback(err);
                        }
                      }
                    );
                  }
                  else
                  {
                    global.log.error({updatejobsheetimage: true}, global.text_nodbconnection);
                    callback(err);
                  }
                }
              );
            }
            else
              callback(err);
          }
        );
      }
      else
        callback(err);
    }
  );
}

function doCreateProductFromBuildTemplate(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      // First find product category - based on client code...
      tx.query
      (
        'insert into products (customers_id,productcategories_id,clients_id,code,name,isactive,userscreated_id) values ($1,$2,$3,$4,$5,1,$6) returning id',
        [
          world.cn.custid,
          __.sanitiseAsBigInt(world.productcategoryid),
          __.sanitiseAsBigInt(world.clientid),
          __.sanitiseAsString(world.code),
          __.sanitiseAsString(world.name),
          world.cn.userid
        ],
        function(err, result)
        {
          if (!err)
          {
            var productid = result.rows[0].id;
            tx.query
            (
              'select p1.datecreated,u1.name usercreated from products p1 left join users u1 on (p1.userscreated_id=u1.id) where p1.customers_id=$1 and p1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(productid)
              ],
              function(err, result)
              {
                if (!err)
                {
                  var p = result.rows[0];

                  resolve
                  (
                    {
                      productid: productid,
                      datecreated: global.moment(p.datecreated).format('YYYY-MM-DD HH:mm:ss'),
                      usercreated: p.usercreated
                    }
                  );
                }
                else
                  reject({message: global.text_unablenewproduct});
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

function doJobSheetSort(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      var calls = [];

      if (world.jobs.length == 0)
        resolve(undefined);

      world.jobs.forEach
      (
        function(j, index)
        {
          calls.push
          (
            function(callback)
            {
              if (__.isUN(j.jobsheetid))
              {
                callback(null, null);
                return;
              }

              tx.query
              (
                'update jobsheets set sortorder=$1 where customers_id=$2 and id=$3',
                [
                  __.sanitiseAsBigInt(index),
                  world.cn.custid,
                  __.sanitiseAsBigInt(j.jobsheetid)
                ],
                function(err, result)
                {
                  if (!err)
                    callback(null, null);
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
  );
  return promise;
}

function doSaveJobSheet(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'update jobsheets set num1=$1,num2=$2,num3=$3,num4=$4,num5=$5,num6=$6,num7=$7,num8=$8,num9=$9,num10=$10,num11=$11,num12=$12,num13=$13,txt1=$14,txt2=$15,txt3=$16,txt4=$17,txt5=$18,txt6=$19,txt7=$20,txt8=$21,txt9=$22,txt10=$23,comments=$24,iswide=$25,datemodified=now(),usersmodified_id=$26 where customers_id=$27 and id=$28',
        [
          __.formatnumber(world.num1, 4, true),     // Anilox1
          __.formatnumber(world.num2, 4, true),     // Anilox2
          __.formatnumber(world.num3, 4, true),     // Anilox3
          __.formatnumber(world.num4, 4, true),     // Anilox4
          __.formatnumber(world.num5, 4, true),     // Anilox5
          __.formatnumber(world.num6, 4, true),     // Anilox6
          __.formatnumber(world.num7, 4, true),     // Reel width
          __.formatnumber(world.num8, 4, true),     // Thickness
          __.formatnumber(world.num9, 4, true),     // Gear
          __.formatnumber(world.num10, 4, true),    // Sleeve size
          __.formatnumber(world.num11, 4, true),    // #across
          __.formatnumber(world.num12, 4, true),    // #around
          __.formatnumber(world.num13, 4, true),    // print qty
          __.sanitiseAsString(world.txt1),          // Colour1
          __.sanitiseAsString(world.txt2),          // Colour2
          __.sanitiseAsString(world.txt3),          // Colour3
          __.sanitiseAsString(world.txt4),          // Colour4
          __.sanitiseAsString(world.txt5),          // Colour5
          __.sanitiseAsString(world.txt6),          // Colour6
          __.sanitiseAsString(world.txt7),
          __.sanitiseAsString(world.txt8),
          __.sanitiseAsString(world.txt9),
          __.sanitiseAsString(world.txt10),
          __.sanitiseAsComment(world.comment),
          world.iswide,
          world.cn.userid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.jobsheetid)
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

function doCheckBuildComplete(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      if (world.itype == itype_js_build_complete)
      {
        // Need to get total built, then update the order itself...
        // So for this entry, qty will be this new updated qty and qtyordered will be original qty ordered...
        tx.query
        (
          'select ' +
          'js1.orderdetails_id orderdetailid,' +
          'getproductsqtyfromorderbuilds($1,js1.orders_id,od1.products_id) qtybuilt ' +
          'from ' +
          'jobsheets js1 left join orderdetails od1 on (js1.orderdetails_id=od1.id) ' +
          'where ' +
          'js1.id=$2',
          [
            world.cn.custid,
            __.sanitiseAsBigInt(world.jobsheetid)
          ],
          function(err, result)
          {
            if (!err)
            {
              var orderdetailid = result.rows[0].orderdetailid;
              var qtybuilt = result.rows[0].qtybuilt;

              tx.query
              (
                'update orderdetails set qty=$1 where customers_id=$2 and id=$3',
                [
                  __.formatnumber(qtybuilt, 4),
                  world.cn.custid,
                  __.sanitiseAsBigInt(orderdetailid)
                ],
                function(err, result)
                {
                  if (!err)
                    resolve(null);
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
        resolve(null);
    }
  );
  return promise;
}

function doAddJobSheetDetail(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'insert into jobsheetdetails (customers_id,jobsheets_id,itype,num1,num2,txt1,txt2,batchno,machines_id,employees_id,userscreated_id) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) returning id',
        [
          world.cn.custid,
          __.sanitiseAsBigInt(world.jobsheetid),
          __.sanitiseAsBigInt(world.itype),
          __.formatnumber(world.num1, 4, true),
          __.formatnumber(world.num2, 4, true),
          __.sanitiseAsString(world.txt1),
          __.sanitiseAsString(world.txt2),
          __.sanitiseAsString(world.batchno),
          __.sanitiseAsBigInt(world.machineid),
          __.sanitiseAsBigInt(world.employeeid),
          world.cn.userid
        ],
        function(err, result)
        {
          if (!err)
          {
            var jobsheetdetailid = result.rows[0].id;

            resolve({jobsheetdetailid: jobsheetdetailid});
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
function TPCCBuildInventory(world)
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
              global.modinventory.doBuildGetTemplateHeaderDetails(tx, world).then
              (
                function(header)
                {
                  world.header = header;

                  // For TPCC, we specify qty in cartons (the template base qty...
                  var numcartons = __.toBigNum(world.numcartons);
                  var numcups = __.toBigNum(world.numcups);

                  if (numcartons.greaterThan(0))
                    numcartons = numcartons.times(world.header.qty).toFixed(0);

                  world.qty = numcups.add(numcartons).toFixed(0);

                  return global.modinventory.doBuildHeader(tx, world);
                }
              ).then
              (
                function(result)
                {
                  world.otherid = result.buildid;
                  world.datecreated = result.datecreated;
                  world.usercreated = result.usercreated;

                  return global.modinventory.doBuildGetTemplateProductDetails(tx, world);
                }
              ).then
              (
                function(products)
                {
                  world.products = products;
                  return global.modinventory.doBuildGetInventory(tx, world);
                }
              ).then
              (
                function(ignore)
                {
                  return global.modinventory.doBuildCheckInventory(tx, world);
                }
              ).then
              (
                function(result)
                {
                  return global.modinventory.doBuildInventoryComponents(tx, world);
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

                  return global.modinventory.doAddInventory(tx, world);
                }
              ).then
              (
                function(ignore)
                {
                  // TODO:
                  // We'll also send out jobsheet details status for this...
                  world.num1 = world.numcartons;
                  world.num2 = world.numcups;
                  return doAddJobSheetDetail(tx, world);
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
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'tpccjobsheetdetailadded', {jobsheetid: world.jobsheetid}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({tpccbuildinventory: true}, msg);
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
                      global.log.error({tpccbuildinventory: true}, msg);
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
              global.log.error({tpccbuildinventory: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({tpccbuildinventory: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function TPCCSaveJobSheet(world)
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
              doSaveJobSheet(tx, world).then
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
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, jobsheetid: world.jobsheetid, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'tpccjobsheetsaved', {jobsheetid: world.jobsheetid}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({tpccsavejobsheet: true}, msg);
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
                      global.log.error({tpccsavejobsheet: true}, msg);
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
              global.log.error({tpccsavejobsheet: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({tpccsavejobsheet: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function TPCCOrderBuilds(world)
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
          'od1.qty qtyordered,' +
          'getproductsqtyfromorderbuilds($1,o1.id,p1.id) qtybuilt,' +
          'o1.datecreated dateordered,' +
          'c1.name clientname,' +
          'g2.status,' +
          'g3.status majorstatus,' +
          'o1.sortorder,' +
          'js1.id jobsheetid,' +
          'js1.jobsheetno,' +
          'js1.imagename,' +
          'js1.imagemimetype,' +
          'js1.datestarted,' +
          'js1.datecompleted,' +
          'u1.name userordered ' +
          'from ' +
          'jobsheets js1 left join orderdetails od1 on (js1.orderdetails_id=od1.id) ' +
          '              left join orders o1 on (od1.orders_id=o1.id and od1.version=o1.activeversion) ' +
          '              left join products p1 on (od1.products_id=p1.id) ' +
          '              left join clients c1 on (o1.clients_id=c1.id) ' +
          '              left join users u1 on (o1.userscreated_id=u1.id) ' +
          '              left join getlatestorderstatus($2,o1.id) g2 on (1=1) ' +
          '              left join getordermajorstatus($3,o1.id) g3 on (1=1) ' +
          'where ' +
          'o1.customers_id=$4 ' +
          'and ' +
          'p1.buildtemplateheaders_id is not null ' +
          'and ' +
          'getproductsqtyfromorderbuilds($5,o1.id,p1.id) < od1.qty ' +
          'and ' +
          'o1.invoiceno is null ' +
          'and ' +
          'o1.dateexpired is null ' +
          'and ' +
          'od1.dateexpired is null ' +
          'order by ' +
          'js1.sortorder,' +
          'o1.sortorder,' +
          'o1.datecreated desc',
          [
            world.cn.custid,
            world.cn.custid,
            world.cn.custid,
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

                  if (!__.isUN(b.datestarted))
                    b.datestarted = global.moment(b.datestarted).format('YYYY-MM-DD HH:mm:ss');

                  if (!__.isUN(b.datecompleted))
                    b.datecompleted = global.moment(b.datecompleted).format('YYYY-MM-DD HH:mm:ss');

                  if (!__.isUN(b.datemachineassigned))
                    b.datemachineassigned = global.moment(b.datemachineassigned).format('YYYY-MM-DD HH:mm:ss');

                  b.datecreated = global.moment(b.datecreated).format('YYYY-MM-DD HH:mm:ss');

                  if (!__.isNull(b.imagename))
                    b.imagename = global.doJobSheetImageURL(b.jobsheetid, b.imagename, b.imagemimetype);
                }
              );

              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({tpccorderbuilds: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({tpccorderbuilds: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function TPCCJobSheetSort(world)
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
              doJobSheetSort(tx, world).then
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
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'tpccjobsheetsorted', {}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({tpccjobsheetsort: true}, msg);
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
                      global.log.error({tpccjobsheetsort: true}, msg);
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
              global.log.error({tpccjobsheetsort: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({tpccjobsheetsort: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function TPCCLoadJobSheet(world)
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
          'js1.id jobsheetid,' +
          'js1.orders_id orderid,' +
          'js1.orderdetails_id orderdetailid,' +
          'js1.num1,' +
          'js1.num2,' +
          'js1.num3,' +
          'js1.num4,' +
          'js1.num5,' +
          'js1.num6,' +
          'js1.num7,' +
          'js1.num8,' +
          'js1.num9,' +
          'js1.num10,' +
          'js1.num11,' +
          'js1.num12,' +
          'js1.num13,' +
          'js1.num14,' +
          'js1.num15,' +
          'js1.txt1,' +
          'js1.txt2,' +
          'js1.txt3,' +
          'js1.txt4,' +
          'js1.txt5,' +
          'js1.txt6,' +
          'js1.txt7,' +
          'js1.txt8,' +
          'js1.txt9,' +
          'js1.txt10,' +
          'js1.comments,' +
          'js1.datestarted,' +
          'js1.datecompleted,' +
          'js1.date1,' +
          'js1.date2,' +
          'js1.date3,' +
          'js1.date4,' +
          'js1.date5,' +
          'js1.imagename,' +
          'js1.imagemimetype,' +
          'js1.iswide,' +
          'o1.orderno,' +
          'o1.pono,' +
          'o1.isrepeat,' +
          'p1.id productid,' +
          'p1.name productname,' +
          'p1.code productcode,' +
          'p1.buildtemplateheaders_id buildtemplateid,' +
          'bh1.id orderbuildid,' +
          'bh1.datecreated datebuilt,' +
          'od1.qty qtyordered,' +
          'getproductsqtyfromorderbuilds($1,o1.id,p1.id) qtybuilt,' +
          'o1.datecreated dateordered,' +
          'c1.name clientname,' +
          'g2.status,' +
          'g3.status majorstatus,' +
          'oad1.orderdetails_id attachmentid,' +
          'oad1.name attachmentname,' +
          'oad1.mimetype attachmentmimetype,' +
          'o1.sortorder,' +
          'js1.jobsheetno,' +
          'js1.datestarted,' +
          'js1.datecompleted ' +
          'from ' +
          'orders o1 left join orderdetails od1 on (o1.id=od1.orders_id) ' +
          '          left join products p1 on (od1.products_id=p1.id) ' +
          '          left join buildheaders bh1 on (o1.id=bh1.orders_id) ' +
          '          left join clients c1 on (o1.clients_id=c1.id) ' +
          '          left join users u1 on (o1.userscreated_id=u1.id) ' +
          '          left join users u2 on (bh1.userscreated_id=u2.id) ' +
          '          left join getlatestorderstatus($2,o1.id) g2 on (1=1) ' +
          '          left join getordermajorstatus($3,o1.id) g3 on (1=1) ' +
          '          left join getorderattachmentthumbnail($4,o1.id) oad1 on (1=1) ' +
          '          left join jobsheets js1 on (od1.id=js1.orderdetails_id) ' +
          'where ' +
          'o1.customers_id=$5 ' +
          'and ' +
          'js1.id=$6',
          [
            world.cn.custid,
            world.cn.custid,
            world.cn.custid,
            world.cn.custid,
            world.cn.custid,
            __.sanitiseAsBigInt(world.jobsheetid)
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

                  if (!__.isNull(b.attachmentid))
                    b.attachmentimage = global.doAttachmentImageURL(b.orderid, b.attachmentid, b.attachmentname, b.attachmentmimetype);

                  if (!__.isUN(b.datestarted))
                    b.datestarted = global.moment(b.datestarted).format('YYYY-MM-DD HH:mm:ss');

                  if (!__.isUN(b.datecompleted))
                    b.datecompleted = global.moment(b.datecompleted).format('YYYY-MM-DD HH:mm:ss');

                  if (!__.isUN(b.date1))
                    b.date1 = global.moment(b.date1).format('YYYY-MM-DD HH:mm:ss');

                  if (!__.isUN(b.date2))
                    b.date2 = global.moment(b.date2).format('YYYY-MM-DD HH:mm:ss');

                  if (!__.isUN(b.date3))
                    b.date3 = global.moment(b.date3).format('YYYY-MM-DD HH:mm:ss');

                  if (!__.isUN(b.date4))
                    b.date4 = global.moment(b.date4).format('YYYY-MM-DD HH:mm:ss');

                  if (!__.isUN(b.date5))
                    b.date5 = global.moment(b.date5).format('YYYY-MM-DD HH:mm:ss');

                  b.datecreated = global.moment(b.datecreated).format('YYYY-MM-DD HH:mm:ss');

                  if (!__.isNull(b.imagename))
                    b.imagename = global.doJobSheetImageURL(b.jobsheetid, b.imagename, b.imagemimetype);
                }
              );

              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, jobsheet: result.rows[0], pdata: world.pdata});
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({tpccloadjobsheet: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({tpccloadjobsheet: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function TPCCListJobSheetDetails(world)
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
          'jsd1.id,' +
          'jsd1.itype,' +
          'jsd1.num1,' +
          'jsd1.num2,' +
          'jsd1.txt1,' +
          'jsd1.txt2,' +
          'jsd1.batchno,' +
          'jsd1.datecreated,' +
          'u1.name usercreated ' +
          'from ' +
          'jobsheetdetails jsd1 left join users u1 on (jsd1.userscreated_id=u1.id) ' +
          'where ' +
          'jsd1.customers_id=$1 ' +
          'and ' +
          'jsd1.jobsheets_id=$2 ' +
          'order by ' +
          'jsd1.datecreated desc',
          [
            world.cn.custid,
            __.sanitiseAsBigInt(world.jobsheetid)
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
              global.log.error({tpccloadjobsheet: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({tpccloadjobsheet: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function TPCCAddJobSheetDetail(world)
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
              doAddJobSheetDetail(tx, world).then
              (
                function(result)
                {
                  return doCheckBuildComplete(tx, world);
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
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'tpccjobsheetdetailadded', {jobsheetid: world.jobsheetid}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({tpccaddjobsheetdetail: true}, msg);
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
                      global.log.error({tpccaddjobsheetdetail: true}, msg);
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
              global.log.error({tpccaddjobsheetdetail: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({tpccaddjobsheetdetail: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function TPCCProductCategoryFromBuildTemplate(world)
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
        // Get parent template id code - which should be customer code (C031)
        // Find product category of same code...
        client.query
        (
          'select ' +
          'gb1.id,' +
          'gb1.buildtemplateheaders_id buildtemplateheaderid,' +
          'gb1.path,' +
          'gb1.name,' +
          'gb1.code ' +
          'from ' +
          'getpathtobuildtemplateheader($1,$2) gb1',
          [
            world.cn.custid,
            __.sanitiseAsBigInt(world.buildtemplateid)
          ],
          function(err, result)
          {
            if (!err)
            {
              if (result.rows.length > 0)
              {
                var clientcode = result.rows[0].code;

                client.query
                (
                  'select ' +
                  'pc1.id ' +
                  'from ' +
                  'productcategories pc1 ' +
                  'where ' +
                  'pc1.customers_id=$1 ' +
                  'and ' +
                  'pc1.code=$2',
                  [
                    world.cn.custid,
                    __.sanitiseAsString(clientcode)
                  ],
                  function(err, result)
                  {
                    if (!err)
                    {
                      done();
                      if (result.rows.length > 0)
                      {
                        var productcategoryid = result.rows[0].id;

                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, productcategoryid: productcategoryid, pdata: world.pdata});
                      }
                    }
                    else
                    {
                      done();
                      world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, productcategoryid: null, productname: '', pdata: world.pdata});
                    }
                  }
                );
              }
              else
              {
                done();
                world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, productcategoryid: null, productname: '', pdata: world.pdata});
              }
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({tpccproductcategoryfrombuildtemplate: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({tpccproductcategoryfrombuildtemplate: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function TPCCCreateProductFromBuildTemplate(world)
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
              doCreateProductFromBuildTemplate(tx, world).then
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
                            productid: result.productid,
                            productcategoryid: world.productcategoryid,
                            datecreated: result.datecreated,
                            usercreated: result.usercreated,
                            pdata: world.pdata
                          }
                        );
                        global.pr.sendToRoomExcept
                        (
                          global.custchannelprefix + world.cn.custid,
                          'productcreated',
                          {
                            productid: result.productid,
                            productcategoryid: world.productcategoryid,
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
                            global.log.error({tpcccreateproductfrombuildtemplate: true}, msg);
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
                      global.log.error({tpcccreateproductfrombuildtemplate: true}, msg);
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
              global.log.error({tpcccreateproductfrombuildtemplate: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({tpcccreateproductfrombuildtemplate: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function TPCCListMachines(world)
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
          'm1.id machineid,' +
          'm1.code ' +
          'from ' +
          'machines m1 ' +
          'where ' +
          'm1.customers_id=$1 ' +
          'and ' +
          'm1.dateexpired is null ' +
          'order by ' +
          'm1.code',
          [
            world.cn.custid,
          ],
          function(err, result)
          {
            done();

            if (!err)
              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({tpcclistmachines: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({tpcclistmachines: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function TPCCListCutters(world)
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
          'e1.id employeeid,' +
          'e1.lastname,' +
          'e1.firstname ' +
          'from ' +
          'employees e1 ' +
          'where ' +
          'e1.customers_id=$1 ' +
          'and ' +
          'e1.dateexpired is null ' +
          'and ' +
          'code in ' +
          '(' +
          '\'00100\',' +
          '\'00260\'' +
          ')' +
          'order by ' +
          'e1.firstname,' +
          'e1.lastname',
          [
            world.cn.custid
          ],
          function(err, result)
          {
            done();

            if (!err)
              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({tpcclistcutters: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({tpcclistcutters: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function TPCCSearchJobSheets(world)
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
          world.cn.custid,
          world.cn.custid,
          world.cn.custid
        ];
        var bindno = binds.length + 1;

        if (!__.isUNB(world.jobsheetno) && !__.isNull(world.jobsheetno) && !__.isBlank(world.jobsheetno))
        {
          clauses += '(upper(js1.jobsheetno) like upper($' + bindno++ + ')) and ';
          binds.push('%' + world.jobsheetno + '%');
        }

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
          clauses += '(upper(js1.jobname) like upper($' + bindno++ + ')) and ';
          binds.push('%' + world.name + '%');
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
            'o1.id orderid,' +
            'o1.orderno,' +
            'o1.isrepeat,' +
            'o1.isnewartwork,' +
            'p1.id productid,' +
            'p1.code productcode,' +
            'p1.buildtemplateheaders_id buildtemplateid,' +
            'od1.qty qtyordered,' +
            'getproductsqtyfromorderbuilds($1,o1.id,p1.id) qtybuilt,' +
            'o1.datecreated dateordered,' +
            'c1.name clientname,' +
            'g2.status,' +
            'g3.status majorstatus,' +
            'o1.sortorder,' +
            'js1.id jobsheetid,' +
            'js1.jobsheetno,' +
            'js1.imagename,' +
            'js1.imagemimetype,' +
            'js1.datestarted,' +
            'js1.datecompleted,' +
            'u1.name userordered ' +
            'from ' +
            'jobsheets js1 left join orderdetails od1 on (js1.orderdetails_id=od1.id) ' +
            '              left join orders o1 on (od1.orders_id=o1.id and od1.version=o1.activeversion) ' +
            '              left join products p1 on (od1.products_id=p1.id) ' +
            '              left join clients c1 on (o1.clients_id=c1.id) ' +
            '              left join users u1 on (o1.userscreated_id=u1.id) ' +
            '              left join getlatestorderstatus($2,o1.id) g2 on (1=1) ' +
            '              left join getordermajorstatus($3,o1.id) g3 on (1=1) ' +
            'where ' +
            'o1.customers_id=$4 ' +
            'and ' +
            'p1.buildtemplateheaders_id is not null ' +
            'and ' +
            'getproductsqtyfromorderbuilds($5,o1.id,p1.id) < od1.qty ' +
            'and ' +
            'o1.invoiceno is null ' +
            'and ' +
            'o1.dateexpired is null ' +
            'and ' +
            clauses +
            'od1.dateexpired is null ' +
            'order by ' +
            'js1.sortorder,' +
            'o1.sortorder,' +
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
                    if (!__.isUN(p.dateordered))
                      p.dateordered = global.moment(p.dateordered).format('YYYY-MM-DD HH:mm:ss');

                    if (!__.isUN(p.datestarted))
                      p.datestarted = global.moment(p.datestarted).format('YYYY-MM-DD HH:mm:ss');

                    if (!__.isUN(p.datecompleted))
                      p.datecompleted = global.moment(p.datecompleted).format('YYYY-MM-DD HH:mm:ss');

                    if (!__.isUN(p.datemachineassigned))
                      p.datemachineassigned = global.moment(p.datemachineassigned).format('YYYY-MM-DD HH:mm:ss');

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
                global.log.error({tpccsearchjobsheets: true}, msg);
                world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
              }
            }
          );
        }
        else
        {
          msg += global.text_nodata;
          global.log.error({tpccsearchjobsheets: true}, msg);
          world.spark.emit(global.eventerror, {rc: global.errcode_nodata, msg: msg, pdata: world.pdata});
        }
      }
      else
      {
        global.log.error({tpccsearchjobsheets: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function TPCCPrintJobSheet(world)
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
        // Get order/jobsheet info...
        client.query
        (
          'select ' +
          'js1.id jobsheetid,' +
          'js1.orders_id orderid,' +
          'js1.orderdetails_id orderdetailid,' +
          'js1.num1,' +
          'js1.num2,' +
          'js1.num3,' +
          'js1.num4,' +
          'js1.num5,' +
          'js1.num6,' +
          'js1.num7,' +
          'js1.num8,' +
          'js1.num9,' +
          'js1.num10,' +
          'js1.num11,' +
          'js1.num12,' +
          'js1.num13,' +
          'js1.num14,' +
          'js1.num15,' +
          'js1.txt1,' +
          'js1.txt2,' +
          'js1.txt3,' +
          'js1.txt4,' +
          'js1.txt5,' +
          'js1.txt6,' +
          'js1.txt7,' +
          'js1.txt8,' +
          'js1.txt9,' +
          'js1.txt10,' +
          'js1.comments,' +
          'js1.datestarted,' +
          'js1.datecompleted,' +
          'js1.date1,' +
          'js1.date2,' +
          'js1.date3,' +
          'js1.date4,' +
          'js1.date5,' +
          'js1.imagename,' +
          'js1.imagemimetype,' +
          'js1.iswide,' +
          'o1.orderno,' +
          'o1.pono,' +
          'o1.isrepeat,' +
          'p1.id productid,' +
          'p1.name productname,' +
          'p1.code productcode,' +
          'p1.buildtemplateheaders_id buildtemplateid,' +
          'bh1.id orderbuildid,' +
          'bh1.datecreated datebuilt,' +
          'od1.qty qtyordered,' +
          'getproductsqtyfromorderbuilds($1,o1.id,p1.id) qtybuilt,' +
          'o1.datecreated dateordered,' +
          'c1.name clientname,' +
          'g2.status,' +
          'g3.status majorstatus,' +
          'oad1.orderdetails_id attachmentid,' +
          'oad1.name attachmentname,' +
          'oad1.mimetype attachmentmimetype,' +
          'o1.sortorder,' +
          'js1.jobsheetno,' +
          'js1.datestarted,' +
          'js1.datecompleted ' +
          'from ' +
          'orders o1 left join orderdetails od1 on (o1.id=od1.orders_id) ' +
          '          left join products p1 on (od1.products_id=p1.id) ' +
          '          left join buildheaders bh1 on (o1.id=bh1.orders_id) ' +
          '          left join clients c1 on (o1.clients_id=c1.id) ' +
          '          left join users u1 on (o1.userscreated_id=u1.id) ' +
          '          left join users u2 on (bh1.userscreated_id=u2.id) ' +
          '          left join getlatestorderstatus($2,o1.id) g2 on (1=1) ' +
          '          left join getordermajorstatus($3,o1.id) g3 on (1=1) ' +
          '          left join getorderattachmentthumbnail($4,o1.id) oad1 on (1=1) ' +
          '          left join jobsheets js1 on (od1.id=js1.orderdetails_id) ' +
          'where ' +
          'o1.customers_id=$5 ' +
          'and ' +
          'js1.id=$6',
          [
            world.cn.custid,
            world.cn.custid,
            world.cn.custid,
            world.cn.custid,
            world.cn.custid,
            __.sanitiseAsBigInt(world.jobsheetid)
          ],
          function(err, result)
          {
            if (!err && (result.rows.length > 0))
            {
              var jobsheet = result.rows[0];
              var details = null;
              var order = null;

              global.modprinting.doGetOrderHeader(client, world.cn.custid, jobsheet.orderid).then
              (
                function(result)
                {
                  order = result;
                  return doGetJobSheetDetails(client, world.cn.custid, jobsheet.jobsheetid);
                }
              ).then
              (
                function(result)
                {
                  done();

                  if (!__.isNull(result))
                  {
                    var totalcut = __.toBigNum(0);

                    details = result;

                    details.forEach
                    (
                      function(d)
                      {
                        if ((d.itype == global.itype_js_cutter) || (d.itype == itype_js_cutter_complete))
                          totalcut = totalcut.plus(d.num1);
                      }
                    );

                    fs.readFile
                    (
                      global.config.folders.templates + 'jobsheet1.xlsx',
                      function(err, data)
                      {
                        if (!err)
                        {
                          var sheetno = 1;
                          var template = new global.xlwriter(data);
                          var blob = null;
                          var foldername = global.path.join(__dirname, global.config.folders.jobsheets + world.cn.custid);
                          var filename = global.config.defaults.defaultPrefixJobSheetFilename + jobsheet.jobsheetno + global.config.defaults.defaultXLExtension;
                          var values = 
                          {
                            jobno: jobsheet.jobsheetno,
                            customer: jobsheet.clientname,
                            pono: jobsheet.pono,
                            jobname: jobsheet.jobname,
                            productname: jobsheet.productname,
                            productcode: jobsheet.productcode,
                            qty: __.niceformatnumber(jobsheet.qtyordered, 0, true),
                            orderdate: __.sanitiseAsFriendlyDate(jobsheet.dateordered),
                            deliverydate: '',
                            volume: '',
                            notes: __.sanitiseAsComment(jobsheet.comment),
                            paperbatchno: '',
                            reellength: '',
                            reelwidth: __.niceformatnumber(jobsheet.num7, 0, true),
                            printqty: __.niceformatnumber(jobsheet.num13, 0, true),
                            metresprinted: '',
                            thickness: __.niceformatnumber(jobsheet.num8, 0, true),
                            gear: __.niceformatnumber(jobsheet.num9, 0, true),
                            sleeve: __.niceformatnumber(jobsheet.num10, 0, true),
                            numacross: __.niceformatnumber(jobsheet.num11, 0, true),
                            numaround: __.niceformatnumber(jobsheet.num12, 0, true),
                            materialtype: '',
                            paperbatchno: '',

                            innerbatchno: '',
                            bottombatchno: '',
                            qtycut: __.niceformatnumber(totalcut, 0, true),
                            qtyproduced: __.niceformatnumber(jobsheet.qtybuilt, 0, true),
                            maxpalletheight: '',
                            boxesperpallet: '',
                            packaging: '',
                            dateclosed: __.sanitiseAsFriendlyDate(jobsheet.datecompleted),

                            unit1colour: jobsheet.txt1, unit1anilox: __.niceformatnumber(jobsheet.num1, 0, true), unit1visco: '',
                            unit2colour: jobsheet.txt2, unit2anilox: __.niceformatnumber(jobsheet.num2, 0, true), unit2visco: '',
                            unit3colour: jobsheet.txt3, unit3anilox: __.niceformatnumber(jobsheet.num3, 0, true), unit3visco: '',
                            unit4colour: jobsheet.txt4, unit4anilox: __.niceformatnumber(jobsheet.num4, 0, true), unit4visco: '',
                            unit5colour: jobsheet.txt5, unit5anilox: __.niceformatnumber(jobsheet.num5, 0, true), unit5visco: '',
                            unit6colour: jobsheet.txt6, unit6anilox: __.niceformatnumber(jobsheet.num6, 0, true), unit6visco: '',

                            reel1qty: '',  reel1date: '',
                            reel2qty: '',  reel2date: '',
                            reel3qty: '',  reel3date: '',
                            reel4qty: '',  reel4date: '',
                            reel5qty: '',  reel5date: '',
                            reel6qty: '',  reel6date: '',
                            reel7qty: '',  reel7date: '',
                            reel8qty: '',  reel8date: '',
                            reel9qty: '',  reel9date: '',
                            reel10qty: '', reel10date: '',
                            reel11qty: '', reel11date: '',
                            reel12qty: '', reel12date: '',
                          };

                          // Generate the Excel...
                          template.substitute(sheetno, values);
                          blob = template.generate();

                          ensureFolderExists
                          (
                            foldername,
                            0775,
                            function(err)
                            {
                              if (!err)
                              {
                                fs.writeFile
                                (
                                  foldername + '/' + filename,
                                  blob,
                                  'binary',
                                  function(err)
                                  {
                                    if (!err)
                                      world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, jobsheetno: jobsheet.jobsheetno, pdata: world.pdata});
                                    else
                                    {
                                      msg += global.text_generalexception + ' ' + err.message;
                                      global.log.error({tpccprintjobsheet: true}, msg);
                                      world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
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
                }
              ).then
              (
                null,
                function(err)
                {
                  done();
                  msg += global.text_generalexception + ' ' + err.message;
                  global.log.error({tpccprintjobsheet: true}, msg);
                  world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                }
              );
            }
            else
            {
              done();
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({tpccprintjobsheet: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({tpccprintjobsheet: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

// *******************************************************************************************************************************************************************************************
// Internal functions
module.exports.updateJobSheetImage = updateJobSheetImage;
module.exports.doGetCustIdFromJobSheetNo = doGetCustIdFromJobSheetNo;

// *******************************************************************************************************************************************************************************************
// Public functions
module.exports.TPCCBuildInventory = TPCCBuildInventory;
module.exports.TPCCOrderBuilds = TPCCOrderBuilds;

module.exports.TPCCJobSheetSort = TPCCJobSheetSort;
module.exports.TPCCLoadJobSheet = TPCCLoadJobSheet;
module.exports.TPCCSaveJobSheet = TPCCSaveJobSheet;
module.exports.TPCCSearchJobSheets = TPCCSearchJobSheets;
module.exports.TPCCPrintJobSheet = TPCCPrintJobSheet;

// module.exports.TPCCStartJobSheet = TPCCStartJobSheet;
// module.exports.TPCCEndJobSheet = TPCCEndJobSheet;

module.exports.TPCCListJobSheetDetails = TPCCListJobSheetDetails;
module.exports.TPCCAddJobSheetDetail = TPCCAddJobSheetDetail;

module.exports.TPCCProductCategoryFromBuildTemplate = TPCCProductCategoryFromBuildTemplate;
module.exports.TPCCCreateProductFromBuildTemplate = TPCCCreateProductFromBuildTemplate;

module.exports.TPCCListMachines = TPCCListMachines;
module.exports.TPCCListCutters = TPCCListCutters;

