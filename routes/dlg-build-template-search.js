function doDlgBuildTemplateSearch(callback)
{
  function doSearch(ev, args)
  {
    var data = [];

    args.data.rs.forEach
    (
      function(p)
      {
        data.push
        (
          {
            id: doNiceId(p.id),
            name: doNiceString(p.name),
            code: doNiceString(p.code)
          }
        );
      }
    );

    $('#divBuildTemplateSelectG').datagrid('loadData', data);
    $('#divBuildTemplateSelectG').datagrid('reloadFooter', [{name: '<span class="totals_footer">' + data.length + ' found</span>'}]);
  }

  // Need to destroy/re-create this event since it depends on arguments that change each call...
  $('#divEvents').on('buildtemplatesearch', doSearch);

  $('#dlgBuildTemplateSearch').dialog
  (
    {
      onClose: function()
      {
        $('#divEvents').off('buildtemplatesearch', doSearch);
      },
      onOpen: function()
      {
        $('#fldSearchBuildTemplateText').textbox
        (
          {
            iconCls: 'icon-product',
            iconAlign: 'left',
            onChange: function(newValue, oldValue)
            {
              var maxhistory = $('#cbSearchBuildTemplateMaxHistory').combobox('getValue');

              doServerDataMessage('buildtemplatesearch', {value: newValue, maxhistory: maxhistory}, {type: 'refresh'});
            }
          }
        );

        $('#divBuildTemplateSelectG').datagrid
        (
          {
            idField: 'id',
            fitColumns: false,
            singleSelect: true,
            rownumbers: true,
            striped: true,
            showFooter: true,
            columns:
            [
              [
                {title: 'Code',     field: 'code',     width: 200, align: 'left', resizable: true},
                {title: 'Name',     field: 'name',     width: 300, align: 'left', resizable: true}
              ]
            ],
            onDblClickCell: function(index, field, value)
            {
              doGridGetSelectedRowData
              (
                'divBuildTemplateSelectG',
                function(row)
                {
                  if (!_.isUndefined(callback) && !_.isNull(callback))
                    callback(row);
                }
              );

              $('#dlgBuildTemplateSearch').dialog('close');
            }
          }
        );

        doTextboxFocus('fldSearchBuildTemplateText');
      },
      buttons:
      [
        {
          text: 'Select',
          handler: function()
          {
            if (!_.isUndefined(callback) && !_.isNull(callback))
            {
              if (!doGridGetSelectedRowData
                (
                  'divBuildTemplateSelectG',
                  function(row)
                  {
                    callback(row);
                    $('#dlgBuildTemplateSearch').dialog('close');
                  }
                ))
              {
                noty({text: 'Please select a build template...', type: 'error', timeout: 4000});
              }
            }
          }
        },
        {
          text: 'Close',
          handler: function()
          {
            $('#dlgBuildTemplateSearch').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}

