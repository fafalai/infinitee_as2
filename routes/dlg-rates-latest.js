function doDlgSelectRate(callback)
{
  function doRates(ev, args)
  {
    var rates = [];

    args.data.forEach
    (
      function(r)
      {
        rates.push
        (
          {
            currency: doNiceId(r.currency),
            rate: doNiceString(r.rate)
          }
        );
      }
    );

    $('#cbLatestRates').combogrid
    (
      {
        panelWidth: 300,
        idField: 'currency',
        valueField: 'currency',
        textField: 'rate',
        fitColumns: true,
        singleSelect: true,
        rownumbers: false,
        striped: true,
        mode: 'local',
        columns:
          [
            [
              {title: 'Currency', field: 'currency', width: 80, align: 'left'},
              {title: 'Rate',     field: 'rate',     width: 80, align: 'right'}
            ]
          ]
      }
    );
  }

  // Need to destroy/re-create this event since it depends on arguments that change each call...
  $('#divEvents').on('latestrates', doRates);

  $('#dlgRatesLatest').dialog
  (
    {
      onClose: function()
      {
        $('#divEvents').off('latestrates', doRates);
      },
      onOpen: function()
      {
        doServerMessage('latestrates', {type: 'refresh'});
      },
      buttons:
      [
        {
          text: 'Select',
          handler: function()
          {
            doComboGridGetSelectedRowData
            (
              'divOrderNewProductsG',
              function(row)
              {
                if (!_.isUndefined(callback) && !_.isNull(callback))
                  callback(row);
              }
            );

            $('#dlgRatesLatest').dialog('close');
          }
        },
        {
          text: 'Close',
          handler: function()
          {
            $('#dlgRatesLatest').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}

