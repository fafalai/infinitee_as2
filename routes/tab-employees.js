var employeesTabWidgetsLoaded = false;

function doEmployeesTabSearch(value, name)
{
  doSearchCodeNameInTree('divEmployeesTG', value);
}

function doEmployeesTabWidgets()
{
  if (employeesTabWidgetsLoaded)
    return;

  employeesTabWidgetsLoaded = true;

  function doNewRoot()
  {
    doDlgEmployeeNew(null, null);
  }

  function doNew()
  {
    doTreeGridGetSelectedRowData
    (
      'divEmployeesTG',
      function(row)
      {
        doDlgEmployeeNew(row.id, null);
      }
    );
  }

  function doClear()
  {
    $('#divEmployeesTG').treegrid('unselectAll');
  }

  function doRemove()
  {
    if (!doTreeGridGetSelectedRowData
      (
        'divEmployeesTG',
        function(row)
        {
          doPromptYesNoCancel
          (
            'Remove ' + row.firstname + ' ' + row.lastname + ' and ALL subemployees (Yes) or ONLY this employee (No)?',
            function(result)
            {
              if (!_.isNull(result))
                doServerDataMessage('expireemployee', {employeeid: row.id, cascade: result}, {type: 'refresh'});
            }
          );
        }
      ))
    {
      doShowError('Please select an employee to remove');
    }
  }

  function doCountrySelected(record)
  {
    doTreeGridGetSelectedRowEditor
    (
      'divEmployeesTG',
      'statename',
      function(ed)
      {
        // Fetch matching states for this country...
        var states = doGetStatesFromCountry(record.country);

        $(ed.target).combobox('loadData', states);
      }
    );
  }

  function doRemoveParent()
  {
    doTreeGridGetSelectedRowData
    (
      'divEmployeesTG',
      function(row)
      {
        doServerDataMessage('changeemployeeparent', {employeeid: row.id, parentid: null}, {type: 'refresh'});
      }
    );
  }

  function doSaved(ev, args)
  {
    doServerMessage('listemployees', {type: 'refresh', employeeid: args.data.employeeid});
  }

  // Refresh when these events occur...
  $('#divEvents').on
  (
    'listemployees',
    function(ev, args)
    {
      $('#divEmployeesTG').treegrid('reload');

      doExpandTreeToId('divEmployeesTG', args.pdata.employeeid);
    }
  );

  $('#divEvents').on('newemployee', doSaved);
  $('#divEvents').on('saveemployee', doSaved);
  $('#divEvents').on('expireemployee', doSaved);
  $('#divEvents').on('changeemployeeparent', doSaved);

  $('#divEvents').on
  (
    'checkclientcode',
    function(ev, args)
    {
      var employees = args.data.rs;

      if (employees.length > 0)
        doShowError('Employee code [' + employees[0].code + '] is already assigned to [' + employees[0].name + ']');
    }
  );

  $('#divEvents').on
  (
    'employeespopup',
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

  $('#divEmployeesTG').treegrid
  (
    {
      idField: 'id',
      treeField: 'lastname',
      lines: true,
      collapsible: true,
      fitColumns: false,
      autoRowHeight: false,
      rownumbers: true,
      striped: true,
      toolbar: '#tbEmployees',
      showFooter: true,
      sortName: 'lastname',
      sortOrder: 'asc',
      remoteSort: false,
      multiSort: true,
      loader: function(param, success, error)
      {
        success({total: cache_employees.length, rows: cache_employees});
        $(this).treegrid('reloadFooter', [{lastname: '<span class="totals_footer">' + doGetCountTreeArray(cache_employees) + ' Employees</span>'}]);
      },
      frozenColumns:
      [
        [
          {title: 'Last Name',  field: 'lastname',  width: 150, align: 'left',  resizable: true, editor: 'text', sortable: true},
          {title: 'First Name', field: 'firstname', width: 150, align: 'left',  resizable: true, editor: 'text', sortable: true}
        ]
      ],
      columns:
      [
        [
          {title: 'Code',       field: 'code',      width: 200, align: 'left',   resizable: true, sortable: true},
          {title: 'Alt Code',   field: 'altcode',   width: 200, align: 'left',   resizable: true, sortable: true},
          {title: 'Female?',    field: 'gender',    width: 80,  align: 'center', resizable: true, formatter: function(value, row) {return mapBoolToImage(value);}},
          {title: 'Email',      field: 'email1',    width: 200, align: 'left',   resizable: true},
          {title: 'Phone',      field: 'phone1',    width: 200, align: 'left',   resizable: true},

          {title: 'Modified',   field: 'date',      width: 150, align: 'right',  resizable: true, sortable: true},
          {title: 'By',         field: 'by',        width: 200, align: 'left',   resizable: true, sortable: true}
        ]
      ],
      onContextMenu: function(e, row)
      {
        doTreeGridContextMenu('divEmployeesTG', 'divEmployeesMenuPopup', e, row);
      },
      onLoadSuccess: function(row)
      {
        $(this).treegrid('enableDnd');
      },
      onClickRow: function(row)
      {
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
        doServerDataMessage('changeemployeeparent', {employeeid: source.id, parentid: target.id}, {type: 'refresh'});
      },
      onDblClickCell: function(field, row)
      {
        doDlgEmployeeNew(row.parentid, row.id);
      }
    }
  );
}

