function doDlgBuildTemplateDetails(template)
{
  var data = [];
  var editingIndex = null;
  var tb =
  [
    {
      text: 'New',
      iconCls: 'icon-add',
      handler: doNew
    },
    {
      text: 'Clear',
      iconCls: 'icon-clear',
      handler: doClear
    },
    {
      text: 'Edit',
      iconCls: 'icon-edit',
      handler: doEdit
    },
    {
      text: 'Cancel',
      iconCls: 'icon-cancel',
      handler: doCancel
    },
    {
      text: 'Save',
      iconCls: 'icon-save',
      handler: doSave
    },
    {
      text: 'Remove',
      iconCls: 'icon-remove',
      handler: doRemove
    },
    {
      text: 'Sync Subtemplates',
      iconCls: 'icon-sync',
      handler: doSync
    }
  ];

  function doReset()
  {
    $('#divBuildTemplateProductsG').datagrid('loadData', []);
  }

  function doNew()
  {
    doDlgProductSelect
    (
      viewingOrderClientId,
      false,
      false,
      function(productid, productname, qty, price)
      {
        primus.emit('newbuildtemplatedetail', {fguid: fguid, uuid: uuid, session: session, buildtemplateid: template.id, productid: productid, qty: qty, price: price, pdata: {type: 'refresh'}});
      }
    );
  }

  function doClear()
  {
    $('#divBuildTemplateProductsG').datagrid('clearSelections');
  }

  function doEdit()
  {
    doGridStartEdit
    (
      'divBuildTemplateProductsG',
      editingIndex,
      function(row, index)
      {
        editingIndex = index;

        doGridGetEditor
        (
          'divBuildTemplateProductsG',
          editingIndex,
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
    editingIndex = doGridCancelEdit('divBuildTemplateProductsG', editingIndex);
  }

  function doSave()
  {
    doGridEndEditGetRow
    (
      'divBuildTemplateProductsG',
      editingIndex,
      function(row)
      {
        var qty = row.qty;

        if (row.pertemplateqty == 1)
        {
          qty = _.toBigNum(qty).ceil().toFixed(0);

          $('#divBuildTemplateProductsG').datagrid('updateRow', {index: editingIndex, row: {qty: qty}});
        }

        primus.emit
        (
          'savebuildtemplatedetail',
          {
            fguid: fguid,
            uuid: uuid,
            session: session,
            buildtemplatedetailid: row.id,
            productid: row.productid,
            taxcodeid: row.taxcodeid,
            price: row.price,
            qty: qty,
            pertemplateqty: row.pertemplateqty,
            pdata: {type: 'refresh'}
          }
        );
      }
    );

    editingIndex = null;
  }

  function doRemove()
  {
    if (!doGridGetSelectedRowData
      (
        'divBuildTemplateProductsG',
        function(row)
        {
          doPromptOkCancel
          (
            'Remove ' + doGetStringFromIdInObjArray(cache_products, row.productid) + '?',
            function(result)
            {
              if (result)
                primus.emit('expirebuildtemplatedetail', {fguid: fguid, uuid: uuid, session: session, buildtemplatedetailid: row.id, pdata: {type: 'refresh'}});
            }
          );
        }
      ))
    {
      noty({text: 'Please select a product to remove', type: 'error', timeout: 4000});
    }
  }

  function doSync()
  {
    doPromptOkCancel
    (
      'This will replace all products of all sub-templates with the products from this template. Are you sure?',
      function(result)
      {
        if (result)
          primus.emit('syncbuildtemplate', {fguid: fguid, uuid: uuid, session: session, buildtemplateid: template.id, pdata: {type: 'refresh'}});
      }
    );
  }

  function doViewProduct()
  {
    doGridGetSelectedRowData
    (
      'divBuildTemplateProductsG',
      function(row)
      {
        doSelectInventoryTab(0);
        $('#divEvents').trigger('gotoproduct', {productcategoryid: row.productcategoryid, productid: row.productid});
        $('#dlgBuildTemplateDetails').dialog('close');
      }
    );
  }

  function doListProductsByTemplate(ev, args)
  {
    if (args.data.buildtemplateid == template.id)
      primus.emit('listproductsbybuildtemplate', {fguid: fguid, uuid: uuid, session: session, buildtemplateid: template.id, pdata: {type: 'refresh'}});
  }

  function doListTemplates(ev, args)
  {
    if (template.id)
    {
      primus.emit('listproductsbybuildtemplate', {fguid: fguid, uuid: uuid, session: session, buildtemplateid: template.id, pdata: {type: 'refresh', buildtemplatedetailid: args.data.buildtemplatedetailid}});
      // primus.emit('listbuildtemplates', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      primus.emit('listbuildtemplates_search', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
    }
  }

  function doLoadProducts(ev, args)
  {
    if (template.id)
    {
      data = [];

      args.data.rs.forEach
      (
        function(p)
        {
          data.push
          (
            {
              id: doNiceId(p.id),
              productid: doNiceId(p.productid),
              productcategoryid: doNiceId(p.productcategoryid),
              taxcodeid: doNiceId(p.taxcodeid),
              price: doNiceString(p.price),
              gst: doNiceString(p.gst),
              qty: doNiceString(p.qty),
              pertemplateqty: p.pertemplateqty,
              date: doNiceDateModifiedOrCreated(p.datemodified, p.datecreated),
              by: doNiceModifiedBy(p.datemodified, p.usermodified, p.usercreated)
            }
          );
        }
      );

      $('#divBuildTemplateProductsG').datagrid('loadData', data);

      doGridCalcTotals('divBuildTemplateProductsG', 'price', 'qty');

      if (!_.isUndefined(args.pdata.buildtemplatedetailid) && !_.isNull(args.pdata.buildtemplatedetailid))
        $('#divBuildTemplateProductsG').datagrid('selectRecord', args.pdata.buildtemplatedetailid);
    }
  }

  function doEventsHandler(ev, args)
  {
    if (args == 'new')
      doNew();
    else if (args == 'edit')
      doEdit();
    else if (args == 'remove')
      doRemove();
    else if (args == 'viewproduct')
      doViewProduct();
  }

  // Need to destroy/re-create this event since it depends on arguments that change each call...
  $('#divEvents').off('buildtemplatedetailcreated', doListProductsByTemplate).on('buildtemplatedetailcreated', doListProductsByTemplate);
  $('#divEvents').off('buildtemplatedetailsaved', doListProductsByTemplate).on('buildtemplatedetailsaved', doListProductsByTemplate);
  $('#divEvents').off('buildtemplatedetailexpired', doListProductsByTemplate).on('buildtemplatedetailexpired', doListProductsByTemplate);
  $('#divEvents').off('productupdated', doListProductsByTemplate).on('productupdated', doListProductsByTemplate);
  $('#divEvents').off('buildtemplatedetailupdated', doListTemplates).on('buildtemplatedetailupdated', doListTemplates);
  $('#divEvents').off('listproductsbybuildtemplate', doLoadProducts).on('listproductsbybuildtemplate', doLoadProducts);
  $('#divEvents').off('buildtemplatedetailspopup', doEventsHandler).on('buildtemplatedetailspopup', doEventsHandler);

  $('#dlgBuildTemplateDetails').dialog
  (
    {
      title: 'Build Template Details for ' + template.name,
      onClose: function()
      {
      },
      onOpen: function()
      {
        primus.emit('listproductsbybuildtemplate', {fguid: fguid, uuid: uuid, session: session, buildtemplateid: template.id, pdata: {type: 'refresh'}});

        $('#divBuildTemplateProductsG').datagrid
        (
          {
            idField: 'id',
            fitColumns: true,
            singleSelect: true,
            rownumbers: true,
            striped: true,
            toolbar: tb,
            showFooter: true,
            loader: function(param, success, error)
            {
              success({total: data.length, rows: data});
            },
            columns:
            [
              [
                {
                  title: 'Product',
                  field: 'productid',
                  width: 200,
                  align: 'left',
                  resizable: true,
                  editor:
                  {
                    type: 'combobox',
                    options:
                    {
                      valueField: 'id',
                      textField: 'code',
                      groupField: 'productcategoryname',
                      data: cache_products,
                      onSelect: function(record)
                      {
                        doGridChangeCellLabelValue('divBuildTemplateProductsG', editingIndex, 'price', record.costprice);
                      }
                    }
                  },
                  formatter: function(value, row)
                  {
                    return doGetCodeFromIdInObjArray(cache_products, value);
                  }
                },
                {
                  title: 'Tax Code',
                  field: 'taxcodeid',
                  width: 200,
                  align: 'left',
                  resizable: true,
                  editor:
                  {
                    type: 'combobox',
                    options:
                    {
                      valueField: 'id',
                      textField: 'name',
                      data: cache_taxcodes,
                      onSelect: function(record)
                      {
                      }
                    }
                  },
                  formatter: function(value, row)
                  {
                    return doGetStringFromIdInObjArray(cache_taxcodes, value);
                  }
                },
                {title: 'Price',      field: 'price',          width: 100, align: 'right',  resizable: true, editor: 'label', formatter: function(value, row, index) {if (_.isUndefined(row.id)) return value; return _.niceformatnumber(value);}},
                {title: 'Qty',        field: 'qty',            width: 100, align: 'right',  resizable: true, editor: {type: 'numberbox', options: {precision: 4}}, formatter: function(value, row, index) {if (_.isUndefined(row.id)) return value; return _.niceformatnumber(value);}},
                {title: 'Whole/Tmpl', field: 'pertemplateqty', width: 100, align: 'center', resizable: true, editor: {type: 'checkbox', options: {on: 1, off: 0}}, formatter: function(value, row) {return mapBoolToImage(value);}},
                {title: 'Modified',   field: 'date',           width: 150, align: 'right',  resizable: true},
                {title: 'By',         field: 'by',             width: 200, align: 'left',   resizable: true}
              ]
            ],
            onRowContextMenu: function(e, index, row)
            {
              doGridContextMenu('divBuildTemplateProductsG', 'divBuildTemplatesDetailsMenuPopup', e, index, row);
            },
            onDblClickCell: function(index, field, value)
            {
              doGridStartEdit
              (
                'divBuildTemplateProductsG',
                editingIndex,
                function(row, index)
                {
                  editingIndex = index;

                  if (['qty'].indexOf(field) != -1)
                    field = 'qty';

                  doGridGetEditor
                  (
                    'divBuildTemplateProductsG',
                    editingIndex,
                    field,
                    function(ed)
                    {
                    }
                  );
                }
              );
            }
          }
        );

        doReset();
      },
      buttons:
      [
        {
          text: 'Close',
          handler: function()
          {
            $('#dlgBuildTemplateDetails').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}

