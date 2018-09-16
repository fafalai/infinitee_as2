// *******************************************************************************************************************************************************************************************
// Public functions
function ABNLookup(world)
{
  var msg = '[' + world.eventname + '] ';
  var name = world.name;
  var url = global.config.gov.abnlookup;

  name = name.replace(/ /g, '+');
  url = url.replace(/XXX_ABNNAME/g, name);

  global.httpget.post
  (
    url,
    function(err, res)
    {
      if (!err)
      {
        res.pipe
        (
          concat
          (
            function(data)
            {
              data = data.toString();

              // TODO: Need better way of converting callback format with object param to just result object...
              // NOTE we could just call eval(data.toString()) but then we lose the workd.spark.emit ability...
              if (data.indexOf('callback(') == 0)
                data = data.substr(9);

              // Remove trailing ')'
              data = data.substr(0, data.length - 1);

              var result = JSON.parse(data);
              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result, pdata: world.pdata});
            }
          )
        );
      }
      else
      {
        msg += global.text_unableemail + err.message;
        global.log.error({emailfeedback: true}, global.text_unableabnlookup);
        world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
      }
    }
  );
}

// *******************************************************************************************************************************************************************************************
// Public functions
module.exports.ABNLookup = ABNLookup;
