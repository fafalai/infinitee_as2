function doDlgInventoryTransfer()
{
  function doListLocations(ev, args)
  {
    $('#cbInventorySourceLocations').combotree('loadData', cache_locations);
    $('#cbInventoryDestinationLocations').combotree('loadData', cache_locations);
  }

  // Need to destroy/re-create this event since it depends on arguments that change each call...
  $('#divEvents').on('listlocations', doListLocations);

  $('#dlgInventoryTransfer').dialog
  (
    {
      onClose: function()
      {
        $('#divEvents').off('listlocations', doListLocations);
      },
      onOpen: function()
      {
        $('#cbInventorySourceLocations').combotree
        (
          {
            valueField: 'id',
            textField: 'name',
            data: cache_locations
          }
        );

        $('#cbInventoryDestinationLocations').combotree
        (
          {
            valueField: 'id',
            textField: 'name',
            data: cache_locations
          }
        );

        $('#cbInventoryTransferProducts').combobox
        (
          {
            valueField: 'id',
            textField: 'code',
            groupField: 'productcategoryname',
            data: cache_products
          }
        );
      },
      buttons:
      [
        {
          text: 'Transfer',
          handler: function()
          {
            var srclocationid = doGetComboTreeSelectedId('cbInventorySourceLocations');
            var dstlocationid = doGetComboTreeSelectedId('cbInventoryDestinationLocations');
            var productid = $('#cbInventoryTransferProducts').combobox('getValue');
            var qty = $('#fldInventoryTransferQty').textbox('getValue');
            var batchno = $('#fldInventoryTransferBatchno').textbox('getValue');

            if (srclocationid != dstlocationid)
            {
              if (!_.isBlank(productid))
              {
                if (!_.isBlank(qty) && !_.toBigNum(qty).isZero())
                {
                  doServerDataMessage('transferinventory', {srclocationid: srclocationid, dstlocationid: dstlocationid, productid: productid, qty: qty, batchno: batchno}, {type: 'refresh'});
                  $('#dlgInventoryTransfer').dialog('close');
                }
                else
                  doShowError('Please enter a non zero qty');
              }
              else
                doShowError('Please select a product to add to inventory');
            }
            else
              doShowError('Can not transfer from and to the same location');
          }
        },
        {
          text: 'Close',
          handler: function()
          {
            $('#dlgInventoryTransfer').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}
