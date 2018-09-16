function doDlgRepUsedProductCodes()
{
  function doResults(ev, args)
  {
    $('#divRepUsedProductCodesG').datagrid('loadData', args.data.rs);
  }

  // Need to destroy/re-create this event since it depends on arguments that change each call...
  $('#divEvents').on('report-usedproductcodes', doResults);

  $('#dlgRepUsedProductCodes').dialog
  (
    {
      onClose: function()
      {
        $('#divEvents').off('report-usedproductcodes', doResults);
      },
      onOpen: function()
      {
        $('#divRepUsedProductCodesG').datagrid
        (
          {
            fitColumns: false,
            singleSelect: true,
            rownumbers: true,
            striped: true,
            columns:
            [
              [
                {title: 'Used?', field: 'used', width: 80, align: 'center', resizable: true, formatter: function(value, row) {return value ? 'Y' : 'N';}, styler: function(value, row, index) {if (!row.used) return 'color: ' + colour_deeppink;}},
                {title: 'Code',  field: 'code', width: 80, align: 'left',   resizable: true, styler: function(value, row, index) {if (!row.used) return 'color: ' + colour_deeppink;}}
               ]
            ]
          }
        );
      },
      buttons:
      [
        {
          text: 'Run',
          handler: function()
          {
            doServerDataMessage('report', {report: 'usedproductcodes', datefrom: '', dateto: ''}, {type: 'refresh'});
          }
        },
        {
          text: 'Close',
          handler: function()
          {
            $('#dlgRepUsedProductCodes').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}
