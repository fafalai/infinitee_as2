var selectedClientIdAttachmentId = null;

function doDlgClientAttachments(client)
{
  var editingIndex = null;
  var data = [];
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
    $('#divClientAttachmentsG').datagrid('clearSelections');
  }

  function doEdit()
  {
    doGridStartEdit
    (
      'divClientAttachmentsG',
      editingIndex,
      function(row, index)
      {
        editingIndex = index;

        doGridGetEditor
        (
          'divClientAttachmentsG',
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
    editingIndex = doGridCancelEdit('divClientAttachmentsG', editingIndex);
  }

  function doSave()
  {
    doGridEndEditGetRow
    (
      'divClientAttachmentsG',
      editingIndex,
      function(row)
      {
        primus.emit('saveclientattachment', {fguid: fguid, uuid: uuid, session: session, clientattachmentid: row.id, description: row.description, pdata: {type: 'refresh'}});
      }
    );

    editingIndex = null;
  }

  function doRemove()
  {
    if (!doGridGetSelectedRowData
      (
        'divClientAttachmentsG',
        function(row)
        {
          doPromptOkCancel
          (
            'Remove attachment ' + row.description + '?',
            function(result)
            {
              if (result)
                doServerDataMessage('expireclientattachment', {clientattachmentid: row.id}, {type: 'refresh'});
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
      'divClientAttachmentsG',
      function(row)
      {
        doThrowClientAttachment(row.id);
      }
    );
  }

  function doList(ev, args)
  {
    if (client.id == args.data.clientid)
      doServerDataMessage('listclientattachments', {clientid: client.id}, {type: 'refresh'});
  }

  function doLoad(ev, args)
  {
    //data = [];

    // args.data.rs.forEach
    // (
    //   function(a)
    //   {
    //     data.push
    //     (
    //       {
    //         id: doNiceId(a.id),
    //         name: doNiceString(a.name),
    //         description: doNiceString(a.description),
    //         mimetype: '<a href="javascript:void(0);" onClick="doThrowClientAttachment(' + a.id + ');">' + mapMimeTypeToImage(a.mimetype) + '</a>',
    //         size: doNiceString(a.size),
    //         //image: doNiceString(a.image),
    //         image: '<image src="' + a.image + '" width="35px">',
    //         date: doNiceDateModifiedOrCreated(a.datemodified, a.datecreated),
    //         by: doNiceModifiedBy(a.datemodified, a.usermodified, a.usercreated)
    //       }
    //     );
    //   }
    // );

    $('#divClientAttachmentsG').datagrid('loadData', cache_buildtemplates);
  }

  function doEventsHandler(ev, args)
  {
    if (args == 'edit')
      doEdit();
    else if (args == 'remove')
      doRemove();
    else if (args == 'download')
      doDownload();
    else if (args == 'newFolder')
      doNewFolder();
    else if (args == 'uploadFile')
      doUploadFile();
  }

  $('#divEvents').on('saveclientattachment', doList);
  $('#divEvents').on('expireclientattachment', doList);
  $('#divEvents').on('clientattachmentcreated', doList);
  $('#divEvents').on('clientattachmentsaved', doList);
  $('#divEvents').on('clientattachmentexpired', doList);
  $('#divEvents').on('listclientattachments', doLoad);
  $('#divEvents').on('clientattachmentspopup', doEventsHandler);

  $('#dlgClientAttachments').dialog
  (
    {
      title: 'Attachments for ' + client.name,
      onClose: function()
      {
        $('#divEvents').off('saveclientattachment', doList);
        $('#divEvents').off('expireclientattachment', doList);
        $('#divEvents').off('clientattachmentcreated', doList);
        $('#divEvents').off('clientattachmentsaved', doList);
        $('#divEvents').off('clientattachmentexpired', doList);
        $('#divEvents').off('listclientattachments', doLoad);
        $('#divEvents').off('clientattachmentspopup', doEventsHandler);
      },
      onOpen: function()
      {
        selectedClientIdAttachmentId = client.id;

        $('#divClientAttachmentsG').datagrid
        (
          {
            idField: 'id',
            fitColumns: true,
            singleSelect: true,
            rownumbers: false,
            striped: true,
            toolbar: tb,
            loader: function(param, success, error)
            {
              success({total: data.length, rows: data});
            },
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
              doGridContextMenu('divClientAttachmentsG', 'divClientAttachmentsMenuPopup', e, index, row);
            },
            onDblClickCell: function(index, field, value)
            {
              doGridStartEdit
              (
                'divClientAttachmentsG',
                editingIndex,
                function(row, index)
                {
                  editingIndex = index;

                  doGridGetEditor
                  (
                    'divClientAttachmentsG',
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

        doServerDataMessage('listclientattachments', {clientid: client.id}, {type: 'refresh'});
      },
      buttons:
      [
        {
          text: 'Close',
          handler: function()
          {
            doCancel();
            $('#dlgClientAttachments').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}
