var selectedSupplierIdAttachmentId = null;

function doDlgSupplierAttachments(supplier)
{
  var editingIndex = null;
  var tb =
  [
    {
      text: 'Clear',
      iconCls: 'icon-clear',
      handler: doClear
    },
    {
      text: 'Edit',
      iconCls: 'icon-edit',
      handler: doEdit
    },
    {
      text: 'Cancel',
      iconCls: 'icon-cancel',
      handler: doCancel
    },
    {
      text: 'Save',
      iconCls: 'icon-save',
      handler: doSave
    },
    {
      text: 'Remove',
      iconCls: 'icon-remove',
      handler: doRemove
    },
    {
      text: 'Download',
      iconCls: 'icon-download',
      handler: doDownload
    }
  ];

  function doClear()
  {
    $('#divSupplierAttachmentsG').datagrid('clearSelections');
  }

  function doEdit()
  {
    doGridStartEdit
    (
      'divSupplierAttachmentsG',
      editingIndex,
      function(row, index)
      {
        editingIndex = index;

        doGridGetEditor
        (
          'divSupplierAttachmentsG',
          editingIndex,
          'description',
          function(ed)
          {
          }
        );
      }
    );
  }

  function doCancel()
  {
    editingIndex = doGridCancelEdit('divSupplierAttachmentsG', editingIndex);
  }

  function doSave()
  {
    doGridEndEditGetRow
    (
      'divSupplierAttachmentsG',
      editingIndex,
      function(row)
      {
        doServerDataMessage('savesupplierattachment', {supplierattachmentid: row.id, description: row.description}, {type: 'refresh'});
      }
    );

    editingIndex = null;
  }

  function doRemove()
  {
    if (!doGridGetSelectedRowData
      (
        'divSupplierAttachmentsG',
        function(row)
        {
          doPromptOkCancel
          (
            'Remove attachment ' + row.description + '?',
            function(result)
            {
              if (result)
                doServerDataMessage('expiresupplierattachment', {supplierattachmentid: row.id}, {type: 'refresh'});
            }
          );
        }
      ))
    {
      doShowError('Please select an attachment to remove');
    }
  }

  function doDownload()
  {
    doGridGetSelectedRowData
    (
      'divSupplierAttachmentsG',
      function(row)
      {
        doThrowClientAttachment(row.id);
      }
    );
  }

  function doList(ev, args)
  {
    if (supplier.id == args.data.supplierid)
      doServerDataMessage('listsupplierattachments', {supplierid: supplier.id}, {type: 'refresh'});
  }

  function doLoad(ev, args)
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
            name: doNiceString(a.name),
            description: doNiceString(a.description),
            mimetype: '<a href="javascript:void(0);" onClick="doThrowSupplierAttachment(' + a.id + ');">' + mapMimeTypeToImage(a.mimetype) + '</a>',
            size: doNiceString(a.size),
            //image: doNiceString(a.image),
            image: '<image src="' + a.image + '" width="35px">',
            date: doNiceDateModifiedOrCreated(a.datemodified, a.datecreated),
            by: doNiceModifiedBy(a.datemodified, a.usermodified, a.usercreated)
          }
        );
      }
    );

    $('#divSupplierAttachmentsG').datagrid('loadData', data);
  }

  function doEventsHandler(ev, args)
  {
    if (args == 'edit')
      doEdit();
    else if (args == 'remove')
      doRemove();
    else if (args == 'download')
      doDownload();
  }

  $('#divEvents').on('savesupplierattachment', doList);
  $('#divEvents').on('expiresupplierattachment', doList);
  $('#divEvents').on('supplierattachmentcreated', doList);
  $('#divEvents').on('supplierattachmentsaved', doList);
  $('#divEvents').on('supplierattachmentexpired', doList);
  $('#divEvents').on('listsupplierattachments', doLoad);
  $('#divEvents').on('supplierattachmentspopup', doEventsHandler);

  $('#dlgSupplierAttachments').dialog
  (
    {
      title: 'Attachments for ' + supplier.name,
      onClose: function()
      {
        $('#divEvents').off('savesupplierattachment', doList);
        $('#divEvents').off('expiresupplierattachment', doList);
        $('#divEvents').off('supplierattachmentcreated', doList);
        $('#divEvents').off('supplierattachmentsaved', doList);
        $('#divEvents').off('supplierattachmentexpired', doList);
        $('#divEvents').off('listsupplierattachments', doLoad);
        $('#divEvents').off('supplierattachmentspopup', doEventsHandler);
      },
      onOpen: function()
      {
        selectedSupplierIdAttachmentId = supplier.id;

        $('#divSupplierAttachmentsG').datagrid
        (
          {
            idField: 'id',
            fitColumns: true,
            singleSelect: true,
            rownumbers: false,
            striped: true,
            toolbar: tb,
            columns:
            [
              [
                {title: 'Name',        field: 'name',        width: 200, align: 'left',   resizable: true},
                {title: 'Description', field: 'description', width: 300, align: 'left',   resizable: true, editor: 'text'},
                {title: 'Type',        field: 'mimetype',    width: 100, align: 'center', resizable: true},
                {title: 'Size',        field: 'size',        width: 150, align: 'right',  resizable: true, formatter: function(value, row) {return filesize(value, {base: 10});}},
                {title: 'Modified',    field: 'date',        width: 150, align: 'right',  resizable: true},
                {title: 'By',          field: 'by',          width: 200, align: 'left',   resizable: true}
              ]
            ],
            onRowContextMenu: function(e, index, row)
            {
              doGridContextMenu('divSupplierAttachmentsG', 'divSupplierAttachmentsMenuPopup', e, index, row);
            },
            onDblClickCell: function(index, field, value)
            {
              doGridStartEdit
              (
                'divSupplierAttachmentsG',
                editingIndex,
                function(row, index)
                {
                  editingIndex = index;

                  doGridGetEditor
                  (
                    'divSupplierAttachmentsG',
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

        doServerDataMessage('listsupplierattachments', {supplierid: supplier.id}, {type: 'refresh'});
      },
      buttons:
      [
        {
          text: 'Close',
          handler: function()
          {
            $('#dlgSupplierAttachments').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}
