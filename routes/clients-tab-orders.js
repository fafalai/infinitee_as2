var ordersTabWidgetsLoaded = false;
// IDs of rows etc we're editing...
var editingOrderIndex = null;
var orderInvoiceToStates = [];
var orderShipToStates = [];

// Toolbars for grids...
var tbOrders =
[
  {
    text: 'New',
    iconCls: 'icon-add',
    handler: doOrdersNew
  },
  {
    text: 'Edit',
    iconCls: 'icon-edit',
    handler: doOrdersEdit
  },
  {
    text: 'Clear',
    iconCls: 'icon-clear',
    handler: doOrdersClear
  },
  {
    text: 'Cancel',
    iconCls: 'icon-cancel',
    handler: doOrdersCancel
  },
  {
    text: 'Save',
    iconCls: 'icon-save',
    handler: doOrdersSave
  },
  {
    text: 'Remove',
    iconCls: 'icon-remove',
    handler: doOrdersRemove
  },
  {
    text: 'Print',
    iconCls: 'icon-print',
    handler: doOrdersPrint
  },
  {
    text: 'Duplicate',
    iconCls: 'icon-duplicate',
    handler: doOrdersDuplicate
  },
  {
    text: 'Products',
    iconCls: 'icon-orderform',
    handler: doOrdersProducts
  },
  {
    text: 'Notes',
    iconCls: 'icon-notes',
    handler: doOrdersNotes
  },
  {
    text: 'Attachments',
    iconCls: 'icon-attachment',
    handler: doOrdersAttachments
  },
  {
    text: 'Search',
    iconCls: 'icon-search',
    handler: doOrdersSearch
  },
  {
    text: 'Pay',
    iconCls: 'icon-creditcards',
    handler: doOrdersPay
  }
];

//
function doOrdersNew()
{
  primus.emit('neworderclient', {fguid: fguid, uuid: uuid, session: session, name: 'New Order', clientid: theclientid, pdata: {type: 'doordersnew'}});
}

function doOrdersClear()
{
  $('#divOrdersG').datagrid('clearSelections');
}

function doOrdersEdit()
{
  doGridGetSelectedRowData
  (
    'divOrdersG',
    function(row)
    {
      if (_.isBlank(row.invoiceno))
      {
        doGridStartEdit
        (
          'divOrdersG',
          editingOrderIndex,
          function(row, index)
          {
            editingOrderIndex = index;

            doGridGetEditor
            (
              'divOrdersG',
              editingOrderIndex,
              'name',
              function(ed)
              {
              }
            );
          }
        );
      }
      else
        noty({text: 'Unable to edit invoiced order', type: 'warning', timeout: 4000});
    }
  );
}

function doOrdersCancel()
{
  editingOrderIndex = doGridCancelEdit('divOrdersG', editingOrderIndex);
}

function doOrdersSave()
{
  doGridEndEditGetRow
  (
    'divOrdersG',
    editingOrderIndex,
    function(row)
    {
      primus.emit
      (
        'saveorder',
        {
          fguid: fguid,
          uuid: uuid,
          session: session,
          orderid: row.id,
          clientid: row.clientid,
          startdate: row.startdate,
          enddate: row.enddate,
          name: row.name,
          pono: row.pono,
          activeversion: row.activeversion,
          accountid: row.accountid,
          invoicetoaddress1: row.invoicetoaddress1,
          invoicetoaddress2: row.invoicetoaddress2,
          invoicetocity: row.invoicetocity,
          invoicetostate: row.invoicetostate,
          invoicetopostcode: row.invoicetopostcode,
          invoicetocountry: row.invoicetocountry,
          shipaddress1: row.shiptoaddress1,
          shipaddress2: row.shiptoaddress2,
          shipcity: row.shiptocity,
          shipstate: row.shiptostate,
          shippostcode: row.shiptopostcode,
          shipcountry: row.shipctoountry,
          invoicetemplateid: row.invoicetemplateid,
          ordertemplateid: row.ordertemplateid,
          quotetemplateid: row.quotetemplateid,
          pdata: {type: 'doorderssave'}
        }
      );
    }
  );

  editingOrderIndex = null;
}

function doOrdersRemove()
{
  if (!doGridGetSelectedRowData
    (
      'divOrdersG',
      function(row)
      {
        doPromptOkCancel
        (
          'Remove order ' + row.orderno + '?',
          function(result)
          {
            if (result)
              primus.emit('expireorder', {fguid: fguid, uuid: uuid, session: session, orderid: row.id, pdata: {type: 'doordersremove'}});
          }
        );
      }
    ))
  {
    noty({text: 'Please select an order to remove', type: 'error', timeout: 4000});
  }
}

function doOrdersPrint()
{
  doPrompt3OptionsCancel
  (
    'Print As...',
    'Quote',
    'Order',
    'Delivery Docket',
    function(result)
    {
      if (result == 1)
      {
        doPromptYesNoCancel
        (
          'Print all listed quotes (Yes) or selected only (No)?',
          function(result)
          {
            if (result === true)
            {
              console.log('Print all listed quotes');
            }
            else if (result === false)
            {
              doGridGetSelectedRowData
              (
                'divOrdersG',
                function(row)
                {
                  primus.emit('printquotes', {fguid: fguid, uuid: uuid, session: session, orders: [row.id],  pdata: {type: 'doordersprint'}});
                }
              );
            }
          }
        );
      }
      else if (result == 2)
      {
        doPromptYesNoCancel
        (
          'Print all listed orders (Yes) or selected only (No)?',
          function(result)
          {
            if (result === true)
            {
              console.log('Print all listed orders');
            }
            else if (result === false)
            {
              doGridGetSelectedRowData
              (
                'divOrdersG',
                function(row)
                {
                  primus.emit('printorders', {fguid: fguid, uuid: uuid, session: session, orders: [row.id],  pdata: {type: 'doordersprint'}});
                }
              );
            }
          }
        );
      }
      else if (result == 3)
      {
        console.log('Quote');

        doPromptYesNoCancel
        (
          'Print all listed delivery dockets (Yes) or selected only (No)?',
          function(result)
          {
            if (result === true)
            {
              console.log('Print all listed delivery dockets');
            }
            else if (result === false)
            {
              doGridGetSelectedRowData
              (
                'divOrdersG',
                function(row)
                {
                  primus.emit('printdeliverydockets', {fguid: fguid, uuid: uuid, session: session, orders: [row.id], pdata: {type: 'doordersprint'}});
                }
              );
            }
          }
        );
      }
    }
  );
}

function doOrdersDuplicate()
{
  if (!doGridGetSelectedRowData
    (
      'divOrdersG',
      function(row)
      {
        doPromptOkCancel
        (
          'Duplicate order ' + row.orderno + '?',
          function(result)
          {
            if (result)
              primus.emit('duplicateorder', {fguid: fguid, uuid: uuid, session: session, orderid: row.id, pdata: {type: 'doordersduplicate'}});
          }
        );
      }
    ))
  {
    noty({text: 'Please select an order to duplicate', type: 'error', timeout: 4000});
  }
}

function doOrdersProducts()
{
  if (!doGridGetSelectedRowData
    (
      'divOrdersG',
      function(row)
      {
        doDlgOrderDetails(row);
      }
    ))
  {
    noty({text: 'Please select an order to view', type: 'error', timeout: 4000});
  }
}

function doOrdersNotes()
{
  if (!doGridGetSelectedRowData
    (
      'divOrdersG',
      function(row)
      {
        doDlgOrderNotes(row);
      }
    ))
  {
    noty({text: 'Please select an order to view', type: 'error', timeout: 4000});
  }
}

function doOrdersAttachments()
{
  if (!doGridGetSelectedRowData
    (
      'divOrdersG',
      function(row)
      {
        doDlgOrderAttachments(row);
      }
    ))
  {
    noty({text: 'Please select an order to view', type: 'error', timeout: 4000});
  }
}

function doOrdersSearch()
{
  doDlgOrderSearch();
}

function doOrdersPay()
{
  if (!doGridGetSelectedRowData
    (
      'divOrdersG',
      function(row)
      {
        doDlgOrdePay(row);
      }
    ))
  {
    noty({text: 'Please select an order to pay', type: 'error', timeout: 4000});
  }
}

// Creator...

function doOrdersTabWidgets()
{
  if (ordersTabWidgetsLoaded)
    return;

  $('#divEvents').on
  (
    'new-client-order',
    function(ev, args)
    {
      primus.emit('neworderclient', {fguid: fguid, uuid: uuid, session: session, name: 'New Order', clientid: args.id, pdata: {type: 'doordersnew'}});
      doSelectSalesTab(0);
    }
  );

  ordersTabWidgetsLoaded = true;

  $('#divOrdersG').datagrid
  (
    {
      idField: 'id',
      fitColumns: false,
      singleSelect: true,
      rownumbers: false,
      striped: true,
      toolbar: tbOrders,
      showFooter: true,
      loader: function(param, success, error)
      {
        var data = [];
        var totalprice = _.toBigNum(0.0);
        var totalqty = _.toBigNum(0.0);

        cache_orders.forEach
        (
          function(o)
          {
            var perc = null;

            if (!_.isBlank(o.totalprice))
              totalprice = totalprice.plus(o.totalprice);

            if (!_.isBlank(o.totalqty))
              totalqty = totalqty.plus(o.totalqty);

            if (!_.isNull(o.startdate) && !_.isBlank(o.startdate) && !_.isNull(o.enddate) && !_.isBlank(o.enddate))
            {
              var totaldays = moment(o.enddate).diff(o.startdate, 'days');
              var elapsed = moment().diff(o.startdate, 'days');

              perc = Math.round((elapsed * 100) / totaldays);
            }

            data.push
            (
              {
                id: o.id,
                clientid: o.clientid,
                orderno: o.orderno,
                invoiceno: o.invoiceno,
                name: o.name,
                pono: o.pono,
                numversions: o.numversions,
                activeversion: o.activeversion,
                status: o.status,
                majorstatus: o.majorstatus,
                accountid: o.accountid,
                totalprice: o.totalprice,
                totalqty: o.totalqty,
                startdate: _.nicedatetodisplay(o.startdate),
                enddate: _.nicedatetodisplay(o.enddate),
                shiptoclientid: o.shiptoclientid,
                shiptoname: o.shiptoname,
                shiptoaddress1: o.shiptoaddress1,
                shiptoaddress2: o.shiptoaddress2,
                shiptocity: o.shiptocity,
                shiptostate: o.shiptostate,
                shiptopostcode: o.shiptopostcode,
                shiptocountry: o.shiptocountry,
                invoicetoclientid: o.invoicetoclientid,
                invoicetoname: o.invoicetoname,
                invoicetoaddress1: o.invoicetoaddress1,
                invoicetoaddress2: o.invoicetoaddress2,
                invoicetocity: o.invoicetocity,
                invoicetostate: o.invoicetostate,
                invoicetopostcode: o.invoicetopostcode,
                invoicetocountry: o.invoicetocountry,
                invoicetemplateid: o.invoicetemplateid,
                ordertemplateid: o.ordertemplateid,
                quotetemplateid: o.quotetemplateid,
                inventorycommitted: o.inventorycommitted,
                modified: o.date,
                by: o.by,
                perc: perc
              }
            );
          }
        );
        success({total: data.length, rows: data});

        $(this).datagrid
        (
          'reloadFooter',
          [
            {
              name: '<span class="totals_footer">' + data.length + ' order(s)</span>',
              totalprice: '<span class="totals_footer">' + _.formatnumber(totalprice) + '</span>',
              totalqty: '<span class="totals_footer">' + _.formatnumber(totalqty) + '</span>'
            }
          ]
        );
      },
      frozenColumns:
      [
        [
          {title: 'Order #',        rowspan: 2,  field: 'orderno',           width: 150,  align: 'left',  resizable: true}
        ],
        [
        ]
      ],
      columns:
      [
        [
          {title: 'Name',           rowspan: 2,  field: 'name',               width: 300, align: 'left',   resizable: true, editor: 'text'},
          {title: 'P.O.#',          rowspan: 2,  field: 'pono',               width: 150, align: 'left',   resizable: true, editor: 'text'},
          {title: 'Version',        rowspan: 2,  field: 'activeversion',      width: 100, align: 'right',  resizable: true},
          {title: 'Status',         rowspan: 2,  field: 'majorstatus',        width: 200, align: 'left',   resizable: true},
          {title: 'Total',          rowspan: 2,  field: 'totalprice',         width: 150, align: 'right',  resizable: true},
          {title: 'Qty',            rowspan: 2,  field: 'totalqty',           width: 150, align: 'right',  resizable: true},
          {title: 'Date',           colspan: 3},
          {title: 'Modified',       rowspan: 2,  field: 'modified',           width: 150, align: 'right',  resizable: true},
          {title: 'By',             rowspan: 2,  field: 'by',                 width: 200, align: 'left',   resizable: true}
        ],
        [
          {title: 'Start',                       field: 'startdate',          width: 150, align: 'right',  resizable: true, editor: {type: 'datebox', options: {formatter: function(dt) {return _.nicedatetodisplay(dt);}, parser: function(d) {if (_.isUndefined(d) || _.isBlank(d)) return new Date(); return moment(d).toDate();}}}},
          {title: 'Required',                    field: 'enddate',            width: 150, align: 'right',  resizable: true, editor: {type: 'datebox', options: {formatter: function(dt) {return _.nicedatetodisplay(dt);}, parser: function(d) {if (_.isUndefined(d) || _.isBlank(d)) return new Date(); return moment(d).toDate();}}}},
          {title: 'Progress',                    field: 'perc',               width: 100, align: 'left',   resizable: true, formatter: function(value) {if (_.isNull(value)) return ''; return '<div style="width: 100%; border: 1px solid #ccc"><div style="width: ' + value + '%; background: ' + colour_mistyrose + '; color: black">' + value + '%</div></div>';}}
        ]
      ],
      onRowContextMenu: function(e, index, row)
      {
        doGridContextMenu('divOrdersG', 'divOrdersMenuPopup', e, index, row);
      },
      onDblClickCell: function(index, field, value)
      {
        doGridGetSelectedRowData
        (
          'divOrdersG',
          function(row)
          {
            if (_.isBlank(row.invoiceno))
            {
              doGridStartEdit
              (
                'divOrdersG',
                editingOrderIndex,
                function(row, index)
                {
                  editingOrderIndex = index;

                  if (['status', 'totalprice', 'totalqty', 'modified', 'by'].indexOf(field) != -1)
                    field = 'name';

                  doGridGetEditor
                  (
                    'divOrdersG',
                    editingOrderIndex,
                    field,
                    function (ed)
                    {
                    }
                  );
                }
              );
            }
            else
              noty({text: 'Unable to edit invoiced order', type: 'warning', timeout: 4000});
          }
        );
      }
    }
  );
}

function refreshFromCacheOrders(pdata)
{
  if (ordersTabWidgetsLoaded)
  {
    if (pdata.type == 'refresh')
      $('#divOrdersG').datagrid('reload');

    if (!_.isUndefined(pdata.orderid) && !_.isNull(pdata.orderid))
      $('#divOrdersG').datagrid('selectRecord', pdata.orderid);
  }
}

function doOrdersSelectOrder(id)
{
  $('#divOrdersG').datagrid('selectRecord', id);
}

function doStatusAlert(alert)
{
  var status = doGetStringFromIdInObjArray(orderstatustypes, alert.status);

  noty({text: 'Order ' + alert.orderno + ' has changed status to ' + status, type: 'information'});
}
