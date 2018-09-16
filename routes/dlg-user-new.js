function doDlgUserNew(useruuid)
{
  var isnew = _.isUndefined(useruuid) || _.isNull(useruuid);
  var user = {};

  function doReset()
  {
    if (isnew)
    {
      $('#cbNewUserClient').combotree('clear');
      $('#cbNewUserAvatar').combobox('clear');

      $('#fldNewUserName').textbox('clear');
      $('#fldNewUserUid').textbox('clear');
      $('#fldNewUserPwd1').textbox('clear');
      $('#fldNewUserPwd2').textbox('clear');
      $('#fldNewUserEmail').textbox('clear');
      $('#fldNewUserMobile').textbox('clear');

      $('#cbNewUserIsAdmin').switchbutton('uncheck');

      $('#fldNewUserPwd1').textbox('enable');
      $('#fldNewUserPwd2').textbox('enable');

      $('#btnUserNewAdd').linkbutton('disable');
    }
    else
    {
      if (!_.isEmpty(user))
      {
        $('#cbNewUserClient').combotree('setValue', user.clientid);
        $('#cbNewUserAvatar').combobox('setValue', user.avatar);

        $('#fldNewUserName').textbox('setValue', user.name);
        $('#fldNewUserUid').textbox('setValue', user.uid);
        $('#fldNewUserEmail').textbox('setValue', user.email);
        $('#fldNewUserMobile').textbox('setValue', user.phone);

        $('#cbNewUserIsAdmin').switchbutton(user.isadmin ? 'check' : 'uncheck');

        $('#fldNewUserPwd1').textbox('clear');
        $('#fldNewUserPwd2').textbox('clear');
        $('#fldNewUserPwd1').textbox('disable');
        $('#fldNewUserPwd2').textbox('disable');

        $('#btnUserNewAdd').linkbutton('enable');
        $('#dlgUserNew').dialog('setTitle', 'Modify ' + user.name);
      }
    }

    doTextboxFocus('fldNewUserName');
  }

  function doVerifyPasswordsMatch()
  {
    var pwd1 = $('#fldNewUserPwd1').passwordbox('getValue');
    var pwd2 = $('#fldNewUserPwd2').passwordbox('getValue');

    if (!_.isBlank(pwd1) && (pwd1 == pwd2))
      $('#btnUserNewAdd').linkbutton('enable');
    else
      $('#btnUserNewAdd').linkbutton('disable');
  }

  function doCheckUser(ev, args)
  {
    var users = args.data.rs;

    // Login already exists?
    if (users.length > 0)
    {
      doShowError('Login name [' + users[0].uid + '] is already been used by user [' + users[0].name + ']');
      $('#btnUserNewAdd').linkbutton('disable');
    }
    else
      $('#btnUserNewAdd').linkbutton('enable');
  }

  function doSaved(ev, args)
  {
    $('#dlgUserNew').dialog('close');
  }

  function doLoad(ev, args)
  {
    user = (args.data.user);
    doReset();
  }

  function doPoll(ev, args)
  {
    if (!_.isUndefined(args.data.uuid) && (args.data.uuid == useruuid))
      doServerDataMessage('lastuserpoll', {useruuid: useruuid}, {type: 'refresh'});
  }

  function doLastPoll(ev, args)
  {
    if (!_.isUndefined(args.data) && !_.isUndefined(args.data.poll))
    {
      $('#spnPollDate').html(args.data.poll.datecreated);

      $('#spnPollBattery').html(mapBatteryToImage(args.data.poll.batterylevel));
      $('#imgBatteryLevel').reflect({height: 0.45, opacity: 0.5});

      $('#spnPollLocation').html('(' + args.data.poll.gpslat + ', (' + args.data.poll.gpslon + ')');
      $('#spnPollSystemName').html(args.data.poll.systemname);
      $('#spnPollAppVersion').html(args.data.poll.appversion);

      $('#spnPollSSID').html(args.data.poll.ssid);
      $('#spnPollAddress').html(args.data.poll.address);

      $('#spnPollReason').html(args.data.poll.reason);
    }
  }

  $('#divEvents').on('checkuseruid', doCheckUser);
  $('#divEvents').on('newuser', doSaved);
  $('#divEvents').on('saveuser', doSaved);
  $('#divEvents').on('loaduser', doLoad);
  $('#divEvents').on('lastuserpoll', doLastPoll);

  $('#divEvents').on('userpolled', doPoll);
  $('#divEvents').on('userpaused', doPoll);
  $('#divEvents').on('useronline', doPoll);
  $('#divEvents').on('useroffline', doPoll);

  $('#dlgUserNew').dialog
  (
    {
      onClose: function()
      {
        $('#divEvents').off('checkuseruid', doCheckUser);
        $('#divEvents').off('newuser', doSaved);
        $('#divEvents').off('saveuser', doSaved);
        $('#divEvents').off('loaduser', doLoad);
        $('#divEvents').off('lastuserpoll', doLastPoll);

        $('#divEvents').off('userpolled', doPoll);
        $('#divEvents').off('userpaused', doPoll);
        $('#divEvents').off('useronline', doPoll);
        $('#divEvents').off('useroffline', doPoll);

        $('#spnPollDate').html('');
        $('#spnPollBattery').html('');
        $('#spnPollLocation').html('');
        $('#spnPollSystemName').html('');
        $('#spnPollAppVersion').html('');
        $('#spnPollSSID').html('');
        $('#spnPollAddress').html('');
        $('#spnPollReason').html('');
      },
      onOpen: function()
      {
        $('#fldNewUserUid').textbox
        (
          {
            onChange: function(newValue, oldValue)
            {
              if (!_.isBlank(newValue))
              {
                // Check we're using a unique code...
                if (newValue != oldValue)
                  doServerDataMessage('checkuseruid', {useruuid: useruuid, uid: newValue}, {type: 'refresh'});
              }
              else
                $('#btnUserNewAdd').linkbutton('disable');
            }
          }
        );

        $('#fldNewUserPwd1').passwordbox
        (
          {
            onChange: function(newValue, oldValue)
            {
              doVerifyPasswordsMatch();
            }
          }
        );

        $('#fldNewUserPwd2').passwordbox
        (
          {
            onChange: function(newValue, oldValue)
            {
              doVerifyPasswordsMatch();
            }
          }
        );

        $('#cbNewUserClient').combotree
        (
          {
            valueField: 'id',
            textField: 'name',
            data: cache_clients
          }
        );

        $('#cbNewUserAvatar').combobox
        (
          {
            valueField: 'image',
            textField: 'name',
            formatter: function(row)
            {
              return mapAvatarToImage(row.image) + '&nbsp;' + row.name;
            },
            data: avatars
          }
        );

        if (isnew)
          $('#btnUserNewAdd').linkbutton({text: 'Add'});
        else
          $('#btnUserNewAdd').linkbutton({text: 'Save'});

        if (!_.isUndefined(useruuid) && !_.isNull(useruuid))
        {
          doServerDataMessage('loaduser', {useruuid: useruuid}, {type: 'refresh'});
          doServerDataMessage('lastuserpoll', {useruuid: useruuid}, {type: 'refresh'});
        }
        else
          doReset();
      },
      buttons:
      [
        {
          text: 'Add',
          disabled: true,
          id: 'btnUserNewAdd',
          handler: function()
          {
            var clientid = doGetComboTreeSelectedId('cbNewUserClient');
            var name = $('#fldNewUserName').textbox('getValue');
            var uid = $('#fldNewUserUid').textbox('getValue');
            var pwd1= $('#fldNewUserPwd1').passwordbox('getValue');
            var pwd2 = $('#fldNewUserPwd2').passwordbox('getValue');
            var email = $('#fldNewUserEmail').textbox('getValue');
            var mobile = $('#fldNewUserMobile').textbox('getValue');
            var avatar = $('#cbNewUserAvatar').combobox('getValue');
            var isadmin = doSwitchButtonChecked('cbNewUserIsAdmin') ? 1: 0;
            var isclient = _.isBlank(clientid) ? 0 : 1;

            if (!_.isBlank(name))
            {
              if (!_.isBlank(uid))
              {
                if (isnew)
                {
                  if (!_.isBlank(pwd1 == pwd2))
                    doServerDataMessage('newuser', {clientid: clientid, name: name, uid: uid, pwd: pwd1, email: email, mobile: mobile, avatar: avatar, isadmin: isadmin, isclient: isclient}, {type: 'refresh'});
                  else
                    doMandatoryTextbox('Passwords do not match', 'fldNewUserPwd1');
                }
                else
                  doServerDataMessage('saveuser', {useruuid: useruuid, clientid: clientid, name: name, uid: uid, email: email, mobile: mobile, avatar: avatar, isadmin: isadmin, isclient: isclient}, {type: 'refresh'});
              }
              else
                doMandatoryTextbox('Please enter a unique login name', 'fldNewUserUid');
            }
            else
              doMandatoryTextbox('Please enter a user name', 'fldNewUserName');
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
            $('#dlgUserNew').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}
