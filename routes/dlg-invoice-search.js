function doDlgInvoiceSearch()
{
  $('#dlgInvoiceSearch').dialog
  (
    {
      onClose: function()
      {
      },
      onOpen: function()
      {
        $('#cbSearchInvoiceClients').combobox
        (
          {
            valueField: 'id',
            textField: 'name',
            multiple: true,
            data: cache_clients,
            onSelect: function(record)
            {
            }
          }
        );

        $('#dtSearchInvoiceDateStart').datebox(dateboxParserObj);
        $('#dtSearchInvoiceDateEnd').datebox(dateboxParserObj);
      },
      buttons:
      [
        {
          text: 'Search',
          handler: function()
          {
            var invoiceno = $('#fldSearchInvoiceNo').textbox('getValue');
            var orderno = $('#fldSearchInvoiceOrderNo').textbox('getValue');
            var pono = $('#fldSearchInvoicePONo').textbox('getValue');
            var name = $('#fldSearchInvoiceOrderName').textbox('getValue');
            var clients = $('#cbSearchInvoiceClients').combobox('getValues');
            var datefrom = $('#dtSearchInvoiceDateStart').datebox('getValue');
            var dateto = $('#dtSearchInvoiceDateEnd').datebox('getValue');
            var maxhistory = $('#cbSearchInvoiceMaxHistory').combobox('getValue');

            doServerDataMessage
            (
              'searchinvoices',
              {
                invoiceno: invoiceno,
                orderno: orderno,
                pono: pono,
                name: name,
                clients: clients,
                datefrom: datefrom,
                dateto: dateto,
                maxhistory: maxhistory
              },
              {type: 'refresh'}
            );
          }
        },
        {
          text: 'Reset',
          handler: function()
          {
            $('#fldSearchInvoiceNo').textbox('clear');
            $('#fldSearchInvoiceOrderNo').textbox('clear');
            $('#fldSearchInvoicePONo').textbox('clear');
            $('#fldSearchInvoiceOrderName').textbox('clear');
            $('#cbSearchInvoiceClients').combobox('clear');
            $('#dtSearchInvoiceDateStart').datebox('clear');
            $('#dtSearchInvoiceDateEnd').datebox('clear');

            doServerMessage('listinvoices', {type: 'refresh'});
          }
        },
        {
          text: 'Close',
          handler: function()
          {
            $('#dlgInvoiceSearch').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}

