// *******************************************************************************************************************************************************************************************
// Internal functions
function doNewEmployee(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'insert into employees (customers_id,employees_id,code,lastname,firstname,title,email1,phone1,address1,address2,city,state,postcode,country,bankname,bankbsb,bankaccountno,bankaccountname,startdate,enddate,payamount,payrate,payfrequency,paystdperiod,wageaccounts_id,superfunds_id,taxfileno,employmenttype,employmentstatus,altcode,overtimeallowed,workhours,taxtable,dob,gender,userscreated_id) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36) returning id',
        [
          world.cn.custid,
          __.sanitiseAsBigInt(world.parentid),
          __.sanitiseAsString(world.code),
          __.sanitiseAsString(world.lastname),
          __.sanitiseAsString(world.firstname),
          __.sanitiseAsString(world.title),
          __.sanitiseAsString(world.email1),
          __.sanitiseAsString(world.phone1),
          __.sanitiseAsString(world.address1),
          __.sanitiseAsString(world.address2),
          __.sanitiseAsString(world.city),
          __.sanitiseAsString(world.state),
          __.sanitiseAsString(world.postcode),
          __.sanitiseAsString(world.country),
          __.sanitiseAsString(world.bankname),
          __.sanitiseAsString(world.bankbsb),
          __.sanitiseAsString(world.bankaccountno),
          __.sanitiseAsString(world.bankaccountname),
          __.sanitiseAsString(world.startdate),
          __.sanitiseAsString(world.enddate),
          __.formatnumber(world.payamount),
          __.sanitiseAsBigInt(world.payrate),
          __.sanitiseAsBigInt(world.payfrequency),
          __.formatnumber(world.paystdperiod),
          __.sanitiseAsBigInt(world.wageaccountid),
          __.sanitiseAsBigInt(world.superfundid),
          __.sanitiseAsString(world.taxfileno),
          __.sanitiseAsBigInt(world.employmenttype),
          __.sanitiseAsBigInt(world.employmentstatus),
          __.sanitiseAsString(world.altcode),
          __.sanitiseAsBigInt(world.overtimeallowed),
          __.sanitiseAsString(world.workhours),
          world.taxtable,
          __.sanitiseAsString(world.dob),
          (world.gender == 1) ? 'F' : 'M',
          world.cn.userid
        ],
        function(err, result)
        {
          if (!err)
          {
            var employeeid = result.rows[0].id;

            tx.query
            (
              'select e1.datecreated,u1.name usercreated from employees e1 left join users u1 on (e1.userscreated_id=u1.id) where e1.customers_id=$1 and e1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(employeeid)
              ],
              function(err, result)
              {
                if (!err)
                {
                  var e = result.rows[0];

                  resolve
                  (
                    {
                      employeeid: employeeid,
                      datecreated: global.moment(e.datecreated).format('YYYY-MM-DD HH:mm:ss'),
                      usercreated: e.usercreated
                    }
                  );
                }
                else
                  reject({message: global.text_unablenewclient});
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

function doSaveEmployee(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'update ' +
        'employees ' +
        'set ' +
        'code=$1,' +
        'lastname=$2,' +
        'firstname=$3,' +
        'title=$4,' +
        'email1=$5,' +
        'phone1=$6,' +
        'address1=$7,' +
        'address2=$8,' +
        'city=$9,' +
        'state=$10,' +
        'postcode=$11,' +
        'country=$12,' +
        'bankname=$13,' +
        'bankbsb=$14,' +
        'bankaccountno=$15,' +
        'bankaccountname=$16,' +
        'startdate=$17,' +
        'enddate=$18,' +
        'payamount=$19,' +
        'payrate=$20,' +
        'payfrequency=$21,' +
        'paystdperiod=$22,' +
        'wageaccounts_id=$23,' +
        'superfunds_id=$24,' +
        'taxfileno=$25,' +
        'employmenttype=$26,' +
        'employmentstatus=$27,' +
        'altcode=$28,' +
        'overtimeallowed=$29,' +
        'workhours=$30,' +
        'taxtable=$31,' +
        'dob=$32,' +
        'gender=$33,' +
        'datemodified=now(),' +
        'usersmodified_id=$34 ' +
        'where ' +
        'customers_id=$35 ' +
        'and ' +
        'id=$36 ' +
        'and ' +
        'dateexpired is null',
        [
          __.sanitiseAsString(world.code),
          __.sanitiseAsString(world.lastname),
          __.sanitiseAsString(world.firstname),
          __.sanitiseAsString(world.title),
          __.sanitiseAsString(world.email1),
          __.sanitiseAsString(world.phone1),
          __.sanitiseAsString(world.address1),
          __.sanitiseAsString(world.address2),
          __.sanitiseAsString(world.city),
          __.sanitiseAsString(world.state),
          __.sanitiseAsString(world.postcode),
          __.sanitiseAsString(world.country),
          __.sanitiseAsString(world.bankname),
          __.sanitiseAsString(world.bankbsb),
          __.sanitiseAsString(world.bankaccountno),
          __.sanitiseAsString(world.bankaccountname),
          __.sanitiseAsString(world.startdate),
          __.sanitiseAsString(world.enddate),
          __.formatnumber(world.payamount),
          __.sanitiseAsBigInt(world.payrate),
          __.sanitiseAsBigInt(world.payfrequency),
          __.formatnumber(world.paystdperiod),
          __.sanitiseAsBigInt(world.wageaccountid),
          __.sanitiseAsBigInt(world.superfundid),
          __.sanitiseAsString(world.taxfileno),
          __.sanitiseAsBigInt(world.employmenttype),
          __.sanitiseAsBigInt(world.employmentstatus),
          __.sanitiseAsString(world.altcode),
          __.sanitiseAsBigInt(world.overtimeallowed),
          __.sanitiseAsString(world.workhours),
          world.taxtable,
          __.sanitiseAsString(world.dob),
          (world.gender == 1) ? 'F' : 'M',
          world.cn.userid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.employeeid)
        ],
        function(err, result)
        {
          if (!err)
          {
            tx.query
            (
              'select e1.datemodified,u1.name from employees e1 left join users u1 on (e1.usersmodified_id=u1.id) where e1.customers_id=$1 and e1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(world.employeeid)
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

function doChangeEmployeeParent(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'update employees set employees_id=$1,datemodified=now(),usersmodified_id=$2 where customers_id=$3 and id=$4',
        [
          __.sanitiseAsBigInt(world.parentid),
          world.cn.userid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.employeeid)
        ],
        function(err, result)
        {
          if (!err)
          {
            tx.query
            (
              'select e1.datemodified,u1.name from employees e1 left join users u1 on (e1.usersmodified_id=u1.id) where e1.customers_id=$1 and e1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(world.employeeid)
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

function doExpireEmployeeStep1(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      if (!world.cascade)
      {
        tx.query
        (
          'select e1.employees_id employeeid from employees e1 where e1.customers_id=$1 and e1.id=$2 and e1.dateexpired is null',
          [
            world.cn.custid,
            __.sanitiseAsBigInt(world.employeeid)
          ],
          function(err, result)
          {
            if (!err)
            {
              if (result.rows.length == 1)
              {
                var parentid = result.rows[0].employeeid;

                tx.query
                (
                  'update employees set employees_id=$1,datemodified=now(),usersmodified_id=$2 where customers_id=$3 and employees_id=$4 and dateexpired is null',
                  [
                    parentid,
                    world.cn.userid,
                    world.cn.custid,
                    __.sanitiseAsBigInt(world.employeeid)
                  ],
                  function(err, result)
                  {
                    if (!err)
                      resolve({employeeid: world.employeeid});
                    else
                      reject(err);
                  }
                );
              }
              else
                reject({message: global.text_unableexpireemployee});
            }
            else
              reject(err);
          }
        );
      }
      else
        resolve({employeeid: world.employeeid});
    }
  );
  return promise;
}

function doExpireEmployeeStep2(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'update employees set dateexpired=now(),usersexpired_id=$1 where customers_id=$2 and id=$3 and dateexpired is null',
        [
          world.cn.userid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.employeeid)
        ],
        function(err, result)
        {
          if (!err)
          {
            tx.query
            (
              'select e1.dateexpired,u1.name from employees e1 left join users u1 on (e1.usersexpired_id=u1.id) where e1.customers_id=$1 and e1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(world.employeeid)
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
function ListEmployees(world)
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
          'e1.lastname,' +
          'e1.firstname,' +
          'e1.altname,' +
          'e1.email1,' +
          'e1.phone1,' +
          'e1.address1,' +
          'e1.address2,' +
          'e1.city,' +
          'e1.state,' +
          'e1.postcode,' +
          'e1.country,' +
          'e1.dob,' +
          'e1.bankname,' +
          'e1.bankbsb,' +
          'e1.bankaccountno,' +
          'e1.bankaccountname,' +
          'e1.startdate,' +
          'e1.enddate,' +
          'e1.payamount,' +
          'e1.payrate,' +
          'e1.payfrequency,' +
          'e1.paystdperiod,' +
          'e1.wageaccounts_id wageaccountid,' +
          'e1.superfunds_id superfundid,' +
          'e1.taxfileno,' +
          'e1.taxtable,' +
          'e1.employmenttype,' +
          'e1.employmentstatus,' +
          'e1.title,' +
          'e1.overtimeallowed,' +
          'e1.workhours,' +
          'e1.gender,' +
          'e1.datecreated,' +
          'e1.datemodified,' +
          'e2.id parentid,' +
          'e2.code parentcode,' +
          'e2.lastname parentlastname,' +
          'e2.firstname parentfirstname,' +
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
                  if (!__.isUN(e.datemodified))
                    e.datemodified = global.moment(e.datemodified).format('YYYY-MM-DD HH:mm:ss');

                  e.datecreated = global.moment(e.datecreated).format('YYYY-MM-DD HH:mm:ss');
                }
              );

              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({listemployees: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({listemployees: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function LoadEmployee(world)
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
          'e1.lastname,' +
          'e1.firstname,' +
          'e1.altname,' +
          'e1.email1,' +
          'e1.phone1,' +
          'e1.address1,' +
          'e1.address2,' +
          'e1.city,' +
          'e1.state,' +
          'e1.postcode,' +
          'e1.country,' +
          'e1.dob,' +
          'e1.bankname,' +
          'e1.bankbsb,' +
          'e1.bankaccountno,' +
          'e1.bankaccountname,' +
          'e1.startdate,' +
          'e1.enddate,' +
          'e1.payamount,' +
          'e1.payrate,' +
          'e1.payfrequency,' +
          'e1.paystdperiod,' +
          'e1.wageaccounts_id wageaccountid,' +
          'e1.superfunds_id superfundid,' +
          'e1.taxfileno,' +
          'e1.taxtable,' +
          'e1.employmenttype,' +
          'e1.employmentstatus,' +
          'e1.title,' +
          'e1.overtimeallowed,' +
          'e1.workhours,' +
          'e1.gender,' +
          'e1.datecreated,' +
          'e1.datemodified,' +
          'e2.id parentid,' +
          'e2.code parentcode,' +
          'e2.lastname parentlastname,' +
          'e2.firstname parentfirstname,' +
          'u1.name usercreated,' +
          'u2.name usermodified ' +
          'from ' +
          'employees e1 left join employees e2 on (e1.employees_id=e2.id) ' +
          '             left join users u1 on (e1.userscreated_id=u1.id) ' +
          '             left join users u2 on (e1.usersmodified_id=u2.id) ' +
          'where ' +
          'e1.customers_id=$1 ' +
          'and ' +
          'e1.id=$2',
          [
            world.cn.custid,
            __.sanitiseAsBigInt(world.employeeid)
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
                  if (!__.isUN(e.datemodified))
                    e.datemodified = global.moment(e.datemodified).format('YYYY-MM-DD HH:mm:ss');

                  e.datecreated = global.moment(e.datecreated).format('YYYY-MM-DD HH:mm:ss');
                }
              );

              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, employee: result.rows[0], pdata: world.pdata});
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({loademployee: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({loademployee: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function NewEmployee(world)
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
              doNewEmployee(tx, world).then
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
                            employeeid: result.employeeid,
                            datecreated: result.datecreated,
                            usercreated: result.usercreated,
                            pdata: world.pdata
                          }
                        );
                        global.pr.sendToRoomExcept
                        (
                          global.custchannelprefix + world.cn.custid,
                          'employeecreated',
                          {
                            employeeid: world.employeeid,
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
                            global.log.error({newemployee: true}, msg);
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
                      global.log.error({newemployee: true}, msg);
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
        global.log.error({newemployee: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function SaveEmployee(world)
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
              doSaveEmployee(tx, world).then
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
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, employeeid: world.employeeid, datemodified: result.datemodified, usermodified: result.usermodified, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'employeesaved', {employeeid: world.employeeid, datemodified: result.datemodified, usermodified: result.usermodified}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({saveemployee: true}, msg);
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
                      global.log.error({saveemployee: true}, msg);
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
              global.log.error({saveemployee: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({saveemployee: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ChangeEmployeeParent(world)
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
              doChangeEmployeeParent(tx, world).then
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
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, employeeid: world.employeeid, parentid: world.parentid, datemodified: result.datemodified, usermodified: result.usermodified, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'employeeparentchanged', {employeeid: world.employeeid, parentid: world.parentid, datemodified: result.datemodified, usermodified: result.usermodified}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({changeemployeeparent: true}, msg);
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
                      global.log.error({changeemployeeparent: true}, msg);
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
              global.log.error({changeemployeeparent: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({changeemployeeparent: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ExpireEmployee(world)
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
              // If cascade is true, we just expire this employee and trigger will expire all children...
              // Otherwise...
              // First find parent of this employee (which could be null if no parent)
              // Set that as new parent of immediate children - their subschildren will be updated by triggers
              // Finally expire this employee
              //
              // Note if we expire this employee first, children and subschildren will autoexpire by the triggers
              doExpireEmployeeStep1(tx, world).then
              (
                function(ignore)
                {
                  return doExpireEmployeeStep2(tx, world);
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
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, employeeid: world.employeeid, dateexpired: result.dateexpired, userexpired: result.userexpired, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'employeeexpired', {employeeid: world.employeeid, dateexpired: result.dateexpired, userexpired: result.userexpired}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({expireemployee: true}, msg);
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
                      global.log.error({expireemployee: true}, msg);
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
              global.log.error({expireemployee: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({expireemployee: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function CheckEmployeeCode(world)
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

        if (!__.isNull(world.employeeid))
        {
          clause = ' and e1.id!=$4';
          binds.push(world.employeeid);
        }

        client.query
        (
          'select ' +
          'e1.id,' +
          'e1.code,' +
          'e1.firstname || \' \' || e1.lastname as name ' +
          'from ' +
          'employees e1 ' +
          'where ' +
          'e1.customers_id=$1 ' +
          'and ' +
          'e1.dateexpired is null ' +
          'and ' +
          '(' +
          'upper(e1.code)=upper($2) ' +
          'or ' +
          'upper(e1.altcode)=upper($3)' +
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
              global.log.error({checkemployeecode: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({checkemployeecode: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function NextEmployeeCode(world)
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
              global.modconfig.doNextEmpNo(tx, world).then
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
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, empno: result.empno, pdata: world.pdata});
                        // We also updated config (with new empno) so let everyone know that too...
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
                            global.log.error({nextemployeecode: true}, msg);
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
                      global.log.error({nextemployeecode: true}, msg);
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
              global.log.error({nextemployeecode: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({nextemployeecode: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

// *******************************************************************************************************************************************************************************************
// Public functions
module.exports.ListEmployees = ListEmployees;
module.exports.LoadEmployee = LoadEmployee;
module.exports.NewEmployee = NewEmployee;
module.exports.SaveEmployee = SaveEmployee;
module.exports.ExpireEmployee = ExpireEmployee;
module.exports.ChangeEmployeeParent = ChangeEmployeeParent;
module.exports.CheckEmployeeCode = CheckEmployeeCode;
module.exports.NextEmployeeCode = NextEmployeeCode;

