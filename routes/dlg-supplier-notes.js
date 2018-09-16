function doDlgSupplierNotes(supplier)
{
  var editingIndex = null;
  var originalContents = null;
  var editorPanel = null;
  var editorId = null;

  function doNew()
  {
    doServerDataMessage('newsuppliernote', {supplierid: supplier.id}, {type: 'refresh'});
  }

  function doClear()
  {
    $('#divSupplierNotesG').datagrid('clearSelections');
  }

  function doEdit()
  {
    doGridGetSelectedRowData
    (
      'divSupplierNotesG',
      function(row, rowIndex)
      {
        if (_.isNull(editingIndex))
        {
          editingIndex = rowIndex;

          editorId = 'divSupplierNote-id-' + row.id;
          originalContents = $('#' + editorId).html();
          editorPanel = new nicEditor({fullPanel : true, iconsPath : '/js/nicedit/nicEditorIcons.gif'}).panelInstance(editorId, {hasPanel: true});
        }
      }
    );
  }

  function doCancel()
  {
    editingIndex = doGridCancelEdit
    (
      'divSupplierNotesG',
      editingIndex,
      function()
      {
        editorPanel.removeInstance(editorId);

        // Perform manual cancel since editor replaces text directly into DIV...
        $('#' + editorId).html(originalContents);

        originalContents = null;
        editorPanel = null;
      }
    );
  }

  function doSave()
  {
    doGridEndEditGetRow
    (
      'divSupplierNotesG',
      editingIndex,
      function(row)
      {
        var notes = nicEditors.findEditor(editorId).getContent();

        doServerDataMessage('savesuppliernote', {suppliernoteid: row.id, notes: notes}, {type: 'refresh'});

        editorPanel.removeInstance(editorId);
        originalContents = null;
        editorPanel = null;
        editingIndex = null;
      }
    );
  }

  function doSearch()
  {
    doDlgNoteSearch
    (
      function(text)
      {
        doServerDataMessage('searchsuppliernote', {supplierid: supplier.id, words: text}, {type: 'refresh'});
      },
      function()
      {
        doServerDataMessage('listsuppliernotes', {supplierid: supplier.id}, {type: 'refresh'});
      }
    );
  }

  function doSaved(ev, args)
  {
    if (supplier.id == args.data.supplierid)
      doServerDataMessage('listsuppliernotes', {supplierid: supplier.id}, {type: 'refresh', supplieroteid: args.data.suppliernoteid});
  }

  function doLoad(ev, args)
  {
    data = [];

    args.data.rs.forEach
    (
      function(n)
      {
        data.push
        (
          {
            id: doNiceId(n.id),
            notes: doNiceString(n.notes),
            date: doNiceDateModifiedOrCreated(n.datemodified, n.datecreated),
            by: doNiceModifiedBy(n.datemodified, n.usermodified, n.usercreated)
          }
        );
      }
    );

    $('#divSupplierNotesG').datagrid('loadData', data);

    if (!_.isUndefined(args.pdata.suppliernoteid) && !_.isNull(args.pdata.suppliernoteid))
      $('#divSupplierNotesG').datagrid('selectRecord', args.pdata.suppliernoteid);
  }

  function doSearch(ev, args)
  {
    args.data.rs.forEach
    (
      function(n)
      {
        $('#divSupplierNotesG').datagrid('selectRecord', n.id);

        /*
        var index = $('#divClientNotesG').datagrid('getRowIndex', n.id);

        if (index)
          $('#divClientNotesG').datagrid('highlightRow', index);
        */
      }
    );
  }

  function doEventsHandler(ev, args)
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
    else if (args == 'search')
      doSearch();
  }

  $('#divEvents').on('newsuppliernote', doSaved);
  $('#divEvents').on('savesuppliernote', doSaved);
  $('#divEvents').on('suppliernotecreated', doSaved);
  $('#divEvents').on('suppliernotesaved', doSaved);
  $('#divEvents').on('listsuppliernotes', doLoad);
  $('#divEvents').on('searchsuppliernote', doSearch);
  $('#divEvents').on('suppliernotespopup', doEventsHandler);

  $('#dlgSupplierNotes').dialog
  (
    {
      title: 'Notes for ' + supplier.name,
      onClose: function()
      {
        $('#divEvents').off('newsuppliernote', doSaved);
        $('#divEvents').off('savesuppliernote', doSaved);
        $('#divEvents').off('suppliernotecreated', doSaved);
        $('#divEvents').off('suppliernotesaved', doSaved);
        $('#divEvents').off('listsuppliernotes', doLoad);
        $('#divEvents').off('searchsuppliernote', doSearch);
        $('#divEvents').off('suppliernotespopup', doEventsHandler);
      },
      onOpen: function()
      {
        $('#divSupplierNotesG').datagrid
        (
          {
            idField: 'id',
            fitColumns: true,
            singleSelect: true,
            rownumbers: false,
            toolbar: '#tbSupplierNotes',
            view: $.extend
            (
              {},
              $.fn.datagrid.defaults.view,
              {
                renderRow: function(target, fields, frozen, rowIndex, rowData)
                {
                  var cc = [];

                  if (!frozen && rowData.id)
                  {
                    cc.push
                    (
                      '<td style="width: 950px;; padding: 5px 5px; border: 0;">' +
                      '  <div style="float: left; margin-left: 10px;">' +
                      '    <p><span class="c-label">Modified: ' + '</span>' + rowData.date + '</p>' +
                      '    <p><span class="c-label">By: ' + '</span>' + rowData.by + '</p>' +
                      '  </div>' +
                      '  <div style="clear: both;"></div>' +
                      '  <div id="divSupplierNote-id-' + rowData.id + '" style="float: left; margin-left: 10px; margin-right: 10px; width: 100%; height: 100px; border: 1px dashed #ddd">' + rowData.notes + '</div> ' +
                      '</td>'
                    );
                  }
                  else
                    cc.push('<td style="width: 100%; padding: 5px 5px; border: 0;"></td>');

                  return cc.join('');
                }
              }
            ),
            onDblClickRow: function(index, row)
            {
              if (_.isNull(editingIndex))
              {
                if (row)
                {
                  editingIndex = index;

                  editorId = 'divSupplierNote-id-' + row.id;
                  originalContents = $('#' + editorId).html();
                  editorPanel = new nicEditor({fullPanel : true, iconsPath : '/js/nicedit/nicEditorIcons.gif'}).panelInstance(editorId, {hasPanel: true});
                }
              }
            }
          }
        );

        doServerDataMessage('listsuppliernotes', {supplierid: supplier.id}, {type: 'refresh', supplieroteid: args.data.suppliernoteid});
      },
      buttons:
      [
        {
          text: 'Close',
          handler: function()
          {
            editingIndex = doGridCancelEdit('divSupplierNotesG', editingIndex);
            $('#dlgSupplierNotes').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}
