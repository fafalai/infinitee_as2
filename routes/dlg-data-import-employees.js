function doDlgDataImportEmployees()
{
  $('#dlgDataImportEmployees').dialog
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
            $('#dlgDataImportEmployees').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}
