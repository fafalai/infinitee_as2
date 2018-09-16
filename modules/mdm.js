// *******************************************************************************************************************************************************************************************
// Internal functions
function doMapWeatherIcon(icon)
{
  var thumb = '';
  switch (icon)
  {
    case 'clear-day':
      thumb = 'weather2-sun.png';
      break;
    case 'clear-night':
      thumb = 'weather2-moon.png';
      break;
    case 'rain':
      thumb = 'weather2-rain.png';
      break;
    case 'snow':
      thumb = 'weather2-snow.png';
      break;
    case 'sleet':
      thumb = 'weather2-hail.png';
      break;
    case 'wind':
      thumb = 'weather-windy.png';
      break;
    case 'fog':
      thumb = 'weather2-fog.png';
      break;
    case 'cloudy':
      thumb = 'weather2-sunheavycloud.png';
      break;
    case 'partly-cloudy-day':
      thumb = 'weather2-sunlightcloud.png';
      break;
    case 'partly-cloudy-night':
      thumb = 'weather2-moonlightcloud.png';
      break;
    default:
      thumb = 'weather2-sunlightcloud.png';
      break;
  }
   return thumb;
}

function doFindLocationFromCache(lat, lon)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      global.weather.keys
      (
        'gpsweather:*',
        function(err, list)
        {
          if (!err)
          {
            var keys = Object.keys(list);
            var keycount = keys.length;

            if (keycount > 0)
            {
              keys.some
              (
                function (k)
                {
                  global.weather.get
                  (
                    list[k],
                    function (err, wobj)
                    {
                      if (!err)
                      {
                        global.safejsonparse
                        (
                          wobj,
                          function (err, wo)
                          {
                            if (!err)
                            {
                              var distance = global.geolib.getDistance
                              (
                                {latitude: wo.gpslat, longitude: wo.gpslon},
                                {latitude: lat, longitude: lon},
                                global.config.forecast.accuracy
                              );
                              // If we find a forecast within 100km, weather should be similar enough...
                              if (distance <= global.config.forecast.radius)
                                resolve(wo);
                            }
                          }
                        );
                      }

                      // Finished searching - reject() it... if we had already found it, resolve() would have already been called...
                      if (--keycount == 0)
                        reject(undefined);
                    }
                  );
                }
              );
            }
            else
              reject(undefined);
          }
          else
            reject(undefined);
        }
      );
    }
  );
  return promise;
}

function doWeatherAtLocation(lat, lon)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      doFindLocationFromCache(lat, lon).then
      (
        function(wo)
        {
          resolve(wo);
        }
      ).then
      (
        null,
        function(err)
        {
          // Didn't find it in cache or error, so look it up and store as new...
          global.forecast.get
          (
            lat,
            lon,
            {
              units: 'si'
            },
            function(err, res, data)
            {
              if (!err)
              {
                var thumbnow = doMapWeatherIcon(data.currently.icon);
                var thumbdaily = doMapWeatherIcon(data.daily.icon);
                var weather =
                {
                  datecreated: global.moment().format('YYYY-MM-DD HH:mm:ss'),
                  wsummary: data.currently.summary,
                  wicon: thumbnow,
                  wtemp: data.currently.temperature,
                  wdailysummary: data.daily.summary,
                  wdailyicon: thumbdaily,
                  gpslat: lat,
                  gpslon: lon
                };
                // Now cache all this for next time...
                global.safejsonstringify
                (
                  weather,
                  function(err, json)
                  {
                    // Ignore errors - just means it doesn't get cached...
                    if (!err)
                    {
                      global.weather.set('gpsweather:[' + lat.toString() + ',' + lon.toString() + ']', json);
                      // Expire in 4 hours...
                      global.weather.expire('gpsweather:[' + lat.toString() + ',' + lon.toString() + ']', 60 * 60 * 4);
                    }
                  }
                );
                // Finally...
                resolve(weather);
              }
              else
                reject(err);
            }
          );
        }
      );
    }
  );
  return promise;
}

function doInsertPoll(tx, polldata)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'insert into polls (locale,tiuuid,address,batterystatename,gpslat,gpslon,users_id,mobilenetworkcode,cpucount,osname,systemname,backlightlevel,batterylevel,osversion,networktype,batterystate,availmem,dbgen,manufacturer,carriername,networktypename,modelname,netmask,bssid,ostype,lastsync,architecture,appversion,reason,mobilecountrycode,isocountrycode,allowsvoip,ssid,devicemodel) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34) returning id',
        [
          __.sanitiseAsString(polldata.locale, 10),
          __.sanitiseAsString(polldata.tiuuid, 64),
          __.sanitiseAsString(polldata.address, 20),
          __.sanitiseAsString(polldata.batterystatename, 20),
          __.formatnumber(polldata.gpslat),
          __.formatnumber(polldata.gpslon),
          __.sanitiseAsBigInt(polldata.userid),
          __.sanitiseAsString(polldata.mobilenetworkcode, 20),
          polldata.cpucount,
          __.sanitiseAsString(polldata.osname, 50),
          __.sanitiseAsString(polldata.systemname, 50),
          polldata.backlightlevel,
          __.formatnumber(polldata.batterylevel),
          __.sanitiseAsString(polldata.osversion, 10),
          polldata.networktype,
          polldata.batterystate,
          __.formatnumber(polldata.availmem),
          polldata.dbgen,
          __.sanitiseAsString(polldata.manufacturer, 50),
          __.sanitiseAsString(polldata.carriername, 50),
          __.sanitiseAsString(polldata.networktypename, 20),
          __.sanitiseAsString(polldata.modelname, 50),
          __.sanitiseAsString(polldata.netmask, 20),
          __.sanitiseAsString(polldata.bssid, 20),
          __.sanitiseAsString(polldata.ostype, 20),
          __.sanitiseAsDate(polldata.lastsync),
          __.sanitiseAsString(polldata.architecture, 20),
          __.sanitiseAsString(polldata.appversion, 20),
          __.sanitiseAsString(polldata.reason, 20),
          __.sanitiseAsString(polldata.mobilecountrycode, 20),
          __.sanitiseAsString(polldata.isocountrycode, 20),
          __.sanitiseAsBool(polldata.allowsvoip),
          __.sanitiseAsString(polldata.ssid, 20),
          __.sanitiseAsString(polldata.devicemodel, 20)
        ],
        function(err, result)
        {
          if (!err)
          {
            var pollid = result.rows[0].id;

            //console.log('New poll: ID = ' + pollid + ', reason = ' + polldata.reason + ', uid = ' + polldata.uid + ', location = (' + polldata.gpslat + ', ' + polldata.gpslon + ')');

            resolve(pollid);
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
function NewPoll(spark, eventname, polldata)
{
  var msg = '[' + eventname + '] ';
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
              global.userFromUid(polldata.uid).then
              (
                function(uo)
                {
                  if (!__.isUndefined(uo))
                  {
                    if (!__.isUndefined(uo.mapicon))
                      polldata.mapicon = uo.mapicon;

                    polldata.userid = uo.userid;

                    doInsertPoll(tx, polldata).then
                    (
                      function(ignore)
                      {
                        tx.commit
                        (
                          function(err)
                          {
                            done();

                            // Update everyone's status info on this "connection"...
                            if (polldata.reason == 'pausedapp')
                              global.pr.sendToRoomExcept(global.custchannelprefix + uo.custid, 'userpaused', {uuid: uo.uuid, datecreated: global.moment().format('YYYY-MM-DD HH:mm:ss')}, spark.id);
                            else if (polldata.reason == 'background')
                              global.pr.sendToRoomExcept(global.custchannelprefix + uo.custid, 'userbackground', {uuid: uo.uuid, datecreated: global.moment().format('YYYY-MM-DD HH:mm:ss')}, spark.id);
                            else
                              global.pr.sendToRoomExcept(global.custchannelprefix + uo.custid, 'userpolled', {uuid: uo.uuid, datecreated: global.moment().format('YYYY-MM-DD HH:mm:ss')}, spark.id);
                            //
                            doWeatherAtLocation(polldata.gpslat, polldata.gpslon).then
                            (
                              function(wo)
                              {
                                console.log('***** Poll weather');
                                console.log(wo);
                                wo.uuid = uo.uuid;
                                global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'userweather', wo, spark.id);
                              }
                            ).then
                            (
                              null,
                              function(err)
                              {
                                msg += err.message;
                                global.log.error({newpoll: true}, msg);
                              }
                            );
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
                            global.log.error({newpoll: true}, msg);
                          }
                        );
                      }
                    );
                  }
                  else
                  {
                    tx.rollback
                    (
                      function(ignore)
                      {
                        done();
                        msg += global.text_invaliduser;
                        global.log.error({newpoll: true}, msg);
                      }
                    );
                  }
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
                      msg += global.text_generalexception + ' ' + err;
                      global.log.error({newpoll: true}, msg);
                    }
                  );
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({newpoll: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({newpoll: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function LastUserPoll(world)
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
          'p1.id,' +
          'p1.datecreated,' +
          'p1.systemname,' +
          'p1.appversion,' +
          'p1.batterylevel,' +
          'p1.reason,' +
          'p1.address,' +
          'p1.ssid,' +
          'p1.gpslat,' +
          'p1.gpslon ' +
          'from ' +
          'polls p1 left join users u1 on (p1.id=u1.polls_id) ' +
          'where ' +
          'u1.customers_id=$1 ' +
          'and ' +
          'u1.uuid=$2',
          [
            world.cn.custid,
            __.sanitiseAsString(world.useruuid)
          ],
          function(err, result)
          {
            done();

            if (!err)
            {
              // JS returns date with TZ info/format, need in ISO format...
              result.rows.forEach
              (
                function(c)
                {
                  c.datecreated = global.moment(c.datecreated).format('YYYY-MM-DD HH:mm:ss');
                }
              );

              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, poll: result.rows[0], pdata: world.pdata});
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({lastuserpoll: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({lastuserpoll: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

// *******************************************************************************************************************************************************************************************
// Public functions
module.exports.NewPoll = NewPoll;
module.exports.LastUserPoll = LastUserPoll;
