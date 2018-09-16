function doDlgJournalNew()
{
  var editingIndex = null;
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
    }
  ];

  function doNew()
  {
    doSave();
    $('#divJournalNewG').datagrid('appendRow', {});
  }

  function doClear()
  {
    $('#divJournalNewG').datagrid('clearSelections');
  }

  function doEdit()
  {
    doGridGetSelectedRowData
    (
      'divJournalNewG',
      function(row)
      {
        doGridStartEdit
        (
          'divJournalNewG',
          editingIndex,
          function(row, index)
          {
            editingIndex = index;

            doGridGetEditor
            (
              'divJournalNewG',
              editingIndex,
              'amount',
              function(ed)
              {
              }
            );
          }
        );
      }
    );
  }

  function doCancel()
  {
    editingIndex = doGridCancelEdit('divJournalNewG', editingIndex);
  }

  function doSave()
  {
    doGridEndEditGetRow
    (
      'divJournalNewG',
      editingIndex,
      function(row)
      {
        doGridCalcTotals('divJournalNewG', 'amount');
      }
    );

    editingIndex = null;
  }

  function doRemove()
  {
    if (!doGridGetSelectedRowData
      (
        'divJournalNewG',
        function(row, rowindex)
        {
          doPromptOkCancel
          (
            'Remove entry?',
            function(result)
            {
              if (result)
              {
                $('#divJournalNewG').datagrid('deleteRow', rowindex);
                doGridCalcTotals('divJournalNewG', 'amount');
              }
            }
          );
        }
      ))
    {
      doShowError('Please select an entry to remove');
    }
  }

  function doReset()
  {
    $('#cbJournalNewType').combobox('clear');

    $('#fldJournalNewRefno').textbox('clear');
    $('#fldJournalNewComment').textbox('clear');

    $('#divJournalNewG').datagrid('loadData', []);

    doTextboxFocus('cbJournalNewType');
  }

  function doNewJournal(ev, args)
  {
    $('#dlgJournalNew').dialog('close');
  }

  // Need to destroy/re-create this event since it depends on arguments that change each call...
  $('#divEvents').on('newjournal', doNewJournal);

  $('#dlgJournalNew').dialog
  (
    {
      onClose: function()
      {
        $('#divEvents').off('newjournal', doNewJournal);
      },
      onOpen: function()
      {
        $('#cbJournalNewType').combobox
        (
          {
            valueField: 'id',
            textField: 'name',
            data: journaltypes
          }
        );

        $('#divJournalNewG').datagrid
        (
          {
            //idField: 'id',
            fitColumns: true,
            singleSelect: true,
            rownumbers: true,
            striped: true,
            toolbar: tb,
            showFooter: true,
            columns:
            [
              [
                {title: 'Debit Account',  field: 'debitaccountid',  width: 300, align: 'left',  resizable: true, editor: {type: 'combotree', options: {valueField: 'id', textField: 'name', data: cache_accounts, onSelect: function(record) {}}}, formatter: function(value, row) {return doGetNameFromTreeArray(cache_accounts, value);}},
                {title: 'Credit Account', field: 'creditaccountid', width: 300, align: 'left',  resizable: true, editor: {type: 'combotree', options: {valueField: 'id', textField: 'name', data: cache_accounts, onSelect: function(record) {}}}, formatter: function(value, row) {return doGetNameFromTreeArray(cache_accounts, value);}},
                {title: 'Amount',         field: 'amount',          width: 100, align: 'right', resizable: true, editor: {type: 'numberbox', options: {precision: 4}}},
                {title: 'Tax Code',       field: 'taxcodeid',       width: 200, align: 'left',  resizable: true, editor: {type: 'combobox',  options: {valueField: 'id', textField: 'name', data: cache_taxcodes, onSelect: function(record) {}}}, formatter: function(value, row) {return doGetStringFromIdInObjArray(cache_taxcodes, value);}},
              ]
            ],
            onDblClickCell: function(index, field, value)
            {
              doGridGetSelectedRowData
              (
                'divJournalNewG',
                function(row)
                {
                  doGridStartEdit
                  (
                    'divJournalNewG',
                    editingIndex,
                    function(row, index)
                    {
                      editingIndex = index;

                      doGridGetEditor
                      (
                        'divJournalNewG',
                        editingIndex,
                        'amount',
                        function(ed)
                        {
                        }
                      );
                    }
                  );
                }
              );
            }
          }
        );

        doReset();
      },
      buttons:
      [
        {
          text: 'Add',
          handler: function()
          {
            var type = $('#cbJournalNewType').combobox('getValue');
            var refno = $('#fldJournalNewRefno').textbox('getValue');
            var comments = $('#fldJournalNewComment').textbox('getValue');

            if (!_.isBlank(type))
            {
              var data = $('#divJournalNewG').datagrid('getData');
              var invalidIndex = null;
              var entries = [];

              data.rows.forEach
              (
                function(row, index)
                {
                  if (_.isBlank(row.debitaccountid) || _.isBlank(row.creditaccountid) || _.isBlank(row.amount) || (row.amount == 0.0))
                  {
                    // Only want first invalid row...
                    if (_.isNull(invalidIndex))
                      invalidIndex = index;
                  }
                  else
                  {
                    entries.push
                    (
                      {
                        debitaccountid: row.debitaccountid,
                        creditaccountid: row.creditaccountid,
                        amount: row.amount,
                        taxcodeid: row.taxcodeid
                      }
                    )
                  }
                }
              );

              if (_.isNull(invalidIndex))
                doServerDataMessage('newjournal', {type: type, refno: refno, comments: comments, entries: entries}, {type: 'refresh'});
              else
              {
                doShowError('Entry must have a debit/credit account and a non zero amount');
                $('#divJournalNewG').datagrid('selectRow', invalidIndex);
              }
            }
            else
              doShowError('Please select a journal entry type');
          }
        },
        {
          text: 'Reset',
          handler: function()
          {
            doReset();
          }
        },
        {
          text: 'Close',
          handler: function()
          {
            $('#dlgJournalNew').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}

