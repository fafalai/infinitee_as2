exports.throwClientAttachmentGet = function(req, res)
{
  var jsonobj = {message: 'No file to download'};
  //
  if (!__.isUndefined(req.query) && !__.isNull(req.query))
  {
    if (!__.isUndefined(req.query.clientattachmentid) && !__.isNull(req.query.clientattachmentid))
    {
      global.modclients.existingClientAttachment
      (
        {
          clientattachmentid: req.query.clientattachmentid,
          uuid: req.query.uuid
        },
        function(err, result)
        {
          if (!err)
          {
            var filename = global.path.join(__dirname, global.config.folders.clientattachments + req.query.clientattachmentid + '_' + result.clientid + '_' + result.name);

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
