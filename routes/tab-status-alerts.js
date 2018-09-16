var statusAlertsTabWidgetsLoaded = false;

function doStatusAlertsTabWidgets()
{
  var tb =
  [
    {
      text: 'New',
      iconCls: 'icon-add',
      handler: doNew
    },
    {
      text: 'Clear',
      iconCls: 'icon-clear',
      handler: doClear
    },
    {
      text: 'Remove',
      iconCls: 'icon-remove',
      handler: doRemove
    }
  ];

  $('#divEvents').on
  (
    'statusalertspopup',
    function(ev, args)
    {
      if (args == 'new')
        doNew();
      else if (args == 'edit')
        doEdit();
      else if (args == 'remove')
        doRemove();
    }
  );

  if (statusAlertsTabWidgetsLoaded)
    return;

  statusAlertsTabWidgetsLoaded = true;

  function doNew()
  {
    doDlgAlertNew(null);
  }

  function doClear()
  {
    $('#divStatusAlertsG').datagrid('clearSelections');
  }

  function doRemove()
  {
    var row = $('#divStatusAlertsG').datagrid('getSelected');
    if (row)
    {
      doPromptOkCancel
      (
        'Remove alert for status ' + doGetStringFromIdInObjArray(orderstatustypes, row.status) + ' for user ' + doGetUserNameFromUUID(row.uuid) + '?',
        function(result)
        {
          if (result)
            doServerDataMessage('expirestatusalert', {statusalertid: row.id}, {type: 'refresh'});
        }
      );
    }
    else
      doShowError('Please select a status alert to remove');
  }

  function doSaved(ev, args)
  {
    doServerMessage('liststatusalerts', {type: 'refresh', statusalertid: args.data.statusalertid});
  }

  function doFooter()
  {
    $('#divStatusAlertsG').datagrid('reloadFooter', [{uname: '<span class="totals_footer">' + cache_statusalerts.length + ' Alerts</span>'}]);
  }

  // Refresh when these events occur...
  $('#divEvents').on
  (
    'liststatusalerts',
    function(ev, args)
    {
      var data = [];

      args.data.rs.forEach
      (
        function(a)
        {
          data.push
          (
            {
              id: doNiceId(a.id),
              uuid: doNiceId(a.uuid),
              status: a.status,
              email: doNiceString(a.email),
              mobile: doNiceString(a.mobile),
              date: doNiceDateModifiedOrCreated(a.datemodified, a.datecreated),
              by: doNiceModifiedBy(a.datemodified, a.usermodified, a.usercreated),
              statusname: doGetStringFromIdInObjArray(orderstatustypes, a.status),
              uname: doGetUserNameFromUUID(a.uuid)
            }
          );
        }
      );

      $('#divStatusAlertsG').datagrid('loadData', data);
      doFooter();

      doGridSelectRowById('divStatusAlertsG', args.pdata.statusalertid);
    }
  );

  $('#divEvents').on('newstatusalert', doSaved);
  $('#divEvents').on('savestatusalert', doSaved);
  $('#divEvents').on('expirestatusalert', doSaved);
  $('#divEvents').on('statusalertcreated', doSaved);
  $('#divEvents').on('statusalertsaved', doSaved);
  $('#divEvents').on('statusalertexpired', doSaved);

  $('#divStatusAlertsG').datagrid
  (
    {
      idField: 'id',
      groupField: 'uname',
      fitColumns: false,
      singleSelect: true,
      rownumbers: true,
      striped: true,
      toolbar: tb,
      showFooter: true,
      view: groupview,
      loader: function(param, success, error)
      {
        success({total: cache_statusalerts.length, rows: cache_statusalerts});
        doFooter();
      },
      frozenColumns:
      [
        [
          {title: 'User',     field: 'uname',      width: 300, align: 'left',  resizable: true}
        ]
      ],
      columns:
      [
        [
          {title: 'Status',   field: 'statusname', width: 200, align: 'left',  resizable: true},
          {title: 'Email',    field: 'email',      width: 200, align: 'left',  resizable: true},
          {title: 'Mobile',   field: 'mobile',     width: 200, align: 'left',  resizable: true},
          {title: 'Modified', field: 'modified',   width: 150, align: 'right', resizable: true},
          {title: 'By',       field: 'by',         width: 200, align: 'left',  resizable: true}
        ]
      ],
      groupFormatter: function(value, rows)
      {
        return value + ' - ' + rows.length + ' alert(s)';
      },
      onRowContextMenu: function(e, index, row)
      {
        doGridContextMenu('divStatusAlertsG', 'divStatusAlertsMenuPopup', e, index, row);
      },
      onDblClickCell: function(index, field, value)
      {
        doGetGridGetRowDataByIndex
        (
          'divStatusAlertsG',
          index,
          function(row)
          {
            doDlgAlertNew(row.id);
          }
        );
      }
    }
  );
}
