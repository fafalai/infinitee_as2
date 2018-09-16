var taxcodesTabWidgetsLoaded = false;

function doTaxCodesTabWidgets()
{
  if (taxcodesTabWidgetsLoaded)
    return;

  taxcodesTabWidgetsLoaded = true;

  function doNew()
  {
    doDlgTaxCodeNew(null);
  }

  function doClear()
  {
    $('#divTaxCodesG').datagrid('clearSelections');
  }

  function doRemove()
  {
    if (!doGridGetSelectedRowData
      (
        'divTaxCodesG',
        function(row)
        {
          doPromptOkCancel
          (
            'Remove ' + row.name + '?',
            function(result)
            {
              if (!_.isNull(result))
                doServerDataMessage('expiretaxcode', {taxcodeid: row.id}, {type: 'refresh'});
            }
          );
        }
      ))
    {
      doShowError('Please select a taxcode to remove');
    }
  }

  function doListTaxCodes(ev, args)
  {
    doServerMessage('listtaxcodes', {type: 'refresh', taxcodeid: args.data.taxcodeid});
  }

  $('#divEvents').on('newtaxcode', doListTaxCodes);
  $('#divEvents').on('savetaxcode', doListTaxCodes);
  $('#divEvents').on('expiretaxcode', doListTaxCodes);

  $('#divEvents').on
  (
    'listtaxcodes',
    function(ev, args)
    {
      doGridReloadAndSelectId('divTaxCodesG', args.pdata.taxcodeid);
    }
  );

  $('#divEvents').on
  (
    'taxcodespopup',
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

  $('#divTaxCodesG').datagrid
  (
    {
      idField: 'id',
      fitColumns: false,
      singleSelect: true,
      rownumbers: true,
      striped: true,
      toolbar: '#tbTaxCodes',
      showFooter: true,
      sortName: 'name',
      sortOrder: 'asc',
      remoteSort: false,
      multiSort: true,
      loader: function(param, success, error)
      {
        success({total: cache_taxcodes.length, rows: cache_taxcodes});
        $(this).datagrid('reloadFooter', [{name: '<span class="totals_footer">' + cache_taxcodes.length + ' Tax Codes</span>'}]);
      },
      frozenColumns:
      [
        [
          {title: 'Name',     field: 'name',    width: 300, align: 'left',   resizable: true, sortable: true}
        ]
      ],
      columns:
      [
        [
          {title: 'Code',     field: 'code',    width: 200, align: 'left',   resizable: true, sortable: true},
          {title: 'Percent',  field: 'percent', width: 100, align: 'right',  resizable: true, sortable: true},
          {title: 'Modified', field: 'date',    width: 150, align: 'right',  resizable: true, sortable: true},
          {title: 'By',       field: 'by',      width: 200, align: 'left',   resizable: true, sortable: true}
        ]
      ],
      onRowContextMenu: function(e, index, row)
      {
        doGridContextMenu('divTaxCodesG', 'divTaxCodesMenuPopup', e, index, row);
      },
      onDblClickCell: function(index, field, value)
      {
        doGetGridGetRowDataByIndex
        (
          'divTaxCodesG',
          index,
          function(row)
          {
            doDlgTaxCodeNew(row.id);
          }
        );
      }
    }
  );
}
