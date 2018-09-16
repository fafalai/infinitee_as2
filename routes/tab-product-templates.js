var producttemplatesTabWidgetsLoaded = false;

function doTemplatesTabSearch(value, name)
{
  doSearchCodeNameInTree('divTemplatesTG', value);
}

function doProductTemplatesTabWidgets()
{
  var editingId = null;

  if (producttemplatesTabWidgetsLoaded)
    return;

  producttemplatesTabWidgetsLoaded = true;

  function doNewRoot()
  {
    doServerDataMessage('newproducttemplate', {parentid: null, name: 'New Template', code: 'New Code'}, {type: 'refresh'});
  }

  function doNew()
  {
    doTreeGridGetSelectedRowData
    (
      'divTemplatesTG',
      function(row)
      {
        doServerDataMessage('newproducttemplate', {parentid: row.id, name: 'New Template'}, {type: 'refresh'});
      }
    );
  }

  function doClear()
  {
    $('#divTemplatesTG').treegrid('unselectAll');
  }

  function doEdit()
  {
    doTreeGridStartEdit
    (
      'divTemplatesTG',
      editingId,
      function(row, id)
      {
        editingId = id;

        doTreeGridGetEditor
        (
          'divTemplatesTG',
          editingId,
          'name',
          function(ed)
          {
          }
        );
      }
    );
  }

  function doCancel()
  {
    editingId = doTreeGridCancelEdit('divTemplatesTG', editingId);
  }

  function doSave()
  {
    doTreeGridEndEditGetRow
    (
      'divTemplatesTG',
      editingId,
      function(row)
      {
        doServerDataMessage
        (
          'saveproducttemplate',
          {
            producttemplateid: row.id,
            name: row.name,
            code: row.code,
            clientid: row.clientid,
            taxcodeid: row.taxcodeid,
            price: row.price,
            qty: row.qty
          },
          {type: 'refresh'}
        );
      }
    );

    editingId = null;
  }

  function doRemove()
  {
    var row = $('#divTemplatesTG').treegrid('getSelected');
    if (row)
    {
      doPromptYesNoCancel
      (
        'Remove ' + row.name + ' and ALL subtemplates (Yes) or ONLY this template (No)?',
        function(result)
        {
          if (!_.isNull(result))
            doServerDataMessage('expireproducttemplate', {producttemplateid: row.id, cascade: result}, {type: 'refresh'});
        }
      );
    }
    else
      doShowError('Please select an template to remove');
  }

  function doDuplicate()
  {
    doTreeGridGetSelectedRowData
    (
      'divTemplatesTG',
      function(row)
      {
        doServerDataMessage('duplicateproducttemplate', {producttemplateid: row.id}, {type: 'refresh'});
      }
    );
  }

  function doDetails()
  {
    if (!doTreeGridGetSelectedRowData
      (
        'divTemplatesTG',
        function(row)
        {
          doDlgTemplateDetails(row);
        }
      ))
    {
      doShowError('Please select a template to view/edit details');
    }
  }

  function doRemoveParent()
  {
    doTreeGridGetSelectedRowData
    (
      'divTemplatesTG',
      function(row)
      {
        doServerDataMessage('changeproducttemplateparent', {producttemplateid: row.id, parentid: null}, {type: 'refresh'});
      }
    );
  }

  function doCalcUnitCost(value, row, index)
  {
    var qty = _.toBigNum(row.qty);

    if (!qty.isZero())
    {
      var u = _.toBigNum(row.totalprice).dividedBy(qty);
      return _.formatnumber(u, 6);
    }
  }

  function doFooter()
  {
    $('#divTemplatesTG').treegrid('reloadFooter', [{code: '<span class="totals_footer">' + doGetCountTreeArray(cache_producttemplates) + ' Templates</span>'}]);
  }

  function doSaved(ev, args)
  {
    doServerMessage('listproducttemplates', {type: 'refresh', producttemplateid: args.data.producttemplateid});
    doServerDataMessage('syncbuildtemplatefromproducttemplate', {producttemplateid: args.data.producttemplateid}, {type: 'refresh'});

  }

  // Refresh when these events occur...
  $('#divEvents').on
  (
    'listproducttemplates',
    function(ev, args)
    {
      $('#divTemplatesTG').treegrid('reload');

      doExpandTreeToId('divTemplatesTG', args.pdata.producttemplateid);
    }
  );

  $('#divEvents').on('newproducttemplate', doSaved);
  $('#divEvents').on('saveproducttemplate', doSaved);
  $('#divEvents').on('changeproducttemplateparent', doSaved);
  $('#divEvents').on('duplicateproducttemplate', doSaved);
  $('#divEvents').on('expireproducttemplate', doSaved);
  $('#divEvents').on('producttemplatesynced', doSaved);
  $('#divEvents').on('newproducttemplatedetail', doSaved);
  $('#divEvents').on('saveproducttemplatedetail', doSaved);
  $('#divEvents').on('expireproducttemplatedetail', doSaved);
  $('#divEvents').on('producttemplatedetailcreated', doSaved);
  $('#divEvents').on('producttemplatedetailsaved', doSaved);
  $('#divEvents').on('producttemplatedetailexpired', doSaved);
  $('#divEvents').on('productupdated', doSaved);

  $('#divEvents').on
  (
    'producttemplatespopup',
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
      else if (args == 'duplicate')
        doDuplicate();
      else if (args == 'details')
        doDetails();
    }
  );

  $('#divTemplatesTG').treegrid
  (
    {
      idField: 'id',
      treeField: 'code',
      lines: true,
      collapsible: true,
      fitColumns: false,
      autoRowHeight: false,
      rownumbers: true,
      striped: true,
      toolbar: '#tbTemplates',
      showFooter: true,
      sortName: 'code',
      sortOrder: 'asc',
      remoteSort: false,
      multiSort: true,
      loader: function(param, success, error)
      {
        success({total: cache_producttemplates.length, rows: cache_producttemplates});
        //$('#divTemplatesTG').treegrid('collapseAll');

        doFooter();
      },
      frozenColumns:
      [
        [
          {title: 'Code',       field: 'code',        width: 200, align: 'left',  resizable: true, editor: 'text', sortable: true}
        ]
      ],
      columns:
      [
        [
          {title: 'Name',       field: 'name',        width: 300, align: 'left',  resizable: true, editor: 'text', sortable: true},
          {title: 'Client',     field: 'clientid',    width: 200, align: 'left',  resizable: true, editor: {type: 'combobox', options: {valueField: 'id', textField: 'name', data: cache_clients, onSelect: function(record) {/*console.log(record);*/}}}, formatter: function(value, row) {return doGetStringFromIdInObjArray(cache_clients, value);}},
          {title: 'Tax Code',   field: 'taxcodeid',   width: 200, align: 'left',  resizable: true, editor: {type: 'combobox', options: {valueField: 'id', textField: 'name', data: cache_taxcodes, onSelect: function(record) {/*console.log(record);*/}}}, formatter: function(value, row) {return doGetStringFromIdInObjArray(cache_taxcodes, value);}},
          {title: 'RRP',        field: 'price',       width: 150, align: 'right', resizable: true, editor: {type: 'numberbox', options: {groupSeparator: ',', precision: 2}}, formatter: function(value, row, index) {return _.niceformatnumber(value);}},
          {title: 'Qty',        field: 'qty',         width: 150, align: 'right', resizable: true, editor: {type: 'numberbox', options: {groupSeparator: ',', precision: 0}}, formatter: function(value, row, index) {return _.niceformatqty(value);}},
          {title: 'Total Cost', field: 'totalprice',  width: 150, align: 'right', resizable: true, formatter: function(value, row, index) {return _.niceformatnumber(value);}},
          {title: '#Products',  field: 'numproducts', width: 150, align: 'right', resizable: true},
          {title: 'Unit Cost',  field: 'unitcost',    width: 150, align: 'right', resizable: true, formatter: function(value, row, index) {return doCalcUnitCost(value, row, index);}},
          {title: 'Modified',   field: 'date',        width: 150, align: 'right', resizable: true, sortable: true},
          {title: 'By',         field: 'by',          width: 200, align: 'left',  resizable: true, sortable: true}
        ]
      ],
      onContextMenu: function(e, row)
      {
        doTreeGridContextMenu('divTemplatesTG', 'divTemplatesMenuPopup', e, row);
      },
      onLoadSuccess: function(row)
      {
        $(this).treegrid('enableDnd');
      },
      onDblClickCell: function(field, row)
      {
      },
      onBeforeDrag: function(source)
      {
        if (editingId)
          return false;
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
        doServerDataMessage('changeproducttemplateparent', {producttemplateid: source.id, parentid: target.id}, {type: 'refresh'});
      },
      onDblClickCell: function(field, row)
      {
        doTreeGridStartEdit
        (
          'divTemplatesTG',
          editingId,
          function(row, id)
          {
            editingId = id;

            if (['numproducts', 'modified', 'by'].indexOf(field) != -1)
              field = 'name';

            doTreeGridGetEditor
            (
              'divTemplatesTG',
              editingId,
              field,
              function(ed)
              {
              }
            );
          }
        );
      }
    }
  );
}


