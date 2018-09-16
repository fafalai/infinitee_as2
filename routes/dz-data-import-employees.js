var dzDataImportEmployees = null;

function doDZDataImportEmployees()
{
  if (dzDataImportEmployees)
    return;

  dzDataImportEmployees = new Dropzone
  (
    '#divDataImportEmployeesFile',
    {
      url: '/dataimportemployees',
      uploadMultiple: false,
      parallelUploads: 1,
      addRemoveLinks: true,
      maxFilesize: 10,
      dictDefaultMessage: 'Drop employee files here to import',
      init: function()
      {
        this.on
        (
          'sending',
          function(file, xhr, formData)
          {
            formData.append('uuid', uuid);
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
