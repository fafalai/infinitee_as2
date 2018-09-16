function doDlgEmailOrder(order, type)
{
  var title = '';
  var subject = '';
  var editorPanel = null;

  function doLoad(ev, args)
  {
    var html = (args.pdata.type == itype_order_order) ? args.data.config.emailordertemplate : (args.pdata.type == itype_order_invoice) ? args.data.config.emailinvoicetemplate : (args.pdata.type == itype_order_quote) ? args.data.config.emailquotetemplate : '';

    if (!_.isBlank(html))
    {
      html = html.replace('$(orderorderno)', order.orderno);
      html = html.replace('$(orderinvoiceno)', order.invoiceno);
      html = html.replace('$(custname)', order.name);
      html = html.replace('$(username)', uname);

      nicEditors.findEditor('fldOrderEmailMessage').setContent(html);
    }
    else
      doShowError('No email template found...');
  }

  function doSent(ev, args)
  {
    doShowSuccess('Email successfully sent');
    doServerMessage('emailhistory', {type: 'refresh'});

    $('#dlgOrderEmail').dialog('close');
  }

  function doList(ev, args)
  {
    var recipients = '';

    args.data.rs.forEach
    (
      function(row)
      {
        if (!_.isBlank(recipients))
          recipients += ', ';

        if (!_.isNull(row.contact1) && !_.isBlank(row.contact1) && !_.isNull(row.email1) && !_.isBlank(row.email1))
          recipients += '"' + row.contact1 + '" <' + row.email1 + '>';

        if (!_.isNull(row.contact2) && !_.isBlank(row.contact2) && !_.isNull(row.email2) && !_.isBlank(row.email2))
        {
          if (!_.isBlank(recipients))
            recipients += ', ';

          recipients += '"' + row.contact2 + '" <' + row.email2 + '>';
        }
      }
    );

    $('#fldOrderEmailRecipients').textbox('setValue', recipients);
  }

  // Need to destroy/re-create this event since it depends on arguments that change each call...
  $('#divEvents').on('loademailtemplates', doLoad);
  $('#divEvents').on('emailorder', doSent);
  $('#divEvents').on('emailinvoice', doSent);
  $('#divEvents').on('listemails', doList);

  switch (type)
  {
    case itype_order_order:
      title = 'Email Order';
      subject = 'Order: ' + order.orderno;
      break;
    case itype_order_invoice:
      title = 'Email Invoice';
      subject = 'Invoice: ' + order.invoiceno;
  }

  $('#dlgOrderEmail').dialog
  (
    {
      title: title,
      onClose: function()
      {
        order = {};
        type = null;
        $('#fldOrderEmailRecipients').textbox('clear');
        $('#fldOrderEmailMessage').html('');

        $('#divEvents').off('loademailtemplates', doLoad);
        $('#divEvents').off('emailorder', doSent);
        $('#divEvents').off('emailinvoice', doSent);
        $('#divEvents').off('listemails', doList);
      },
      onOpen: function()
      {
        $('#fldOrderEmailRecipients').textbox
        (
          {
            icons:
            [
              {
                iconCls:'icon-add',
                iconAlign: 'right',
                handler: function(ev)
                {
                  // $(ev.data.target).textbox('setValue', 'Something added!');
                }
              },
            ]
          }
        );

        $('#fldOrderEmailSubject').textbox('setValue', subject);

        if (_.isNull(editorPanel))
          editorPanel = new nicEditor({fullPanel : true, iconsPath : '/js/nicedit/nicEditorIcons.gif'}).panelInstance('fldOrderEmailMessage');

        doServerMessage('loademailtemplates', {type: type});

        if (!_.isUndefined(order.clientid))
          doServerDataMessage('listemails', {clientid: order.clientid}, {type: 'refresh'});

        $('#fldOrderEmailMessage').html('');
      },
      buttons:
      [
        {
          text: 'Email',
          handler: function()
          {
            var recipients = $('#fldOrderEmailRecipients').textbox('getValue');
            var subject = $('#fldOrderEmailSubject').textbox('getValue');
            var message = nicEditors.findEditor('fldOrderEmailMessage').getContent();

            switch (type)
            {
              case itype_order_order:
                doServerDataMessage('emailorder', {orderid: order.id, recipients: recipients, subject: subject, message: message}, {type: 'refresh'});
                break;
              case itype_order_invoice:
                doServerDataMessage('emailinvoice', {orderid: order.id, recipients: recipients, subject: subject, message: message}, {type: 'refresh'});
                break;
            }
          }
        },
        {
          text: 'Close',
          handler: function()
          {
            $('#dlgOrderEmail').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}
