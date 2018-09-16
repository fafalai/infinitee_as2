// *******************************************************************************************************************************************************************************************
// Internal functions
function doNewLocation(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'insert into locations (customers_id,locations_id,code,name,address1,address2,city,postcode,state,country,gpslat,gpslon,attrib1,attrib2,attrib3,attrib4,attrib5,bay,level,shelf,userscreated_id) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21) returning id',
        [
          world.cn.custid,
          __.sanitiseAsBigInt(world.parentid),
          __.sanitiseAsString(world.code, 50),
          __.sanitiseAsString(world.name, 50),
          __.sanitiseAsString(world.address1, 50),
          __.sanitiseAsString(world.address2, 50),
          __.sanitiseAsString(world.city, 50),
          __.sanitiseAsString(world.postcode, 50),
          __.sanitiseAsString(world.state, 50),
          __.sanitiseAsString(world.country, 50),
          __.formatnumber(world.gpslat),
          __.formatnumber(world.gpslon),
          __.sanitiseAsString(world.attrib1, 50),
          __.sanitiseAsString(world.attrib2, 50),
          __.sanitiseAsString(world.attrib3, 50),
          __.sanitiseAsString(world.attrib4, 50),
          __.sanitiseAsString(world.attrib5, 50),
          __.sanitiseAsString(world.bay, 50),
          __.sanitiseAsString(world.level, 50),
          __.sanitiseAsString(world.shelf, 50),
          world.cn.userid
        ],
        function(err, result)
        {
          if (!err)
          {
            var locationid = result.rows[0].id;

            tx.query
            (
              'select l1.datecreated,u1.name usercreated from locations l1 left join users u1 on (l1.userscreated_id=u1.id) where l1.customers_id=$1 and l1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(locationid)
              ],
              function(err, result)
              {
                if (!err)
                {
                  var l = result.rows[0];

                  resolve
                  (
                    {
                      locationid: locationid,
                      datecreated: global.moment(l.datecreated).format('YYYY-MM-DD HH:mm:ss'),
                      usercreated: l.usercreated
                    }
                  );
                }
                else
                  reject({message: global.text_unablenewlocation});
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

function doSaveLocation(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'update locations set code=$1,name=$2,gpslat=$3,gpslon=$4,address1=$5,address2=$6,city=$7,state=$8,postcode=$9,country=$10,attrib1=$11,attrib2=$12,attrib3=$13,attrib4=$14,attrib5=$15,bay=$16,level=$17,shelf=$18,datemodified=now(),usersmodified_id=$19 where customers_id=$20 and id=$21',
        [
          __.sanitiseAsString(world.code, 50),
          __.sanitiseAsString(world.name, 50),
          __.formatnumber(world.gpslat),
          __.formatnumber(world.gpslon),
          __.sanitiseAsString(world.address1, 50),
          __.sanitiseAsString(world.address2, 50),
          __.sanitiseAsString(world.city, 50),
          __.sanitiseAsString(world.state, 50),
          __.sanitiseAsString(world.postcode, 50),
          __.sanitiseAsString(world.country, 50),
          __.sanitiseAsString(world.attrib1, 50),
          __.sanitiseAsString(world.attrib2, 50),
          __.sanitiseAsString(world.attrib3, 50),
          __.sanitiseAsString(world.attrib4, 50),
          __.sanitiseAsString(world.attrib5, 50),
          __.sanitiseAsString(world.bay, 50),
          __.sanitiseAsString(world.level, 50),
          __.sanitiseAsString(world.shelf, 50),
          world.cn.userid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.locationid)
        ],
        function(err, result)
        {
          if (!err)
          {
            tx.query
            (
              'select l1.datemodified,u1.name from locations l1 left join users u1 on (l1.usersmodified_id=u1.id) where l1.customers_id=$1 and l1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(world.locationid)
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

function doChangeLocationParent(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'update locations set locations_id=$1,datemodified=now(),usersmodified_id=$2 where customers_id=$3 and id=$4',
        [
          __.sanitiseAsBigInt(world.parentid),
          world.cn.userid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.locationid)
        ],
        function(err, result)
        {
          if (!err)
          {
            tx.query
            (
              'select l1.datemodified,u1.name from locations l1 left join users u1 on (l1.usersmodified_id=u1.id) where l1.customers_id=$1 and l1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(world.locationid)
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

function doExpireLocationStep1(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      if (!world.cascade)
      {
        tx.query
        (
          'select l1.locations_id locationid from locations l1 where l1.customers_id=$1 and l1.id=$2 and l1.dateexpired is null',
          [
            world.cn.custid,
            __.sanitiseAsBigInt(world.locationid)
          ],
          function(err, result)
          {
            if (!err)
            {
              if (result.rows.length == 1)
              {
                var parentid = result.rows[0].locationid;

                tx.query
                (
                  'update locations set locations_id=$1,datemodified=now(),usersmodified_id=$2 where customers_id=$3 and locations_id=$4 and dateexpired is null',
                  [
                    parentid,
                    world.cn.userid,
                    world.cn.custid,
                    __.sanitiseAsBigInt(world.locationid)
                  ],
                  function(err, result)
                  {
                    if (!err)
                      resolve({locationid: world.locationid});
                    else
                      reject(err);
                  }
                );
              }
              else
                reject({message: global.text_unableexpirelocation});
            }
            else
              reject(err);
          }
        );
      }
      else
        resolve({locationid: world.locationid});
    }
  );
  return promise;
}

function doExpireLocationStep2(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'update locations set dateexpired=now(),usersexpired_id=$1 where customers_id=$2 and id=$3 and dateexpired is null',
        [
          world.cn.userid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.locationid)
        ],
        function(err, result)
        {
          if (!err)
          {
            tx.query
            (
              'select l1.dateexpired,u1.name from locations l1 left join users u1 on (l1.usersexpired_id=u1.id) where l1.customers_id=$1 and l1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(world.locationid)
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
function ListLocations(world)
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
        // column indent is count of backslashes in path for indentation purposes...
        client.query
        (
          'select ' +
          'l1.id,' +
          'l1.code,' +
          'l1.name,' +
          'l1.address1,' +
          'l1.city,' +
          'l1.state,' +
          'l1.postcode,' +
          'l1.country,' +
          'l1.gpslat,' +
          'l1.gpslon,' +
          'l1.attrib1,' +
          'l1.attrib2,' +
          'l1.attrib3,' +
          'l1.attrib4,' +
          'l1.attrib5,' +
          'l1.bay,' +
          'l1.level,' +
          'l1.shelf,' +
          'l1.datecreated,' +
          'l1.datemodified,' +
          'l2.id parentid,' +
          'l2.code parentcode,' +
          'l2.name parentname,' +
          'l2.path,' +
          'char_length(l2.path) - char_length(regexp_replace(l2.path,\'/\',\'\',\'g\')) indent,' +
          'u1.name usercreated,' +
          'u2.name usermodified ' +
          'from ' +
          'locations l1 left join locations l2 on (l1.locations_id=l2.id) ' +
          '             left join users u1 on (l1.userscreated_id=u1.id) ' +
          '             left join users u2 on (l1.usersmodified_id=u2.id) ' +
          'where ' +
          'l1.customers_id=$1 ' +
          'and ' +
          'l1.dateexpired is null ' +
          'order by ' +
          'l1.path,' +
          'l1.code',
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
                function(l)
                {
                  if (!__.isUN(l.datemodified))
                    l.datemodified = global.moment(l.datemodified).format('YYYY-MM-DD HH:mm:ss');

                  l.datecreated = global.moment(l.datecreated).format('YYYY-MM-DD HH:mm:ss');
                }
              );

              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({listlocations: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({listlocations: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}
function LoadLocation(world)
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
        // column indent is count of backslashes in path for indentation purposes...
        client.query
        (
          'select ' +
          'l1.id,' +
          'l1.code,' +
          'l1.name,' +
          'l1.address1,' +
          'l1.address2,' +
          'l1.city,' +
          'l1.state,' +
          'l1.postcode,' +
          'l1.country,' +
          'l1.gpslat,' +
          'l1.gpslon,' +
          'l1.attrib1,' +
          'l1.attrib2,' +
          'l1.attrib3,' +
          'l1.attrib4,' +
          'l1.attrib5,' +
          'l1.bay,' +
          'l1.level,' +
          'l1.shelf,' +
          'l1.datecreated,' +
          'l1.datemodified,' +
          'l2.id parentid,' +
          'l2.code parentcode,' +
          'l2.name parentname,' +
          'u1.name usercreated,' +
          'u2.name usermodified ' +
          'from ' +
          'locations l1 left join locations l2 on (l1.locations_id=l2.id) ' +
          '             left join users u1 on (l1.userscreated_id=u1.id) ' +
          '             left join users u2 on (l1.usersmodified_id=u2.id) ' +
          'where ' +
          'l1.customers_id=$1 ' +
          'and ' +
          'l1.id=$2',
          [
            world.cn.custid,
            __.sanitiseAsBigInt(world.locationid)
          ],
          function(err, result)
          {
            done();

            if (!err)
            {
              // JS returns date with TZ info/format, need in ISO format...
              result.rows.forEach
              (
                function(l)
                {
                  if (!__.isUN(l.datemodified))
                    l.datemodified = global.moment(l.datemodified).format('YYYY-MM-DD HH:mm:ss');

                  l.datecreated = global.moment(l.datecreated).format('YYYY-MM-DD HH:mm:ss');
                }
              );

              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, location: result.rows[0], pdata: world.pdata});
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({loadlocation: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({loadlocation: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function NewLocation(world)
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
              doNewLocation(tx, world).then
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
                            locationid: result.locationid,
                            parentid: world.parentid,
                            datecreated: result.datecreated,
                            usercreated: result.usercreated,
                            pdata: world.pdata
                          }
                        );
                        global.pr.sendToRoomExcept
                        (
                          global.custchannelprefix + world.cn.custid,
                          'locationcreated',
                          {
                            locationid: result.locationid,
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
                            global.log.error({newlocation: true}, msg);
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
                      global.log.error({newlocation: true}, msg);
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
              global.log.error({newlocation: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({newlocation: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function SaveLocation(world)
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
              doSaveLocation(tx, world).then
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
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, locationid: world.locationid, datemodified: result.datemodified, usermodified: result.usermodified, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'locationsaved', {locationid: world.locationid, datemodified: result.datemodified, usermodified: result.usermodified}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({savelocation: true}, msg);
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
                      global.log.error({savelocation: true}, msg);
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
              global.log.error({savelocation: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({savelocation: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ChangeLocationParent(world)
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
              doChangeLocationParent(tx, world).then
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
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, locationid: world.locationid, parentid: world.parentid, datemodified: result.datemodified, usermodified: result.usermodified, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'locationparentchanged', {locationid: world.locationid, parentid: world.parentid, datemodified: result.datemodified, usermodified: result.usermodified}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({changelocationparent: true}, msg);
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
                      global.log.error({changelocationparent: true}, msg);
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
              global.log.error({changelocationparent: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({changelocationparent: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ExpireLocation(world)
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
              // If cascade is true, we just expire this location and trigger will expire all children...
              // Otherwise...
              // First find parent of this location (which could be null if no parent)
              // Set that as new parent of immediate children - their subschildren will be updated by triggers
              // Finally expire this location
              //
              // Note if we expire this location first, children and subschildren will autoexpire by the triggers
              doExpireLocationStep1(tx, world).then
              (
                function(ignore)
                {
                  return doExpireLocationStep2(tx, world);
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
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, locationid: world.locationid, dateexpired: result.dateexpired, userexpired: result.userexpired, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'locationexpired', {locationid: world.locationid, dateexpired: result.dateexpired, userexpired: result.userexpired}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({expirelocation: true}, msg);
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
                      global.log.error({expirelocation: true}, msg);
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
              global.log.error({expirelocation: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({expirelocation: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function CheckLocationCode(world)
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

        if (!__.isNull(world.locationid))
        {
          clause = ' and l1.id!=$3';
          binds.push(world.locationid);
        }

        client.query
        (
          'select ' +
          'l1.id,' +
          'l1.code,' +
          'l1.name ' +
          'from ' +
          'locations l1 ' +
          'where ' +
          'l1.customers_id=$1 ' +
          'and ' +
          'l1.dateexpired is null ' +
          'and ' +
          'upper(l1.code)=upper($2)' +
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
              global.log.error({checklocationcode: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({checklocationcode: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function Geocode(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.geocoder.geocode
  (
    world.address,
    function(err, data)
    {
      world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, rs: data.results, pdata: world.pdata});
    }
  );
}

// *******************************************************************************************************************************************************************************************
// Public functions
module.exports.ListLocations = ListLocations;
module.exports.LoadLocation = LoadLocation;
module.exports.NewLocation = NewLocation;
module.exports.SaveLocation = SaveLocation;
module.exports.ChangeLocationParent = ChangeLocationParent;
module.exports.ExpireLocation = ExpireLocation;
module.exports.CheckLocationCode = CheckLocationCode;
module.exports.Geocode = Geocode;
