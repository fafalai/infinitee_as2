// TODO: Send both uuid and fguid - to make sure it's a current session and correct user..
// OR just send fguid since we can reverse lookup uuid etc from that and keeps things anonymous over the wire...
exports.dropJobSheetPost = function(req, res)
{
  var jsonobj = {message: 'Error writing file'};
  //
  if (!__.isUndefined(req.body) && !__.isNull(req.body))
  {
    if (!__.isUndefined(req.body.jobsheetid) && !__.isNull(req.body.jobsheetid))
    {
      if (!__.isUndefined(req.files) && !__.isUndefined(req.files.file))
      {
        global.modtpcc.updateJobSheetImage
        (
          {
            filename: req.files.file.originalFilename,
            jobsheetid: req.body.jobsheetid,
            uuid: req.body.uuid,
            mimetype: req.files.file.type,
            size: req.files.file.size
          },
          function(err)
          {
            if (!err)
            {
              var filename = global.path.join(__dirname, global.doJobSheetImageURL(req.body.jobsheetid, req.files.file.originalFilename, req.files.file.type));
              //
              global.fs.rename
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
                          jsonobj = {jobsheetid: req.body.jobsheetid, filename: req.files.file.originalFilename};
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
    }
    else
      res.json({message: 'No file to upload'});
  }
  else
    res.json({message: 'No form to upload'});
};
