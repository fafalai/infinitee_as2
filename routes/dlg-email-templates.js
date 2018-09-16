function doDlgEmailTemplate(template)
{
  var config = {};
  var editorPanel = null;

  function doLoad(ev, args)
  {
    var html = '';

    config = args.data.config;

    console.log(args);
    if (args.pdata.template == itype_order_order)
      html = config.emailordertemplate;
    else if (args.pdata.template == itype_order_invoice)
      html = config.emailinvoicetemplate;
    else if (args.pdata.template == itype_order_quote)
      html = config.emailquotetemplate;

    nicEditors.findEditor('divEmailTemplate').setContent(html);
  }

  function doSaved(ev, args)
  {
    doShowSuccess('Successfully saved template');
    $('#dlgEmailTemplate').dialog('close');
  }

  // Need to destroy/re-create this event since it depends on arguments that change each call...
  $('#divEvents').on('loademailtemplates', doLoad);
  $('#divEvents').on('saveemailtemplates', doSaved);

  $('#dlgEmailTemplate').dialog
  (
    {
      onClose: function()
      {
        config = {};

        editorPanel.removeInstance('divEmailTemplate');
        $('#divEmailTemplate').html('');
        editorPanel = null;

        $('#divEvents').off('loademailtemplates', doLoad);
        $('#divEvents').off('saveemailtemplates', doSaved);
      },
      onOpen: function()
      {
        if (_.isNull(editorPanel))
          editorPanel = new nicEditor({fullPanel : true, iconsPath : '/js/nicedit/nicEditorIcons.gif'}).panelInstance('divEmailTemplate', {hasPanel: true});

        doServerMessage('loademailtemplates', {type: 'refresh', template: template});
      },
      buttons:
      [
        {
          text: 'Save',
          handler: function()
          {
            var html = nicEditors.findEditor('divEmailTemplate').getContent();
            var emailordertemplate =  (template == itype_order_order) ? html : config.emailordertemplate;
            var emailinvoicetemplate =  (template == itype_order_invoice) ? html : config.emailinvoicetemplate;
            var emailquotetemplate =  (template == itype_order_quote) ? html : config.emailquotetemplate;

            doServerDataMessage('saveemailtemplates', {emailordertemplate: emailordertemplate, emailinvoicetemplate: emailinvoicetemplate, emailquotetemplate: emailquotetemplate}, {type: 'refresh'});
          }
        },
        {
          text: 'Close',
          handler: function()
          {
            $('#dlgEmailTemplate').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}

