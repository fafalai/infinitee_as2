// TODO: Send both uuid and fguid - to make sure it's a current session and correct user..
// OR just send fguid since we can reverse lookup uuid etc from that and keeps things anonymous over the wire...
exports.dropPrintTemplatePost = function(req, res)
{
  var jsonobj = {message: 'Error writing file'};
  //
  if (!__.isUndefined(req.body) && !__.isNull(req.body))
  {
    if (!__.isUndefined(req.files) && !__.isUndefined(req.files.file))
    {
      var printtemplateid = (__.isUndefined(req.body.printtemplateid) || (req.body.printtemplateid == 'null')) ? null : __.sanitiseAsBigInt(req.body.printtemplateid);

      // Creating new template or updating existing one?
      if (__.isNull(printtemplateid))
      {
        global.modconfig.newPrintTemplate
        (
          {
            filename: req.files.file.originalFilename,
            uuid: req.body.uuid,
            description: req.body.description,
            mimetype: req.files.file.type,
            size: req.files.file.size
          },
          function(err, id)
          {
            if (!err)
            {
              var filename = global.path.join(__dirname, global.config.folders.printtemplates + id + '_' + req.files.file.originalFilename);

              global.copyFile
              (
                req.files.file.path,
                filename,
                function(err)
                {
                  if (!err)
                  {
                    // Remove original file if still there...
                    global.fs.unlink
                    (
                      req.files.file.path,
                      function()
                      {
                        if (!err)
                          jsonobj = {id: id, filename: req.files.file.originalFilename};
                        res.json(jsonobj);
                      }
                    );
                  }
                  else
                    res.json(jsonobj);
                }
              );
            }
            else
              res.json(jsonobj);
          }
        );
      }
      else
      {
        global.modconfig.savePrintTemplate
        (
          {
            filename: req.files.file.originalFilename,
            printtemplateid: printtemplateid,
            uuid: req.body.uuid,
            description: req.body.description,
            mimetype: req.files.file.type,
            size: req.files.file.size
          },
          function(err, oldfilename)
          {
            if (!err)
            {
              var newfilename = global.path.join(__dirname, global.config.folders.printtemplates + printtemplateid + '_' + req.files.file.originalFilename);
              var oldfilename = global.path.join(__dirname, global.config.folders.printtemplates + printtemplateid + '_' + oldfilename);

              // Remove current file
              global.fs.unlink
              (
                oldfilename,
                function(err)
                {
                  if (!err || (err.code == 'ENOENT'))
                  {
                    global.fs.rename
                    (
                      req.files.file.path,
                      newfilename,
                      function(err)
                      {
                        if (!err)
                        {
                          // Remove original file if still there...
                          global.fs.unlink
                          (
                            req.files.file.path,
                            function()
                            {
                              if (!err)
                                jsonobj = {id: printtemplateid, filename: req.files.file.originalFilename};
                              res.json(jsonobj);
                            }
                          );
                        }
                        else
                          res.json(jsonobj);
                      }
                    );
                  }
                }
              );
            }
            else
              res.json(jsonobj);
          }
        );
      }
    }
    else
      res.json({message: 'No file to upload'});
  }
  else
    res.json({message: 'No form to upload'});
};
