var dzClientAttachments = null;

function doDZClientAttachments()
{
  if (dzClientAttachments)
    return;

  
  dzClientAttachments = new Dropzone
  (
    // '#divNewClientAttachmentFile',
    '#div_Attachments',
    {
      // previewsContainer: ".dropzone-previews",
      url: '/dropclientattachment',
      clickable: '.tbClientAttachments_uploadFile',
      uploadMultiple: false,
      parallelUploads: 1,
      addRemoveLinks: true,
      previewTemplate : '<div style="display:none"></div>',
      maxFilesize: 10,
      createImageThumbnails: false,
      dictDefaultMessage: "",
      // dictDefaultMessage: 'Drop files here to upload - description text will be added',
      init: function()
      {
        // this.on(
        //   'dragover',
        //   (event) => {
        //     $('#div_Attachments').css('border','5px solid red');
        //     $('#div_Attachments').css('opacity','0.5');
        //   }
        // ),
        // this.on(
        //   'dragend',
        //   (event) => {
        //     $('#div_Attachments').css('border','0px');
        //     $('#div_Attachments').css('opacity','1');
        //   }
        // ),
        this.on
        (
          'error',
          (file, errMsg, xhr) => {
            noty({text: 'Error :' + errMsg , type: 'error', timeout: 5000});
          }
        ),
        this.on
        (
          'sending',
          function(file, xhr, formData)
          {
            // $('#div_Attachments').css('border','0px');
            // $('#div_Attachments').css('opacity','1');
            
            formData.append('clientid', selectedClientIdAttachmentId);
            formData.append('uuid', uuid);
            formData.append('parentid', attachment_parentid);
            // formData.append('description','');
            // TODO: Don't know why we need to use getText rather than getValue...
            // formData.append('description', $('#fldNewClientAttachmentDescription').textbox('getText'));
          }
        ),
        this.on
        (
          'success',
          function(file, res)
          {
            doServerDataMessage('listclientattachments', {clientid: selectedClientIdAttachmentId}, {type: 'refresh'});
            // $('#fldNewClientAttachmentDescription').textbox('setValue', '');
            this.removeFile(file);
            
          }
        ),
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