function doDlgRepTopXXOrders()
{
  function doResults(ev, args)
  {
    if (args.data.rs.length > 0)
    {
      args.data.rs.forEach
      (
        function(row)
        {
          row.totalprice = parseFloat(row.totalprice);
          row.clientname = doNiceTitleizeString(row.clientname);
        }
      );

      $('#divRepTopXXOrdersChart').dxPieChart
      (
        {
          dataSource: args.data.rs,
          tooltip:
          {
            enabled: true,
            percentPrecision: 2,
            customizeText: function()
            {
              return this.argumentText + ' - ' + this.percentText;
            }
          },
          legend:
          {
            horizontalAlignment: 'right',
            verticalAlignment: 'top',
            margin: 0
          },
          series:
          [
            {
              type: 'doughnut',
              argumentField: 'clientname',
              valueField: 'totalprice',
              label:
              {
                visible: true,
                connector:
                {
                  visible: true
                }
              }
            }
          ]
        }
      );
    }
  }

  // Need to destroy/re-create this event since it depends on arguments that change each call...
  $('#divEvents').on('report-topxxorders', doResults);

  $('#dlgRepTopXXOrders').dialog
  (
    {
      onClose: function()
      {
        $('#divEvents').off('report-topxxorders', doResults);
      },
      onOpen: function()
      {
        $('#dtRepTopXXOrdersDateFrom').datebox(dateboxParserObj);
        $('#dtRepTopXXOrdersDateTo').datebox(dateboxParserObj);

        doTextboxFocus('dtRepTopXXOrdersDateFrom');
      },
      buttons:
      [
        {
          text: 'Run',
          handler: function()
          {
            var datefrom = $('#dtRepTopXXOrdersDateFrom').datebox('getValue');
            var dateto = $('#dtRepTopXXOrdersDateTo').datebox('getValue');
            var now = moment();

            if (_.isBlank(datefrom) && _.isBlank(dateto))
            {
              doMandatoryTextbox('Please select a start and end date for the report', 'dtRepTopXXOrdersDateFrom');
              return;
            }

            if (_.isBlank(dateto))
            {
              if (moment(datefrom).isAfter(now))
              {
                doMandatoryTextbox('Start date can not be after today...', 'dtRepTopXXOrdersDateFrom');
                  return;
              }
              dateto = now.format('YYYY-MM-DD hh:mm:ss');
            }

            if (_.isBlank(datefrom))
            {
              if (moment(dateto).isBefore(now))
              {
                doMandatoryTextbox('End date can not be before today...', 'dtRepTopXXOrdersDateTo');
                return;
              }
              datefrom = now.format('YYYY-MM-DD hh:mm:ss');
            }

            doServerDataMessage('report', {report: 'topxxorders', datefrom: datefrom, dateto: dateto}, {type: 'refresh'});
          }
        },
        {
          text: 'Reset',
          handler: function()
          {
            $('#dtRepTopXXOrdersDateFrom').datebox('clear');
            $('#dtRepTopXXOrdersDateTo').datebox('clear');
          }
        },
        {
          text: 'Close',
          handler: function()
          {
            $('#dlgRepTopXXOrders').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}
