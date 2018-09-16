var dzClientAttachments = null;

function doDZClientAttachments()
{
  if (dzClientAttachments)
    return;

  // dzClientAttachments = new Dropzone
  // (
  //   '#divNewClientAttachmentFile',
  //   {
  //     url: '/dropclientattachment',
  //     uploadMultiple: false,
  //     parallelUploads: 1,
  //     addRemoveLinks: true,
  //     maxFilesize: 10,
  //     dictDefaultMessage: 'Drop files here to upload - description text will be added',
  //     init: function()
  //     {
  //       this.on
  //       (
  //         'sending',
  //         function(file, xhr, formData)
  //         {
  //           formData.append('clientid', selectedClientIdAttachmentId);
  //           formData.append('uuid', uuid);
  //           // TODO: Don't know why we need to use getText rather than getValue...
  //           formData.append('description', $('#fldNewClientAttachmentDescription').textbox('getText'));
  //         }
  //       );

  //       this.on
  //       (
  //         'success',
  //         function(file, res)
  //         {
  //           $('#fldNewClientAttachmentDescription').textbox('setValue', '');
  //           this.removeFile(file);
  //         }
  //       );

  //       this.on
  //       (
  //         'reset',
  //         function(file, xhr, formData)
  //         {
  //         }
  //       );
  //     },
  //     accept: function(file, done)
  //     {
  //       done();
  //     }
  //   }
  // );
}
