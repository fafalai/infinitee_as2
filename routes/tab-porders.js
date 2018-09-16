var pordersTabWidgetsLoaded = false;

function doPOrdersTabWidgets()
{
  if (pordersTabWidgetsLoaded)
    return;

  pordersTabWidgetsLoaded = true;

  function doNew()
  {
    doDlgPOrderNew(null);
  }

  function doClear()
  {
    $('#divPurchaseOrdersG').datagrid('clearSelections');
  }

  function doRemove()
  {
    if (!doGridGetSelectedRowData
      (
        'divPurchaseOrdersG',
        function(row)
        {
          doPromptOkCancel
          (
            'Remove purchase order ' + row.porderno + '?',
            function(result)
            {
              if (result)
                primus.emit('expireporder', {fguid: fguid, uuid: uuid, session: session, porderid: row.id, pdata: {type: 'refresh'}});
            }
          );
        }
      ))
    {
      noty({text: 'Please select a purchase order to remove', type: 'error', timeout: 4000});
    }
  }

  function doPrint()
  {
  }

  function doEmail()
  {
    if (!doGridGetSelectedRowData
      (
        'divPurchaseOrdersG',
        function(row)
        {
          //doDlgEmailPOrder(row, itype_order_order);
        }
      ))
    {
      noty({text: 'Please select a purchase order to email', type: 'error', timeout: 4000});
    }
  }

  function doDuplicate()
  {
    if (!doGridGetSelectedRowData
      (
        'divPurchaseOrdersG',
        function(row)
        {
          doPromptOkCancel
          (
            'Duplicate purchase order ' + row.porderno + '?',
            function(result)
            {
              if (result)
                primus.emit('duplicateporder', {fguid: fguid, uuid: uuid, session: session, porderid: row.id, pdata: {type: 'refresh'}});
            }
          );
        }
      ))
    {
      noty({text: 'Please select a purchase order to duplicate', type: 'error', timeout: 4000});
    }
  }

  function doSearch()
  {
    doDlgPOrderSearch();
  }

  function doSupplierSelected(record)
  {
    doGridGetSelectedRowData
    (
      'divPurchaseOrdersG',
      function(row)
      {
        // Only change name if it hasn't been set...
        if (_.isBlank(row.name))
        {
          doGridGetEditor
          (
            'divPurchaseOrdersG',
            editingIndex,
            'name',
            function(ed)
            {
              $(ed.target).val(record.name);
            }
          );
        }

        // Get client address details and pre-fill order info...
        //primus.emit('getsupplier', {fguid: fguid, uuid: uuid, session: session, clientid: record.id, pdata: {type: 'refresh', index: editingIndex}});
      }
    );
  }

  function doPay()
  {
    if (!doGridGetSelectedRowData
      (
        'divPurchaseOrdersG',
        function(row)
        {
          doDlgPayPOrders(row.clientid);
        }
      ))
    {
      doDlgPayPOrders();
    }
  }

  function doInvoiceToCountrySelected(record)
  {
    doGridGetEditor
    (
      'divPurchaseOrdersG',
      editingIndex,
      'invoicetostate',
      function(ed)
      {
        porderInvoiceToStates = doGetStatesFromCountry(record.country);

        $(ed.target).combobox('loadData', porderInvoiceToStates);
      }
    );
  }

  function doListPOrders(ev, args)
  {
    primus.emit('listporders', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
  }

  // Respond to these events...
  $('#divEvents').on
  (
    'searchporders',
    function(ev, args)
    {
    }
  );

  $('#divEvents').on
  (
    'listporders',
    function(ev, args)
    {
      $('#divPurchaseOrdersG').datagrid('clearSelections');
      $('#divPurchaseOrdersG').datagrid('reload');

      if (!_.isUndefined(args.pdata.porderid) && !_.isNull(args.pdata.porderid))
        $('#divPurchaseOrdersG').datagrid('selectRecord', args.pdata.porderid);
    }
  );

  $('#divEvents').on('newporder', doListPOrders);
  $('#divEvents').on('saveporder', doListPOrders);
  $('#divEvents').on('expireporder', doListPOrders);
  $('#divEvents').on('completeporder', doListPOrders);
  $('#divEvents').on('pordercompleted', doListPOrders);
  $('#divEvents').on('newporderdetail', doListPOrders);
  $('#divEvents').on('saveporderdetail', doListPOrders);
  $('#divEvents').on('expireporderdetail', doListPOrders);
  $('#divEvents').on('porderdetailcreated', doListPOrders);
  $('#divEvents').on('porderdetailsaved', doListPOrders);
  $('#divEvents').on('porderdetailexpired', doListPOrders);
  $('#divEvents').on('pordercreated', doListPOrders);
  $('#divEvents').on('pordersaved', doListPOrders);
  $('#divEvents').on('porderexpired', doListPOrders);
  $('#divEvents').on('porderduplicated', doListPOrders);
  $('#divEvents').on('porderspaid', doListPOrders);
  $('#divEvents').on('saveaccount', doListPOrders);
  $('#divEvents').on('savesupplier', doListPOrders);
  $('#divEvents').on('suppliersaved', doListPOrders);

  $('#divEvents').on
  (
    'duplicateporder',
    function(ev, args)
    {
      noty({text: 'New purchase order ' + args.data.porderno + ' created', type: 'warning', timeout: 4000});
      primus.emit('listporders', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
    }
  );

  $('#divEvents').on
  (
    'new-supplier-porder',
    function(ev, args)
    {
      primus.emit('newpordersupplier', {fguid: fguid, uuid: uuid, session: session, name: 'New P.O.', clientid: args.id, pdata: {type: 'refresh'}});
      doSelectPurchasingTab('Purchase Orders');
    }
  );

  $('#divEvents').on
  (
    'selectporderid',
    function(ev, args)
    {
      if (!_.isUndefined(args.id) && !_.isNull(args.id))
        $('#divPurchaseOrdersG').datagrid('selectRecord', args.id);
    }
  );

  $('#divEvents').on
  (
    'porderspopup',
    function(ev, args)
    {
      if (args == 'new')
        doNew();
      else if (args == 'clear')
        doClear();
      else if (args == 'remove')
        doRemove();
      else if (args == 'print')
        doPrint();
      else if (args == 'email')
        doEmail();
      else if (args == 'duplicate')
        doDuplicate();
      else if (args == 'search')
        doSearch();
      else if (args == 'pay')
        doPay();
    }
  );

  // Check user permissions for this TAB...
  if (!isadmin && !myperms.cancreateorders)
  {
    /*
    doRemoveTBButton(tb, 'New');
    doRemoveTBButton(tb, 'Save');
    doRemoveTBButton(tb, 'Remove');
    doRemoveTBButton(tb, 'Duplicate');
    doRemoveTBButton(tb, 'Products');
    doRemoveTBButton(tb, 'Statuses');
    doRemoveTBButton(tb, 'Notes');
    doRemoveTBButton(tb, 'Attachments');
    doRemoveTBButton(tb, 'New Version');
    doRemoveTBButton(tb, 'Invoice');
    */
  }

  porderInvoiceToStates = doGetStatesFromCountry(defaultCountry);

  $('#divPurchaseOrdersG').datagrid
  (
    {
      idField: 'id',
      fitColumns: false,
      singleSelect: true,
      rownumbers: true,
      striped: true,
      toolbar: '#tbPOrders',
      showFooter: true,
      sortName: 'porderno',
      sortOrder: 'asc',
      remoteSort: false,
      multiSort: true,
      loader: function(param, success, error)
      {
        var totalprice = _.toBigNum(0.0);
        var totalqty = _.toBigNum(0.0);

        cache_porders.forEach
        (
          function(o)
          {
            if (!_.isBlank(o.totalprice))
              totalprice = totalprice.plus(o.totalprice);

            if (!_.isBlank(o.totalqty))
              totalqty = totalqty.plus(o.totalqty);
          }
        );
        success({total: cache_porders.length, rows: cache_porders});

        $(this).datagrid
        (
          'reloadFooter',
          [
            {
              porderno: '<span class="totals_footer">' + cache_porders.length + ' P.O.(s)</span>',
              totalprice: '<span class="totals_footer">' + _.niceformatnumber(totalprice) + '</span>',
              totalqty: '<span class="totals_footer">' + _.niceformatnumber(totalqty) + '</span>'
            }
          ]
        );
      },
      frozenColumns:
      [
        [
          {title: 'P.O. #',      field: 'porderno',   width: 150, align: 'left',  resizable: true, sortable: true}
        ]
      ],
      columns:
      [
        [
          {title: 'Name',        field: 'name',       width: 300, align: 'left',  resizable: true, editor: 'text', sortable: true},
          {title: 'Supplier',    field: 'clientid',   width: 300, align: 'left',  resizable: true, editor: {type: 'combotree', options: {valueField: 'id', textField: 'name', data: cache_suppliers, onSelect: function(record) {doSupplierSelected(record);}}}, formatter: function(value, row) {return doGetNameFromTreeArray(cache_suppliers, value);}, sortable: true},
          {title: 'Ref No.',     field: 'refno',      width: 120, align: 'left',  resizable: true, editor: 'text', sortable: true},
          {title: 'Invoice No.', field: 'invoiceno',  width: 120, align: 'left',  resizable: true, editor: 'text', sortable: true},
          {title: 'Total',       field: 'totalprice', width: 150, align: 'right', resizable: true, formatter: function(value, row, index) {if (!_.isUndefined(row.id)) return _.niceformatnumber(value); return value;}},
          {title: 'Qty',         field: 'totalqty',   width: 150, align: 'right', resizable: true, formatter: function(value, row, index) {if (!_.isUndefined(row.id)) return _.niceformatqty(value); return value;}},
          {title: 'Completed',   field: 'completed',  width: 150, align: 'right', resizable: true, sortable: true},
          {title: 'Balance',     field: 'balance',    width: 150, align: 'right', resizable: true, sortable: true, styler: function(value, row, index) {return 'color: ' + colour_indianred}},
          {title: 'Modified',    field: 'date',       width: 150, align: 'right', resizable: true, sortable: true},
          {title: 'By',          field: 'by',         width: 200, align: 'left',  resizable: true, sortable: true}
        ]
      ],
      onRowContextMenu: function(e, index, row)
      {
        doGridContextMenu('divPurchaseOrdersG', 'divPOrdersMenuPopup', e, index, row);
      },
      onBeginEdit: function(rowIndex)
      {
      },
      onDblClickCell: function(index, field, value)
      {
        doGetGridGetRowDataByIndex
        (
          'divPurchaseOrdersG',
          index,
          function(row)
          {
            doDlgPOrderNew(row.id);
          }
        );
      }
    }
  );
}
