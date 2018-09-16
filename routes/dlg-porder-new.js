function doDlgPOrderNew(porderid)
{
  var isnew = _.isUndefined(porderid) || _.isNull(porderid);
  var editingIndex = null;
  var porder = {};
  var invoicetostates = [];
  var shiptostates = [];

  function doReset()
  {
    $('#cbNewPOrderInvoiceAddress').combotree('clear');
    $('#cbNewPOrderShiptoAddress').combotree('clear');
    $('#divPOrderNewProductsG').datagrid('loadData', []);

    if (isnew)
    {
      $('#fldNewPOrderInvoiceno').textbox('clear');
      $('#fldNewPOrderFefno').textbox('clear');
      $('#cbNewPOrderSuppliers').combotree('clear');

      $('#dtNewPOrderInvoiceDueDate').datebox('clear');

      $('#fldNewPOrderOrderName').textbox('clear');
      $('#fldNewPOrderAddress1').textbox('clear');
      $('#fldNewPOrderAddress2').textbox('clear');
      $('#fldNewPOrderAddress3').textbox('clear');
      $('#fldNewPOrderAddress4').textbox('clear');
      $('#fldNewPOrderCity').textbox('clear');
      $('#fldNewPOrderPostcode').textbox('clear');
      $('#cbNewPOrderState').combobox('clear');

      $('#fldNewPOrderShiptoName').textbox('clear');
      $('#fldNewPOrderShiptoAddress1').textbox('clear');
      $('#fldNewPOrderShiptoAddress2').textbox('clear');
      $('#fldNewPOrderShiptoAddress3').textbox('clear');
      $('#fldNewPOrderShiptoAddress4').textbox('clear');
      $('#fldNewPOrderShiptoCity').textbox('clear');
      $('#fldNewPOrderShiptoPostcode').textbox('clear');
      $('#cbNewPOrderShiptoState').combobox('clear');

      $('#btnPOrderNewAdd').linkbutton('disable');
      $('#cbNewPOrderSuppliers').combotree('enable');

      $('#cbNewPOrderCountry').combobox('setValue', defaultCountry);
      $('#cbNewPOrderShiptoCountry').combobox('setValue', defaultCountry);
    }
    else
    {
      if (!_.isEmpty(porder))
      {
        $('#fldNewPOrderInvoiceno').textbox('setValue', porder.invoiceno);
        $('#fldNewPOrderFefno').textbox('setValue', porder.refno);
        $('#cbNewPOrderSuppliers').combotree('setValue', porder.clientid);

        $('#dtNewPOrderInvoiceDueDate').datebox('setValue', porder.dateinvoicedue);

        $('#fldNewPOrderOrderName').textbox('setValue', porder.name);
        $('#fldNewPOrderAddress1').textbox('setValue', porder.invoicetoaddress1);
        $('#fldNewPOrderAddress2').textbox('setValue', porder.invoicetoaddress2);
        $('#fldNewPOrderAddress3').textbox('setValue', porder.invoicetoaddress3);
        $('#fldNewPOrderAddress4').textbox('setValue', porder.invoicetoaddress4);
        $('#fldNewPOrderCity').textbox('setValue', porder.invoicetocity);
        $('#fldNewPOrderPostcode').textbox('setValue', porder.invoicetopostcode);
        $('#cbNewPOrderCountry').combobox('setValue', porder.invoicetocountry);
        $('#cbNewPOrderState').combobox('setValue', porder.invoicetostate);

        $('#fldNewPOrderShiptoName').textbox('setValue', porder.shiptoname);
        $('#fldNewPOrderShiptoAddress1').textbox('setValue', porder.shiptoaddress1);
        $('#fldNewPOrderShiptoAddress2').textbox('setValue', porder.shiptoaddress2);
        $('#fldNewPOrderShiptoAddress3').textbox('setValue', porder.shiptoaddress3);
        $('#fldNewPOrderShiptoAddress4').textbox('setValue', porder.shiptoaddress4);
        $('#fldNewPOrderShiptoCity').textbox('setValue', porder.shiptocity);
        $('#fldNewPOrderShiptoPostcode').textbox('setValue', porder.shiptopostcode);
        $('#cbNewPOrderShiptoCountry').combobox('setValue', porder.shiptocountry);
        $('#cbNewPOrderShiptoState').combobox('setValue', porder.shiptostate);

        $('#btnPOrderNewAdd').linkbutton('enable');
        $('#btnPOrderNewComplete').linkbutton((_.isBlank(porder.datecompleted)) ? 'enable' : 'disable');
        $('#cbNewPOrderSuppliers').combotree('disable');
        $('#dlgPOrderNew').dialog('setTitle', 'Modify ' + porder.porderno);

        doServerDataMessage('listporderdetails', {porderid: porderid}, {type: 'refresh'});
      }
    }

    doTextboxFocus('fldNewPOrderOrderName');
  }

  function doProductChanged(record)
  {
    doGridGetSelectedRowData
    (
      'divPOrderNewProductsG',
      function(row, rowindex)
      {
        var supplierid = doGetComboTreeSelectedId('cbNewPOrderSuppliers');

        // Get latest row data from editors...
        doGridGetEditor
        (
          'divPOrderNewProductsG',
          rowindex,
          'productid',
          function(ed)
          {
            var qty = $(ed.target).numberbox('getValue');

            doServerDataMessage('getprice', {clientid: supplierid, productid: record.id, qty: qty}, {type: 'refresh', rowindex: rowindex});
          }
        );
      }
    );
  }

  function doQtyChanged(newqty)
  {
    doGridGetSelectedRowData
    (
      'divPOrderNewProductsG',
      function(row, rowindex)
      {
        var supplierid = doGetComboTreeSelectedId('cbNewPOrderSuppliers');

        // Get latest row data from editors...
        doGridGetEditor
        (
          'divPOrderNewProductsG',
          rowindex,
          'productid',
          function(ed)
          {
            var productid = $(ed.target).combobox('getValue');

            doServerDataMessage('getprice', {clientid: supplierid, productid: productid, qty: newqty}, {type: 'refresh', rowindex: rowindex});
          }
        );
      }
    );
  }

  function doReCalcTotals()
  {
    doGridCalcTotals('divPOrderNewProductsG', 'price', 'qty');
  }

  function doNew()
  {
    var supplierid = doGetComboTreeSelectedId('cbNewPOrderSuppliers');

    doDlgProductSelect
    (
      supplierid,
      true,
      true,
      function(productid, productname, qty, price)
      {
        $('#divPOrderNewProductsG').datagrid
        (
          'appendRow',
          {
            id: productid,
            productid: productid,
            qty: qty,
            price: price
          }
        );

        $('#btnPOrderNewAdd').linkbutton('enable');
        doReCalcTotals();
      }
    );
  }

  function doClear()
  {
    $('#divPOrderNewProductsG').datagrid('clearSelections');
  }

  function doEdit()
  {
    doGridGetSelectedRowData
    (
      'divPOrderNewProductsG',
      function(row)
      {
        if (_.isBlank(row.datecompleted))
        {
          doGridStartEdit
          (
            'divPOrderNewProductsG',
            editingIndex,
            function(row, index)
            {
              editingIndex = index;

              doGridGetEditor
              (
                'divPOrderNewProductsG',
                editingIndex,
                'price',
                function(ed)
                {
                }
              );
            }
          );
        }
        else
          doShowWarning('Unable to edit completed P.O.');
      }
    );
  }

  function doCancel()
  {
    editingIndex = doGridCancelEdit('divPOrderNewProductsG', editingIndex);
  }

  function doSave()
  {
    doGridEndEditGetRow
    (
      'divPOrderNewProductsG',
      editingIndex,
      function(row)
      {
        doReCalcTotals();
      }
    );

    editingIndex = null;
  }

  function doRemove()
  {
    if (!doGridGetSelectedRowData
      (
        'divPOrderNewProductsG',
        function(row)
        {
          doPromptOkCancel
          (
            'Remove ' + doGetCodeFromIdInObjArray(cache_products, row.productid) + '?',
            function(result)
            {
              if (result)
              {
                doGridRemoveRow('divPOrderNewProductsG', row);
                doReCalcTotals();
              }
            }
          );
        }
      ))
    {
      doShowError('Please select a product to remove');
    }
  }

  function doComplete()
  {
    var invoiceno = $('#fldNewPOrderInvoiceno').textbox('getValue');

    if (!_.isBlank(invoiceno))
      doServerDataMessage('completeporder', {porderid: porderid}, {type: 'refresh'});
    else
      doMandatoryTextbox('Please specify supplier invoice no.', 'fldNewPOrderInvoiceno');
  }

  function doPOrderUpdated(ev, args)
  {
    $('#dlgPOrderNew').dialog('close');
  }

  function doGetPrice(ev, args)
  {
    doGridGetEditor
    (
      'divPOrderNewProductsG',
      args.pdata.rowindex,
      'price',
      function(edprice)
      {
        doGridGetEditor
        (
          'divPOrderNewProductsG',
          args.pdata.rowindex,
          'qty',
          function(edqty)
          {
            var qty = $(edqty.target).numberbox('getValue');

            // Check if this has a min qty...
            if (!_.isNull(args.data.price.minqty))
            {
              var m = _.toBigNum(args.data.price.minqty);

              // If user has no qty, set it to min...
              // If user has a qty, check it's at least the min...
              if (_.isBlank(qty) || m.greaterThan(qty))
                $(edqty.target).numberbox('setValue', args.data.price.minqty);
            }

            $(edprice.target).numberbox('setValue', args.data.price.costprice);
          }
        );
      }
    );
  }

  function doLoadSupplier(ev, args)
  {
    if (args.pdata.type == 'refresh')
    {
      $('#fldNewPOrderOrderName').textbox('setValue', args.data.supplier.name);
      $('#fldNewPOrderAddress1').textbox('setValue', args.data.supplier.address1);
      $('#fldNewPPOrderAddress2').textbox('setValue', args.data.supplier.address2);
      $('#fldNewPOrderAddress3').textbox('setValue', args.data.supplier.address3);
      $('#fldNewPOrderAddress4').textbox('setValue', args.data.supplier.address4);
      $('#fldNewPOrderCity').textbox('setValue', args.data.supplier.city);
      $('#fldNewPOrderPostcode').textbox('setValue', args.data.supplier.postcode);
      $('#cbNewPOrderCountry').combobox('setValue', args.data.supplier.country);
      $('#cbNewPOrderState').combobox('setValue', args.data.supplier.state);

      $('#fldNewPOrderShiptoName').textbox('setValue', 'The Paper Cup Company');
      $('#fldNewPOrderShiptoAddress1').textbox('setValue', 'Factory 8');
      $('#fldNewPOrderShiptoAddress2').textbox('setValue', '8 Adina Court');
      $('#fldNewPOrderShiptoAddress3').textbox('setValue', '');
      $('#fldNewPOrderShiptoAddress4').textbox('setValue', '');
      $('#fldNewPOrderShiptoCity').textbox('setValue', 'Tullamarine');
      $('#fldNewPOrderShiptoPostcode').textbox('setValue', '3043');
      $('#cbNewPOrderShiptoCountry').combobox('setValue', 'australia');
      $('#cbNewPOrderShiptoState').combobox('setValue', 'victoria');
    }
    else
    {
      $('#fldNewPOrderOrderName').textbox('setValue', args.data.supplier.name);
      $('#fldNewPOrderAddress1').textbox('setValue', args.data.supplier.address1);
      $('#fldNewPPOrderAddress2').textbox('setValue', args.data.supplier.address2);
      $('#fldNewPOrderAddress3').textbox('setValue', args.data.supplier.address3);
      $('#fldNewPOrderAddress4').textbox('setValue', args.data.supplier.address4);
      $('#fldNewPOrderCity').textbox('setValue', args.data.supplier.city);
      $('#fldNewPOrderPostcode').textbox('setValue', args.data.supplier.postcode);
      $('#cbNewPOrderCountry').combobox('setValue', args.data.supplier.country);
      $('#cbNewPOrderState').combobox('setValue', args.data.supplier.state);
    }
  }

  function doLoadClient(ev, args)
  {
    $('#fldNewPOrderShiptoName').textbox('setValue', args.data.client.shiptoname);
    $('#fldNewPOrderShiptoAddress1').textbox('setValue', args.data.client.shipaddress1);
    $('#fldNewPOrderShiptoAddress2').textbox('setValue', args.data.client.shipaddress2);
    $('#fldNewPOrderShiptoAddress3').textbox('setValue', args.data.client.shipaddress3);
    $('#fldNewPOrderShiptoAddress4').textbox('setValue', args.data.client.shipaddress4);
    $('#fldNewPOrderShiptoCity').textbox('setValue', args.data.client.shipcity);
    $('#fldNewPOrderShiptoPostcode').textbox('setValue', args.data.client.shippostcode);
    $('#cbNewPOrderShiptoCountry').combobox('setValue', args.data.client.shipcountry);
    $('#cbNewPOrderShiptoState').combobox('setValue', args.data.client.shipstate);
  }

  function doLoadPOrder(ev, args)
  {
    porder = (args.data.porder);
    doReset();
  }

  function doListPOrderDetails(ev, args)
  {
    $('#divPOrderNewProductsG').datagrid('loadData', args.data.rs);
  }

  function doEventsHandler(ev, args)
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
  }

  $('#divEvents').on('newporder', doPOrderUpdated);
  $('#divEvents').on('saveporder', doPOrderUpdated);
  $('#divEvents').on('completeporder', doPOrderUpdated);
  $('#divEvents').on('getprice', doGetPrice);
  $('#divEvents').on('loadsupplier', doLoadSupplier);
  $('#divEvents').on('loadclient', doLoadClient);
  $('#divEvents').on('pordernewpopup', doEventsHandler);
  $('#divEvents').on('loadporder', doLoadPOrder);
  $('#divEvents').on('listporderdetails', doListPOrderDetails);

  $('#dlgPOrderNew').dialog
  (
    {
      onClose: function()
      {
        $('#divEvents').off('newporder', doPOrderUpdated);
        $('#divEvents').off('saveporder', doPOrderUpdated);
        $('#divEvents').off('completeporder', doPOrderUpdated);
        $('#divEvents').off('getprice', doGetPrice);
        $('#divEvents').off('loadsupplier', doLoadSupplier);
        $('#divEvents').off('loadclient', doLoadClient);
        $('#divEvents').off('pordernewpopup', doEventsHandler);
        $('#divEvents').off('loadporder', doLoadPOrder);
        $('#divEvents').off('listporderdetails', doListPOrderDetails);
      },
      onOpen: function()
      {
        $('#dtNewPOrderInvoiceDueDate').datebox(dateboxParserObj);

        $('#cbNewPOrderSuppliers').combotree
        (
          {
            valueField: 'id',
            textField: 'name',
            multiple: false,
            data: cache_suppliers,
            limitToList: true,
            onSelect: function(record)
            {
              $('#fldNewPOrderOrderName').textbox('setValue', record.name);
              // Get supplier address details and pre-fill purchase order info...
              doServerDataMessage('loadsupplier', {supplierid: record.id}, {type: 'refresh'});
            }
          }
        );

        $('#cbNewPOrderInvoiceAddress').combotree
        (
          {
            valueField: 'id',
            textField: 'name',
            multiple: false,
            data: cache_suppliers,
            limitToList: true,
            onSelect: function(record)
            {
              doServerDataMessage('loadsupplier', {supplierid: record.id}, {type: 'invoiceto'});
            }
          }
        );

        $('#cbNewPOrderShiptoAddress').combotree
        (
          {
            valueField: 'id',
            textField: 'name',
            multiple: false,
            data: cache_clients,
            limitToList: true,
            onSelect: function(record)
            {
              doServerDataMessage('loadclient', {clientid: record.id}, {type: 'shipto'});
            }
          }
        );

        $('#cbNewPOrderCountry').combobox
        (
          {
            valueField: 'country',
            textField: 'country',
            data: cache_countries,
            limitToList: true,
            onSelect: function(record)
            {
              invoicetostates = doGetStatesFromCountry(record.country);

              $('#cbNewPOrderState').combobox('loadData', invoicetostates);
            }
          }
        );

        $('#cbNewPOrderState').combobox
        (
          {
            valueField: 'state',
            textField: 'state',
            data: shiptostates,
            limitToList: true,
          }
        );

        $('#cbNewPOrderShiptoCountry').combobox
        (
          {
            valueField: 'country',
            textField: 'country',
            data: cache_countries,
            limitToList: true,
            onSelect: function(record)
            {
              shiptostates = doGetStatesFromCountry(record.country);

              $('#cbNewPOrderShiptoState').combobox('loadData', shiptostates);
            }
          }
        );

        $('#cbNewPOrderShiptoState').combobox
        (
          {
            valueField: 'state',
            textField: 'state',
            data: shiptostates,
            limitToList: true,
          }
        );

        $('#divPOrderNewProductsG').datagrid
        (
          {
            idField: 'id',
            fitColumns: true,
            singleSelect: true,
            rownumbers: true,
            striped: true,
            toolbar: '#tbPOrderNew',
            showFooter: true,
            columns:
            [
              [
                {title: 'Product',  field: 'productid', width: 200, align: 'left',  resizable: true, editor: {type: 'combobox',  options: {valueField: 'id', textField: 'code', groupField: 'productcategoryname', data: cache_products, onSelect: function(record) {doProductChanged(record);}}}, formatter: function(value, row) {return doGetCodeFromIdInObjArray(cache_products, value);}},
                {title: 'Price',    field: 'price',     width: 100, align: 'right', resizable: true, editor: {type: 'numberbox', options: {groupSeparator: ',', precision: 4}}, formatter: function(value, row, index) {if (!_.isUndefined(row.id)) return _.niceformatnumber(value); return value;}},
                {title: 'Qty',      field: 'qty',       width: 100, align: 'right', resizable: true, editor: {type: 'numberbox', options: {groupSeparator: ',', precision: 4, onChange: function(newValue, oldValue) {if (!_.isNull(oldValue) && (newValue != oldValue)) doQtyChanged(newValue);}}}, formatter: function(value, row, index) {if (!_.isUndefined(row.id)) return _.niceformatqty(value); return value;}}
              ]
            ],
            onRowContextMenu: function(e, index, row)
            {
              doGridContextMenu('divPOrderNewProductsG', 'divPOrderNewMenuPopup', e, index, row);
            },
            onDblClickCell: function(index, field, value)
            {
              doGridGetSelectedRowData
              (
                'divPOrderNewProductsG',
                function(row)
                {
                  doGridStartEdit
                  (
                    'divPOrderNewProductsG',
                    editingIndex,
                    function(row, index)
                    {
                      editingIndex = index;

                      if (['modified', 'by'].indexOf(field) != -1)
                        field = 'price';

                      doGridGetEditor
                      (
                        'divPOrderNewProductsG',
                        editingIndex,
                        field,
                        function(ed)
                        {
                        }
                      );
                    }
                  );
                }
              );
            }
          }
        );

        if (isnew)
          $('#btnPOrderNewAdd').linkbutton({text: 'Add'});
        else
          $('#btnPOrderNewAdd').linkbutton({text: 'Save'});

        if (!_.isNull(porderid))
          doServerDataMessage('loadporder', {porderid: porderid}, {type: 'refresh'});
        else
          doReset();
      },
      buttons:
      [
        {
          text: 'Add',
          disabled: true,
          id: 'btnPOrderNewAdd',
          handler: function()
          {
            var invoiceno = $('#fldNewPOrderInvoiceno').textbox('getValue');
            var refno = $('#fldNewPOrderFefno').textbox('getValue');
            var supplier = $('#cbNewPOrderSuppliers').combotree('getValue');

            var name = $('#fldNewPOrderOrderName').textbox('getValue');
            var address1 = $('#fldNewPOrderAddress1').textbox('getValue');
            var address2 = $('#fldNewPOrderAddress2').textbox('getValue');
            var address3 = $('#fldNewPOrderAddress3').textbox('getValue');
            var address4 = $('#fldNewPOrderAddress4').textbox('getValue');
            var city = $('#fldNewPOrderCity').textbox('getValue');
            var postcode= $('#fldNewPOrderPostcode').textbox('getValue');
            var country = $('#cbNewPOrderCountry').combobox('getValue');
            var state = $('#cbNewPOrderState').combobox('getValue');

            var shiptoname = $('#fldNewPOrderShiptoName').textbox('getValue');
            var shiptoaddress1 = $('#fldNewPOrderShiptoAddress1').textbox('getValue');
            var shiptoaddress2 = $('#fldNewPOrderShiptoAddress2').textbox('getValue');
            var shiptoaddress3 = $('#fldNewPOrderShiptoAddress3').textbox('getValue');
            var shiptoaddress4 = $('#fldNewPOrderShiptoAddress4').textbox('getValue');
            var shiptocity = $('#fldNewPOrderShiptoCity').textbox('getValue');
            var shiptopostcode= $('#fldNewPOrderShiptoPostcode').textbox('getValue');
            var shiptocountry = $('#cbNewPOrderShiptoCountry').combobox('getValue');
            var shiptostate = $('#cbNewPOrderShiptoState').combobox('getValue');

            var data = $('#divPOrderNewProductsG').datagrid('getData');

            if (!_.isBlank(name) || !_.isBlank(supplier))
            {
              if (isnew)
              {
                doServerDataMessage
                (
                  'newpordersupplier',
                  {
                    name: name,
                    invoiceno: invoiceno,
                    refno: refno,
                    supplierid: supplier,
                    address1: address1,
                    address2: address2,
                    address3: address3,
                    address4: address4,
                    city: city,
                    postcode: postcode,
                    country: country,
                    state: state,
                    shiptoname: shiptoname,
                    shiptoaddress1: shiptoaddress1,
                    shiptoaddress2: shiptoaddress2,
                    shiptoaddress3: shiptoaddress3,
                    shiptoaddress4: shiptoaddress4,
                    shiptocity: shiptocity,
                    shiptopostcode: shiptopostcode,
                    shiptocountry: shiptocountry,
                    shiptostate: shiptostate,
                    products: data.rows
                  },
                  {type: 'refresh'}
                );
              }
              else
              {
                doServerDataMessage
                (
                  'savepordersupplier',
                  {
                    porderid: porderid,
                    name: name,
                    invoiceno: invoiceno,
                    refno: refno,
                    supplierid: supplier,
                    address1: address1,
                    address2: address2,
                    address3: address3,
                    address4: address4,
                    city: city,
                    postcode: postcode,
                    country: country,
                    state: state,
                    shiptoname: shiptoname,
                    shiptoaddress1: shiptoaddress1,
                    shiptoaddress2: shiptoaddress2,
                    shiptoaddress3: shiptoaddress3,
                    shiptoaddress4: shiptoaddress4,
                    shiptocity: shiptocity,
                    shiptopostcode: shiptopostcode,
                    shiptocountry: shiptocountry,
                    shiptostate: shiptostate,
                    products: data.rows
                  },
                  {type: 'refresh'}
                );
              }
            }
            else
              doMandatoryTextbox('Need at least a name or supplier', 'fldNewPOrderOrderName');
          }
        },
        {
          text: 'Reset',
          handler: function()
          {
            doReset();
          }
        },
        {
          text: 'Complete',
          disabled: true,
          id: 'btnPOrderNewComplete',
          handler: function()
          {
            doComplete();
          }
        },
        {
          text: 'Close',
          handler: function()
          {
            $('#dlgPOrderNew').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}

