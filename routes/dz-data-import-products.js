var dzDataImportProducts = null;

function doDZDataImportProducts()
{
  if (dzDataImportProducts)
    return;

  dzDataImportProducts = new Dropzone
  (
    '#divDataImportProductsFile',
    {
      url: '/dataimportproducts',
      uploadMultiple: false,
      parallelUploads: 1,
      addRemoveLinks: true,
      maxFilesize: 10,
      dictDefaultMessage: 'Drop product files here to import',
      init: function()
      {
        this.on
        (
          'sending',
          function(file, xhr, formData)
          {
            formData.append('uuid', uuid);
            formData.append('productcategoryid', $('#cbImportProductCategories').textbox('getValue'));
          }
        );

        this.on
        (
          'complete',
          function(file)
          {
          }
        );

        this.on
        (
          'success',
          function(file, res)
          {
          }
        );

        this.on
        (
          'reset',
          function(file, xhr, formData)
          {
          }
        );
      },
      accept: function(file, done)
      {
        done();
      }
    }
  );
}
