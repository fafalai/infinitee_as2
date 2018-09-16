function doDlgOrderSearch()
{
  var states = [];

  function doReset()
  {
    $('#fldSearchOrderNo').textbox('clear');
    $('#fldSearchPONo').textbox('clear');
    $('#fldSearchOrderName').textbox('clear');
    $('#fldSearchOrderVersion').textbox('clear');
    $('#cbSearchOrderClients').combotree('clear');

    $('#fldSearchOrderShipPostcode').textbox('clear');
    $('#fldSearchOrderShipCity').textbox('clear');
    $('#cbSearchOrderShipCountry').combobox('clear');
    $('#cbSearchOrderShipState').combobox('clear');

    $('#cbSearchOrderStatus').combobox('clear');

    $('#dtSearchDateStart').datebox('clear');
    $('#dtSearchDateEnd').datebox('clear');

    doServerMessage('listorders', {type: 'refresh'});
  }

  $('#dlgOrderSearch').dialog
  (
    {
      onClose: function()
      {
      },
      onOpen: function()
      {
        $('#cbSearchOrderClients').combotree
        (
          {
            valueField: 'id',
            textField: 'name',
            multiple: true,
            data: cache_clients
          }
        );

        $('#cbSearchOrderShipCountry').combobox
        (
          {
            valueField: 'country',
            textField: 'country',
            limitToList: true,
            data: cache_countries,
            onSelect: function(record)
            {
              states = doGetStatesFromCountry(record.country);

              $('#cbSearchOrderShipState').combobox('loadData', states);
            }
          }
        );

        $('#cbSearchOrderShipState').combobox
        (
          {
            valueField: 'state',
            textField: 'state',
            limitToList: true,
            data: states
          }
        );

        $('#cbSearchOrderStatus').combobox
        (
          {
            valueField: 'id',
            textField: 'name',
            limitToList: true,
            data: orderstatustypes
          }
        );

        $('#dtSearchDateStart').datebox(dateboxParserObj);
        $('#dtSearchDateEnd').datebox(dateboxParserObj);

        // Note: Don't set country default here else search will try to match country and order may not have specifically entered country value...
        //$('#cbSearchOrderShipCountry').combobox('setValue', defaultCountry);
        doTextboxFocus('fldSearchOrderNo');
      },
      buttons:
      [
        {
          text: 'Search',
          handler: function()
          {
            var orderno = $('#fldSearchOrderNo').textbox('getValue');
            var pono = $('#fldSearchPONo').textbox('getValue');
            var name = $('#fldSearchOrderName').textbox('getValue');
            var version = $('#fldSearchOrderVersion').textbox('getValue');
            var clients = $('#cbSearchOrderClients').combotree('getValues');
            var shippostcode = $('#fldSearchOrderShipPostcode').textbox('getValue');
            var shipcity = $('#fldSearchOrderShipCity').textbox('getValue');
            var shipcountry = $('#cbSearchOrderShipCountry').combobox('getValue');
            var shipstate = $('#cbSearchOrderShipState').combobox('getValue');
            var status = $('#cbSearchOrderStatus').combobox('getValue');
            var datefrom = $('#dtSearchDateStart').datebox('getValue');
            var dateto = $('#dtSearchDateEnd').datebox('getValue');
            var maxhistory = $('#cbSearchOrderMaxHistory').combobox('getValue');

            console.log(status);

            doServerDataMessage
            (
              'searchorders',
              {
                orderno: orderno,
                pono: pono,
                name: name,
                version: version,
                clients: clients,
                shippostcode: shippostcode,
                shipcity: shipcity,
                shipcountry: shipcountry,
                shipstate: shipstate,
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
            $('#dlgOrderSearch').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}
