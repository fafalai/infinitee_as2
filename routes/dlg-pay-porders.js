function doDlgPayPOrders(clientid)
{
  var editingIndex = null;
  var tb =
  [
    {
      text: 'Clear',
      iconCls: 'icon-clear',
      handler: doClear
    },
    {
      text: 'Edit',
      iconCls: 'icon-edit',
      handler: doEdit
    },
    {
      text: 'Cancel',
      iconCls: 'icon-cancel',
      handler: doCancel
    },
    {
      text: 'Save',
      iconCls: 'icon-save',
      handler: doSave
    },
    {
      text: 'Apply',
      iconCls: 'icon-calculator',
      handler: doRecalc
    }
  ];

  function doClear()
  {
    $('#divPaymentInvoicesG').datagrid('clearSelections');
  }

  function doEdit()
  {
    doGridGetSelectedRowData
    (
      'divPaymentInvoicesG',
      function(row)
      {
        doGridStartEdit
        (
          'divPaymentInvoicesG',
          editingIndex,
          function(row, index)
          {
            editingIndex = index;

            doGridGetEditor
            (
              'divPaymentInvoicesG',
              editingIndex,
              'amount',
              function(ed)
              {
              }
            );
          }
        );
      }
    );
  }

  function doCancel()
  {
    editingIndex = doGridCancelEdit('divPaymentInvoicesG', editingIndex);
  }

  function doSave()
  {
    doGridEndEditGetRow
    (
      'divOrderNewProductsG',
      editingIndex,
      function(row)
      {
      }
    );
  }

  function doRecalc()
  {
    var data = $('#divPaymentInvoicesG').datagrid('getSelections');
    var amount = $('#fldPaymentAmount').numberbox('getValue');

    if (!_.isBlank(amount))
    {
      if (data.length > 0)
      {
        var amt = _.toBigNum(amount);

        data.forEach
        (
          function(r)
          {
            if (amt.lessThanOrEqualTo(0.0))
              return;

            var paid = _.toBigNum(r.paid);
            var total = _.toBigNum(r.totalprice);
            var gst = _.toBigNum(r.totalgst);
            var topay = total.plus(gst).minus(paid);

            if (topay.greaterThanOrEqualTo(amt))
            {
              topay = amt;
              amt = _.toBigNum(0.0);
            }
            else
              amt = amt.minus(topay);

            r.amount = topay;
            doUpdateGridRow('divPaymentInvoicesG', r.id, {amount: _.sanitiseAsNumeric(topay, 2)});
          }
        )

        $('#fldPaymentAmount').numberbox('setValue', _.sanitiseAsNumeric(amt, 2));
        if (amt.greaterThan(0.0))
          doShowWarning('You have ' + _.sanitiseAsNumeric(amt, 2) + ' remaininng...');
      }
      else
        doShowWarning('Please select for which purchase orders you wish to apply payment');
    }
    else
      doMandatoryTextbox('Please enter the payment amount', 'fldPaymentAmount');
  }

  function doRefreshFooter()
  {
    var rows = $('#divPaymentInvoicesG').datagrid('getRows');
    var amt = _.toBigNum(0.0);

    rows.forEach
    (
      function(r)
      {
        if (!_.isUndefined(r.amount) && !_.isNull(r.amount))
          amt = amt.plus(_.toBigNum(r.amount));
      }
    );

    $('#divPaymentInvoicesG').datagrid
    (
      'reloadFooter',
      [
        {
          amount: '<span class="totals_footer">' + _.formatnumber(amt) + '</span>'
        }
      ]
    );
  }

  function doList(ev, args)
  {
    var data = [];

    args.data.rs.forEach
    (
      function(i)
      {
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
            paid: _.formatnumber(i.paid, 2),
            balance: _.formatnumber(i.balance, 2),
            totalprice: _.formatnumber(i.totalprice, 2),
            totalgst: _.formatnumber(i.totalgst, 2),
            date: doNiceDate(i.invoicedate)
          }
        );
      }
    );

    $('#divPaymentInvoicesG').datagrid('loadData', data);
    doRefreshFooter();
  }

  function doPaid(ev, args)
  {
    $('#dlgPayment').dialog('close');
  }

  // Need to destroy/re-create this event since it depends on arguments that change each call...
  $('#divEvents').on('listunpaidpordersbyclient', doList);
  $('#divEvents').on('paypurchaseorders', doPaid);

  $('#dlgPayment').dialog
  (
    {
      title: 'Pay P.O.',
      onClose: function()
      {
        $('#divEvents').off('listunpaidpordersbyclient', doList);
        $('#divEvents').off('paypurchaseorders', doPaid);
      },
      onOpen: function()
      {
        $('#cbPaymentClients').combotree
        (
          {
            valueField: 'id',
            textField: 'name',
            multiple: false,
            data: cache_suppliers,
            limitToList: true,
            onSelect: function(record)
            {
              // Load invoices for this client...
              doServerDataMessage('listunpaidpordersbyclient', {clientid: record.id}, {type: 'refresh'});
            }
          }
        );

        $('#cbPaymentType').combobox
        (
          {
            valueField: 'id',
            textField: 'name',
            data: paymenttypes
          }
        );

        $('#cbPaymentReason').combobox
        (
          {
            valueField: 'id',
            textField: 'name',
            data: paymentreasons
          }
        );

        $('#dtPaymentDate').datebox(dateboxParserObj);

        $('#divPaymentInvoicesG').datagrid
        (
          {
            idField: 'id',
            fitColumns: true,
            singleSelect: false,
            rownumbers: false,
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
                {title: 'Invoice #', field: 'invoiceno', width: 150, align: 'left',  resizable: true, sortable: true}
              ]
            ],
            columns:
            [
              [
                {title: 'P.O.#',    field: 'pono',        width: 150, align: 'left',  resizable: true},
                {title: 'Invoiced', field: 'invoicedate', width: 150, align: 'right', resizable: true, sortable: true},
                {title: 'Total',    field: 'totalprice',  width: 150, align: 'right', resizable: true, sortable: true},
                {title: 'GST',      field: 'totalgst',    width: 150, align: 'right', resizable: true, sortable: true},
                {title: 'Paid',     field: 'paid',        width: 150, align: 'right', resizable: true, sortable: true, styler: function(value, row, index) {return 'color: ' + colour_mediumorchid}},
                {title: 'Balance',  field: 'balance',     width: 150, align: 'right', resizable: true, sortable: true, styler: function(value, row, index) {return 'color: ' + colour_indianred}},
                {title: 'Amount',   field: 'amount',      width: 150, align: 'right', resizable: true, editor: {type: 'numberbox', options: {precision: 2}}, styler: function(value, row, index) {return 'color: ' + colour_chocolate}},
              ]
            ],
            onEndEdit:	function(index, row, changes)
            {
              doRefreshFooter();
            },
            onDblClickCell: function(index, field, value)
            {
              doGridStartEdit
              (
                'divPaymentInvoicesG',
                editingIndex,
                function(row, index)
                {
                  editingIndex = index;

                  if (['amount'].indexOf(field) != -1)
                    field = 'amount';

                  doGridGetEditor
                  (
                    'divPaymentInvoicesG',
                    editingIndex,
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

        if (!_.isUndefined(clientid) && !_.isNull(clientid))
        {
          $('#cbPaymentClients').combotree('setValue', clientid);
          doServerDataMessage('listunpaidpordersbyclient', {clientid: clientid}, {type: 'refresh'});
        }
      },
      buttons:
      [
        {
          text: 'Pay',
          handler: function()
          {
            doSave();

            var clientid = $('#cbPaymentClients').combotree('getValue');
            var refno = $('#fldPaymentReference').textbox('getValue');
            var type = $('#cbPaymentType').combobox('getValue');
            var reason = $('#cbPaymentReason').combobox('getValue');
            var datepaid = $('#dtPaymentDate').datebox('getValue');
            var data = $('#divPaymentInvoicesG').datagrid('getData');
            var invoices = [];

            data.rows.forEach
            (
              function(r)
              {
                if (!_.isBlank(r.amount))
                {
                  invoices.push
                  (
                    {
                      porderid: r.id,
                      amount: r.amount
                    }
                  );
                }
              }
            )

            if (invoices.length > 0)
              doServerDataMessage('paypurchaseorders', {clientid: clientid, refno: refno, type: type, reason: reason, datepaid: datepaid, invoices: invoices}, {type: 'refresh'});
            else
              doShowWarning('Please apply at least one payment');
          }
        },
        {
          text: 'Close',
          handler: function()
          {
            $('#dlgPayment').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}
