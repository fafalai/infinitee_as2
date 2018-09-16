function doDlgTaxCodeNew(taxcodeid)
{
  var isnew = _.isUndefined(taxcodeid) || _.isNull(taxcodeid);
  var taxcode = {};

  function doReset()
  {
    if (isnew)
    {
      $('#fldNewTaxCodeName').textbox('clear');
      $('#fldNewTaxCodeCode').textbox('clear');
      $('#fldNewTaxCodePercent').numberbox('clear');

      $('#btnTaxCodeNewAdd').linkbutton('disable');
    }
    else
    {
      if (!_.isEmpty(taxcode))
      {
        $('#fldNewTaxCodeName').textbox('setValue', taxcode.name);
        $('#fldNewTaxCodeCode').textbox('setValue', taxcode.code);
        $('#fldNewTaxCodePercent').numberbox('setValue', taxcode.percent);

        $('#btnTaxCodeNewAdd').linkbutton('enable');
        $('#dlgTaxCodeNew').dialog('setTitle', 'Modify ' + taxcode.name);
      }
    }

    doTextboxFocus('fldNewTaxCodeName');
  }

  function doCheckCode(ev, args)
  {
    // Code already exists?
    if (args.data.rs.length > 0)
      $('#btnTaxCodeNewAdd').linkbutton('disable');
    else
      $('#btnTaxCodeNewAdd').linkbutton('enable');
  }

  function doSaved(ev, args)
  {
    $('#dlgTaxCodeNew').dialog('close');
  }

  function doLoad(ev, args)
  {
    taxcode = (args.data.taxcode);
    doReset();
  }

  $('#divEvents').on('checktaxcode', doCheckCode);
  $('#divEvents').on('newtaxcode', doSaved);
  $('#divEvents').on('savetaxcode', doSaved);
  $('#divEvents').on('loadtaxcode', doLoad);

  $('#divEvents').on
  (
    'checktaxcode',
    function(ev, args)
    {
      var codes = args.data.rs;

      if (codes.length > 0)
        doShowError('Tax code [' + codes[0].code + '] is already assigned to [' + codes[0].name + ']');
    }
  );

  $('#dlgTaxCodeNew').dialog
  (
    {
      onClose: function()
      {
        $('#divEvents').off('checktaxcode', doCheckCode);
        $('#divEvents').off('newtaxcode', doSaved);
        $('#divEvents').off('savetaxcode', doSaved);
        $('#divEvents').off('loadtaxcode', doLoad);
      },
      onOpen: function()
      {
        $('#fldNewTaxCodeCode').textbox
        (
          {
            onChange: function(newValue, oldValue)
            {
              if (!_.isBlank(newValue))
              {
                // Check we're using a unique code...
                if (newValue != oldValue)
                  doServerDataMessage('checktaxcode', {taxcodeid: taxcodeid, code: newValue}, {type: 'refresh'});
              }
              else
                $('#btnTaxCodeNewAdd').linkbutton('disable');
            }
          }
        );

        if (isnew)
          $('#btnTaxCodeNewAdd').linkbutton({text: 'Add'});
        else
          $('#btnTaxCodeNewAdd').linkbutton({text: 'Save'});

        if (!_.isNull(taxcodeid))
          doServerDataMessage('loadtaxcode', {taxcodeid: taxcodeid}, {type: 'refresh'});
        else
          doReset();
      },
      buttons:
      [
        {
          text: 'Add',
          disabled: true,
          id: 'btnTaxCodeNewAdd',
          handler: function()
          {
            var name = $('#fldNewTaxCodeName').textbox('getValue');
            var code = $('#fldNewTaxCodeCode').textbox('getValue');
            var percent = $('#fldNewTaxCodePercent').numberbox('getValue');

            if (!_.isBlank(name))
            {
              if (!_.isBlank(code))
              {
                if (!_.isBlank(percent))
                {
                  if (isnew)
                    doServerDataMessage('newtaxcode', {name: name, code: code, percent: percent}, {type: 'refresh'});
                  else
                    doServerDataMessage('savetaxcode', {taxcodeid: taxcode.id, name: name, code: code, percent: percent}, {type: 'refresh'});
                }
                else
                  doMandatoryTextbox('Please enter percentage tax', 'fldNewTaxCodePercent');
              }
              else
                doMandatoryTextbox('Please enter unique tax code', 'fldNewTaxCodeCode');
            }
            else
              doMandatoryTextbox('Please enter name of tax code', 'fldNewTaxCodeName');
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
            $('#dlgTaxCodeNew').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}

