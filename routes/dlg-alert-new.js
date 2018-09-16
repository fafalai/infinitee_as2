function doDlgAlertNew(orderstatusalertid)
{
  var isnew = _.isUndefined(orderstatusalertid) || _.isNull(orderstatusalertid);
  var statusalert = {};

  function doReset()
  {
    if (isnew)
    {
      $('#cbNewAlertUser').combobox('clear');
      $('#cbNewAlertStatus').combobox('clear');
      $('#fldNewAlertEmail').textbox('clear');
      $('#fldNewAlertMobile').textbox('clear');

      $('#btnAlertNewAdd').linkbutton('disable');
    }
    else
    {
      if (!_.isEmpty(statusalert))
      {
        $('#cbNewAlertUser').combobox('setValue', statusalert.uuid);
        $('#cbNewAlertStatus').combobox('setValue', statusalert.status);
        $('#fldNewAlertEmail').textbox('setValue', statusalert.email);
        $('#fldNewAlertMobile').textbox('setValue', statusalert.mobile);

        $('#btnAlertNewAdd').linkbutton('enable');
        $('#dlgAlertNew').dialog('setTitle', 'Modify ' + statusalert.statusname);
      }
    }

    doTextboxFocus('cbNewAlertUser');
  }

  function doSaved(ev, args)
  {
    $('#dlgAlertNew').dialog('close');
  }

  function doLoad(ev, args)
  {
    statusalert = (args.data.statusalert);
    doReset();
  }

  $('#divEvents').on('newstatusalert', doSaved);
  $('#divEvents').on('savestatusalert', doSaved);
  $('#divEvents').on('loadstatusalert', doLoad);

  $('#dlgAlertNew').dialog
  (
    {
      onClose: function()
      {
        $('#divEvents').off('newstatusalert', doSaved);
        $('#divEvents').off('savestatusalert', doSaved);
        $('#divEvents').off('loadstatusalert', doLoad);
      },
      onOpen: function()
      {
        $('#cbNewAlertUser').combobox
        (
          {
            valueField: 'uuid',
            textField: 'name',
            data: cache_users,
            onSelect: function(record)
            {
              if (!_.isBlank(record.uuid))
                $('#btnAlertNewAdd').linkbutton('enable');
              else
                $('#btnAlertNewAdd').linkbutton('disable');
            }
          }
        );

        $('#cbNewAlertStatus').combobox
        (
          {
            valueField: 'id',
            textField: 'name',
            data: orderstatustypes
          }
        );

        if (isnew)
          $('#btnAlertNewAdd').linkbutton({text: 'Add'});
        else
          $('#btnAlertNewAdd').linkbutton({text: 'Save'});

        if (!_.isUndefined(orderstatusalertid) && !_.isNull(orderstatusalertid))
          doServerDataMessage('loadstatusalert', {orderstatusalertid: orderstatusalertid}, {type: 'refresh'});
        else
          doReset();
      },
      buttons:
      [
        {
          text: 'Add',
          disabled: true,
          id: 'btnAlertNewAdd',
          handler: function()
          {
            var useruuid = $('#cbNewAlertUser').combobox('getValue');
            var statusalertid = $('#cbNewAlertStatus').combobox('getValue');
            var email = $('#fldNewAlertEmail').textbox('getValue');
            var mobile = $('#fldNewAlertMobile').textbox('getValue');

            if (!_.isBlank(useruuid))
            {
              if (_.isBlank(statusalertid))
                statusalertid = 0;

              if (isnew)
                doServerDataMessage('newstatusalert', {useruuid: useruuid, statusalertid: statusalertid, email: email, mobile: mobile}, {type: 'refresh'});
              else
                doServerDataMessage('savestatusalert', {orderstatusalertid: orderstatusalertid, useruuid: useruuid, statusalertid: statusalertid, email: email, mobile: mobile}, {type: 'refresh'});
            }
            else
              doMandatoryTextbox('Please select user to send alert to', 'cbNewAlertUser');
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
            $('#dlgAlertNew').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}

