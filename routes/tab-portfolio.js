var portfolioTabWidgetsLoaded = false;

function doPortfolioTabWidgets()
{
  if (portfolioTabWidgetsLoaded)
    return;

  portfolioTabWidgetsLoaded = true;

  // Refresh when these events occur...
  $('#divEvents').on
  (
    'newrtap',
    function(ev, args)
    {
    }
  );

  $('#divEvents').on
  (
    'rtapinserted',
    function(ev, args)
    {
    }
  );

  $('#divEvents').on
  (
    'insertrtap',
    function(ev, args)
    {
    }
  );

  $('#divEvents').on
  (
    'listrtaps',
    function(ev, args)
    {
    }
  );

  $('#divEvents').on
  (
    'pvdepositadded',
    function(ev, args)
    {
      var classa = '';
      var classb = '';
      var classc = '';
      var classd = '';
      var balance = '';
      var date = new moment().format('YYYY-MM-DD HH:mm:ss');

      if (args.classtype == 1)
        classa = args.amount;
      else if (args.classtype == 2)
        classb = args.amount;
      else if (args.classtype == 3)
        classc = args.amount;
      else
        classd = args.amount;

      doGetGridFindId
      (
        'divPortfolioG',
        args.memberid,
        function(err, index)
        {
          if (!err)
          {
            $('#divPortfolioG').datagrid('updateRow', {index: index, row: {memberid: args.memberid, balance: balance, classa: classa, classb: classb, classc: classc, classd: classd, date: date}});
          }
          else
          {
            balance = args.amount;
            $('#divPortfolioG').datagrid('appendRow', {memberid: args.memberid, balance: balance, classa: classa, classb: classb, classc: classc, classd: classd, date: date});
          }
        }
      );
    }
  );

  $('#divPortfolioG').datagrid
  (
    {
      idField: 'memberid',
      fitColumns: true,
      singleSelect: true,
      rownumbers: true,
      striped: true,
      toolbar:
      [
        {
          text: 'Add Deposit',
          iconCls: 'icon-add',
          handler: function()
          {
            doDlgPVDepositAdd();
          }
        },
        {
          text: 'Generate',
          iconCls: 'icon-download',
          handler: function()
          {
          }
        },
        {
          text: 'Period',
          iconCls: 'icon-calendar',
          handler: function()
          {
          }
        },
        {
          text: 'Refresh',
          iconCls: 'icon-refreshlist',
          handler: function()
          {
            primus.emit('listportfolio', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
          }
        }
      ],
      columns:
      [
        [
          {title: 'Member',  field: 'memberid',    width: 200, align: 'left',  resizable: true, formatter: function(value, row) {return doGetTextFromTreeArray(cache_employees, value);}},
          {title: 'Balance', field: 'balance',     width: 200, align: 'right', resizable: true},
          {title: 'Class A', field: 'classa',      width: 200, align: 'right', resizable: true},
          {title: 'Class B', field: 'classb',      width: 200, align: 'right', resizable: true},
          {title: 'Class C', field: 'classc',      width: 200, align: 'right', resizable: true},
          {title: 'Class D', field: 'classd',      width: 200, align: 'right', resizable: true},
          {title: 'Date',    field: 'date',        width: 180, align: 'right', resizable: true}
        ]
      ],
      onDblClickCell: function(index, field, value)
      {
        doGetGridGetRowDataByIndex
        (
          'divPortfolioG',
          index,
          function(row)
          {
          }
        );
      }
    }
  );
}
