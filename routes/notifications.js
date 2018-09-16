exports.notificationsPost = function(req, res)
{
  var rc = 0;
  var rsobj = {};
  var msg = '';

  if (!__.isUndefined(req.body))
  {
    var body = req.body;

    console.log(body);
    //
    /*
    switch (ntype.toLowerCase())
    {
      case 'newmoves':
      {
        if (!__.isUndefined(req.body.moves) && !__.isNull(req.body.moves))
          global.pr.sendToRoom(global.config.env.notificationschannel, 'newmoves', {visitid: req.body.moves, datecreated: global.moment().format('YYYY-MM-DD HH:mm')});
        break;
      }
      case 'newtags':
      {
        if (!__.isUndefined(req.body.tags) && !__.isNull(req.body.tags))
          global.pr.sendToRoom(global.config.env.notificationschannel, 'newtags', {tags: req.body.tags, datecreated: global.moment().format('YYYY-MM-DD HH:mm')});
          global.io.sockets.in(global.config.env.notificationschannel).emit('newtags', {tags: req.body.tags});
        break;
      }
      case 'newvisit':
      {
        if (!__.isUndefined(req.body.visitid) && !__.isNull(req.body.visitid))
          global.pr.sendToRoom(global.config.env.notificationschannel, 'newvisit', {visitid: req.body.visitid, datecreated: global.moment().format('YYYY-MM-DD HH:mm')});
        break;
      }
      default:
      {
        msg = global.text_invalidparams;
        rc = errcode_missingparams;
      }
    }
    */
  }
  else
  {
    msg = 'Missing input';
    rc = -2;
  }
  //
  rsobj = {rc: rc, msg: msg};
  res.json(rsobj);
};

