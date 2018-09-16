function doInsertRfidTap(reader, tag, datecreated)
{
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
              // First debits...
              client.query
              (
                'insert into rtap (customers_id,reader,rfid) values ($1,$2,$3)',
                [
                  global.config.defaults.defaultcustomerid,
                  reader,
                  tag
                ],
                function(err, result)
                {
                  if (!err)
                  {
                    client.query
                    (
                      'select e1.lastname,e1.firstname,e1.code from employees e1 where customers_id=$1 and altcode=$2',
                      [
                        global.config.defaults.defaultcustomerid,
                        tag
                      ],
                      function(err, result)
                      {
                        if (!err)
                        {
                          var emplastname = (result.rows.length > 0) ? result.rows[0].lastname : '';
                          var empfirstname = (result.rows.length > 0) ? result.rows[0].firstname : '';
                          var empcode = (result.rows.length > 0) ? result.rows[0].code : '';

                          tx.commit
                          (
                            function (err, ret)
                            {
                              if (!err)
                              {
                                done();
                                global.pr.sendToRoom
                                (
                                  global.config.env.notificationschannel,
                                  'newrtap',
                                  {
                                    tag: tag,
                                    lastname: emplastname,
                                    firstname: empfirstname,
                                    code: empcode,
                                    datecreated: datecreated.format('YYYY-MM-DD HH:mm:ss')
                                  }
                                );
                              }
                              else
                              {
                                tx.rollback
                                (
                                  function (ignore)
                                  {
                                    done();
                                    global.log.error({rtap: true}, global.text_committx + ' ' + err.message);
                                  }
                                );
                              }
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
                              global.log.error({rtap: true}, global.text_dbexception + ' ' + err.message);
                            }
                          );
                        }
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
                        global.log.error({rtap: true}, global.text_dbexception + ' ' + err.message);
                      }
                    );
                  }
                }
              );
            }
            else
            {
              done();
              global.log.error({rtap: true}, global.text_notxstart + ' ' + err.message);
            }
          }
        );
      }
      else
        global.log.error({rtap: true}, global.text_nodbconnection);
    }
  );
}

exports.RfidTap = function(req, res)
{
  var rc = 0;
  var rsobj = {};
  var msg = '';

  if (!__.isUndefined(req.body))
  {
    var body = req.body;
    if (!__.isUndefined(body.tag) && !__.isUndefined(body.reader))
    {
      var tag = __.sanitiseAsString(body.tag).toLowerCase();
      var reader = __.sanitiseAsString(body.reader).toLowerCase();
      var now = global.moment();

      // 1. See if this tag is already in redis...
      // 2. If not, write to redis, then insert into DB...
      // 3. If yes, check if more than 5 mins ago... if not, ignore completely... if yes, update timestamp on redis, write to DB...

      global.rtaps.get
      (
        global.config.redis.rtap + tag,
        function(err, rtapobj)
        {
          if (!err)
          {
            if (__.isNull(rtapobj))
            {
              // Brand new never before seen tag...
              // Just write out...
              global.safejsonstringify
              (
                {
                  tag: tag,
                  reader: reader,
                  datecreated: now.format('YYYY-MM-DD HH:mm:ss')
                },
                function(err, json)
                {
                  if (!err)
                  {
                    global.rtaps.set(global.config.redis.rtap + tag, json);
                    doInsertRfidTap(reader, tag, now);
                  }
                }
              );
            }
            else
            {
              global.safejsonparse
              (
                rtapobj,
                function(err, rto)
                {
                  if (!err)
                  {
                    // Existing tag entry, compare dates...
                    var prevdate = global.moment(rto.datecreated);
                    var lastseen = now.diff(prevdate, global.config.env.tapdistance);
                    //
                    console.log('tag: ' + tag);
                    if (lastseen > global.config.env.mintapdistance)
                    {
                      console.log('writing');
                      global.safejsonstringify
                      (
                        {
                          tag: tag,
                          reader: reader,
                          datecreated: now.format('YYYY-MM-DD HH:mm:ss')
                        },
                        function(err, json)
                        {
                          if (!err)
                          {
                            global.rtaps.set(global.config.redis.rtap + tag, json);
                            doInsertRfidTap(reader, tag, now);
                          }
                        }
                      );
                    }
                    else
                      console.log('last seen: ' + lastseen);
                  }
                }
              );
            }
          }
        }
      );
    }
  }
  else
  {
    msg = 'Missing input';
    rc = -2;
  }
  //
  rsobj = {rc: rc, msg: msg};
  res.json(rsobj);
}
