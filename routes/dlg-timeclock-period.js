function doDlgTimeclocPeriod()
{
  function doReset()
  {
    $('#dtTimeclockDateFrom').datebox('clear');
    $('#dtTimeclockDateTo').datebox('clear');
  }

  $('#dlgTimeclocPeriod').dialog
  (
    {
      onClose: function()
      {
      },
      onOpen: function()
      {
        $('#dtTimeclockDateFrom').datebox
        (
          {
            showSeconds: false,
            formatter: function(date) {return moment(date).format('YYYY-MM-DD');},
            parser: function(d) {if (_.isUndefined(d) || _.isBlank(d)) return new Date(); return moment(d).toDate();}
          }
        );

        $('#dtTimeclockDateTo').datebox
        (
          {
            showSeconds: false,
            formatter: function(date) {return moment(date).format('YYYY-MM-DD');},
            parser: function(d) {if (_.isUndefined(d) || _.isBlank(d)) return new Date(); return moment(d).toDate();}
          }
        );

        doReset();
      },
      buttons:
      [
        {
          text: 'Submit',
          handler: function()
          {
            var datefrom = $('#dtTimeclockDateFrom').datebox('getValue');
            var dateto = $('#dtTimeclockDateTo').datebox('getValue');

            if (!_.isBlank(datefrom))
            {
              if (!_.isBlank(dateto))
              {
                if (moment(dateto).isSameOrAfter(datefrom))
                  window.open('/gettapperiod?startdate=' + datefrom + '&enddate=' + dateto, '_blank');
                else
                  doMandatoryTextbox('Start date can not be after the end date', 'dtTimeclockDateFrom');
              }
              else
                doMandatoryTextbox('Please enter period end date', 'dtTimeclockDateTo');
            }
            else
              doMandatoryTextbox('Please enter period start date', 'dtTimeclockDateFrom');
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
            $('#dlgTimeclocPeriod').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}

