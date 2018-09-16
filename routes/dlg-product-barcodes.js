function doDlgProductBarcodes(product)
{
  $('#dlgViewBarcode').dialog
  (
    {
      onClose: function()
      {
        $('#spnViewBCProduct').text('');
        $('#spnViewBCNo').text('');
      },
      onOpen: function()
      {
        $('#spnViewBCProduct').text(product.name);
        $('#spnViewBCNo').text(product.barcode);
      },
      buttons:
      [
        {
          text: 'Close',
          handler: function()
          {
            $('#dlgViewBarcode').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}
