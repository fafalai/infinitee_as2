// *******************************************************************************************************************************************************************************************
// Internal functions
function doLogMsg(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      // Send to everyone including myself...
      if (__.isUndefined(world.recipients) || (world.recipients.length == 0))
      {
        tx.query
        (
          'insert into ' +
          'ims ' +
          '(' +
          'customers_id,' +
          'users_id,' +
          'msg,' +
          'itype,' +
          'userscreated_id' +
          ') ' +
          'select ' +
          '$1,' +
          'u1.id,' +
          '$2,' +
          '$3,' +
          '$4 ' +
          'from ' +
          'users u1 ' +
          'where ' +
          'u1.dateexpired is null',
          [
            world.cn.custid,
            __.sanitiseAsComment(world.msg),
            global.itype_ims_chat,
            world.cn.userid
          ],
          function(err, rows)
          {
            if (!err)
              resolve(undefined);
            else
              reject(err);
          }
        );
      }
      else
      {
        var recipients = global.StringArrayToString(world.recipients);

        // Send to one or more recipients, including myself...
        tx.query
        (
          'insert into ' +
          'ims ' +
          '(' +
          'customers_id,' +
          'users_id,' +
          'msg,' +
          'itype,' +
          'userscreated_id' +
          ') ' +
          'select ' +
          '$1,' +
          'u1.id,' +
          '$2,' +
          '$3,' +
          '$4 ' +
          'from ' +
          'users u1 ' +
          'where ' +
          'uuid in ' +
          '(' +
          recipients +
          ') ' +
          'or ' +
          'u1.id=$5',
          [
            world.cn.custid,
            __.sanitiseAsComment(world.msg),
            global.itype_ims_chat,
            world.cn.userid,
            world.cn.userid
          ]
          ,
          function(err, result)
          {
            if (!err)
              resolve(undefined);
            else
              reject(err);
          }
        );
      }
    }
  );
  return promise;
}

// *******************************************************************************************************************************************************************************************
// Public functions
function SendMsg(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.poolmain.getConnection
  (
    function(err, tx)
    {
      if (!err)
      {
        tx.beginTransaction
        (
          function(err)
          {
            if (!err)
            {
              var cn = global.connections.get(world.uuid);
              //
              doLogMsg(tx, world.recipients, world.msg, cn.uid).then
              (
                function(ignore)
                {
                  tx.commit
                  (
                    function(err)
                    {
                      if (!err)
                      {
                        tx.release();

                        // Send to everyone INCLUDING myself...
                        global.io.sockets.in(global.config.env.notificationschannel).emit('sendmsg', {from: cn.uid, fromname: cn.uname, msg: world.msg, recipients: world.recipients, gpslat: world.gpslat, gpslon: world.gpslon});
                        // Send to everyone EXCEPT myself...
                        //world.socket.broadcast.to(global.config.env.notificationschannel).emit('sendmsg', {from: cn.uid, name: cn.name, msg: world.msg, recipients: world.recipients, gpslat: world.gpslat, gpslon: world.gpslon});
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            tx.release();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({sendmsg: true}, msg);
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
                      tx.release();

                      msg += global.text_generalexception + ' ' + err.message;
                      global.log.error({sendmsg: true}, msg);
                      world.socket.emit(world.eventname, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                    }
                  );
                }
              );
            }
          }
        );
      }
      else
        global.log.error({sendmsg: true}, global.text_nodbconnection);
    }
  );
}

function ChatMsg(world)
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
              doLogMsg(tx, world).then
              (
                function(ignore)
                {
                  tx.commit
                  (
                    function(err)
                    {
                      if (!err)
                      {
                        done();
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, pdata: world.pdata});
                        global.pr.sendToRoom(global.custchannelprefix + world.cn.custid, 'newchatmsg', {});
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({chatmsg: true}, msg);
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
                      global.log.error({chatmsg: true}, msg);
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
              global.log.error({chatmsg: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({chatmsg: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ListChatsForMe(world)
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
        var maxhistory = __.isUN(world.maxhistory) ? 200 : world.maxhistory;

        // Get messages sent by me or sent to me, but not where I sent to myself...
        client.query
        (
          'select ' +
          'i1.id,' +
          'i1.msg,' +
          'i1.datecreated,' +
          'u1.uuid senderuuid,' +
          'u1.name sendername,' +
          'u2.uuid recipientuuid,' +
          'u2.name recipientname ' +
          'from ' +
          'ims i1 left join users u1 on (i1.userscreated_id=u1.id) ' +
          '       left join users u2 on (i1.users_id=u2.id) ' +
          'where ' +
          'i1.customers_id=$1' +
          'and ' +
          '(' +
          'i1.users_id=$2 ' +
          'or ' +
          'i1.userscreated_id=$3 ' +
          ') ' +
          'and ' +
          'i1.userscreated_id!=i1.users_id ' +
          'order by ' +
          'i1.datecreated desc ' +
          'limit $4',
          [
            world.cn.custid,
            world.cn.userid,
            world.cn.userid,
            maxhistory
          ],
          function(err, result)
          {
            done();

            if (!err)
            {
              // JS returns date with TZ info/format, need in ISO format...
              result.rows.forEach
              (
                function(i)
                {
                  i.datecreated = global.moment(i.datecreated).format('YYYY-MM-DD HH:mm:ss');
                }
              );

              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({listchatsforme: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({listchatsforme: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ListAlertsForMe(world)
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
        var maxhistory = __.isUN(world.maxhistory) ? 200 : world.maxhistory;

        // Get messages sent by me or sent to me, but not where I sent to myself...
        client.query
        (
          'select ' +
          'a1.id,' +
          'a1.orderno,' +
          'a1.status,' +
          'a1.datecreated,' +
          'u1.name usercreated ' +
          'from ' +
          'alerts a1 left join users u1 on (a1.userscreated_id=u1.id) ' +
          'where ' +
          'a1.customers_id=$1' +
          'and ' +
          'a1.users_id=$2 ' +
          'order by ' +
          'a1.datecreated desc ' +
          'limit $3',
          [
            world.cn.custid,
            world.cn.userid,
            maxhistory
          ],
          function(err, result)
          {
            done();

            if (!err)
            {
              // JS returns date with TZ info/format, need in ISO format...
              result.rows.forEach
              (
                function(i)
                {
                  i.datecreated = global.moment(i.datecreated).format('YYYY-MM-DD HH:mm:ss');
                }
              );

              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({listalertsforme: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({listalertsforme: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function EmailHistory(world)
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
        var maxhistory = __.isUN(world.maxhistory) ? 200 : world.maxhistory;

        client.query
        (
          'select ' +
          'e1.id,' +
          'o1.orderno,' +
          'e1.copyno,' +
          'e1.recipients,' +
          'e1.subject,' +
          'e1.orders_id orderid,' +
          'e1.datesent,' +
          'e1.datecreated,' +
          'u1.name usercreated ' +
          'from ' +
          'emails e1 left join orders o1 on (e1.orders_id=o1.id) ' +
          '          left join users u1 on (e1.userscreated_id=u1.id) ' +
          'where ' +
          'e1.customers_id=$1 ' +
          'order by ' +
          'u1.name,' +
          'e1.id desc ' +
          'limit $2',
          [
            world.cn.custid,
            maxhistory
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
                  if (!__.isUN(c.datesent))
                    c.datesent = global.moment(c.datesent).format('YYYY-MM-DD HH:mm:ss');

                  c.datesent = global.moment(c.datecreated).format('YYYY-MM-DD HH:mm:ss');
                }
              );

              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({emailhistory: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({emailhistory: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function EmailFeedback(world)
{
  var msg = '[' + world.eventname + '] ';
  var transporter = createSMTPTransport();

  transporter.sendMail
  (
    {
      from: global.config.smtp.returnmail,
      to: global.config.env.feedbackemail,
      subject: 'Big Accounting Feedback',
      html: world.comments
    },
    function(err, info)
    {
      if (!err)
        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, pdata: world.pdata});
      else
      {
        msg += global.text_unableemail + err.message;
        global.log.error({emailfeedback: true}, global.text_unableemail);
        world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
      }
    }
  );
}

// *******************************************************************************************************************************************************************************************
// Public functions
module.exports.SendMsg = SendMsg;
module.exports.ChatMsg = ChatMsg;
module.exports.ListChatsForMe = ListChatsForMe;
module.exports.ListAlertsForMe = ListAlertsForMe;

module.exports.EmailHistory = EmailHistory;
module.exports.EmailFeedback = EmailFeedback;
