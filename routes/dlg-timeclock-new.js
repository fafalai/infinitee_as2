function doDlgTimeclockNew()
{
  function doReset()
  {
    $('#cbTimeclockEmployee').combotree('clear');
    $('#dtTimeclockDateEntry').datetimebox('clear');
  }

  function doSaved(ev, args)
  {
    $('#dlgTimeclockNew').dialog('close');
  }

  $('#divEvents').on('insertrtap', doSaved);

  $('#dlgTimeclockNew').dialog
  (
    {
      onClose: function()
      {
        $('#divEvents').off('insertrtap', doSaved);
      },
      onOpen: function()
      {
        $('#cbTimeclockEmployee').combotree
        (
          {
            valueField: 'id',
            textField: 'lastname',
            data: cache_employees
          }
        );

        $('#dtTimeclockDateEntry').datetimebox($.extend(dateboxParserObj, {showSeconds: false}));

        doReset();
      },
      buttons:
      [
        {
          text: 'Submit',
          handler: function()
          {
            var employeeid = doGetComboTreeSelectedId('cbTimeclockEmployee');
            var datecreated = $('#dtTimeclockDateEntry').datetimebox('getValue');

            if (!_.isBlank(employeeid))
            {
              if (!_.isBlank(employeeid))
                doServerDataMessage('insertrtap', {employeeid: employeeid, datecreated: datecreated}, {type: 'refresh'});
              else
                doMandatoryTextbox('Please enter date/time entry needs to be inserted', 'dtTimeclockDateEntry');
            }
            else
              doMandatoryTextbox('Please select which employee to insert timeclock entry for', 'cbTimeclockEmployee');
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
            $('#dlgTimeclockNew').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}

