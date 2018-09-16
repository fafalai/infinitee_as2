exports.throwOrderAttachmentGet = function(req, res)
{
  var jsonobj = {message: 'No file to download'};
  //
  if (!__.isUndefined(req.query) && !__.isNull(req.query))
  {
    if (!__.isUndefined(req.query.orderattachmentid) && !__.isNull(req.query.orderattachmentid))
    {
      global.modorders.existingOrderAttachment
      (
        {
          orderattachmentid: req.query.orderattachmentid,
          uuid: req.query.uuid
        },
        function(err, result)
        {
          if (!err)
          {
            var filename = global.path.join(__dirname, global.config.folders.orderattachments + req.query.orderattachmentid + '_' + result.orderid + '_' + result.name);

            res.attachment(result.name);
            res.download(filename, result.name);
          }
          else
            res.json(jsonobj);
        }
      );
    }
    else
      res.json(jsonobj);
  }
  else
    res.json(jsonobj);
};
