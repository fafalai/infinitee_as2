var maintenanceTabWidgetsLoaded = false;

function doMaintenanceTabWidgets()
{
  if (maintenanceTabWidgetsLoaded)
    return;

  var tb =
  [
    {
      text: 'Save',
      iconCls: 'icon-save',
      handler: doSave
    },
    {
      text: 'Email Invoice Template',
      iconCls: 'icon-email',
      handler: doEmailInvoiceTemplate
    },
    {
      text: 'Email Order Template',
      iconCls: 'icon-email',
      handler: doEmailOrderTemplate
    },
    {
      text: 'Email Quote Template',
      iconCls: 'icon-email',
      handler: doEmailQuoteTemplate
    }
  ];
  var states = [];
  var data = [];

  function doFindRowByName(n)
  {
    for (var r = 0; r < data.length; r++)
    {
      if (data[r].name == n)
        return r;
    }

    return null;
  }

  function doCountrySelected(record)
  {
    var index = doFindRowByName('State');

    if (!_.isNull(index))
    {
      doGridGetEditor
      (
        'divSettingsPG',
        index,
        'value',
        function(ed)
        {
          // Fetch matching states for this country...
          states = doGetStatesFromCountry(record.country);
          console.log(states);

          if (!_.isNull(ed))
            $(ed.target).combobox('loadData', states);
        }
      );
    }
  }

  function doSave()
  {
    primus.emit
    (
      'saveconfig',
      {
        fguid: fguid,
        uuid: uuid,
        session: session,

        orderasquote: cache_config.orderasquote,
        statusid: cache_config.statusid,
        inventoryadjustaccountid: cache_config.inventoryadjustaccountid,
        currentorderno: cache_config.currentorderno,
        currentporderno: cache_config.currentporderno,
        currentinvoiceno: cache_config.currentinvoiceno,
        currentjournalno: cache_config.currentjournalno,
        currentclientno: cache_config.currentclientno,
        currentsupplierno: cache_config.currentsupplierno,
        currentempno: cache_config.currentempno,
        currentjobsheetno: cache_config.currentjobsheetno,
        currentbarcodeno: cache_config.currentbarcodeno,
        inventoryusefifo: cache_config.inventoryusefifo,
        expressfee: cache_config.expressfee,
        defaultinventorylocationid: cache_config.defaultinventorylocationid,
        gstpaidaccountid: cache_config.gstpaidaccountid,
        gstcollectedaccountid: cache_config.gstcollectedaccountid,
        invoiceprinttemplateid: cache_config.invoiceprinttemplateid,
        orderprinttemplateid: cache_config.orderprinttemplateid,
        quoteprinttemplateid: cache_config.quoteprinttemplateid,
        deliverydocketprinttemplateid: cache_config.deliverydocketprinttemplateid,
        araccountid: cache_config.araccountid,
        apaccountid: cache_config.apaccountid,
        productcostofgoodsaccountid: cache_config.productcostofgoodsaccountid,
        productincomeaccountid: cache_config.productincomeaccountid,
        productassetaccountid: cache_config.productassetaccountid,
        productbuytaxcodeid: cache_config.productbuytaxcodeid,
        productselltaxcodeid: cache_config.productselltaxcodeid,
        fyearstart: cache_config.fyearstart,
        fyearend: cache_config.fyearend,
        companyname: cache_config.companyname,
        address1: cache_config.address1,
        address2: cache_config.address2,
        address3: cache_config.address3,
        address4: cache_config.address4,
        city: cache_config.city,
        state: cache_config.state,
        postcode: cache_config.postcode,
        country: cache_config.country,
        bankname: cache_config.bankname,
        bankbsb: cache_config.bankbsb,
        bankaccountno: cache_config.bankaccountno,
        bankaccountname: cache_config.bankaccountname,
        autosyncbuildtemplates: false,
        posclientid: cache_config.posclientid,

        pdata: {type: 'refresh'}
      }
    );
  }

  function doEmailInvoiceTemplate()
  {
    doDlgEmailTemplate(itype_order_invoice);
  }

  function doEmailOrderTemplate()
  {
    doDlgEmailTemplate(itype_order_order);
  }

  function doEmailQuoteTemplate()
  {
    doDlgEmailTemplate(itype_order_quote);
  }

  function doCheckFYearStart(date)
  {
    var s = new moment(date).add({years: 1});
    var e = s.format('YYYY-MM-DD');
    var index = doFindRowByName('Financial Year End');

    if (!_.isNull(index))
      $('#divSettingsPG').propertygrid('updateRow', {index: index, row: {value: e}});
  }

  // Refresh when these events occur...
  $('#divEvents').on
  (
    'loadconfig',
    function(ev, args)
    {
      data =
      [
        {name: 'Order Numbers',              value: cache_config.currentorderno,                group: 'Numbering',      editor: 'text'},
        {name: 'P.O. Numbers',               value: cache_config.currentporderno,               group: 'Numbering',      editor: 'text'},
        {name: 'Invoice Numbers',            value: cache_config.currentinvoiceno,              group: 'Numbering',      editor: 'text'},
        {name: 'Client Numbers',             value: cache_config.currentclientno,               group: 'Numbering',      editor: 'text'},
        {name: 'Supplier Numbers',           value: cache_config.currentsupplierno,             group: 'Numbering',      editor: 'text'},
        {name: 'Employee Numbers',           value: cache_config.currentempno,                  group: 'Numbering',      editor: 'text'},
        {name: 'Job Sheet Numbers',          value: cache_config.currentjobsheetno,             group: 'Numbering',      editor: 'text'},
        {name: 'Barcode Numbers',            value: cache_config.currentbarcodeno,              group: 'Numbering',      editor: 'text'},
    
        {name: 'New Orders are Quotes',      value: cache_config.orderasquote,                  group: 'Orders',         editor: {type: 'checkbox',  options: {on: true, off: false}}},
        {name: 'A/R Account',                value: cache_config.araccountid,                   group: 'Orders',         editor: {type: 'combotree', options: {valueField: 'id', textField: 'name', data: cache_accounts}}},
        {name: 'A/P Account',                value: cache_config.apaccountid,                   group: 'Orders',         editor: {type: 'combotree', options: {valueField: 'id', textField: 'name', data: cache_accounts}}},
        {name: 'Express Fee (%)',            value: cache_config.expressfee,                    group: 'Orders',         editor: {type: 'numberbox', options: {groupSeparator: ',', precision: 2}}, formatter: function(value, row, index) {if (!_.isUndefined(row.id)) return _.niceformatqty(value, 2); return value;}},
    
        {name: 'Inventory Adjustment',       value: cache_config.inventoryadjustaccountid,      group: 'Inventory',      editor: {type: 'combotree', options: {valueField: 'id', textField: 'name', data: cache_accounts}}},
        {name: 'Deduct Stock On Order',      value: cache_config.statusid,                      group: 'Inventory',      editor: {type: 'combobox',  options: {valueField: 'id', textField: 'name', data: orderstatustypes}}},
        {name: 'Use FIFO',                   value: cache_config.inventoryusefifo,              group: 'Inventory',      editor: {type: 'checkbox',  options: {on: true, off: false}}},
        {name: 'Default Inventory Location', value: cache_config.defaultinventorylocationid,    group: 'Inventory',      editor: {type: 'combobox',  options: {valueField: 'id', textField: 'name', data: cache_locations}}},
    
        {name: 'Cost of Goods Account',      value: cache_config.productcostofgoodsaccountid,   group: 'Products',       editor: {type: 'combotree', options: {valueField: 'id', textField: 'name', data: cache_accounts}}},
        {name: 'Income Account',             value: cache_config.productincomeaccountid,        group: 'Products',       editor: {type: 'combotree', options: {valueField: 'id', textField: 'name', data: cache_accounts}}},
        {name: 'Asset Account',              value: cache_config.productassetaccountid,         group: 'Products',       editor: {type: 'combotree', options: {valueField: 'id', textField: 'name', data: cache_accounts}}},
        {name: 'Buy Tax Code',               value: cache_config.productbuytaxcodeid,           group: 'Products',       editor: {type: 'combobox',  options: {valueField: 'id', textField: 'name', data: cache_taxcodes}}},
        {name: 'Sell Tax Code',              value: cache_config.productselltaxcodeid,          group: 'Products',       editor: {type: 'combobox',  options: {valueField: 'id', textField: 'name', data: cache_taxcodes}}},
    
        {name: 'Paid',                       value: cache_config.gstpaidaccountid,              group: 'GST',            editor: {type: 'combotree', options: {valueField: 'id', textField: 'name', data: cache_accounts}}},
        {name: 'Collected',                  value: cache_config.gstcollectedaccountid,         group: 'GST',            editor: {type: 'combotree', options: {valueField: 'id', textField: 'name', data: cache_accounts}}},
    
        {name: 'Invoices',                   value: cache_config.invoiceprinttemplateid,        group: 'Print Template', editor: {type: 'combobox',  options: {valueField: 'id', textField: 'description', data: cache_printtemplates}}},
        {name: 'Orders',                     value: cache_config.orderprinttemplateid,          group: 'Print Template', editor: {type: 'combobox',  options: {valueField: 'id', textField: 'description', data: cache_printtemplates}}},
        {name: 'Quotes',                     value: cache_config.quoteprinttemplateid,          group: 'Print Template', editor: {type: 'combobox',  options: {valueField: 'id', textField: 'description', data: cache_printtemplates}}},
        {name: 'Delivery Dockets',           value: cache_config.deliverydocketprinttemplateid, group: 'Print Template', editor: {type: 'combobox',  options: {valueField: 'id', textField: 'description', data: cache_printtemplates}}},
    
        {name: 'Name',                       value: cache_config.companyname,                   group: 'Company',        editor: 'text'},
        {name: 'Address1',                   value: cache_config.address1,                      group: 'Company',        editor: 'text'},
        {name: 'Address2',                   value: cache_config.address2,                      group: 'Company',        editor: 'text'},
        {name: 'Address3',                   value: cache_config.address3,                      group: 'Company',        editor: 'text'},
        {name: 'Address4',                   value: cache_config.address4,                      group: 'Company',        editor: 'text'},
        {name: 'City',                       value: cache_config.city,                          group: 'Company',        editor: 'text'},
        {name: 'State',                      value: cache_config.state,                         group: 'Company',        editor: {type: 'combobox',  options: {valueField: 'state', textField: 'state', data: states}}},
        {name: 'Postcode',                   value: cache_config.postcode,                      group: 'Company',        editor: 'text'},
        {name: 'Country',                    value: cache_config.country,                       group: 'Company',        editor: {type: 'combobox',  options: {valueField: 'country', textField: 'country', data: cache_countries, onSelect: function(record) {doCountrySelected(record);}}}},
        {name: 'Financial Year Start',       value: cache_config.fyearstart,                    group: 'Company',        editor: {type: 'datebox',   options: {formatter: function(dt) {return _.nicedatetodisplay(dt);}, parser: function(d) {if (_.isUndefined(d) || _.isBlank(d)) return new Date(); return moment(d).toDate();}, onSelect: function(date) {doCheckFYearStart(date);}}}},
        {name: 'Financial Year End',         value: cache_config.fyearend,                      group: 'Company',        editor: {type: 'datebox',   options: {formatter: function(dt) {return _.nicedatetodisplay(dt);}, parser: function(d) {if (_.isUndefined(d) || _.isBlank(d)) return new Date(); return moment(d).toDate();}}}},
    
        {name: 'Bank Name',                  value: cache_config.bankname,                      group: 'Banking',        editor: 'text'},
        {name: 'Bank BSB',                   value: cache_config.bankbsb,                       group: 'Banking',        editor: 'text'},
        {name: 'Bank Account No.',           value: cache_config.bankaccountno,                 group: 'Banking',        editor: 'text'},
        {name: 'Bank Account Name',          value: cache_config.bankaccountname,               group: 'Banking',        editor: 'text'},

        {name: 'POS Client',                 value: cache_config.posclientid,                   group: 'POS',            editor: {type: 'combotree', options: {valueField: 'id', textField: 'name', data: cache_clients}}}
      ];

      $('#divSettingsPG').propertygrid('reload');
    }
  );

  $('#divEvents').on
  (
    'saveconfig',
    function(ev, args)
    {
      primus.emit('loadconfig', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
    }
  );

  $('#divEvents').on
  (
    'configsaved',
    function(ev, args)
    {
      primus.emit('loadconfig', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
    }
  );

  maintenanceTabWidgetsLoaded = true;

  $('#divSettingsPG').propertygrid
  (
    {
      showGroup: true,
      scrollbarSize: 0,
      toolbar: tb,
      columns:
      [
        [
          {field: 'name',  title: 'Name', width: 300,  resizable: true},
          {
            field: 'value',
            title: 'Value',
            width: 300,
            resizable: true,
            formatter: function(value, row)
            {
              switch (row.name)
              {
                case 'Inventory Adjustment':
                case 'A/R Account':
                case 'A/P Account':
                case 'Cost of Goods Account':
                case 'Income Account':
                case 'Asset Account':
                case 'Paid':
                case 'Collected':
                {
                  return doGetNameFromTreeArray(cache_accounts, value);
                }
                case 'Buy Tax Code':
                case 'Sell Tax Code':
                {
                  return doGetNameFromTreeArray(cache_taxcodes, value);
                }
                case 'Deduct Stock On Order':
                {
                  return doGetStringFromIdInObjArray(orderstatustypes, value);
                }
                case 'Default Inventory Location':
                {
                  return doGetStringFromIdInObjArray(cache_locations, value);
                }
                case 'Invoices':
                case 'Orders':
                case 'Quotes':
                case 'Delivery Dockets':
                {
                  return doGetDescFromIdInObjArray(cache_printtemplates, value);
                }
                case 'POS Client':
                {
                  return doGetNameFromTreeArray(cache_clients, value);
                }
                default:
                {
                  return value;
                }
              }
            }
          }
        ]
      ],
      loader: function(param, success, error)
      {
        success({total: 1, rows: data});
      },
      onAfterEdit: function(index, row, changes)
      {
        if (!_.isEmpty(changes))
        {
          // These should be same order as data[] array...
          switch (index)
          {
            case 0:
              cache_config.currentorderno = changes.value;
              break;
            case 1:
              cache_config.currentporderno = changes.value;
              break;
            case 2:
              cache_config.currentinvoiceno = changes.value;
              break;
            case 3:
              cache_config.currentclientno = changes.value;
              break;
            case 4:
              cache_config.currentsupplierno = changes.value;
              break;
            case 5:
              cache_config.currentempno = changes.value;
              break;
            case 6:
              cache_config.currentjobsheetno = changes.value;
              break;
            case 7:
              cache_config.currentbarcodeno = changes.value;
              break;

            case 8:
              cache_config.orderasquote = changes.value;
              break;
            case 9:
              cache_config.araccountid = changes.value;
              break;
            case 10:
              cache_config.apaccountid = changes.value;
              break;
            case 11:
              cache_config.expressfee = changes.value;
              break;

            case 12:
              cache_config.inventoryadjustaccountid = changes.value;
              break;
            case 13:
              cache_config.statusid = changes.value;
              break;
            case 14:
              cache_config.inventoryusefifo = changes.value;
              break;
            case 15:
              cache_config.defaultinventorylocationid = changes.value;
              break;

            case 16:
              cache_config.productcostofgoodsaccountid = changes.value;
              break;
            case 17:
              cache_config.productincomeaccountid = changes.value;
              break;
            case 18:
              cache_config.productassetaccountid = changes.value;
              break;
            case 19:
              cache_config.productbuytaxcodeid = changes.value;
              break;
            case 20:
              cache_config.productselltaxcodeid = changes.value;
              break;

            case 21:
              cache_config.gstpaidaccountid = changes.value;
              break;
            case 22:
              cache_config.gstcollectedaccountid = changes.value;
              break;

            case 23:
              cache_config.invoiceprinttemplateid = changes.value;
              break;
            case 24:
              cache_config.orderprinttemplateid = changes.value;
              break;
            case 25:
              cache_config.quoteprinttemplateid = changes.value;
              break;
            case 26:
              cache_config.deliverydocketprinttemplateid = changes.value;
              break;

            case 27:
              cache_config.companyname = changes.value;
              break;
            case 28:
              cache_config.address1 = changes.value;
              break;
            case 29:
              cache_config.address2 = changes.value;
              break;
            case 30:
              cache_config.address3 = changes.value;
              break;
            case 31:
              cache_config.address4 = changes.value;
              break;
            case 32:
              cache_config.city = changes.value;
              break;
            case 33:
              cache_config.state = changes.value;
              break;
            case 34:
              cache_config.postcode = changes.value;
              break;
            case 35:
              cache_config.country = changes.value;
              break;
            case 36:
              cache_config.fyearstart = changes.value;
              break;
            case 37:
              cache_config.fyearend = changes.value;
              break;

            case 38:
              cache_config.bankname = changes.value;
              break;
            case 39:
              cache_config.bankbsb = changes.value;
              break;
            case 40:
              cache_config.bankaccountno = changes.value;
              break;
            case 41:
              cache_config.bankaccountname = changes.value;
              break;

            case 42:
              cache_config.posclientid = changes.value;
              break;
            }
        }
      }
    }
  );
}
