var emailsTabWidgetsLoaded = false;

function doEmailsTabWidgets()
{
  if (emailsTabWidgetsLoaded)
    return;

  emailsTabWidgetsLoaded = true;

  // Refresh when these events occur...
  $('#divEvents').on
  (
    'emailhistory',
    function(ev, args)
    {
      var data = [];

      args.data.rs.forEach
      (
        function(e)
        {
          data.push
          (
            {
              id: doNiceId(e.id),
              copyno: e.copyno,
              orderno: doNiceString(e.orderno),
              recipients: doNiceString(e.recipients),
              subject: doNiceString(e.subject),
              orderid: doNiceId(e.orderid),
              datesent: doNiceDate(e.datesent),
              datecreated: doNiceDate(e.datecreated),
              by: doNiceTitleizeString(e.usercreated)
            }
          );
        }
      );

      $('#divEmailsG').datagrid('loadData', data);
    }
  );

  $('#divEvents').on
  (
    'emailsent',
    function(ev, args)
    {
      doServerMessage('emailhistory', {type: 'refresh'});
    }
  );

  $('#divEmailsG').datagrid
  (
    {
      idField: 'id',
      groupField: 'by',
      fitColumns: false,
      singleSelect: true,
      rownumbers: true,
      striped: true,
      view: groupview,
      frozenColumns:
      [
        [
          {title: 'Order #',    field: 'orderno',    width: 150, align: 'left',  resizable: true}
        ]
      ],
      columns:
      [
        [
          {title: 'Recipients', field: 'recipients', width: 300, align: 'left',  resizable: true},
          {title: 'Subject',    field: 'subject',    width: 300, align: 'left',  resizable: true},
          {title: 'Copy #',     field: 'copyno',     width: 150, align: 'right', resizable: true},
          {title: 'Sent',       field: 'datesent',   width: 150, align: 'right', resizable: true},
          {title: 'By',         field: 'by',         width: 200, align: 'left',  resizable: true}

        ]
      ],
      groupFormatter: function(value, rows)
      {
        if (_.isNull(value) || _.isBlank(value))
          return '<span class="email_group_item">' + rows.length + ' Email(s)</span>';

        return value + ' - ' + rows.length + ' Email(s)';
      }
    }
  );

  doServerMessage('emailhistory', {type: 'refresh'});
}
