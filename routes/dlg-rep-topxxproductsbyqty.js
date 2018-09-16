function doDlgRepTopXXProductsByQty()
{
  function doResults(ev, args)
  {
    if (args.data.rs.length > 0)
    {
      args.data.rs.forEach
      (
        function(row)
        {
          row.numsold = parseFloat(row.numsold);
          row.productname = doNiceTitleizeString(row.productname);
        }
      );

      $('#divRepTopXXProductsByQtyChart').dxPieChart
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
              valueField: 'numsold',
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
  $('#divEvents').on('report-topxxproductsbyqty', doResults);

  $('#dlgRepTopXXProductsByQty').dialog
  (
    {
      onClose: function()
      {
        $('#divEvents').off('report-topxxproductsbyqty', doResults);
      },
      onOpen: function()
      {
        $('#dtRepTopXXProductsByQtyDateFrom').datebox(dateboxParserObj);
        $('#dtRepTopXXProductsByQtyDateTo').datebox(dateboxParserObj);

        doTextboxFocus('dtRepTopXXProductsByQtyDateFrom');
      },
      buttons:
      [
        {
          text: 'Run',
          handler: function()
          {
            var datefrom = $('#dtRepTopXXProductsByQtyDateFrom').datebox('getValue');
            var dateto = $('#dtRepTopXXProductsByQtyDateTo').datebox('getValue');
            var now = moment();

            if (_.isBlank(datefrom) && _.isBlank(dateto))
            {
              doMandatoryTextbox('Please select a start and end date for the report', 'dtRepTopXXProductsByQtyDateFrom');
              return;
            }

            if (_.isBlank(dateto))
            {
              if (moment(datefrom).isAfter(now))
              {
                doMandatoryTextbox('Start date can not be after today...', 'dtRepTopXXProductsByQtyDateFrom');
                  return;
              }
              dateto = now.format('YYYY-MM-DD hh:mm:ss');
            }

            if (_.isBlank(datefrom))
            {
              if (moment(dateto).isBefore(now))
              {
                doMandatoryTextbox('End date can not be before today...', 'dtRepTopXXProductsByQtyDateTo');
                return;
              }
              datefrom = now.format('YYYY-MM-DD hh:mm:ss');
            }

            doServerDataMessage('report', {report: 'topxxproductsbyqty', datefrom: datefrom, dateto: dateto}, {type: 'refresh'});
          }
        },
        {
          text: 'Reset',
          handler: function()
          {
            $('#dtRepTopXXProductsByQtyDateFrom').datebox('clear');
            $('#dtRepTopXXProductsByQtyDateTo').datebox('clear');
          }
        },
        {
          text: 'Close',
          handler: function()
          {
            $('#dlgRepTopXXProductsByQty').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}

