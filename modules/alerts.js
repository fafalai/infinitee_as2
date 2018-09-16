// *******************************************************************************************************************************************************************************************
// Internal functions
function doNewStatusAlert(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      // Default to create alert for "self" so we don't have null users_id...
      tx.query
      (
        'insert into orderstatusalerts (customers_id,users_id,status,email,mobile,userscreated_id) values ($1,$2,$3,$4,$5,$6) returning id',
        [
          world.cn.custid,
          __.sanitiseAsString(world.userid),
          world.statusalertid,
          __.sanitiseAsString(world.email),
            __.sanitiseAsString(world.mobile),
          world.cn.userid
        ],
        function(err, result)
        {
          if (!err)
          {
            var statusalertid = result.rows[0].id;

            tx.query
            (
              'select a1.datecreated,u1.name usercreated from orderstatusalerts a1 left join users u1 on (a1.userscreated_id=u1.id) where a1.customers_id=$1 and a1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(statusalertid)
              ],
              function(err, result)
              {
                if (!err)
                {
                  var a = result.rows[0];

                  resolve
                  (
                    {
                      statusalertid: statusalertid,
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

function doSaveStatusAlert(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'update orderstatusalerts set users_id=$1,status=$2,email=$3,mobile=$4,datemodified=now(),usersmodified_id=$5 where customers_id=$6 and id=$7 and dateexpired is null',
        [
          __.sanitiseAsBigInt(world.userid),
          __.sanitiseAsBigInt(world.statusalertid),
          __.sanitiseAsString(world.email),
          __.sanitiseAsString(world.mobile),
          world.cn.userid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.orderstatusalertid)
        ],
        function(err, result)
        {
          if (!err)
          {
            tx.query
            (
              'select a1.datemodified,u1.name from orderstatusalerts a1 left join users u1 on (a1.usersmodified_id=u1.id) where a1.customers_id=$1 and a1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(world.statusalertid)
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

function doExpireStatusAlert(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'update orderstatusalerts set dateexpired=now(),usersexpired_id=$1 where customers_id=$2 and id=$3 and dateexpired is null',
        [
          world.cn.userid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.statusalertid)
        ],
        function(err, result)
        {
          if (!err)
          {
            tx.query
            (
              'select a1.dateexpired,u1.name from orderstatusalerts a1 left join users u1 on (a1.usersexpired_id=u1.id) where a1.customers_id=$1 and a1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(world.statusalertid)
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
function ListStatusAlerts(world)
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
          'a1.status,' +
          'a1.email,' +
          'a1.mobile,' +
          'a1.datecreated,' +
          'a1.datemodified,' +
          'u1.uuid uuid,' +
          'u1.name username,' +
          'u2.name usercreated,' +
          'u3.name usermodified ' +
          'from ' +
          'orderstatusalerts a1 left join users u1 on (a1.users_id=u1.id) ' +
          '                     left join users u2 on (a1.userscreated_id=u2.id) ' +
          '                     left join users u3 on (a1.usersmodified_id=u3.id) ' +
          'where ' +
          'a1.customers_id=$1 ' +
          'and ' +
          'a1.dateexpired is null ' +
          'order by ' +
          'a1.status,' +
          'u1.name',
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
              global.log.error({liststatusalerts: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({liststatusalerts: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function LoadStatusAlert(world)
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
          'a1.status,' +
          'a1.email,' +
          'a1.mobile,' +
          'u1.uuid uuid ' +
          'from ' +
          'orderstatusalerts a1 left join users u1 on (a1.users_id=u1.id) ' +
          'where ' +
          'a1.customers_id=$1 ' +
          'and ' +
          'a1.id=$2',
          [
            world.cn.custid,
            __.sanitiseAsBigInt(world.orderstatusalertid)
          ],
          function(err, result)
          {
            done();

            if (!err)
              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, statusalert: result.rows[0], pdata: world.pdata});
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({loadstatusalert: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({loadstatusalert: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function NewStatusAlert(world)
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
              global.modauth.IDFromUUID(tx, world).then
              (
                function(result)
                {
                  world.userid = result.id;
                  return doNewStatusAlert(tx, world);
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
                            statusalertid: result.statusalertid,
                            datecreated: result.datecreated,
                            usercreated: result.usercreated,
                            pdata: world.pdata
                          }
                        );
                        global.pr.sendToRoomExcept
                        (
                          global.custchannelprefix + world.cn.custid,
                          'statusalertcreated',
                          {
                            statusalertid: result.statusalertid,
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
                            global.log.error({newclient: true}, msg);
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
                      global.log.error({newclient: true}, msg);
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
              global.log.error({newclient: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({newclient: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function SaveStatusAlert(world)
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
              // Find user in cache...
              global.users.get
              (
                global.config.redis.prefix + world.useruuid,
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
                          world.userid = uo.userid;
                          doSaveStatusAlert(tx, world).then
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
                                    world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, statusalertid: world.statusalertid, datemodified: result.datemodified, usermodified: result.usermodified, pdata: world.pdata});
                                    global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'statusalertsaved', {statusalertid: world.statusalertid, datemodified: result.datemodified, usermodified: result.usermodified}, world.spark.id);
                                  }
                                  else
                                  {
                                    tx.rollback
                                    (
                                      function(ignore)
                                      {
                                        done();
                                        msg += global.text_tx + ' ' + err.message;
                                        global.log.error({savestatusalert: true}, msg);
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
                                  global.log.error({savestatusalert: true}, msg);
                                  world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                                }
                              );
                            }
                          );
                        }
                        else
                        {
                          done();
                          msg += global.text_unableparseuser;
                          global.log.error({savestatusalert: true}, msg);
                          world.spark.emit(global.eventerror, {rc: global.errcode_unableoarseuser, msg: msg, pdata: world.pdata});
                        }
                      }
                    );
                  }
                  else
                  {
                    done();
                    msg += global.text_invaliduser;
                    global.log.error({savestatusalert: true}, msg);
                    world.spark.emit(global.eventerror, {rc: global.errcode_invaliduser, msg: msg, pdata: world.pdata});
                  }
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({savestatusalert: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({savestatusalert: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ExpireStatusAlert(world)
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
              doExpireStatusAlert(tx, world).then
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
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, statusalertid: world.statusalertid, dateexpired: result.dateexpired, userexpired: result.userexpired, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'statusalertexpired', {statusalertid: world.statusalertid, dateexpired: result.dateexpired, userexpired: result.userexpired}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({expirestatusalert: true}, msg);
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
                      global.log.error({expirestatusalert: true}, msg);
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
              global.log.error({expirestatusalert: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({expirestatusalert: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

// *******************************************************************************************************************************************************************************************
// Public functions
module.exports.ListStatusAlerts = ListStatusAlerts;
module.exports.LoadStatusAlert = LoadStatusAlert;
module.exports.NewStatusAlert = NewStatusAlert;
module.exports.SaveStatusAlert = SaveStatusAlert;
module.exports.ExpireStatusAlert = ExpireStatusAlert;
