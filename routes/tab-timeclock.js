var timeclockTabWidgetsLoaded = false;

function doTimeclockTabWidgets()
{
  if (timeclockTabWidgetsLoaded)
    return;

  // Refresh when these events occur...
  $('#divEvents').on
  (
    'newrtap',
    function(ev, args)
    {
      if (_.isUndefined(args.data))
        return;

      var index = $('#divIncomingG').datagrid('getRowIndex', args.data.tag);
      if (index == -1)
      {
        $('#divIncomingG').datagrid
        (
          'insertRow',
          {
            index: 0,
            row:
            {
              tag: args.data.tag,
              name: args.data.lastname + ', ' + args.data.firstname,
              code: args.data.code,
              datecreated: args.data.datecreated
            }
          }
        );
      }
      else
      {
        $('#divIncomingG').datagrid
        (
          'updateRow',
          {
            index: index,
            row:
            {
              tag: args.data.tag,
              datecreated: args.data.datecreated
            }
          }
        );
      }
    }
  );

  $('#divEvents').on
  (
    'rtapinserted',
    function(ev, args)
    {
      primus.emit('listrtaps', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
    }
  );

  $('#divEvents').on
  (
    'insertrtap',
    function(ev, args)
    {
      primus.emit('listrtaps', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
    }
  );

  $('#divEvents').on
  (
    'listrtaps',
    function(ev, args)
    {
      $('#divIncomingG').datagrid('loadData', args.data.rs);
    }
  );

  timeclockTabWidgetsLoaded = true;

  $('#divIncomingG').datagrid
  (
    {
      idField: 'tag',
      fitColumns: true,
      singleSelect: true,
      rownumbers: true,
      striped: true,
      toolbar:
      [
        {
          text: 'Add',
          iconCls: 'icon-add',
          handler: function()
          {
            doDlgTimeclockNew();
          }
        },
        {
          text: 'Generate',
          iconCls: 'icon-download',
          handler: function()
          {
            window.open('/gettaps', '_blank');
          }
        },
        {
          text: 'Period',
          iconCls: 'icon-calendar',
          handler: function()
          {
            doDlgTimeclocPeriod();
          }
        },
        {
          text: 'Refresh',
          iconCls: 'icon-refreshlist',
          handler: function()
          {
            primus.emit('listrtaps', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
          }
        }
      ],
      columns:
      [
        [
          {title: 'TAG',  field: 'tag',         width: 200, align: 'left',  resizable: true},
          {title: 'Name', field: 'name',        width: 250, align: 'left',  resizable: true, formatter: function(value, row) {return row.lastname + ', ' + row.firstname;}},
          {title: 'Code', field: 'code',        width: 200, align: 'left',  resizable: true},
          {title: 'Date', field: 'datecreated', width: 180, align: 'right', resizable: true}
        ]
      ]
    }
  );
}
