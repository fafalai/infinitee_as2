var dzDataImportClients = null;

function doDZDataImportClients()
{
  if (dzDataImportClients)
    return;

  dzDataImportClients = new Dropzone
  (
    '#divDataImportClientsFile',
    {
      url: '/dataimportclients',
      uploadMultiple: false,
      parallelUploads: 1,
      addRemoveLinks: true,
      maxFilesize: 10,
      dictDefaultMessage: 'Drop client files here to import',
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
