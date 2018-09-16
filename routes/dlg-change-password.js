function doDlgChangePassword(user)
{
  function doChangePassword(ev, args)
  {
    doShowSuccess('Password changed successfully...');
    $('#dlgChangePassword').dialog('close');
  }

  // Need to destroy/re-create this event since it depends on arguments that change each call...
  $('#divEvents').on('changepassword', doChangePassword);

  $('#dlgChangePassword').dialog
  (
    {
      onClose: function()
      {
        $('#divEvents').off('changepassword', doChangePassword);
      },
      onOpen: function()
      {
        $('#fldVerifyPwd').textbox
        (
          {
            onChange: function(newValue, oldValue)
            {
              if (!_.isBlank(newValue))
              {
                if ($('#fldNewPwd').textbox('getValue') == newValue)
                  $('#btnChangePasswordChange').linkbutton('enable');
                else
                  $('#btnChangePasswordChange').linkbutton('disable');
              }
              else
                $('#btnChangePasswordChange').linkbutton('disable');
            }
          }
        );

        $('#fldNewPwd').textbox('clear');
        $('#fldVerifyPwd').textbox('clear');

        doTextboxFocus('fldNewPwd');
      },
      buttons:
      [
        {
          text: 'Change',
          disabled: true,
          id: 'btnChangePasswordChange',
          handler: function()
          {
            var p1 = $('#fldNewPwd').textbox('getValue');
            var p2 = $('#fldVerifyPwd').textbox('getValue');

            if (p1 == p2)
              doServerDataMessage('changepassword', {useruuid: user.uuid, pwd: p1}, {type: 'dodlgchangepassword'});
            else
              doMandatoryTextbox('Passwords don\'t match...', 'fldNewPwd');
          }
        },
        {
          text: 'Close',
          handler: function()
          {
            $('#dlgChangePassword').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}

