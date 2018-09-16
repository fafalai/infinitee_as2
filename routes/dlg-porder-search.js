function doDlgPOrderSearch()
{
  var states = [];

  function doReset()
  {
    $('#fldSearchPOrderNo').textbox('clear');
    $('#fldSearchPOrderName').textbox('clear');
    $('#cbSearchPOrderSuppliers').combotree('clear');

    $('#fldSearchPOrderPostcode').textbox('clear');
    $('#fldSearchPOrderCity').textbox('clear');
    $('#cbSearchPOrderCountry').combobox('clear');
    $('#cbSearchPOrderState').combobox('clear');

    $('#dtSearchPOrderDateStart').datebox('clear');
    $('#dtSearchPOrderDateEnd').datebox('clear');

    doServerMessage('listporders', {type: 'refresh'});
  }

  $('#dlgPOrderSearch').dialog
  (
    {
      onClose: function()
      {
      },
      onOpen: function()
      {
        $('#cbSearchPOrderSuppliers').combotree
        (
          {
            valueField: 'id',
            textField: 'name',
            multiple: true,
            data: cache_suppliers
          }
        );

        $('#cbSearchPOrderCountry').combobox
        (
          {
            valueField: 'country',
            textField: 'country',
            data: cache_countries,
            onSelect: function(record)
            {
              states = doGetStatesFromCountry(record.country);

              $('#cbSearchPOrderState').combobox('loadData', states);
            }
          }
        );

        $('#cbSearchPOrderState').combobox
        (
          {
            valueField: 'state',
            textField: 'state',
            data: states
          }
        );

        $('#dtSearchPOrderDateStart').datebox(dateboxParserObj);
        $('#dtSearchPOrderDateEnd').datebox(dateboxParserObj);

        // Note: Don't set country default here else search will try to match country and order may not have specifically entered country value...
        //$('#cbSearchOrderShipCountry').combobox('setValue', defaultCountry);
        doTextboxFocus('fldSearchPOrderNo');
      },
      buttons:
      [
        {
          text: 'Search',
          handler: function()
          {
            var porderno = $('#fldSearchPOrderNo').textbox('getValue');
            var name = $('#fldSearchPOrderName').textbox('getValue');
            var suppliers = $('#cbSearchPOrderSuppliers').combotree('getValues');
            var postcode = $('#fldSearchPOrderPostcode').textbox('getValue');
            var city = $('#fldSearchPOrderCity').textbox('getValue');
            var country = $('#cbSearchPOrderCountry').combobox('getValue');
            var state = $('#cbSearchPOrderState').combobox('getValue');
            var datefrom = $('#dtSearchPOrderDateStart').datebox('getValue');
            var dateto = $('#dtSearchPOrderDateEnd').datebox('getValue');
            var maxhistory = $('#cbSearchPOrderMaxHistory').combobox('getValue');

            doServerDataMessage
            (
              'searchporders',
              {
                porderno: porderno,
                name: name,
                suppliers: suppliers,
                postcode: postcode,
                city: city,
                country: country,
                state: state,
                datefrom: datefrom,
                dateto: dateto,
                maxhistory: maxhistory
              },
              {type: 'refresh'}
            );
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
            $('#dlgPOrderSearch').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}
