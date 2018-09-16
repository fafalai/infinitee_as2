var usersTabWidgetsLoaded = false;

function doUsersTabSearch(value, name)
{
  doSearchCodeNameInGrid('divUsersG', value, 'username', 'uuid');
}

function doUsersTabWidgets()
{
  if (usersTabWidgetsLoaded)
    return;

  function doNew()
  {
    doDlgUserNew(null);
  }

  function doClear()
  {
    $('#divUsersG').datagrid('clearSelections');
  }

  function doRemove()
  {
    if (!doGridGetSelectedRowData
      (
        'divUsersG',
        function(row)
        {
          doPromptOkCancel
          (
            'Remove ' + row.name + '?',
            function(result)
            {
              if (result)
                doServerDataMessage('expireuser', {useruuid: row.uuid}, {type: 'refresh'});
            }
          );
        }
      ))
    {
      doShowError('Please select a superfund to remove');
    }
  }

  function doPermissions()
  {
    if (!doGridGetSelectedRowData
      (
        'divUsersG',
        function(row)
        {
          doDlgUserPermissions(row);
        }
      ))
    {
      doShowError('Please select a user to view/edit permissions');
    }
  }

  function doPassword()
  {
    if (!doGridGetSelectedRowData
      (
        'divUsersG',
        function(row)
        {
          doDlgChangePassword(row);
        }
      ))
    {
      doShowError('Please select a user to change password');
    }
  }

  function doSaved(ev, args)
  {
    doServerMessage('listusers', {type: 'refresh', uuid: args.data.uuid});
  }

  // Refresh when these events occur...
  $('#divEvents').on
  (
    'listusers',
    function(ev, args)
    {
      $('#divUsersG').datagrid('reload');

      if (!_.isUndefined(args.pdata.uuid) && !_.isNull(args.pdata.uuid))
        $('#divUsersG').datagrid('selectRecord', args.pdata.uuid);
    }
  );

  $('#divEvents').on
  (
    'listconnectedusers',
    function(ev, args)
    {
      args.data.rs.forEach
      (
        function(u)
        {
          var index = $('#divUsersG').datagrid('getRowIndex', u.uuid);

          if (index != -1)
            $('#divUsersG').datagrid('updateRow', {index: index, row: {status: mapUserStatusToImage('online')}});
        }
      );
    }
  );

  $('#divEvents').on('newuser', doSaved);
  $('#divEvents').on('saveuser', doSaved);
  $('#divEvents').on('expireuser', doSaved);
  $('#divEvents').on('changepassword', doSaved);
  $('#divEvents').on('userpermissionssaved', doSaved);

  $('#divEvents').on
  (
    'useronline',
    function(ev, args)
    {
      doGetGridFindId
      (
        'divUsersG',
        args.data.uuid,
        function(err, index)
        {
          if (!err)
            $('#divUsersG').datagrid('updateRow', {index: index, row: {status: mapUserStatusToImage('online')}});
        }
      );
    }
  );

  $('#divEvents').on
  (
    'useroffline',
    function(ev, args)
    {
      doGetGridFindId
      (
        'divUsersG',
        args.data.uuid,
        function(err, index)
        {
          if (!err)
            $('#divUsersG').datagrid('updateRow', {index: index, row: {status: mapUserStatusToImage('offline')}});
        }
      );
    }
  );

  $('#divEvents').on
  (
    'userlogout',
    function(ev, args)
    {
      doGetGridFindId
      (
        'divUsersG',
        args.data.uuid,
        function(err, index)
        {
          if (!err)
            $('#divUsersG').datagrid('updateRow', {index: index, row: {status: mapUserStatusToImage('logout')}});
        }
      );
    }
  );

  $('#divEvents').on
  (
    'userpaused',
    function(ev, args)
    {
      doGetGridFindId
      (
        'divUsersG',
        args.data.uuid,
        function(err, index)
        {
          if (!err)
            $('#divUsersG').datagrid('updateRow', {index: index, row: {status: mapUserStatusToImage('paused')}});
        }
      );
    }
  );

  $('#divEvents').on
  (
    'userpolled',
    function(ev, args)
    {
      doGetGridFindId
      (
        'divUsersG',
        args.data.uuid,
        function(err, index)
        {
          if (!err)
            $('#divUsersG').datagrid('updateRow', {index: index, row: {status: mapUserStatusToImage('polled')}});
        }
      );
    }
  );


  $('#divEvents').on
  (
    'userspopup',
    function(ev, args)
    {
      if (args == 'new')
        doNew();
      else if (args == 'clear')
        doClear();
      else if (args == 'remove')
        doRemove();
      else if (args == 'password')
        doPassword();
      else if (args == 'permissions')
        doPermissions();
    }
  );

  usersTabWidgetsLoaded = true;

  // Check user permissions for this TAB...
  if (!isadmin)
  {
    $('#tbUsersNew').remove();
  }

  $('#divUsersG').datagrid
  (
    {
      idField: 'uuid',
      fitColumns: false,
      singleSelect: true,
      rownumbers: true,
      striped: true,
      toolbar: '#tbUsers',
      showFooter: true,
      sortName: 'name',
      sortOrder: 'asc',
      remoteSort: false,
      multiSort: true,
      loader: function(param, success, error)
      {
        success({total: cache_users.length, rows: cache_users});
        $(this).datagrid('reloadFooter', [{name: '<span class="totals_footer">' + cache_users.length + ' Users</span>'}]);

        doServerMessage('listconnectedusers', {type: 'refresh'});
      },
      frozenColumns:
      [
        [
          {title: 'Status',        rowspan: 2, field: 'status',   width: 80,  align: 'center', resizable: true},
          {title: 'Name',          rowspan: 2, field: 'name',     width: 300, align: 'left',   resizable: true, editor: 'text', styler: function(value, row, index) {if (row.isclient) return 'color: ' + colour_blueviolet;}, sortable: true}
        ],
        [
        ]
      ],
      columns:
      [
        [
          {title: 'User Name',     rowspan: 2, field: 'username', width: 300, align: 'left',   resizable: true, sortable: true},
          {title: 'Email',         rowspan: 2, field: 'email',    width: 300, align: 'left',   resizable: true},
          {title: 'Phone',         rowspan: 2, field: 'phone',    width: 150, align: 'left',   resizable: true},
          {title: 'Admin?',        rowspan: 2, field: 'isadmin',  width: 80,  align: 'center', resizable: true, formatter: function(value, row) {return mapBoolToImage(value);}},
          {title: 'Client?',       rowspan: 2, field: 'isclient', width: 80,  align: 'center', resizable: true, formatter: function(value, row) {return mapBoolToImage(value);}},
          {title: 'Client',        rowspan: 2, field: 'clientid', width: 300, align: 'left',   resizable: true, formatter: function(value, row) {return doGetNameFromTreeArray(cache_clients, value);}, styler: function(value, row, index) {if (row.isclient) return 'color: ' + colour_blueviolet;}, sortable: true},
          {title: 'Avatar',        rowspan: 2, field: 'avatar',   width: 100, align: 'center', resizable: true, formatter: function(value, row) {return mapAvatarToImage(value);}},
          {title: 'Last',          colspan: 3},
          {title: 'Modified',      rowspan: 2, field: 'date',     width: 150, align: 'right', resizable: true, sortable: true},
          {title: 'By',            rowspan: 2, field: 'by',       width: 200, align: 'left',  resizable: true, sortable: true}
        ],
        [
          {title: 'Login',                    field: 'lastlogin',  width: 150, align: 'right', resizable: true, sortable: true},
          {title: 'Logout',                   field: 'lastlogout', width: 150, align: 'right', resizable: true, sortable: true},
          {title: 'IP',                       field: 'lastip',     width: 150, align: 'left',  resizable: true, sortable: true},
        ]
      ],
      onRowContextMenu: function(e, index, row)
      {
        doGridContextMenu('divUsersG', 'divUsersMenuPopup', e, index, row);
      },
      onDblClickCell: function(index, field, value)
      {
        doGetGridGetRowDataByIndex
        (
          'divUsersG',
          index,
          function(row)
          {
            doDlgUserNew(row.uuid);
          }
        );
      }
    }
  );
}
