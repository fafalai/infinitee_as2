var buildtemplatesTabWidgetsLoaded = false;
let pageSize = 50;
let inputValue = '';

function doBuildTemplatesTabSearch(value, name)
{
  doShowGridLoading('divBuildTemplatesTG');
  inputValue = value;
  if(doNiceString(inputValue) == "")
  {
    doServerDataMessage('listbuildtemplates_pagination', {pageSize: pageSize, offset: 0}, {type: 'refresh'});

    $('#divBuildTemplatesTG').treegrid('getPager').pagination({
      pageSize: pageSize,
      showPageList : false,
      showRefresh: false,
      pageNumber: 1,
      
      onSelectPage:function(pageNumber, pageSize){
        doShowGridLoading('divBuildTemplatesTG');
        let offset = (parseInt(pageNumber)-1) * parseInt(pageSize);
        doServerDataMessage('listbuildtemplates_pagination',{pageSize: pageSize, offset: offset}, {type:'refresh'});
      }
    });
  }
  else
  {
    // doServerDataMessage('searchbuilttemplates_bycodeandname', {inputValue: value, pageSize : pageSize, offset : 0}, {type: 'refresh'});
    doServerDataMessage('searchrootbuildtemplates_bycodeandname', {inputValue:inputValue, pageSize: pageSize, offset: 0}, {type: 'refresh'});

    $('#divBuildTemplatesTG').treegrid('getPager').pagination({
      pageSize: pageSize,
      showPageList : false,
      showRefresh: false,
      pageNumber: 1,
  
      onSelectPage:function(pageNumber, pageSize){
        doShowGridLoading('divBuildTemplatesTG');
        let offset = (parseInt(pageNumber)-1) * parseInt(pageSize);
        // doServerDataMessage('searchbuilttemplates_bycodeandname', {inputValue: value, pageSize : pageSize, offset : offset}, {type: 'refresh'});
        doServerDataMessage('searchrootbuildtemplates_bycodeandname', {inputValue:value, pageSize: pageSize, offset: offset}, {type: 'refresh'});
      }
    });

  // doServerDataMessage('searchrootbuildtemplates_bycodeandname', {inputValue:value}, {type: 'refresh'});
  }
  // doSearchCodeNameInTree('divBuildTemplatesTG', value);
}

function doBuildTemplatesTabWidgets()
{
  var editingId = null;

  if (buildtemplatesTabWidgetsLoaded)
    return;

  buildtemplatesTabWidgetsLoaded = true;

  function doNewRoot()
  {
    doSelectTemplatesTabWidgets();
  }

  function doNew()
  {
    doTreeGridGetSelectedRowData
    (
      'divBuildTemplatesTG',
      function(row)
      {
        doSelectTemplatesTabWidgets(row.id);
      }
    );
  }

  function doNewProduct()
  {
    doTreeGridGetSelectedRowData
    (
      'divBuildTemplatesTG',
      function(row)
      {
        doDlgProductFromBuildTemplate(row.id, row.code, row.name, row.clientid);
      }
    );
  }

  function doClear()
  {
    $('#divBuildTemplatesTG').treegrid('unselectAll');
  }

  function doEdit()
  {
    doTreeGridStartEdit
    (
      'divBuildTemplatesTG',
      editingId,
      function(row, id)
      {
        editingId = id;

        doTreeGridGetEditor
        (
          'divBuildTemplatesTG',
          editingId,
          'name',
          function(ed)
          {
          }
        );
      }
    );
  }

  function doCancel()
  {
    editingId = doTreeGridCancelEdit('divBuildTemplatesTG', editingId);
  }

  function doSave()
  {
    doTreeGridEndEditGetRow
    (
      'divBuildTemplatesTG',
      editingId,
      function(row)
      {
        doServerDataMessage
        (
          'savebuildtemplate',
          {
            buildtemplateid: row.id,
            clientid: row.clientid,
            taxcodeid: row.taxcodeid,
            price: row.price,
            qty: row.qty
          },
          {type: 'refresh'}
        );
      }
    );

    editingId = null;
  }

  function doRemove()
  {
    if (!doTreeGridGetSelectedRowData
      (
        'divBuildTemplatesTG',
        function(row)
        {
          doPromptYesNoCancel
          (
            'Remove ' + row.clientname + ' and ALL subtemplates (Yes) or ONLY this template (No)?',
            function(result)
            {
              if (!_.isNull(result))
                doServerDataMessage('expirebuildtemplate', {buildtemplateid: row.id, cascade: result}, {type: 'refresh'});
            }
          );
        }
      ))
    {
      doShowError('Please select a template to remove');
    }
  }

  function doDuplicate()
  {
    doTreeGridGetSelectedRowData
    (
      'divBuildTemplatesTG',
      function(row)
      {
        doServerDataMessage('duplicatebuildtemplate', {buildtemplateid: row.id}, {type: 'refresh'});
      }
    );
  }

  function doDetails()
  {
    if (!doTreeGridGetSelectedRowData
      (
        'divBuildTemplatesTG',
        function(row)
        {
          doDlgBuildTemplateDetails(row);
        }
      ))
    {
      doShowError('Please select a template to view/edit details');
    }
  }

  function doBuild()
  {
    if (!doTreeGridGetSelectedRowData
      (
        'divBuildTemplatesTG',
        function(row)
        {
          doDlgTemplateBuild(row);
        }
      ))
    {
      doShowError('Please select a template to build');
    }
  }

  function doRemoveParent()
  {
    doTreeGridGetSelectedRowData
    (
      'divBuildTemplatesTG',
      function(row)
      {
        doServerDataMessage('changebuildtemplateparent', {buildtemplateid: row.id, parentid: null}, {type: 'refresh'});
      }
    );
  }

  function doCalcUnitCost(value, row, index)
  {
    var qty = _.toBigNum(row.qty);

    if (!qty.isZero())
    {
      var u = _.toBigNum(row.totalprice).dividedBy(qty);
      return _.niceformatnumber(u);
    }
  }

  function doSearch()
  {
    doDlgBuildTemplateSearch
    (
      function(template)
      {
        //primus.emit('listbuiltemplates', {fguid: fguid, uuid: uuid, session: session, productcategoryid: product.categoryid, pdata: {type: 'refresh'}});
      }
    );
  }

  function doMasterSync()
  {
    doPromptOkCancel
    (
      'This will replace all products of all build templates with the products from the corresponding master templates. Are you sure?',
      function(result)
      {
        if (result)
          doServerMessage('syncbuildtemplatestomaster', {type: 'refresh'});
      }
    );
  }

  function doSaved(ev, args)
  {
    let pageNumber = 1;
    if (args.data.pageNumber > 1) {
      pageNumber = args.data.pageNumber;
      $('#divBuildTemplatesTG').treegrid('gotoPage',args.data.pageNumber);
    }

    let offset = (parseInt(pageNumber)-1) * parseInt(pageSize);

    if (inputValue === "") {
      doServerDataMessage('listbuildtemplates_pagination',{pageSize: pageSize, offset: offset}, {type:'refresh'});  
    } else {
      doServerDataMessage('searchrootbuildtemplates_bycodeandname', {inputValue:inputValue, pageSize: pageSize, offset: offset}, {type: 'refresh'});
    }

    inputValue = '';
    // doServerDataMessage('listbuildtemplate_ByparentID', {buildtemplateid : args.data.buildtemplateid}, {type: 'refresh'});
    // doServerMessage('listbuildtemplateroots', {type: 'refresh', buildtemplateid: args.data.buildtemplateid});
  }

  function doFooter()
  {
    $('#divBuildTemplatesTG').treegrid('reloadFooter', [{code: '<span class="totals_footer">' + doGetCountTreeArray(cache_buildtemplates) + ' Templates</span>'}]);
  }

  $('#divEvents').on('newbuildtemplate', doSaved);
  $('#divEvents').on('savebuildtemplate', doSaved);
  $('#divEvents').on('changebuildtemplateparent', doSaved);
  $('#divEvents').on('duplicatebuildtemplate', doSaved);
  $('#divEvents').on('expirebuildtemplate', doSaved);
  $('#divEvents').on('syncbuildtemplatestomaster', doSaved);
  $('#divEvents').on('productupdated', doSaved);
  $('#divEvents').on('syncbuildtemplatesaved', doSaved);
  
  $('#divEvents').on
  (
    'listbuildtemplates_search',
    function(ev, args)
    {
      $('#divBuildTemplatesTG').treegrid('loadData', cache_buildtemplates);
      doFooter();

      doExpandTreeToId('divBuildTemplatesTG', args.pdata.buildtemplateid);

      doShowGridLoaded('divBuildTemplatesTG');
    }
  );

  $('#divEvents').on
  (
    'buildtemplategetchildren',
    function(ev, args)
    {
      $('#divBuildTemplatesTG').treegrid('loadData', cache_buildtemplates);
      doFooter();

      doExpandTreeToId('divBuildTemplatesTG', args.pdata.buildtemplateid, true);
      doShowGridLoaded('divBuildTemplatesTG');
    }
  );

  $('#divEvents').on
  (
    'buildtemplatespopup',
    function(ev, args)
    {
      if (args == 'newroot')
        doNewRoot();
      else if (args == 'new')
        doNew();
      else if (args == 'clear')
        doClear();
      else if (args == 'edit')
        doEdit();
      else if (args == 'cancel')
        doCancel();
      else if (args == 'save')
        doSave();
      else if (args == 'remove')
        doRemove();
      else if (args == 'removeparent')
        doRemoveParent();
      else if (args == 'duplicate')
        doDuplicate();
      else if (args == 'details')
        doDetails();
      else if (args == 'mastersync')
        doMasterSync();
      else if (args == 'search')
        doSearch();
      else if (args == 'build')
        doBuild();
      else if (args == 'newproduct')
        doNewProduct();
    }
  );

  $('#divEvents').on('searchbuilttemplates_bycodeandname', (ev, args) => {
    let totalCount = parseInt(args.data.totalCount);
    $('#divBuildTemplatesTG').treegrid('loadData', {total: totalCount, rows: cache_buildtemplates});
    doFooter();

    // treePaganiation.pagination('select',1);
    doShowGridLoaded('divBuildTemplatesTG');

  });

  $('#divEvents').on('searchrootbuildtemplates_bycodeandname', (ev, args) => {
    let totalCount = parseInt(args.data.totalCount);
    $('#divBuildTemplatesTG').treegrid('loadData', {total: totalCount, rows: cache_buildtemplates});
    doFooter();

    doShowGridLoaded('divBuildTemplatesTG');
  });

  $('#divEvents').on('listbuildtemplates_pagination', (ev, args) => {

    let totalCount = parseInt(args.data.totalCount);
    // let pageNumber = 1;
    if (args.data.pageNumber > 1) {
      $('#divBuildTemplatesTG').treegrid('gotoPage',args.data.pageNumber);
    }
    // if(args.data.pageNumber)
    $('#divBuildTemplatesTG').treegrid('loadData', {total: totalCount, rows: cache_buildtemplates});
    
    doFooter();

    doShowGridLoaded('divBuildTemplatesTG');
    
  });

  $('#divBuildTemplatesTG').treegrid
  (
    {
      pagination: true,
      idField: 'id',
      treeField: 'code',
      lines: true,
      collapsible: true,
      fitColumns: false,
      autoRowHeight: false,
      rownumbers: true,
      striped: true,
      toolbar: '#tbBuildTemplates',
      showFooter: true,
      loader: function(param, success, error)
      {
        success({total: cache_buildtemplates.length, rows: cache_buildtemplates});
        doFooter();
      },
      frozenColumns:
      [
        [
          {title: 'Code',       field: 'code',                   width: 200, align: 'left',  resizable: true, editor: 'text'}
        ]
      ],
      columns:
      [
        [
          {title: 'Name',       field: 'name',                    width: 300, align: 'left',  resizable: true, editor: 'text'},
          {title: 'Tax Code',   field: 'taxcodeid',               width: 200, align: 'left',  resizable: true, editor: {type: 'combobox', options: {valueField: 'id', textField: 'name', data: cache_taxcodes, onSelect: function(record) {/*console.log(record);*/}}}, formatter: function(value, row) {return doGetStringFromIdInObjArray(cache_taxcodes, value);}},
          {title: 'Price',      field: 'price',                   width: 150, align: 'right', resizable: true, editor: {type: 'numberbox', options: {groupSeparator: ',', precision: 2}}, formatter: function(value, row, index) {return _.niceformatnumber(value);}},
          {title: 'Qty',        field: 'qty',                     width: 150, align: 'right', resizable: true, editor: {type: 'numberbox', options: {groupSeparator: ',', precision: 0}}, formatter: function(value, row, index) {return _.niceformatqty(value);}},
          {title: 'Total Cost', field: 'totalprice',              width: 150, align: 'right', resizable: true, formatter: function(value, row, index) {return _.niceformatnumber(value);}},
          {title: '#Products',  field: 'numproducts',             width: 150, align: 'right', resizable: true},
          {title: 'Unit Cost',  field: 'unitcost',                width: 150, align: 'right', resizable: true, formatter: function(value, row, index) {return doCalcUnitCost(value, row, index);}},
          {title: 'Master',     field: 'producttemplateheaderid', width: 300, align: 'left',  resizable: true, formatter: function(value, row, index) {return doGetNameFromTreeArray(cache_producttemplates, value);}},
          {title: 'Modified',   field: 'date',                    width: 150, align: 'right', resizable: true},
          {title: 'By',         field: 'by',                      width: 200, align: 'left',  resizable: true}
        ]
      ],
      onBeforeLoad: function (row, param) {
        // if (!row) { // load top level rows
        //   param.id = 0; // set id=0, indicate to load new page rows
        // }
      },
      onContextMenu: function(e, row)
      {
        doTreeGridContextMenu("divBuildTemplatesTG", "divBuildTemplatesMenuPopup", e, row);
      },
      onLoadSuccess: function(row)
      {
        $(this).treegrid("enableDnd", row ? row.id : null);
      },
      onBeforeDrag: function(source)
      {
        if (editingId)
          return false;
        
        return true;
      },
      onDragOver: function(target, source)
      {
        return true;
      },
      onBeforeDrop: function(target, source, point)
      {
        let pageNumber = $('#divBuildTemplatesTG').treegrid('getPager').data('pagination').options.pageNumber;
        doServerDataMessage('changebuildtemplateparent', {buildtemplateid: source.id, parentid: target.id, pageNumber: pageNumber}, {type: 'refresh'});
        // return true;
      },
      onDrop: function(target, source, point)
      {
        // let pageNumber = $('#divBuildTemplatesTG').treegrid('getPager').data('pagination').options.pageNumber;
        // doServerDataMessage('changebuildtemplateparent', {buildtemplateid: source.id, parentid: target.id, pageNumber: pageNumber}, {type: 'refresh'});
      },
      onClickRow: function(row)
      {
        // Only expand on root nodes..
        if (_.isNull(row.parentid))
        {
          var children = $('#divBuildTemplatesTG').treegrid('getChildren', row.id);

          if (_.isUndefined(children) || _.isNull(children) || (children.length == 0))
          {
            // Either not yet expanded or no children...
            doShowGridLoading('divBuildTemplatesTG');
            doServerDataMessage('buildtemplategetchildren', {buildtemplateid: row.id}, {type: 'refresh'});
          }
        }
      },
      onDblClickCell: function(field, row)
      {
        // doTreeGridStartEdit
        // (
        //   'divBuildTemplatesTG',
        //   editingId,
        //   function(row, id)
        //   {
        //     editingId = id;

        //     if (['numproducts', 'modified', 'by'].indexOf(field) != -1)
        //       field = 'name';

        //     doTreeGridGetEditor
        //     (
        //       'divBuildTemplatesTG',
        //       editingId,
        //       field,
        //       function(ed)
        //       {
        //       }
        //     );
        //   }
        // );
      }
    }
  );
}

