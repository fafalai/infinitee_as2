function doSelectTemplatesTabWidgets()
{
  var tbSelectTemplates =
  [
    {
      text: 'Select All',
      iconCls: 'icon-add',
      handler: doSelectTemplatesSelectAll
    },
    {
      text: 'Select None',
      iconCls: 'icon-remove',
      handler: doSelectTemplatesSelectNone
    }
  ];

  function doReset()
  {
    $('#cbSelectTemplateClients').combotree('clear');
    $('#fldSelectProductTemplatesCode').textbox('clear');
    doSelectTemplatesSelectNone();
  }

  function doSelectTemplatesSelectAll()
  {
    var data = $('#divSelectProductTemplatesTG').treegrid('getRoots');

    if (!_.isNull(data))
    {
      data.forEach
      (
        function(row)
        {
          $('#divSelectProductTemplatesTG').treegrid('checkNode', row.id);
        }
      );
    }
  }

  function doSelectTemplatesSelectNone()
  {
    var data = $('#divSelectProductTemplatesTG').treegrid('getRoots');

    if (!_.isNull(data))
    {
      data.forEach
      (
        function(row)
        {
          $('#divSelectProductTemplatesTG').treegrid('uncheckNode', row.id);
        }
      );
    }
  }

  function doSaved(ev, args)
  {
    $('#dlgSelectProductTemplates').dialog('close');
    // console.log("Here dlg build");
    doServerDataMessage('listbuildtemplate_ByparentID', {buildtemplateid : args.data.buildtemplateid}, {type: 'refresh'});
  }

  $('#divEvents').on('newbuildtemplate', doSaved);

  $('#dlgSelectProductTemplates').dialog
  (
    {
      onClose: function()
      {
        $('#divEvents').off('newbuildtemplate', doSaved);

        doReset();
      },
      onOpen: function()
      {
        $('#cbSelectTemplateClients').combotree
        (
          {
            valueField: 'id',
            textField: 'name',
            limitToList: true,
            data: cache_clients,
            onSelect: function(row)
            {
              $('#fldSelectProductTemplatesCode').textbox('setValue', row.code);
            }
          }
        );

        $('#divSelectProductTemplatesTG').treegrid
        (
          {
            idField: 'id',
            treeField: 'code',
            checkbox: true,
            lines: true,
            collapsible: true,
            fitColumns: false,
            autoRowHeight: false,
            rownumbers: false,
            striped: true,
            toolbar: tbSelectTemplates,
            loader: function(param, success, error)
            {
              success({total: cache_producttemplates.length, rows: cache_producttemplates});
            },
            frozenColumns:
            [
              [
                {title: 'Code',       field: 'code',        width: 200, align: 'left',  resizable: true, editor: 'text'}
              ]
            ],
            columns:
            [
              [
                {title: 'Name',       field: 'name',        width: 300, align: 'left',  resizable: true},
                {title: 'Client',     field: 'clientid',    width: 200, align: 'left',  resizable: true, formatter: function(value, row) {return doGetStringFromIdInObjArray(cache_clients, value);}},
                {title: 'Qty',        field: 'qty',         width: 150, align: 'right', resizable: true},
                {title: '#Products',  field: 'numproducts', width: 150, align: 'right', resizable: true}
              ]
            ]
          }
        );

        doTextboxFocus('cbSelectTemplateClients');
      },
      buttons:
      [
        {
          text: 'Create',
          handler: function()
          {
            var clientid = $('#cbSelectTemplateClients').combotree('getValue');
            var code = $('#fldSelectProductTemplatesCode').textbox('getValue');
            var data = $('#divSelectProductTemplatesTG').treegrid('getCheckedNodes');
            var templates = [];

            if (!_.isBlank(code))
            {
              data.forEach
              (
                function(t)
                {
                  var kids = $('#divSelectProductTemplatesTG').treegrid('getChildren', t.id);
                  // Only send off nodes without any children (leaf nodes)...
                  if (_.isNull(kids) || (kids.length == 0))
                    templates.push(t.id);
                }
              );

              if (templates.length > 0)
                doServerDataMessage('newbuildtemplate', {code: code, clientid: clientid, templates: templates}, {type: 'refresh'});
              else
                doShowError('Please select at least one template to copy...');
            }
            else
              doMandatoryTextbox('Please enter a template code', 'fldSelectProductTemplatesCode');
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
            $('#dlgSelectProductTemplates').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}
