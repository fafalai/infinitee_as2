function Try1()
{
  global.pg.connect
  (
    global.cs,
    function (err, client, done)
    {
      if (!err)
      {
        var tx = new global.pgtx(client);
        tx.begin
        (
          function (err)
          {
            if (!err)
            {
              // Get all products assigned to category TPCC (41) and what client they belong to based on prefix of their product code
              client.query
              (
                'select distinct ' +
                'c1.code,' +
                'c1.name ' +
                'from ' +
                'products p1 left join productcategories pc1 on (p1.productcategories_id=pc1.id),' +
                'clients c1 ' +
                'where ' +
                'pc1.id=41 ' +
                'and ' +
                'substr(p1.code,1,5) like \'C%_\' ' +
                'and ' +
                '(substr(p1.code,1,4)=c1.code)',
                function(err, result)
                {
                  if (!err)
                  {
                    // Use the client name to create category if not already existing...
                    var calls = [];

                    result.rows.forEach
                    (
                      function(r)
                      {
                        calls.push
                        (
                          function(callback)
                          {
                            console.log('Looking up client: ' + r.name);
                            client.query
                            (
                              'select ' +
                              'pc1.id,' +
                              'pc1.name ' +
                              'from ' +
                              'productcategories pc1 ' +
                              'where ' +
                              'upper(pc1.code)=upper($1)' ,
                              [
                                r.code
                              ],
                              function(err, result)
                              {
                                if (!err)
                                {
                                  if (result.rows.length == 0)
                                  {
                                    console.log('Inserting new category:  ' + r.code);
                                    client.query
                                    (
                                      'insert into productcategories (customers_id,productcategories_id,code,name,userscreated_id) values (2,54,upper($1),$2,13)',
                                      [
                                        r.code,
                                        r.name
                                      ],
                                      function(err, result)
                                      {
                                        if (!err)
                                          callback(null, {});
                                        else
                                        {
                                          console.log(err);
                                          callback(err);
                                        }
                                      }
                                    );
                                  }
                                  else
                                    callback(null, {});
                                }
                                else
                                  callback(err);
                              }
                            );
                          }
                        );
                      }
                    );

                    global.async.series
                    (
                      calls,
                      function(err, results)
                      {
                        if (!err)
                        {
                          console.log('All done...');
                          tx.commit
                          (
                            function(err)
                            {
                              if (!err)
                                done();
                              else
                              {
                                tx.rollback
                                (
                                  function(ignore)
                                  {
                                    done();
                                  }
                                );
                              }
                            }
                          )
                        }
                        else
                        {
                          console.log('Errors..........');
                          tx.rollback
                          (
                            function(ignore)
                            {
                              done();
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
                      }
                    );
                  }
                }
              );
            }
            else
              done();
          }
        );
      }
    }
  );
}

function Try2()
{
  global.pg.connect
  (
    global.cs,
    function (err, client, done)
    {
      if (!err)
      {
        var tx = new global.pgtx(client);
        tx.begin
        (
          function (err)
          {
            if (!err)
            {
              // Get all products assigned to category TPCC (41) and what client they belong to based on prefix of their product code
              client.query
              (
                'select ' +
                'p1.id productid,' +
                'p1.code productcode,' +
                'c1.id clientid,' +
                'c1.code clientcode,' +
                'pc1.id productcategoryid ' +
                'from ' +
                'products p1,' +
                'productcategories pc1,' +
                'clients c1 ' +
                'where ' +
                'p1.productcategories_id=41 ' +
                'and ' +
                'substr(p1.code,1,5) like \'C%_\' ' +
                'and ' +
                '(substr(p1.code,1,4)=c1.code) ' +
                'and ' +
                'pc1.code=c1.code',
                function(err, result)
                {
                  if (!err)
                  {
                    var calls = [];

                    result.rows.forEach
                    (
                      function(r)
                      {
                        calls.push
                        (
                          function(callback)
                          {
                            console.log('moving Product ' + r.productcode);
                            client.query
                            (
                              'update products set productcategories_id=$1,clients_id=$2 where id=$3',
                              [
                                r.productcategoryid,
                                r.clientid,
                                r.productid
                              ],
                              function(err, result)
                              {
                                if (!err)
                                  callback(null, {});
                                else
                                {
                                  console.log(err);
                                  callback(err);
                                }
                              }
                            );
                          }
                        );
                      }
                    );

                    global.async.series
                    (
                      calls,
                      function(err, results)
                      {
                        if (!err)
                        {
                          console.log('All done...');
                          tx.commit
                          (
                            function(err)
                            {
                              if (!err)
                                done();
                              else
                              {
                                tx.rollback
                                (
                                  function(ignore)
                                  {
                                    done();
                                  }
                                );
                              }
                            }
                          )
                        }
                        else
                        {
                          console.log('Errors..........');
                          tx.rollback
                          (
                            function(ignore)
                            {
                              done();
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
                      }
                    );
                  }
                }
              );
            }
            else
              done();
          }
        );
      }
    }
  );
}

function Try3()
{
  global.pg.connect
  (
    global.cs,
    function (err, client, done)
    {
      if (!err)
      {
        var tx = new global.pgtx(client);
        tx.begin
        (
          function (err)
          {
            if (!err)
            {
              // Get all unique product codes in format CXXX where XXX is numeric...
              client.query
              (
                'select ' +
                'distinct (substr(c1.code, 1, 4)) prefix ' +
                'from ' +
                'clients c1 ' +
                'where  ' +
                'substr(c1.code, 1, 1)=\'C\' ' +
                'and ' +
                'substr(c1.code, 2, 1) ~ \'^[0-9]$\' ' +
                'and ' +
                'c1.dateexpired is null ' +
                'order by ' +
                'prefix',
                function(err, result)
                {
                  done();
                  if (!err)
                  {
                    var count = result.rows.length;
                    var ll = result.rows[count - 1].prefix;
                    var last = ll.substr(1, 3);
                    var full = [];
                    var n = '';
                    var index = 0;

                    // Find/mark gaps in code sequence....
                    for (var i = 1; i <= parseInt(last); i++)
                    {
                      n = 'C' + __.lpad(i, 3, '0');
                      if (result.rows[index].prefix == n)
                      {
                        full.push({used: true, code: n});
                        index++;
                      }
                      else
                        full.push({used: false, code: n});
                    }
                    console.log(full);
                  }
                }
              );
            }
          }
        );
      }
    }
  );
}

function Try4()
{
  global.pg.connect
  (
    global.cs,
    function (err, client, done)
    {
      if (!err)
      {
        /*
        var dtstart = global.moment(startdate, 'YYYY-MM-DD').hour(0).minute(0).second(0);
        var dtend = global.moment(startdate, 'YYYY-MM-DD').add({days: numdays}).hour(23).minute(59).second(59);
        var dtstartformatted = dtstart.format('YYYY-MM-DD HH:mm:ss');
        var dtendformatted = dtend.format('YYYY-MM-DD HH:mm:ss');
        */

        //global.log.info({docalcpayrollfromrtap: true}, 'RTAP data for period: ' + dtstartformatted + ' - ' + dtendformatted);

        client.query
        (
          'select ' +
          'r1.rfid,' +
          'r1.employeeid,' +
          'r1.lastname,' +
          'r1.firstname,' +
          'r1.code,' +
          'r1.starttime,' +
          'r1.endtime,' +
          'r1.dom,' +
          'r1.workhours,' +
          'r1.overtimeallowed ' +
          'from ' +
          'getrtapdata($1,$2,$3) r1 ' +
          'order by ' +
          'r1.lastname,' +
          'r1.firstname,' +
          'r1.starttime',
          [
            2,
            '2017-09-15 00:00:00',
            '2017-09-21 23:59:59'
          ],
          function(err, result)
          {
            if (!err)
            {
              var emptotals = [];

              result.rows.forEach
              (
                function(r)
                {
                  var starttime = global.moment(r.starttime);
                  var endtime = global.moment(r.endtime);
                  var dow = starttime.weekday();

                  r.name = r.lastname + ', ' + r.firstname;

                  r.starttime = starttime.format('YYYY-MM-DD HH:mm:ss');
                  r.endtime = endtime.format('YYYY-MM-DD HH:mm:ss');
                  r.downame = starttime.format('ddd');

                  if (!__.isBlank(r.workhours))
                  {
                    global.safejsonparse
                    (
                      r.workhours,
                      function(err, robj)
                      {
                        if (!err)
                        {
                          // Working hours for this day for this employee...
                          var hours_temp = robj[dow];
                          // Convert to moment() type - we only want the time portion anyway, ignore date...
                          var hours =
                            {
                              start: global.moment(hours_temp.start, 'HH:mm'),
                              finish: global.moment(hours_temp.finish, 'HH:mm')
                            };
                          // Breakdown the timestamp to start hour/minute and end hour/minute so we can compare to work hours...
                          var hstart = starttime.hour();
                          var mstart = starttime.minute();
                          var hend = endtime.hour();
                          var mend = endtime.minute();
                          var workhstart = hours.start.hour();
                          var workmstart = hours.start.minute();
                          var workhend = hours.finish.hour();
                          var workmend = hours.finish.minute();
                          // Total normal hours and overtime hours...
                          var nminutes = 0;
                          var ominutes = 0;
                          // Some rules...
                          // if they start BEFORE official start time, use official start time;
                          // If they start AFTER official start time, use that...
                          if (hstart < workhstart)
                          {
                            starttime.hour(workhstart);
                            starttime.minute(workmstart);
                            hstart = workhstart;
                            mstart = workmstart;
                          }
                          // No overtime allowed, reset end time to normal work hours...
                          if (r.overtimeallowed == 0)
                          {
                            endtime.hour(workhend);
                            endtime.minute(workmend);
                            hend = workhend;
                            mend = workmend;
                          }
                          // Calculate total #minutes worked
                          var normalminutes = hours.finish.diff(hours.start, 'minutes');
                          var totalminutes = endtime.diff(starttime, 'minutes') - global.config.env.lunchbreak;

                          if (totalminutes > normalminutes)
                          {
                            nminutes = normalminutes;
                            ominutes = totalminutes - normalminutes;
                          }
                          else
                            nminutes = totalminutes;

                          r.actualstarttime = starttime;
                          r.actualendtime = endtime;
                          r.nminutes = nminutes;
                          r.ominutes = ominutes;
                        }
                      }
                    );
                  }
                  else
                  {
                    // No work hours listed, so flexi-time - use the hours as is...
                    r.actualstarttime = r.starttime;
                    r.actualendtime = r.endtime;
                    r.nminutes = endtime.diff(starttime, 'minutes');
                    r.ominutes = 0;
                  }
                }
              );
              // Now add up totals...
              result.rows.forEach
              (
                function(r)
                {
                  var emp = emptotals.filter
                  (
                    function(e)
                    {
                      return e.employeeid == r.employeeid;
                    }
                  );

                  if (__.isNull(emp) || (emp.length == 0))
                    emptotals.push({employeeid: r.employeeid, name: r.name, code: r.code, normal: r.nminutes, overtime: r.ominutes, total: r.nminutes + r.ominutes});
                  else
                  {
                    emp[0].normal += r.nminutes;
                    emp[0].overtime += r.ominutes;
                    emp[0].total += (r.nminutes + r.ominutes);
                  }
                }
              );

              emptotals.forEach
              (
                function(e)
                {
                  /*
                  e.normal = global.moment.duration(e.normal, 'minutes').humanize();
                  e.overtime = global.moment.duration(e.overtime, 'minutes').humanize();
                  e.total = global.moment.duration(e.total, 'minutes').humanize();
                  */
                  e.normal = __.humaniseTimeInMinutes(global.moment.duration(e.normal, 'minutes').asMinutes());
                  e.overtime = __.humaniseTimeInMinutes(global.moment.duration(e.overtime, 'minutes').asMinutes());
                  e.total = __.humaniseTimeInMinutes(global.moment.duration(e.total, 'minutes').asMinutes());
                }
              );

              console.log(result.rows);
            }
          }
        );
      }
    }
  );
}

function Try5()
{
  var to = global.moment().add(2, 'day');
  var from = to;

  while (from.weekday() != global.config.env.defaultpaydow)
    from = from.subtract(1, 'day');

  console.log(from.format('YYYY-MM-DD'));
}

function Try6()
{
  global.pg.connect
  (
    global.cs,
    function (err, client, done)
    {
      if (!err)
      {
        var tx = new global.pgtx(client);
        tx.begin
        (
          function (err)
          {
            if (!err)
            {
              // *************************************************************
              // OLD style product code ONLY - see Try9() for NEW version
              // *************************************************************

              // Get all client products not currently having a build template
              // 1306 = Lombards                     C031
              // 1161 = Auspak                       C006
              // 1436 = 48 flavours                  C041
              // 1138 = 57 cafe bar                  C397

              // 1439 = O'kelly group                C119
              // 1237 = International paper products EX008
              // 1390 = Savil packaging              C204
              client.query
              (
                'select id,code from products where clients_id=$1 and dateexpired is null and buildtemplateheaders_id is null',
                [
                  1439
                ],
                function(err, result)
                {
                  if (!err)
                  {
                    var found = 0;
                    var notfound = 0;
                    var updated = 0;
                    var calls = [];

                    result.rows.forEach
                    (
                      function(r)
                      {
                        calls.push
                        (
                          function(callback)
                          {
                            var productid = r.id;
                            var a = r.code.split('_');
                            var clientcode = a[0];
                            var cuptype = a[2];
                            var cupsize = a[3];

                            console.log(clientcode + ', ' + cuptype + ', ' + cupsize);

                            // Find build template header for this client code...
                            client.query
                            (
                              'select id from buildtemplateheaders where code=$1 and dateexpired is null',
                              [
                                clientcode
                              ],
                              function(err, result)
                              {
                                if (!err)
                                {
                                  if (result.rows.length > 0)
                                  {
                                    var buildtemplateheaderid = result.rows[0].id;
                                    var templatecode = cuptype;

                                    if (cuptype == 'DW')
                                    {
                                      if (cupsize == '08U')
                                        cupsize = '08U600';
                                      if (cupsize == '08UM')
                                        cupsize = '08U600';
                                      else if (cupsize == '12M')
                                        cupsize = '12';
                                      else if (cupsize == '16M')
                                        cupsize = '16';
                                    }
                                    else if (cuptype == 'CH')
                                    {
                                      if (cupsize == '08U')
                                        cupsize = '08';
                                    }

                                    templatecode += cupsize;

                                    // Now look for build template for this product...
                                    console.log('===== Looking for build template for client: ' + clientcode + ', product: '+ templatecode);
                                    client.query
                                    (
                                      'select id from buildtemplateheaders where buildtemplateheaders_id=$1 and code=$2 and dateexpired is null',
                                      [
                                        buildtemplateheaderid,
                                        templatecode
                                      ],
                                      function(err, result)
                                      {
                                        if (!err)
                                        {
                                          if (result.rows.length > 0)
                                          {
                                            var id = result.rows[0].id;
                                            console.log('===== Got template id: ' + id);
                                            found++;

                                            // Update product with template
                                            client.query
                                            (
                                              'update products set buildtemplateheaders_id=$1 where id=$2',
                                              [
                                                id,
                                                productid
                                              ],
                                              function(err, result)
                                              {
                                                if (!err)
                                                {
                                                  updated++;
                                                  callback(null, null);
                                                }
                                                else
                                                  callback(err);
                                              }
                                            );
                                          }
                                          else
                                          {
                                            console.log('***** No build template for: ' + templatecode);
                                            notfound++;
                                            callback(err);
                                          }
                                        }
                                        else
                                        {
                                          console.log(err);
                                          callback(err);
                                        }
                                      }
                                    );
                                  }
                                  else
                                  {
                                    console.log('***** No build template for client code: ' + clientcode);
                                    callback(null, null);
                                  }
                                }
                                else
                                {
                                  console.log(err);
                                  callback(err);
                                }
                              }
                            );
                          }
                        );
                      }
                    );

                    global.async.series
                    (
                      calls,
                      function(err, results)
                      {
                        if (!err)
                        {
                          console.log('***** Found: ' + found + ', NOT found: ' + notfound + ', Updated: ' + updated);

                          tx.commit
                          (
                            function(err)
                            {
                              if (!err)
                                done();
                              else
                              {
                                tx.rollback
                                (
                                  function(ignore)
                                  {
                                    done();
                                  }
                                );
                              }
                            }
                          );
                        }
                        else
                          console.log(err);
                      }
                    );
                  }
                }
              );
            }
          }
        );
      }
    }
  );
}

function Try7()
{
  global.pg.connect
  (
    global.cs,
    function (err, client, done)
    {
      if (!err)
      {
        var tx = new global.pgtx(client);
        tx.begin
        (
          function (err)
          {
            if (!err)
            {
              // *************************************************************
              // OLD style product code ONLY
              // *************************************************************

              // Get all client products
              // 1306 = Lombards                     C031
              // 1161 = Auspak                       C006
              // 1436 = 48 flavours                  C041
              // 1138 = 57 cafe bar                  C397

              // 1439 = O'kelly group                C119
              // 1237 = International paper products EX008
              // 1390 = Savill packaging             C204
              client.query
              (
                'select id,code from products where clients_id=$1 and dateexpired is null',
                [
                  1390
                ],
                function(err, result)
                {
                  if (!err)
                  {
                    var updated = 0;
                    var calls = [];

                    result.rows.forEach
                    (
                      function(r)
                      {
                        calls.push
                        (
                          function(callback)
                          {
                            var productid = r.id;
                            var a = r.code.split('_');
                            var clientcode = a[0];
                            var cuptype = a[2];
                            var cupsize = a[3];
                            var newcode = '';

                            console.log(clientcode + ', ' + cuptype + ', ' + cupsize);

                            // Convert _08_ to 08U600_
                            // Convert _08U_ to _08U600_

                            if ((cuptype != 'DW') && (cuptype != 'SW'))
                            {
                              callback(null, null);
                              return;
                            }

                            if (cupsize != '08')
                            {
                              callback(null, null);
                              return;
                            }

                            if (a.length == 5)
                              newcode = a[0] + '_' + a[1] + '_' + a[2] + '_08U_' + a[4];

                            if (a.length == 6)
                              newcode = a[0] + '_' + a[1] + '_' + a[2] + '_08U_' + a[4] + '_' + a[5];

                            console.log('**** Setting new code: ' + newcode);

                            client.query
                            (
                              'update products set code=$1 where id=$2',
                              [
                                newcode,
                                productid
                              ],
                              function(err, result)
                              {
                                if (!err)
                                {
                                  updated++;
                                  callback(null, null);
                                }
                              }
                            );
                          }
                        );
                      }
                    );

                    global.async.series
                    (
                      calls,
                      function(err, results)
                      {
                        if (!err)
                        {
                          console.log('***** Updated: ' + updated);

                          tx.commit
                          (
                            function(err)
                            {
                              if (!err)
                                done();
                              else
                              {
                                tx.rollback
                                (
                                  function(ignore)
                                  {
                                    done();
                                  }
                                );
                              }
                            }
                          );
                        }
                        else
                          console.log(err);
                      }
                    );
                  }
                }
              );
            }
          }
        );
      }
    }
  );
}

function Try8()
{
  global.pg.connect
  (
    global.cs,
    function (err, client, done)
    {
      if (!err)
      {
        var tx = new global.pgtx(client);
        tx.begin
        (
          function (err)
          {
            if (!err)
            {
              // Rename product codes to remove the clientcode_clientabbrev_TYPE_SIZE_CUST to just TYPESIZE-CUST
              client.query
              (
                'select id,code from products where dateexpired is null',
                [
                ],
                function(err, result)
                {
                  if (!err)
                  {
                    var calls = [];

                    result.rows.forEach
                    (
                      function(p)
                      {
                        calls.push
                        (
                          function(callback)
                          {
                            var id = p.id;
                            var code = p.code;
                            var components = code.split('_');

                            if (components.length > 4)
                            {
                              var newcode = '';

                              newcode = components[2] + components[3] + '-' + components[4];

                              client.query
                              (
                                'update products set code=$1 where id=$2',
                                [
                                  newcode,
                                  id
                                ],
                                function(err, result)
                                {
                                  if (!err)
                                  {
                                    console.log(newcode + ' ...');
                                    callback(null, null);
                                  }
                                  else
                                  {
                                    console.log('***** Error ' + code);
                                    callback(err);
                                  }
                                }
                              );
                            }
                            else
                              callback(null, null);
                          }
                        );
                      }
                    );

                    global.async.series
                    (
                      calls,
                      function(err, results)
                      {
                        if (!err)
                        {
                          console.log('All done...');
                          tx.commit
                          (
                            function(err)
                            {
                              if (!err)
                                done();
                              else
                              {
                                tx.rollback
                                (
                                  function(ignore)
                                  {
                                    done();
                                  }
                                );
                              }
                            }
                          )
                        }
                        else
                        {
                          console.log('Errors..........');
                          tx.rollback
                          (
                            function(ignore)
                            {
                              done();
                            }
                          );
                        }
                      }
                    );
                  }
                }
              );
            }
          }
        );
      }
    }
  );
}

function Try9()
{
  global.pg.connect
  (
    global.cs,
    function (err, client, done)
    {
      if (!err)
      {
        var tx = new global.pgtx(client);
        tx.begin
        (
          function (err)
          {
            if (!err)
            {
              // *************************************************************
              // NEW style product code ONLY - see Try6() for OLD version
              // *************************************************************

              // Get all client products not currently having a build template
              // Lombards                     C031
              // Auspak                       C006
              // 48 flavours                  C041
              // 57 cafe bar                  C397

              // O'kelly group                C119
              // International paper products EX008
              // Savil packaging              C204
              client.query
              (
                'select p1.id,p1.code,p1.clients_id from products p1 where p1.dateexpired is null and p1.buildtemplateheaders_id is null and p1.clients_id is not null',
                [
                ],
                function(err, result)
                {
                  if (!err)
                  {
                    var found = 0;
                    var notfound = 0;
                    var updated = 0;
                    var calls = [];

                    result.rows.forEach
                    (
                      function(r)
                      {
                        calls.push
                        (
                          function(callback)
                          {
                            // TTSS-CUST
                            // TT = cup type
                            // SS = SIZE and may contain U/T/K
                            var productid = r.id;
                            var prefix = r.code.split('-');
                            var cup = prefix[0];


                            if (cup == 'DW08')
                              cup = 'DW08T';
                            else if (cup == 'D/W08')
                              cup = 'DW08T';
                            else if (cup == 'DW08U')
                              cup = 'DW08U500';
                            else if (cup == 'DW08UM')
                              cup = 'DW08U500';
                            else if (cup == 'DW08K')
                              cup = 'DW08TK';
                            else if (cup == 'DW12k')
                              cup = 'DW12K';
                            else if (cup == 'DW08TM')
                              cup = 'DW08T';
                            else if (cup == 'DW12M')
                              cup = 'DW12';
                            else if (cup == 'DW16M')
                              cup = 'DW16';
                            else if (cup == 'DWM08')
                              cup = 'DW08T';
                            else if (cup == 'DWB12')
                              cup = 'DW12';
                            else if (cup == 'DWM12')
                              cup = 'DW12';
                            else if (cup == 'DWM16')
                              cup = 'DW16';

                            else if (cup == '04SW')
                              cup = 'SW04';
                            else if (cup == 'SW6')
                              cup = 'SW06';
                            else if (cup == 'SW08')
                              cup = 'SW08T';

                            else if (cup == 'CH08U')
                              cup = 'CH08';

                            else if (cup == 'SC6')
                              cup = 'SW06';
                            else if (cup == 'SC06')
                              cup = 'SW06';
                            else if (cup == 'SC08')
                              cup = 'SW08T';
                            else if (cup == 'SC12')
                              cup = 'SW12';
                            else if (cup == 'SC16')
                              cup = 'SW16';
                            else if (cup == 'SC22')
                              cup = 'SW22';
                            else if (cup == 'SC24')
                              cup = 'SW24';

                            else if (cup == 'SW02')
                              cup = 'SW02W';

                            console.log('***** From: ' + prefix[0] + ' ==> ' + cup);

                            // Find build template header for this client code...
                            client.query
                            (
                              'select id from buildtemplateheaders where clients_id=$1 and code=$2 and dateexpired is null',
                              [
                                r.clients_id,
                                cup
                              ],
                              function(err, result)
                              {
                                if (!err)
                                {
                                  if (result.rows.length > 0)
                                  {
                                    var buildtemplateheaderid = result.rows[0].id;

                                    console.log('===== Got template id: ' + buildtemplateheaderid);
                                    found++;

                                    // Update product with template
                                    client.query
                                    (
                                      'update products set buildtemplateheaders_id=$1 where id=$2',
                                      [
                                        buildtemplateheaderid,
                                        productid
                                      ],
                                      function(err, result)
                                      {
                                        if (!err)
                                        {
                                          updated++;
                                          callback(null, null);
                                        }
                                        else
                                          callback(err);
                                      }
                                    );
                                  }
                                  else
                                  {
                                    console.log('***** No build template for client: ' + r.clients_id + ', cup: ' + cup);
                                    notfound++;
                                    callback(null, null);
                                  }
                                }
                                else
                                {
                                  console.log(err);
                                  callback(null, null);
                                }
                              }
                            );
                          }
                        );
                      }
                    );

                    global.async.series
                    (
                      calls,
                      function(err, results)
                      {
                        if (!err)
                        {
                          console.log('***** Found: ' + found + ', NOT found: ' + notfound + ', Updated: ' + updated);

                          tx.commit
                          (
                            function(err)
                            {
                              if (!err)
                                done();
                              else
                              {
                                tx.rollback
                                (
                                  function(ignore)
                                  {
                                    done();
                                  }
                                );
                              }
                            }
                          );
                        }
                        else
                          console.log(err);
                      }
                    );
                  }
                }
              );
            }
          }
        );
      }
    }
  );
}

function Try10()
{
  global.pg.connect
  (
    global.cs,
    function (err, client, done)
    {
      if (!err)
      {
        var tx = new global.pgtx(client);
        tx.begin
        (
          function (err)
          {
            if (!err)
            {
              var templates = [];

              // *************************************************************
              // For every client, copy complete set of master templates
              // *************************************************************

              // Get all master templates
              client.query
              (
                'select ' +
                'p1.id ' +
                'from ' +
                'producttemplateheaders p1 ' +
                'where ' +
                'p1.dateexpired is null ' +
                'order by ' +
                'p1.path,' +
                'p1.code',
                [
                ],
                function(err, result)
                {
                  if (!err)
                  {
                    var templates = [];
                    result.rows.forEach
                    (
                      function(t)
                      {
                        templates.push(t.id);
                      }
                    );

                    // Get all clients...
                    client.query
                    (
                      'select c1.id,c1.code,c1.name from clients c1 where c1.dateexpired is null and c1.isclient=1 and c1.code!=c1.name order by c1.code',
                      [
                      ],
                      function(err, result)
                      {
                        if (!err)
                        {
                          var calls = [];
                          result.rows.forEach
                          (
                            function(c)
                            {
                              calls.push
                              (
                                function(callback)
                                {
                                  console.log('***** Creating build templates for: ' + c.code);
                                  var buildtemplateid = null;

                                  global.modproducts.doNewBuildTemplateStep1(tx, global.config.defaults.defaultcustomerid, global.config.defaults.defaultadminuserid, c.id).then
                                  (
                                    function(result)
                                    {
                                      buildtemplateid = result.buildtemplateid;
                                      return global.modproducts.doNewBuildTemplateStep2(tx, global.config.defaults.defaultcustomerid, global.config.defaults.defaultadminuserid, c.id, buildtemplateid, templates);
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
                              );
                            }
                          );

                          global.async.series
                          (
                            calls,
                            function(err, results)
                            {
                              if (!err)
                              {
                                tx.commit
                                (
                                  function(err)
                                  {
                                    if (!err)
                                    {
                                      console.log('***** All Done...');
                                      done();
                                    }
                                    else
                                    {
                                      tx.rollback
                                      (
                                        function(ignore)
                                        {
                                          done();
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
                                  }
                                );
                              }
                            }
                          );
                        }
                      }
                    );
                  }
                }
              );
            }
          }
        );
      }
    }
  );
}

function Try11()
{
  global.pg.connect
  (
    global.cs,
    function (err, client, done)
    {
      if (!err)
      {
        var tx = new global.pgtx(client);
        tx.begin
        (
          function (err)
          {
            if (!err)
            {
              var templates = [];

              // *************************************************************
              // Some orphaned products
              // with wrong product categiory and no client id...
              // *************************************************************

              client.query
              (
                'select id,code,productcategories_id from products where dateexpired is null and clients_id is null and (code like \'C001%\' or code like \'C015%\' or code like \'C014%\' or code like \'C019%\' or code like \'C020%\' or code like \'C034%\' or code like \'C040%\' or code like \'C045%\' or code like \'C097%\' or code like \'C111%\' or code like \'C120%\' or code like \'C125%\' or code like \'C129%\' or code like \'C138%\' or code like \'C140%\' or code like \'C144%\' or code like \'C148%\' or code like \'C175%\' or code like \'C176%\' or code like \'C194%\' or code like \'C195%\' or code like \'C288%\' or code like \'C298%\' or code like \'C309%\' or code like \'C343%\' or code like \'C396%\' or code like \'C513%\' or code like \'C540%\' or code like \'C541%\' or code like \'C542%\' or code like \'C543%\' or code like \'C544%\' or code like \'C545%\' or code like \'C546%\' or code like \'C547%\' or code like \'C548%\' or code like \'C549%\' or code like \'C550%\' or code like \'C551%\' or code like \'C553%\' or code like \'C554%\' or code like \'C555%\' or code like \'C556%\' or code like \'C557%\' or code like \'C558%\' or code like \'C560%\' or code like \'C561%\' or code like \'C562%\' or code like \'C563%\' or code like \'C564%\' or code like \'C565%\')',
                [
                ],
                function(err, result)
                {
                  if (!err)
                  {
                    var calls = [];

                    result.rows.forEach
                    (
                      function(r)
                      {
                        calls.push
                        (
                          function(callback)
                          {
                            var productid = r.id;
                            var productcode = r.code;
                            var categoryid = r.categoryid;
                            var components = r.code.split('_');
                            var clientcode = components[0];

                            // Find client id and product category matching this...
                            client.query
                            (
                              'select c1.id clientid,c1.code clientcode,pc1.id categoryid,pc1.code categorycode from clients c1,productcategories pc1 where c1.code=$1 and pc1.code=$2 and c1.dateexpired is null and pc1.dateexpired is null',
                              [
                                clientcode,
                                clientcode
                              ],
                              function(err, result)
                              {
                                if (!err)
                                {
                                  if (result.rows.length > 0)
                                  {
                                    var clid = result.rows[0].clientid;
                                    var catid = result.rows[0].categoryid;
                                    var catcode = result.rows[0].categorycode;

                                    console.log(productcode + ' ==> ' + clientcode + ' ==> ' + catcode);
                                    callback(null, null);
                                  }
                                  else
                                    callback(null, null);
                                }
                                else
                                  callback(err);
                              }
                            );
                          }
                        );
                      }
                    );

                    global.async.series
                    (
                      calls,
                      function(err, results)
                      {
                        if (!err)
                        {
                          tx.rollback
                          (
                            function(ignore)
                            {
                              done();
                            }
                          );
                          // tx.commit
                          // (
                          //   function(err)
                          //   {
                          //     if (!err)
                          //     {
                          //       console.log('***** All Done...');
                          //       done();
                          //     }
                          //     else
                          //     {
                          //       tx.rollback
                          //       (
                          //         function(ignore)
                          //         {
                          //           done();
                          //         }
                          //       );
                          //     }
                          //   }
                          // );
                        }
                        else
                        {
                          tx.rollback
                          (
                            function(ignore)
                            {
                              done();
                            }
                          );
                        }
                      }
                    );
                  }
                }
              );
            }
          }
        );
      }
    }
  );
}

function Try12()
{
  global.pg.connect
  (
    global.cs,
    function (err, client, done)
    {
      if (!err)
      {
        var tx = new global.pgtx(client);
        tx.begin
        (
          function (err)
          {
            if (!err)
            {
              var templates = [];

              // *************************************************************
              // Get all products that don't have a client_id
              // Use productcategory to determine which client they belong to
              // *************************************************************

              client.query
              (
                'select ' +
                'p1.id,' +
                'p1.code productcode,' +
                'pc1.code productcategorycode,' +
                'c1.id clientid,' +
                'c1.code clientcode ' +
                'from ' +
                'products p1 left join productcategories pc1 on (p1.productcategories_id=pc1.id) ' +
                '            left join clients c1 on (pc1.code=c1.code) ' +
                'where ' +
                'p1.dateexpired is null ' +
                'and ' +
                'p1.productcategories_id is not null ' +
                'and ' +
                'p1.clients_id is null',
                [
                ],
                function(err, result)
                {
                  if (!err)
                  {
                    result.rows.forEach
                    (
                      function(r)
                      {
                        var calls = [];

                        result.rows.forEach
                        (
                          function(c)
                          {
                            calls.push
                            (
                              function(callback)
                              {
                                var productid = r.id;
                                var productcode = r.productcode;
                                var productcategorycode = r.productcategorycode;
                                var clientid = r.clientid;
                                var clientcode = r.clientcode;

                                if (!__.isNull(productcategorycode) && !__.isBlank(productcategorycode) && !__.isNull(clientid))
                                {
                                  console.log('***** Setting client ID of [' + productcode + '] to: ' + clientid + ' [' + clientcode + ']');
                                  client.query
                                  (
                                    'update products set clients_id=$1 where id=$2',
                                    [
                                      clientid,
                                      productid
                                    ],
                                    function(err, result)
                                    {
                                      if (!err)
                                        callback(null, null);
                                      else
                                        callback(err);
                                    }
                                  );
                                }
                                else
                                  callback(null, null);
                              }
                            );
                          }
                        );

                        global.async.series
                        (
                          calls,
                          function(err, results)
                          {
                            if (!err)
                            {
                              tx.commit
                              (
                                function(err)
                                {
                                  if (!err)
                                  {
                                    console.log('***** All Done...');
                                    done();
                                  }
                                  else
                                  {
                                    tx.rollback
                                    (
                                      function(ignore)
                                      {
                                        done();
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
                                }
                              );
                            }
                          }
                        );
                      }
                    );
                  }
                }
              );
            }
          }
        );
      }
    }
  );
}

function Try13()
{
  global.pg.connect
  (
    global.cs,
    function (err, client, done)
    {
      if (!err)
      {
        var tx = new global.pgtx(client);
        tx.begin
        (
          function (err)
          {
            if (!err)
            {
              var templates = [];

              // *************************************************************
              // Get all products that are in CUPS category (TPCC_xxxx)
              // change to "standard" format - SW08-xxxx
              // *************************************************************

              client.query
              (
                'select ' +
                'p1.id,' +
                'p1.code productcode ' +
                'from ' +
                'products p1 ' +
                'where ' +
                'p1.dateexpired is null ' +
                'and ' +
                'p1.productcategories_id=92',
                [
                ],
                function(err, result)
                {
                  if (!err)
                  {
                    var calls = [];

                    result.rows.forEach
                    (
                      function(p)
                      {
                        calls.push
                        (
                          function(callback)
                          {
                            var productid = p.id;
                            var components = p.productcode.split('_');
                            // Now have
                            // 0    1  2  3
                            // TPPC SW 12 BLAH
                            var productcode = components[1] + components[2] + '-' + components[3];

                            client.query
                            (
                              'update products set code=$1 where id=$2',
                              [
                                productcode,
                                productid
                              ],
                              function(err, result)
                              {
                                if (!err)
                                {
                                  console.log('***** Changed [' + p.productcode + '] to: ' + '[' + productcode + ']');
                                  callback(null, null);
                                }
                                else
                                {
                                  console.log('+++++ Unable to change [' + p.productcode + '] to: ' + '[' + productcode + ']');
                                  callback(err);
                                }
                              }
                            );
                          }
                        );
                      }
                    );

                    global.async.series
                    (
                      calls,
                      function(err, results)
                      {
                        if (!err)
                        {
                          tx.commit
                          (
                            function(err)
                            {
                              if (!err)
                              {
                                console.log('***** All Done...');
                                done();
                              }
                              else
                              {
                                tx.rollback
                                (
                                  function(ignore)
                                  {
                                    done();
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
                            }
                          );
                        }
                      }
                    );
                  }
                }
              );
            }
          }
        );
      }
    }
  );
}

function Try14()
{
  global.pg.connect
  (
    global.cs,
    function (err, client, done)
    {
      if (!err)
      {
        var tx = new global.pgtx(client);
        tx.begin
        (
          function (err)
          {
            if (!err)
            {
              var templates = [];

              // *************************************************************
              // Get all products that are in DIGITAL category XXYY-DIGITAL
              // Assign build template
              // *************************************************************

              client.query
              (
                'select ' +
                'p1.id,' +
                'p1.code productcode ' +
                'from ' +
                'products p1 ' +
                'where ' +
                'p1.dateexpired is null ' +
                'and ' +
                'p1.productcategories_id=743',
                [
                ],
                function(err, result)
                {
                  if (!err)
                  {
                    var calls = [];

                    result.rows.forEach
                    (
                      function(p)
                      {
                        calls.push
                        (
                          function(callback)
                          {
                            var productid = p.id;
                            var components = p.productcode.split('-');
                            var cup = components[0];

                            if (cup == 'DW08U')
                              cup = 'DW08U500';
                            else if (cup == 'SW02')
                              cup = 'SM02';

                            cup += 'W';

                            // Find build template to match
                            client.query
                            (
                              'select bth1.id,bth1.code from buildtemplateheaders bth1 where bth1.dateexpired is null and bth1.code=$1',
                              [
                                cup
                              ],
                              function(err, result)
                              {
                                if (!err)
                                {
                                  if (result.rows.length > 0)
                                  {
                                    var id = result.rows[0].id;
                                    console.log('Product ' + p.productcode + ' ==> template: ' + result.rows[0].code);
                                    client.query
                                    (
                                      'update products set buildtemplateheaders_id=$1 where id=$2',
                                      [
                                        id,
                                        productid
                                      ],
                                      function(err, result)
                                      {
                                        if (!err)
                                        {
                                          callback(null, null);
                                        }
                                        else
                                        {
                                          callback(err);
                                        }
                                      }
                                    );
                                  }
                                  else
                                  {
                                    console.log('Product ' + p.productcode + ' ==> NO template found, looking for: ' + cup);
                                    callback(null, null);
                                  }
                                }
                                else
                                {
                                  callback(err);
                                }
                              }
                            );
                          }
                        );
                      }
                    );

                    global.async.series
                    (
                      calls,
                      function(err, results)
                      {
                        if (!err)
                        {
                          tx.commit
                          (
                            function(err)
                            {
                              if (!err)
                              {
                                console.log('***** All Done...');
                                done();
                              }
                              else
                              {
                                tx.rollback
                                (
                                  function(ignore)
                                  {
                                    done();
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
                            }
                          );
                        }
                      }
                    );
                  }
                }
              );
            }
          }
        );
      }
    }
  );
}

function Try15()
{
  global.pg.connect
  (
    global.cs,
    function (err, client, done)
    {
      if (!err)
      {
        var tx = new global.pgtx(client);
        tx.begin
        (
          function (err)
          {
            if (!err)
            {
              var templates = [];

              // *************************************************************
              // Get all products that are in CUPS category XXYY-BLAH
              // Assign build template
              // *************************************************************

              client.query
              (
                'select ' +
                'p1.id,' +
                'p1.code productcode ' +
                'from ' +
                'products p1 ' +
                'where ' +
                'p1.dateexpired is null ' +
                'and ' +
                'p1.productcategories_id=92',
                [
                ],
                function(err, result)
                {
                  if (!err)
                  {
                    var calls = [];

                    result.rows.forEach
                    (
                      function(p)
                      {
                        calls.push
                        (
                          function(callback)
                          {
                            var productid = p.id;
                            var components = p.productcode.split('-');
                            var cup = components[0];
                            var colour = components[1];

                            if (cup == 'DW08U')
                              cup = 'DW08U500';
                            else if (cup == 'DW08')
                              cup = 'DW08U600';
                            else if (cup == 'DW08K')
                              cup = 'DW08TK';
                            else if (cup == 'SW02')
                              cup = 'SM02';
                            else if (cup == 'SW08')
                              cup = 'SW08T';
                            else if (cup == 'SC06')
                              cup = 'SW06';
                            else if (cup == 'SC08')
                              cup = 'SW08T';
                              else if (cup == 'SC08T')
                              cup = 'SW08T';
                            else if (cup == 'SC12')
                              cup = 'SW12';
                            else if (cup == 'SC16')
                              cup = 'SW16';
                            else if (cup == 'SC22')
                              cup = 'SW22';
                            else if (cup == 'SC24')
                              cup = 'SW24';
                            else if (cup == 'SWB08')
                              cup = 'SW08T';
                            else if (cup == 'SWB12')
                              cup = 'SW12';
                            else if (cup == 'SWB16')
                              cup = 'SW16';
                            else if (cup == 'CH08U')
                              cup = 'CH08';

                            if ((colour == 'W') || (colour == 'WH') || (colour == 'WHMATT'))
                              cup += 'W';

                            // Find build template to match
                            client.query
                            (
                              'select bth1.id,bth1.code from buildtemplateheaders bth1 where bth1.dateexpired is null and bth1.code=$1',
                              [
                                cup
                              ],
                              function(err, result)
                              {
                                if (!err)
                                {
                                  if (result.rows.length > 0)
                                  {
                                    var id = result.rows[0].id;
                                    console.log('Product ' + p.productcode + ' ==> template: ' + result.rows[0].code);
                                    client.query
                                    (
                                      'update products set buildtemplateheaders_id=$1 where id=$2',
                                      [
                                        id,
                                        productid
                                      ],
                                      function(err, result)
                                      {
                                        if (!err)
                                        {
                                          callback(null, null);
                                        }
                                        else
                                        {
                                          callback(err);
                                        }
                                      }
                                    );
                                  }
                                  else
                                  {
                                    console.log('Product ' + p.productcode + ' ==> NO template found, looking for: ' + cup);
                                    callback(null, null);
                                  }
                                }
                                else
                                {
                                  callback(err);
                                }
                              }
                            );
                          }
                        );
                      }
                    );

                    global.async.series
                    (
                      calls,
                      function(err, results)
                      {
                        if (!err)
                        {
                          tx.commit
                          (
                            function(err)
                            {
                              if (!err)
                              {
                                console.log('***** All Done...');
                                done();
                              }
                              else
                              {
                                tx.rollback
                                (
                                  function(ignore)
                                  {
                                    done();
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
                            }
                          );
                        }
                      }
                    );
                  }
                }
              );
            }
          }
        );
      }
    }
  );
}

function Try16()
{
  global.pg.connect
  (
    global.cs,
    function (err, client, done)
    {
      if (!err)
      {
        var tx = new global.pgtx(client);
        tx.begin
        (
          function (err)
          {
            if (!err)
            {
              var templates = [];

              // *************************************************************
              // Get all products that don't have a barcode
              // *************************************************************

              client.query
              (
                'select ' +
                'p1.id,' +
                'p1.code productcode ' +
                'from ' +
                'products p1 ' +
                'where ' +
                'p1.dateexpired is null',
                [
                ],
                function(err, result)
                {
                  if (!err)
                  {
                    var calls = [];

                    result.rows.forEach
                    (
                      function(p)
                      {
                        calls.push
                        (
                          function(callback)
                          {
                            global.modconfig.doNextBarcodeNo(tx, {cn: {custid: 2}}).then
                            (
                              function(result)
                              {
                                var barcodeno = result.barcodeno;
                                console.log('Product ' + p.productcode + ' ==> barcode: ' + barcodeno);
                                client.query
                                (
                                  'update products set barcode1=$1 where id=$2',
                                  [
                                    barcodeno,
                                    p.id
                                  ],
                                  function(err, result)
                                  {
                                    if (!err)
                                    {
                                      callback(null, null);
                                    }
                                    else
                                    {
                                      callback(err);
                                    }
                                  }
                                );
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
                        );
                      }
                    );

                    global.async.series
                    (
                      calls,
                      function(err, results)
                      {
                        if (!err)
                        {
                          tx.commit
                          (
                            function(err)
                            {
                              if (!err)
                              {
                                console.log('***** All Done...');
                                done();
                              }
                              else
                              {
                                tx.rollback
                                (
                                  function(ignore)
                                  {
                                    done();
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
                            }
                          );
                        }
                      }
                    );
                  }
                }
              );
            }
          }
        );
      }
    }
  );
}

module.exports.Try1 = Try1;
module.exports.Try2 = Try2;
module.exports.Try3 = Try3;
module.exports.Try4 = Try4;
module.exports.Try5 = Try5;
module.exports.Try6 = Try6;
module.exports.Try7 = Try7;
module.exports.Try8 = Try8;
module.exports.Try9 = Try9;
module.exports.Try10 = Try10;
module.exports.Try11 = Try11;
module.exports.Try12 = Try12;
module.exports.Try13 = Try13;
module.exports.Try14 = Try14;
module.exports.Try15 = Try15;
module.exports.Try16 = Try16;
