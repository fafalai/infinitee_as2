exports.throwSupplierAttachmentGet = function(req, res)
{
  var jsonobj = {message: 'No file to download'};
  //
  if (!__.isUndefined(req.query) && !__.isNull(req.query))
  {
    if (!__.isUndefined(req.query.supplierattachmentid) && !__.isNull(req.query.supplierattachmentid))
    {
      global.modsuppliers.existingSupplierAttachment
      (
        {
          supplierattachmentid: req.query.supplierattachmentid,
          uuid: req.query.uuid
        },
        function(err, result)
        {
          if (!err)
          {
            var filename = global.path.join(__dirname, global.config.folders.clientattachments + req.query.supplierattachmentid + '_' + result.supplierid + '_' + result.name);

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
