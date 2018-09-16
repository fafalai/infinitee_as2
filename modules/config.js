// *******************************************************************************************************************************************************************************************
// Internal functions
function newPrintTemplate(args, callback)
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
              // We need user id and customer id to insert new entry...
              // Find user in cache...
              global.users.get
              (
                global.config.redis.prefix + args.uuid,
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
                          tx.query
                          (
                            'insert into printtemplates (customers_id,name,description,mimetype,size,userscreated_id) values ($1,$2,$3,$4,$5,$6) returning id',
                            [
                              uo.custid,
                              args.filename,
                              args.description,
                              args.mimetype,
                              args.size,
                              uo.userid
                            ],
                            function(err, result)
                            {
                              if (!err)
                              {
                                tx.commit
                                (
                                  function(err, ret)
                                  {
                                    if (!err)
                                    {
                                      done();

                                      if (result.rows.length == 1)
                                      {
                                        var printtemplateid = result.rows[0].id;
                                        //
                                        callback(null, printtemplateid);
                                        global.pr.sendToRoom(global.custchannelprefix + uo.custid, 'printtemplatecreated', {printtemplateid: printtemplateid});
                                      }
                                    }
                                    else
                                    {
                                      tx.rollback
                                      (
                                        function(ignore)
                                        {
                                          done();
                                          global.log.error({newprinttemplate: true}, global.text_committx + ' ' + err.message);
                                          callback(err, null);
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
                                    global.log.error({newprinttemplate: true}, global.text_dbexception + ' ' + err.message);
                                    callback(err, null);
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
                              global.log.error({newprinttemplate: true}, global.text_unablegetidfromuuid + ' ' + err.message);
                              callback(err, null);
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
                        global.log.error({newprinttemplate: true}, global.text_unablegetidfromuuid + ' ' + err.message);
                        callback(err, null);
                      }
                    );
                  }
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({newprinttemplate: true}, msg);
            }
          }
        );
      }
      else
        global.log.error({newprinttemplate: true}, global.text_nodbconnection);
    }
  );
}

function existingPrintTemplate(args, callback)
{
  // We need user id and customer id to validate request
  // Find user in cache...
  global.users.get
  (
    global.config.redis.prefix + args.uuid,
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
                      'p1.name,' +
                      'p1.size ' +
                      'from ' +
                      'printtemplates p1 ' +
                      'where ' +
                      'p1.customers_id=$1 ' +
                      'and ' +
                      'p1.id=$2',
                      [
                        uo.custid,
                        args.printtemplateid
                      ],
                      function(err, result)
                      {
                        done();

                        if (!err)
                          callback(null, {name: result.rows[0].name, size: result.rows[0].size});
                        else
                        {
                          global.log.error({existingprinttemplate: true}, global.text_generalexception + ' ' + err.message);
                          callback(err, null);
                        }
                      }
                    );
                  }
                  else
                  {
                    global.log.error({existingprinttemplate: true}, global.text_nodbconnection);
                    callback(err, null);
                  }
                }
              );
            }
            else
              callback(err, null);
          }
        );
      }
      else
        callback(err, null);
    }
  );
}

function savePrintTemplate(args, callback)
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
              // We need user id and customer id to update existing entry...
              // Find user in cache...
              global.users.get
              (
                global.config.redis.prefix + args.uuid,
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
                          // Need original filename first since we want to remove it and replace with new file (which might be same name)...
                          tx.query
                          (
                            'select pt1.name from printtemplates pt1 where pt1.customers_id=$1 and pt1.id=$2',
                            [
                              uo.custid,
                              args.printtemplateid
                            ],
                            function(err, result)
                            {
                              if (!err)
                              {
                                var oldfilename = result.rows[0].name;

                                tx.query
                                (
                                  'update printtemplates set name=$1,description=$2,mimetype=$3,size=$4,datemodified=now(),usersmodified_id=$5 where customers_id=$6 and id=$7',
                                  [
                                    args.filename,
                                    args.description,
                                    args.mimetype,
                                    args.size,
                                    uo.userid,
                                    uo.custid,
                                    args.printtemplateid
                                  ],
                                  function(err, result)
                                  {
                                    if (!err)
                                    {
                                      tx.commit
                                      (
                                        function(err, ret)
                                        {
                                          if (!err)
                                          {
                                            done();

                                            callback(null, oldfilename);
                                            global.pr.sendToRoom(global.custchannelprefix + uo.custid, 'printtemplatesaved', {printtemplateid: args.printtemplateid});
                                          }
                                          else
                                          {
                                            tx.rollback
                                            (
                                              function(ignore)
                                              {
                                                done();
                                                global.log.error({saveprinttemplate: true}, global.text_committx + ' ' + err.message);
                                                callback(err, null);
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
                                          global.log.error({saveprinttemplate: true}, global.text_dbexception + ' ' + err.message);
                                          callback(err, null);
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
                                    global.log.error({saveprinttemplate: true}, global.text_dbexception + ' ' + err.message);
                                    callback(err, null);
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
                              global.log.error({saveprinttemplate: true}, global.text_unablegetidfromuuid + ' ' + err.message);
                              callback(err, null);
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
                        global.log.error({saveprinttemplate: true}, global.text_unablegetidfromuuid + ' ' + err.message);
                        callback(err, null);
                      }
                    );
                  }
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({saveprinttemplate: true}, msg);
            }
          }
        );
      }
      else
        global.log.error({saveprinttemplate: true}, global.text_nodbconnection);
    }
  );
}

function doNextOrderNo(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'select c1.id,c1.currentorderno from config c1 where c1.customers_id=$1',
        [
          world.cn.custid
        ],
        function(err, result)
        {
          if (!err)
          {
            if (result.rows.length == 1)
            {
              var id = result.rows[0].id;
              var currentorderno = result.rows[0].currentorderno;
              var nextno = '';

              // Validate and give reasonable default...
              if (__.isBlank(currentorderno) || __.isNull(currentorderno))
                currentorderno = '00001';

              nextno = __.incString(currentorderno);

              tx.query
              (
                'update config set currentorderno=$1 where customers_id=$2 and id=$3',
                [
                  nextno,
                  world.cn.custid,
                  id
                ],
                function(err, result)
                {
                  if (!err)
                    resolve({orderno: currentorderno});
                  else
                    reject(err);
                }
              );
            }
            else
              reject({message: global.text_unablenextorderno});
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doNextPOrderNo(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'select c1.id,c1.currentporderno from config c1 where c1.customers_id=$1',
        [
          world.cn.custid
        ],
        function(err, result)
        {
          if (!err)
          {
            if (result.rows.length == 1)
            {
              var id = result.rows[0].id;
              var currentporderno = result.rows[0].currentporderno;
              var nextno = '';

              // Validate and give reasonable default...
              if (__.isBlank(currentporderno) || __.isNull(currentporderno))
                currentporderno = '00001';

              nextno = __.incString(currentporderno);

              tx.query
              (
                'update config set currentporderno=$1 where customers_id=$2 and id=$3',
                [
                  nextno,
                  world.cn.custid,
                  id
                ],
                function(err, result)
                {
                  if (!err)
                    resolve({porderno: currentporderno});
                  else
                    reject(err);
                }
              );
            }
            else
              reject({message: global.text_unablenextporderno});
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doNextInvoiceNo(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'select c1.id,c1.currentinvoiceno from config c1 where c1.customers_id=$1',
        [
          world.cn.custid
        ],
        function(err, result)
        {
          if (!err)
          {
            if (result.rows.length == 1)
            {
              var id = result.rows[0].id;
              var currentinvoiceno = result.rows[0].currentinvoiceno;
              var nextno = '';

              // Validate and give reasonable default...
              if (__.isBlank(currentinvoiceno) || __.isNull(currentinvoiceno))
                currentinvoiceno = '00001';

              nextno = __.incString(currentinvoiceno);

              tx.query
              (
                'update config set currentinvoiceno=$1 where customers_id=$2 and id=$3',
                [
                  nextno,
                  world.cn.custid,
                  id
                ],
                function(err, result)
                {
                  if (!err)
                    resolve({invoiceno: currentinvoiceno});
                  else
                    reject(err);
                }
              );
            }
            else
              reject({message: global.text_unablenextinvoiceno});
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doNextJournalNo(tx, cid)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      var custid = __.isObject(cid) ? cid.cn.custid : cid;

      tx.query
      (
        'select c1.id,c1.currentjournalno from config c1 where c1.customers_id=$1',
        [
          custid
        ],
        function(err, result)
        {
          if (!err)
          {
            if (result.rows.length == 1)
            {
              var id = result.rows[0].id;
              var currentjournalno = result.rows[0].currentjournalno;
              var nextno = '';

              // Validate and give reasonable default...
              if (__.isBlank(currentjournalno) || __.isNull(currentjournalno))
                currentjournalno = '00001';

              nextno = __.incString(currentjournalno);

              tx.query
              (
                'update config set currentjournalno=$1 where customers_id=$2 and id=$3',
                [
                  nextno,
                  custid,
                  id
                ],
                function(err, result)
                {
                  if (!err)
                    resolve({journalno: currentjournalno});
                  else
                    reject(err);
                }
              );
            }
            else
              reject({message: global.text_unablenextjournalno});
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doNextClientNo(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      if (__.isUNB(world.code))
      {
        tx.query
        (
          'select c1.id,c1.currentclientno from config c1 where c1.customers_id=$1',
          [
            world.cn.custid
          ],
          function(err, result)
          {
            if (!err)
            {
              if (result.rows.length == 1)
              {
                var id = result.rows[0].id;
                var currentclientno = result.rows[0].currentclientno;
                var nextno = '';

                // Validate and give reasonable default...
                if (__.isBlank(currentclientno) || __.isNull(currentclientno))
                  currentclientno = '00001';

                nextno = __.incString(currentclientno);

                tx.query
                (
                  'update config set currentclientno=$1 where customers_id=$2 and id=$3',
                  [
                    nextno,
                    world.cn.custid,
                    id
                  ],
                  function(err, result)
                  {
                    if (!err)
                      resolve({clientno: currentclientno});
                    else
                      reject(err);
                  }
                );
              }
              else
                reject({message: global.text_unablenextclientno});
            }
            else
              reject(err);
          }
        );
      }
      else
        resolve({clientno: world.code});
    }
  );
  return promise;
}

function doNextSupplierNo(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'select c1.id,c1.currentsupplierno from config c1 where c1.customers_id=$1',
        [
          world.cn.custid
        ],
        function(err, result)
        {
          if (!err)
          {
            if (result.rows.length == 1)
            {
              var id = result.rows[0].id;
              var currentsupplierno = result.rows[0].currentsupplierno;
              var nextno = '';

              // Validate and give reasonable default...
              if (__.isBlank(currentclientno) || __.isNull(currentsupplierno))
                currentsupplierno = '00001';

              nextno = __.incString(currentsupplierno);

              tx.query
              (
                'update config set currentsupplierno=$1 where customers_id=$2 and id=$3',
                [
                  nextno,
                  world.cn.custid,
                  id
                ],
                function(err, result)
                {
                  if (!err)
                    resolve({supplierno: currentsupplierno});
                  else
                    reject(err);
                }
              );
            }
            else
              reject({message: global.text_unablenextsupplierno});
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doNextEmpNo(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'select c1.id,c1.currentempno from config c1 where c1.customers_id=$1',
        [
          world.cn.custid
        ],
        function(err, result)
        {
          if (!err)
          {
            if (result.rows.length == 1)
            {
              var id = result.rows[0].id;
              var currentempno = result.rows[0].currentempno;
              var nextno = '';

              // Validate and give reasonable default...
              if (__.isBlank(currentempno) || __.isNull(currentempno))
                currentempno = '00001';

              nextno = __.incString(currentempno);

              tx.query
              (
                'update config set currentempno=$1 where customers_id=$2 and id=$3',
                [
                  nextno,
                  world.cn.custid,
                  id
                ],
                function(err, result)
                {
                  if (!err)
                    resolve({empno: currentempno});
                  else
                    reject(err);
                }
              );
            }
            else
              reject({message: global.text_unablenextempno});
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doNextJobSheetNo(tx, world)
{
  global.ConsoleLog("do next job sheet no");
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'select c1.id,c1.currentjobsheetno from config c1 where c1.customers_id=$1',
        [
          world.cn.custid
        ],
        function(err, result)
        {
          if (!err)
          {
            if (result.rows.length == 1)
            {
              var id = result.rows[0].id;
              var currentjobsheetno = result.rows[0].currentjobsheetno;
              var nextno = '';

              // Validate and give reasonable default...
              if (__.isBlank(currentjobsheetno) || __.isNull(currentjobsheetno))
                currentjobsheetno = '00001';

              nextno = __.incString(currentjobsheetno);

              tx.query
              (
                'update config set currentjobsheetno=$1 where customers_id=$2 and id=$3',
                [
                  nextno,
                  world.cn.custid,
                  id
                ],
                function(err, result)
                {
                  if (!err)
                    resolve({jobsheetno: currentjobsheetno});
                  else
                    reject(err);
                }
              );
            }
            else
              reject({message: global.text_unablenextjobsheetno});
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doNextBarcodeNo(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'select c1.id,c1.currentbarcodeno from config c1 where c1.customers_id=$1',
        [
          world.cn.custid
        ],
        function(err, result)
        {
          if (!err)
          {
            if (result.rows.length == 1)
            {
              var id = result.rows[0].id;
              var currentbarcodeno = result.rows[0].currentbarcodeno;
              var nextno = '';

              // Validate and give reasonable default (UPC is 11 digits, first 6 digits are company specific)...
              if (__.isBlank(currentbarcodeno) || __.isNull(currentbarcodeno))
              currentbarcodeno = global.config.barcodes.string;

              nextno = __.incString(currentbarcodeno);

              tx.query
              (
                'update config set currentbarcodeno=$1 where customers_id=$2 and id=$3',
                [
                  nextno,
                  world.cn.custid,
                  id
                ],
                function(err, result)
                {
                  if (!err)
                    resolve({barcodeno: currentbarcodeno});
                  else
                    reject(err);
                }
              );
            }
            else
              reject({message: global.text_unablenextbarcodeno});
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doSaveConfig(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      console.log(__.sanitiseAsBool(world.orderasquote));
      tx.query
      (
        'update ' +
        'config ' +
        'set ' +
        'orderasquote=$1,' +
        'statuses_id=$2,' +
        'inventoryadjustaccounts_id=$3,' +
        'currentorderno=$4,' +
        'currentporderno=$5,' +
        'currentinvoiceno=$6,' +
        'currentjournalno=$7,' +
        'currentclientno=$8,' +
        'currentsupplierno=$9,' +
        'currentempno=$10,' +
        'currentjobsheetno=$11,' +
        'currentbarcodeno=$12,' +
        'inventoryusefifo=$13,' +
        'expressfee=$14,' +
        'defaultinventorylocations_id=$15,' +
        'gstpaidaccounts_id=$16,' +
        'gstcollectedaccounts_id=$17,' +
        'invoiceprinttemplates_id=$18,' +
        'orderprinttemplates_id=$19,' +
        'quoteprinttemplates_id=$20,' +
        'deliverydocketprinttemplates_id=$21,' +
        'araccounts_id=$22,' +
        'apaccounts_id=$23,' +
        'productcostofgoodsaccounts_id=$24,' +
        'productincomeaccounts_id=$25,' +
        'productassetaccounts_id=$26,' +
        'productbuytaxcodes_id=$27,' +
        'productselltaxcodes_id=$28,' +
        'fyearstart=$29,' +
        'fyearend=$30,' +
        'companyname=$31,' +
        'address1=$32,' +
        'address2=$33,' +
        'address3=$34,' +
        'address4=$35,' +
        'city=$36,' +
        'state=$37,' +
        'postcode=$38,' +
        'country=$39,' +
        'bankname=$40,' +
        'bankbsb=$41,' +
        'bankaccountno=$42,' +
        'bankaccountname=$43,' +
        'posclients_id=$44,' +
        'datemodified=now(),' +
        'usersmodified_id=$45 ' +
        'where ' +
        'customers_id=$46',
        [
          __.sanitiseAsBool(world.orderasquote),
          __.sanitiseAsBigInt(world.statusid),
          __.sanitiseAsBigInt(world.inventoryadjustaccountid),
          __.sanitiseAsString(world.currentorderno),
          __.sanitiseAsString(world.currentporderno),
          __.sanitiseAsString(world.currentinvoiceno),
          __.sanitiseAsString(world.currentjournalno),
          __.sanitiseAsString(world.currentclientno),
          __.sanitiseAsString(world.currentsupplierno),
          __.sanitiseAsString(world.currentempno),
          __.sanitiseAsString(world.currentjobsheetno),
          __.sanitiseAsString(world.currentbarcodeno),
          __.sanitiseAsBool(world.inventoryusefifo),
          __.sanitiseAsPrice(world.expressfee),
          __.sanitiseAsBigInt(world.defaultinventorylocationid),
          __.sanitiseAsBigInt(world.gstpaidaccountid),
          __.sanitiseAsBigInt(world.gstcollectedaccountid),
          __.sanitiseAsBigInt(world.invoiceprinttemplateid),
          __.sanitiseAsBigInt(world.orderprinttemplateid),
          __.sanitiseAsBigInt(world.quoteprinttemplateid),
          __.sanitiseAsBigInt(world.deliverydocketprinttemplateid),
          __.sanitiseAsBigInt(world.araccountid),
          __.sanitiseAsBigInt(world.apaccountid),

          __.sanitiseAsBigInt(world.productcostofgoodsaccountid),
          __.sanitiseAsBigInt(world.productincomeaccountid),
          __.sanitiseAsBigInt(world.productassetaccountid),
          __.sanitiseAsBigInt(world.productbuytaxcodeid),
          __.sanitiseAsBigInt(world.productselltaxcodeid),

          __.sanitiseAsDateOnly(world.fyearstart),
          __.sanitiseAsDateOnly(world.fyearend),

          __.sanitiseAsString(world.companyname),
          __.sanitiseAsString(world.address1),
          __.sanitiseAsString(world.address2),
          __.sanitiseAsString(world.address3),
          __.sanitiseAsString(world.address4),
          __.sanitiseAsString(world.city),
          __.sanitiseAsString(world.state),
          __.sanitiseAsString(world.postcode),
          __.sanitiseAsString(world.country),
          __.sanitiseAsString(world.bankname),
          __.sanitiseAsString(world.bankbsb),
          __.sanitiseAsString(world.bankaccountno),
          __.sanitiseAsString(world.bankaccountname),
          __.sanitiseAsBigInt(world.posclientid),
          world.cn.userid,
          world.cn.custid
        ],
        function(err, result)
        {
          if (!err)
            resolve(undefined);
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doSaveEmailTemplates(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      console.log(__.sanitiseAsBool(world.orderasquote));
      tx.query
      (
        'update config set emailordertemplate=$1,emailinvoicetemplate=$2,emailquotetemplate=$3,datemodified=now(),usersmodified_id=$4 where customers_id=$5',
        [
          __.sanitiseAsString(world.emailordertemplate),
          __.sanitiseAsString(world.emailinvoicetemplate),
          __.sanitiseAsString(world.emailquotetemplate),
          world.cn.userid,
          world.cn.custid
        ],
        function(err, result)
        {
          if (!err)
            resolve(undefined);
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doSavePrintTemplate(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'update printtemplates set description=$1,datemodified=now(),usersmodified_id=$2 where customers_id=$3 and id=$4 and dateexpired is null',
        [
          __.sanitiseAsString(world.description),
          world.cn.userid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.printtemplateid)
        ],
        function(err, result)
        {
          if (!err)
          {
            tx.query
            (
              'select p1.datemodified,u1.name from printtemplates p1 left join users u1 on (p1.usersmodified_id=u1.id) where p1.customers_id=$1 and p1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(world.printtemplateid)
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

function doExpirePrintTemplate(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'update printtemplates set dateexpired=now(),usersexpired_id=$1 where customers_id=$2 and id=$3 and dateexpired is null',
        [
          world.cn.userid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.printtemplateid)
        ],
        function(err, result)
        {
          if (!err)
          {
            tx.query
            (
              'select p1.dateexpired,u1.name from printtemplates p1 left join users u1 on (p1.usersexpired_id=u1.id) where p1.customers_id=$1 and p1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(world.printtemplateid)
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

function doGetDefaultWarehouse(world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      global.customers.get
      (
        global.config.redis.custconfig + world.cn.custid,
        function(err, configobj)
        {
          if (!err)
          {
            global.safejsonparse
            (
              configobj,
              function(err, co)
              {
                if (!err)
                  resolve({defaultlocationid: co.defaultinventorylocationid});
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

function doGetCustConfig(world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      global.customers.get
      (
        global.config.redis.custconfig + world.cn.custid,
        function(err, configobj)
        {
          if (!err)
          {
            global.safejsonparse
            (
              configobj,
              function(err, co)
              {
                if (!err)
                  resolve(co);
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
function ListPrintTemplates(world)
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
          'p1.name,' +
          'p1.description,' +
          'p1.mimetype,' +
          'p1.size,' +
          'p1.datecreated,' +
          'p1.datemodified,' +
          'u1.name usercreated,' +
          'u2.name usermodified ' +
          'from ' +
          'printtemplates p1 left join users u1 on (p1.userscreated_id=u1.id) ' +
          '                  left join users u2 on (p1.usersmodified_id=u2.id) ' +
          'where ' +
          'p1.customers_id=$1 ' +
          'and ' +
          'p1.dateexpired is null',
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
                function(p)
                {
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
              global.log.error({listinvoicetemplates: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({listinvoicetemplates: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function SavePrintTemplate(world)
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
              doSavePrintTemplate(tx, world).then
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
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, printtemplateid: world.printtemplateid, dateexpired: result.dateexpired, userexpired: result.userexpired, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'printtemplatesaved', {printtemplateid: world.printtemplateid, dateexpired: result.dateexpired, userexpired: result.userexpired}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({saveprinttemplate: true}, msg);
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
                      global.log.error({saveprinttemplate: true}, msg);
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
              global.log.error({saveprinttemplate: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({saveprinttemplate: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ExpirePrintTemplate(world)
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
              doExpirePrintTemplate(tx, world).then
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
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, printtemplateid: world.printtemplateid, dateexpired: result.dateexpired, userexpired: result.userexpired, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'printtemplateexpired', {printtemplateid: world.printtemplateid, dateexpired: result.dateexpired, userexpired: result.userexpired}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({expireprinttemplate: true}, msg);
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
                      global.log.error({expireprinttemplate: true}, msg);
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
              global.log.error({expireprinttemplate: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({expireprinttemplate: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function LoadConfig(world)
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
          'c1.orderasquote,' +
          'c1.statuses_id statusid,' +
          'c1.inventoryadjustaccounts_id inventoryadjustaccountid,' +
          'c1.currentorderno,' +
          'c1.currentporderno,' +
          'c1.currentinvoiceno,' +
          'c1.currentjournalno,' +
          'c1.currentclientno,' +
          'c1.currentsupplierno,' +
          'c1.currentempno,' +
          'c1.currentjobsheetno,' +
          'c1.currentbarcodeno,' +
          'c1.inventoryusefifo,' +
          'c1.expressfee,' +
          'c1.defaultinventorylocations_id defaultinventorylocationid,' +
          'c1.gstpaidaccounts_id gstpaidaccountid,' +
          'c1.gstcollectedaccounts_id gstcollectedaccountid,' +
          'c1.invoiceprinttemplates_id invoiceprinttemplateid,' +
          'c1.orderprinttemplates_id orderprinttemplateid,' +
          'c1.quoteprinttemplates_id quoteprinttemplateid,' +
          'c1.deliverydocketprinttemplates_id deliverydocketprinttemplateid,' +
          'c1.araccounts_id araccountid,' +
          'c1.apaccounts_id apaccountid,' +
          'c1.productcostofgoodsaccounts_id productcostofgoodsaccountid,' +
          'c1.productincomeaccounts_id productincomeaccountid,' +
          'c1.productassetaccounts_id productassetaccountid,' +
          'c1.productbuytaxcodes_id productbuytaxcodeid,' +
          'c1.productselltaxcodes_id productselltaxcodeid,' +
          'c1.fyearstart,' +
          'c1.fyearend,' +
          'c1.companyname,' +
          'c1.address1,' +
          'c1.address2,' +
          'c1.address3,' +
          'c1.address4,' +
          'c1.city,' +
          'c1.state,' +
          'c1.postcode,' +
          'c1.country,' +
          'c1.bankname,' +
          'c1.bankbsb,' +
          'c1.bankaccountno,' +
          'c1.bankaccountname,' +
          'c1.autosyncbuildtemplates,' +
          'c1.posclients_id posclientid,' +
          'c1.datecreated,' +
          'c1.datemodified,' +
          'u1.name usercreated,' +
          'u2.name usermodified ' +
          'from ' +
          'config c1 left join users u1 on (c1.userscreated_id=u1.id) ' +
          '          left join users u2 on (c1.usersmodified_id=u2.id) ' +
          'where ' +
          'c1.customers_id=$1',
          [
            world.cn.custid
          ],
          function(err, result)
          {
            done();

            if (!err)
            {
              if (result.rows.length == 1)
              {
                if (!__.isUN(result.rows[0].datemodified))
                  config.datemodified = global.moment(result.rows[0].datemodified).format('YYYY-MM-DD HH:mm:ss');

                config.datecreated = global.moment(result.rows[0].datecreated).format('YYYY-MM-DD HH:mm:ss');
              }

              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({loadconfig: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({loadconfig: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function SaveConfig(world)
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
              doSaveConfig(tx, world).then
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
                        global.pr.sendToRoom(global.custchannelprefix + world.cn.custid, 'configsaved', {});

                        // Record relevant changes to cached version...
                        global.customers.get
                        (
                          global.config.redis.custconfig + world.cn.custid,
                          function(err, configobj)
                          {
                            if (!err)
                            {
                              global.safejsonparse
                              (
                                configobj,
                                function(err, co)
                                {
                                  if (!err)
                                  {
                                    global.safejsonstringify
                                    (
                                      {
                                        orderasquote: world.orderasquote,
                                        statusid: world.statusid,
                                        inventoryadjustaccountid: world.inventoryadjustaccountid,
                                        currentorderno: world.currentorderno,
                                        currentporderno: world.currentporderno,
                                        currentinvoiceno: world.currentinvoiceno,
                                        currentjournalno: world.currentjournalno,
                                        currentclientno: world.currentclientno,
                                        currentsupplierno: world.currentsupplierno,
                                        currentempno: world.currentempno,
                                        currentjobsheetno: world.currentjobsheetno,
                                        currentbarcodeno: world.currentbarcodeno,
                                        inventoryusefifo: world.inventoryusefifo,
                                        expressfee: world.expressfee,
                                        defaultinventorylocationid: world.defaultinventorylocationid,
                                        gstpaidaccountid: world.gstpaidaccountid,
                                        gstcollectedaccountid: world.gstcollectedaccountid,
                                        invoiceprinttemplateid: world.invoiceprinttemplateid,
                                        orderprinttemplateid: world.orderprinttemplateid,
                                        quoteprinttemplateid: world.quoteprinttemplateid,
                                        deliverydocketprinttemplateid: world.deliverydocketprinttemplateid,
                                        araccountid: world.araccountid,
                                        apaccountid: world.apaccountid,
                                        productcostofgoodsaccountid: world.productcostofgoodsaccountid,
                                        productincomeaccountid: world.productincomeaccountid,
                                        productassetaccountid: world.productassetaccountid,
                                        productbuytaxcodeid: world.productbuytaxcodeid,
                                        productselltaxcodeid: world.productselltaxcodeid,
                                        fyearstart: world.fyearstart,
                                        fyearend: world.fyearend,
                                        companyname: world.companyname,
                                        address1: world.address1,
                                        address2: world.address2,
                                        address3: world.address3,
                                        address4: world.address4,
                                        city: world.city,
                                        state: world.state,
                                        postcode: world.postcode,
                                        country: world.country,
                                        bankname: world.bankname,
                                        bankbsb: world.bankbsb,
                                        bankaccountno: world.bankaccountno,
                                        bankaccountname: world.bankaccountname,
                                        autosyncbuildtemplates: world.autosyncbuildtemplates,
                                        posclientid: world.posclientid
                                      },
                                      function(err, json)
                                      {
                                        if (!err)
                                          global.customers.set(global.config.redis.custconfig + world.cn.custid, json);
                                      }
                                    );
                                  }
                                }
                              );
                            }
                            else
                            {
                              // Can't get to customer config for some reason...
                              global.log.error({saveconfig: true}, '[SaveConfig] ' + global.text_unablegetcustconfig + ' ' + configobj + ', for custid: ' + world.cn.custid);
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
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({saveconfig: true}, msg);
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
                      global.log.error({saveconfig: true}, msg);
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
              global.log.error({saveconfig: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({saveconfig: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function LoadEmailTemplates(world)
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
        var config= {};

        client.query
        (
          'select ' +
          'c1.emailinvoicetemplate,' +
          'c1.emailordertemplate,' +
          'c1.emailquotetemplate,' +
          'c1.datecreated,' +
          'c1.datemodified,' +
          'u1.name usercreated,' +
          'u2.name usermodified ' +
          'from ' +
          'config c1 left join users u1 on (c1.userscreated_id=u1.id) ' +
          '          left join users u2 on (c1.usersmodified_id=u2.id) ' +
          'where ' +
          'c1.customers_id=$1',
          [
            world.cn.custid
          ],
          function(err, result)
          {
            done();

            if (!err)
            {
              if (result.rows.length == 1)
              {
                config.emailinvoicetemplate = result.rows[0].emailinvoicetemplate;
                config.emailordertemplate = result.rows[0].emailordertemplate;
                config.emailquotetemplate = result.rows[0].emailquotetemplate;

                if (!__.isUN(result.rows[0].datemodified))
                  config.datemodified = global.moment(result.rows[0].datemodified).format('YYYY-MM-DD HH:mm:ss');

                config.datecreated = global.moment(result.rows[0].datecreated).format('YYYY-MM-DD HH:mm:ss');
                config.usercreated = result.rows[0].usercreated;
                config.usermodified = result.rows[0].usermodified;
              }

              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, config: config, pdata: world.pdata});
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({loademailtemplate: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({loademailtemplate: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function SaveEmailTemplates(world)
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
              doSaveEmailTemplates(tx, world).then
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
                            global.log.error({saveconfig: true}, msg);
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
                      global.log.error({saveemailtemplates: true}, msg);
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
              global.log.error({saveemailtemplates: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({saveemailtemplates: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function InitialiseCustomerConfigCache()
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
          'select ' +
          'c1.customers_id custid,' +
          'c1.orderasquote,' +
          'c1.statuses_id statusid,' +
          'c1.inventoryadjustaccounts_id,' +
          'c1.currentorderno,' +
          'c1.currentporderno,' +
          'c1.currentinvoiceno,' +
          'c1.currentjournalno,' +
          'c1.currentclientno,' +
          'c1.currentsupplierno,' +
          'c1.currentempno,' +
          'c1.currentjobsheetno,' +
          'c1.currentbarcodeno,' +
          'c1.inventoryusefifo,' +
          'c1.expressfee,' +
          'c1.defaultinventorylocations_id,' +
          'c1.gstpaidaccounts_id,' +
          'c1.gstcollectedaccounts_id,' +
          'c1.invoiceprinttemplates_id,' +
          'c1.orderprinttemplates_id,' +
          'c1.quoteprinttemplates_id,' +
          'c1.deliverydocketprinttemplates_id,' +
          'c1.araccounts_id,' +
          'c1.apaccounts_id,' +
          'c1.productcostofgoodsaccounts_id,' +
          'c1.productincomeaccounts_id,' +
          'c1.productassetaccounts_id,' +
          'c1.productbuytaxcodes_id,' +
          'c1.productselltaxcodes_id,' +
          'c1.fyearstart,' +
          'c1.fyearend,' +
          'c1.companyname,' +
          'c1.address1,' +
          'c1.address2,' +
          'c1.address3,' +
          'c1.address4,' +
          'c1.city,' +
          'c1.state,' +
          'c1.postcode,' +
          'c1.country,' +
          'c1.bankname,' +
          'c1.bankbsb,' +
          'c1.bankaccountno,' +
          'c1.bankaccountname,' +
          'c1.posclients_id ' +
          'from ' +
          'config c1 ' +
          'where ' +
          'c1.dateexpired is null',
          function(err, result)
          {
            done();

            if (!err)
            {
              result.rows.forEach
              (
                function(c)
                {
                  global.safejsonstringify
                  (
                    {
                      orderasquote: c.orderasquote,
                      statusid: c.statusid,
                      inventoryadjustaccountid: c.inventoryadjustaccounts_id,
                      currentorderno: c.currentorderno,
                      currentporderno: c.currentporderno,
                      currentinvoiceno: c.currentinvoiceno,
                      currentjournalno: c.currentjournalno,
                      currentclientno: c.currentclientno,
                      currentsupplierno: c.currentsupplierno,
                      currentempno: c.currentempno,
                      currentjobsheetno: c.currentjobsheetno,
                      currentbarcodeno: c.currentbarcodeno,
                      inventoryusefifo: c.inventoryusefifo,
                      expressfee: c.expressfee,
                      defaultinventorylocationid: c.defaultinventorylocations_id,
                      gstpaidaccountid: c.gstpaidaccounts_id,
                      gstcollectedaccountid: c.gstcollectedaccounts_id,
                      invoiceprinttemplateid: c.invoiceprinttemplates_id,
                      orderprinttemplateid: c.orderprinttemplates_id,
                      quoteprinttemplateid: c.quoteprinttemplates_id,
                      deliverydocketprinttemplateid: c.deliverydocketprinttemplates_id,
                      araccountid: c.araccounts_id,
                      apaccountid: c.apaccounts_id,
                      productcostofgoodsaccountid: c.productcostofgoodsaccounts_id,
                      productincomeaccountid: c.productincomeaccounts_id,
                      productassetaccountid: c.productassetaccounts_id,
                      productbuytaxcodeid: c.productbuytaxcodes_id,
                      productselltaxcodeid: c.productselltaxcodes_id,
                      fyearstart: c.fyearstart,
                      fyearend: c.fyearend,
                      companyname: c.companyname,
                      address1: c.address1,
                      address2: c.address2,
                      address3: c.address3,
                      address4: c.address4,
                      city: c.city,
                      state: c.state,
                      postcode: c.postcode,
                      country: c.country,
                      bankname: c.bankname,
                      bankbsb: c.bankbsb,
                      bankaccountno: c.bankaccountno,
                      bankaccountname: c.bankaccountname,
                      posclientid: c.posclients_id
                    },
                    function(err, json)
                    {
                      if (!err)
                        global.customers.set(global.config.redis.custconfig + c.custid, json);
                    }
                  );
                }
              );
            }
            else
              global.log.error({initialisecustomerconfigcache: true}, global.text_generalexception + ' ' + err.message);
          }
        );
      }
      else
        global.log.error({initialisecustomerconfigcache: true}, global.text_nodbconnection);
    }
  );
}

// *******************************************************************************************************************************************************************************************
// Internal functions
module.exports.doNextOrderNo = doNextOrderNo;
module.exports.doNextPOrderNo = doNextPOrderNo;
module.exports.doNextInvoiceNo = doNextInvoiceNo;
module.exports.doNextJournalNo = doNextJournalNo;
module.exports.doNextClientNo = doNextClientNo;
module.exports.doNextSupplierNo = doNextSupplierNo;
module.exports.doNextEmpNo = doNextEmpNo;
module.exports.doNextJobSheetNo = doNextJobSheetNo;
module.exports.doNextBarcodeNo = doNextBarcodeNo;

module.exports.newPrintTemplate = newPrintTemplate;
module.exports.savePrintTemplate = savePrintTemplate;
module.exports.existingPrintTemplate = existingPrintTemplate;
module.exports.doGetDefaultWarehouse = doGetDefaultWarehouse;
module.exports.doGetCustConfig = doGetCustConfig;

// *******************************************************************************************************************************************************************************************
// Public functions
module.exports.LoadConfig = LoadConfig;
module.exports.SaveConfig = SaveConfig;

module.exports.LoadEmailTemplates = LoadEmailTemplates;
module.exports.SaveEmailTemplates = SaveEmailTemplates;

module.exports.ListPrintTemplates = ListPrintTemplates;
module.exports.SavePrintTemplate = SavePrintTemplate;
module.exports.ExpirePrintTemplate = ExpirePrintTemplate;

module.exports.InitialiseCustomerConfigCache = InitialiseCustomerConfigCache;
