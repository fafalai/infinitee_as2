var invoicesTabWidgetsLoaded = false;

function doInvoicesTabWidgets()
{
  var tb =
  [
    {
      text: 'Clear',
      iconCls: 'icon-clear',
      handler: doClear
    },
    {
      text: 'Remove',
      iconCls: 'icon-remove',
      handler: doRemove
    },
    {
      text: 'Print',
      iconCls: 'icon-print',
      handler: doPrint
    },
    {
      text: 'Email',
      iconCls: 'icon-email',
      handler: doEmail
    },
    {
      text: 'Search',
      iconCls: 'icon-search',
      handler: doSearch
    },
    {
      text: 'Pay',
      iconCls: 'icon-payment',
      handler: doPay
    }
  ];

  if (invoicesTabWidgetsLoaded)
    return;

  invoicesTabWidgetsLoaded = true;

  function doClear()
  {
    $('#divInvoicesG').datagrid('clearSelections');
  }

  function doRemove()
  {
  }

  function doPrint()
  {
    doPromptYesNoCancel
    (
      'Print all listed invoices (Yes) or selected only (No)?',
      function(result)
      {
        if (result === true)
        {
          console.log('Print all listed invoices');
        }
        else if (result === false)
        {
          doGridGetSelectedRowData
          (
            'divInvoicesG',
            function(row)
            {
              console.log(row.id);
              doServerDataMessage('printinvoices', {orders: [row.id]}, {type: 'refresh'});
            }
          );
        }
      }
    );
  }

  function doEmail()
  {
    if (!doGridGetSelectedRowData
      (
        'divInvoicesG',
        function(row)
        {
          doDlgEmailOrder(row, itype_order_invoice);
        }
      ))
    {
      doShowError('Please select an invoice to email');
    }
  }

  function doSearch()
  {
    doDlgInvoiceSearch();
  }

  function doPay()
  {
    if (!doGridGetSelectedRowData
      (
        'divInvoicesG',
        function(row)
        {
          doDlgPayInvoices(row.clientid);
        }
      ))
    {
      doDlgPayInvoices();
    }
  }

  function doStyleInvoiceDate(value, row, index)
  {
    if (row.duein < 0)
      return 'color: red';
  }

  function doFormatDueIn(value, row, index)
  {
    if (!_.isUndefined(value))
      return value + ' days';
  }

  function doSaved()
  {
    doServerMessage('listinvoices', {type: 'refresh'});
  }

  // Refresh when these events occur...
  $('#divEvents').on
  (
    'listinvoices',
    function(ev, args)
    {
      // console.log("list invoices");
      var totalprice = _.toBigNum(0.0);
      var data = [];

      args.data.rs.forEach
      (
        function(i)
        {
          var duein = 0;

          // If client has credit - use that for due/overdue invoice dates...
          if (!_.isUndefined(i.dayscredit) && !_.isNull(i.dayscredit) && (i.dayscredit > 0))
          {
            var dt = moment(i.date).add(i.dayscredit, 'days');

            duein = moment(dt).diff(moment(), 'days');
          }
          else
            duein = moment(i.date).diff(moment(), 'days');

          totalprice = totalprice.plus(i.totalprice);

          data.push
          (
            {
              id: doNiceId(i.id),
              clientid: doNiceId(i.clientid),
              clientname: doNiceString(i.clientname),
              name: doNiceString(i.name),
              pono: doNiceString(i.pono),
              invoiceno: doNiceString(i.invoiceno),
              orderno: doNiceString(i.orderno),
              copyno: i.copyno,
              totalprice: _.sanitiseAsNumeric(i.totalprice, 4),
              dayscredit: i.dayscredit,
              orderlimit: _.formatnumber(i.orderlimit, 4),
              creditlimit: _.formatnumber(i.creditlimit, 4),
              date: doNiceDate(i.invoicedate),
              by: _.titleize(i.userinvoiced),
              duein: duein,
              paid: _.formatnumber(i.paid, 2),
              balance: _.formatnumber(i.balance, 2)
            }
          );
        }
      );
      // console.log(data);

      $('#divInvoicesG').datagrid('loadData', data);
      $('#divInvoicesG').datagrid('reloadFooter', [{name: '<span class="totals_footer">' + data.length + ' invoice(s)</span>', totalprice: '<span class="totals_footer">' + _.niceformatnumber(totalprice) + '</span>'}]);

      if (!_.isUndefined(args.pdata.orderid) && !_.isNull(args.pdata.invoiceid))
        $('#divInvoicesG').datagrid('selectRecord', args.pdata.invoiceid);
    }
  );

  $('#divEvents').on('payinvoices', doSaved);
  $('#divEvents').on('invoicespaid', doSaved);
  $('#divEvents').on('invoicecreated', doSaved);
  $('#divEvents').on('invoicespaid', doSaved);

  $('#divInvoicesG').datagrid
  (
    {
      idField: 'id',
      fitColumns: false,
      singleSelect: true,
      rownumbers: true,
      striped: true,
      toolbar: tb,
      showFooter: true,
      sortName: 'invoiceno',
      sortOrder: 'asc',
      remoteSort: false,
      multiSort: true,
      frozenColumns:
      [
        [
          {title: 'Invoice #', field: 'invoiceno',     width: 150, align: 'left',  resizable: true}
        ]
      ],
      columns:
      [
        [
          {title: 'Name',      field: 'name',       width: 300, align: 'left',  resizable: true, sortable: true},
          {title: 'P.O.#',     field: 'pono',       width: 150, align: 'left',  resizable: true, sortable: true},
          {title: 'Order #',   field: 'orderno',    width: 150, align: 'left',  resizable: true, sortable: true},
          {title: 'Client',    field: 'clientid',   width: 200, align: 'left',  resizable: true, sortable: true, formatter: function(value, row) {return doGetNameFromTreeArray(cache_clients, value);}},
          {title: 'Copy #',    field: 'copyno',     width: 100, align: 'right', resizable: true},
          {title: 'Amount',    field: 'totalprice', width: 150, align: 'right', resizable: true, formatter: function(value, row, index) {if (!_.isUndefined(row.id)) return value; return _.niceformatnumber(value);}},
          {title: 'Invoiced',  field: 'date',       width: 150, align: 'right', resizable: true, formatter: function(value, row, index) {return _.nicedatetodisplay(value);}, sortable: true},
          {title: 'Balance',   field: 'balance',    width: 150, align: 'right', resizable: true, sortable: true, styler: function(value, row, index) {return 'color: ' + colour_indianred}},
          {title: 'Due In',    field: 'duein',      width: 150, align: 'right', resizable: true, styler: function(value, row, index) {return doStyleInvoiceDate(value, row, index);}, formatter: function(value, row, index) {return doFormatDueIn(value, row, index);}, sortable: true},
          {title: 'By',        field: 'by',         width: 200, align: 'left',  resizable: true, sortable: true}
        ]
      ],
      onRowContextMenu: function(e, index, row)
      {
        doGridContextMenu('divInvoicesG', 'divInvoicesMenuPopup', e, index, row);
      }
    }
  );

  doServerMessage('listinvoices', {type: 'refresh'});
}
