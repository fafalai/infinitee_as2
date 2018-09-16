var totaltags = 0;
var totalmoves = 0;

var numtagstoday = 0;
var nummovestoday = 0;

var numconnections = 0;

// *******************************************************************************************************************************************************************************************
// Internal functions
function getTotalTagCount(tx)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'select count(id) c from tags',
        function(err, rows)
        {
          if (!err)
          {
            if (rows.length != 0)
            {
              totaltags = rows[0].c;
              resolve();
            }
            else
              reject(err);
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function getTodayTagCount(tx)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      var today = global.moment().format('YYYY-MM-DD');
      var today1 = today + ' 00:00:00';
      var today2 = today + ' 23:59:59';

      tx.query
      (
        'select count(id) c from tags where datecreated between ? and ?',
        [
          today1,
          today2
        ],
        function(err, rows)
        {
          if (!err)
          {
            if (rows.length != 0)
            {
              numtagstoday = rows[0].c;
              resolve();
            }
            else
              reject(err);
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function getTotalMoveCount(tx)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'select count(id) c from moves',
        global.itype_rma,
        function(err, rows)
        {
          if (!err)
          {
            if (rows.length != 0)
            {
              totalmoves = rows[0].c;
              resolve();
            }
            else
              reject(err);
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function getTodayMoveCount(tx)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      var today = global.moment().format('YYYY-MM-DD');
      var today1 = today + ' 00:00:00';
      var today2 = today + ' 23:59:59';

      tx.query
      (
        'select count(id) c from moves where datecreated between ? and ?',
        [
          global.itype_rma,
          today1,
          today2
        ],
        function(err, rows)
        {
          if (!err)
          {
            if (rows.length != 0)
            {
              nummovestoday = rows[0].c;
              resolve();
            }
            else
              reject(err);
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function IncTags()
{
  totaltags++;
  numtagstoday++;
}

function IncMoves()
{
  totalmoves++;
  nummovestoday++;
}

// *******************************************************************************************************************************************************************************************
// Public functions
function RefreshCounters()
{
  global.poolmain.getConnection
  (
    function(err, db)
    {
      if (!err)
      {
        getTotalTagCount(db).then
        (
          function()
          {
            return getTodayTagCount(db);
          }
        ).then
        (
          function()
          {
            return getTotalMoveCount(db);
          }
        ).then
        (
          function()
          {
            return getTodayMoveCount(db);
          }
        ).then
        (
          function()
          {
            numconnections = global.io.sockets.clients().length;
            db.release();
          }
        ).then
        (
          null,
          function(err)
          {
            global.log.error({refreshcounters: true}, global.text_generalexception + ' ' + err.message);
            db.release();
          }
        );
      }
      else
        global.log.error({refreshcounters: true}, global.text_nodbconnection);
    }
  );
}

function GetCounters(world)
{
  numconnections = Object.keys(global.io.sockets.manager.open).length;
  world.socket.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, totaltags: totaltags, totalmoves: totalmoves, numtagstoday: numtagstoday, nummovestoday: nummovestoday, numconnections: numconnections, pdata: world.pdata});
}

function SendCounters()
{
  numconnections = Object.keys(global.io.sockets.manager.open).length;
  global.io.sockets.in(global.config.env.notificationschannel).emit('getcounters', {rc: global.errcode_none, msg: global.text_success, totaltags: totaltags, totalmoves: totalmoves, numtagstoday: numtagstoday, nummovestoday: nummovestoday, numconnections: numconnections, pdata: ''});
}

// *******************************************************************************************************************************************************************************************
// Public functions
module.exports.RefreshCounters = RefreshCounters;
module.exports.GetCounters = GetCounters;
module.exports.SendCounters = SendCounters;

module.exports.IncTags = IncTags;
module.exports.IncMoves = IncMoves;
