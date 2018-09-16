// *******************************************************************************************************************************************************************************************
// Internal functions
function doNewExchangeRate(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'insert into exchangerates (customers_id,name,provider,currency,rate,userscreated_id) values ($1,$2,$3,$4,$5,$6) returning id',
        [
          world.cn.custid,
          __.sanitiseAsString(world.name, 50),
          'Open Exchange Rates',
          'US',
          1.0000,
          world.cn.userid
        ],
        function(err, result)
        {
          if (!err)
          {
            var exchangerateid = result.rows[0].id;

            tx.query
            (
              'select x1.datecreated,u1.name usercreated from exchangerates x1 left join users u1 on (x1.userscreated_id=u1.id) where x1.customers_id=$1 and x1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(exchangerateid)
              ],
              function(err, result)
              {
                if (!err)
                {
                  var x = result.rows[0];

                  resolve
                  (
                    {
                      exchangerateid: exchangerateid,
                      datecreated: global.moment(x.datecreated).format('YYYY-MM-DD HH:mm:ss'),
                      usercreated: x.usercreated
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

function doSaveExchangeRate(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'update exchangerates set name=$1,provider=$2,currency=$3,rate=$4,datemodified=now(),usersmodified_id=$5 where customers_id=$6 and id=$7',
        [
          __.sanitiseAsString(world.name, 50),
          __.sanitiseAsString(world.provider, 50),
          __.sanitiseAsString(world.currency, 5),
          __.sanitiseAsPrice(world.rate),
          world.cn.userid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.exchangerateid)
        ],
        function(err, result)
        {
          if (!err)
          {
            tx.query
            (
              'select x1.datemodified,u1.name usermodified from exchangerates x1 left join users u1 on (x1.usersmodified_id=u1.id) where x1.customers_id=$1 and x1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(world.exchangerateid)
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

function doExpireExchangeRate(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'update exchangerates set dateexpired=now(),usersexpired_id=$1 where customers_id=$2 and id=$3 and dateexpired is null',
        [
          world.cn.userid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.exchangerateid)
        ],
        function(err, result)
        {
          if (!err)
          {
            tx.query
            (
              'select x1.datemodified,u1.name usermodified from exchangerates x1 left join users u1 on (x1.usersmodified_id=u1.id) where x1.customers_id=$1 and x1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(world.exchangerateid)
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
function ListExchangeRates(world)
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
          'x1.id,' +
          'x1.provider,' +
          'x1.name,' +
          'x1.rate,' +
          'x1.currency,' +
          'x1.datecreated,' +
          'x1.datemodified,' +
          'u1.name usercreated,' +
          'u2.name usermodified ' +
          'from ' +
          'exchangerates x1 left join users u1 on (x1.userscreated_id=u1.id) ' +
          '                 left join users u2 on (x1.usersmodified_id=u2.id) ' +
          'where ' +
          'x1.customers_id=$1 ' +
          'and ' +
          'x1.dateexpired is null ' +
          'order by ' +
          'x1.datecreated ' +
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
                function(x)
                {
                  if (!__.isUN(x.datemodified))
                    x.datemodified = global.moment(x.datemodified).format('YYYY-MM-DD HH:mm:ss');

                  x.datecreated = global.moment(x.datecreated).format('YYYY-MM-DD HH:mm:ss');
                }
              );

              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({listexchangerates: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({listexchangerates: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function NewExchangeRate(world)
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
              doNewExchangeRate(tx, world).then
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
                            exchangerateid: result.exchangerateid,
                            datecreated: result.datecreated,
                            usercreated: result.usercreated,
                            pdata: world.pdata
                          }
                        );
                        global.pr.sendToRoomExcept
                        (
                          global.custchannelprefix + world.cn.custid,
                          'exchangeratecreated',
                          {
                            exchangerateid: result.exchangerateid,
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
                            global.log.error({newexchangerate: true}, msg);
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
                      global.log.error({newexchangerate: true}, msg);
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
              global.log.error({newexchangerate: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({newexchangerate: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function SaveExchangeRate(world)
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
              doSaveExchangeRate(tx, world).then
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
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, exchangerateid: world.exchangerateid, datemodified: result.datemodified, usermodified: result.usermodified, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'exchangeratesaved', {exchangerateid: result.exchangerateid, datemodified: result.datemodified, usermodified: result.usermodified}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({saveexchangerate: true}, msg);
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
                      global.log.error({saveexchangerate: true}, msg);
                      world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                    }
                  );
                }
              )
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({saveexchangerate: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({saveexchangerate: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ExpireExchangeRate(world)
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
              doExpireExchangeRate(tx, world).then
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
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, exchangerateid: world.exchangerateid, dateexpired: result.dateexpired, userexpired: result.userexpired, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'exchangerateeexpired', {exchangerateid: world.exchangerateid, dateexpired: result.dateexpired, userexpired: result.userexpired}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({expireexchangerate: true}, msg);
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
                      global.log.error({expireexchangerate: true}, msg);
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
              global.log.error({expireexchangerate: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({expireexchangerate: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function LatestRates(world)
{
  global.oxr.latest
  (
    function()
    {
      // Change base rate from USD to AUD...
      var rates = [];
      var relative = oxr.rates[global.config.openexchangerates.localcurrency];

      __.each
      (
        oxr.rates,
        function(v, k)
        {
          var newrate = __.sanitiseAsPrice(v / relative, 4);
          oxr.rates[k] = newrate;

          rates.push({currency: k, rate: newrate});
        }
      );

      //global.fx.base = global.oxr.base;
      global.fx.rates = global.oxr.rates;
      global.fx.base = global.config.openexchangerates.localcurrency;

      world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: rates, pdata: world.pdata});
    }
  );
}

// *******************************************************************************************************************************************************************************************
// Public functions
module.exports.ListExchangeRates = ListExchangeRates;
module.exports.NewExchangeRate = NewExchangeRate;
module.exports.SaveExchangeRate = SaveExchangeRate;
module.exports.ExpireExchangeRate = ExpireExchangeRate;

module.exports.LatestRates = LatestRates;
