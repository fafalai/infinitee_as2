function doDlgSupplierNew(parentid, supplierid)
{
  var isnew = _.isUndefined(supplierid) || _.isNull(supplierid);
  var supplier = {};
  var invoicestates = [];
  var shippingstates = [];

  function doReset()
  {
    $('#cbNewSupplierParent').combotree('setValue', parentid);

    if (isnew)
    {
      $('#fldNewSupplierName').textbox('clear');
      $('#fldNewSupplierCode').textbox('clear');
      $('#fldNewSupplierContact1').textbox('clear');
      $('#fldNewSupplierContact2').textbox('clear');

      $('#fldNewCSupplierEmail1').textbox('clear');
      $('#fldNewSupplierUrl1').textbox('clear');
      $('#fldNewSupplierPhone1').textbox('clear');
      $('#fldNewSupplierFax1').textbox('clear');

      $('#fldNewSupplierAddress1').textbox('clear');
      $('#fldNewSupplierAddress2').textbox('clear');
      $('#fldNewSupplierAddress3').textbox('clear');
      $('#fldNewSupplierAddress4').textbox('clear');
      $('#fldNewSupplierCity').textbox('clear');
      $('#fldNewSupplierPostcode').textbox('clear');
      $('#cbNewSupplierCountry').combobox('clear');
      $('#cbNewSupplierState').combobox('clear');

      $('#fldNewSupplierShippingAddress1').textbox('clear');
      $('#fldNewSupplierShippingAddress2').textbox('clear');
      $('#fldNewSupplierShippingAddress3').textbox('clear');
      $('#fldNewSupplierShippingAddress4').textbox('clear');
      $('#fldNewSupplierShippingCity').textbox('clear');
      $('#fldNewSupplierShippingPostcode').textbox('clear');
      $('#cbNewSupplierShippingCountry').combobox('clear');
      $('#cbNewSupplierShippingState').combobox('clear');

      $('#fldNewSupplierBankName').textbox('clear');
      $('#fldNewSupplierBankBsb').textbox('clear');
      $('#fldNewSupplierBankAcctNo').textbox('clear');
      $('#fldNewSupplierBankAcctName').textbox('clear');

      $('#fldNewSupplierDaysCredit').numberbox('clear');
      $('#fldNewSupplierLineLimit').numberbox('clear');
      $('#fldNewSupplierOrderLimit').numberbox('clear');
      $('#fldNewSupplierCreditLimit').numberbox('clear');

      $('#fldNewSupplierAcn').textbox('clear');
      $('#fldNewSupplierAbn').textbox('clear');
      $('#fldNewSupplierHsCode').textbox('clear');
      $('#fldNewSupplierCustom1').textbox('clear');
      $('#fldNewSupplierCustom2').textbox('clear');

      $('#cbNewSupplierSalesAccount').combotree('clear');
      $('#cbNewSupplierIncomeAccount').combotree('clear');
      $('#cbNewSupplierExpenseAccount').combotree('clear');
      $('#cbNewSupplierAssetAccount').combotree('clear');

      $('#btnSupplierNewAdd').linkbutton('disable');

      $('#cbNewSupplierCountry').combobox('setValue', defaultCountry);
      $('#cbNewSupplierShippingCountry').combobox('setValue', defaultCountry);
    }
    else
    {
      if (!_.isEmpty(supplier))
      {
        $('#fldNewSupplierName').textbox('setValue', supplier.name);
        $('#fldNewSupplierCode').textbox('setValue', supplier.code);
        $('#fldNewSupplierContact1').textbox('setValue', supplier.contact1);
        $('#fldNewSupplierContact2').textbox('setValue', supplier.contact2);

        $('#fldNewSupplierEmail1').textbox('setValue', supplier.email1);
        $('#fldNewSupplierUrl1').textbox('setValue', supplier.url1);
        $('#fldNewSupplierPhone1').textbox('setValue', supplier.phone1);
        $('#fldNewSupplierFax1').textbox('setValue', supplier.fax1);

        $('#fldNewSupplierAddress1').textbox('setValue', supplier.address1);
        $('#fldNewSupplierAddress2').textbox('setValue', supplier.address2);
        $('#fldNewSupplierAddress3').textbox('setValue', supplier.address3);
        $('#fldNewSupplierAddress4').textbox('setValue', supplier.address4);
        $('#fldNewSupplierCity').textbox('setValue', supplier.city);
        $('#fldNewSupplierPostcode').textbox('setValue', supplier.postcode);
        $('#cbNewSupplierCountry').combobox('setValue', supplier.country);
        $('#cbNewSupplierState').combobox('setValue', supplier.state);

        $('#fldNewSupplierShippingAddress1').textbox('setValue', supplier.shipaddress1);
        $('#fldNewSupplierShippingAddress2').textbox('setValue', supplier.shipaddress2);
        $('#fldNewSupplierShippingAddress3').textbox('setValue', supplier.shipaddress3);
        $('#fldNewSupplierShippingAddress4').textbox('setValue', supplier.shipaddress4);
        $('#fldNewSupplierShippingCity').textbox('setValue', supplier.shipcity);
        $('#fldNewSupplierShippingPostcode').textbox('setValue', supplier.shippostcode);
        $('#cbNewSupplierShippingCountry').combobox('setValue', supplier.shipcountry);
        $('#cbNewSupplierShippingState').combobox('setValue', supplier.shipstate);

        $('#fldNewSupplierBankName').textbox('setValue', supplier.bankname);
        $('#fldNewSupplierBankBsb').textbox('setValue', supplier.bankbsb);
        $('#fldNewSupplierBankAcctNo').textbox('setValue', supplier.bankaccountno);
        $('#fldNewSupplierBankAcctName').textbox('setValue', supplier.banlaccountname);

        $('#fldNewSupplierDaysCredit').numberbox('setValue', supplier.dayscredit);
        $('#fldNewSupplierLineLimit').numberbox('setValue', supplier.linelimit);
        $('#fldNewSupplierOrderLimit').numberbox('setValue', supplier.orderlimit);
        $('#fldNewSupplierCreditLimit').numberbox('setValue', supplier.creditlimit);

        $('#fldNewSupplierAcn').textbox('setValue', supplier.acn);
        $('#fldNewSupplierAbn').textbox('setValue', supplier.abn);
        $('#fldNewSupplierHsCode').textbox('setValue', supplier.hscode);
        $('#fldNewSupplierCustom1').textbox('setValue', supplier.custcode1);
        $('#fldNewSupplierCustom2').textbox('setValue', supplier.custcode2);

        $('#cbNewSupplierSalesAccount').combotree('setValue', supplier.costofgoodsaccountid);
        $('#cbNewSupplierIncomeAccount').combotree('setValue', supplier.incomeaccountid);
        $('#cbNewSupplierExpenseAccount').combotree('setValue', supplier.expenseaccountid);
        $('#cbNewSupplierAssetAccount').combotree('setValue', supplier.assetaccountid);

        $('#btnSupplierNewAdd').linkbutton('enable');
        $('#dlgSupplierNew').dialog('setTitle', 'Modify ' + supplier.name);
      }
    }

    doTextboxFocus('fldNewSupplierName');
  }

  function doCheckCode(ev, args)
  {
    var suppliers = args.data.rs;

    // Code already exists?
    if (suppliers.length > 0)
    {
      doShowError('Supplier code [' + suppliers[0].code + '] is already assigned to [' + suppliers[0].name + ']');
      $('#btnSupplierNewAdd').linkbutton('disable');
    }
    else
      $('#btnSupplierNewAdd').linkbutton('enable');
  }

  function doSaved(ev, args)
  {
    $('#dlgSupplierNew').dialog('close');
  }

  function doLoad(ev, args)
  {
    supplier = (args.data.supplier);
    doReset();
  }

  $('#divEvents').on('checksuppliercode', doCheckCode);
  $('#divEvents').on('newsupplier', doSaved);
  $('#divEvents').on('savesupplier', doSaved);
  $('#divEvents').on('loadsupplier', doLoad);

  $('#dlgSupplierNew').dialog
  (
    {
      onClose: function()
      {
        $('#divEvents').off('checksuppliercode', doCheckCode);
        $('#divEvents').off('newsupplier', doSaved);
        $('#divEvents').off('savesupplier', doSaved);
        $('#divEvents').off('loadsupplier', doLoad);
      },
      onOpen: function()
      {
        $('#cbNewSupplierParent').combotree
        (
          {
            valueField: 'id',
            textField: 'name',
            data: cache_suppliers
          }
        );

        $('#fldNewSupplierCode').textbox
        (
          {
            onChange: function(newValue, oldValue)
            {
              if (!_.isBlank(newValue))
              {
                // Check we're using a unique code...
                if (newValue != oldValue)
                  doServerDataMessage('checksuppliercode', {supplierid: supplierid, code: newValue}, {type: 'refresh'});
              }
              else
                $('#btnSupplierNewAdd').linkbutton('disable');
            }
          }
        );

        $('#cbNewSupplierIsActive').switchbutton
        (
          {
            checked: true,
            onText: 'Yes',
            offText: 'No'
          }
        );

        $('#cbNewSupplierCountry').combobox
        (
          {
            valueField: 'country',
            textField: 'country',
            limitToList: true,
            data: cache_countries,
            onSelect: function(record)
            {
              invoicestates = doGetStatesFromCountry(record.country);

              $('#cbNewSupplierState').combobox('loadData', invoicestates);
            }
          }
        );

        $('#cbNewSupplierShippingCountry').combobox
        (
          {
            valueField: 'country',
            textField: 'country',
            limitToList: true,
            data: cache_countries,
            onSelect: function(record)
            {
              shippingstates = doGetStatesFromCountry(record.country);

              $('#cbNewSupplierShippingState').combobox('loadData', shippingstates);
            }
          }
        );

        $('#cbNewSupplierState').combobox
        (
          {
            valueField: 'state',
            textField: 'state',
            limitToList: true,
            data: invoicestates
          }
        );

        $('#cbNewSupplierShippingState').combobox
        (
          {
            valueField: 'state',
            textField: 'state',
            limitToList: true,
            data: shippingstates
          }
        );

        $('#cbNewSupplierSalesAccount').combotree
        (
          {
            valueField: 'id',
            textField: 'name',
            data: cache_accounts
          }
        );

        $('#cbNewSupplierIncomeAccount').combotree
        (
          {
            valueField: 'id',
            textField: 'name',
            data: cache_accounts
          }
        );

        $('#cbNewSupplierExpenseAccount').combotree
        (
          {
            valueField: 'id',
            textField: 'name',
            data: cache_accounts
          }
        );

        $('#cbNewSupplierAssetAccount').combotree
        (
          {
            valueField: 'id',
            textField: 'name',
            data: cache_accounts
          }
        );

        if (isnew)
          $('#btnSupplierNewAdd').linkbutton({text: 'Add'});
        else
          $('#btnSupplierNewAdd').linkbutton({text: 'Save'});

        if (!_.isUndefined(supplierid) && !_.isNull(supplierid))
          doServerDataMessage('loadsupplier', {supplierid: supplierid}, {type: 'refresh'});
        else
          doReset();
      },
      buttons:
      [
        {
          text: 'Add',
          disabled: true,
          id: 'btnSupplierNewAdd',
          handler: function()
          {
            var parentid = doGetComboTreeSelectedId('cbNewSupplierParent');
            var name = $('#fldNewSupplierName').textbox('getValue');
            var code = $('#fldNewSupplierCode').textbox('getValue');

            var email1 = $('#fldNewCSupplierEmail1').textbox('getValue');
            var url1 = $('#fldNewSupplierUrl1').textbox('getValue');
            var phone1 = $('#fldNewSupplierPhone1').textbox('getValue');
            var fax1 = $('#fldNewSupplierFax1').textbox('getValue');

            var contact1 = $('#fldNewSupplierContact1').textbox('getValue');
            var contact2 = $('#fldNewSupplierContact2').textbox('getValue');

            var bankname = $('#fldNewSupplierBankName').textbox('getValue');
            var bankbsb = $('#fldNewSupplierBankBsb').textbox('getValue');
            var bankacctno = $('#fldNewSupplierBankAcctNo').textbox('getValue');
            var bankacctname = $('#fldNewSupplierBankAcctName').textbox('getValue');

            var address1 = $('#fldNewSupplierAddress1').textbox('getValue');
            var address2 = $('#fldNewSupplierShippingAddress2').textbox('getValue');
            var address3 = $('#fldNewSupplierShippingAddress3').textbox('getValue');
            var address4 = $('#fldNewSupplierShippingAddress4').textbox('getValue');
            var city = $('#fldNewSupplierShippingCity').textbox('getValue');
            var postcode = $('#fldNewSupplierShippingPostcode').textbox('getValue');
            var country = $('#cbNewSupplierShippingCountry').combobox('getValue');
            var state = $('#cbNewSupplierShippingState').combobox('getValue');

            var shiptoaddress1 = $('#fldNewSupplierShippingAddress1').textbox('getValue');
            var shiptoaddress2 = $('#fldNewSupplierShippingAddress2').textbox('getValue');
            var shiptoaddress3 = $('#fldNewSupplierShippingAddress3').textbox('getValue');
            var shiptoaddress4 = $('#fldNewSupplierShippingAddress4').textbox('getValue');
            var shiptocity = $('#fldNewSupplierShippingCity').textbox('getValue');
            var shiptopostcode = $('#fldNewSupplierShippingPostcode').textbox('getValue');
            var shiptocountry = $('#cbNewSupplierShippingCountry').combobox('getValue');
            var shiptostate = $('#cbNewSupplierShippingState').combobox('getValue');

            var dayscredit = $('#fldNewSupplierDaysCredit').numberbox('getValue');
            var linelimit = $('#fldNewSupplierLineLimit').numberbox('getValue');
            var orderlimit = $('#fldNewSupplierOrderLimit').numberbox('getValue');
            var creditlimit = $('#fldNewSupplierCreditLimit').numberbox('getValue');

            var costofgoodsaccountid = doGetComboTreeSelectedId('cbNewSupplierSalesAccount');
            var incomeaccountid = doGetComboTreeSelectedId('cbNewSupplierIncomeAccount');
            var expenseaccountid = doGetComboTreeSelectedId('cbNewSupplierExpenseAccount');
            var assetaccountid = doGetComboTreeSelectedId('cbNewSupplierAssetAccount');

            // var ordertemplateid = $('#cbNewClientOrderTemplate').combobox('getValue');
            // var qoutetemplateid = $('#cbNewClientQuoteTemplate').combobox('getValue');
            // var invoicetemplateid = $('#cbNewClientInvoiceTemplate').combobox('getValue');
            // var labeltemplateid = $('#cbNewClientLabelTemplate').combobox('getValue');

            var acn = $('#fldNewSupplierAcn').textbox('getValue');
            var abn = $('#fldNewSupplierAbn').textbox('getValue');
            var hscode = $('#fldNewSupplierHsCode').textbox('getValue');
            var custcode1 = $('#fldNewSupplierCustom1').textbox('getValue');
            var custcode2 = $('#fldNewSupplierCustom2').textbox('getValue');

            if (!_.isBlank(name))
            {
              if (!_.isBlank(code))
              {
                if (isnew)
                {
                  doServerDataMessage
                  (
                    'newsupplier',
                    {
                      parentid: parentid,
                      name: name,
                      code: code,
                      email1: email1,
                      url1: url1,
                      phone1: phone1,
                      fax1: fax1,

                      contact1: contact1,
                      address1: address1,
                      address2: address2,
                      address3: address3,
                      address4: address4,
                      city: city,
                      state: state,
                      postcode: postcode,
                      country: country,

                      contact2: contact2,
                      shiptoaddress1: shiptoaddress1,
                      shiptoaddress2: shiptoaddress2,
                      shiptoaddress3: shiptoaddress3,
                      shiptoaddress4: shiptoaddress4,
                      shiptocity: shiptocity,
                      shiptostate: shiptostate,
                      shiptopostcode: shiptopostcode,
                      shiptocountry: shiptocountry,

                      bankname: bankname,
                      bankbsb: bankbsb,
                      bankaccountno: bankacctno,
                      bankaccountname: bankacctname,

                      dayscredit: dayscredit,
                      linelimit: linelimit,
                      orderlimit: orderlimit,
                      creditlimit: creditlimit,

                      costofgoodsaccountid: costofgoodsaccountid,
                      incomeaccountid: incomeaccountid,
                      expenseaccountid: expenseaccountid,
                      assetaccountid: assetaccountid,

                      // invoicetemplateid: invoicetemplateid,
                      // ordertemplateid: ordertemplateid,
                      // qoutetemplateid: qoutetemplateid,
                      // labeltemplateid: labeltemplateid,

                      isactive: true,
                      issupplier: false,
                      isclient: true,

                      acn: acn,
                      abn: abn,
                      hscode: hscode,
                      custcode1: custcode1,
                      custcode2: custcode2
                    },
                    {type: 'refresh'}
                  );
                }
                else
                {
                  doServerDataMessage
                  (
                    'savesupplier',
                    {
                      supplierid: supplierid,
                      parentid: parentid,
                      name: name,
                      code: code,
                      email1: email1,
                      url1: url1,
                      phone1: phone1,
                      fax1: fax1,

                      contact1: contact1,
                      address1: address1,
                      address2: address2,
                      address3: address3,
                      address4: address4,
                      city: city,
                      state: state,
                      postcode: postcode,
                      country: country,

                      contact2: contact2,
                      shiptoaddress1: shiptoaddress1,
                      shiptoaddress2: shiptoaddress2,
                      shiptoaddress3: shiptoaddress3,
                      shiptoaddress4: shiptoaddress4,
                      shiptocity: shiptocity,
                      shiptostate: shiptostate,
                      shiptopostcode: shiptopostcode,
                      shiptocountry: shiptocountry,

                      bankname: bankname,
                      bankbsb: bankbsb,
                      bankaccountno: bankacctno,
                      bankaccountname: bankacctname,

                      dayscredit: dayscredit,
                      linelimit: linelimit,
                      orderlimit: orderlimit,
                      creditlimit: creditlimit,

                      costofgoodsaccountid: costofgoodsaccountid,
                      incomeaccountid: incomeaccountid,
                      expenseaccountid: expenseaccountid,
                      assetaccountid: assetaccountid,

                      // invoicetemplateid: invoicetemplateid,
                      // ordertemplateid: ordertemplateid,
                      // qoutetemplateid: qoutetemplateid,
                      // labeltemplateid: labeltemplateid,

                      isactive: true,
                      issupplier: false,
                      isclient: true,

                      acn: acn,
                      abn: abn,
                      hscode: hscode,
                      custcode1: custcode1,
                      custcode2: custcode2
                    },
                    {type: 'refresh'}
                  );
                }
              }
              else
                doMandatoryTextbox('Please enter a unique client code', 'fldNewClientCode');
            }
            else
              doMandatoryTextbox('Please enter an client name', 'fldNewClientName');
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
          text: 'Close',
          handler: function()
          {
            $('#dlgSupplierNew').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}
