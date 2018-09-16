function doDlgAccountNew(parentid, accountid)
{
  var isnew = _.isUndefined(accountid) || _.isNull(accountid);
  var account = {};

  function doReset()
  {
    $('#cbNewAccountParent').combotree('setValue', parentid);

    if (isnew)
    {
      $('#cbNewAccountType').combobox('clear');
      $('#fldNewAccountName').textbox('clear');
      $('#fldNewAccountCode').textbox('clear');

      $('#btnAccountNewAdd').linkbutton('disable');
    }
    else
    {
      if (!_.isEmpty(account))
      {
        $('#cbNewAccountType').combobox('setValue', account.itype);
        $('#fldNewAccountName').textbox('setValue', account.name);
        $('#fldNewAccountCode').textbox('setValue', account.code);

        $('#btnAccountNewAdd').linkbutton('enable');

        $('#dlgAccountNew').dialog('setTitle', 'Modify ' + account.name);
      }
    }

    doTextboxFocus('fldNewAccountName');
  }

  function doSaved(ev, args)
  {
    $('#dlgAccountNew').dialog('close');
  }

  function doList(ev, args)
  {
    $('#cbNewAccountParent').combotree('loadData', cache_accounts);
  }

  function doCheckCode(ev, args)
  {
    // Code already exists?
    if (args.data.rs.length > 0)
      $('#btnAccountNewAdd').linkbutton('disable');
    else
      $('#btnAccountNewAdd').linkbutton('enable');
  }

  function doLoad(ev, args)
  {
    account = (args.data.account);
    doReset();
  }

  $('#divEvents').on('newaccount', doSaved);
  $('#divEvents').on('saveaccount', doSaved);
  $('#divEvents').on('checkaccountcode', doCheckCode);
  $('#divEvents').on('listaccounts', doList);
  $('#divEvents').on('loadaccount', doLoad);

  $('#dlgAccountNew').dialog
  (
    {
      onClose: function()
      {
        $('#divEvents').off('newaccount', doSaved);
        $('#divEvents').off('saveaccount', doSaved);
        $('#divEvents').off('checkaccountcode', doCheckCode);
        $('#divEvents').off('listaccounts', doList);
        $('#divEvents').off('loadaccount', doLoad);
      },
      onOpen: function()
      {
        $('#cbNewAccountParent').combotree
        (
          {
            valueField: 'id',
            textField: 'name',
            data: cache_accounts
          }
        );

        $('#cbNewAccountType').combobox
        (
          {
            valueField: 'id',
            textField: 'name',
            data: accounttypes
          }
        );

        $('#fldNewAccountCode').textbox
        (
          {
            onChange: function(newValue, oldValue)
            {
              if (!_.isBlank(newValue))
              {
                // Check we're using a unique code...
                if (newValue != oldValue)
                  doServerDataMessage('checkaccountcode', {accountid: accountid, code: newValue}, {type: 'refresh'});
              }
              else
                $('#btnAccountNewAdd').linkbutton('disable');
            }
          }
        );

        if (isnew)
          $('#btnAccountNewAdd').linkbutton({text: 'Add'});
        else
          $('#btnAccountNewAdd').linkbutton({text: 'Save'});

        if (!_.isNull(accountid))
          doServerDataMessage('loadaccount', {accountid: accountid}, {type: 'refresh'});
        else
          doReset();
      },
      buttons:
      [
        {
          text: 'Add',
          disabled: true,
          id: 'btnAccountNewAdd',
          handler: function()
          {
            var parentid = doGetComboTreeSelectedId('cbNewAccountParent');
            var name = $('#fldNewAccountName').textbox('getValue');
            var code = $('#fldNewAccountCode').textbox('getValue');
            var type = $('#cbNewAccountType').combobox('getValue');

            if (!_.isBlank(name))
            {
              if (!_.isBlank(code))
              {
                if (!_.isBlank(type))
                {
                  if (isnew)
                    doServerDataMessage('newaccount', {parentid: parentid, name: name, code: code, accounttype: type}, {type: 'refresh'});
                  else
                    doServerDataMessage('saveaccount', {accountid: account.id, parentid: parentid, name: name, code: code, accounttype: type, altcode: account.altcode, altname: account.altname}, {type: 'refresh'});
                }
                else
                  doMandatoryTextbox('Please select an acocunt type', 'cbNewAccountType');
              }
              else
                doMandatoryTextbox('Please enter a unique account code', 'fldNewAccountCode');
            }
            else
              doMandatoryTextbox('Please enter an account name', 'fldNewAccountName');
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
            $('#dlgAccountNew').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}
