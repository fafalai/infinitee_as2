function doDlgDataImportClients()
{
  $('#dlgDataImportClients').dialog
  (
    {
      onClose: function()
      {
      },
      onOpen: function()
      {
      },
      buttons:
      [
        {
          text: 'Close',
          handler: function()
          {
            $('#dlgDataImportClients').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}
