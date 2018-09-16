function doDlgSuprfundNew()
{
  function doReset()
  {
    $('#fldNewSuperfundName').textbox('clear');

    $('#btnSuperfundNewAdd').linkbutton('disable');

    doTextboxFocus('fldNewSuperfundName');
  }

  function doCheckName(ev, args)
  {
    // Name already exists?
    if (args.data.rs.length > 0)
    {
      var s = args.data.rs[0];

      $('#btnSuperfundNewAdd').linkbutton('disable');
      doShowError('Name [' + s.name + '] has already been used');
    }
    else
      $('#btnSuperfundNewAdd').linkbutton('enable');
  }

  function doSaved(ev, args)
  {
    $('#dlgSuperfundNew').dialog('close');
  }

  $('#divEvents').on('checksuperfundname', doCheckName);
  $('#divEvents').on('newsuperfund', doSaved);

  $('#dlgSuperfundNew').dialog
  (
    {
      onClose: function()
      {
        $('#divEvents').off('checksuperfundname', doCheckName);
        $('#divEvents').off('newsuperfund', doSaved);
      },
      onOpen: function()
      {
        $('#fldNewSuperfundName').textbox
        (
          {
            onChange: function(newValue, oldValue)
            {
              if (!_.isBlank(newValue))
              {
                // Check we're using a unique name...
                if (newValue != oldValue)
                  doServerDataMessage('checksuperfundname', {name: newValue}, {type: 'refresh'});
              }
              else
                $('#btnSuperfundNewAdd').linkbutton('disable');
            }
          }
        );

        doReset();
      },
      buttons:
      [
        {
          text: 'Add',
          disabled: true,
          id: 'btnSuperfundNewAdd',
          handler: function()
          {
            var name = $('#fldNewSuperfundName').textbox('getValue');

            if (!_.isBlank(name))
              doServerDataMessage('newsuperfund', {session, name: name}, {type: 'refresh'});
            else
              doMandatoryTextbox('Please enter name of super fund', 'fldNewSuperfundName');
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
            $('#dlgSuperfundNew').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}

