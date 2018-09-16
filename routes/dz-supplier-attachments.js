var dzSupplierAttachments = null;

function doDZSupplierAttachments()
{
  if (dzSupplierAttachments)
    return;

  dzSupplierAttachments = new Dropzone
  (
    '#divSupplierAttachmentFile',
    {
      url: '/dropsupplierattachment',
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
            formData.append('supplierid', selectedSupplierIdAttachmentId);
            formData.append('uuid', uuid);
            // TODO: Don't know why we need to use getText rather than getValue...
            formData.append('description', $('#fldSupplierAttachmentDescription').textbox('getText'));
          }
        );

        this.on
        (
          'success',
          function(file, res)
          {
            $('#fldSupplierAttachmentDescription').textbox('setValue', '');
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
