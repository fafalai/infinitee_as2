function doDlgPickABN(names)
{
  $('#dlgPickABN').dialog
  (
    {
      title: 'Found ' + names.length + ' companies - please select one...',
      onOpen: function()
      {
        $('#divMatchingABNsG').datagrid
        (
          {
            idField: 'Abn',
            fitColumns: true,
            singleSelect: true,
            striped: true,
            data: names,
            columns:
            [
              [
                {title: 'ABN',      field: 'Abn',      width: 120, align: 'left', styler: function(value, row, index) {return 'color: ' + colour_dodgerblue}},
                {title: 'Name',     field: 'Name',     width: 350, align: 'left', formatter: function(value, row, index) {if (!_.isUndefined(value)) return _.titleize(value);}},
                {title: 'Postcode', field: 'Postcode', width: 50,  align: 'left'},
                {title: 'State',    field: 'State',    width: 50,  align: 'left'}
              ]
            ],
            onClickRow: function(index, row)
            {
            }
          }
        );
      },
      onClose: function()
      {
        $('#divMatchingABNsG').datagrid('loadData', []);
        $('#divMatchingABNsG').datagrid('clearSelections');
      },
      buttons:
      [
        {
          text: 'Select',
          id: 'btnPickABNSelect',
          handler: function()
          {
            doGridGetSelectedRowData
            (
              'divMatchingABNsG',
              function(r)
              {
                $('#divEvents').trigger('abnselected', {name: _.titleize(r.Name), abn: r.Abn});
                $('#dlgPickABN').dialog('close');
              }
            );
          }
        },
        {
          text: 'Cancel',
          id: 'btnPickABNCancel',
          handler: function()
          {
            $('#dlgPickABN').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}
