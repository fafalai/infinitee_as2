// TODO: Send both uuid and fguid - to make sure it's a current session and correct user..
// OR just send fguid since we can reverse lookup uuid etc from that and keeps things anonymous over the wire...
exports.dropDataImportProductsPost = function(req, res)
{
  var jsonobj = {message: 'Error writing file'};
  //
  if (!__.isUndefined(req.body) && !__.isNull(req.body))
  {
    if (!__.isUndefined(req.files) && !__.isUndefined(req.files.file))
    {
      console.log('productcategoryid: ' + req.body.productcategoryid);
      global.modimport.ImportMyobProducts({filename: req.files.file.path, originalfilename: req.files.file.originalFilename, uuid: req.body.uuid, productcategoryid: req.body.productcategoryid});

      res.json({message: 'Processing product import...', type: req.body.type, filename: req.files.file.originalFilename});
    }
    else
      res.json({message: 'No file to import'});
  }
  else
    res.json({message: 'No form to import'});
};

exports.dropDataImportClientsPost = function(req, res)
{
  var jsonobj = {message: 'Error writing file'};
  //
  if (!__.isUndefined(req.body) && !__.isNull(req.body))
  {
    if (!__.isUndefined(req.files) && !__.isUndefined(req.files.file))
    {
      global.modimport.ImportMyobClients({filename: req.files.file.path, originalfilename: req.files.file.originalFilename, uuid: req.body.uuid});

      res.json({message: 'Processing client import...', type: req.body.type, filename: req.files.file.originalFilename});
    }
    else
      res.json({message: 'No file to import'});
  }
  else
    res.json({message: 'No form to import'});
};

exports.dropDataImportSuppliersPost = function(req, res)
{
  var jsonobj = {message: 'Error writing file'};
  //
  if (!__.isUndefined(req.body) && !__.isNull(req.body))
  {
    if (!__.isUndefined(req.files) && !__.isUndefined(req.files.file))
    {
      global.modimport.ImportMyobSuppliers({filename: req.files.file.path, originalfilename: req.files.file.originalFilename, uuid: req.body.uuid});

      res.json({message: 'Processing supplier import...', type: req.body.type, filename: req.files.file.originalFilename});
    }
    else
      res.json({message: 'No file to import'});
  }
  else
    res.json({message: 'No form to import'});
};

exports.dropDataImportEmployeesPost = function(req, res)
{
  var jsonobj = {message: 'Error writing file'};
  //
  if (!__.isUndefined(req.body) && !__.isNull(req.body))
  {
    if (!__.isUndefined(req.files) && !__.isUndefined(req.files.file))
    {
      global.modimport.ImportMyobEmployees({filename: req.files.file.path, originalfilename: req.files.file.originalFilename, uuid: req.body.uuid});

      res.json({message: 'Processing employee import...', type: req.body.type, filename: req.files.file.originalFilename});
    }
    else
      res.json({message: 'No file to import'});
  }
  else
    res.json({message: 'No form to import'});
};

exports.dropDataImportAccountsPost = function(req, res)
{
  var jsonobj = {message: 'Error writing file'};
  //
  if (!__.isUndefined(req.body) && !__.isNull(req.body))
  {
    if (!__.isUndefined(req.files) && !__.isUndefined(req.files.file))
    {
      global.modimport.ImportMyobAccounts({filename: req.files.file.path, originalfilename: req.files.file.originalFilename, uuid: req.body.uuid});

      res.json({message: 'Processing account import...', type: req.body.type, filename: req.files.file.originalFilename});
    }
    else
      res.json({message: 'No file to import'});
  }
  else
    res.json({message: 'No form to import'});
};
