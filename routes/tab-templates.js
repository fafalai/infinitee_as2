var templatesTabWidgetsLoaded = false;
var selectedPrintTemplateId = null;

function doPrintTemplatesTabSearch(value, name)
{
  var txt = value.toUpperCase();

  for (var t = 0; t < cache_printtemplates.length; t++)
  {
    var description = cache_printtemplates[t].description.toUpperCase();
    var name = cache_printtemplates[t].name.toUpperCase();

    if ((description.indexOf(txt) > -1) || (name.indexOf(txt) > -1))
    {
      var id = cache_printtemplates[t].id;
      var index = $('#divPrintTemplatesG').datagrid('getRowIndex', id);

      $('#divPrintTemplatesG').datagrid('selectRow', index);
      break;
    }
  }
}

function doTemplatesTabWidgets()
{
  var editingIndex = null;

  if (templatesTabWidgetsLoaded)
    return;

  function doClear()
  {
    $('#divPrintTemplatesG').datagrid('clearSelections');
    selectedPrintTemplateId = null;
  }

  function doEdit()
  {
    doGridStartEdit
    (
      'divPrintTemplatesG',
      editingIndex,
      function(row, index)
      {
        editingIndex = index;

        doGridGetEditor
        (
          'divPrintTemplatesG',
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
    editingIndex = doGridCancelEdit('divPrintTemplatesG', editingIndex);
  }

  function doSave()
  {
    doGridEndEditGetRow
    (
      'divPrintTemplatesG',
      editingIndex,
      function(row)
      {
        primus.emit('saveprinttemplate', {fguid: fguid, uuid: uuid, session: session, printtemplateid: row.id, description: row.description, pdata: {type: 'refresh'}});
      }
    );

    editingIndex = null;
  }

  function doRemove()
  {
    if (!doGridGetSelectedRowData
      (
        'divPrintTemplatesG',
        function(row)
        {
          doPromptOkCancel
          (
            'Remove template ' + row.description + '?',
            function(result)
            {
              if (result)
                primus.emit('expireprinttemplate', {fguid: fguid, uuid: uuid, session: session, printtemplateid: row.id, pdata: {type: 'refresh'}});
            }
          );
        }
      ))
    {
      noty({text: 'Please select a template to remove', type: 'error', timeout: 4000});
    }
  }

  function doListPrintTemplates()
  {
    primus.emit('listprinttemplates', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
  }

  // Refresh when these events occur...
  $('#divEvents').on
  (
    'listprinttemplates',
    function(ev, args)
    {
      $('#divPrintTemplatesG').datagrid('reload');

      if (!_.isUndefined(args.pdata.printtemplateid) && !_.isNull(args.pdata.printtemplateid))
        $('#divPrintTemplatesG').datagrid('selectRecord', args.pdata.printtemplateid);
    }
  );

  $('#divEvents').on('saveprinttemplate', doListPrintTemplates);
  $('#divEvents').on('expireprinttemplate', doListPrintTemplates);
  $('#divEvents').on('printtemplatecreated', doListPrintTemplates);
  $('#divEvents').on('printtemplatesaved', doListPrintTemplates);
  $('#divEvents').on('printtemplateexpired', doListPrintTemplates);

  $('#divEvents').on
  (
    'printtemplatespopup',
    function(ev, args)
    {
      if (args == 'clear')
        doClear();
      else if (args == 'edit')
        doEdit();
      else if (args == 'cancel')
        doCancel();
      else if (args == 'save')
        doSave();
      else if (args == 'remove')
        doRemove();
    }
  );

  templatesTabWidgetsLoaded = true;

  $('#divPrintTemplatesG').datagrid
  (
    {
      idField: 'id',
      fitColumns: false,
      singleSelect: true,
      rownumbers: true,
      striped: true,
      toolbar: '#tbPrintTemplates',
      loader: function(param, success, error)
      {
        success({total: cache_printtemplates.length, rows: cache_printtemplates});
      },
      columns:
      [
        [
          {title: 'Name',        field: 'name',        width: 200, align: 'left',   resizable: true},
          {title: 'Description', field: 'description', width: 300, align: 'left',   resizable: true, editor: 'text'},
          {title: 'Type',        field: 'mimetype',    width: 100, align: 'center', resizable: true},
          {title: 'Size',        field: 'size',        width: 150, align: 'right',  resizable: true, formatter: function(value, row, index) {if (!_.isUndefined(value)) return filesize(value, {base: 10});}},
          {title: 'Modified',    field: 'date',        width: 150, align: 'right',  resizable: true},
          {title: 'By',          field: 'by',          width: 200, align: 'left',   resizable: true}
        ]
      ],
      onRowContextMenu: function(e, index, row)
      {
        doGridContextMenu('divPrintTemplatesG', 'divPrintTemplatesMenuPopup', e, index, row);
      },
      onClickRow: function(index, row)
      {
        selectedPrintTemplateId = row.id;
      },
      onDblClickCell: function(index, field, value)
      {
        doGridStartEdit
        (
          'divPrintTemplatesG',
          editingIndex,
          function(row, index)
          {
            editingIndex = index;

            doGridGetEditor
            (
              'divPrintTemplatesG',
              editingIndex,
              'description',
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
