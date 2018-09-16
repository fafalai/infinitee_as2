var suppliersTabWidgetsLoaded = false;

function doSuppliersSearch(value, name)
{
  doSearchCodeNameInTree('divSuppliersTG', value);
}

function doSuppliersShowActiveorAll(checked)
{
  primus.emit('listsuppliers', {fguid: fguid, uuid: uuid, session: session, showinactive: !checked, pdata: {type: 'refresh'}});
}

function doSuppliersTabWidgets()
{
  if (suppliersTabWidgetsLoaded)
    return;

  suppliersTabWidgetsLoaded = true;

  var editingSupplierId = null;

  function doNewRoot()
  {
    doDlgSupplierNew(null, null);
  }

  function doNew()
  {
    doTreeGridGetSelectedRowData
    (
      'divSuppliersTG',
      function(row)
      {
        doDlgSupplierNew(row.id, null);
      }
    );
  }

  function doClear()
  {
    $('#divSuppliersTG').treegrid('unselectAll');
  }

  function doRemove()
  {
    if (!doTreeGridGetSelectedRowData
      (
        'divSuppliersTG',
        function(row)
        {
          doPromptYesNoCancel
          (
            'Remove ' + row.name + ' and ALL subsuppliers (Yes) or ONLY this supplier (No)?',
            function(result)
            {
              if (!_.isNull(result))
                primus.emit('expiresupplier', {fguid: fguid, uuid: uuid, session: session, supplierid: row.id, cascade: result, pdata: {type: 'dosuppliersremove'}});
            }
          );
        }
      ))
    {
      doShowError('Please select an employee to remove');
    }
  }

  function doNotes()
  {
    if (!doTreeGridGetSelectedRowData
      (
        'divSuppliersTG',
        function(row)
        {
          doDlgSupplierNotes(row);
        }
      ))
    {
      doShowError('Please select a supplier to view');
    }
  }

  function doAttachments()
  {
    if (!doTreeGridGetSelectedRowData
      (
        'divSuppliersTG',
        function(row)
        {
          doDlgSupplierAttachments(row);
        }
      ))
    {
      doShowError('Please select a supplier to view/edit attachments');
    }
  }

  function doRemoveParent()
  {
    doTreeGridGetSelectedRowData
    (
      'divSuppliersTG',
      function(row)
      {
        primus.emit('changesupplierparent', {fguid: fguid, uuid: uuid, session: session, supplierid: row.id, parentid: null, pdata: {type: 'refresh'}});
      }
    );
  }

  function doListSuppliers(ev, args)
  {
    primus.emit('listsuppliers', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh', supplierid: args.data.supplierid}});
  }

  // Refresh when these events occur...
  $('#divEvents').on
  (
    'listsuppliers',
    function(ev, args)
    {
      $('#divSuppliersTG').treegrid('reload');

      doExpandTreeToId('divSuppliersTG', args.pdata.supplierid);
    }
  );

  $('#divEvents').on('newsupplier', doListSuppliers);
  $('#divEvents').on('savesupplier', doListSuppliers);
  $('#divEvents').on('changesupplierparent', doListSuppliers);
  $('#divEvents').on('expiresupplier', doListSuppliers);
  $('#divEvents').on('suppliercreated', doListSuppliers);
  $('#divEvents').on('suppliersaved', doListSuppliers);
  $('#divEvents').on('supplierparentchanged', doListSuppliers);
  $('#divEvents').on('supplierexpired', doListSuppliers);
  $('#divEvents').on('saveclient', doListSuppliers);

  $('#divEvents').on
  (
    'supplierspopup',
    function(ev, args)
    {
      if (args == 'newroot')
        doNewRoot();
      else if (args == 'new')
        doNew();
      else if (args == 'clear')
        doClear();
      else if (args == 'remove')
        doRemove();
      else if (args == 'removeparent')
        doRemoveParent();
      else if (args == 'notes')
        doNotes();
      else if (args == 'attachments')
        doAttachments();
      /*
      else if (args == 'neworder')
        doNewOrder();
      */
    }
  );

  $('#divSuppliersTG').treegrid
  (
    {
      idField: 'id',
      treeField: 'name',
      lines: true,
      collapsible: true,
      fitColumns: false,
      autoRowHeight: false,
      rownumbers: true,
      striped: true,
      toolbar: '#tbSuppliers',
      showFooter: true,
      sortName: 'name',
      sortOrder: 'asc',
      remoteSort: false,
      multiSort: true,
      loader: function(param, success, error)
      {
        success({total: cache_suppliers.length, rows: cache_suppliers});
        $(this).treegrid('collapseAll', 0);
        $(this).treegrid('reloadFooter', [{name: '<span class="totals_footer">' + doGetCountTreeArray(cache_suppliers) + ' Suppliers</span>'}]);
      },
      frozenColumns:
      [
        [
          {title: 'Name',     field: 'name',     width: 300, align: 'left',   resizable: true, sortable: true},
          {title: 'Code',     field: 'code',     width: 200, align: 'left',   resizable: true, sortable: true}
        ]
      ],
      columns:
      [
        [
          {title: 'Active',   field: 'isactive', width: 80,  align: 'center', resizable: true, formatter: function(value, row) {return mapBoolToImage(value);}},
          {title: 'Modified', field: 'date',     width: 150, align: 'right',  resizable: true, sortable: true},
          {title: 'By',       field: 'by',       width: 200, align: 'left',   resizable: true, sortable: true}
        ]
      ],
      onContextMenu: function(e, row)
      {
        doTreeGridContextMenu('divSuppliersTG', 'divSuppliersMenuPopup', e, row);
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
        doServerDataMessage('changesupplierparent', {supplierid: source.id, parentid: target.id}, {type: 'refresh'});
      },
      onDblClickCell: function(field, row)
      {
        doDlgSupplierNew(row.parentid, row.id);
      }
    }
  );
}


