// *******************************************************************************************************************************************************************************************
// Internal functions
function doInsertRTap(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'insert into rtap (customers_id,rfid,reader,datecreated) select $1,e1.altcode,$2,$3 from employees e1 where e1.id=$4',
        [
          world.cn.custid,
          'manual',
          __.sanitiseAsDate(world.datecreated),
          __.sanitiseAsBigInt(world.employeeid)
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
  );
  return promise;
}

// *******************************************************************************************************************************************************************************************
// Public functions
function ListPayrollEmployees(world)
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
          'e1.id,' +
          'e1.employees_id parentid,' +
          'e1.code,' +
          'e1.altcode,' +
          'e1.name,' +
          'e1.altname,' +
          'e1.employmenttype,' +
          'e1.employmentstatus,' +
          'e1.title,' +
          'e2.name manager,' +
          'e1.datecreated,' +
          'e1.datemodified,' +
          'u1.name usercreated,' +
          'u2.name usermodified ' +
          'from ' +
          'employees e1 left join employees e2 on (e1.employees_id=e2.id) ' +
          '             left join users u1 on (e1.userscreated_id=u1.id) ' +
          '             left join users u2 on (e1.usersmodified_id=u2.id) ' +
          'where ' +
          'e1.customers_id=$1 ' +
          'and ' +
          'e1.dateexpired is null ' +
          'order by ' +
          'e1.path,' +
          'e1.code',
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
                function(e)
                {
                  /*
                  if (!__.isUndefined(e.datemodified) && !__.isNull(e.datemodified))
                    e.datemodified = global.moment(e.datemodified).format('YYYY-MM-DD HH:mm:ss');

                  e.datecreated = global.moment(e.datecreated).format('YYYY-MM-DD HH:mm:ss');
                  */
                }
              );

              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({listpayrollemployees: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({listpayrollemployees: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ListRTaps(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      // Today's data only...
      var d1 = new global.moment().format('YYYY-MM-DD 00:00:00');
      var d2 = new global.moment().format('YYYY-MM-DD 23:59:59');

      if (!err)
      {
        client.query
        (
          'select ' +
          'r1.rfid tag,' +
          'r1.datecreated,' +
          'e1.lastname,' +
          'e1.firstname,' +
          'e1.code ' +
          'from ' +
          'rtap r1 left join employees e1 on (r1.rfid=e1.altcode) ' +
          'where ' +
          'r1.customers_id=$1 ' +
          'and ' +
          'r1.datecreated between $2 and $3 ' +
          'order by ' +
          'r1.datecreated desc',
          [
            world.cn.custid,
            d1,
            d2
          ],
          function(err, result)
          {
            done();

            if (!err)
            {
              // JS returns date with TZ info/format, need in ISO format...
              result.rows.forEach
              (
                function(r)
                {
                  r.name =
                  r.datecreated = global.moment(r.datecreated).format('YYYY-MM-DD HH:mm:ss');
                }
              );

              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({listrtaps: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({listrtaps: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function InsertRTap(world)
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
              doInsertRTap(tx, world).then
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

                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, pdata: world.pdat});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'rtapinserted', {rc: global.errcode_none}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({insertrtap: true}, msg);
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
                      global.log.error({insertrtap: true}, msg);
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
              global.log.error({insertrtap: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({insertrtap: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

// *******************************************************************************************************************************************************************************************
// Public functions
module.exports.ListPayrollEmployees = ListPayrollEmployees;
module.exports.ListRTaps = ListRTaps;
module.exports.InsertRTap = InsertRTap;
