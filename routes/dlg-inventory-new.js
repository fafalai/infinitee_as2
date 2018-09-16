function doDlgInventoryNew()
{
  function doListLocations(ev, args)
  {
    $('#cbInventoryNewLocations').combotree('loadData', cache_locations);
  }

  $('#divEvents').on('listlocations', doListLocations);

  $('#dlgInventoryNew').dialog
  (
    {
      onClose: function()
      {
        $('#divEvents').off('listlocations', doListLocations);
      },
      onOpen: function()
      {
        $('#cbInventoryNewLocations').combotree
        (
          {
            valueField: 'id',
            textField: 'name',
            data: cache_locations,
            onSelect: function(record)
            {
            }
          }
        );

        $('#cbInventoryNewProducts').combobox
        (
          {
            valueField: 'id',
            textField: 'code',
            groupField: 'productcategoryname',
            data: cache_products,
            onSelect: function(record)
            {
            }
          }
        );

        $('#cbInventoryNewTypes').combobox
        (
          {
            valueField: 'id',
            textField: 'name',
            data: inventorytypes,
            onSelect: function(record)
            {
            }
          }
        );

        $('#dtInventoryNewDateExpiry').datebox(dateboxParserObj);
        $('#dtInventoryNewDateProduction').datebox(dateboxParserObj);
      },
      buttons:
      [
        {
          text: 'Add',
          handler: function()
          {
            var locationid = doGetComboTreeSelectedId('cbInventoryNewLocations');
            var productid = $('#cbInventoryNewProducts').combobox('getValue');
            var qty = $('#fldInventoryNewQty').textbox('getValue');
            var batchno = $('#fldInventoryNewBatchno').textbox('getValue');
            var dateexpiry = $('#dtInventoryNewDateExpiry').datebox('getValue');
            var dateproduction = $('#dtInventoryNewDateProduction').datebox('getValue');
            var type = $('#cbInventoryNewTypes').combobox('getValue');
            var comments = $('#fldInventoryNewComment').textbox('getValue');

            if (!_.isBlank(productid))
            {
              if (!_.isBlank(qty) && !_.toBigNum(qty).isZero())
              {
                if (!_.isBlank(type))
                {
                  doServerDataMessage('addinventory', {locationid: locationid, productid: productid, qty: qty, batchno: batchno, dateexpiry: dateexpiry, dateproduction: dateproduction, type: type, comments: comments}, {type: 'addinventory'});
                  $('#dlgInventoryNew').dialog('close');
                }
                else
                  doShowError('Please select an inventory adjustment type');
              }
              else
                doShowError('Please enter a non zero qty');
            }
            else
              doShowError('Please select a product to add to inventory');
          }
        },
        {
          text: 'Reset',
          handler: function()
          {
            $('#cbInventoryNewLocations').combotree('clear');
            $('#cbInventoryNewProducts').combobox('clear');
            $('#cbInventoryNewTypes').combobox('clear');

            $('#fldInventoryNewQty').textbox('clear');
            $('#fldInventoryNewBatchno').textbox('clear');
            $('#fldInventoryNewComment').textbox('clear');

            $('#dtInventoryNewDateExpiry').datebox('clear');
            $('#dtInventoryNewDateProduction').datebox('clear');
          }
        },
        {
          text: 'Close',
          handler: function()
          {
            $('#dlgInventoryNew').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}
