function doDlgEmployeeNew(parentid, employeeid)
{
  var isnew = _.isUndefined(employeeid) || _.isNull(employeeid);
  var employee = {};
  var states = [];

  function doReset()
  {
    $('#cbNewEmployeeParent').combotree('setValue', parentid);

    if (isnew)
    {
      $('#cbNewEmployeeTitle').combobox('clear');

      $('#fldNewEmployeeFirstName').textbox('clear');
      $('#fldNewEmployeeLastName').textbox('clear');
      $('#fldNewEmployeeCode').textbox('clear');
      $('#fldNewEmployeeAltCode').textbox('clear');
      $('#fldNewEmployeeEmail').textbox('clear');
      $('#fldNewEmployeeMobile').textbox('clear');
      $('#cbNewEmployeeIsFemale').switchbutton('uncheck');

      $('#fldNewEmployeeAddress1').textbox('clear');
      $('#fldNewEmployeeAddress2').textbox('clear');
      $('#fldNewEmployeeCity').textbox('clear');
      $('#fldNewEmployeePostcode').textbox('clear');
      $('#cbNewEmployeeCountry').combobox('clear');
      $('#cbNewEmployeeState').combobox('clear');

      $('#fldNewEmployeeBankName').textbox('clear');
      $('#fldNewEmployeeBankBsb').textbox('clear');
      $('#fldNewEmployeeBankAcctNo').textbox('clear');
      $('#fldNewEmployeeBankAcctName').textbox('clear');
      $('#fldNewEmployeeTaxFileNo').textbox('clear');
      $('#cbNewEmployeeSuperfund').combobox('clear');
      $('#cbNewEmployeeWageAccount').combotree('clear');

      $('#fldNewEmployeeTaxTable').combobox('clear');
      $('#fldNewEmployeeAmount').numberbox('clear');
      $('#cbNewEmployeeRate').combobox('clear');
      $('#cbNewEmployeeFrequency').combobox('clear');
      $('#fldNewEmployeePeriod').numberbox('clear');

      $('#cbNewEmployeeOvertime').switchbutton('uncheck');
      $('#cbNewEmployeeType').combobox('clear');
      $('#cbNewEmployeeStatus').combobox('clear');
      $('#dtNewEmployeeDob').datebox('clear');
      $('#dtNewEmployeeStartDate').datebox('clear');
      $('#dtNewEmployeeEndDate').datebox('clear');

      $('#btnEmployeeNewAdd').linkbutton('disable');

      $('#fldNewEmployeeTaxTable').combobox('setValue', 1);
      $('#cbNewEmployeeParent').combotree('setValue', parentid);
      $('#cbNewEmployeeCountry').combobox('setValue', defaultCountry);

      $('#tsSundayStart').timespinner('clear');
      $('#tsSundayEnd').timespinner('clear');

      $('#tsMondayStart').timespinner('clear');
      $('#tsMondayEnd').timespinner('clear');

      $('#tsTuesdayStart').timespinner('clear');
      $('#tsTuesdayEnd').timespinner('clear');

      $('#tsWednesdayStart').timespinner('clear');
      $('#tsWednesdayEnd').timespinner('clear');

      $('#tsThursdayStart').timespinner('clear');
      $('#tsThursdayEnd').timespinner('clear');

      $('#tsFridayStart').timespinner('clear');
      $('#tsFridayEnd').timespinner('clear');

      $('#tsSaturdayStart').timespinner('clear');
      $('#tsSaturdayEnd').timespinner('clear');
    }
    else
    {
      if (!_.isEmpty(employee))
      {
        $('#cbNewEmployeeTitle').combobox('setValue', employee.title);

        $('#fldNewEmployeeFirstName').textbox('setValue', employee.firstname);
        $('#fldNewEmployeeLastName').textbox('setValue', employee.lastname);
        $('#fldNewEmployeeCode').textbox('setValue', employee.code);
        $('#fldNewEmployeeAltCode').textbox('setValue', employee.altcode);
        $('#fldNewEmployeeEmail').textbox('setValue', employee.email1);
        $('#fldNewEmployeeMobile').textbox('setValue', employee.phone1);
        doSetSwitchButton('cbNewEmployeeIsFemale', employee.gender);

        $('#fldNewEmployeeAddress1').textbox('setValue', employee.address1);
        $('#fldNewEmployeeAddress2').textbox('setValue', employee.address2);
        $('#fldNewEmployeeCity').textbox('setValue', employee.city);
        $('#fldNewEmployeePostcode').textbox('setValue', employee.postcode);
        $('#cbNewEmployeeCountry').combobox('setValue', employee.country);
        $('#cbNewEmployeeState').combobox('setValue', employee.statename);

        $('#fldNewEmployeeBankName').textbox('setValue', employee.bankname);
        $('#fldNewEmployeeBankBsb').textbox('setValue', employee.bankbsb);
        $('#fldNewEmployeeBankAcctNo').textbox('setValue', employee.bankaccountno);
        $('#fldNewEmployeeBankAcctName').textbox('setValue', employee.bankaccountname);
        $('#fldNewEmployeeTaxFileNo').textbox('setValue', employee.taxfileno);
        $('#cbNewEmployeeSuperfund').combobox('setValue', employee.superfundid);
        $('#cbNewEmployeeWageAccount').combotree('setValue', employee.wageaccountid);

        $('#fldNewEmployeeTaxTable').combobox('setValue', employee.taxtable);
        $('#fldNewEmployeeAmount').numberbox('setValue', employee.payamount);
        $('#cbNewEmployeeRate').combobox('setValue', employee.payrate);
        $('#cbNewEmployeeFrequency').combobox('setValue', employee.payfrequency);
        $('#fldNewEmployeePeriod').numberbox('setValue', employee.paystdperiod);

        doSetSwitchButton('cbNewEmployeeOvertime', employee.overtimeallowed);
        $('#cbNewEmployeeType').combobox('setValue', employee.employmenttype);
        $('#cbNewEmployeeStatus').combobox('setValue', employee.employmentstatus);
        $('#dtNewEmployeeDob').datebox('setValue', employee.dob);
        $('#dtNewEmployeeStartDate').datebox('setValue', employee.startdate);
        $('#dtNewEmployeeEndDate').datebox('setValue', employee.enddate);

        var hours = JSON.parse(employee.workhours);

        if (!_.isNull(hours) && !_.isEmpty(hours))
        {
          $('#tsSundayStart').timespinner('setValue', hours[0].start);
          $('#tsSundayEnd').timespinner('setValue', hours[0].finish);

          $('#tsMondayStart').timespinner('setValue', hours[1].start);
          $('#tsMondayEnd').timespinner('setValue', hours[1].finish);

          $('#tsTuesdayStart').timespinner('setValue', hours[2].start);
          $('#tsTuesdayEnd').timespinner('setValue', hours[2].finish);

          $('#tsWednesdayStart').timespinner('setValue', hours[3].start);
          $('#tsWednesdayEnd').timespinner('setValue', hours[3].finish);

          $('#tsThursdayStart').timespinner('setValue', hours[4].start);
          $('#tsThursdayEnd').timespinner('setValue', hours[4].finish);

          $('#tsFridayStart').timespinner('setValue', hours[5].start);
          $('#tsFridayEnd').timespinner('setValue', hours[5].finish);

          $('#tsSaturdayStart').timespinner('setValue', hours[6].start);
          $('#tsSaturdayEnd').timespinner('setValue', hours[6].finish);
        }

        $('#btnEmployeeNewAdd').linkbutton('enable');
        $('#dlgEmployeeNew').dialog('setTitle', 'Modify ' + employee.firstname + ' ' + employee.lastname);
      }
    }

    doTextboxFocus('fldNewEmployeeFirstName');
  }

  function doCheckCode(ev, args)
  {
    // Code already exists?
    if (args.data.rs.length > 0)
      $('#btnEmployeeNewAdd').linkbutton('disable');
    else
      $('#btnEmployeeNewAdd').linkbutton('enable');
  }

  function doEmployeeSaved(ev, args)
  {
    $('#dlgEmployeeNew').dialog('close');
  }

  function doLoadEmployee(ev, args)
  {
    employee = (args.data.employee);
    doReset();
  }

  function doListAccounts(ev, args)
  {
    $('#cbNewEmployeeWageAccount').combotree('loadData', cache_accounts);
  }

  function doListSuperfunds(ev, args)
  {
    $('#cbNewEmployeeSuperfund').combobox('loadData', cache_superfunds);
  }

  function doEmployeeCode(ev, args)
  {
    $('#fldNewEmployeeCode').textbox('setValue', args.data.empno);
  }

  $('#divEvents').on('checkemployeecode', doCheckCode);
  $('#divEvents').on('newemployee', doEmployeeSaved);
  $('#divEvents').on('saveemployee', doEmployeeSaved);
  $('#divEvents').on('loademployee', doLoadEmployee);
  $('#divEvents').on('listaccounts', doListAccounts);
  $('#divEvents').on('listsuperfunds', doListSuperfunds);
  $('#divEvents').on('nextemployeecode', doEmployeeCode);

  $('#dlgEmployeeNew').dialog
  (
    {
      onClose: function()
      {
        $('#divEvents').off('checkemployeecode', doCheckCode);
        $('#divEvents').off('newemployee', doEmployeeSaved);
        $('#divEvents').off('saveemployee', doEmployeeSaved);
        $('#divEvents').off('loademployee', doLoadEmployee);
        $('#divEvents').off('listaccounts', doListAccounts);
        $('#divEvents').off('listsuperfunds', doListSuperfunds);
        $('#divEvents').off('nextemployeecode', doEmployeeCode);
      },
      onOpen: function()
      {
        $('#cbNewEmployeeParent').combotree
        (
          {
            valueField: 'id',
            textField: 'lastname',
            data: cache_employees
          }
        );

        $('#cbNewEmployeeTitle').combobox
        (
          {
            valueField: 'name',
            textField: 'name',
            data: titles
          }
        );

        $('#fldNewEmployeeCode').textbox
        (
          {
            onClickButton: function()
            {
              doServerMessage('nextemployeecode', {type: 'refresh'});
            },
            onChange: function(newValue, oldValue)
            {
              if (!_.isBlank(newValue))
              {
                // Check we're using a unique code...
                if (newValue != oldValue)
                  doServerDataMessage('checkemployeecode', {employeeid: employeeid, code: newValue}, {type: 'refresh'});
              }
              else
                $('#btnClientNewAdd').linkbutton('disable');
            }
          }
        );

        $('#cbNewEmployeeIsFemale').switchbutton
        (
          {
            onText: 'Yes',
            offText: 'No',
            checked: false
          }
        );

        $('#cbNewEmployeeCountry').combobox
        (
          {
            valueField: 'country',
            textField: 'country',
            data: cache_countries,
            onSelect: function(record)
            {
              states = doGetStatesFromCountry(record.country);

              $('#cbNewEmployeeState').combobox('loadData', states);
            }
          }
        );

        $('#cbNewEmployeeState').combobox
        (
          {
            valueField: 'state',
            textField: 'state',
            data: states
          }
        );

        $('#cbNewEmployeeSuperfund').combobox
        (
          {
            valueField: 'id',
            textField: 'name',
            data: cache_superfunds
          }
        );

        $('#cbNewEmployeeWageAccount').combotree
        (
          {
            valueField: 'id',
            textField: 'name',
            data: cache_accounts
          }
        );

        $('#fldNewEmployeeTaxTable').combobox
        (
          {
            valueField: 'id',
            textField: 'name',
            data: taxtabletypes
          }
        );

        $('#cbNewEmployeeRate').combobox
        (
          {
            valueField: 'id',
            textField: 'name',
            data: payrates
          }
        );

        $('#cbNewEmployeeFrequency').combobox
        (
          {
            valueField: 'id',
            textField: 'name',
            data: payfrequencies
          }
        );

        $('#cbNewEmployeeOvertime').switchbutton
        (
          {
            onText: 'Yes',
            offText: 'No',
            checked: false
          }
        );

        $('#cbNewEmployeeType').combobox
        (
          {
            valueField: 'id',
            textField: 'name',
            data: employmenttypes
          }
        );

        $('#cbNewEmployeeStatus').combobox
        (
          {
            valueField: 'id',
            textField: 'name',
            data: employmentstatuses
          }
        );

        $('#dtNewEmployeeDob').datebox(dateboxParserObj);
        $('#dtNewEmployeeStartDate').datebox(dateboxParserObj);
        $('#dtNewEmployeeEndDate').datebox(dateboxParserObj);

        if (isnew)
          $('#btnEmployeeNewAdd').linkbutton({text: 'Add'});
        else
          $('#btnEmployeeNewAdd').linkbutton({text: 'Save'});

        if (!_.isNull(employeeid))
          doServerDataMessage('loademployee', {employeeid: employeeid}, {type: 'refresh'});
        else
          doReset();
      },
      buttons:
      [
        {
          text: 'Add',
          disabled: true,
          id: 'btnEmployeeNewAdd',
          handler: function()
          {
            var firstname = $('#fldNewEmployeeFirstName').textbox('getValue');
            var lastname = $('#fldNewEmployeeLastName').textbox('getValue');
            var code = $('#fldNewEmployeeCode').textbox('getValue');

            if (!_.isBlank(lastname) && !_.isBlank(firstname))
            {
              if (!_.isBlank(code))
              {
                var parentid = doGetComboTreeSelectedId('cbNewEmployeeParent');
                var title = $('#cbNewEmployeeTitle').combobox('getValue');

                var altcode = $('#fldNewEmployeeAltCode').textbox('getValue');
                var email1 = $('#fldNewEmployeeEmail').textbox('getValue');
                var phone1 = $('#fldNewEmployeeMobile').textbox('getValue');
                var gender = doSwitchButtonChecked('cbNewEmployeeIsFemale') ? 1: 0;

                var address1 = $('#fldNewEmployeeAddress1').textbox('getValue');
                var address2 = $('#fldNewEmployeeAddress2').textbox('getValue');
                var city = $('#fldNewEmployeeCity').textbox('getValue');
                var postcode = $('#fldNewEmployeePostcode').textbox('getValue');
                var country = $('#cbNewEmployeeCountry').combobox('getValue');
                var state = $('#cbNewEmployeeState').combobox('getValue');

                var bankname = $('#fldNewEmployeeBankName').textbox('getValue');
                var bankbsb = $('#fldNewEmployeeBankBsb').textbox('getValue');
                var bankaccountno = $('#fldNewEmployeeBankAcctNo').textbox('getValue');
                var bankaccountname = $('#fldNewEmployeeBankAcctName').textbox('getValue');
                var taxfileno = $('#fldNewEmployeeTaxFileNo').textbox('getValue');
                var superfundid = $('#cbNewEmployeeSuperfund').combobox('getValue');
                var wageaccountid = $('#cbNewEmployeeWageAccount').combobox('getValue');

                var taxtable = $('#fldNewEmployeeTaxTable').textbox('getValue');
                var payamount = $('#fldNewEmployeeAmount').numberbox('getValue');
                var payrate = $('#cbNewEmployeeRate').combobox('getValue');
                var payfrequency = $('#cbNewEmployeeFrequency').combobox('getValue');
                var paystdperiod = $('#fldNewClientDaysCredit').numberbox('getValue');

                var overtimeallowed = doSwitchButtonChecked('cbNewEmployeeOvertime') ? 1: 0;
                var employmenttype = $('#cbNewEmployeeType').combobox('getValue');
                var employmentstatus = $('#cbNewEmployeeStatus').combobox('getValue');
                var dob = $('#dtNewEmployeeDob').datebox('getValue');
                var startdate = $('#dtNewEmployeeStartDate').datebox('getValue');
                var enddate = $('#dtNewEmployeeEndDate').datebox('getValue');

                var hours =
                [
                  {"start": $('#tsSundayStart').timespinner('getValue'), "finish": $('#tsSundayEnd').timespinner('getValue')},
                  {"start": $('#tsMondayStart').timespinner('getValue'), "finish": $('#tsMondayEnd').timespinner('getValue')},
                  {"start": $('#tsTuesdayStart').timespinner('getValue'), "finish": $('#tsTuesdayEnd').timespinner('getValue')},
                  {"start": $('#tsWednesdayStart').timespinner('getValue'), "finish": $('#tsWednesdayEnd').timespinner('getValue')},
                  {"start": $('#tsThursdayStart').timespinner('getValue'), "finish": $('#tsThursdayEnd').timespinner('getValue')},
                  {"start": $('#tsFridayStart').timespinner('getValue'), "finish": $('#tsFridayEnd').timespinner('getValue')},
                  {"start": $('#tsSaturdayStart').timespinner('getValue'), "finish": $('#tsSaturdayEnd').timespinner('getValue')}
                ];

                if (isnew)
                {
                  doServerDataMessage
                  (
                    'newemployee',
                    {
                      parentid: parentid,
                      title: title,
                      firstname: firstname,
                      lastname: lastname,
                      code: code,
                      altcode: altcode,
                      email1: email1,
                      phone1: phone1,
                      gender: gender,

                      address1: address1,
                      address2: address2,
                      city: city,
                      postcode: postcode,
                      state: state,
                      country: country,

                      bankname: bankname,
                      bankbsb: bankbsb,
                      bankaccountno: bankaccountno,
                      bankaccountname: bankaccountname,
                      taxfileno: taxfileno,
                      superfundid: superfundid,
                      wageaccountid: wageaccountid,

                      taxtable: taxtable,
                      payamount: payamount,
                      payrate: payrate,
                      payfrequency: payfrequency,
                      paystdperiod: paystdperiod,

                      overtimeallowed: overtimeallowed,
                      employmenttype: employmenttype,
                      employmentstatus: employmentstatus,
                      dob: dob,
                      startdate: startdate,
                      enddate: enddate,
                      workhours: ''
                    },
                    {type: 'refresh'}
                  );
                }
                else
                {
                  doServerDataMessage
                  (
                    'saveemployee',
                    {
                      employeeid: employeeid,
                      parentid: parentid,
                      title: title,
                      firstname: firstname,
                      lastname: lastname,
                      code: code,
                      altcode: altcode,
                      email1: email1,
                      phone1: phone1,
                      gender: gender,

                      address1: address1,
                      address2: address2,
                      city: city,
                      postcode: postcode,
                      state: state,
                      country: country,

                      bankname: bankname,
                      bankbsb: bankbsb,
                      bankaccountno: bankaccountno,
                      bankaccountname: bankaccountname,
                      taxfileno: taxfileno,
                      superfundid: superfundid,
                      wageaccountid: wageaccountid,

                      taxtable: taxtable,
                      payamount: payamount,
                      payrate: payrate,
                      payfrequency: payfrequency,
                      paystdperiod: paystdperiod,

                      overtimeallowed: overtimeallowed,
                      employmenttype: employmenttype,
                      employmentstatus: employmentstatus,
                      dob: dob,
                      startdate: startdate,
                      enddate: enddate,
                      workhours: JSON.stringify(hours)
                    },
                    {type: 'refresh'}
                  );
                }
              }
              else
                doMandatoryTextbox('Please enter a unique employee code', 'fldNewEmployeeCode');
            }
            else
              doMandatoryTextbox('Please enter first and lastname', 'fldNewEmployeeFirstName');
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
            $('#dlgEmployeeNew').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}
