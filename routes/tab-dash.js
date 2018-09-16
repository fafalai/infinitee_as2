var dashTabWidgetsLoaded = false;

function doDashTabSendMessage()
{
  var recipients = $('#cbDashChatRecipients').combobox('getValues');
  var msg = $('#fldDashChatMessage').textbox('getValue');

  if (!_.isBlank(msg))
    doServerDataMessage('chatmsg', {recipients: recipients, msg: msg}, {type: 'refresh'});
}

function doDashTabWidgets()
{
  var chats = [];
  var alerts = [];
  var orders = [];

  if (dashTabWidgetsLoaded)
    return;

  function doListOrders(ev, args)
  {
    doServerMessage('listorders', {type: 'refresh'});
  }

  // Refresh when these events occur...
  $('#divEvents').on
  (
    'orderstatusalert',
    function(ev, args)
    {
      doServerMessage('listalertsforme', {type: 'refresh'});
    }
  );

  $('#divEvents').on
  (
    'listalertsforme',
    function(ev, args)
    {
      alerts = [];

      args.data.rs.forEach
      (
        function(a)
        {
          alerts.push
          (
            {
              id: doNiceId(a.id),
              orderno: doNiceString(a.orderno),
              majorstatus: doGetStringFromIdInObjArray(orderstatustypes, a.status),
              by: doNiceString(a.usercreated),
              date: doNiceDate(a.datecreated)
            }
          );
        }
      );

      $('#divMyAlerts').datagrid('loadData', alerts);
    }
  );

  $('#divEvents').on
  (
    'listusers',
    function(ev, args)
    {
      $('#cbDashChatRecipients').combobox('loadData', cache_users);
    }
  );

  $('#divEvents').on
  (
    'listchatsforme',
    function(ev, args)
    {
      chats = [];

      args.data.rs.forEach
      (
        function(i)
        {
          chats.push
          (
            {
              id: doNiceId(i.id),
              message: doNiceComments(i.msg),
              date: i.datecreated,
              sender: i.senderuuid,
              recipient: i.recipientuuid,
              from: doNiceTitleizeString(i.sendername),
              to: doNiceTitleizeString(i.recipientname)
            }
          );
        }
      );

      $('#divChatG').datagrid('loadData', chats);
    }
  );

  $('#divEvents').on
  (
    'listorders',
    function(ev, args)
    {
      orders = [];

      args.data.rs.forEach
      (
        function(o)
        {
          orders.push
          (
            {
              id: doNiceId(o.id),
              orderno: doNiceString(o.orderno),
              name: doNiceString(o.name),
              pono: doNiceString(o.pono),
              attachmentid: doNiceId(o.attachmentid),
              attachmentname: doNiceString(o.attachmentname),
              attachmentimage: doNiceString(o.attachmentimage),
              majorstatus: doGetStringFromIdInObjArray(orderstatustypes, o.majorstatus),
              startdate: _.nicedatetodisplay(o.startdate),
              enddate: _.nicedatetodisplay(o.enddate),
              date: doNiceDateModifiedOrCreated(o.datemodified, o.datecreated),
              by: doNiceModifiedBy(o.datemodified, o.usermodified, o.usercreated)
            }
          );
        }
      );

      $('#divDashOrdersG').datagrid('loadData', orders);
    }
  );

  $('#divEvents').on('neworder', doListOrders);
  $('#divEvents').on('saveorder', doListOrders);
  $('#divEvents').on('expireorder', doListOrders);
  $('#divEvents').on('saveorderattachment', doListOrders);
  $('#divEvents').on('expireorderattachment', doListOrders);
  $('#divEvents').on('ordercreated', doListOrders);
  $('#divEvents').on('ordersaved', doListOrders);
  $('#divEvents').on('orderexpired', doListOrders);
  $('#divEvents').on('orderstatuscreated', doListOrders);
  $('#divEvents').on('orderattachmentcreated', doListOrders);
  $('#divEvents').on('orderattachmentsaved', doListOrders);
  $('#divEvents').on('orderattachmentexpired', doListOrders);

  $('#divEvents').on
  (
    'chatmsg',
    function(ev, args)
    {
      $('#fldDashChatMessage').textbox('clear');
      $('#cbDashChatRecipients').combobox('clear');
    }
  );

  $('#divEvents').on
  (
    'newchatmsg',
    function(ev, args)
    {
      doServerMessage('listchatsforme', {type: 'refresh'});
      doShowChat('New message(s)');
    }
  );

  $('#divEvents').on
  (
    'useronline',
    function(ev, args)
    {
      if (args.data.uuid != uuid)
        doShowInfo('[' + args.data.uname + '] is now online...');
    }
  );

  $('#divEvents').on
  (
    'useroffline',
    function(ev, args)
    {
      doShowInfo('[' + args.data.uname + '] is now onffline...');
}
);

$('#divEvents').on
(
  'userlogout',
    function(ev, args)
    {
      doShowInfo('[' + args.data.uname + '] has logged out...');
    }
  );

  dashTabWidgetsLoaded = true;

  var cardview = $.extend
  (
    {},
    $.fn.datagrid.defaults.view,
    {
      renderRow: function(target, fields, frozen, rowIndex, rowData)
      {
        var cc = [];

        if (!_.isUndefined(rowData) && !_.isUndefined(rowData.id))
        {
          var enddate = '';
          var img = _.isUndefined(rowData.attachmentimage) || _.isNull(rowData.attachmentimage) || _.isBlank(rowData.attachmentimage) ? '<td width="200px">&nbsp;</td>' : '  <td width="200px"><img src="' + rowData.attachmentimage + '" style="width: 200px;"/></td>';

          if (!_.isNull(rowData.enddate) && !_.isBlank(rowData.enddate))
          {
            var progress = '';
            var d = moment(rowData.enddate);
            var dr = moment(rowData.enddate).format('dddd MMMM Do YYYY');

            if (moment().isAfter(d))
              dr = '<span style="color: red"><strong>' + dr + '</strong></span>';

            enddate = '    <tr><td>Required By: </td><td>' + dr + '</td></tr>';

            if (!_.isNull(rowData.startdate) && !_.isBlank(rowData.startdate))
            {
              var totaldays = moment(rowData.enddate).diff(rowData.startdate, 'days');
              var elapsed = moment().diff(rowData.startdate, 'days');
              var perc = Math.round((elapsed * 100) / totaldays);

              if (perc > 100)
                perc = 100;

              var progress = '          <tr><td>Progress: </td><td>' +
                             '            <div style="width: 50%; border: 1px solid #ccc">' +
                             '              <div style="width: ' + perc + '%; background: ' + colour_mistyrose + '; color: black">' + perc + '%</div>' +
                             '            </div></td>' +
                             '          </tr>';
              enddate += progress;
            }
          }

          cc.push
          (
            '<td style="width: 800px; height: 210px; padding: 5px 5px; border: 0;">' +
            '  <table style="border: 0">' +
            '    <tr>' +
            img +
            '      <td>' +
            '        <table style="border: 0">' +
            '          <tr><td style="width: 180px">Name: </td><td>' + rowData.name + '</td></tr>' +
            '          <tr><td>Order #: </td><td>' + rowData.orderno + '</td></tr>' +
            '          <tr><td>P.O. #: </td><td>' + rowData.pono + '</td></tr>' +
            '          <tr><td>Status: </td><td style="color: ' + colour_olivedrab + '">' + rowData.majorstatus + '</td></tr>' +
            enddate +
            '          <tr><td>Modified: </td><td>' + rowData.date + '</td></tr>' +
            '          <tr><td>By: </td><td>' + rowData.by + '</td></tr>' +
            '        </table>' +
            '      </td>' +
            '    </tr>' +
            '  </table>' +
            '</td>'
          );
        }
        else
          cc.push('<td style="width: 800px; padding: 5px 5px; border: 0;">&nbsp;</td>');

        return cc.join('');
      }
    }
  );

  $('#divDashOrdersG').datagrid
  (
    {
      idField: 'id',
      fitColumns: true,
      singleSelect: true,
      rownumbers: false,
      loader: function(param, success, error)
      {
        success({total: orders.length, rows: orders});
      },
      view: cardview,
      onDblClickRow: function(index, row)
      {
        doSelectSalesTab('Orders', row.id);
      }
    }
  );

  $('#divMyAlerts').datagrid
  (
    {
      idField: 'id',
      groupField: 'orderno',
      fitColumns: false,
      singleSelect: false,
      rownumbers: false,
      striped: true,
      view: groupview,
      columns:
      [
        [
          {title: 'Order No', field: 'orderno',     width: 200, align: 'left',  resizable: true},
          {title: 'Status',   field: 'majorstatus', width: 200, align: 'left',  resizable: true},
          {title: 'By',       field: 'by',          width: 200, align: 'left',  resizable: true},
          {title: 'Date',     field: 'date',        width: 150, align: 'right', resizable: true}
        ]
      ],
      groupFormatter: function(value, rows)
      {
        return value + ' - ' + rows.length + ' Statuses';
      }
    }
  );

  $('#cbDashChatRecipients').combobox
  (
    {
      valueField: 'uuid',
      textField: 'name',
      data: cache_users,
      multiple: true
    }
  );

  $('#divChatG').datagrid
  (
    {
      idField: 'id',
      fitColumns: false,
      singleSelect: true,
      rownumbers: true,
      striped: true,
      loader: function(param, success, error)
      {
        success({total: chats.length, rows: chats});
      },
      frozenColumns:
      [
        [
          {title: 'From',    field: 'from',    width: 200,  align: 'left', resizable: true, styler: function(value, row, index) {return (row.sender == uuid) ? 'color: ' + colour_dodgerblue : 'color: #000000';}, formatter: function(value, row, index) {return (row.sender == uuid) ? 'Me' : value;}}
        ]
      ],
      columns:
      [
        [
          {title: 'Message', field: 'message', width: 400, align: 'left',  resizable: true},
          {title: 'When',    field: 'date',    width: 150, align: 'right', resizable: true, formatter: function(value, row, index) {return moment(value).fromNow();}},
          {title: 'To',      field: 'to',      width: 150, align: 'right', resizable: true, styler: function(value, row, index) {return (row.recipient == uuid) ? 'color: ' + colour_dodgerblue : 'color: #000000';}, formatter: function(value, row, index) {return (row.recipient == uuid) ? 'Me' : row.to;}}
        ]
      ]
    }
  );

  doServerMessage('listchatsforme', {type: 'refresh'});
  doServerMessage('listalertsforme', {type: 'refresh'});
  doServerMessage('listorders', {type: 'refresh'});
}
