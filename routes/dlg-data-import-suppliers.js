function doDlgDataImportSuppliers()
{
  $('#dlgDataImportSuppliers').dialog
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
            $('#dlgDataImportSuppliers').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}
