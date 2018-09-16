var exchangeratesTabWidgetsLoaded = false;

function doExchangeRatesTabWidgets()
{
  var editingIndex = null;

  if (exchangeratesTabWidgetsLoaded)
    return;

  function doNew()
  {
    primus.emit('newexchangerate', {fguid: fguid, uuid: uuid, session: session, name: 'New Exchange Rate', pdata: {type: 'refresh'}});
  }

  function doClear()
  {
    $('#divExchangeRatesG').datagrid('clearSelections');
  }

  function doEdit()
  {
    doGridStartEdit
    (
      'divExchangeRatesG',
      editingIndex,
      function(row, index)
      {
        editingIndex = index;

        doGridGetEditor
        (
          'divExchangeRatesG',
          editingIndex,
          'name',
          function(ed)
          {
          }
        );
      }
    );
  }

  function doCancel()
  {
    editingIndex = doGridCancelEdit('divExchangeRatesG', editingIndex);
  }

  function doSave()
  {
    editingExchangeRateIndex
    (
      'divExchangeRatesG',
      editingIndex,
      function(row)
      {
        primus.emit('saveexchangerate', {fguid: fguid, uuid: uuid, session: session, exchangerateid: row.id, name: row.name, provider: row.provider, currency: row.currency, rate: row.rate, pdata: {type: 'refresh'}});
      }
    );

    editingIndex = null;
  }

  function doRemove()
  {
    var row = $('#divExchangeRatesG').datagrid('getSelected');
    if (row)
    {
      doPromptOkCancel
      (
        'Remove ' + row.name + '?',
        function(result)
        {
          if (result)
            primus.emit('expireexchangerate', {fguid: fguid, uuid: uuid, session: session, exchangerateid: row.id, pdata: {type: 'refresh'}});
        }
      );
    }
    else
      noty({text: 'Please select an exchange rate to remove', type: 'error', timeout: 4000});
  }

  function doLookup()
  {
    if (!doGridGetSelectedRowData
      (
        'divExchangeRatesG',
        editingIndex,
        function(row)
        {
          doDlgSelectRate
          (
            function(rate)
            {
              $('#divExchangeRatesG').datagrid('updateRow', {index: editingIndex, row: {currency: rate.currency, rate: rate.rate}});

              // Force saving of this row...
              editingIndex = editingIndex;
              doExchangeRatesSave();
            }
          );
        }
      ))
    {
      noty({text: 'Please select a rate ti lookup', type: 'error', timeout: 4000});
    }
  }

  // Refresh when these events occur...
  $('#divEvents').on
  (
    'listexchangerates',
    function(ev, args)
    {
      $('#divExchangeRatesG').datagrid('reload');

      if (!_.isUndefined(args.pdata.exchangerateid) && !_.isNull(args.pdata.exchangerateid))
        $('#divExchangeRatesG').datagrid('selectRecord', args.pdata.exchangerateid);
    }
  );

  $('#divEvents').on
  (
    'newexchangerate',
    function(ev, args)
    {
      primus.emit('listexchangerates', {fguid: fguid, uuid: uuid, session: session, pdata:  {type: 'refresh', exchangerateid: args.data.exchangerateid}});
    }
  );

  $('#divEvents').on
  (
    'saveexchangerate',
    function(ev, args)
    {
      primus.emit('listexchangerates', {fguid: fguid, uuid: uuid, session: session, pdata:  {type: 'refresh', exchangerateid: args.data.exchangerateid}});
    }
  );

  $('#divEvents').on
  (
    'expireexchangerate',
    function(ev, args)
    {
      primus.emit('listexchangerates', {fguid: fguid, uuid: uuid, session: session, pdata:  {type: 'refresh'}});
    }
  );

  $('#divEvents').on
  (
    'changeratecreated',
    function(ev, args)
    {
      primus.emit('listexchangerates', {fguid: fguid, uuid: uuid, session: session, pdata:  {type: 'refresh'}});
    }
  );

  $('#divEvents').on
  (
    'exchangeratesaved',
    function(ev, args)
    {
      primus.emit('listexchangerates', {fguid: fguid, uuid: uuid, session: session, pdata:  {type: 'refresh'}});
    }
  );

  $('#divEvents').on
  (
    'exchangerateeexpired',
    function(ev, args)
    {
      primus.emit('listexchangerates', {fguid: fguid, uuid: uuid, session: session, pdata:  {type: 'refresh'}});
    }
  );

  $('#divEvents').on
  (
    'exchangeratespopup',
    function(ev, args)
    {
      if (args == 'new')
        doNew();
      else if (args == 'clear')
        doClear();
      else if (args == 'edit')
        doEdit();
      else if (args == 'cancel')
        doCancel();
      else if (args == 'save')
        doSave();
      else if (args == 'remove')
        doRemove();
      else if (args == 'lookup')
        doLookup();
    }
  );

  exchangeratesTabWidgetsLoaded = true;

  //

  $('#divExchangeRatesG').datagrid
  (
    {
      idField: 'id',
      fitColumns: false,
      singleSelect: true,
      rownumbers: true,
      striped: true,
      toolbar: '#tbExchangeRates',
      loader: function(param, success, error)
      {
        success({total: cache_exchangerates.length, rows: cache_exchangerates});
      },
      frozenColumns:
      [
        [
          {title: 'Name',     field: 'name',     width: 300, align: 'left',  resizable: true, editor: 'text'}
        ]
      ],
      columns:
      [
        [
          {title: 'Provider', field: 'provider', width: 200, align: 'left',  resizable: true, editor: 'text'},
          {title: 'Currency', field: 'currency', width: 100, align: 'left',  resizable: true, editor: 'text'},
          {title: 'Rate',     field: 'rate',     width: 100, align: 'right', resizable: true, editor: {type: 'numberbox', options: {precision: 4}}},
          {title: 'Modified', field: 'date',     width: 150, align: 'right', resizable: true},
          {title: 'By',       field: 'by',       width: 200, align: 'left',  resizable: true}
        ]
      ],
      onRowContextMenu: function(e, index, row)
      {
        doGridContextMenu('divExchangeRatesG', 'divExchangeRatesMenuPopup', e, index, row);
      },
      onDblClickCell: function(index, field, value)
      {
        doGridStartEdit
        (
          'divExchangeRatesG',
          editingIndex,
          function(row, index)
          {
            editingIndex = index;

            if (['modified', 'by'].indexOf(field) != -1)
              field = 'name';

            doGridGetEditor
            (
              'editingExchangeRateIndex',
              editingIndex,
              field,
              function(ed)
              {
              }
            );
          }
        );
      }
    }
  );
}
