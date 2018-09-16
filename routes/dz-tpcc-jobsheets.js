var dzJobSheets = null;

function doDZJobSheets()
{
  if (dzJobSheets)
    return;

  dzJobSheets = new Dropzone
  (
    '#divJobSheetFile',
    {
      url: '/dropjobsheet',
      uploadMultiple: false,
      parallelUploads: 1,
      addRemoveLinks: true,
      maxFilesize: 10,
      dictDefaultMessage: 'Drop artwork here',
      init: function()
      {
        this.on
        (
          'sending',
          function(file, xhr, formData)
          {
            formData.append('jobsheetid', selectedJobSheetId);
            formData.append('uuid', uuid);
          }
        );

        this.on
        (
          'success',
          function(file, res)
          {
            this.removeFile(file);
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
