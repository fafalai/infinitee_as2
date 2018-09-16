var journalsTabWidgetsLoaded = false;

function doJournalsTabWidgets()
{
  if (journalsTabWidgetsLoaded)
    return;

  journalsTabWidgetsLoaded = true;

  function doNew()
  {
    doDlgJournalNew();
  }

  function doClear()
  {
    $('#divJournalsG').datagrid('clearSelections');
  }

  function doReset()
  {
    doServerMessage('listjournals', {type: 'refresh'});
  }

  function doSearch()
  {
  }

  function doSaved()
  {
    doServerMessage('listjournals', {type: 'refresh'});
  }

  function doTest()
  {
    primus.emit('testjournal', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
  }

  // Refresh when these events occur...
  $('#divEvents').on
  (
    'listjournals',
    function(ev, args)
    {
      var data = [];

      args.data.rs.forEach
      (
        function(j)
        {
          data.push
          (
            {
              id: doNiceId(j.id),
              journalno: doNiceString(j.journalno),
              debitaccountid: doNiceId(j.debitaccountid),
              creditaccountid: doNiceId(j.creditaccountid),
              type: j.itype,
              amount: _.formatnumber(j.amount, 4),
              taxcodeid: doNiceId(j.taxcodeid),
              refno: doNiceString(j.refno),
              comments: doNiceString(j.comments),
              otherid: doNiceId(j.otherid),
              debitaccountcode: doNiceString(j.debitaccountcode),
              debitaccountname: doNiceString(j.debitaccountname),
              creditaccountcode: doNiceString(j.creditaccountcode),
              creditaccountname: doNiceString(j.creditaccountname),
              otherno: doNiceString(j.otherno),
              actual: doNiceDate(j.dateactual),
              created: doNiceDate(j.datecreated),
              by: doNiceTitleizeString(j.usercreated)
            }
          );
        }
      );

      $('#divJournalsG').datagrid('loadData', data);
    }
  );

  $('#divEvents').on('newjournal', doSaved);
  $('#divEvents').on('pordercompleted', doSaved);
  $('#divEvents').on('orderpaid', doSaved);

  $('#divEvents').on
  (
    'testjournal',
    function(ev, args)
    {
      var t = 'Debits: <br />';
      args.data.rs1.forEach
      (
        function(row)
        {
          t += row.typename + ': ' + row.debits + '<br />';
        }
      );

      t += '<br />Credits: <br />';
      args.data.rs2.forEach
      (
        function(row)
        {
          t += row.typename + ': ' + row.credits + '<br />';
        }
      );

      doShowInfo(t);
    }
  );

  $('#divEvents').on
  (
    'journalspopup',
    function(ev, args)
    {
      if (args == 'new')
        doNew();
      else if (args == 'clear')
        doClear();
      else if (args == 'reset')
        doReset();
      else if (args == 'search')
        doSearch();
      else if (args == 'test')
        doTest();
    }
  );

  $('#dtJournalFrom').datebox(dateboxParserObj);
  $('#dtJournalTo').datebox(dateboxParserObj);

  $('#divJournalsG').datagrid
  (
    {
      idField: 'id',
      fitColumns: false,
      singleSelect: true,
      rownumbers: true,
      striped: true,
      toolbar: '#tbJournal',
      columns:
      [
        [
          {title: 'Journal No.',   rowspan: 2,  field: 'journalno',         width: 150, align: 'left',  resizable: true},
          {title: 'Debit',         colspan: 2},
          {title: 'Credit',        colspan: 2},
          {title: 'Type',          rowspan: 2,  field: 'type',              width: 150, align: 'left',  resizable: true, formatter: function(value, row, index) {return doGetStringFromIdInObjArray(journaltypes, value);}},
          {title: 'Amount',        rowspan: 2,  field: 'amount',            width: 100, align: 'right', resizable: true, formatter: function(value, row, index) {return _.niceformatnumber(value);}},
          {title: 'TaxCode',       rowspan: 2,  field: 'taxcodeid',         width: 200, align: 'left',  resizable: true, formatter: function(value, row, index) {return doGetStringFromIdInObjArray(cache_taxcodes, value);}},
          {title: 'Reference No.', rowspan: 2,  field: 'refno',             width: 150, align: 'left',  resizable: true},
          /*
          {title: 'Order No.',     rowspan: 2,  field: 'otherno',           width: 150, align: 'left',  resizable: true},
          */
          {title: 'Date',          colspan: 3}
        ],
        [
          {title: 'Name',                       field: 'debitaccountid',    width: 200, align: 'left',  resizable: true, formatter: function(value, row, index) {return doGetNameFromTreeArray(cache_accounts, row.debitaccountid);}, styler: function(value, row, index) {return 'color: ' + colour_indianred;}},
          {title: 'Code',                       field: 'debitaccountcode',  width: 100, align: 'left',  resizable: true, styler: function(value, row, index) {return 'color: ' + colour_indianred;}},

          {title: 'Name',                       field: 'creditaccountid',   width: 200, align: 'left',  resizable: true, formatter: function(value, row, index) {return doGetNameFromTreeArray(cache_accounts, row.creditaccountid);}, styler: function(value, row, index) {return 'color: ' + colour_steelblue;}},
          {title: 'Code',                       field: 'creditaccountcode', width: 100, align: 'left',  resizable: true, styler: function(value, row, index) {return 'color: ' + colour_steelblue;}},

          {title: 'Active',                     field: 'actual',            width: 150, align: 'right', resizable: true, styler: function(value, row, index) {if (value != row.created) return 'color: ' + colour_orangered;}},
          {title: 'Created',                    field: 'created',           width: 150, align: 'right', resizable: true},
          {title: 'By',                         field: 'by',                width: 200, align: 'left',  resizable: true}
        ]
      ]
    }
  );

  doServerMessage('listjournals', {type: 'refresh'});
}

