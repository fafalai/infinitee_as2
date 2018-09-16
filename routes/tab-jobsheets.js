
var jobsheetsTabWidgetsLoaded = false;

function doJobSheetsTabWidgets()
{
  if (jobsheetsTabWidgetsLoaded)
    return;

  jobsheetsTabWidgetsLoaded = true;

  function doSaved()
  {
    doServerMessage('tpccorderbuilds', {type: 'refresh'});
  }

  function doOrder()
  {
    if (!doGridGetSelectedRowData
      (
        'divJobSheetsG',
        function(row)
        {
          doSelectSalesTab('Orders', row.orderid);
        }
      ))
    {
      doShowError('Please select an order to view');
    }
  }

  function doClear()
  {
    $('#divJobSheetsG').datagrid('clearSelections');
  }

  function doPrint()
  {
    if (!doGridGetSelectedRowData
      (
        'divJobSheetsG',
        function(row)
        {
          doServerDataMessage('tpccprintjobsheet', {jobsheetid: row.jobsheetid}, {type: 'refresh'});
        }
      ))
    {
      doShowError('Please select a job to print');
    }
  }

  function doEmail()
  {
    if (!doGridGetSelectedRowData
      (
        'divJobSheetsG',
        function(row)
        {
        }
      ))
    {
      doShowError('Please select a job to email');
    }
  }

  function doSearch()
  {
    doDlgTPCCJobSearch();
  }

  // Refresh when these events occur...
  $('#divEvents').on
  (
    'tpccorderbuilds',
    function(ev, args)
    {
      var data = [];

      args.data.rs.forEach
      (
        function(b)
        {
          // Real inventory entries append to list of locations we just populated...
          data.push
          (
            {
              orderid: doNiceId(b.orderid),
              orderno: doNiceString(b.orderno),
              jobsheetid: doNiceId(b.jobsheetid),
              jobsheetno: doNiceString(b.jobsheetno),
              datestarted: doNiceDate(b.datestarted),
              datecompleted: doNiceDate(b.datecompleted),
              clientname: doNiceString(b.clientname),
              productid: doNiceId(b.productid),
              productcode: doNiceString(b.productcode),
              buildtemplateid: doNiceId(b.buildtemplateid),
              qtyordered: _.formatnumber(b.qtyordered, 4),
              qtybuilt: _.formatnumber(b.qtybuilt, 4),
              dateordered: doNiceDate(b.dateordered),
              userordered: doNiceTitleizeString(b.userordered),
              userbuilt: doNiceTitleizeString(b.userbuilt),
              imagename: doNiceString(b.imagename),
              imagemimetype: doNiceString(b.imagemimetype)
            }
          );
        }
      );

      $('#divJobSheetsG').datagrid('loadData', data);
    }
  );

  function doShowThumb(t)
  {
    if (_.isUndefined(t) || _.isBlank(t) || _.isNull(t))
      return '';
    return '<img width="20" height="20" src="' + t + '" style="max-width: 100%; max-height: 20px;"/>';
  }

  $('#divEvents').on('neworderbuild', doSaved);
  $('#divEvents').on('saveorrderbuild', doSaved);
  $('#divEvents').on('expireorderbuild', doSaved);
  $('#divEvents').on('listorders', doSaved);
  $('#divEvents').on('buildinventory', doSaved);
  $('#divEvents').on('inventorybuilt', doSaved);
  $('#divEvents').on('tpccsavejobsheet', doSaved);
  $('#divEvents').on('tpccjobsheetcreated', doSaved);
  $('#divEvents').on('tpccjobsheetexpired', doSaved);
  $('#divEvents').on('tpccjobsheetsaved', doSaved);

  $('#divEvents').on
  (
    'orderbuildspopup',
    function(ev, args)
    {
      if (args == 'build')
        doBuild();
    }
  );

  $('#divEvents').on
  (
    'selectjobsheetbyorderid',
    function(ev, args)
    {
      // TODO: This doesn't work if TAB hasn't already been opened/populated yet...
      if (!_.isUndefined(args.orderid) && !_.isNull(args.orderid))
      {
        // Find the first jobsheet with this order (since could be several and we don't know which one at this stage)
        var data = $('#divJobSheetsG').datagrid('getData');

        for (var d = 0; d < data.rows.length; d++)
        {
          if (data.rows[d].orderid == args.orderid)
          {
            $('#divJobSheetsG').datagrid('selectRecord', data.rows[d].jobsheetid);
            break;
          }
        }
      }
    }
  );

  $('#divEvents').on
  (
    'selectjobsheetbyorderno',
    function(ev, args)
    {
      // TODO: This doesn't work if TAB hasn't already been opened/populated yet...
      if (!_.isUndefined(args.jobsheetno) && !_.isNull(args.jobsheetno))
      {
        var data = $('#divJobSheetsG').datagrid('getData');

        var f = new Fuse(data.rows, {keys: ['jobsheetno'], caseSensitive: false, shouldSort: true});
        var results = [];

        results = f.search(args.jobsheetno);

        if (results.length > 0)
          doDlgJobSheet(results[0].jobsheetid);
      }
    }
  );

  $('#divEvents').on
  (
    'jobsheetspopup',
    function(ev, args)
    {
      if (args == 'order')
        doOrder();
      else if (args == 'clear')
        doClear();
      else if (args == 'print')
        doPrint();
      else if (args == 'email')
        doEmail();
      else if (args == 'search')
        doSearch();
    }
  );

  $('#divJobSheetsG').datagrid
  (
    {
      idField: 'jobsheetid',
      fitColumns: false,
      singleSelect: true,
      rownumbers: true,
      striped: true,
      toolbar: '#tbJobSheets',
      showFooter: true,
      fit: true,
      autoRowHeight: false,
      onLoadSuccess: function()
      {
        $(this).datagrid('enableDnd');
        //$(this).datagrid('getPanel').find('.datagrid-row').css('height', '40px');
      },
      frozenColumns:
      [
        [
          {title: 'Order #',      rowspan: 2, field: 'orderno',      width: 120, align: 'left',   resizable: true},
          {title: 'Name',         rowspan: 2, field: 'clientname',   width: 300, align: 'left',   resizable: true}
        ],
        [
        ]
      ],
      columns:
      [
        [
          {title: 'Job #',        rowspan: 2, field: 'jobsheetno',    width: 120, align: 'left',   resizable: true},
          {title: 'Repeat?',      rowspan: 2, field: 'isrepeat',      width: 80,  align: 'center', resizable: true, formatter: function(value, row) {return mapBoolToImage(value);}},
          // {title: 'Image',        rowspan: 2, field: 'imagemimetype', width: 50,  align: 'center', resizable: true, formatter: function(value, row) {return mapMimeTypeToImage(value);}},
          {title: 'Thumb',        rowspan: 2, field: 'imagename',     width: 50,  align: 'center', resizable: true, formatter: function(value, row) {return doShowThumb(value);}},
          {title: 'Product',      rowspan: 2, field: 'productcode',   width: 200, align: 'left',   resizable: true},
          // {title: 'Status',       rowspan: 2, field: 'majorstatus',   width: 200, align: 'left',   resizable: true},
          {title: 'Qty',          colspan: 2},

          {title: 'Date',         rowspan: 2, field: 'dateordered',   width: 150, align: 'right',  resizable: true},
          {title: 'By',           rowspan: 2, field: 'userordered',   width: 200, align: 'left',   resizable: true}
        ],
        [
          {title: 'Ordered',                  field: 'qtyordered',    width: 100, align: 'right',  resizable: true, formatter: function(value, row) {return _.niceformatqty(value, 0);}},
          {title: 'Built',                    field: 'qtybuilt',      width: 100, align: 'right',  resizable: true, formatter: function(value, row) {return _.niceformatqty(value, 0);}}
        ]
      ],
      onDrop: function(target, source, point)
      {
        // Reorder rows...
        var data = $('#divJobSheetsG').datagrid('getData');
        var jobs = [];

        data.rows.forEach
        (
          function(d)
          {
            jobs.push({orderid: d.orderid, jobsheetid: d.jobsheetid});
          }
        );
        console.log(jobs);

        doServerDataMessage('tpccjobsheetsort', {jobs: jobs}, {type: 'refresh'});
      },
      onRowContextMenu: function(e, index, row)
      {
        doGridContextMenu('divJobSheetsG', 'divJobSheetsMenuPopup', e, index, row);
      },
      onDblClickCell: function(index, field, value)
      {
        doGetGridGetRowDataByIndex
        (
          'divJobSheetsG',
          index,
          function(row)
          {
            doDlgJobSheet(row.jobsheetid);
          }
        );
      }
    }
  );

  doServerMessage('tpccorderbuilds', {type: 'refresh'});
}
