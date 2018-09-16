var dzPrintTemplates = null;

function doDZPrintTemplates()
{
  if (dzPrintTemplates)
    return;

  dzPrintTemplates = new Dropzone
  (
    '#divPrintTemplateFile',
    {
      url: '/dropprinttemplate',
      uploadMultiple: false,
      parallelUploads: 1,
      addRemoveLinks: true,
      maxFilesize: 10,
      dictDefaultMessage: 'Drop files here to upload - description text will be added',
      init: function()
      {
        this.on
        (
          'sending',
          function(file, xhr, formData)
          {
            formData.append('printtemplateid', selectedPrintTemplateId);
            formData.append('uuid', uuid);
            // TODO: Don't know why we need to use getText rather than getValue...
            formData.append('description', $('#fldPrintTemplateDescription').textbox('getText'));
          }
        );

        this.on
        (
          'success',
          function(file, res)
          {
            $('#fldPrintTemplateDescription').textbox('setValue', '');
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
