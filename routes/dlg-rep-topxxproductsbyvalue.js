function doDlgRepTopXXProductsByValue()
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
          row.productname = doNiceTitleizeString(row.productname);
        }
      );

      $('#divRepTopXXProductsByValueChart').dxPieChart
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
              argumentField: 'productname',
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
  $('#divEvents').on('report-topxxproductsbyvalue', doResults);

  $('#dlgRepTopXXProductsByValue').dialog
  (
    {
      onClose: function()
      {
        $('#divEvents').off('report-topxxproductsbyvalue', doResults);
      },
      onOpen: function()
      {
        $('#dtRepTopXXProductsByValueDateFrom').datebox(dateboxParserObj);
        $('#dtRepTopXXProductsByValueDateTo').datebox(dateboxParserObj);

        doTextboxFocus('dtRepTopXXProductsByValueDateFrom');
      },
      buttons:
      [
        {
          text: 'Run',
          handler: function()
          {
            var datefrom = $('#dtRepTopXXProductsByValueDateFrom').datebox('getValue');
            var dateto = $('#dtRepTopXXProductsByValueDateTo').datebox('getValue');
            var now = moment();

            if (_.isBlank(datefrom) && _.isBlank(dateto))
            {
              doMandatoryTextbox('Please select a start and end date for the report', 'dtRepTopXXProductsByValueDateFrom');
              return;
            }

            if (_.isBlank(dateto))
            {
              if (moment(datefrom).isAfter(now))
              {
                doMandatoryTextbox('Start date can not be after today...', 'dtRepTopXXProductsByValueDateFrom');
                  return;
              }
              dateto = now.format('YYYY-MM-DD hh:mm:ss');
            }

            if (_.isBlank(datefrom))
            {
              if (moment(dateto).isBefore(now))
              {
                doMandatoryTextbox('End date can not be before today...', 'dtRepTopXXProductsByValueDateTo');
                return;
              }
              datefrom = now.format('YYYY-MM-DD hh:mm:ss');
            }

            doServerDataMessage('report', {report: 'topxxproductsbyvalue', datefrom: datefrom, dateto: dateto}, {type: 'refresh'});
          }
        },
        {
          text: 'Reset',
          handler: function()
          {
            $('#dtRepTopXXProductsByValueDateFrom').datebox('clear');
            $('#dtRepTopXXProductsByValueDateTo').datebox('clear');
          }
        },
        {
          text: 'Close',
          handler: function()
          {
            $('#dlgRepTopXXProductsByValue').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}

