var timesheetsTabWidgetsLoaded = false;
// IDs of rows etc we're editing...
var editingTimesheetIndex = null;

// Toolbars for grids...
var tbTimesheets =
[
  {
    text: 'Clear',
    iconCls: 'icon-clear',
    handler: doTimesheetsClear
  },
  {
    text: 'Edit',
    iconCls: 'icon-edit',
    handler: doTimesheetsEdit
  },
  {
    text: 'Cancel',
    iconCls: 'icon-cancel',
    handler: doTimesheetsCancel
  },
  {
    text: 'Save',
    iconCls: 'icon-save',
    handler: doTimesheetsSave
  },
  {
    text: 'Details',
    iconCls: 'icon-teacher',
    handler: doTimesheetsDetails
  }
];

//

function doTimesheetsClear()
{
  $('#divTimesheetsG').datagrid('clearSelections');
}

function doTimesheetsEdit()
{
  if (_.isNull(editingTimesheetIndex))
  {
    var row = $('#divTimesheetsG').datagrid('getSelected');
    if (row)
    {
      editingTimesheetIndex = $('#divTimesheetsG').datagrid('getRowIndex', row);
      $('#divTimesheetsG').datagrid('beginEdit', editingTimesheetIndex);

      var ed = $('#divTimesheetsG').datagrid('getEditor', {index: editingTimesheetIndex, field: 'email'});
      $(ed.target).focus();
    }
  }
}

function doTimesheetsCancel()
{
  if (!_.isNull(editingTimesheetIndex))
  {
    $('#divTimesheetsG').datagrid('cancelEdit', editingTimesheetIndex);
    editingTimesheetIndex = null;
  }
}

function doTimesheetsSave()
{
  if (!_.isNull(editingTimesheetIndex))
  {
    $('#divTimesheetsG').datagrid('endEdit', editingTimesheetIndex);

    var row = $('#divTimesheetsG').datagrid('getSelected');
    if (row)
      primus.emit('savestatusalert', {fguid: fguid, uuid: uuid, session: session, statusalertid: row.id, useruuid: row.uuid, status: row.status, email: row.email, mobile: row.mobile, pdata: {type: 'dostatusalertssave'}});

    editingTimesheetIndex = null;
  }
}

function doTimesheetsDetails()
{
}

// Creator...
function doTimesheetsTabWidgets()
{
  if (timesheetsTabWidgetsLoaded)
    return;

  // Refresh when these events occur...
  $('#divEvents').on
  (
    'listpayrollemployees',
    function(ev, args)
    {
      refreshFromCacheTimesheets(args.pdata);
    }
  );

  timesheetsTabWidgetsLoaded = true;

  //

  $('#divTimesheetsG').datagrid
  (
    {
      idField: 'id',
      //groupField: 'statusname',
      fitColumns: false,
      singleSelect: true,
      rownumbers: true,
      striped: true,
      toolbar: tbTimesheets,
      loader: function(param, success, error)
      {
        success({total: cache_timesheets.length, rows: cache_timesheets});
      },
      frozenColumns:
      [
        [
          {title: 'Employee', rowspan: 2, field: 'name',     width: 300, align: 'left',  resizable: true}
        ],
        [
        ]
      ],
      columns:
      [
        [
          {title: 'Hours',    colspan: 3},
          {title: 'Tax',      rowspan: 2, field: 'tax',      width: 150, align: 'right', resizable: true},
          {title: 'Super',    rowspan: 2, field: 'super',    width: 150, align: 'right', resizable: true},
          {title: 'Net Pay',  rowspan: 2, field: 'netpay',   width: 150, align: 'right', resizable: true},
          {title: 'Type',     rowspan: 2, field: 'type',     width: 150, align: 'right', resizable: true, formatter: function(value, row, index) {return doGetStringFromIdInObjArray(employmenttypes, value);}},
          {title: 'Modified', rowspan: 2, field: 'modified', width: 150, align: 'right', resizable: true},
          {title: 'By',       rowspan: 2, field: 'by',       width: 200, align: 'left',  resizable: true}
        ],
        [
          {title: 'Normal',               field: 'normal',   width: 200, align: 'right', resizable: true, editor: {type: 'numberbox', options: {precision: 2}}},
          {title: 'Overtime',             field: 'special',  width: 200, align: 'right', resizable: true, editor: {type: 'numberbox', options: {precision: 2}}},
          {title: 'Leave',                field: 'leave',    width: 200, align: 'left',  resizable: true}
        ]
      ],
      onRowContextMenu: function(e, index, row)
      {
        if (row)
        {
          e.preventDefault();
          $(this).datagrid('selectRow', index);
          $('#divTimesheetsMenuPopup').menu
          (
            'show',
            {
              left: e.pageX,
              top: e.pageY
            }
          );
        }
      },
      onDblClickCell: function(index, field, value)
      {
        if (_.isNull(editingTimesheetIndex))
        {
          editingTimesheetIndex = index;
          $(this).datagrid('beginEdit', editingTimesheetIndex);

          if (['normal', 'special'].indexOf(field) != -1)
            field = 'normal';

          var ed = $(this).datagrid('getEditor', {index: index, field: field});
          $(ed.target).focus();
        }
      }
    }
  );
}

function refreshFromCacheTimesheets(pdata)
{
  if (timesheetsTabWidgetsLoaded)
  {
    if (pdata.type == 'refresh')
      $('#divTimesheetsG').datagrid('reload');

    if (!_.isUndefined(pdata.timesheetid) && !_.isNull(pdata.timesheetid))
      $('#divTimesheetsG').datagrid('selectRecord', pdata.timesheetid);
  }
}
