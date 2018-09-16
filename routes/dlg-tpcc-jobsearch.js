function doDlgTPCCJobSearch()
{
  var states = [];

  function doReset()
  {
    $('#fldSearchJobNo').textbox('clear');
    $('#fldSearchJobOrderNo').textbox('clear');
    $('#fldSearchPONo').textbox('clear');
    $('#fldSearchJobName').textbox('clear');
    $('#fldSearchJobVersion').textbox('clear');
    $('#cbSearchJobClients').combotree('clear');

    $('#fldSearchJobShipPostcode').textbox('clear');
    $('#fldSearchJobShipCity').textbox('clear');
    $('#cbSearchJobShipCountry').combobox('clear');
    $('#cbSearchJobShipState').combobox('clear');

    $('#dtSearchJobDateStart').datebox('clear');
    $('#dtSearchJobDateEnd').datebox('clear');

    doServerMessage('listorders', {type: 'refresh'});
  }

  $('#dlgTPCCJobSearch').dialog
  (
    {
      onClose: function()
      {
      },
      onOpen: function()
      {
        $('#cbSearchJobClients').combotree
        (
          {
            valueField: 'id',
            textField: 'name',
            multiple: true,
            data: cache_clients
          }
        );

        $('#cbSearchJobShipCountry').combobox
        (
          {
            valueField: 'country',
            textField: 'country',
            data: cache_countries,
            onSelect: function(record)
            {
              states = doGetStatesFromCountry(record.country);

              $('#cbSearchJobShipState').combobox('loadData', states);
            }
          }
        );

        $('#cbSearchJobShipState').combobox
        (
          {
            valueField: 'state',
            textField: 'state',
            data: states
          }
        );

        $('#dtSearchJobDateStart').datebox
        (
          {
            formatter: function(dt)
            {
              return _.nicedatetodisplay(dt);
            },
            parser: function(d)
            {
              if (_.isUndefined(d) || _.isBlank(d))
                return new Date(); return moment(d).toDate();
            }
          }
        );

        $('#dtSearchJobDateEnd').datebox
        (
          {
            formatter: function(dt)
            {
              return _.nicedatetodisplay(dt);
            },
            parser: function(d)
            {
              if (_.isUndefined(d) || _.isBlank(d))
                return new Date(); return moment(d).toDate();
            }
          }
        );

        // Note: Don't set country default here else search will try to match country and order may not have specifically entered country value...
        //$('#cbSearchJobShipCountry').combobox('setValue', defaultCountry);
        doTextboxFocus('fldSearchJobNo');
      },
      buttons:
      [
        {
          text: 'Search',
          handler: function()
          {
            var jobsheetno = $('#fldSearchJobNo').textbox('getValue');
            var orderno = $('#fldSearchJobOrderNo').textbox('getValue');
            var pono = $('#fldSearchPONo').textbox('getValue');
            var name = $('#fldSearchJobName').textbox('getValue');
            var clients = $('#cbSearchJobClients').combotree('getValues');
            var shippostcode = $('#fldSearchJobShipPostcode').textbox('getValue');
            var shipcity = $('#fldSearchJobShipCity').textbox('getValue');
            var shipcountry = $('#cbSearchJobShipCountry').combobox('getValue');
            var shipstate = $('#cbSearchJobShipState').combobox('getValue');
            var datefrom = $('#dtSearchJobDateStart').datebox('getValue');
            var dateto = $('#dtSearchJobDateEnd').datebox('getValue');
            var maxhistory = $('#cbSearchJobMaxHistory').combobox('getValue');

            doServerDataMessage
            (
              'tpccsearchjobsheets',
              {
                jobsheetno: jobsheetno,
                orderno: orderno,
                pono: pono,
                name: name,
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
            $('#dlgTPCCJobSearch').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}
