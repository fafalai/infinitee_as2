function doDlgRepProductsOrdered()
{
  var states = [];

  function doResults(ev, args)
  {
    var total = _.toBigNum(0.0);

    $('#divRepProductsOrderedG').datagrid('loadData', args.data.rs);

    args.data.rs.forEach
    (
      function(r)
      {
        total += _.toBigNum(r.qty);
      }
    );

    $('#divRepProductsOrderedG').datagrid
    (
      'reloadFooter',
      [
        {
          qty: '<span class="totals_footer">' + _.niceformatnumber(total, 2) + '</span>'
        }
      ]
    );
  }

  function doRun()
  {
    var datefrom = $('#dtRepProductsOrderedDateFrom').datebox('getValue');
    var dateto = $('#dtRepProductsOrderedDateTo').datebox('getValue');
    var clients = $('#cbRepProductsOrderedClients').combotree('getValues');
    var categories = $('#cbRepProductsOrderedCategories').combotree('getValues');
    var country = $('#cbRepProductsOrderedCountry').combobox('getValue');
    var state = $('#cbRepProductsOrderedStates').combobox('getValue');
    var now = moment();

    if (_.isBlank(datefrom) && _.isBlank(dateto))
    {
      doMandatoryTextbox('Please select a start and end date for the report', 'dtRepProductsOrderedDateFrom');
      return;
    }

    if (_.isBlank(dateto))
    {
      if (moment(datefrom).isAfter(now))
      {
        doMandatoryTextbox('Start date can not be after today...', 'dtRepProductsOrderedDateFrom');
        return;
      }
      dateto = now.format('YYYY-MM-DD hh:mm:ss');
    }

    if (_.isBlank(datefrom))
    {
      if (moment(dateto).isBefore(now))
      {
        doMandatoryTextbox('End date can not be before today...', 'dtRepProductsOrderedDateTo');
        return;
      }
      datefrom = now.format('YYYY-MM-DD hh:mm:ss');
    }

    doServerDataMessage('report', {report: 'productsordered', datefrom: datefrom, dateto: dateto, clients: clients, categories: categories, country: country, state: state}, {type: 'refresh'});
  }

  // Need to destroy/re-create this event since it depends on arguments that change each call...
  $('#divEvents').on('report-productsordered', doResults);
  $('#divEvents').on('ordercreated', doRun);
  $('#divEvents').on('ordersaved', doRun);
  $('#divEvents').on('orderexpired', doRun);
  $('#divEvents').on('orderduplicated', doRun);
  $('#divEvents').on('ordernewversion', doRun);

  $('#dlgRepProductsOrdered').dialog
  (
    {
      onClose: function()
      {
        $('#divEvents').off('report-productsordered', doResults);
        $('#divEvents').off('ordercreated', doRun);
        $('#divEvents').off('ordersaved', doRun);
        $('#divEvents').off('orderexpired', doRun);
        $('#divEvents').off('orderduplicated', doRun);
        $('#divEvents').off('ordernewversion', doRun);
      },
      onOpen: function()
      {
        $('#dtRepProductsOrderedDateFrom').datebox(dateboxParserObj);
        $('#dtRepProductsOrderedDateTo').datebox(dateboxParserObj);

        $('#cbRepProductsOrderedClients').combotree
        (
          {
            valueField: 'id',
            textField: 'name',
            multiple: true,
            data: cache_clients,
            limitToList: true,
            onSelect: function(record)
            {
            }
          }
        );

        $('#cbRepProductsOrderedCategories').combotree
        (
          {
            valueField: 'id',
            textField: 'name',
            multiple: true,
            data: cache_productcategories,
            limitToList: true,
            onSelect: function(record)
            {
            }
          }
        );

        $('#cbRepProductsOrderedCountry').combobox
        (
          {
            valueField: 'country',
            textField: 'country',
            data: cache_countries,
            onSelect: function(record)
            {
              states = doGetStatesFromCountry(record.country);

              $('#cbRepProductsOrderedStates').combobox('loadData', states);
            }
          }
        );

        $('#cbRepProductsOrderedStates').combobox
        (
          {
            valueField: 'state',
            textField: 'state',
            data: states
          }
        );

        $('#divRepProductsOrderedG').datagrid
        (
          {
            fitColumns: false,
            singleSelect: true,
            rownumbers: true,
            striped: true,
            showFooter: true,
            sortName: 'clientname',
            sortOrder: 'asc',
            remoteSort: false,
            multiSort: true,
            columns:
            [
              [
                {title: 'Client',   field: 'clientname',          width: 250, align: 'left',  resizable: true, sortable: true},
                {title: 'Category', field: 'productcategoryname', width: 250, align: 'left',  resizable: true, sortable: true},
                {title: 'Code',     field: 'productcode',         width: 250, align: 'left',  resizable: true, sortable: true, styler: function(value, row, index) {if (!row.used) return 'color: ' + colour_deeppink;}},
                {title: 'Qty',      field: 'qty',                 width: 100, align: 'right', resizable: true, sortable: true, formatter: function(value, row) {if (!_.isUndefined(row.productcode)) return _.niceformatnumber(value, 2); return value;}}
              ]
            ]
          }
        );

        doTextboxFocus('dtRepTopXXProductsByValueDateFrom');
      },
      buttons:
      [
        {
          text: 'Run',
          handler: function()
          {
            doRun();
          }
        },
        {
          text: 'Reset',
          handler: function()
          {
            $('#dtRepProductsOrderedDateFrom').datebox('clear');
            $('#dtRepProductsOrderedDateTo').datebox('clear');

            $('#cbRepProductsOrderedClients').combotree('clear');
            $('#cbRepProductsOrderedCategories').combotree('clear');
            $('#cbRepProductsOrderedCountry').combobox('clear');
            $('#cbRepProductsOrderedStates').combobox('clear');
          }
        },
        {
          text: 'Close',
          handler: function()
          {
            $('#dlgRepProductsOrdered').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}

