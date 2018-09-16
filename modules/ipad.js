// *******************************************************************************************************************************************************************************************
// Internal functions
function doGetOrders(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'select ' +
        'o1.id,' +
        'o1.orderno,' +
        'o1.pono,' +
        'o1.name,' +
        'o1.activeversion,' +
        'o1.startdate,' +
        'o1.enddate,' +
        'c1.name clientname,' +
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
        'orders o1 left join clients c1 on (o1.clients_id=c1.id) ' +
        '          left join users u1 on (o1.userscreated_id=u1.id) ' +
        '          left join users u2 on (o1.usersmodified_id=u2.id) ' +
        '          left join getlatestorderstatus($1,o1.id) g2 on (1=1) ' +
        '          left join getordermajorstatus($2,o1.id) g3 on (1=1) ' +
        '          left join getorderattachmentthumbnail($3,o1.id) oad1 on (1=1) ' +
        'where ' +
        'o1.customers_id=$3 ' +
        'and ' +
        'o1.datecompleted is null ' +
        'and ' +
        'o1.dateexpired is null ' +
        'order by ' +
        'o1.datecreated',
        [
          world.cn.custid,
          world.cn.custid,
          world.cn.custid
        ],
        function(err, result)
        {
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

                if (!__.isUN(p.datemodified))
                  p.datemodified = global.moment(p.datemodified).format('YYYY-MM-DD HH:mm:ss');

                p.datecreated = global.moment(p.datecreated).format('YYYY-MM-DD HH:mm:ss');

                if (!__.isNull(p.attachmentid))
                {
                  if (global.isMimeTypeImage(p.attachmentmimetype))
                    p.attachmentimage = global.config.folders.orderattachments + p.attachmentid + '_' + p.id + '_' + p.attachmentname;
                }
              }
            );

            resolve(result.rows);
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doGetOrder(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'select ' +
        'o1.id,' +
        'o1.orders_id parentid,' +
        'o1.clients_id clientid,' +
        'o1.shipto_clients_id shiptoid,' +
        'o1.orderno,' +
        'o1.pono,' +
        'o1.name,' +
        'o1.shipto_name shiptoname,' +
        'o1.shipto_address1 shiptoaddress1,' +
        'o1.shipto_address2 shiptoaddress2,' +
        'o1.shipto_city shiptocity,' +
        'o1.shipto_state shiptostate,' +
        'o1.shipto_postcode shiptopostcode,' +
        'o1.shipto_country shiptocountry,' +
        'o1.shipto_notes shiptonote,' +
        'o1.numversions,' +
        'o1.activeversion,' +
        'o1.startdate,' +
        'o1.enddate,' +
        'o1.datecompleted,' +
        'o1.datecreated,' +
        'o1.datemodified,' +
        'u1.name usercreated,' +
        'u2.name usermodified ' +
        'from ' +
        'orders o1 left join users u1 on (o1.userscreated_id=u1.id) ' +
        '          left join users u2 on (o1.usersmodified_id=u2.id) ' +
        'where ' +
        'o1.customers_id=$1 ' +
        'and ' +
        'o1.id=$2',
        [
          world.cn.custid,
          __.sanitiseAsBigInt(world.orderid)
        ],
        function(err, result)
        {
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

            resolve(result.rows);
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doGetOrderNotes(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
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

            resolve(result.rows);
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doGetOrderStatuses(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'select ' +
        'os1.id,' +
        'os1.status,' +
        'os1.connote,' +
        'os1.carriername,' +
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

            resolve(result.rows);
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doGetOrderDetails(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'select ' +
        'od1.id,' +
        'od1.products_id productid,' +
        'od1.qty,' +
        'p1.name productname ' +
        'from ' +
        'orderdetails od1 left join orders o1 on (od1.orders_id=o1.id) ' +
        '                 left join products p1 on (od1.products_id=p1.id) ' +
        'where ' +
        'od1.customers_id=$1 ' +
        'and ' +
        'od1.orders_id=$2 ' +
        'and ' +
        'od1.dateexpired is null ' +
        'and ' +
        'od1.version=o1.activeversion ' +
        'order by ' +
        'od1.datecreated desc',
        [
          world.cn.custid,
          __.sanitiseAsBigInt(world.orderid)
        ],
        function(err, result)
        {
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

            resolve(result.rows);
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
function Sync(world)
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
        var orders = [];

        doGetOrders(client, world).then
        (
          function(result)
          {
            done();
            world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, orders: result, pdata: world.pdata});
          }
        ).then
        (
          null,
          function(err)
          {
            done();

            msg += global.text_generalexception + ' ' + err.message;
            global.log.error({sync: true}, msg);
            world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
          }
        )
      }
      else
      {
        global.log.error({sync: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}


function OrderDetails(world)
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
        var notes = {};
        var statuses = {};

        doGetOrder(client, world).then
        (
          function(result)
          {
            order = result[0];
            return doGetOrderNotes(client, world);
          }
        ).then
        (
          function(result)
          {
            notes = result;
            return doGetOrderStatuses(client, world);
          }
        ).then
        (
          function(result)
          {
            statuses = result;
            return doGetOrderDetails(client, world);
          }
        ).then
        (
          function(result)
          {
            world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, order: order, notes: notes, statuses: statuses, details: result, pdata: world.pdata});
          }
        ).then
        (
          null,
          function(err)
          {
            done();

            msg += global.text_generalexception + ' ' + err.message;
            global.log.error({orderdetails: true}, msg);
            world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
          }
        );
      }
      else
      {
        global.log.error({orderdetails: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

// *******************************************************************************************************************************************************************************************
// Public functions
module.exports.Sync = Sync;
module.exports.OrderDetails = OrderDetails;
