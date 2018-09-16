// *******************************************************************************************************************************************************************************************
// Internal functions
function doGetCustIdFromInvoiceNo(invoiceno)
{
  global.ConsoleLog("do get cust id from invoice no");
  global.ConsoleLog(invoiceno);
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
              'select o1.customers_id customerid from orders o1 where o1.invoiceno=$1 and o1.dateexpired is null',
              [
                invoiceno
              ],
              function(err, result)
              {
                done();

                if (!err)
                  resolve({customerid: result.rows[0].customerid});
                else
                {
                  global.log.error({doGetCustIdFromInvoiceNo: true}, err.message);
                  reject(err);
                }
              }
            );
          }
          else
          {
            global.log.error({doGetCustIdFromInvoiceNo: true}, global.text_nodbconnection);
            reject(err);
          }
        }
      );
    }
  );
  return promise;
}

function doPayment(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      var calls = [];
      var datepayment = __.isUNB(world.datepaid) ? global.moment().format('YYYY-MM-DD HH:mm:ss') : world.datepaid;

      world.invoices.forEach
      (
        function(i)
        {
          calls.push
          (
            function(callback)
            {
              tx.query
              (
                'insert into payments (customers_id,orders_id,paymenttype,reason,amount,tendered,change,datepayment,locations_id,userscreated_id) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) returning id',
                [
                  world.cn.custid,
                  __.sanitiseAsBigInt(i.orderid),
                  i.type,
                  i.reason,
                  __.sanitiseAsPrice(i.amount),
                  __.sanitiseAsPrice(i.tendered),
                  __.sanitiseAsPrice(i.change),
                  datepayment,
                  __.sanitiseAsBigInt(world.locationid),
                  world.cn.userid
                ],
                function(err, result)
                {
                  if (!err)
                  {
                    if (world.reason == global.itype_pr_deposit)
                    {
                      world.orderid = i.orderid;
                      world.status = global.itype_os_depositpaid;
                      world.connote = '';
                      world.comment = '';
                      global.modorders.doNewOrderStatus(tx, world).then
                      (
                        function(result)
                        {
                          return global.modorders.doSendStatusAlerts(tx, world);
                        }
                      ).then
                      (
                        function(result)
                        {
                          callback(null, null);
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
                      callback(null, null);
                  }
                  else
                    callback(err);
                }
              );
            }
          )
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

function doPayInvoices(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      var calls = [];
      var datepayment = __.isBlank(world.datepaid) ? global.moment().format('YYYY-MM-DD HH:mm:ss') : world.datepaid;

      world.invoices.forEach
      (
        function(i)
        {
          calls.push
          (
            function(callback)
            {
              tx.query
              (
                'insert into ' +
                'payments ' +
                '(' +
                'customers_id,' +
                'clients_id,' +
                'orders_id,' +
                'refno,' +
                'paymenttype,' +
                'reason,' +
                'amount,' +
                'datecreated,' +
                'datepayment,' +
                'userscreated_id' +
                ') ' +
                'values ' +
                '(' +
                '$1,' +
                '$2,' +
                '$3,' +
                '$4,' +
                '$5,' +
                '$6,' +
                '$7,' +
                'now(),' +
                '$8,' +
                '$9' +
                ')',
                [
                  world.cn.custid,
                  __.sanitiseAsBigInt(world.clientid),
                  __.sanitiseAsBigInt(i.orderid),
                  __.sanitiseAsTrimString(world.refno),
                  world.type,
                  world.reason,
                  __.sanitiseAsPrice(i.amount),
                  datepayment,
                  world.cn.userid
                ],
                function(err, result)
                {
                  if (!err)
                  {
                    if (world.reason == global.itype_pr_deposit)
                    {
                      world.orderid = i.orderid;
                      world.status = global.itype_os_depositpaid;
                      world.connote = '';
                      world.comment = '';
                      global.modorders.doNewOrderStatus(tx, world).then
                      (
                        function(result)
                        {
                          return global.modorders.doSendStatusAlerts(tx, world);
                        }
                      ).then
                      (
                        function(result)
                        {
                          callback(null, null);
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
                      callback(null, null);
                  }
                  else
                    callback(err);
                }
              );
            }
          )
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

function doPayPOrders(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      var calls = [];
      var datepayment = __.isBlank(world.datepaid) ? global.moment().format('YYYY-MM-DD HH:mm:ss') : world.datepaid;

      world.invoices.forEach
      (
        function(i)
        {
          calls.push
          (
            function(callback)
            {
              tx.query
              (
                'insert into ' +
                'payments ' +
                '(' +
                'customers_id,' +
                'clients_id,' +
                'porders_id,' +
                'refno,' +
                'paymenttype,' +
                'reason,' +
                'amount,' +
                'datecreated,' +
                'datepayment,' +
                'userscreated_id' +
                ') ' +
                'values ' +
                '(' +
                '$1,' +
                '$2,' +
                '$3,' +
                '$4,' +
                '$5,' +
                '$6,' +
                '$7,' +
                'now(),' +
                '$8,' +
                '$9' +
                ')',
                [
                  world.cn.custid,
                  __.sanitiseAsBigInt(world.clientid),
                  __.sanitiseAsBigInt(i.porderid),
                  __.sanitiseAsTrimString(world.refno),
                  world.type,
                  world.reason,
                  __.sanitiseAsPrice(i.amount),
                  datepayment,
                  world.cn.userid
                ],
                function(err, result)
                {
                  if (!err)
                  {
                    if (world.reason == global.itype_pr_deposit)
                    {
                      world.porderid = i.porderid;
                      world.status = global.itype_os_depositpaid;
                      world.connote = '';
                      world.comment = '';
                    }
                    callback(null, null);
                  }
                  else
                    callback(err);
                }
              );
            }
          )
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

function doGetInvoiceDetails(tx, custid, invoiceid, version)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'select ' +
        'o1.products_id productid,' +
        'o1.price,' +
        'o1.gst,' +
        'o1.qty,' +
        'p1.code productcode,' +
        'p1.name productname ' +
        'from ' +
        'orderdetails o1 left join products p1 on (o1.products_id=p1.id) ' +
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
          custid,
          __.sanitiseAsBigInt(invoiceid),
          version
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


function doGetInvoiceHeader(tx, custid, invoiceid)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'select ' +
        'o1.id orderid,' +
        'o1.orders_id parentid,' +
        'o1.clients_id clientid,' +
        'o1.shipto_clients_id shiptoid,' +
        'o1.invoiceto_clients_id invoicetoid,' +
        'o1.orderno,' +
        'o1.invoiceno,' +
        'o1.pono,' +
        'o1.name ordername,' +
        'o1.accounts_id accountid,' +
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
        'o1.shipto_notes shiptonote,' +
        'o1.numversions,' +
        'o1.activeversion,' +
        'o1.startdate,' +
        'o1.enddate,' +
        'o1.datecompleted,' +
        'o1.invoicedate,' +
        'o1.datecreated,' +
        'o1.datemodified,' +
        'c1.name clientname,' +
        'u1.name usercreated,' +
        'u2.name usermodified ' +
        'from ' +
        'orders o1 left join users u1 on (o1.userscreated_id=u1.id) ' +
        '          left join users u2 on (o1.usersmodified_id=u2.id) ' +
        '          left join clients c1 on (o1.clients_id=c1.id) ' +
        'where ' +
        'o1.customers_id=$1 ' +
        'and ' +
        'o1.id=$2',
        [
          custid,
          __.sanitiseAsBigInt(invoiceid)
        ],
        function(err, result)
        {
          if (!err && (result.rows.length == 1))
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

                if (!__.isUN(p.invoicedate))
                  p.invoicedate = global.moment(p.invoicedate).format('YYYY-MM-DD HH:mm:ss');

                if (!__.isUN(p.datemodified))
                  p.datemodified = global.moment(p.datemodified).format('YYYY-MM-DD HH:mm:ss');

                p.datecreated = global.moment(p.datecreated).format('YYYY-MM-DD HH:mm:ss');
              }
            );
            resolve(result.rows[0]);
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
function ListInvoices(world)
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
          'o1.orderno,' +
          'o1.invoiceno,' +
          'o1.pono,' +
          'o1.name,' +
          'o1.totalprice,' +
          'o1.totalgst,' +
          'c1.id clientid,' +
          'c1.name clientname,' +
          'c1.dayscredit,' +
          'c1.orderlimit,' +
          'c1.creditlimit,' +
          'o1.datecreated,' +
          'o1.datemodified,' +
          'o1.invoicedate,' +
          'p1 paid,' +
          '(o1.totalprice + o1.totalgst - p1) balance,' +
          'getnuminvoiceprintcopies($1,o1.id) copyno,' +
          'u1.name usercreated,' +
          'u2.name usermodified,' +
          'u3.name userinvoiced ' +
          'from ' +
          'orders o1 left join clients c1 on (o1.clients_id=c1.id) ' +
          '          left join users u1 on (o1.userscreated_id=u1.id) ' +
          '          left join users u2 on (o1.usersmodified_id=u2.id) ' +
          '          left join users u3 on (o1.userinvoiced_id=u3.id) ' +
          '          left join getinvoicetotalpayments($2,o1.id) p1 on (1=1) ' +
          'where ' +
          'o1.customers_id=$3 ' +
          'and ' +
          'o1.invoiceno is not null ' +
          'and ' +
          'o1.datecompleted is null ' +
          'and ' +
          'o1.dateexpired is null ' +
          'order by ' +
          'o1.datecreated ' +
          'limit $4',
          [
            world.cn.custid,
            world.cn.custid,
            world.cn.custid,
            world.maxhistory
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
                  if (!__.isUN(p.invoicedate))
                    p.invoicedate = global.moment(p.invoicedate).format('YYYY-MM-DD HH:mm:ss');

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
              global.log.error({listinvoices: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({listinvoices: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ListUnpaidOrdersByClient(world)
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
          'o1.invoiceno,' +
          'o1.pono,' +
          'o1.name,' +
          'o1.totalprice,' +
          'o1.totalgst,' +
          'p1 paid,' +
          '(o1.totalprice + o1.totalgst - p1) balance,' +
          'c1.id clientid,' +
          'c1.name clientname,' +
          'o1.datecreated,' +
          'o1.invoicedate ' +
          'from ' +
          'orders o1 left join clients c1 on (o1.clients_id=c1.id) ' +
          '          left join getinvoicetotalpayments($1,o1.id) p1 on (1=1) ' +
          'where ' +
          'o1.customers_id=$2 ' +
          'and ' +
          'o1.clients_id=$3 ' +
          'and ' +
          '(' +
          'o1.totalprice>p1 ' +
          'or ' +
          'p1=0.0 ' +
          ')' +
          'and ' +
          'o1.datecompleted is null ' +
          'and ' +
          'o1.dateexpired is null ' +
          'order by ' +
          'o1.invoiceno',
          [
            world.cn.custid,
            world.cn.custid,
            __.sanitiseAsBigInt(world.clientid)
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
                  if (!__.isUN(p.invoicedate))
                    p.invoicedate = global.moment(p.invoicedate).format('YYYY-MM-DD HH:mm:ss');

                  p.datecreated = global.moment(p.datecreated).format('YYYY-MM-DD HH:mm:ss');
                }
              );

              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({listunpaidordersbyclient: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({listunpaidordersbyclient: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ListUnpaidPOrdersByClient(world)
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
          'po1.porderno,' +
          'po1.invoiceno,' +
          'po1.name,' +
          'po1.totalprice,' +
          'po1.totalgst,' +
          'p1 paid,' +
          '(po1.totalprice + po1.totalgst - p1) balance,' +
          'c1.id clientid,' +
          'c1.name clientname,' +
          'po1.datecreated ' +
          'from ' +
          'porders po1 left join clients c1 on (po1.clients_id=c1.id) ' +
          '            left join getpototalpayments($1,po1.id) p1 on (1=1) ' +
          'where ' +
          'po1.customers_id=$2 ' +
          'and ' +
          'po1.clients_id=$3 ' +
          'and ' +
          '(' +
          'po1.totalprice>p1 ' +
          'or ' +
          'p1=0.0 ' +
          ')' +
          'and ' +
          'po1.dateexpired is null ' +
          'order by ' +
          'po1.invoiceno',
          [
            world.cn.custid,
            world.cn.custid,
            __.sanitiseAsBigInt(world.clientid)
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
                  if (!__.isUN(p.invoicedate))
                    p.invoicedate = global.moment(p.invoicedate).format('YYYY-MM-DD HH:mm:ss');

                  p.datecreated = global.moment(p.datecreated).format('YYYY-MM-DD HH:mm:ss');
                }
              );

              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({listunpaidpordersbyclient: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({listunpaidpordersbyclient: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function SearchInvoices(world)
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
        var bindno = 3;
        var clauses = '';
        var binds =
          [
            world.cn.custid,
            world.cn.custid
          ];

        if (!__.isUNB(world.invoiceno))
        {
          clauses += '(upper(o1.invoiceno) like $' + bindno++ + ') and ';
          binds.push('%' + world.invoiceno.toUpperCase() + '%');
        }

        if (!__.isUNB(world.orderno))
        {
          clauses += '(upper(o1.orderno) like $' + bindno++ + ') and ';
          binds.push('%' + world.orderno.toUpperCase() + '%');
        }

        if (!__.isUNB(world.pono))
        {
          clauses += '(o1.pono like $' + bindno++ + ') and ';
          binds.push('%' + world.pono + '%');
        }

        if (!__.isUNB(world.name))
        {
          clauses += '(o1.name like $' + bindno++ + ') and ';
          binds.push('%' + world.name + '%');
        }

        if (!__.isUNB(world.datefrom))
        {
          var df = global.moment(world.datefrom).format('YYYY-MM-DD 00:00:00');

          if (!__.isUNB(world.dateto))
          {
            var dt = global.moment(world.dateto).format('YYYY-MM-DD 23:59:59');

            // Search between datefrom and dateto
            clauses += '(o1.invoicedate between $' + bindno++ + ' and $' + bindno++ + ') and ';
            binds.push(df);
            binds.push(dt);
          }
          else
          {
            // Search between datefrom and now
            clauses += '(o1.invoicedate between $' + bindno++ + ' and now()) and ';
            binds.push(df);
          }
        }
        else
        {
          if (!__.isUNB(world.dateto))
          {
            var dt = global.moment(world.dateto).format('YYYY-MM-DD 23:59:59');

            // Search between beginning and dateto
            clauses += '(o1.invoicedate <= $' + bindno++ + ') and ';
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
            'o1.orderno,' +
            'o1.invoiceno,' +
            'o1.pono,' +
            'o1.name,' +
            'o1.totalprice,' +
            'o1.totalgst,' +
            'c1.id clientid,' +
            'c1.name clientname,' +
            'o1.datecreated,' +
            'o1.datemodified,' +
            'o1.invoicedate,' +
            'getnuminvoiceprintcopies($1,o1.id) copyno,' +
            'u1.name usercreated,' +
            'u2.name usermodified,' +
            'u3.name userinvoiced ' +
            'from ' +
            'orders o1 left join clients c1 on (o1.clients_id=c1.id) ' +
            '          left join users u1 on (o1.userscreated_id=u1.id) ' +
            '          left join users u2 on (o1.usersmodified_id=u2.id) ' +
            '          left join users u3 on (o1.userinvoiced_id=u3.id) ' +
            'where ' +
            'o1.customers_id=$2 ' +
            'and ' +
            clauses +
            'o1.dateexpired is null ' +
            'and ' +
            'o1.invoiceno is not null ' +
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
                    if (!__.isUN(p.invoicedate))
                      p.invoicedate = global.moment(p.invoicedate).format('YYYY-MM-DD HH:mm:ss');

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
                global.log.error({searchinvoices: true}, msg);
                world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
              }
            }
          );
        }
        else
        {
          msg += global.text_nodata;
          global.log.error({searchinvoices: true}, msg);
          world.spark.emit(global.eventerror, {rc: global.errcode_nodata, msg: msg, pdata: world.pdata});
        }
      }
      else
      {
        global.log.error({searchinvoices: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function PayInvoices(world)
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
              doPayInvoices(tx, world).then
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
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'invoicespaid', {datepaid: world.datepaid}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({payinvoices: true}, msg);
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
                      global.log.error({payinvoices: true}, msg);
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
              global.log.error({payinvoices: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({payinvoices: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function PayPOrders(world)
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
              doPayPOrders(tx, world).then
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
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'porderspaid', {datepaid: world.datepaid}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({payporders: true}, msg);
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
                      global.log.error({payporders: true}, msg);
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
              global.log.error({payporders: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({payporders: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

// *******************************************************************************************************************************************************************************************
// Internal functions
module.exports.doGetCustIdFromInvoiceNo = doGetCustIdFromInvoiceNo;
module.exports.doPayment = doPayment;

// *******************************************************************************************************************************************************************************************
// Public functions
module.exports.ListInvoices = ListInvoices;
module.exports.SearchInvoices = SearchInvoices;

module.exports.PayInvoices = PayInvoices;
module.exports.PayPOrders = PayPOrders;

module.exports.ListUnpaidOrdersByClient = ListUnpaidOrdersByClient;
module.exports.ListUnpaidPOrdersByClient = ListUnpaidPOrdersByClient;
