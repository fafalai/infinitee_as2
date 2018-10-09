var accountsTabWidgetsLoaded = false;

function doAccountsTabSearch(value, name)
{
  doSearchCodeNameInTree('divAccountsTG', value);
}

function doAccountsTabWidgets()
{
  if (accountsTabWidgetsLoaded)
    return;

  accountsTabWidgetsLoaded = true;

  function doNewRoot()
  {
    doDlgAccountNew(null, null);
  }

  function doNew()
  {
    doTreeGridGetSelectedRowData
    (
      'divAccountsTG',
      function(row)
      {
        doDlgAccountNew(row.id, null);
      }
    );
  }

  function doClear()
  {
    $('#divAccountsTG').treegrid('unselectAll');
  }

  function doRemove()
  {
    if (!doTreeGridGetSelectedRowData
      (
        'divAccountsTG',
        function(row)
        {
          doPromptYesNoCancel
          (
            'Remove ' + row.name + ' and ALL subaccounts (Yes) or ONLY this account (No)?',
            function(result)
            {
              if (!_.isNull(result))
                doServerDataMessage('expireaccount', {accountid: row.id, cascade: result}, {type: 'refresh'});
            }
          );
        }
      ))
    {
      doShowError('Please select an account to remove');
    }
  }

  function doRemoveParent()
  {
    doTreeGridGetSelectedRowData
    (
      'divAccountsTG',
      function(row)
      {
        doServerDataMessage('changeaccountparent', {accountid: row.id, parentid: null}, {type: 'refresh'});
      }
    );
  }

  function doListAccounts(ev, args)
  {
    doServerMessage('listaccounts', {type: 'refresh', accountid: args.data.accountid});
  }

  $('#divEvents').on('newaccount', doListAccounts);
  $('#divEvents').on('saveaccount', doListAccounts);
  $('#divEvents').on('changeaccountparent', doListAccounts);
  $('#divEvents').on('expireaccount', doListAccounts);

  $('#divEvents').on
  (
    'listaccounts',
    function(ev, args)
    {
      doTreeReloadAndExpandToId('divAccountsTG', args.pdata.accountid);
    }
  );

  $('#divEvents').on
  (
    'checkaccountcode',
    function(ev, args)
    {
      var accounts = args.data.rs;

      if (accounts.length > 0)
        doShowError('Account code [' + accounts[0].code + '] is already assigned to [' + accounts[0].name + ']');
    }
  );

  $('#divEvents').on
  (
    'accountspopup',
    function(ev, args)
    {
      if (args == 'newroot')
        doNewRoot();
      else if (args == 'new')
        doNew();
      else if (args == 'clear')
        doClear();
      else if (args == 'remove')
        doRemove();
      else if (args == 'removeparent')
        doRemoveParent();
    }
  );

  $('#divAccountsTG').treegrid
  (
    {
      idField: 'id',
      pagination: true,
      treeField: 'name',
      lines: true,
      collapsible: true,
      fitColumns: false,
      autoRowHeight: false,
      rownumbers: true,
      striped: true,
      toolbar: '#tbAccounts',
      showFooter: true,
      sortName: 'code',
      sortOrder: 'asc',
      remoteSort: false,
      multiSort: true,
      loader: function(param, success, error)
      {
        success({total: cache_accounts.length, rows: cache_accounts});
        $(this).treegrid('reloadFooter', [{name: '<span class="totals_footer">' + doGetCountTreeArray(cache_accounts) + ' Accounts</span>'}]);
      },
      columns:
      [
        [
          {title: 'Name',     rowspan: 2, field: 'name',    width: 300, align: 'left',  resizable: true, sortable: true},
          {title: 'Code',     rowspan: 2, field: 'code',    width: 200, align: 'left',  resizable: true, sortable: true},
          {title: 'Alt',      colspan: 2},
          {title: 'Type',     rowspan: 2, field: 'type',    width: 200, align: 'left',  resizable: true, formatter: function(value, row) {return doGetStringFromIdInObjArray(accounttypes, value);}},
          {title: 'Modified', rowspan: 2, field: 'date',    width: 150, align: 'right', resizable: true, sortable: true},
          {title: 'By',       rowspan: 2, field: 'by',      width: 200, align: 'left',  resizable: true, sortable: true}
        ],
        [
          {title: 'Name',                 field: 'altname', width: 300, align: 'left',  resizable: true, styler: function(value, row, index) {return 'color: ' + colour_olivedrab + '; background-color: ' + colour_ghostwhite;}, sortable: true},
          {title: 'Code',                 field: 'altcode', width: 200, align: 'left',  resizable: true, styler: function(value, row, index) {return 'color: ' + colour_olivedrab + '; background-color: ' + colour_ghostwhite;}, sortable: true}
        ]
      ],
      onContextMenu: function(e, row)
      {
        doTreeGridContextMenu('divAccountsTG', 'divAccountsMenuPopup', e, row);
      },
      onLoadSuccess: function(row, data)
      {
        $(this).treegrid('enableDnd');
      },
      onBeforeDrag: function(source)
      {
        return true;
      },
      onDragOver: function(target, source)
      {
        return true;
      },
      onBeforeDrop: function(target, source, point)
      {
        return true;
      },
      onDrop: function(target, source, point)
      {
        doServerDataMessage('changeaccountparent', {accountid: source.id, parentid: target.id}, {type: 'refresh'});
      },
      onDblClickCell: function(field, row)
      {
        doDlgAccountNew(row.parentid, row.id);
      }
    }
  );



  // var page = $('#divAccountsTG').treegrid('getPager');
  // //console.log(page.onSelectPage);
  // page.pagination({
  //   showPageList: false,
  //   onSelectPage:function(pageNumber,pageSize){
  //     console.log(pageNumber);
  //     console.log(pageSize);
  //   }
  // });
}
