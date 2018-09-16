var productcategoriesTabWidgetsLoaded = false;

function doCategoriesTabSearch(value, name)
{
  doSearchCodeNameInTree('divCategoriesTG', value);
}

function doProductCategoriesTabWidgets()
{
  if (productcategoriesTabWidgetsLoaded)
    return;

  function doNewRoot()
  {
    doDlgProductCategoryNew(null, null);
  }

  function doNew()
  {
    doTreeGridGetSelectedRowData
    (
      'divCategoriesTG',
      function(row)
      {
        doDlgProductCategoryNew(row.id, null);
      }
    );
  }

  function doClear()
  {
    $('#divCategoriesTG').treegrid('unselectAll');
  }

  function doRemove()
  {
    if (!doTreeGridGetSelectedRowData
      (
        'divCategoriesTG',
        function(row)
        {
          doPromptYesNoCancel
          (
            'Remove ' + row.name + ' and ALL subcategories (Yes) or ONLY this category (No)?',
            function(result)
            {
              if (!_.isNull(result))
                primus.emit('expireproductcategory', {fguid: fguid, uuid: uuid, session: session, productcategoryid: row.id, cascade: result, pdata: {type: 'refresh'}});
            }
          );
        }
      ))
    {
      noty({text: 'Please select a category to remove', type: 'error', timeout: 4000});
    }
  }

  function doRemoveParent()
  {
    doTreeGridGetSelectedRowData
    (
      'divCategoriesTG',
      function(row)
      {
        primus.emit('changeproductcategoryparent', {fguid: fguid, uuid: uuid, session: session, productcategoryid: row.id, parentid: null, pdata: {type: 'changeproductcategoryparent'}});
      }
    );
  }

  // Refresh when these events occur...
  $('#divEvents').on
  (
    'listproductcategories',
    function(ev, args)
    {
      $('#divCategoriesTG').treegrid('reload');

      doExpandTreeToId('divCategoriesTG',args.pdata.productcategoryid);
    }
  );

  $('#divEvents').on
  (
    'newproductcategory',
    function(ev, args)
    {
      primus.emit('listproductcategories', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh', productcategoryid: args.data.productcategoryid}});
    }
  );

  $('#divEvents').on
  (
    'saveproductcategory',
    function(ev, args)
    {
      primus.emit('listproductcategories', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh', productcategoryid: args.data.productcategoryid}});
    }
  );

  $('#divEvents').on
  (
    'changeproductcategoryparent',
    function(ev, args)
    {
      primus.emit('listproductcategories', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh', productcategoryid: args.data.productcategoryid}});
    }
  );

  $('#divEvents').on
  (
    'expireproductcategory',
    function(ev, args)
    {
      primus.emit('listproductcategories', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
    }
  );

  $('#divEvents').on
  (
    'checkproductcategorycode',
    function(ev, args)
    {
      var categories = args.data.rs;

      if (categories.length > 0)
        doShowError('Product category code [' + categories[0].code + '] is already assigned to [' + categories[0].name + ']');
    }
  );

  $('#divEvents').on
  (
    'categoriespopup',
    function(ev, args)
    {
      if (args == 'newroot')
        doNewRoot();
      else if (args == 'new')
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
      else if (args == 'removeparent')
        doRemoveParent();
    }
  );

  productcategoriesTabWidgetsLoaded = true;

  $('#divCategoriesTG').treegrid
  (
    {
      idField: 'id',
      treeField: 'name',
      lines: true,
      collapsible: true,
      fitColumns: true,
      autoRowHeight: false,
      rownumbers: true,
      striped: true,
      toolbar: '#tbCategories',
      showFooter: true,
      sortName: 'name',
      sortOrder: 'asc',
      remoteSort: false,
      multiSort: true,
      loader: function(param, success, error)
      {
        success({total: cache_productcategories.length, rows: cache_productcategories});
        $(this).treegrid('reloadFooter', [{name: '<span class="totals_footer">' + doGetCountTreeArray(cache_productcategories) + ' Categories</span>'}]);
      },
      columns:
      [
        [
          {title: 'Name',     field: 'name', width: 300, align: 'left',  resizable: true, editor: 'text', sortable: true},
          {title: 'Code',     field: 'code', width: 200, align: 'left',  resizable: true, editor: 'text', sortable: true},
          {title: 'Modified', field: 'date', width: 150, align: 'right', resizable: true, sortable: true},
          {title: 'By',       field: 'by',   width: 200, align: 'left',  resizable: true, sortable: true}
        ]
      ],
      onContextMenu: function(e, row)
      {
        doTreeGridContextMenu('divCategoriesTG', 'divCategoriesMenuPopup', e, row);
      },
      onLoadSuccess: function(row)
      {
        $(this).treegrid('enableDnd');
      },
      onBeforeDrag: function(source)
      {
        return true;
      },
      onDragOver: function(target, source)
      {
        return true;
      },
      onBeforeDrop: function(target, source, point)
      {
        return true;
      },
      onDrop: function(target, source, point)
      {
        primus.emit('changeproductcategoryparent', {fguid: fguid, uuid: uuid, session: session, productcategoryid: source.id, parentid: target.id, pdata: {type: 'refresh'}});
      },
      onDblClickCell: function(field, row)
      {
        doDlgProductCategoryNew(row.parentid, row.id);
      }
    }
  );
}

