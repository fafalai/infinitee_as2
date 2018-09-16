function doDlgDataImportProducts()
{
  $('#dlgDataImportProducts').dialog
  (
    {
      onClose: function()
      {
      },
      onOpen: function()
      {
        $('#cbImportProductCategories').combobox
        (
          {
            valueField: 'id',
            textField: 'name',
            data: cache_productcategories
          }
        );
      },
      buttons:
      [
        {
          text: 'Close',
          handler: function()
          {
            $('#dlgDataImportProducts').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}
