var chatsTabWidgetsLoaded = false;
var grid_messages = [];

// Creator...

function doChatTabWidgets()
{
  if (chatsTabWidgetsLoaded)
    return;

  chatsTabWidgetsLoaded = true;

  $('#divChatG').datagrid
  (
    {
      idField: 'id',
      fitColumns: false,
      singleSelect: true,
      rownumbers: false,
      striped: true,
      loader: function(param, success, error)
      {
        var data = [];

        grid_messages.forEach
        (
          function(m, idx)
          {
            data.push
            (
              {
                id: idx,
                message: m.message,
                date: moment(m.date).fromNow(),
                by: m.by,
                senderuuid: m.senderuuid
              }
            );
          }
        );
        success({total: data.length, rows: data});
      },
      frozenColumns:
      [
        [
          {title: 'By',      field: 'by',      width: 200,  align: 'left', resizable: true, styler: function(value, row, index) {return (row.senderuuid == uuid) ? 'color: ' + colour_dodgerblue : 'color: #000000';}}
        ]
      ],
      columns:
      [
        [
          {title: 'Message', field: 'message', width: 400, align: 'left',  resizable: true},
          {title: 'Date',    field: 'date',    width: 150, align: 'right', resizable: true}
        ]
      ]
    }
  );
}

function doAddNewChatMsg(message)
{
  grid_messages.push
  (
    {
      message: message.msg,
      date: message.date,
      by: message.by,
      senderuuid: message.senderuuid
    }
  );

  $('#divChatG').datagrid('reload');
}

function doSendMessage()
{
  var msg = $('#fldClientsMessage').textbox('getValue');
  primus.emit('chatmsg', {fguid: fguid, uuid: uuid, session: session, msg: msg, pdata: {type: 'dosendmessage'}});
  $('#fldClientsMessage').textbox('clear');
}

