// *******************************************************************************************************************************************************************************************
// Internal functions
function existingClientAttachment(args, callback)
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
                      'c1.clients_id clientid,' +
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
                        args.clientattachmentid
                      ],
                      function(err, result)
                      {
                        done();

                        if (!err)
                          callback(null, {clientid: result.rows[0].clientid, name: result.rows[0].name, size: result.rows[0].size});
                        else
                        {
                          global.log.error({existingclientattachment: true}, global.text_generalexception + ' ' + err.message);
                          callback(err, null);
                        }
                      }
                    );
                  }
                  else
                  {
                    global.log.error({existingclientattachment: true}, global.text_nodbconnection);
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

function newClientAttachment(args, callback)
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
                              args.clientid,
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
                                        var clientattachmentid = result.rows[0].id;
                                        //
                                        callback(null, clientattachmentid);
                                        global.pr.sendToRoom(global.custchannelprefix + uo.custid, 'clientattachmentcreated', {clientid: args.clientid, clientattachmentid: clientattachmentid});
                                      }
                                    }
                                    else
                                    {
                                      tx.rollback
                                      (
                                        function(ignore)
                                        {
                                          done();
                                          global.log.error({newclientattachment: true}, global.text_committx + ' ' + err.message);
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
                                    global.log.error({newclientattachment: true}, global.text_dbexception + ' ' + err.message);
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
                              global.log.error({newclientattachment: true}, global.text_unablegetidfromuuid + ' ' + err.message);
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
                        global.log.error({newclientattachment: true}, global.text_unablegetidfromuuid + ' ' + err.message);
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
              global.log.error({newclientattachment: true}, msg);
            }
          }
        );
      }
      else
        global.log.error({newclientattachment: true}, global.text_nodbconnection);
    }
  );
}

function doNewClient(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'insert into clients (customers_id,clients_id,code,name,url1,email1,phone1,fax1,contact1,address1,address2,address3,address4,city,state,postcode,country,contact2,shipaddress1,shipaddress2,shipaddress3,shipaddress4,shipcity,shipstate,shippostcode,shipcountry,bankname,bankbsb,bankaccountno,bankaccountname,dayscredit,linelimit,orderlimit,creditlimit,ordertemplates_id,quotetemplates_id,invoicetemplates_id,labeltemplates_id,isactive,acn,abn,hscode,custcode1,custcode2,issupplier,isclient,userscreated_id) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38,$39,$40,$41,$42,$43,$44,$45,$46,$47,$48) returning id',
        [
          world.cn.custid,
          __.sanitiseAsBigInt(world.parentid),
          __.sanitiseAsString(world.code, 50),
          __.sanitiseAsString(world.name, 50),

          __.sanitiseAsString(world.url1, 100),
          __.sanitiseAsString(world.email1, 100),
          __.sanitiseAsString(world.phone1, 20),
          __.sanitiseAsString(world.fax1, 20),

          __.sanitiseAsString(world.contact1, 50),
          __.sanitiseAsString(world.address1, 50),
          __.sanitiseAsString(world.address2, 50),
          __.sanitiseAsString(world.address3, 50),
          __.sanitiseAsString(world.address4, 50),
          __.sanitiseAsString(world.city, 50),
          __.sanitiseAsString(world.state, 50),
          __.sanitiseAsString(world.postcode, 50),
          __.sanitiseAsString(world.country, 50),

          __.sanitiseAsString(world.contact2, 50),
          __.sanitiseAsString(world.shiptoaddress1, 50),
          __.sanitiseAsString(world.shiptoaddress2, 50),
          __.sanitiseAsString(world.shiptoaddress3, 50),
          __.sanitiseAsString(world.shiptoaddress4, 50),
          __.sanitiseAsString(world.shiptocity, 50),
          __.sanitiseAsString(world.shiptostate, 50),
          __.sanitiseAsString(world.shiptopostcode, 50),
          __.sanitiseAsString(world.shiptocountry, 50),

          __.sanitiseAsString(world.bankname, 50),
          __.sanitiseAsString(world.bankbsb, 50),
          __.sanitiseAsString(world.bankaccountno, 50),
          __.sanitiseAsString(world.bankacctname, 50),

          __.notNullNumeric(world.dayscredit, 0),
          __.notNullNumeric(world.linelimit),
          __.notNullNumeric(world.orderlimit),
          __.notNullNumeric(world.creditlimit),

          __.sanitiseAsBigInt(world.ordertemplateid),
          __.sanitiseAsBigInt(world.quotetemplateid),
          __.sanitiseAsBigInt(world.invoicetemplateid),
          __.sanitiseAsBigInt(world.labeltemplateid),

          __.sanitiseAsBool(world.isactive),
          __.sanitiseAsString(world.acn, 20),
          __.sanitiseAsString(world.abn, 20),
          __.sanitiseAsString(world.hscode, 50),
          __.sanitiseAsString(world.custcode1, 50),
          __.sanitiseAsString(world.custcode2, 50),

          __.sanitiseAsBool(world.issupplier),
          __.sanitiseAsBool(world.isclient),

          world.cn.userid,
          world.pricelevel
        ],
        function(err, result)
        {
          if (!err)
          {
            var clientid = result.rows[0].id;

            new_clientNote_list.forEach((e) => {
              tx.query('insert into clientnotes (customers_id,clients_id,userscreated_id,notes) values ($1,$2,$3,$4)',
              [
                e.custid,
                __.sanitiseAsBigInt(clientid),
                e.userid,
                __.escapeHTML(e.notes)
              ], 
              (err,result) => {
                if(err)
                  reject(err);
              });
            });

            tx.query
            (
              'select c1.datecreated,u1.name usercreated from clients c1 left join users u1 on (c1.userscreated_id=u1.id) where c1.customers_id=$1 and c1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(clientid)
              ],
              function(err, result)
              {
                if (!err)
                {
                  var c = result.rows[0];

                  resolve
                  (
                    {
                      clientid: clientid,
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

function doSaveClient(tx, world)
{
  global.ConsoleLog('do save client, updating');
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'update ' +
        'clients ' +
        'set ' +
        'clients_id=$1,' +
        'name=$2,' +
        'code=$3,' +
        'email1=$4,' +
        'url1=$5,' +
        'phone1=$6,' +
        'fax1=$7,' +
        'contact1=$8,' +
        'address1=$9,' +
        'address2=$10,' +
        'address3=$11,' +
        'address4=$12,' +
        'city=$13,' +
        'state=$14,' +
        'postcode=$15,' +
        'country=$16,' +
        'contact2=$17,' +
        'shipaddress1=$18,' +
        'shipaddress2=$19,' +
        'shipaddress3=$20,' +
        'shipaddress4=$21,' +
        'shipcity=$22,' +
        'shipstate=$23,' +
        'shippostcode=$24,' +
        'shipcountry=$25,' +
        'bankname=$26,' +
        'bankbsb=$27,' +
        'bankaccountno=$28,' +
        'bankaccountname=$29,' +
        'dayscredit=$30,' +
        'linelimit=$31,' +
        'orderlimit=$32,' +
        'creditlimit=$33,' +
        'invoicetemplates_id=$34,' +
        'ordertemplates_id=$35,' +
        'quotetemplates_id=$36,' +
        'labeltemplates_id=$37,' +
        'isactive=$38,' +
        'issupplier=$39,' +
        'acn=$40,' +
        'abn=$41,' +
        'hscode=$42,' +
        'custcode1=$43,' +
        'custcode2=$44,' +
        'pricelevel=$48,' +
        'datemodified=now(),' +
        'usersmodified_id=$45 ' +
        'where ' +
        'customers_id=$46 ' +
        'and ' +
        'id=$47 ' +
        'and ' +
        'dateexpired is null',
        [
          __.sanitiseAsBigInt(world.parentid),
          __.sanitiseAsString(world.name),
          __.sanitiseAsString(world.code),
          __.sanitiseAsString(world.email1),
          __.sanitiseAsString(world.url1),
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
          __.sanitiseAsString(world.shiptoaddress1),
          __.sanitiseAsString(world.shiptoaddress2),
          __.sanitiseAsString(world.shiptoaddress3),
          __.sanitiseAsString(world.shiptoaddress4),
          __.sanitiseAsString(world.shiptocity),
          __.sanitiseAsString(world.shiptostate),
          __.sanitiseAsString(world.shiptopostcode),
          __.sanitiseAsString(world.shiptocountry),
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
          __.sanitiseAsBigInt(world.labeltemplateid),
          __.sanitiseAsBool(world.isactive),
          __.sanitiseAsBool(world.issupplier),
          __.sanitiseAsString(world.acn),
          __.sanitiseAsString(world.abn),
          __.sanitiseAsString(world.hscode),
          __.sanitiseAsString(world.custcode1),
          __.sanitiseAsString(world.custcode2),
          world.cn.userid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.clientid),
          world.pricelevel
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
                __.sanitiseAsBigInt(world.clientid)
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

function doChangeClientParent(tx, world)
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
          __.sanitiseAsBigInt(world.clientid)
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
                __.sanitiseAsBigInt(world.clientid)
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

function doExpireClientStep1(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      if (!world.cascade)
      {
        tx.query
        (
          'select c1.clients_id clientid from clients c1 where c1.customers_id=$1 and c1.id=$2 and c1.dateexpired is null',
          [
            world.cn.custid,
            __.sanitiseAsBigInt(world.clientid)
          ],
          function(err, result)
          {
            if (!err)
            {
              if (result.rows.length == 1)
              {
                var parentid = result.rows[0].clientid;

                tx.query
                (
                  'update clients set clients_id=$1,datemodified=now(),usersmodified_id=$2 where customers_id=$3 and clients_id=$4 and dateexpired is null',
                  [
                    parentid,
                    world.cn.userid,
                    world.cn.custid,
                    __.sanitiseAsBigInt(world.clientid)
                  ],
                  function(err, result)
                  {
                    if (!err)
                      resolve({clientid: world.clientid});
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
        resolve({clientid: world.clientid});
    }
  );
  return promise;
}

function doExpireClientStep2(tx, world)
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
          __.sanitiseAsBigInt(world.clientid)
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
                __.sanitiseAsBigInt(world.clientid)
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

function doNewClientNote(tx, world)
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
          __.sanitiseAsBigInt(world.clientid),
          world.cn.userid
        ],
        function(err, result)
        {
          if (!err)
          {
            var clientnoteid = result.rows[0].id;

            tx.query
            (
              'select cn1.datecreated,u1.name usercreated from clientnotes cn1 left join users u1 on (cn1.userscreated_id=u1.id) where cn1.customers_id=$1 and cn1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(clientnoteid)
              ],
              function(err, result)
              {
                if (!err)
                {
                  var cn = result.rows[0];

                  resolve
                  (
                    {
                      clientnoteid: clientnoteid,
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

function doSaveClientNote(tx, world)
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
          __.sanitiseAsBigInt(world.clientnoteid)
        ],
        function(err, result)
        {
          if (!err)
          {
            tx.query
            (
              'select cn1.clients_id clientid,cn1.datemodified,u1.name from clientnotes cn1 left join users u1 on (cn1.usersmodified_id=u1.id) where cn1.customers_id=$1 and cn1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(world.clientnoteid)
              ],
              function(err, result)
              {
                if (!err)
                  resolve({clientid: result.rows[0].clientid, datemodified: global.moment(result.rows[0].datemodified).format('YYYY-MM-DD HH:mm:ss'), usermodified: result.rows[0].name});
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

function doSaveClientAttachment(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'update clientattachments set name=$5,description=$1,datemodified=now(),usersmodified_id=$2 where customers_id=$3 and id=$4 and dateexpired is null',
        [
          __.sanitiseAsString(world.description),
          world.cn.userid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.clientattachmentid),
          __.sanitiseAsString(world.name)
        ],
        function(err, result)
        {
          if (!err)
          {
            tx.query
            (
              'select a1.clients_id clientid,a1.datemodified,u1.name from clientattachments a1 left join users u1 on (a1.usersmodified_id=u1.id) where a1.customers_id=$1 and a1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(world.clientattachmentid)
              ],
              function(err, result)
              {
                if (!err)
                  resolve({clientid: result.rows[0].clientid, datemodified: global.moment(result.rows[0].datemodified).format('YYYY-MM-DD HH:mm:ss'), usermodified: result.rows[0].name});
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

function doExpireClientAttachment(tx, world)
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
          __.sanitiseAsBigInt(world.clientattachmentid)
        ],
        function(err, result)
        {
          if (!err)
          {
            tx.query
            (
              'select a1.clients_id clientid,a1.dateexpired,u1.name from clientattachments a1 left join users u1 on (a1.usersexpired_id=u1.id) where a1.customers_id=$1 and a1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(world.clientattachmentid)
              ],
              function(err, result)
              {
                if (!err)
                  resolve({clientid: result.rows[0].clientid, dateexpired: global.moment(result.rows[0].dateexpired).format('YYYY-MM-DD HH:mm:ss'), userexpired: result.rows[0].name});
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

function doNewFolderClientAttachment(tx, world) {
  return new global.rsvp.Promise(
    (resolve, reject) => {
      tx.query(
        'INSERT INTO clientattachments (customers_id, name, clients_id, datecreated, userscreated_id, parent_id, mimetype) VALUES ($1, $2, $3, now(), $4, $5, $6) returning id',
        [
          world.cn.custid,
          'New Folder',
          __.sanitiseAsBigInt(world.clientid),
          world.cn.userid,
          __.sanitiseAsBigInt(world.parentid),
          'Folder'
        ],
        (err, result) => {
          if (!err) {
            tx.query
            (
              'select a1.clients_id clientid,a1.dateexpired,u1.name, a1.datemodified, u1.name from clientattachments a1 left join users u1 on (a1.usersmodified_id=u1.id) where a1.customers_id=$1 and a1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(result.id)
              ],
              function(err, result)
              {
                if (!err)
                  resolve({datemodified: global.moment(result.rows[0].datemodified).format('YYYY-MM-DD HH:mm:ss'), usermodified: result.rows[0].name});
                else
                  reject(err);
              }
            );
            
          } else {
            reject(err);
          }
        }
      );
    }
  );
}

function doChangeClientAttachmentParent(tx, world) {
  return new global.rsvp.Promise(
    (resolve, reject) => {
      tx.query(
        'update clientattachments set parent_id=$1, datemodified=now(),usersmodified_id=$2 where customers_id=$3 and id=$4',
        [
          __.sanitiseAsBigInt(world.parentid),
          world.cn.userid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.clientattachmentid)
        ],
        (err, result) => {
          if (!err) {
            tx.query
            (
              'select a1.clients_id clientid,a1.dateexpired,u1.name, a1.datemodified from clientattachments a1 left join users u1 on (a1.usersmodified_id=u1.id) where a1.customers_id=$1 and a1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(world.clientattachmentid)
              ],
              function(err, result)
              {
                if (!err)
                  resolve({clientid: result.rows[0].clientid, datemodified: global.moment(result.rows[0].datemodified).format('YYYY-MM-DD HH:mm:ss'), usermodified: result.rows[0].name});
                else
                  reject(err);
              }
            );
          } else {
            reject(err);
          }
        }
      );
    }
  );
}


// *******************************************************************************************************************************************************************************************
// Public functions
function LoadClient(world)
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
          'c1.issupplier,' +
          'c1.dayscredit,' +
          'c1.orderlimit,' +
          'c1.creditlimit,' +
          'c1.invoicetemplates_id invoicetemplateid,' +
          'c1.ordertemplates_id ordertemplateid,' +
          'c1.quotetemplates_id quotetemplateid,' +
          'c1.deliverydockettemplates_id deliverydockettemplateid,' +
          'c1.labeltemplates_id labeltemplateid,' +
          'c1.isactive,' +
          'c1.acn,' +
          'c1.abn,' +
          'c1.hscode,' +
          'c1.custcode1,' +
          'c1.custcode2,' +
          'c1.pricelevel,' +
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
          'c1.id=$2',
          [
            world.cn.custid,
            __.sanitiseAsBigInt(world.clientid)
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

                  if (__.isBlank(c.country))
                    c.country = global.config.defaults.defaultcountry;
                }
              );

              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, client: result.rows[0], pdata: world.pdata});
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({loadclient: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({loadclient: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ListClients(world)
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
          // 'c1.address2,' +
          // 'c1.address3,' +
          // 'c1.address4,' +
          // 'c1.city,' +
          // 'c1.state,' +
          // 'c1.postcode,' +
          // 'c1.country,' +
          // 'c1.contact2,' +
          // 'c1.shipaddress1,' +
          // 'c1.shipaddress2,' +
          // 'c1.shipaddress3,' +
          // 'c1.shipaddress4,' +
          // 'c1.shipcity,' +
          // 'c1.shipstate,' +
          // 'c1.shippostcode,' +
          // 'c1.shipcountry,' +
          // 'c1.bankname,' +
          // 'c1.bankbsb,' +
          // 'c1.bankaccountno,' +
          // 'c1.bankaccountname,' +
          // 'c1.dayscredit,' +
          // 'c1.orderlimit,' +
          // 'c1.creditlimit,' +
          // 'c1.invoicetemplates_id invoicetemplateid,' +
          // 'c1.ordertemplates_id ordertemplateid,' +
          // 'c1.quotetemplates_id quotetemplateid,' +
          // 'c1.deliverydockettemplates_id deliverydockettemplateid,' +
          // 'c1.labeltemplates_id labeltemplateid,' +
          // 'c1.acn,' +
          // 'c1.abn,' +
          // 'c1.hscode,' +
          // 'c1.custcode1,' +
          // 'c1.custcode2,' +
          'c1.issupplier,' +
          'c1.isactive,' +
          'c1.datecreated,' +
          'c1.datemodified,' +
          // 'c1.pricelevel,' +
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
          'c1.isclient=1 ' +
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
              global.log.error({listclients: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({listclients: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function NewClient(world)
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
              global.modconfig.doNextClientNo(tx, world).then
              (
                function(result)
                {
                  world.code = result.clientno;
                  return doNewClient(tx, world);
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
                            clientid: result.clientid,
                            datecreated: result.datecreated,
                            usercreated: result.usercreated,
                            pdata: world.pdata
                          }
                        );
                        global.pr.sendToRoomExcept
                        (
                          global.custchannelprefix + world.cn.custid,
                          'clientcreated',
                          {
                            clientid: result.clientid,
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

function SaveClient(world)
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
              doSaveClient(tx, world).then
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
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, clientid: world.clientid, datemodified: result.datemodified, usermodified: result.usermodified, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'clientsaved', {clientid: world.clientid, datemodified: result.datemodified, usermodified: result.usermodified}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({saveclient: true}, msg);
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
                      global.log.error({saveclient: true}, msg);
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
              global.log.error({saveclient: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({saveclient: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ChangeClientParent(world)
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
              doChangeClientParent(tx, world).then
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
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, clientid: world.clientid, parentid: world.parentid, datemodified: result.datemodified, usermodified: result.usermodified, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'clientparentchanged', {clientid: world.clientid, parentid: world.parentid, datemodified: result.datemodified, usermodified: result.usermodified}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({changeclientparent: true}, msg);
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
                      global.log.error({changeclientparent: true}, msg);
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
              global.log.error({changeclientparent: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({changeclientparent: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ExpireClient(world)
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
              doExpireClientStep1(tx, world).then
              (
                function(ignore)
                {
                  return doExpireClientStep2(tx, world);
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
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, clientid: world.clientid, dateexpired: result.dateexpired, userexpired: result.userexpired, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'clientexpired', {clientid: world.clientid, dateexpired: result.dateexpired, userexpired: result.userexpired}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({expireclient: true}, msg);
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
                      global.log.error({expireclient: true}, msg);
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
              global.log.error({expireclient: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({expireclient: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ListAllEmails(world)
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
              global.log.error({listallemails: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({listallemails: true}, global.text_nodbconnection);
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
          'c1.email1,' +
          'c1.email2,' +
          'c1.contact1,' +
          'c1.contact2 ' +
          'from ' +
          'clients c1 ' +
          'where ' +
          'c1.customers_id=$1 ' +
          'and ' +
          'c1.id=$2',
          [
            world.cn.custid,
            world.clientid
          ],
          function(err, result)
          {
            done();

            if (!err)
              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
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

let new_clientNote_list = [];
let clientnote_id = 0;
function NewClientNote_noclientid(world) {
  new_clientNote_list.push({
    id: ++clientnote_id,
    custid: world.cn.custid,
    userid: world.cn.userid,
    usercreated: world.cn.uname,
    notes: "",
    datecreated: global.moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
  });
   world.spark.emit('listnewclientnote', {
    rc: global.errcode_none,
    msg: global.text_success,
    rs: new_clientNote_list,
    pdata: world.pdata
  });
}

function CleanNewClientNode() {
  new_clientNote_list = [];
  clientnote_id = 0;
}

function ListClientNotes(world)
{
  if (world.clientid == null) {
    world.spark.emit('listnewclientnote', {
      rc: global.errcode_none,
      msg: global.text_success,
      fguid: world.fguid,
      rs: new_clientNote_list,
      pdata: world.pdata
    });
  } else {
    var msg = '[' + world.eventname + '] ';
    //
    global.pg.connect(
      global.cs,
      function (err, client, done) {
        if (!err) {
          client.query(
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
              __.sanitiseAsBigInt(world.clientid)
            ],
            function (err, result) {
              done();

              if (!err) {
                // JS returns date with TZ info/format, need in ISO format...
                result.rows.forEach(
                  function (p) {
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
                global.log.error({listordernotes: true}, msg);
                world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
              }
            }
          );
        }
        else
        {
          global.log.error({listordernotes: true}, global.text_nodbconnection);
          world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
        }
      }
    );
  }
}

function NewClientNote(world)
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
              doNewClientNote(tx, world).then
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
                            clientid: world.clientid,
                            clientnoteid: result.clientnoteid,
                            datecreated: result.datecreated,
                            usercreated: result.usercreated,
                            pdata: world.pdata
                          }
                        );
                        global.pr.sendToRoomExcept
                        (
                          global.custchannelprefix + world.cn.custid,
                          'clientnotecreated',
                          {
                            clientid: world.clientid,
                            clientnoteid: result.clientnoteid,
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
                            global.log.error({newclientnote: true}, msg);
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
                      global.log.error({newclientnote: true}, msg);
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
              global.log.error({newclientnote: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({newclientnote: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function SaveClientNote_newClient(world)
{
    new_clientNote_list[world.clientnoteid-1].notes = world.notes;

    world.spark.emit('listnewclientnote',
    {
      rc: global.errcode_none,
      msg: global.text_success,
      rs:new_clientNote_list,
      pdata: world.pdata
    });
}

function SaveClientNote(world)
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
              doSaveClientNote(tx, world).then
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
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, clientid: result.clientid, clientnoteid: world.clientnoteid, datemodified: result.datemodified, usermodified: result.usermodified, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'clientnotesaved', {clientid: result.clientid, clientnoteid: world.clientnoteid, datemodified: result.datemodified, usermodified: result.usermodified}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({saveclientnote: true}, msg);
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
                      global.log.error({saveclientnote: true}, msg);
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
              global.log.error({saveclientnote: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({saveclientnote: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ListClientAttachments(world)
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
          'ca1.parent_id parentid,' +
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
          'ca1.path, ' + 
          'ca1.id desc,'+
          'ca1.name',
          // 'ca1.datecreated desc',
          [
            world.cn.custid,
            __.sanitiseAsBigInt(world.clientid)
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
                    p.image = global.config.folders.clientattachments + p.id + '_' + world.clientid + '_' + p.name;
                }
              );

              world.spark.emit(world.eventname, {
                rc: global.errcode_none,
                msg: global.text_success,
                fguid: world.fguid,
                rs: result.rows,
                clientid: world.clientid,
                pdata: world.pdata
              });

              // world.spark.emit(world.eventname, {
              //   rc: global.errcode_none,
              //   msg: global.text_success,
              //   clientid: result.clientid,
              //   clientattachmentid: world.clientattachmentid,
              //   dateexpired: result.dateexpired,
              //   userexpired: result.userexpired,
              //   pdata: world.pdata
              // });

            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({listclientattachments: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({listclientattachments: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function SaveClientAttachment(world)
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
              doSaveClientAttachment(tx, world).then
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
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, clientid: result.clientid, clientattachmentid: world.clientattachmentid, dateexpired: result.dateexpired, userexpired: result.userexpired, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'clientattachmentsaved', {clientid: result.clientid, clientattachmentid: world.clientattachmentid, dateexpired: result.dateexpired, userexpired: result.userexpired}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({saveclientattachment: true}, msg);
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
                      global.log.error({saveclientattachment: true}, msg);
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
              global.log.error({saveclientattachment: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({saveclientattachment: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ChangeClientAttachmentParent(world) {
  var msg = '[' + world.eventname + '] ';
  
  global.pg.connect(
    global.cs,
    (err, client, done) => {
      if (!err) {
        let tx = new global.pgtx(client);
        tx.begin(
          (err) => {
            if (!err) {
              doChangeClientAttachmentParent(tx, world).then(
                (result) => {
                  tx.commit(
                    (err) => {
                      if(!err){
                        done();
                        world.spark.emit(world.eventname, {
                          rc: global.errcode_none,
                          msg: global.text_success,
                          clientid: result.clientid,
                          clientattachmentid: world.clientattachmentid,
                          usermodified: result.usermodified,
                          datemodified: result.datemodified,
                          dateexpired: result.dateexpired,
                          userexpired: result.userexpired,
                          pdata: world.pdata
                        });

                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'clientattachmentsaved', {
                          clientid: result.clientid,
                          clientattachmentid: world.clientattachmentid,
                          usermodified: result.usermodified,
                          datemodified: result.datemodified,
                          dateexpired: result.dateexpired,
                          userexpired: result.userexpired
                        }, world.spark.id);
                        

                      } else {
                        done();
                        tx.rollback(() => {
                          msg += global.text_notxstart + ' ' + err.message;
                          global.log.error({changeclientattachmentparent: true}, msg);
                          world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
                        });
                      }
                    }
                  );
                }
              ).catch(
                (err) => {
                  done();
                  tx.rollback(() => {
                      msg += global.text_notxstart + ' ' + err.message;
                      global.log.error({changeclientattachmentparent: true}, msg);
                      world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
                  });
                }
              );
            } else {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({changeclientattachmentparent: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      } else {
        done();
        global.log.error({changeclientattachmentparent: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ExpireClientAttachment(world)
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
              doExpireClientAttachment(tx, world).then
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
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, clientattachmentid: world.clientattachmentid, clientid: result.clientid, dateexpired: result.dateexpired, userexpired: result.userexpired, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'clientattachmentexpired', {clientattachmentid: world.clientattachmentid, clientid: result.clientid, dateexpired: result.dateexpired, userexpired: result.userexpired}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({expireclientattachment: true}, msg);
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
                      global.log.error({expireclientattachment: true}, msg);
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
              global.log.error({expireclientattachment: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({expireclientattachment: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function CheckClientCode(world)
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

        if (!__.isNull(world.clientid))
        {
          clause = ' and c1.id!=$3';
          binds.push(world.clientid);
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
              global.log.error({checkclientcode: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({checkclientcode: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function SearchClientNote(world)
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
        var words =  world.words.replace(/\s+/g, ' & ');
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
          'and ' +
          'to_tsvector(\'english\', cn1.notes) @@ to_tsquery(\'english\', $3) ' +
          'order by ' +
          'cn1.datecreated desc',
          [
            world.cn.custid,
            __.sanitiseAsBigInt(world.clientid),
            __.sanitiseAsString(words)
          ],
          function(err, result)
          {
            done();

            if (!err)
            {
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
              global.log.error({searchclientnote: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({searchclientnote: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function NewFolderClientAttachment(world){
  var msg = '[' + world.eventname + '] ';
  global.pg.connect(
    global.cs,
    (err, client, done) => {
      if(!err){
        let tx = new global.pgtx(client);
        tx.begin(
          (err) => {
            if(!err){
              doNewFolderClientAttachment(tx, world).then(
                  (result) => {
                    tx.commit(
                      (err) => {
                        if (!err) {
                          world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, clientid: world.clientid, pdata: world.pdata});
                          global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'listclientattachments', {clientid: world.clientid}, world.spark.id);
                        } else {
                          done();
                          tx.rollback(
                            () => {
                              msg += global.text_notxstart + ' ' + err.message;
                              global.log.error({newfolderclientattachment: true}, msg);
                              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
                            }
                          );
                        }
                      }
                    );
                  }
                ).catch(
                (err) => {
                  done();
                  tx.rollback(
                    () => {
                      msg += global.text_notxstart + ' ' + err.message;
                      global.log.error({newfolderclientattachment: true}, msg);
                      world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
                    }
                  );
                }
              );
            } else {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({newfolderclientattachment: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      } else {
        done();
        global.log.error({newfolderclientattachment: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

// *******************************************************************************************************************************************************************************************
// Internal functions
module.exports.doNewClient = doNewClient;
module.exports.newClientAttachment = newClientAttachment;
module.exports.existingClientAttachment = existingClientAttachment;

// *******************************************************************************************************************************************************************************************
// Public functions
module.exports.LoadClient = LoadClient;
module.exports.ListClients = ListClients;
module.exports.NewClient = NewClient;
module.exports.SaveClient = SaveClient;
module.exports.ChangeClientParent = ChangeClientParent;
module.exports.ExpireClient = ExpireClient;
module.exports.ListAllEmails = ListAllEmails;
module.exports.ListEmails = ListEmails;
module.exports.CheckClientCode = CheckClientCode;

module.exports.CleanNewClientNode = CleanNewClientNode;
module.exports.NewClientNote_noclientid = NewClientNote_noclientid;
module.exports.SaveClientNote_newClient = SaveClientNote_newClient;
module.exports.ListClientNotes = ListClientNotes;

module.exports.ListClientNotes = ListClientNotes;
module.exports.NewClientNote = NewClientNote;
module.exports.SaveClientNote = SaveClientNote;
module.exports.SearchClientNote = SearchClientNote;

module.exports.ListClientAttachments = ListClientAttachments;
module.exports.SaveClientAttachment = SaveClientAttachment;
module.exports.ExpireClientAttachment = ExpireClientAttachment;
module.exports.NewFolderClientAttachment = NewFolderClientAttachment;
module.exports.ChangeClientAttachmentParent = ChangeClientAttachmentParent;
