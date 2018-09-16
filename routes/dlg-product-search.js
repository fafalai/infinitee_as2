function doDlgProductSearch(callback)
{
  function doSearch(ev, args)
  {
    var data = [];

    args.data.rs.forEach
    (
      function(p)
      {
        data.push
        (
          {
            id: doNiceId(p.id),
            name: doNiceString(p.name),
            code: doNiceString(p.code),
            barcode: doNiceString(p.altcode),
            categoryid: doNiceId(p.productcategoryid),
            category: doNiceString(p.productcategoryname)
          }
        );
      }
    );

    $('#divProductSelectG').datagrid('loadData', data);
    $('#divProductSelectG').datagrid('reloadFooter', [{category: '<span class="totals_footer">' + data.length + ' found</span>'}]);
  }

  // Need to destroy/re-create this event since it depends on arguments that change each call...
  $('#divEvents').on('productsearch', doSearch);

  $('#dlgProductSearch').dialog
  (
    {
      onClose: function()
      {
        $('#divEvents').off('productsearch', doSearch);
      },
      onOpen: function()
      {
        $('#fldSearchProductText').textbox
        (
          {
            iconCls: 'icon-product',
            iconAlign: 'left',
            onChange: function(newValue, oldValue)
            {
              var maxhistory = $('#cbSearchOrderMaxHistory').combobox('getValue');

              doServerDataMessage('productsearch', {value: newValue, maxhistory: maxhistory}, {type: 'refresh'});
            }
          }
        );

        $('#divProductSelectG').datagrid
        (
          {
            idField: 'id',
            fitColumns: false,
            singleSelect: true,
            rownumbers: true,
            striped: true,
            showFooter: true,
            columns:
            [
              [
                {title: 'Category', field: 'category', width: 200, align: 'left', resizable: true},
                {title: 'Code',     field: 'code',     width: 200, align: 'left', resizable: true},
                {title: 'Name',     field: 'name',     width: 300, align: 'left', resizable: true},
                {title: 'Barcode',  field: 'barcode',  width: 100, align: 'left', resizable: true}
              ]
            ],
            onDblClickCell: function(index, field, value)
            {
              doGridGetSelectedRowData
              (
                'divProductSelectG',
                function(row)
                {
                  // console.log("dlg-product-search-dbl-click");
                  // console.log(row);
                  if (!_.isUndefined(callback) && !_.isNull(callback))
                  {
                    // console.log("callback:");
                    // console.log(callback);
                    callback(row);
                  }
                   
                }
              );

              $('#dlgProductSearch').dialog('close');
            }
          }
        );

        doTextboxFocus('fldSearchProductText');
      },
      buttons:
      [
        {
          text: 'Select',
          handler: function()
          {
            if (!_.isUndefined(callback) && !_.isNull(callback))
            {
              var row = $('#divProductSelectG').datagrid('getSelected');
              if (row)
              {
                callback(row);
                $('#dlgProductSearch').dialog('close');
              }
              else
                noty({text: 'Please select a product...', type: 'error', timeout: 4000});
            }
          }
        },
        {
          text: 'Close',
          handler: function()
          {
            $('#dlgProductSearch').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}

