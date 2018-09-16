function doDlgRepPOSSalesTotals()
{
  var states = [];

  function doReset()
  {
    $('#dtRepPOSSalesTotalsDateFrom').datebox('clear');
    $('#dtRepPOSSalesTotalsDateTo').datebox('clear');

    $('#divPOSSalesTotalsG').datagrid('loadData', []);
  }

  function doResults(ev, args)
  {
    var total = _.toBigNum(0.0);

    $('#divPOSSalesTotalsG').datagrid('loadData', args.data.rs);

    args.data.rs.forEach
    (
      function(r)
      {
        total = total.plus(r.total);
      }
    );

    $('#divPOSSalesTotalsG').datagrid
    (
      'reloadFooter',
      [
        {
          total: '<span class="totals_footer">' + _.niceformatnumber(total, 2) + '</span>'
        }
      ]
    );
  }

  function doRun()
  {
    var datefrom = $('#dtRepPOSSalesTotalsDateFrom').datebox('getValue');
    var dateto = $('#dtRepPOSSalesTotalsDateTo').datebox('getValue');
    var now = moment();

    if (_.isBlank(dateto))
    {
      if (moment(datefrom).isAfter(now))
      {
        doMandatoryTextbox('Start date can not be after today...', 'dtRepPOSSalesTotalsDateFrom');
        return;
      }
      dateto = now.format('YYYY-MM-DD 23:23:59');
    }

    if (_.isBlank(datefrom))
    {
      if (moment(dateto).isBefore(now))
      {
        doMandatoryTextbox('End date can not be before today...', 'dtRepPOSSalesTotalsDateTo');
        return;
      }
      datefrom = now.format('YYYY-MM-DD 00:00:00');
    }

    doServerDataMessage('report', {report: 'pos-salestotals', datefrom: datefrom, dateto: dateto}, {type: 'refresh'});
  }

  // Need to destroy/re-create this event since it depends on arguments that change each call...
  $('#divEvents').on('report-pos-salestotals', doResults);
  $('#divEvents').on('ordercreated', doRun);
  $('#divEvents').on('ordersaved', doRun);
  $('#divEvents').on('orderexpired', doRun);
  $('#divEvents').on('orderduplicated', doRun);
  $('#divEvents').on('ordernewversion', doRun);

  $('#dlgRepPOSSalesTotals').dialog
  (
    {
      onClose: function()
      {
        $('#divEvents').off('report-pos-salestotals', doResults);
        $('#divEvents').off('ordercreated', doRun);
        $('#divEvents').off('ordersaved', doRun);
        $('#divEvents').off('orderexpired', doRun);
        $('#divEvents').off('orderduplicated', doRun);
        $('#divEvents').off('ordernewversion', doRun);

        doReset();
      },
      onOpen: function()
      {
        $('#dtRepPOSSalesTotalsDateFrom').datebox(dateboxParserObj);
        $('#dtRepPOSSalesTotalsDateTo').datebox(dateboxParserObj);

        $('#divPOSSalesTotalsG').datagrid
        (
          {
            fitColumns: false,
            singleSelect: true,
            rownumbers: true,
            striped: true,
            showFooter: true,
            columns:
            [
              [
                {title: 'Type',   field: 'paymenttype', width: 250, align: 'left',  resizable: true, formatter: function(value, row) {if (!_.isUndefined(row.paymenttype)) return mapPaymentTypeToName(value); return value;}},
                {title: 'Amount', field: 'total',       width: 100, align: 'right', resizable: true, formatter: function(value, row) {if (!_.isUndefined(row.paymenttype)) return _.niceformatnumber(value, 2); return value;}}
              ]
            ]
          }
        );

        doTextboxFocus('dtRepPOSSalesTotalsDateFrom');
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
            doReset();
          }
        },
        {
          text: 'Close',
          handler: function()
          {
            $('#dlgRepPOSSalesTotals').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}

