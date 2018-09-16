// *******************************************************************************************************************************************************************************************
// Internal functions
function existingSupplierAttachment(args, callback)
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
                      'c1.clients_id supplierid,' +
                      'c1.name,' +
                      'c1.size ' +
                      'from ' +
                      'clientattachments c1 ' +
                      'where ' +
                      'c1.customers_id=$1 ' +
                      'and ' +
                      'c1.id=$2',
                      [
                        uo.custid,
                        args.supplierattachmentid
                      ],
                      function(err, result)
                      {
                        done();

                        if (!err)
                          callback(null, {supplierid: result.rows[0].supplierid, name: result.rows[0].name, size: result.rows[0].size});
                        else
                        {
                          global.log.error({existingsupplierattachment: true}, global.text_generalexception + ' ' + err.message);
                          callback(err, null);
                        }
                      }
                    );
                  }
                  else
                  {
                    global.log.error({existingsupplierattachment: true}, global.text_nodbconnection);
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

function newSupplierAttachment(args, callback)
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
                            'insert into clientattachments (customers_id,clients_id,name,description,mimetype,size,userscreated_id) values ($1,$2,$3,$4,$5,$6,$7) returning id',
                            [
                              uo.custid,
                              args.supplierid,
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
                                        var supplierattachmentid = result.rows[0].id;
                                        //
                                        callback(null, supplierattachmentid);
                                        global.pr.sendToRoom(global.custchannelprefix + uo.custid, 'supplierattachmentcreated', {supplierid: args.supplierid, supplierattachmentid: supplierattachmentid});
                                      }
                                    }
                                    else
                                    {
                                      tx.rollback
                                      (
                                        function(ignore)
                                        {
                                          done();
                                          global.log.error({newsupplierattachment: true}, global.text_committx + ' ' + err.message);
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
                                    global.log.error({newsupplierattachment: true}, global.text_dbexception + ' ' + err.message);
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
                              global.log.error({newsupplierattachment: true}, global.text_unablegetidfromuuid + ' ' + err.message);
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
                        global.log.error({newsupplierattachment: true}, global.text_unablegetidfromuuid + ' ' + err.message);
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
              global.log.error({newsupplierattachment: true}, msg);
            }
          }
        );
      }
      else
        global.log.error({newsupplierattachment: true}, global.text_nodbconnection);
    }
  );
}

function doNewSupplier(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'insert into clients (customers_id,clients_id,code,name,url1,email1,phone1,fax1,contact1,address1,address2,address3,address4,city,state,postcode,country,contact2,shipaddress1,shipaddress2,shipaddress3,shipaddress4,shipcity,shipstate,shippostcode,shipcountry,bankname,bankbsb,bankaccountno,bankaccountname,dayscredit,linelimit,orderlimit,creditlimit,invoicetemplates_id,ordertemplates_id,quotetemplates_id,deliverydockettemplates_id,labeltemplates_id,costofgoodsaccounts_id,incomeaccounts_id,expenseaccounts_id,assetaccounts_id,isactive,isclient,issupplier,acn,abn,hscode,custcode1,custcode2,userscreated_id) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38,$39,$40,$41,$42,$43,$44,$45,$46,$47,$48,$49,$50,$51,$52) returning id',
        [
          world.cn.custid,
          __.sanitiseAsBigInt(world.parentid),
          __.sanitiseAsString(world.code, 50),
          __.sanitiseAsString(world.name, 50),
          __.sanitiseAsString(world.url1),
          __.sanitiseAsString(world.email1),
          __.sanitiseAsString(world.phone1),
          __.sanitiseAsString(world.fax1),
          __.sanitiseAsString(world.contact1),
          __.sanitiseAsString(world.address1),
          __.sanitiseAsString(world.address2),
          __.sanitiseAsString(world.address3),
          __.sanitiseAsString(world.address4),
          __.sanitiseAsString(world.city),
          __.sanitiseAsString(world.state),
          __.sanitiseAsString(world.postcode),
          __.sanitiseAsString(world.country),
          __.sanitiseAsString(world.contact2),
          __.sanitiseAsString(world.shipaddress1),
          __.sanitiseAsString(world.shipaddress2),
          __.sanitiseAsString(world.shipaddress3),
          __.sanitiseAsString(world.shipaddress4),
          __.sanitiseAsString(world.shipcity),
          __.sanitiseAsString(world.shipstate),
          __.sanitiseAsString(world.shippostcode),
          __.sanitiseAsString(world.shipcountry),
          __.sanitiseAsString(world.bankname),
          __.sanitiseAsString(world.bankbsb),
          __.sanitiseAsString(world.bankaccountno),
          __.sanitiseAsString(world.bankaccountname),
          __.sanitiseAsBigInt(world.dayscredit, true),
          __.notNullNumeric(world.linelimit),
          __.notNullNumeric(world.orderlimit),
          __.notNullNumeric(world.creditlimit),
          __.sanitiseAsBigInt(world.invoicetemplateid),
          __.sanitiseAsBigInt(world.ordertemplateid),
          __.sanitiseAsBigInt(world.quotetemplateid),
          __.sanitiseAsBigInt(world.deliverydockettemplateid),
          __.sanitiseAsBigInt(world.labeltemplateid),
          __.sanitiseAsBigInt(world.costofgoodsaccountid),
          __.sanitiseAsBigInt(world.incomeaccountid),
          __.sanitiseAsBigInt(world.expenseaccountid),
          __.sanitiseAsBigInt(world.assetaccountid),
          __.sanitiseAsBool(world.isactive),
          __.sanitiseAsBool(0),
          __.sanitiseAsBool(1),
          __.sanitiseAsString(world.acn),
          __.sanitiseAsString(world.abn),
          __.sanitiseAsString(world.hscode),
          __.sanitiseAsString(world.custcode1),
          __.sanitiseAsString(world.custcode2),
          world.cn.userid
        ],
        function(err, result)
        {
          if (!err)
          {
            var supplierid = result.rows[0].id;

            tx.query
            (
              'select c1.datecreated,u1.name usercreated from clients c1 left join users u1 on (c1.userscreated_id=u1.id) where c1.customers_id=$1 and c1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(supplierid)
              ],
              function(err, result)
              {
                if (!err)
                {
                  var c = result.rows[0];

                  resolve
                  (
                    {
                      supplierid: supplierid,
                      datecreated: global.moment(c.datecreated).format('YYYY-MM-DD HH:mm:ss'),
                      usercreated: c.usercreated
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

function doSaveSupplier(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'update ' +
        'clients ' +
        'set ' +
        'code=$1,' +
        'name=$2,' +
        'url1=$3,' +
        'email1=$4,' +
        'phone1=$5,' +
        'fax1=$6,' +
        'contact1=$7,' +
        'address1=$8,' +
        'address2=$9,' +
        'address3=$10,' +
        'address4=$11,' +
        'city=$12,' +
        'state=$13,' +
        'postcode=$14,' +
        'country=$15,' +
        'contact2=$16,' +
        'shipaddress1=$17,' +
        'shipaddress2=$18,' +
        'shipaddress3=$19,' +
        'shipaddress4=$20,' +
        'shipcity=$21,' +
        'shipstate=$22,' +
        'shippostcode=$23,' +
        'shipcountry=$24,' +
        'bankname=$25,' +
        'bankbsb=$26,' +
        'bankaccountno=$27,' +
        'bankaccountname=$28,' +
        'dayscredit=$29,' +
        'linelimit=$30,' +
        'orderlimit=$31,' +
        'creditlimit=$32,' +
        'invoicetemplates_id=$33,' +
        'ordertemplates_id=$34,' +
        'quotetemplates_id=$35,' +
        'deliverydockettemplates_id=$36,' +
        'labeltemplates_id=$37,' +
        'costofgoodsaccounts_id=$38,' +
        'incomeaccounts_id=$39,' +
        'expenseaccounts_id=$40,' +
        'assetaccounts_id=$41,' +
        'isactive=$42,' +
        'acn=$43,' +
        'abn=$44,' +
        'hscode=$45,' +
        'custcode1=$46,' +
        'custcode2=$47,' +
        'datemodified=now(),' +
        'usersmodified_id=$48 ' +
        'where ' +
        'customers_id=$49 ' +
        'and ' +
        'id=$50 ' +
        'and ' +
        'dateexpired is null',
        [
          __.sanitiseAsString(world.code),
          __.sanitiseAsString(world.name),
          __.sanitiseAsString(world.url1),
          __.sanitiseAsString(world.email1),
          __.sanitiseAsString(world.phone1),
          __.sanitiseAsString(world.fax1),
          __.sanitiseAsString(world.contact1),
          __.sanitiseAsString(world.address1),
          __.sanitiseAsString(world.address2),
          __.sanitiseAsString(world.address3),
          __.sanitiseAsString(world.address4),
          __.sanitiseAsString(world.city),
          __.sanitiseAsString(world.state),
          __.sanitiseAsString(world.postcode),
          __.sanitiseAsString(world.country),
          __.sanitiseAsString(world.contact2),
          __.sanitiseAsString(world.shipaddress1),
          __.sanitiseAsString(world.shipaddress2),
          __.sanitiseAsString(world.shipaddress3),
          __.sanitiseAsString(world.shipaddress4),
          __.sanitiseAsString(world.shipcity),
          __.sanitiseAsString(world.shipstate),
          __.sanitiseAsString(world.shippostcode),
          __.sanitiseAsString(world.shipcountry),
          __.sanitiseAsString(world.bankname),
          __.sanitiseAsString(world.bankbsb),
          __.sanitiseAsString(world.bankaccountno),
          __.sanitiseAsString(world.bankaccountname),
          world.dayscredit,
          __.notNullNumeric(world.linelimit),
          __.notNullNumeric(world.orderlimit),
          __.notNullNumeric(world.creditlimit),
          __.sanitiseAsBigInt(world.invoicetemplateid),
          __.sanitiseAsBigInt(world.ordertemplateid),
          __.sanitiseAsBigInt(world.quotetemplateid),
          __.sanitiseAsBigInt(world.deliverydockettemplateid),
          __.sanitiseAsBigInt(world.labeltemplateid),
          __.sanitiseAsBigInt(world.costofgoodsaccountid),
          __.sanitiseAsBigInt(world.incomeaccountid),
          __.sanitiseAsBigInt(world.expenseaccountid),
          __.sanitiseAsBigInt(world.assetaccountid),
          __.sanitiseAsBool(world.isactive),
          __.sanitiseAsString(world.acn),
          __.sanitiseAsString(world.abn),
          __.sanitiseAsString(world.hscode),
          __.sanitiseAsString(world.custcode1),
          __.sanitiseAsString(world.custcode2),
          world.cn.userid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.supplierid)
        ],
        function(err, result)
        {
          if (!err)
          {
            tx.query
            (
              'select c1.datemodified,u1.name from clients c1 left join users u1 on (c1.usersmodified_id=u1.id) where c1.customers_id=$1 and c1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(world.supplierid)
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

function doChangeSupplierParent(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'update clients set clients_id=$1,datemodified=now(),usersmodified_id=$2 where customers_id=$3 and id=$4',
        [
          __.sanitiseAsBigInt(world.parentid),
          world.cn.userid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.supplierid)
        ],
        function(err, result)
        {
          if (!err)
          {
            tx.query
            (
              'select c1.datemodified,u1.name from clients c1 left join users u1 on (c1.usersmodified_id=u1.id) where c1.customers_id=$1 and c1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(world.supplierid)
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

function doExpireSupplierStep1(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      if (!world.cascade)
      {
        tx.query
        (
          'select c1.clients_id supplierid from clients c1 where c1.customers_id=$1 and c1.id=$2 and c1.dateexpired is null',
          [
            world.cn.custid,
            __.sanitiseAsBigInt(world.supplierid)
          ],
          function(err, result)
          {
            if (!err)
            {
              if (result.rows.length == 1)
              {
                var parentid = result.rows[0].supplierid;

                tx.query
                (
                  'update clients set clients_id=$1,datemodified=now(),usersmodified_id=$2 where customers_id=$3 and clients_id=$4 and dateexpired is null',
                  [
                    parentid,
                    world.cn.userid,
                    world.cn.custid,
                    __.sanitiseAsBigInt(world.supplierid)
                  ],
                  function(err, result)
                  {
                    if (!err)
                      resolve({supplierid: world.supplierid});
                    else
                      reject(err);
                  }
                );
              }
              else
                reject({message: global.text_unableexpireclient});
            }
            else
              reject(err);
          }
        );
      }
      else
        resolve({supplierid: world.supplierid});
    }
  );
  return promise;
}

function doExpireSupplierStep2(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'update clients set dateexpired=now(),usersexpired_id=$1 where customers_id=$2 and id=$3 and dateexpired is null',
        [
          world.cn.userid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.supplierid)
        ],
        function(err, result)
        {
          if (!err)
          {
            tx.query
            (
              'select c1.dateexpired,u1.name from clients c1 left join users u1 on (c1.usersexpired_id=u1.id) where c1.customers_id=$1 and c1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(world.supplierid)
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

function doNewSupplierNote(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'insert into clientnotes (customers_id,clients_id,userscreated_id) values ($1,$2,$3) returning id',
        [
          world.cn.custid,
          __.sanitiseAsBigInt(world.supplierid),
          world.cn.userid
        ],
        function(err, result)
        {
          if (!err)
          {
            var suppliernoteid = result.rows[0].id;

            tx.query
            (
              'select cn1.datecreated,u1.name usercreated from clientnotes cn1 left join users u1 on (cn1.userscreated_id=u1.id) where cn1.customers_id=$1 and cn1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(suppliernoteid)
              ],
              function(err, result)
              {
                if (!err)
                {
                  var cn = result.rows[0];

                  resolve
                  (
                    {
                      suppliernoteid: suppliernoteid,
                      datecreated: global.moment(cn.datecreated).format('YYYY-MM-DD HH:mm:ss'),
                      usercreated: cn.usercreated
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

function doSaveSupplierNote(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'update clientnotes set notes=$1,datemodified=now(),usersmodified_id=$2 where customers_id=$3 and id=$4 and dateexpired is null',
        [
          __.escapeHTML(world.notes),
          world.cn.userid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.suppliernoteid)
        ],
        function(err, result)
        {
          if (!err)
          {
            tx.query
            (
              'select cn1.clients_id supplierid,cn1.datemodified,u1.name from clientnotes cn1 left join users u1 on (cn1.usersmodified_id=u1.id) where cn1.customers_id=$1 and cn1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(world.suppliernoteid)
              ],
              function(err, result)
              {
                if (!err)
                  resolve({supplierid: result.rows[0].supplierid, datemodified: global.moment(result.rows[0].datemodified).format('YYYY-MM-DD HH:mm:ss'), usermodified: result.rows[0].name});
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

function doSaveSupplierAttachment(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'update clientattachments set description=$1,datemodified=now(),usersmodified_id=$2 where customers_id=$3 and id=$4 and dateexpired is null',
        [
          __.sanitiseAsString(world.description),
          world.cn.userid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.supplierattachmentid)
        ],
        function(err, result)
        {
          if (!err)
          {
            tx.query
            (
              'select a1.clients_id supplierid,a1.datemodified,u1.name from clientattachments a1 left join users u1 on (a1.usersmodified_id=u1.id) where a1.customers_id=$1 and a1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(world.supplierattachmentid)
              ],
              function(err, result)
              {
                if (!err)
                  resolve({supplierid: result.rows[0].supplierid, datemodified: global.moment(result.rows[0].datemodified).format('YYYY-MM-DD HH:mm:ss'), usermodified: result.rows[0].name});
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

function doExpireSupplierAttachment(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'update clientattachments set dateexpired=now(),usersexpired_id=$1 where customers_id=$2 and id=$3 and dateexpired is null',
        [
          world.cn.userid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.supplierattachmentid)
        ],
        function(err, result)
        {
          if (!err)
          {
            tx.query
            (
              'select a1.clients_id supplierid,a1.dateexpired,u1.name from clientattachments a1 left join users u1 on (a1.usersexpired_id=u1.id) where a1.customers_id=$1 and a1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(world.supplierattachmentid)
              ],
              function(err, result)
              {
                if (!err)
                  resolve({supplierid: result.rows[0].supplierid, dateexpired: global.moment(result.rows[0].dateexpired).format('YYYY-MM-DD HH:mm:ss'), userexpired: result.rows[0].name});
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

function getSupplierAccounts(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'select c1.costofgoodsaccounts_id,c1.incomeaccounts_id incomeaccountid,c1.expenseaccounts_id expenseaccountid,c1.assetaccounts_id assetaccountid from clients c1 where c1.customers_id=$1 and c1.id=$2',
        [
          world.cn.custid,
          __.sanitiseAsBigInt(world.supplierid)
        ],
        function(err, result)
        {
          if (!err)
            resolve({costofgoodsaccountid: result.rows[0].costofgoodsaccounts_id, incomeaccountid: result.rows[0].incomeaccounts_id, expenseaccountid: result.rows[0].expenseaccounts_id, assetaccountid: result.rows[0].assetaccounts_id});
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
function LoadSupplier(world)
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
          'c1.id,' +
          'c1.code,' +
          'c1.name,' +
          'c1.url1,' +
          'c1.email1,' +
          'c1.phone1,' +
          'c1.fax1,' +
          'c1.contact1,' +
          'c1.address1,' +
          'c1.address2,' +
          'c1.address3,' +
          'c1.address4,' +
          'c1.city,' +
          'c1.state,' +
          'c1.postcode,' +
          'c1.country,' +
          'c1.contact2,' +
          'c1.shipaddress1,' +
          'c1.shipaddress2,' +
          'c1.shipaddress3,' +
          'c1.shipaddress4,' +
          'c1.shipcity,' +
          'c1.shipstate,' +
          'c1.shippostcode,' +
          'c1.shipcountry,' +
          'c1.bankname,' +
          'c1.bankbsb,' +
          'c1.bankaccountno,' +
          'c1.bankaccountname,' +
          'c1.isclient,' +
          'c1.dayscredit,' +
          'c1.orderlimit,' +
          'c1.creditlimit,' +
          'c1.costofgoodsaccounts_id costofgoodsaccountid,' +
          'c1.incomeaccounts_id incomeaccountid,' +
          'c1.expenseaccounts_id expenseaccountid,' +
          'c1.assetaccounts_id assetaccountid,' +
          'c1.acn,' +
          'c1.abn,' +
          'c1.hscode,' +
          'c1.custcode1,' +
          'c1.custcode2,' +
          'c1.isactive,' +
          'c1.isclient,' +
          'c1.datecreated,' +
          'c1.datemodified,' +
          'c2.id parentid,' +
          'c2.code parentcode,' +
          'c2.name parentname,' +
          'u1.name usercreated,' +
          'u2.name usermodified ' +
          'from ' +
          'clients c1 left join clients c2 on (c1.clients_id=c2.id) ' +
          '           left join users u1 on (c1.userscreated_id=u1.id) ' +
          '           left join users u2 on (c1.usersmodified_id=u2.id) ' +
          'where ' +
          'c1.customers_id=$1 ' +
          'and ' +
          'c1.issupplier=1 ' +
          'and ' +
          'c1.id=$2',
          [
            world.cn.custid,
            __.sanitiseAsBigInt(world.supplierid)
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
                  console.log(c);
                  if (!__.isUN(c.datemodified) )
                    c.datemodified = global.moment(c.datemodified).format('YYYY-MM-DD HH:mm:ss');

                  c.datecreated = global.moment(c.datecreated).format('YYYY-MM-DD HH:mm:ss');
                }
              );

              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, supplier: result.rows[0], pdata: world.pdata});
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({loadsupplier: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({loadsupplier: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ListSuppliers(world)
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
        var clause = __.isUN(world.showinactive) || (world.showinactive == 0) || (world.showinactive == '0') || !world.showinactive ? 'and c1.isactive=1 ' : '';

        client.query
        (
          'select ' +
          'c1.id,' +
          'c1.code,' +
          'c1.name,' +
          // 'c1.url1,' +
          // 'c1.email1,' +
          // 'c1.phone1,' +
          // 'c1.fax1,' +
          // 'c1.contact1,' +
          // 'c1.address1,' +
          // 'c1.city,' +
          // 'c1.state,' +
          // 'c1.postcode,' +
          // 'c1.country,' +
          // 'c1.contact2,' +
          // 'c1.shipaddress1,' +
          // 'c1.shipcity,' +
          // 'c1.shipstate,' +
          // 'c1.shippostcode,' +
          // 'c1.shipcountry,' +
          // 'c1.bankname,' +
          // 'c1.bankbsb,' +
          // 'c1.bankaccountno,' +
          // 'c1.bankaccountname,' +
          // 'c1.isclient,' +
          // 'c1.dayscredit,' +
          // 'c1.orderlimit,' +
          // 'c1.creditlimit,' +
          // 'c1.acn,' +
          // 'c1.abn,' +
          'c1.isactive,' +
          'c1.isclient,' +
          'c1.datecreated,' +
          'c1.datemodified,' +
          'c2.id parentid,' +
          'c2.code parentcode,' +
          'c2.name parentname,' +
          'u1.name usercreated,' +
          'u2.name usermodified ' +
          'from ' +
          'clients c1 left join clients c2 on (c1.clients_id=c2.id) ' +
          '           left join users u1 on (c1.userscreated_id=u1.id) ' +
          '           left join users u2 on (c1.usersmodified_id=u2.id) ' +
          'where ' +
          'c1.customers_id=$1 ' +
          clause +
          'and ' +
          'c1.issupplier=1 ' +
          'and ' +
          'c1.dateexpired is null ' +
          'order by ' +
          'c1.path,' +
          'c2.id desc,' +
          'c1.name',
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
                function(c)
                {
                  if (!__.isUN(c.datemodified))
                    c.datemodified = global.moment(c.datemodified).format('YYYY-MM-DD HH:mm:ss');

                  c.datecreated = global.moment(c.datecreated).format('YYYY-MM-DD HH:mm:ss');
                }
              );

              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({listsuppliers: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({listsuppliers: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function NewSupplier(world)
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
              global.modhelpers.NewUniqueCode(tx, world.cn.custid).then
              (
                function(newcode)
                {
                  world.newcode = newcode;
                  return doNewSupplier(tx, world);
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
                            supplierid: result.supplierid,
                            datecreated: result.datecreated,
                            usercreated: result.usercreated,
                            pdata: world.pdata
                          }
                        );
                        global.pr.sendToRoomExcept
                        (
                          global.custchannelprefix + world.cn.custid,
                          'suppliercreated',
                          {
                            supplierid: result.supplierid,
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
                            global.log.error({newsupplier: true}, msg);
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
                      global.log.error({newsupplier: true}, msg);
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
              global.log.error({newsupplier: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({newsupplier: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function SaveSupplier(world)
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
              doSaveSupplier(tx, world).then
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
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, supplierid: world.supplierid, datemodified: result.datemodified, usermodified: result.usermodified, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'suppliersaved', {supplierid: world.supplierid, datemodified: result.datemodified, usermodified: result.usermodified}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({savesupplier: true}, msg);
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
                      global.log.error({savesupplier: true}, msg);
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
              global.log.error({savesupplier: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({savesupplier: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ChangeSupplierParent(world)
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
              doChangeSupplierParent(tx, world).then
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
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, supplierid: world.supplierid, parentid: world.parentid, datemodified: result.datemodified, usermodified: result.usermodified, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'supplierparentchanged', {supplierid: world.supplierid, parentid: world.parentid, datemodified: result.datemodified, usermodified: result.usermodified}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({changesupplierparent: true}, msg);
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
                      global.log.error({changesupplierparent: true}, msg);
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
              global.log.error({changesupplierparent: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({changesupplierparent: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ExpireSupplier(world)
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
              // If cascade is true, we just expire this client and trigger will expire all children...
              // Otherwise...
              // First find parent of this client (which could be null if no parent)
              // Set that as new parent of immediate children - their subschildren will be updated by triggers
              // Finally expire this client
              //
              // Note if we expire this client first, children and subschildren will autoexpire by the triggers
              doExpireSupplierStep1(tx, world).then
              (
                function(ignore)
                {
                  return doExpireSupplierStep2(tx, world);
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
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, supplierid: world.supplierid, dateexpired: result.dateexpired, userexpired: result.userexpired, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'supplierexpired', {supplierid: world.supplierid, dateexpired: result.dateexpired, userexpired: result.userexpired}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({expiresupplier: true}, msg);
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
                      global.log.error({expiresupplier: true}, msg);
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
              global.log.error({expiresupplier: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({expiresupplier: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function CheckSupplierCode(world)
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

        if (!__.isNull(world.supplierid))
        {
          clause = ' and c1.id!=$3';
          binds.push(world.supplierid);
        }

        client.query
        (
          'select ' +
          'c1.id,' +
          'c1.code,' +
          'c1.name ' +
          'from ' +
          'clients c1 ' +
          'where ' +
          'c1.customers_id=$1 ' +
          'and ' +
          'c1.dateexpired is null ' +
          'and ' +
          'upper(c1.code)=upper($2)' +
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
              global.log.error({checksuppliercode: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({checksuppliercode: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ListEmails(world)
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
          'c1.email1 email,' +
          'c1.name ' +
          'from ' +
          'clients c1 ' +
          'where ' +
          'c1.email1 is not null ' +
          'and ' +
          'c1.customers_id=$1 ' +
          'and ' +
          'c1.issupplier=1 ' +
          'and ' +
          'c1.email1!=\'\' ' +
          'and ' +
          'c1.dateexpired is null ' +
          'union ' +
          'select ' +
          'c2.email2 email,' +
          'c2.name ' +
          'from ' +
          'clients c2 ' +
          'where ' +
          'c2.email2 is not null ' +
          'and ' +
          'c2.customers_id=$2 ' +
          'and ' +
          'c2.email2!=\'\' ' +
          'and ' +
          'c2.dateexpired is null ' +
          'order by ' +
          'name,' +
          'email',
          [
            world.cn.custid,
            world.cn.custid
          ],
          function(err, result)
          {
            done();

            if (!err)
            {
              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({listemails: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({listemails: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ListSupplierNotes(world)
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
          'cn1.id,' +
          'cn1.notes,' +
          'cn1.datecreated,' +
          'cn1.datemodified,' +
          'u1.name usercreated,' +
          'u2.name usermodified ' +
          'from ' +
          'clientnotes cn1 left join users u1 on (cn1.userscreated_id=u1.id) ' +
          '                left join users u2 on (cn1.usersmodified_id=u2.id) ' +
          'where ' +
          'cn1.customers_id=$1 ' +
          'and ' +
          'cn1.clients_id=$2 ' +
          'and ' +
          'cn1.dateexpired is null ' +
          'order by ' +
          'cn1.datecreated desc',
          [
            world.cn.custid,
            __.sanitiseAsBigInt(world.supplierid)
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
                  if (!__.isUN(p.notes))
                    p.notes = __.unescapeHTML(p.notes);

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
              global.log.error({listsuppliernotes: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({listsuppliernotes: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function NewSupplierNote(world)
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
              doNewSupplierNote(tx, world).then
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
                            supplierid: world.supplierid,
                            suppliernoteid: result.suppliernoteid,
                            datecreated: result.datecreated,
                            usercreated: result.usercreated,
                            pdata: world.pdata
                          }
                        );
                        global.pr.sendToRoomExcept
                        (
                          global.custchannelprefix + world.cn.custid,
                          'suppliernotecreated',
                          {
                            supplierid: world.supplierid,
                            suppliernoteid: result.suppliernoteid,
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
                            global.log.error({newsuppliernote: true}, msg);
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
                      global.log.error({newsuppliernote: true}, msg);
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
              global.log.error({newsuppliernote: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({newsuppliernote: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function SaveSupplierNote(world)
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
              doSaveSupplierNote(tx, world).then
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
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, supplierid: result.supplierid, suppliernoteid: world.suppliernoteid, datemodified: result.datemodified, usermodified: result.usermodified, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'suppliernotesaved', {supplierid: result.supplierid, suppliernoteid: world.suppliernoteid, datemodified: result.datemodified, usermodified: result.usermodified}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({savesuppliernote: true}, msg);
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
                      global.log.error({savesuppliernote: true}, msg);
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
              global.log.error({savesuppliernote: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({savesuppliernote: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ListSupplierAttachments(world)
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
          'ca1.id,' +
          'ca1.name,' +
          'ca1.description,' +
          'ca1.mimetype,' +
          'ca1.size,' +
          'ca1.datecreated,' +
          'ca1.datemodified,' +
          'u1.name usercreated,' +
          'u2.name usermodified ' +
          'from ' +
          'clientattachments ca1 left join users u1 on (ca1.userscreated_id=u1.id) ' +
          '                      left join users u2 on (ca1.usersmodified_id=u2.id) ' +
          'where ' +
          'ca1.customers_id=$1 ' +
          'and ' +
          'ca1.clients_id=$2 ' +
          'and ' +
          'ca1.dateexpired is null ' +
          'order by ' +
          'ca1.datecreated desc',
          [
            world.cn.custid,
            __.sanitiseAsBigInt(world.supplierid)
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

                  if (global.isMimeTypeImage(p.mimetype))
                    p.image = global.config.folders.clientattachments + p.id + '_' + world.supplierid + '_' + p.name;
                }
              );

              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({listsupplierattachments: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({listsupplierattachments: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function SaveSupplierAttachment(world)
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
              doSaveSupplierAttachment(tx, world).then
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
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, supplierid: result.supplierid, supplierattachmentid: world.supplierattachmentid, dateexpired: result.dateexpired, userexpired: result.userexpired, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'supplierattachmentsaved', {supplierid: result.supplierid, supplierattachmentid: world.supplierattachmentid, dateexpired: result.dateexpired, userexpired: result.userexpired}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({savesupplierattachment: true}, msg);
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
                      global.log.error({savesupplierattachment: true}, msg);
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
              global.log.error({savesupplierattachment: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({savesupplierattachment: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ExpireSupplierAttachment(world)
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
              doExpireSupplierAttachment(tx, world).then
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
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, supplierattachmentid: world.supplierattachmentid, supplierid: result.supplierid, dateexpired: result.dateexpired, userexpired: result.userexpired, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'supplierattachmentexpired', {supplierattachmentid: world.supplierattachmentid, supplierid: result.supplierid, dateexpired: result.dateexpired, userexpired: result.userexpired}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({expiresupplierattachment: true}, msg);
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
                      global.log.error({expiresupplierattachment: true}, msg);
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
              global.log.error({expiresupplierattachment: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({expiresupplierattachment: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

// *******************************************************************************************************************************************************************************************
// Internal functions
module.exports.newSupplierAttachment = newSupplierAttachment;
module.exports.existingSupplierAttachment = existingSupplierAttachment;
module.exports.getSupplierAccounts = getSupplierAccounts;

// *******************************************************************************************************************************************************************************************
// Public functions
module.exports.LoadSupplier = LoadSupplier;
module.exports.ListSuppliers = ListSuppliers;
module.exports.NewSupplier = NewSupplier;
module.exports.SaveSupplier = SaveSupplier;
module.exports.ChangeSupplierParent = ChangeSupplierParent;
module.exports.ExpireSupplier = ExpireSupplier;
module.exports.ListEmails = ListEmails;
module.exports.CheckSupplierCode = CheckSupplierCode;

module.exports.ListSupplierNotes = ListSupplierNotes;
module.exports.NewSupplierNote = NewSupplierNote;
module.exports.SaveSupplierNote = SaveSupplierNote;

module.exports.ListSupplierAttachments = ListSupplierAttachments;
module.exports.SaveSupplierAttachment = SaveSupplierAttachment;
module.exports.ExpireSupplierAttachment = ExpireSupplierAttachment;

