var productsTabWidgetsLoaded = false;

function doProductsTabWidgets()
{
  if (productsTabWidgetsLoaded)
    return;

  function doNew()
  {
    var productcategoryid = $('#cbProductsCategories').combobox('getValue');

    if (!_.isBlank(productcategoryid))
      doDlgProductNew(productcategoryid, null);
    else
      noty({text: 'Please select a product category for new product', type: 'error', timeout: 4000});
  }

  function doClear()
  {
    $('#divProductsG').treegrid('clearSelections');
  }

  function doRemove()
  {
    var rows = $('#divProductsG').datagrid('getSelections');

    if (rows.length == 0)
      noty({text: 'Please select one or more products to remove', type: 'error', timeout: 4000});
    else if (rows.length == 1)
    {
      var row = rows[0];
      doPromptOkCancel
      (
        'Remove ' + row.name + '?',
        function(result)
        {
          if (!_.isNull(result))
            primus.emit('expireproduct', {fguid: fguid, uuid: uuid, session: session, productid: row.id, pdata: {type: 'refresh'}});
        }
      );
    }
    else
    {
      doPromptOkCancel
      (
        'Remove ' + rows.length + ' products?',
        function(result)
        {
          if (!_.isNull(result))
          {
            rows.forEach
            (
              function(row)
              {
                primus.emit('expireproduct', {fguid: fguid, uuid: uuid, session: session, productid: row.id, pdata: {type: 'refresh'}});
              }
            );
          }
        }
      );
    }
  }

  function doDuplicate()
  {
    if (!doGridGetSelectedRowData
      (
        'divProductsG',
        function(row)
        {
          primus.emit('duplicateproduct', {fguid: fguid, uuid: uuid, session: session, productid: row.id, pdata: {type: 'refresh'}});
        }
      ))
    {
      noty({text: 'Please select a product to duplicate', type: 'error', timeout: 4000});
    }
  }

  function doViewPrices()
  {
    if (!doGridGetSelectedRowData
      (
        'divProductsG',
        function(row)
        {
          doDlgProductPricing(row);
        }
      ))
    {
      noty({text: 'Please select a product to view', type: 'error', timeout: 4000});
    }
  }

  function doSearch()
  {
    // console.log("search,open dlg-product-search");
    doDlgProductSearch
    (
      function(product)
      {
        // console.log(product);
        // Don't select the combobox else will trigger the load - we wanna control it so we can pass on what product to auto-select when category is loaded...
        $('#cbProductsCategories').combotree('setValue', product.categoryid);
        primus.emit('listproductsbycategory', {fguid: fguid, uuid: uuid, session: session, productcategoryid: product.categoryid, pdata: {type: 'refresh', productid: product.id}});
      }
    );
  }

  function doChangeCategory()
  {
    if (!doGridGetSelectedRowData
      (
        'divProductsG',
        function(row)
        {
          doDlgProductChangeCategory(row);
        }
      ))
    {
      noty({text: 'Please select a product to change', type: 'error', timeout: 4000});
    }
  }

  // Refresh when these events occur...
  $('#divEvents').on
  (
    'listproductcategories',
    function(ev, args)
    {
      $('#cbProductsCategories').combotree('loadData', cache_productcategories);
    }
  );

  $('#divEvents').on
  (
    'listproductsbycategory',
    function(ev, args)
    {
      // console.log("listproductsbycategory");
      // console.log(args.pdata);
      $('#divProductsG').datagrid('reload');

      if (!_.isUndefined(args.pdata.productid) && !_.isNull(args.pdata.productid))
        $('#divProductsG').datagrid('selectRecord', args.pdata.productid);
    }
  );

  $('#divEvents').on
  (
    'newproduct',
    function(ev, args)
    {
      var productcategoryid = $('#cbProductsCategories').combobox('getValue');

      if (args.data,productcategoryid == productcategoryid)
      {
        primus.emit('listproductsbycategory', {fguid: fguid, uuid: uuid, session: session, productcategoryid: productcategoryid, pdata: {type: 'refresh'}});
      }
    }
  );

  $('#divEvents').on
  (
    'updateproduct',
    function(ev, args)
    {
      var productcategoryid = $('#cbProductsCategories').combobox('getValue');

      // Always get full product listing (for other comboboxes)
      primus.emit('listproducts', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});

      if (productcategoryid == args.data.productcategoryid)
      {
        doClear();
        primus.emit('listproductsbycategory', {fguid: fguid, uuid: uuid, session: session, productcategoryid: productcategoryid, pdata: {type: 'refresh'}});
      }
    }
  );

  $('#divEvents').on
  (
    'productupdated',
    function(ev, args)
    {
      // Always get full product listing (for other comboboxes)
      primus.emit('listproducts', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});

      if ($('#cbProductsCategories').combobox('getValue') == args.data.productcategoryid)
        primus.emit('listproductsbycategory', {fguid: fguid, uuid: uuid, session: session, productcategoryid: args.data.productcategoryid, pdata: {type: 'refresh'}});
    }
  );

  $('#divEvents').on
  (
    'checkproductcode',
    function(ev, args)
    {
      var products = args.data.rs;

      if (products.length > 0)
      {
        var productcategoryid = $('#cbProductsCategories').combobox('getValue');

        if (productcategoryid == products[0].productcategoryid)
          noty({text: 'Product code [' + products[0].code + '] is already assigned to [' + products[0].name + ']', type: 'error', timeout: 4000});
        else
          noty({text: 'Product code [' + products[0].code + '] is already assigned to [' + products[0].name + '] under category [' + products[0].productcategoryname + ']', type: 'error', timeout: 4000});
      }
    }
  );

  $('#divEvents').on
  (
    'gotoproduct',
    function(ev, args)
    {
      // Don't select the combobox else will trigger the load - we wanna control it so we can pass on what product to auto-select when category is loaded...
      $('#cbProductsCategories').combotree('setValue', args.productcategoryid);
      primus.emit('listproductsbycategory', {fguid: fguid, uuid: uuid, session: session, productcategoryid: args.productcategoryid, pdata: {type: 'refresh', productid: args.productid}});
    }
  );

  $('#divEvents').on
  (
    'productspopup',
    function(ev, args)
    {
      if (args == 'new')
        doNew();
      else if (args == 'clear')
        doClear();
      else if (args == 'edit')
        doEdit();
      else if (args == 'cancel')
        doCancel();
      else if (args == 'save')
        doSave();
      else if (args == 'remove')
        doRemove();
      else if (args == 'duplicate')
        doDuplicate();
      else if (args == 'viewprices')
        doViewPrices();
      else if (args == 'search')
        doSearch();
      else if (args == 'changecategory')
        doChangeCategory();
    }
  );

  productsTabWidgetsLoaded = true;

  $('#cbProductsCategories').combotree
  (
    {
      valueField: 'id',
      textField: 'name',
      data: cache_productcategories,
      limitToList: true,
      onSelect: function(record)
      {
        primus.emit('listproductsbycategory', {fguid: fguid, uuid: uuid, session: session, productcategoryid: record.id, pdata: {type: 'refresh'}});
      }
    }
  );

  $('#cbProductsBarcodeTypes').combobox
  (
    {
      valueField: 'id',
      textField: 'id',
      groupField: 'parentname',
      data: barcodetypes,
      onSelect: function(record)
      {
        console.log(record);
        var row = $('#divProductsG').datagrid('getSelected');
        if (row)
        {
          $('#divBarcodeView').barcode(row.barcode, record.id, {barHeight: 30});
        }
      }
    }
  );

  $('#divProductsG').datagrid
  (
    {
      idField: 'id',
      fitColumns: false,
      singleSelect: true,
      rownumbers: true,
      striped: true,
      toolbar: '#tbProducts',
      showFooter: true,
      sortName: 'code',
      sortOrder: 'asc',
      remoteSort: false,
      multiSort: true,
      loader: function(param, success, error)
      {
        success({total: cache_productsbycategory.length, rows: cache_productsbycategory});
        $(this).datagrid('reloadFooter', [{code: '<span class="totals_footer">' + cache_productsbycategory.length + ' Products</span>'}]);
      },
      frozenColumns:
      [
        [
          {title: 'Code',               rowspan: 2, field: 'code',                width: 300, align: 'left',   resizable: true, sortable: true}
        ],
        [
        ]
      ],
      columns:
      [
        [
          {title: 'Name',               rowspan: 2, field: 'name',                 width: 300, align: 'left',   resizable: true, sortable: true},
          {title: 'Cost Price',         rowspan: 2, field: 'costprice',            width: 80,  align: 'right',  resizable: true, sortable: true},
          {title: 'Sell Price',         rowspan: 2, field: 'sellprice',            width: 80,  align: 'right',  resizable: true, sortable: true},
          {title: 'Client',             rowspan: 2, field: 'clientid',             width: 200, align: 'left',   resizable: true, formatter: function(value, row) {return doGetStringFromIdInObjArray(cache_clients, value);}},
          {title: 'Inventory',          colspan: 3},
          {title: 'Active',             rowspan: 2, field: 'isactive',             width: 80,  align: 'center', resizable: true, formatter: function(value, row) {return mapBoolToImage(value);}},
          {title: 'Modified',           rowspan: 2, field: 'date',                 width: 150, align: 'right',  resizable: true, sortable: true},
          {title: 'By',                 rowspan: 2, field: 'by',                   width: 200, align: 'left',   resizable: true, sortable: true}
        ],
        [
          {title: 'Build Template',                 field: 'buildtemplateid',      width: 300, align: 'left',   resizable: true, formatter: function(value, row) {return doGetNameFromTreeArray(cache_buildtemplates, value);}},
          {title: 'Current Qty',                    field: 'inventoryqty',         width: 80,  align: 'right',  resizable: true, formatter: function(value, row, index) {return _.niceformatqty(value);}},
          {title: 'On Order',                       field: 'orderqty',             width: 80,  align: 'right',  resizable: true, styler: function(value, row, index) {if ((value < row.inventoryqty) || _.isBlank(row.inventoryqty)) return css_gridcol_qty_neg;}, formatter: function(value, row, index) {return _.niceformatqty(value);}},
        ]
      ],
      onRowContextMenu: function(e, index, row)
      {
        doGridContextMenu('divProductsG', 'divProductsMenuPopup', e, index, row);
      },
      onDblClickCell: function(index, field, value)
      {
        var productcategoryid = $('#cbProductsCategories').combobox('getValue');

        if (!_.isBlank(productcategoryid))
        {
          doGetGridGetRowDataByIndex
          (
            'divProductsG',
            index,
            function(row)
            {
              doDlgProductNew(productcategoryid, row.id);
            }
          );
        }
      }
    }
  );

  if (posonly)
  {
    $('#divProductsG').datagrid('hideColumn', 'costprice');
    $('#divProductsG').datagrid('hideColumn', 'buildtemplateid');
    $('#divProductsG').datagrid('hideColumn', 'inventoryqty');
    $('#divProductsG').datagrid('hideColumn', 'orderqty');
    $('#divProductsG').datagrid('hideColumn', 'isactive');
    $('#divProductsG').datagrid('hideColumn', 'clientid');
  }
}
