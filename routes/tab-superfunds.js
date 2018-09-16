var superfundsTabWidgetsLoaded = false;

function doSuperfundsTabWidgets()
{
  if (superfundsTabWidgetsLoaded)
    return;

  superfundsTabWidgetsLoaded = true;

  function doNew()
  {
    doDlgSuprfundNew();
  }

  function doClear()
  {
    $('#divSuperfundsG').datagrid('clearSelections');
  }

  function doRemove()
  {
    if (!doGridGetSelectedRowData
      (
        'divSuperfundsG',
        function(row)
        {
          doPromptOkCancel
          (
            'Remove ' + row.name + '?',
            function(result)
            {
              if (result)
                primus.emit('expiresuperfund', {fguid: fguid, uuid: uuid, session: session, superfundid: row.id, pdata: {type: 'refresh'}});
            }
          );
        }
      ))
    {
      noty({text: 'Please select a superfund to remove', type: 'error', timeout: 4000});
    }
  }

  // Refresh when these events occur...
  $('#divEvents').on
  (
    'listsuperfunds',
    function(ev, args)
    {
      $('#divSuperfundsG').datagrid('reload');

      if (!_.isUndefined(args.pdata.superfundid) && !_.isNull(args.pdata.superfundid))
        $('#divSuperfundsG').datagrid('selectRecord', args.pdata.superfundid);
    }
  );

  $('#divEvents').on
  (
    'newsuperfund',
    function(ev, args)
    {
      primus.emit('listsuperfunds', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh', superfundid: args.data.superfundid}});
    }
  );

  $('#divEvents').on
  (
    'savesuperfund',
    function(ev, args)
    {
      primus.emit('listsuperfunds', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh', superfundid: args.data.superfundid}});
    }
  );

  $('#divEvents').on
  (
    'expiresuperfund',
    function(ev, args)
    {
      primus.emit('listsuperfunds', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
    }
  );

  $('#divEvents').on
  (
    'superfundspopup',
    function(ev, args)
    {
      if (args == 'new')
        doNew();
      else if (args == 'clear')
        doClear();
      else if (args == 'remove')
        doRemove();
    }
  );

  $('#divSuperfundsG').datagrid
  (
    {
      idField: 'id',
      fitColumns: false,
      singleSelect: true,
      rownumbers: true,
      striped: true,
      toolbar: '#tbSuperfunds',
      showFooter: true,
      sortName: 'name',
      sortOrder: 'asc',
      remoteSort: false,
      multiSort: true,
      loader: function(param, success, error)
      {
        success({total: cache_superfunds.length, rows: cache_superfunds});
        $(this).datagrid('reloadFooter', [{name: '<span class="totals_footer">' + cache_superfunds.length + ' Funds</span>'}]);
      },
      frozenColumns:
      [
        [
          {title: 'Name',     field: 'name',     width: 300, align: 'left',  resizable: true, sortable: true}
        ]
      ],
      columns:
      [
        [
          {title: 'Modified', field: 'date',     width: 150, align: 'right', resizable: true, sortable: true},
          {title: 'By',       field: 'by',       width: 200, align: 'left',  resizable: true, sortable: true}
        ]
      ],
      onRowContextMenu: function(e, index, row)
      {
        doGridContextMenu('divSuperfundsG', 'divSuperfundsMenuPopup', e, index, row);
      },
      onDblClickCell: function(index, field, value)
      {
        doGetGridGetRowDataByIndex
        (
          'divTaxCodesG',
          index,
          function(row)
          {
            doDlgSuprfundNew(row.id);
          }
        );
      }
    }
  );
}
