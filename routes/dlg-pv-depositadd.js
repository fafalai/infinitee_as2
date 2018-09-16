function doDlgPVDepositAdd()
{
  function doReset()
  {
    $('#cbPVDepositMember').combotree('clear');
    $('#cbPVDepositType').combobox('clear');
    $('#cbPVDepositReason').combobox('clear');
    $('#cbPVDepositClass').combobox('clear');

    $('#fldPVDepositReference').textbox('clear');
    $('#fldPVDepositAmount').numberbox('clear');

    doTextboxFocus('fldPVDepositReference');
  }

  function doSaved(ev, args)
  {
    $('#dlgPVDepositAdd').dialog('close');
  }

  // Need to destroy/re-create this event since it depends on arguments that change each call...
  // $('#divEvents').on('checklocationcode', doCheckCode);
  // $('#divEvents').on('newlocation', doSaved);
  // $('#divEvents').on('listlocations', doList);

  $('#dlgPVDepositAdd').dialog
  (
    {
      onClose: function()
      {
        // $('#divEvents').off('checklocationcode', doCheckCode);
        // $('#divEvents').off('newlocation', doSaved);
        // $('#divEvents').off('listlocations', doList);
      },
      onOpen: function()
      {
        $('#cbPVDepositMember').combotree
        (
          {
            valueField: 'id',
            textField: 'lastname',
            data: cache_employees
          }
        );

        $('#cbPVDepositType').combobox
        (
          {
            valueField: 'id',
            textField: 'name',
            data: paymenttypes
          }
        );

        $('#cbPVDepositReason').combobox
        (
          {
            valueField: 'id',
            textField: 'name',
            data: paymentreasons
          }
        );

        $('#cbPVDepositClass').combobox
        (
          {
            valueField: 'id',
            textField: 'name',
            data: classtypes
          }
        );

        $('#dtPVDepositDate').datebox(dateboxParserObj);

        doReset();
      },
      buttons:
      [
        {
          text: 'Add',
          handler: function()
          {
            var memberid = doGetComboTreeSelectedId('cbPVDepositMember');
            var refno = $('#fldPVDepositReference').textbox('getValue');
            var type = $('#cbPVDepositType').combobox('getValue');
            var reason = $('#cbPVDepositReason').combobox('getValue');
            var classtype = $('#cbPVDepositClass').combobox('getValue');
            var datepaid = $('#dtPVDepositDate').datebox('getValue');
            var amount = $('#fldPVDepositAmount').numberbox('getValue');

            $('#divEvents').trigger
            (
              'pvdepositadded',
              {
                memberid: memberid,
                refno: refno,
                type: type,
                reason: reason,
                classtype: classtype,
                amount: amount,
                date: datepaid,
                pdata: ''
              }
            );

            $('#dlgPVDepositAdd').dialog('close');
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
            $('#dlgPVDepositAdd').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}
