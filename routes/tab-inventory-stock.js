var invstockTabWidgetsLoaded = false;

function doInvStockTabSearch(value, name)
{
  doSearchCodeNameInGrid('divInventoryStockG', value, 'code');
}

function doInvStockTabWidgets()
{
  if (invstockTabWidgetsLoaded)
    return;

  invstockTabWidgetsLoaded = true;

  function doNew()
  {
    doDlgInventoryNew();
  }

  function doClear()
  {
    $('#divInventoryStockG').datagrid('clearSelections');
  }

  function doTransfer()
  {
    doDlgInventoryTransfer()
  }

  function doSaved()
  {
    doServerMessage('liststock', {type: 'refresh'});
  }

  // Refresh when these events occur...
  $('#divEvents').on
  (
    'liststock',
    function(ev, args)
    {
      var data = [];

      args.data.rs.forEach
      (
        function(i)
        {
          // Real inventory entries append to list of locations we just populated...
          data.push
          (
            {
              locationname: doNiceString(i.locationname),
              id: doNiceId(i.id),
              code: doNiceString(i.code),
              name: doNiceString(i.name),
              qty: _.formatnumber(i.qty, 4),
              orderqty: _.formatnumber(i.orderqty, 4)
            }
          );
        }
      );

      $('#divInventoryStockG').datagrid('loadData', data);
    }
  );

  $('#divEvents').on('addinventory', doSaved);
  $('#divEvents').on('inventoryadded', doSaved);
  $('#divEvents').on('buildinventory', doSaved);
  $('#divEvents').on('inventorybuilt', doSaved);
  $('#divEvents').on('orderdetailsaved', doSaved);
  $('#divEvents').on('orderdetailexpired', doSaved);
  $('#divEvents').on('expirebuild', doSaved);
  $('#divEvents').on('buildexpired', doSaved);
  $('#divEvents').on('transferinventory', doSaved);

  $('#divEvents').on
  (
    'stockspopup',
    function(ev, args)
    {
      if (args == 'new')
        doNew();
      else if (args == 'clear')
        doClear();
      else if (args == 'transfer')
        doTransfer();
      else if (args == 'builds')
        doBuilds();
    }
  );

  $('#divInventoryStockG').datagrid
  (
    {
      idField: 'id',
      groupField: 'locationname',
      fitColumns: false,
      singleSelect: true,
      rownumbers: true,
      striped: true,
      toolbar: '#tbInvStock',
      view: groupview,
      frozenColumns:
      [
        [
          {title: 'Code',     field: 'code',     width: 300, align: 'left',  resizable: true}
        ]
      ],
      columns:
      [
        [
          {title: 'Name',     field: 'name',     width: 300, align: 'left',  resizable: true},
          {title: 'Qty',      field: 'qty',      width: 100, align: 'right', resizable: true, styler: function(value, row, index) {if (_.toBigNum(value).lessThan(0.0)) return css_gridcol_qty_neg;}, formatter: function(value, row, index) {if (!_.isUndefined(row.id)) return _.niceformatqty(value); return value;}},
          {title: 'On Order', field: 'orderqty', width: 100, align: 'right', resizable: true, formatter: function(value, row, index) {if (!_.isUndefined(row.id)) return _.niceformatnumber(value); return value;}}
        ]
      ],
      groupFormatter: function(value, rows)
      {
        if (_.isNull(value) || _.isBlank(value))
          return '<span class="inventory_group_item">' + rows.length + ' Item(s)</span>';

        return value + ' - ' + rows.length + ' Item(s)';
      }
    }
  );

  doServerMessage('liststock', {type: 'refresh'});
}

