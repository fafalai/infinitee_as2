var buildsTabWidgetsLoaded = false;

function doBuildsTabWidgets()
{
  var tb =
  [
    // {
    //   text: 'Build',
    //   iconCls: 'icon-add',
    //   handler: doBuild
    // },
    {
      text: 'Clear',
      iconCls: 'icon-clear',
      handler: doClear
    },
    {
      text: 'Remove',
      iconCls: 'icon-remove',
      handler: doRemove
    }
    // ,
    // {
    //   text: 'History',
    //   iconCls: 'icon-calendar',
    //   handler: doHistory
    // }
  ];

  if (buildsTabWidgetsLoaded)
    return;

  buildsTabWidgetsLoaded = true;

  function doClear()
  {
    $('#divBuildsG').datagrid('clearSelections');
  }

  // function doBuild()
  // {
  //   if (!doGridGetSelectedRowData
  //     (
  //       'divBuildsG',
  //       function(row)
  //       {
  //         doPromptOkCancel
  //         (
  //           'Build [' + row.qtybuilt + '] of ' + doGetStringFromIdInObjArray(cache_products, row.productid) + ' for order ' + row.orderno  + '?',
  //           function(result)
  //           {
  //             if (result)
  //               doServerDataMessage('buildinventory', {buildtemplateid: row.buildtemplateid, orderid: row.orderid, productid: row.productid, qty: row.qtybuilt}, {type: 'refresh'});
  //           }
  //         );
  //       }
  //     ))
  //   {
  //     doShowError('Please select an order/product to build');
  //   }
  // }

  function doSaved()
  {
    doServerMessage('listorderbuilds', {type: 'refresh'});
  }

  // function doHistory()
  // {
  //   doDlgInventoryBuilds();
  // }

  function doRemove()
  {
    if (!doGridGetSelectedRowData
      (
        'divBuildsG',
        function(row)
        {
          doPromptOkCancel
          (
            'Remove ' + row.qtyinbuild + ' of ' + row.productcode + '?',
            function(result)
            {
              if (result)
                doServerDataMessage('expirebuild', {buildid: row.orderbuildid}, {type: 'refresh'});
            }
          );
        }
      ))
    {
      doShowError('Please select a build to remove');
    }
  }

  // Refresh when these events occur...
  $('#divEvents').on
  (
    'listorderbuilds',
    function(ev, args)
    {
      var data = [];

      args.data.rs.forEach
      (
        function(b)
        {
          // Real inventory entries append to list of locations we just populated...
          data.push
          (
            {
              orderbuildid: doNiceId(b.orderbuildid),
              orderid: doNiceId(b.orderid),
              orderno: doNiceString(b.orderno),
              productid: doNiceId(b.productid),
              productcode: doNiceString(b.productcode),
              buildtemplateid: doNiceId(b.buildtemplateid),
              qtyordered: _.formatnumber(b.qtyordered, 4),
              qtyinbuild: _.formatnumber(b.qtyinbuild, 4),
              qtybuilt: _.formatnumber(b.qtybuilt, 4),
              dateordered: doNiceDate(b.dateordered),
              datebuilt: doNiceDate(b.datebuilt),
              userordered: doNiceTitleizeString(b.userordered),
              userbuilt: doNiceTitleizeString(b.userbuilt)
            }
          );
        }
      );

      $('#divBuildsG').datagrid('loadData', data);
      $('#divBuildsG').datagrid('reloadFooter', [{name: '<span class="totals_footer">' + data.length + ' Products</span>'}]);

      if (!_.isUndefined(args.pdata.orderbuildid) && !_.isNull(args.pdata.orderbuildid))
        $('#divBuildsG').datagrid('selectRecord', args.pdata.orderbuildid);
    }
  );

  $('#divEvents').on('listorders', doSaved);
  $('#divEvents').on('inventorybuilt', doSaved);
  $('#divEvents').on('buildinventory', doSaved);
  $('#divEvents').on('expirebuild', doSaved);

  $('#divEvents').on
  (
    'orderbuildspopup',
    function(ev, args)
    {
      if (args == 'build')
        doBuild();
    }
  );

  $('#divBuildsG').datagrid
  (
    {
      idField: 'orderbuildid',
      fitColumns: false,
      singleSelect: true,
      rownumbers: true,
      striped: true,
      toolbar: tb,
      showFooter: true,
      sortName: 'orderno',
      sortOrder: 'asc',
      remoteSort: false,
      multiSort: true,
      frozenColumns:
      [
        [
          {title: 'Order #',      rowspan: 2,  field: 'orderno',         width: 150, align: 'left',  resizable: true, editor: 'text', sortable: true}
        ],
        [
        ]
      ],
      columns:
      [
        [
          {title: 'Product',      rowspan: 2,  field: 'productname',     width: 200, align: 'left',  resizable: true, sortable: true},
          {title: 'Template',     rowspan: 2,  field: 'buildtemplateid', width: 200, align: 'left',  resizable: true, sortable: true, formatter: function(value, row) {return doGetNameFromTreeArray(cache_buildtemplates, value);}},
          {title: 'Manufactured', colspan: 4},
          {title: 'Order',        colspan: 3}
        ],
        [
          {title: 'Qty',                       field: 'qtyinbuild',      width: 100, align: 'right', resizable: true, sortable: true, editor: {type: 'numberbox', options: {groupSeparator: ',', precision: 0}}, formatter: function(value, row, index) {return _.niceformatqty(value);}},
          {title: 'Total Built',               field: 'qtybuilt',        width: 100, align: 'right', resizable: true, sortable: true, editor: {type: 'numberbox', options: {groupSeparator: ',', precision: 0}}, formatter: function(value, row, index) {return _.niceformatqty(value);}},
          {title: 'Date',                      field: 'datebuilt',       width: 150, align: 'right', resizable: true, sortable: true},
          {title: 'By',                        field: 'userbuilt',       width: 200, align: 'left',  resizable: true, sortable: true},

          {title: 'Qty',                       field: 'qtyordered',      width: 100, align: 'right', resizable: true, sortable: true, formatter: function(value, row, index) {return _.niceformatqty(value);}},
          {title: 'Date',                      field: 'dateordered',     width: 150, align: 'right', resizable: true, sortable: true},
          {title: 'By',                        field: 'userordered',     width: 200, align: 'left',  resizable: true, sortable: true}
        ]
      ],
      onRowContextMenu: function(e, index, row)
      {
      },
      onDblClickCell: function(index, field, value)
      {
      }
    }
  );

  doServerMessage('listorderbuilds', {type: 'refresh'});
}
