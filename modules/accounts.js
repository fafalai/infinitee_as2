// *******************************************************************************************************************************************************************************************
// Internal functions
function doFindTaxCode(tx, custid, code)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      if (__.isBlank(code) || __.isNull(code))
        resolve(null);
      else
      {
        tx.query
        (
          'select tc1.id from taxcodes tc1 where tc1.customers_id=$1 and upper(tc1.code)=upper($2) and tc1.dateexpired is null',
          [
            custid,
            __.sanitiseAsString(code)
          ],
          function(err, result)
          {
            if (!err)
            {
              if (result.rows.length == 0)
                resolve(null);
              else
              {
                var taxcodeid = result.rows[0].id;

                resolve(taxcodeid);
              }
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

function doFindAccountCode(tx, custid, code)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      if (__.isBlank(code) || __.isNull(code))
        resolve(null);
      else
      {
        tx.query
        (
          'select a1.id from accounts a1 where a1.customers_id=$1 and upper(a1.code)=upper($2) and a1.dateexpired is null',
          [
            custid,
            __.sanitiseAsString(code)
          ],
          function(err, result)
          {
            if (!err)
            {
              if (result.rows.length == 0)
                resolve(null);
              else
              {
                var accountid = result.rows[0].id;

                resolve(accountid);
              }
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

function doFindSuperfund(tx, custid, name)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      if (__.isBlank(name) || __.isNull(name))
        resolve(null);
      else
      {
        tx.query
        (
          'select s1.id from superfunds s1 where s1.customers_id=$1 and upper(s1.name)=upper($2) and s1.dateexpired is null',
          [
            custid,
            __.sanitiseAsString(name)
          ],
          function(err, result)
          {
            if (!err)
            {
              if (result.rows.length == 0)
                resolve(null);
              else
              {
                var superfundid = result.rows[0].id;

                resolve(superfundid);
              }
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

function doNewSuperfund(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'insert into superfunds (customers_id,name,userscreated_id) values ($1,$2,$3) returning id',
        [
          world.cn.custid,
          __.sanitiseAsString(world.name, 50),
          world.cn.userid
        ],
        function(err, result)
        {
          if (!err)
          {
            var superfundid = result.rows[0].id;

            tx.query
            (
              'select s1.datecreated,u1.name usercreated from superfunds s1 left join users u1 on (s1.userscreated_id=u1.id) where s1.customers_id=$1 and s1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(superfundid)
              ],
              function(err, result)
              {
                if (!err)
                {
                  var s = result.rows[0];

                  resolve
                  (
                    {
                      superfundid: superfundid,
                      datecreated: global.moment(s.datecreated).format('YYYY-MM-DD HH:mm:ss'),
                      usercreated: s.usercreated
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

function doSaveSuperfund(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'update superfunds set name=$1,datemodified=now(),usersmodified_id=$2 where customers_id=$3 and id=$4',
        [
          __.sanitiseAsString(world.name, 50),
          world.cn.userid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.superfundid)
        ],
        function(err, result)
        {
          if (!err)
          {
            tx.query
            (
              'select s1.datemodified,u1.name usermodified from superfunds s1 left join users u1 on (s1.usersmodified_id=u1.id) where s1.customers_id=$1 and s1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(world.superfundid)
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

function doExpireSuperfund(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'update superfunds set dateexpired=now(),usersexpired_id=$1 where customers_id=$2 and id=$3 and dateexpired is null',
        [
          world.cn.userid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.superfundid)
        ],
        function(err, result)
        {
          if (!err)
          {
            tx.query
            (
              'select s1.dateexpired,u1.name from superfunds s1 left join users u1 on (s1.usersexpired_id=u1.id) where s1.customers_id=$1 and s1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(world.superfundid)
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

function doNewTaxCode(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'insert into taxcodes (customers_id,code,name,percentage,userscreated_id) values ($1,$2,$3,$4,$5) returning id',
        [
          world.cn.custid,
          __.sanitiseAsString(world.code, 50),
          __.sanitiseAsString(world.name, 50),
          __.sanitiseAsPrice(world.percent, 4),
          world.cn.userid
        ],
        function(err, result)
        {
          if (!err)
          {
            var taxcodeid = result.rows[0].id;

            tx.query
            (
              'select t1.datecreated,u1.name usercreated from taxcodes t1 left join users u1 on (t1.userscreated_id=u1.id) where t1.customers_id=$1 and t1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(taxcodeid)
              ],
              function(err, result)
              {
                if (!err)
                {
                  var a = result.rows[0];

                  resolve
                  (
                    {
                      taxcodeid: taxcodeid,
                      datecreated: global.moment(a.datecreated).format('YYYY-MM-DD HH:mm:ss'),
                      usercreated: a.usercreated
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

function doSaveTaxCode(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'update taxcodes set code=$1,name=$2,percentage=$3,datemodified=now(),usersmodified_id=$4 where customers_id=$5 and id=$6',
        [
          __.sanitiseAsString(world.code, 50),
          __.sanitiseAsString(world.name, 50),
          __.notNullNumeric(world.percent, 4),
          world.cn.userid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.taxcodeid)
        ],
        function(err, result)
        {
          if (!err)
          {
            tx.query
            (
              'select t1.datemodified,u1.name usermodified from taxcodes t1 left join users u1 on (t1.usersmodified_id=u1.id) where t1.customers_id=$1 and t1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(world.taxcodeid)
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

function doExpireTaxCode(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'update taxcodes set dateexpired=now(),usersexpired_id=$1 where customers_id=$2 and id=$3 and dateexpired is null',
        [
          world.cn.userid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.taxcodeid)
        ],
        function(err, result)
        {
          if (!err)
          {
            tx.query
            (
              'select t1.dateexpired,u1.name from taxcodes t1 left join users u1 on (t1.usersexpired_id=u1.id) where t1.customers_id=$1 and t1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(world.taxcodeid)
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

function doNewAccount(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'insert into accounts (customers_id,accounts_id,code,name,itype,userscreated_id) values ($1,$2,$3,$4,$5,$6) returning id',
        [
          world.cn.custid,
          __.sanitiseAsBigInt(world.parentid),
          __.sanitiseAsString(world.code, 50),
          __.sanitiseAsString(world.name, 50),
          world.accounttype,
          world.cn.userid
        ],
        function(err, result)
        {
          if (!err)
          {
            var accountid = result.rows[0].id;

            tx.query
            (
              'select a1.datecreated,u1.name usercreated from accounts a1 left join users u1 on (a1.userscreated_id=u1.id) where a1.customers_id=$1 and a1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(accountid)
              ],
              function(err, result)
              {
                if (!err)
                {
                  var a = result.rows[0];

                  resolve
                  (
                    {
                      accountid: accountid,
                      datecreated: global.moment(a.datecreated).format('YYYY-MM-DD HH:mm:ss'),
                      usercreated: a.usercreated
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

function doSaveAccount(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'update accounts set code=$1,name=$2,altcode=$3,altname=$4,itype=$5,datemodified=now(),usersmodified_id=$6 where customers_id=$7 and id=$8',
        [
          __.sanitiseAsString(world.code, 50),
          __.sanitiseAsString(world.name, 50),
          __.sanitiseAsString(world.altcode, 50),
          __.sanitiseAsString(world.altname, 50),
          world.accounttype,
          world.cn.userid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.accountid)
        ],
        function(err, result)
        {
          if (!err)
          {
            tx.query
            (
              'select a1.datemodified,u1.name from accounts a1 left join users u1 on (a1.usersmodified_id=u1.id) where a1.customers_id=$1 and a1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(world.accountid)
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

function doChangeAccountParent(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'update accounts set accounts_id=$1,datemodified=now(),usersmodified_id=$2 where customers_id=$3 and id=$4',
        [
          __.sanitiseAsBigInt(world.parentid),
          world.cn.userid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.accountid)
        ],
        function(err, result)
        {
          if (!err)
          {
            tx.query
            (
              'select a1.datemodified,u1.name from accounts a1 left join users u1 on (a1.usersmodified_id=u1.id) where a1.customers_id=$1 and a1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(world.accountid)
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

function doExpireAccountStep1(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      if (!world.cascade)
      {
        tx.query
        (
          'select a1.accounts_id accountid from accounts a1 where a1.customers_id=$1 and a1.id=$2 and a1.dateexpired is null',
          [
            world.cn.custid,
            __.sanitiseAsBigInt(world.accountid)
          ],
          function(err, result)
          {
            if (!err)
            {
              if (result.rows.length == 1)
              {
                var parentid = result.rows[0].accountid;

                tx.query
                (
                  'update accounts set accounts_id=$1,datemodified=now(),usersmodified_id=$2 where customers_id=$3 and accounts_id=$4 and dateexpired is null',
                  [
                    parentid,
                    world.cn.userid,
                    world.cn.custid,
                    __.sanitiseAsBigInt(world.accountid)
                  ],
                  function(err, result)
                  {
                    if (!err)
                      resolve({accountid: world.accountid});
                    else
                      reject(err);
                  }
                );
              }
              else
                reject({message: global.text_unableexpireaccount});
            }
            else
              reject(err);
          }
        );
      }
      else
        resolve({accountid: world.accountid});
    }
  );
  return promise;
}

function doExpireAccountStep2(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'update accounts set dateexpired=now(),usersexpired_id=$1 where customers_id=$2 and id=$3 and dateexpired is null',
        [
          world.cn.userid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.accountid)
        ],
        function(err, result)
        {
          if (!err)
          {
            tx.query
            (
              'select a1.dateexpired,u1.name from accounts a1 left join users u1 on (a1.usersexpired_id=u1.id) where a1.customers_id=$1 and a1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(world.accountid)
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
function ListAccounts(world)
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
          'a1.id,' +
          'a1.code,' +
          'a1.name,' +
          'a1.altcode,' +
          'a1.altname,' +
          'a1.itype,' +
          'a1.notes,' +
          'a1.datecreated,' +
          'a1.datemodified,' +
          'a2.id parentid,' +
          'a2.code parentcode,' +
          'a2.name parentname,' +
          'a2.itype parentitype,' +
          'u1.name usercreated,' +
          'u2.name usermodified ' +
          'from ' +
          'accounts a1 left join accounts a2 on (a1.accounts_id=a2.id) ' +
          '            left join users u1 on (a1.userscreated_id=u1.id) ' +
          '            left join users u2 on (a1.usersmodified_id=u2.id) ' +
          'where ' +
          'a1.customers_id=$1 ' +
          'and ' +
          'a1.dateexpired is null ' +
          'order by ' +
          'a1.path,' +
          'a2.id desc,' +
          'a1.code',
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
                function(a)
                {
                  if (!__.isUN(a.notes))
                    a.notes = __.unescapeHTML(a.notes);

                  if (!__.isUN(a.datemodified))
                    a.datemodified = global.moment(a.datemodified).format('YYYY-MM-DD HH:mm:ss');

                  a.datecreated = global.moment(a.datecreated).format('YYYY-MM-DD HH:mm:ss');
                }
              );

              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({listaccounts: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({listaccounts: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function LoadAccount(world)
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
          'a1.id,' +
          'a1.code,' +
          'a1.name,' +
          'a1.altcode,' +
          'a1.altname,' +
          'a1.itype,' +
          'a1.notes,' +
          'a1.datecreated,' +
          'a1.datemodified,' +
          'a2.id parentid,' +
          'a2.code parentcode,' +
          'a2.name parentname,' +
          'a2.itype parentitype,' +
          'u1.name usercreated,' +
          'u2.name usermodified ' +
          'from ' +
          'accounts a1 left join accounts a2 on (a1.accounts_id=a2.id) ' +
          '            left join users u1 on (a1.userscreated_id=u1.id) ' +
          '            left join users u2 on (a1.usersmodified_id=u2.id) ' +
          'where ' +
          'a1.customers_id=$1 ' +
          'and ' +
          'a1.id=$2',
          [
            world.cn.custid,
            __.sanitiseAsBigInt(world.accountid)
          ],
          function(err, result)
          {
            done();

            if (!err)
            {
              // JS returns date with TZ info/format, need in ISO format...
              result.rows.forEach
              (
                function(a)
                {
                  if (!__.isUN(a.notes))
                    a.notes = __.unescapeHTML(a.notes);

                  if (!__.isUN(a.datemodified))
                    a.datemodified = global.moment(a.datemodified).format('YYYY-MM-DD HH:mm:ss');

                  a.datecreated = global.moment(a.datecreated).format('YYYY-MM-DD HH:mm:ss');
                }
              );

              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, account: result.rows[0], pdata: world.pdata});
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({loadaccount: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({loadaccount: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function NewAccount(world)
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
              doNewAccount(tx, world).then
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
                            accountid: result.accountid,
                            parentid: world.parentid,
                            datecreated: result.datecreated,
                            usercreated: result.usercreated,
                            pdata: world.pdata
                          }
                        );
                        global.pr.sendToRoomExcept
                        (
                          global.custchannelprefix + world.cn.custid,
                          'accountcreated',
                          {
                            accountid: result.accountid,
                            parentid: world.parentid,
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
                            global.log.error({newaccount: true}, msg);
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
                      global.log.error({newaccount: true}, msg);
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
              global.log.error({newaccount: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({newaccount: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function SaveAccount(world)
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
              doSaveAccount(tx, world).then
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
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, accountid: world.accountid, datemodified: result.datemodified, usermodified: result.usermodified, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'accountsaved', {accountid: result.accountid, datemodified: result.datemodified, usermodified: result.usermodified}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({saveaccount: true}, msg);
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
                      global.log.error({saveaccount: true}, msg);
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
              global.log.error({saveaccount: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({saveaccount: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ChangeAccountNotes(world)
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
              doChangeAccountNotes(tx, world).then
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
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, accountid: world.accountid, notes: world.notes, datecreated: result.datecreated, usercreated: result.usercreated, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'accountnotechanged', {accountid: world.accountid, notes: world.notes, datecreated: result.datecreated, usercreated: result.usercreated}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({changeaccountnotes: true}, msg);
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
                      global.log.error({changeaccountnotes: true}, msg);
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
              global.log.error({changeaccountnotes: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({changeaccountnotes: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ChangeAccountParent(world)
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
              doChangeAccountParent(tx, world).then
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
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, accountid: world.accountid, parentid: world.parentid, datemodified: result.datemodified, usermodified: result.usermodified, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'accountparentchanged', {accountid: world.accountid, parentid: world.parentid, datemodified: result.datemodified, usermodified: result.usermodified}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({ChangeAccountParent: true}, msg);
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
                      global.log.error({ChangeAccountParent: true}, msg);
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
              global.log.error({ChangeAccountParent: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({ChangeAccountParent: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ExpireAccount(world)
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
              // If cascade is true, we just expire this account and trigger will expire all children...
              // Otherwise...
              // First find parent of this account (which could be null if no parent)
              // Set that as new parent of immediate children - their subschildren will be updated by triggers
              // Finally expire this account
              //
              // Note if we expire this account first, children and subschildren will autoexpire by the triggers
              doExpireAccountStep1(tx, world).then
              (
                function(ignore)
                {
                  return doExpireAccountStep2(tx, world);
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
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, accountid: world.accountid, dateexpired: result.dateexpired, userexpired: result.userexpired, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'accountexpired', {accountid: world.accountid, dateexpired: result.dateexpired, userexpired: result.userexpired}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({expireaccount: true}, msg);
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
                      global.log.error({expireaccount: true}, msg);
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
              global.log.error({expireaccount: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({expireaccount: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ListTaxCodes(world)
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
          't1.id,' +
          't1.code,' +
          't1.name,' +
          't1.notes,' +
          't1.percentage percent,' +
          't1.datecreated,' +
          't1.datemodified,' +
          'u1.name usercreated,' +
          'u2.name usermodified ' +
          'from ' +
          'taxcodes t1 left join users u1 on (t1.userscreated_id=u1.id) ' +
          '            left join users u2 on (t1.usersmodified_id=u2.id) ' +
          'where ' +
          't1.customers_id=$1 ' +
          'and ' +
          't1.dateexpired is null ' +
          'order by ' +
          't1.name',
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
                function(t)
                {
                  if (!__.isUN(t.notes))
                    t.notes = __.unescapeHTML(t.notes);

                  if (!__.isUN(t.datemodified))
                    t.datemodified = global.moment(t.datemodified).format('YYYY-MM-DD HH:mm:ss');

                  t.datecreated = global.moment(t.datecreated).format('YYYY-MM-DD HH:mm:ss');
                }
              );

              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({listtaxcodes: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({listtaxcodes: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function LoadTaxCode(world)
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
          't1.id,' +
          't1.code,' +
          't1.name,' +
          't1.notes,' +
          't1.percentage percent,' +
          't1.datecreated,' +
          't1.datemodified,' +
          'u1.name usercreated,' +
          'u2.name usermodified ' +
          'from ' +
          'taxcodes t1 left join users u1 on (t1.userscreated_id=u1.id) ' +
          '            left join users u2 on (t1.usersmodified_id=u2.id) ' +
          'where ' +
          't1.customers_id=$1 ' +
          'and ' +
          't1.id=$2',
          [
            world.cn.custid,
            __.sanitiseAsBigInt(world.taxcodeid)
          ],
          function(err, result)
          {
            done();

            if (!err)
            {
              // JS returns date with TZ info/format, need in ISO format...
              result.rows.forEach
              (
                function(t)
                {
                  if (!__.isUN(t.notes))
                    t.notes = __.unescapeHTML(t.notes);

                  if (!__.isUN(t.datemodified))
                    t.datemodified = global.moment(t.datemodified).format('YYYY-MM-DD HH:mm:ss');

                  t.datecreated = global.moment(t.datecreated).format('YYYY-MM-DD HH:mm:ss');
                }
              );

              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, taxcode: result.rows[0], pdata: world.pdata});
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({loadtaxcode: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({loadtaxcode: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function NewTaxCode(world)
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
              doNewTaxCode(tx, world).then
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
                            taxcodeid: result.taxcodeid,
                            datecreated: result.datecreated,
                            usercreated: result.usercreated,
                            pdata: world.pdata
                          }
                        );
                        global.pr.sendToRoomExcept
                        (
                          global.custchannelprefix + world.cn.custid,
                          'taxcodecreated',
                          {
                            taxcodeid: result.taxcodeid,
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
                            global.log.error({newtaxcode: true}, msg);
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
                      global.log.error({newtaxcode: true}, msg);
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
              global.log.error({newtaxcode: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({newtaxcode: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function SaveTaxCode(world)
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
              doSaveTaxCode(tx, world).then
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
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, taxcodeid: world.taxcodeid, datemodified: result.datemodified, usermodified: result.usermodified, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'taxcodesaved', {taxcodeid: result.taxcodeid, datemodified: result.datemodified, usermodified: result.usermodified}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({savetaxcode: true}, msg);
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
                      global.log.error({savetaxcode: true}, msg);
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
              global.log.error({savetaxcode: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({savetaxcode: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ExpireTaxCode(world)
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
              doExpireTaxCode(tx, world).then
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
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, taxcodeid: world.taxcodeid, dateexpired: result.dateexpired, userexpired: result.userexpired, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'taxcodeexpired', {taxcodeid: world.taxcodeid, dateexpired: result.dateexpired, userexpired: result.userexpired}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({expiretaxcode: true}, msg);
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
                      global.log.error({expiretaxcode: true}, msg);
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
              global.log.error({expiretaxcode: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({expiretaxcode: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ListSuperfunds(world)
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
          's1.id,' +
          's1.name,' +
          's1.datecreated,' +
          's1.datemodified,' +
          'u1.name usercreated,' +
          'u2.name usermodified ' +
          'from ' +
          'superfunds s1 left join users u1 on (s1.userscreated_id=u1.id) ' +
          '              left join users u2 on (s1.usersmodified_id=u2.id) ' +
          'where ' +
          's1.customers_id=$1 ' +
          'and ' +
          's1.dateexpired is null ' +
          'order by ' +
          's1.name',
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
                function(s)
                {
                  if (!__.isUN(s.datemodified))
                    s.datemodified = global.moment(s.datemodified).format('YYYY-MM-DD HH:mm:ss');

                  s.datecreated = global.moment(s.datecreated).format('YYYY-MM-DD HH:mm:ss');
                }
              );

              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({listsuperfunds: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({listsuperfunds: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function NewSuperfund(world)
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
              doNewSuperfund(tx, world).then
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
                            superfundid: result.superfundid,
                            datecreated: result.datecreated,
                            usercreated: result.usercreated,
                            pdata: world.pdata
                          }
                        );
                        global.pr.sendToRoomExcept
                        (
                          global.custchannelprefix + world.cn.custid,
                          'superfundcreated',
                          {
                            superfundid: result.superfundid,
                            datecreated: result.datecreated,
                            usercreated: result.usercreated,
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
                            global.log.error({newsuperfund: true}, msg);
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
                      global.log.error({newsuperfund: true}, msg);
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
              global.log.error({newsuperfund: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({newsuperfund: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function SaveSuperfund(world)
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
              doSaveSuperfund(tx, world).then
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
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, superfundid: world.superfundid, datemodified: result.datemodified, usermodified: result.usermodified, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'superfundsaved', {superfundid: result.superfundid, datemodified: result.datemodified, usermodified: result.usermodified}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({savesuperfund: true}, msg);
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
                      global.log.error({savesuperfund: true}, msg);
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
              global.log.error({savesuperfund: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({savesuperfund: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ExpireSuperfund(world)
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
              doExpireSuperfund(tx, world).then
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
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, superfundid: world.superfundid, dateexpired: result.dateexpired, userexpired: result.userexpired, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'superfundexpired', {superfundid: world.superfundid, dateexpired: result.dateexpired, userexpired: result.userexpired}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({expiresuperfund: true}, msg);
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
                      global.log.error({expiresuperfund: true}, msg);
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
              global.log.error({expiresuperfund: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({expiresuperfund: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function CheckAccountCode(world)
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
        var binds = [world.cn.custid, world.code, world.code];
        var clause = '';

        if (!__.isNull(world.accountid))
        {
          clause = ' and a1.id!=$4';
          binds.push(world.accountid);
        }

        client.query
        (
          'select ' +
          'a1.id,' +
          'a1.code,' +
          'a1.name,' +
          'a1.altcode,' +
          'a1.altname ' +
          'from ' +
          'accounts a1 ' +
          'where ' +
          'a1.customers_id=$1 ' +
          'and ' +
          'a1.dateexpired is null ' +
          'and ' +
          '(' +
          'upper(a1.code)=upper($2) ' +
          'or ' +
          'upper(a1.altcode)=upper($3)' +
          ')' +
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
              global.log.error({checkaccountcode: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({checkaccountcode: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function CheckTaxCode(world)
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
        var binds = [world.cn.custid, world.code];
        var clause = '';

        if (!__.isNull(world.taxcodeid))
        {
          clause = ' and tc1.id!=$3';
          binds.push(world.taxcodeid);
        }

        client.query
        (
          'select ' +
          'tc1.id,' +
          'tc1.code,' +
          'tc1.name ' +
          'from ' +
          'taxcodes tc1 ' +
          'where ' +
          'tc1.customers_id=$1 ' +
          'and ' +
          'tc1.dateexpired is null ' +
          'and ' +
          'upper(tc1.code)=upper($2)' +
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
              global.log.error({checktaxcode: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({checktaxcode: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function CheckSuperfundName(world)
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
          's1.id,' +
          's1.name ' +
          'from ' +
          'superfunds s1 ' +
          'where ' +
          's1.customers_id=$1 ' +
          'and ' +
          's1.dateexpired is null ' +
          'and ' +
          'upper(s1.name)=upper($2)',
          [
            world.cn.custid,
            world.name
          ],
          function(err, result)
          {
            done();

            if (!err)
              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({checksuperfundname: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({checksuperfundname: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

// *******************************************************************************************************************************************************************************************
// Internal functions
module.exports.doFindTaxCode = doFindTaxCode;
module.exports.doFindAccountCode = doFindAccountCode;
module.exports.doFindSuperfund = doFindSuperfund;

// *******************************************************************************************************************************************************************************************
// Public functions
module.exports.ListAccounts = ListAccounts;
module.exports.LoadAccount = LoadAccount;
module.exports.NewAccount = NewAccount;
module.exports.SaveAccount = SaveAccount;
module.exports.ChangeAccountNotes = ChangeAccountNotes;
module.exports.ChangeAccountParent = ChangeAccountParent;
module.exports.ExpireAccount = ExpireAccount;
module.exports.CheckAccountCode = CheckAccountCode;

module.exports.ListTaxCodes = ListTaxCodes;
module.exports.LoadTaxCode = LoadTaxCode;
module.exports.NewTaxCode = NewTaxCode;
module.exports.SaveTaxCode = SaveTaxCode;
module.exports.ExpireTaxCode = ExpireTaxCode;
module.exports.CheckTaxCode = CheckTaxCode;

module.exports.ListSuperfunds = ListSuperfunds;
module.exports.NewSuperfund = NewSuperfund;
module.exports.SaveSuperfund = SaveSuperfund;
module.exports.ExpireSuperfund = ExpireSuperfund;
module.exports.CheckSuperfundName = CheckSuperfundName;
