exports.throwPrintTemplateGet = function(req, res)
{
  var jsonobj = {message: 'No file to download'};
  //
  if (!__.isUndefined(req.query) && !__.isNull(req.query))
  {
    if (!__.isUndefined(req.query.printtemplateid) && !__.isNull(req.query.printtemplateid))
    {
      global.modconfig.existingPrintTemplate
      (
        {
          printtemplateid: req.query.printtemplateid,
          uuid: req.query.uuid
        },
        function(err, result)
        {
          if (!err)
          {
            var filename = global.path.join(__dirname, global.config.folders.printtemplates + req.query.printtemplateid + '_' + result.name);

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
  