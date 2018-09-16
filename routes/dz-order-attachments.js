var dzOrderAttachments = null;

function doDZOrderAttachments()
{
  if (dzOrderAttachments)
    return;

  dzOrderAttachments = new Dropzone
  (
    '#divNewOrderAttachmentFile',
    {
      url: '/droporderattachment',
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
            formData.append('orderid', selectedOrderIdAttachmentId);
            formData.append('uuid', uuid);
            // TODO: Don't know why we need to use getText rather than getValue...
            formData.append('description', $('#fldNewOrderAttachmentDescription').textbox('getText'));
            formData.append('isthumbnail', doSwitchButtonChecked('cbNewOrderAttachmentThumbnail') ? 1 : 0);
          }
        );

        this.on
        (
          'success',
          function(file, res)
          {
            $('#fldNewOrderAttachmentDescription').textbox('setValue', '');
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
