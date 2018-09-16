function doDlgDataImportAccounts()
{
  $('#dlgDataImportAccounts').dialog
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
            $('#dlgDataImportAccounts').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}
